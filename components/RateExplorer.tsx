'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Bank, BankCategory } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/types';
import { calcRepayment, formatYenPlain } from '@/lib/simulation';
import { CategoryBadge } from './CategoryBadge';

type SortKey = 'rate' | 'name';
type CategoryFilter = 'all' | BankCategory;

interface Props {
  banks: Bank[];
}

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'megabank', label: CATEGORY_LABELS.megabank },
  { value: 'net', label: CATEGORY_LABELS.net },
  { value: 'other', label: CATEGORY_LABELS.other },
];

export function RateExplorer({ banks }: Props) {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('rate');
  // 簡易シミュレーション（任意入力）
  const [simEnabled, setSimEnabled] = useState(false);
  const [manYen, setManYen] = useState(3000); // 借入額（万円）
  const [years, setYears] = useState(35);

  const filtered = useMemo(() => {
    const list = banks.filter(
      (b) => category === 'all' || b.category === category
    );
    return list.sort((a, b) =>
      sortKey === 'rate'
        ? a.variableRate - b.variableRate
        : a.name.localeCompare(b.name, 'ja')
    );
  }, [banks, category, sortKey]);

  const principal = manYen * 10_000;

  // 表示中の銀行で最も安い月返済額（差額表示用）
  const minMonthly = useMemo(() => {
    if (!simEnabled || filtered.length === 0) return null;
    return Math.min(
      ...filtered.map(
        (b) =>
          calcRepayment({
            principal,
            annualRatePercent: b.variableRate,
            years,
          }).monthlyPayment
      )
    );
  }, [simEnabled, filtered, principal, years]);

  return (
    <div className="space-y-4">
      {/* コントロール */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600">カテゴリ:</span>
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value)}
              className={`rounded-full px-3 py-1 text-sm border transition ${
                category === opt.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600">並び替え:</span>
          <button
            onClick={() => setSortKey('rate')}
            className={`rounded px-3 py-1 text-sm border ${
              sortKey === 'rate'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            金利が低い順
          </button>
          <button
            onClick={() => setSortKey('name')}
            className={`rounded px-3 py-1 text-sm border ${
              sortKey === 'name'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            銀行名順
          </button>
        </div>

        {/* 簡易シミュレーション */}
        <div className="border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={simEnabled}
              onChange={(e) => setSimEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            返済額シミュレーションを表示する
          </label>
          {simEnabled && (
            <div className="mt-3 flex flex-wrap gap-4">
              <label className="text-sm text-slate-600">
                借入額（万円）
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={manYen}
                  onChange={(e) => setManYen(Math.max(0, Number(e.target.value)))}
                  className="mt-1 block w-32 rounded border border-slate-300 px-2 py-1"
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
                  className="mt-1 block w-32 rounded border border-slate-300 px-2 py-1"
                />
              </label>
              <p className="self-end text-xs text-slate-400">
                ※元利均等返済・概算（保証料・手数料は含みません）
              </p>
            </div>
          )}
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto table-scroll rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">銀行名</th>
              <th className="px-3 py-2 text-right">変動金利</th>
              {simEnabled && (
                <>
                  <th className="px-3 py-2 text-right">月返済額</th>
                  <th className="px-3 py-2 text-right">最安との差</th>
                </>
              )}
              <th className="px-3 py-2 text-left">キャンペーン</th>
              <th className="px-3 py-2 text-center">詳細</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((bank, i) => {
              const sim = simEnabled
                ? calcRepayment({
                    principal,
                    annualRatePercent: bank.variableRate,
                    years,
                  })
                : null;
              const diff =
                sim && minMonthly !== null
                  ? sim.monthlyPayment - minMonthly
                  : 0;
              return (
                <tr
                  key={bank.id}
                  className="border-t border-slate-100 hover:bg-brand-50/40"
                >
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">{bank.name}</div>
                    <CategoryBadge category={bank.category} />
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-brand-700 whitespace-nowrap">
                    {bank.variableRate.toFixed(3)}%
                  </td>
                  {simEnabled && sim && (
                    <>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {formatYenPlain(sim.monthlyPayment)}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {diff === 0 ? (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            最安
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            +{formatYenPlain(diff)}
                          </span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-3 py-2 max-w-[16rem]">
                    {bank.campaign ? (
                      <span className="text-xs text-slate-600">
                        {bank.campaign.title}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
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

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-8">
          該当する銀行がありません。
        </p>
      )}
    </div>
  );
}
