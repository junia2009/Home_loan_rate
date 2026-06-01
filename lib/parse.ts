/**
 * HTML から住宅ローン金利を抽出する純粋関数群。
 * ネットワークに依存しないため、フィクスチャ（保存済みHTML断片）でテスト可能。
 */

/** 変動金利として妥当とみなす範囲（年率 %）。明らかな誤抽出を弾く */
export const PLAUSIBLE_MIN = 0.1;
export const PLAUSIBLE_MAX = 3.0;

/** 全角数字・記号を半角へ正規化 */
export function normalizeNumeric(input: string): string {
  return input
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/．/g, '.')
    .replace(/％/g, '%')
    .replace(/[，、]/g, ',');
}

/**
 * 正規表現の最初のキャプチャグループを数値として取り出す。
 * - 全角を正規化してからマッチ
 * - 妥当範囲(PLAUSIBLE_MIN〜MAX)外は誤抽出とみなし null
 *
 * @param html  ページのHTML（またはテキスト）
 * @param pattern  1つ目のキャプチャに金利の数字を取る正規表現
 */
export function extractRate(html: string, pattern: RegExp): number | null {
  const text = normalizeNumeric(html);
  const m = text.match(pattern);
  if (!m || m[1] === undefined) return null;

  const value = Number.parseFloat(m[1]);
  if (!Number.isFinite(value)) return null;
  if (value < PLAUSIBLE_MIN || value > PLAUSIBLE_MAX) return null;

  // 小数第3位までに丸める（表示と一致させる）
  return Math.round(value * 1000) / 1000;
}

/**
 * 「変動」という語の近くにある最初の金利（年X.XX%）を拾う汎用パターン。
 * 銀行ごとに専用パターンを用意できない場合のフォールバック。
 */
export const VARIABLE_RATE_NEAR_PATTERN =
  /変動[^%]{0,80}?(\d\.\d{1,3})\s*%/;

/** 「年X.XX%」を素直に拾う汎用パターン */
export const SIMPLE_RATE_PATTERN = /年?\s*(\d\.\d{1,3})\s*%/;
