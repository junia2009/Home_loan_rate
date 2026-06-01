import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBankById, getBanks } from '@/lib/banks';
import { CategoryBadge } from '@/components/CategoryBadge';

interface Props {
  params: { id: string };
}

/** 静的生成: 全銀行ページを事前ビルド */
export function generateStaticParams() {
  return getBanks().map((b) => ({ id: b.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const bank = getBankById(params.id);
  if (!bank) return { title: '銀行が見つかりません | 住宅ローン金利ナビ' };
  return {
    title: `${bank.name}の住宅ローン変動金利 | 住宅ローン金利ナビ`,
    description: `${bank.name}の変動金利は年${bank.variableRate.toFixed(
      3
    )}%。審査条件・キャンペーン・公式サイトを確認できます。`,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BankDetailPage({ params }: Props) {
  const bank = getBankById(params.id);
  if (!bank) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ‹ 金利一覧へ戻る
        </Link>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-800">{bank.name}</h1>
          <CategoryBadge category={bank.category} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-slate-500">変動金利</span>
          <span className="text-3xl font-bold text-brand-700">
            {bank.variableRate.toFixed(3)}
            <span className="text-lg">%</span>
          </span>
          <span className="text-sm text-slate-400">（年率）</span>
        </div>
        {bank.rateNote && (
          <p className="text-xs text-slate-500">{bank.rateNote}</p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 審査条件 */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-slate-700 mb-3">審査基準・条件の目安</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-24 text-slate-500 shrink-0">最低年収目安</dt>
              <dd className="text-slate-800">
                {bank.screening.minIncome !== null
                  ? `${bank.screening.minIncome}万円〜`
                  : '明示なし'}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 text-slate-500 shrink-0">主な条件</dt>
              <dd className="text-slate-800">
                <ul className="list-disc pl-4 space-y-1">
                  {bank.screening.conditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </section>

        {/* キャンペーン */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-slate-700 mb-3">キャンペーン・特典</h2>
          {bank.campaign ? (
            <div className="text-sm space-y-1">
              <p className="text-slate-800">{bank.campaign.title}</p>
              {bank.campaign.deadline && (
                <p className="text-xs text-rose-600">
                  期限: {bank.campaign.deadline}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              現在掲載中のキャンペーンはありません。
            </p>
          )}
        </section>
      </div>

      {/* 公式サイト */}
      <section className="rounded-lg border border-brand-200 bg-brand-50 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-slate-800">
            最新の金利・詳細は公式サイトでご確認ください
          </p>
          <p className="text-xs text-slate-500">
            最終更新: {formatDate(bank.updatedAt)}
          </p>
        </div>
        <a
          href={bank.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-white font-medium hover:bg-brand-700 transition"
        >
          {bank.name}の公式サイトへ ↗
        </a>
      </section>

      <p className="text-xs text-slate-400">
        ※ 表示している金利・条件は参考情報（サンプルを含む）です。実際の金利・審査条件・適用可否は申込内容により異なります。
      </p>
    </div>
  );
}
