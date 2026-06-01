import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcRepayment, formatYen } from './simulation.js';

test('元利均等返済: 3000万円 / 0.345% / 35年', () => {
  const r = calcRepayment({
    principal: 30_000_000,
    annualRatePercent: 0.345,
    years: 35,
  });
  // 月返済額はおよそ 75,700 円前後（電卓検証値の許容誤差内）
  assert.ok(
    Math.abs(r.monthlyPayment - 75_700) < 200,
    `monthlyPayment was ${r.monthlyPayment}`
  );
  assert.equal(r.totalPayment, r.monthlyPayment * 35 * 12);
  assert.equal(r.totalInterest, r.totalPayment - 30_000_000);
});

test('金利0%は元金の均等割り', () => {
  const r = calcRepayment({
    principal: 36_000_000,
    annualRatePercent: 0,
    years: 30,
  });
  assert.equal(r.monthlyPayment, 100_000); // 3600万 / 360ヶ月
  assert.equal(r.totalInterest, 0);
});

test('不正な入力は 0 を返す', () => {
  assert.equal(calcRepayment({ principal: 0, annualRatePercent: 0.4, years: 35 }).monthlyPayment, 0);
  assert.equal(calcRepayment({ principal: 1000, annualRatePercent: 0.4, years: 0 }).monthlyPayment, 0);
});

test('formatYen: 億・万・円の桁区切り', () => {
  assert.equal(formatYen(123_456_789), '1億2,345万6,789円');
  assert.equal(formatYen(30_000_000), '3,000万円');
  assert.equal(formatYen(0), '0円');
});
