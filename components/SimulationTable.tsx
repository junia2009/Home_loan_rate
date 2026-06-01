'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Bank } from '@/lib/types';
import { calcRepayment, formatYen, formatYenPlain } from '@/lib/simulation';

export function SimulationTable({ banks }: { banks: Bank[] }) {
  const [manYen, setManYen] = useState(3000);
  const [years, setYears] = useState(35);

  const principal = manYen * 10_000;

  const rows = useMemo(() => {
    const computed = banks.map((bank) => ({
      bank,
      result: calcRepayment({
        principal,
        annualRatePercent: bank.variableRate,
        years,
      }),
    }));
    computed.sort((a, b) => a.result.monthlyPayment - b.result.monthlyPayment);
    return computed;
  }, [banks, principal, years]);

  const minMonthly = rows.length > 0 ? rows[0].result.monthlyPayment : 0;
  const minTotal = rows.length > 0 ? rows[0].result.totalPayment : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-6">
          <label className="text-sm text-slate-600">
            借入額（万円）
            <input
              type="number"
              min={100}
              step={100}
              value={manYen}
              onChange={(e) => setManYen(Math.max(0, Number(e.target.value)))}
              className="mt-1 block w-36 rounded border border-slate-300 px-3 py-2 text-base"
            />
          </label>
          <label className="text-sm text-slate-600">
            借入期間（年）
            <input
              type="number"
              min={1}
              max={35}
              value={years}
              onChange={(e) =>
                setYears(Math.min(35, Math.max(1, Number(e.target.value))))
              }
              className="mt-1 block w-36 rounded border border-slate-300 px-3 py-2 text-base"
            />
          </label>
          <div className="self-end text-sm text-slate-500">
            借入額 <strong>{formatYen(principal)}</strong> / {years}年・元利均等
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          ※概算です。保証料・事務手数料・団信費用などは含みません。実際の返済額は各銀行にご確認ください。
        </p>
      </div>

      <div className="overflow-x-auto table-scroll rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">銀行名</th>
              <th className="px-3 py-2 text-right">金利</th>
              <th className="px-3 py-2 text-right">月返済額</th>
              <th className="px-3 py-2 text-right">総返済額</th>
              <th className="px-3 py-2 text-right">最安との差（総額）</th>
              <th className="px-3 py-2 text-center">詳細</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ bank, result }, i) => {
              const totalDiff = result.totalPayment - minTotal;
              const isCheapest = result.monthlyPayment === minMonthly;
              return (
                <tr
                  key={bank.id}
                  className={`border-t border-slate-100 ${
                    isCheapest ? 'bg-emerald-50/60' : 'hover:bg-brand-50/40'
                  }`}
                >
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {bank.name}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-brand-700 whitespace-nowrap">
                    {bank.variableRate.toFixed(3)}%
                  </td>
                  <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                    {formatYenPlain(result.monthlyPayment)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap text-slate-600">
                    {formatYen(result.totalPayment)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {totalDiff === 0 ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        最安
                      </span>
                    ) : (
                      <span className="text-rose-600">
                        +{formatYen(totalDiff)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <Link
                      href={`/banks/${bank.id}`}
                      className="text-brand-600 hover:underline"
                    >
                      詳細 ›
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
