/**
 * 住宅ローン金利スクレイパー（骨組み）
 * ------------------------------------------------------------------
 * 実運用では各銀行の公式サイトから変動金利を取得し data/banks.json を更新する。
 * 月次（金利改定が月初に行われるため）で Cron / GitHub Actions から実行する想定。
 *
 *   npm run scrape
 *
 * 重要・法的配慮:
 *  - 実行前に各サイトの robots.txt と利用規約でスクレイピング可否を必ず確認すること。
 *  - 取得頻度は月1回程度に抑え、適切な User-Agent と間隔を設定すること。
 *  - 構造変更で取得に失敗した場合は前回値を保持し、アラートを出すこと（fail-safe）。
 *
 * 現状はサンプルデータを使うため、ネットワーク取得は行わず
 * lastUpdated のみ更新する「ドライラン」実装にしてある。
 * 各銀行の取得ロジックは fetchers に銀行ごとに追加していく。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { Bank, BanksData } from '../lib/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../data/banks.json');

/** 1 銀行の金利取得結果 */
interface FetchResult {
  id: string;
  variableRate: number;
  campaignTitle?: string;
  campaignDeadline?: string | null;
}

/**
 * 銀行ごとの取得関数。
 * 実装例（疑似コード）:
 *
 *   async function fetchSbiNet(): Promise<FetchResult> {
 *     const html = await fetch('https://...').then((r) => r.text());
 *     const rate = parseRateFromHtml(html); // 正規表現 or DOM パーサ
 *     return { id: 'sbi-net', variableRate: rate };
 *   }
 *
 * JS 描画が必要なサイトは Playwright/Puppeteer を使う。
 * ここでは骨組みのため空配列。銀行を追加するごとにここへ登録する。
 */
const fetchers: Array<() => Promise<FetchResult>> = [
  // fetchSbiNet, fetchAujibun, ...
];

async function loadData(): Promise<BanksData> {
  const raw = await readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as BanksData;
}

async function saveData(data: BanksData): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/** 取得結果を既存データへマージ（失敗した銀行は前回値を保持） */
function mergeResults(banks: Bank[], results: FetchResult[], now: string): Bank[] {
  const byId = new Map(results.map((r) => [r.id, r]));
  return banks.map((bank) => {
    const r = byId.get(bank.id);
    if (!r) return bank; // 取得対象外 or 失敗 → 前回値を保持
    return {
      ...bank,
      variableRate: r.variableRate,
      campaign:
        r.campaignTitle !== undefined
          ? { title: r.campaignTitle, deadline: r.campaignDeadline ?? null }
          : bank.campaign,
      updatedAt: now,
    };
  });
}

async function main() {
  const now = new Date().toISOString();
  console.log(`[scrape] start ${now}`);

  const data = await loadData();

  const settled = await Promise.allSettled(fetchers.map((fn) => fn()));
  const results: FetchResult[] = [];
  for (const s of settled) {
    if (s.status === 'fulfilled') {
      results.push(s.value);
    } else {
      // fail-safe: ログを残して前回値を保持
      console.error('[scrape] fetch failed:', s.reason);
    }
  }

  if (fetchers.length === 0) {
    console.log('[scrape] フェッチャー未登録のためドライラン（lastUpdated のみ更新）');
  }

  const updated: BanksData = {
    ...data,
    banks: mergeResults(data.banks, results, now),
    lastUpdated: now,
  };

  await saveData(updated);
  console.log(
    `[scrape] done. ${results.length}/${fetchers.length} 件取得・${updated.banks.length} 行を保存`
  );
}

main().catch((err) => {
  console.error('[scrape] fatal:', err);
  process.exit(1);
});
