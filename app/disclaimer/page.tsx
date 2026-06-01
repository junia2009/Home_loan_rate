import type { Metadata } from 'next';
import Link from 'next/link';
import { getDataSource, getLastUpdated } from '@/lib/banks';

export const metadata: Metadata = {
  title: '免責事項 | 住宅ローン金利ナビ',
  description: '住宅ローン金利ナビの免責事項とデータの取り扱いについて。',
};

export default function DisclaimerPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">免責事項</h1>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <p>
          本サイト「住宅ローン金利ナビ」（以下、本サイト）は、各銀行の住宅ローン金利を
          比較しやすく表示することを目的とした情報提供サービスです。
        </p>

        <h2 className="font-bold text-slate-800 pt-2">1. 情報の正確性について</h2>
        <p>
          本サイトに掲載している金利・キャンペーン・審査条件等は、各銀行の公式サイト等から
          取得した参考情報であり、その正確性・最新性・完全性を保証するものではありません。
          表示と実際の条件が異なる場合があります。最新かつ正確な情報は、必ず各銀行の
          公式サイトおよび窓口でご確認ください。
        </p>

        <h2 className="font-bold text-slate-800 pt-2">2. 金利・適用条件について</h2>
        <p>
          表示金利は優遇適用後の代表的な金利であり、実際に適用される金利は、申込者の
          年収・勤務形態・借入額・自己資金・審査結果等により異なります。本サイトの
          シミュレーション結果は概算であり、保証料・事務手数料・団体信用生命保険料等は
          含まれていません。
        </p>

        <h2 className="font-bold text-slate-800 pt-2">3. 損害の免責</h2>
        <p>
          本サイトの情報を利用したことにより生じたいかなる損害についても、当サイトは
          一切の責任を負いません。最終的な金融商品の選択・契約のご判断は、利用者ご自身の
          責任において行ってください。
        </p>

        <h2 className="font-bold text-slate-800 pt-2">4. 個人情報の取り扱い</h2>
        <p>
          シミュレーションで入力された借入額・期間等の数値は、お使いの端末（ブラウザ）内で
          計算され、サーバーへ送信・保存されることはありません。
        </p>

        <div className="rounded-lg bg-slate-100 p-4 text-xs text-slate-500 mt-4">
          <p>データの出所: {getDataSource()}</p>
          <p>最終更新: {new Date(getLastUpdated()).toLocaleString('ja-JP')}</p>
        </div>
      </section>

      <Link href="/" className="inline-block text-sm text-brand-600 hover:underline">
        ‹ 金利一覧へ戻る
      </Link>
    </div>
  );
}
