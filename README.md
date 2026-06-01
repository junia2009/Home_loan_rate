# 住宅ローン金利ナビ 🏠

各銀行の住宅ローン **変動金利** を一覧で比較し、借入額・期間を入れて月々の返済額を
その場でシミュレーションできる Web アプリ（PWA対応）です。

> 仕様書: [`docs/spec.md`](docs/spec.md)

## 主な機能

- **金利一覧・比較** — 変動金利を一覧表示。カテゴリ（メガバンク/ネット銀行/その他）で絞り込み、金利順・銀行名順で並び替え
- **返済シミュレーション** — 借入額・返済期間から、全銀行の月返済額・総返済額を安い順で比較（元利均等返済）
- **銀行詳細** — 審査条件・キャンペーン・公式サイトリンク・最終更新日時
- **PWA** — ホーム画面追加・オフラインキャッシュ対応
- **自動更新** — 月次でスクレイピングし `data/banks.json` を更新（GitHub Actions）

## 技術スタック

| レイヤー | 採用 |
|----------|------|
| フロント/SSG | Next.js 14 (App Router) + React 18 + TypeScript |
| スタイル | Tailwind CSS |
| PWA | manifest.json + 手書き Service Worker（`public/sw.js`） |
| データ取得 | `fetch` ベースのスクレイパー（`scripts/`）+ HTML抽出（`lib/parse.ts`） |
| テスト | `node:test`（`*.test.ts` を tsx で実行） |

## セットアップ

```bash
npm install
npm run dev      # http://localhost:3000
```

## スクリプト

```bash
npm run dev          # 開発サーバ
npm run build        # 本番ビルド（全ページ静的生成）
npm start            # 本番サーバ
npm test             # ユニットテスト（計算ロジック・金利抽出）
npm run scrape       # 金利を取得して data/banks.json を更新
npm run scrape -- --dry  # 取得するが保存しない（確認用）
```

## ディレクトリ構成

```
app/                  画面（App Router）
  page.tsx            トップ: 金利一覧 + 簡易シミュレーション
  simulation/         返済シミュレーション専用画面
  banks/[id]/         銀行詳細（全行を静的生成）
  disclaimer/         免責事項
components/            UI コンポーネント
lib/
  types.ts            型定義
  banks.ts            データアクセス（data/banks.json を読む）
  simulation.ts       元利均等返済の計算 + 金額フォーマット
  parse.ts            HTML から金利を抽出する純粋関数
  *.test.ts           ユニットテスト
scripts/
  scrape.ts           スクレイパー本体（robots.txt 尊重・fail-safe）
  sources.ts          銀行ごとの取得URL・抽出パターン
data/banks.json       金利データ（スクレイパーが更新）
public/               manifest.json / sw.js / アイコン
.github/workflows/    月次スクレイピングの自動実行
```

## データ更新の仕組み

1. `.github/workflows/scrape.yml` が月2回（1日・16日）`npm run scrape` を実行
2. `scripts/sources.ts` の各 URL から HTML を取得し、`lib/parse.ts` で変動金利を抽出
3. 取得に失敗した銀行は **前回値を保持**（fail-safe）。全滅時はジョブを失敗にして通知
4. 変更があれば `data/banks.json` を自動コミット

> **法的配慮**: スクレイパーは robots.txt を取得して `Disallow` を尊重し、識別可能な
> User-Agent と適切な間隔でアクセスします。各銀行の利用規約も併せてご確認ください。

## 注意

現在 `data/banks.json` は**サンプルデータ**です。本番運用では、各サイトのスクレイピング
可否を確認のうえ `scripts/sources.ts` の抽出パターンを実ページに合わせて調整してください。
本アプリの金利・条件は参考情報であり、最新・正確な情報は各銀行の公式サイトでご確認ください
（[免責事項](/disclaimer)）。
