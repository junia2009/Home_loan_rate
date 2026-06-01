/**
 * 銀行ごとのスクレイピング設定。
 * - url: 変動金利が記載されている公式ページ
 * - pattern: そのページのHTMLから変動金利(年率%)を取り出す正規表現（最初のキャプチャが数値）
 *
 * pattern は各ページの構造に合わせて調整する。構造変更で取得に失敗しても
 * scrape.ts 側で前回値を保持する（fail-safe）ため、サイト全体が壊れることはない。
 *
 * 注意: 実行前に各サイトの robots.txt / 利用規約でスクレイピング可否を必ず確認すること。
 */
import {
  SIMPLE_RATE_PATTERN,
  VARIABLE_RATE_NEAR_PATTERN,
} from '../lib/parse.js';

export interface Source {
  id: string;
  url: string;
  pattern: RegExp;
}

/**
 * data/banks.json の id と対応させる。
 * パターンは暫定（汎用フォールバック）。実データで検証しながら専用化していく。
 */
export const SOURCES: Source[] = [
  {
    id: 'sbi-net',
    url: 'https://www.netbk.co.jp/contents/lineup/home-loan/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'aujibun',
    url: 'https://www.jibunbank.co.jp/products/homeloan/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'paypay',
    url: 'https://www.paypay-bank.co.jp/mortgage/index.html',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'sony',
    url: 'https://moneykit.net/visitor/hl/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'rakuten',
    url: 'https://www.rakuten-bank.co.jp/home-loan/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'mufg',
    url: 'https://www.bk.mufg.jp/kariru/jutaku/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'mizuho',
    url: 'https://www.mizuhobank.co.jp/loan/jutaku/index.html',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'smbc',
    url: 'https://www.smbc.co.jp/kojin/jutaku/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'resona',
    url: 'https://www.resonabank.co.jp/kojin/jutaku/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'aeon',
    url: 'https://www.aeonbank.co.jp/housing_loan/',
    pattern: SIMPLE_RATE_PATTERN,
  },
  {
    id: 'smtb',
    url: 'https://www.smtb.jp/personal/loan/house/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
  {
    id: 'sbi-shinsei',
    url: 'https://www.sbishinsei.co.jp/loan/mortgage/',
    pattern: VARIABLE_RATE_NEAR_PATTERN,
  },
];
