import type { Metadata } from 'next';
import { getBanks } from '@/lib/banks';
import { SimulationTable } from '@/components/SimulationTable';

export const metadata: Metadata = {
  title: '返済シミュレーション | 住宅ローン金利ナビ',
  description:
    '借入額と返済期間を入力して、各銀行の月々の返済額・総返済額を一括で比較できます。',
};

export default function SimulationPage() {
  const banks = getBanks();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">返済シミュレーション</h1>
        <p className="text-sm text-slate-600">
          借入額と返済期間を入力すると、全銀行の月々の返済額・総返済額を安い順で比較できます。
        </p>
      </section>

      <SimulationTable banks={banks} />
    </div>
  );
}
