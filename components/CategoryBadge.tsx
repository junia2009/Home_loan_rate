import { CATEGORY_LABELS, type BankCategory } from '@/lib/types';

const STYLES: Record<BankCategory, string> = {
  megabank: 'bg-indigo-100 text-indigo-700',
  net: 'bg-emerald-100 text-emerald-700',
  other: 'bg-amber-100 text-amber-700',
};

export function CategoryBadge({ category }: { category: BankCategory }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STYLES[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
