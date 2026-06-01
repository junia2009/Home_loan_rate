/**
 * 住宅ローン金利スクレイパー
 * ------------------------------------------------------------------
 * 各銀行の公式ページから変動金利を取得し data/banks.json を更新する。
 * 月次（金利改定が月初に行われるため）で GitHub Actions / Cron から実行する想定。
 *
 *   npm run scrape            # 全銀行を取得して保存
 *   npm run scrape -- --dry   # 取得するが保存しない（確認用）
 *
 * 重要・法的配慮:
 *  - robots.txt を取得し Disallow を尊重する（下記 isAllowedByRobots）。
 *  - 取得間隔を空け、識別可能な User-Agent を送る。
 *  - 構造変更等で取得に失敗した銀行は前回値を保持する（fail-safe）。
 *
 * ネットワーク制限のある環境（許可リスト等）では取得が 403 になることがある。
 * その場合でも前回値を保持して安全に終了する。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { Bank, BanksData } from '../lib/types.js';
import { extractRate } from '../lib/parse.js';
import { SOURCES, type Source } from './sources.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../data/banks.json');

// HTTP ヘッダ値は ASCII(Latin-1) のみ。日本語を含めると fetch が例外になる。
const USER_AGENT =
  'KinriNaviBot/0.1 (+https://github.com/junia2009/home_loan_rate)';
const FETCH_TIMEOUT_MS = 15_000;
const POLITE_DELAY_MS = 2_000; // 各リクエスト間の待機

interface FetchResult {
  id: string;
  variableRate: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ja' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * robots.txt を取得し、対象 URL の取得が許可されているか簡易判定する。
 * （User-Agent: * の Disallow のみを見るミニマル実装）
 * 取得失敗時は「不明」として true を返すのではなく、安全側に倒して false を返す。
 */
async function isAllowedByRobots(targetUrl: string): Promise<boolean> {
  try {
    const u = new URL(targetUrl);
    const robotsUrl = `${u.origin}/robots.txt`;
    const body = await fetchText(robotsUrl);

    const disallows: string[] = [];
    let appliesToAll = false;
    for (const rawLine of body.split('\n')) {
      const line = rawLine.replace(/#.*$/, '').trim();
      if (!line) continue;
      const [keyRaw, ...rest] = line.split(':');
      const key = keyRaw.toLowerCase().trim();
      const val = rest.join(':').trim();
      if (key === 'user-agent') {
        appliesToAll = val === '*';
      } else if (key === 'disallow' && appliesToAll && val) {
        disallows.push(val);
      }
    }
    return !disallows.some((d) => u.pathname.startsWith(d));
  } catch (err) {
    console.warn(
      `[scrape] robots.txt 取得失敗のためスキップ: ${targetUrl} (${(err as Error).message})`
    );
    return false; // 取れない＝叩かない（安全側）
  }
}

async function fetchOne(source: Source): Promise<FetchResult> {
  const allowed = await isAllowedByRobots(source.url);
  if (!allowed) {
    throw new Error('robots.txt により不許可またはrobots取得不可');
  }
  await sleep(POLITE_DELAY_MS);
  const html = await fetchText(source.url);
  const rate = extractRate(html, source.pattern);
  if (rate === null) {
    throw new Error('金利を抽出できませんでした（パターン要調整）');
  }
  return { id: source.id, variableRate: rate };
}

async function loadData(): Promise<BanksData> {
  return JSON.parse(await readFile(DATA_PATH, 'utf-8')) as BanksData;
}

async function saveData(data: BanksData): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/** 取得結果を既存データへマージ（失敗した銀行は前回値を保持） */
function mergeResults(banks: Bank[], results: FetchResult[], now: string): Bank[] {
  const byId = new Map(results.map((r) => [r.id, r]));
  return banks.map((bank) => {
    const r = byId.get(bank.id);
    if (!r) return bank;
    if (r.variableRate === bank.variableRate) return bank; // 変化なし
    return { ...bank, variableRate: r.variableRate, updatedAt: now };
  });
}

async function main() {
  const dryRun = process.argv.includes('--dry');
  const now = new Date().toISOString();
  console.log(`[scrape] start ${now}${dryRun ? ' (dry-run)' : ''}`);

  const data = await loadData();

  const results: FetchResult[] = [];
  let ok = 0;
  let failed = 0;
  for (const source of SOURCES) {
    try {
      const r = await fetchOne(source);
      results.push(r);
      ok++;
      console.log(`[scrape] ✓ ${source.id}: ${r.variableRate}%`);
    } catch (err) {
      failed++;
      console.warn(`[scrape] ✗ ${source.id}: ${(err as Error).message}（前回値を保持）`);
    }
  }

  const updated: BanksData = {
    ...data,
    banks: mergeResults(data.banks, results, now),
    lastUpdated: ok > 0 ? now : data.lastUpdated,
    source:
      ok > 0
        ? `公式サイトより取得（${new Date(now).toLocaleDateString('ja-JP')}時点・成功${ok}/失敗${failed}）`
        : data.source,
  };

  if (dryRun) {
    console.log('[scrape] dry-run のため保存しません');
  } else {
    await saveData(updated);
  }
  console.log(`[scrape] done. 成功 ${ok} / 失敗 ${failed} / 全 ${SOURCES.length}`);

  // 全滅した場合は CI で気づけるよう非ゼロ終了
  if (ok === 0) {
    console.error('[scrape] 1件も取得できませんでした（ネットワーク制限/構造変更の可能性）');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[scrape] fatal:', err);
  process.exit(1);
});
