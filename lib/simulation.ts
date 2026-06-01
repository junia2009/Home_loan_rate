/**
 * 住宅ローン返済シミュレーション（元利均等返済）
 *
 * 月返済額 = 借入額 × r × (1+r)^n / ((1+r)^n - 1)
 *   r = 月利 = 年利 / 12
 *   n = 返済月数 = 返済年数 × 12
 */

export interface SimulationInput {
  /** 借入額（円） */
  principal: number;
  /** 年利（%）例: 0.345 */
  annualRatePercent: number;
  /** 返済年数 */
  years: number;
}

export interface SimulationResult {
  /** 月々の返済額（円, 四捨五入） */
  monthlyPayment: number;
  /** 総返済額（円, 四捨五入） */
  totalPayment: number;
  /** 利息総額（円, 四捨五入） */
  totalInterest: number;
}

/** 元利均等返済の計算 */
export function calcRepayment(input: SimulationInput): SimulationResult {
  const { principal, annualRatePercent, years } = input;
  const n = Math.round(years * 12);

  if (principal <= 0 || years <= 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  }

  const r = annualRatePercent / 100 / 12;

  let monthlyPayment: number;
  if (r === 0) {
    // 金利 0% の場合は元金を均等割り
    monthlyPayment = principal / n;
  } else {
    const pow = Math.pow(1 + r, n);
    monthlyPayment = (principal * r * pow) / (pow - 1);
  }

  const roundedMonthly = Math.round(monthlyPayment);
  const totalPayment = Math.round(roundedMonthly * n);
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment: roundedMonthly,
    totalPayment,
    totalInterest,
  };
}

/** 円を「○○万円」「○○億○○万円」表記に整形 */
export function formatYen(yen: number): string {
  if (yen === 0) return '0円';
  const oku = Math.floor(yen / 100_000_000);
  const man = Math.floor((yen % 100_000_000) / 10_000);
  const rest = yen % 10_000;
  const parts: string[] = [];
  if (oku > 0) parts.push(`${oku.toLocaleString()}億`);
  if (man > 0) parts.push(`${man.toLocaleString()}万`);
  if (rest > 0) parts.push(`${rest.toLocaleString()}`);
  return parts.join('') + '円';
}

/** 円をカンマ区切りの円表記に整形（例: 1,234,567円） */
export function formatYenPlain(yen: number): string {
  return `${Math.round(yen).toLocaleString()}円`;
}
