/** 銀行カテゴリ */
export type BankCategory = 'megabank' | 'net' | 'other';

export const CATEGORY_LABELS: Record<BankCategory, string> = {
  megabank: 'メガバンク',
  net: 'ネット銀行',
  other: 'その他主要銀行',
};

/** キャンペーン情報 */
export interface Campaign {
  title: string;
  /** ISO 日付。null は期限なし */
  deadline: string | null;
}

/** 審査基準・条件の目安 */
export interface Screening {
  /** 最低年収目安（万円）。null は明示なし */
  minIncome: number | null;
  /** 主な対象条件（雇用形態など）の箇条書き */
  conditions: string[];
}

/** 1 銀行の住宅ローン（変動金利）情報 */
export interface Bank {
  id: string;
  name: string;
  category: BankCategory;
  /** 変動金利（年率, %）。優遇適用後の最頻値 */
  variableRate: number;
  /** 金利の補足（適用条件など） */
  rateNote?: string;
  campaign: Campaign | null;
  screening: Screening;
  /** 住宅ローン申込・詳細ページの公式 URL */
  officialUrl: string;
  /** データ取得日時（ISO 8601） */
  updatedAt: string;
}

/** banks.json のルート構造 */
export interface BanksData {
  /** データ全体の最終更新日時（ISO 8601） */
  lastUpdated: string;
  /** データの出所メモ（サンプル / スクレイピング） */
  source: string;
  banks: Bank[];
}
