import banksData from '@/data/banks.json';
import type { Bank, BanksData } from './types';

const data = banksData as BanksData;

/** 全銀行を変動金利の低い順で返す */
export function getBanks(): Bank[] {
  return [...data.banks].sort((a, b) => a.variableRate - b.variableRate);
}

/** id から 1 銀行を取得（見つからなければ undefined） */
export function getBankById(id: string): Bank | undefined {
  return data.banks.find((b) => b.id === id);
}

/** データ全体の最終更新日時 */
export function getLastUpdated(): string {
  return data.lastUpdated;
}

/** データの出所メモ */
export function getDataSource(): string {
  return data.source;
}

/** 変動金利の最安値 */
export function getLowestRate(): number {
  return Math.min(...data.banks.map((b) => b.variableRate));
}
