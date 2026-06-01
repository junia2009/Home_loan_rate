import { getBanks, getLastUpdated, getLowestRate } from '@/lib/banks';
import { RateExplorer } from '@/components/RateExplorer';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomePage() {
  const banks = getBanks();
  const lastUpdated = getLastUpdated();
  const lowest = getLowestRate();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">
          住宅ローン 変動金利 比較
        </h1>
        <p className="text-sm text-slate-600">
          各銀行の住宅ローン変動金利を一覧で比較できます。借入額・期間を入力すると、
          月々の返済額もその場で試算できます。
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
            最安 変動金利{' '}
            <strong className="text-base">{lowest.toFixed(3)}%</strong>
          </span>
          <span className="text-slate-400">
            最終更新: {formatDate(lastUpdated)}
          </span>
        </div>
      </section>

      <RateExplorer banks={banks} />
    </div>
  );
}
