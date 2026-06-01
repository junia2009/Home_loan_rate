import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractRate,
  normalizeNumeric,
  VARIABLE_RATE_NEAR_PATTERN,
  SIMPLE_RATE_PATTERN,
} from './parse.js';

test('normalizeNumeric: 全角→半角', () => {
  assert.equal(normalizeNumeric('年０．３４５％'), '年0.345%');
});

test('extractRate: 半角の「年0.345%」を抽出', () => {
  const html = '<p>変動金利 年0.345% から</p>';
  assert.equal(extractRate(html, SIMPLE_RATE_PATTERN), 0.345);
});

test('extractRate: 全角表記でも抽出できる', () => {
  const html = '<span>変動金利　年０．２９８％</span>';
  assert.equal(extractRate(html, SIMPLE_RATE_PATTERN), 0.298);
});

test('extractRate: 「変動」近傍パターンで固定金利の数字を誤って拾わない', () => {
  const html = `
    <table>
      <tr><th>変動金利</th><td>年0.329%</td></tr>
      <tr><th>固定10年</th><td>年1.250%</td></tr>
    </table>`;
  assert.equal(extractRate(html, VARIABLE_RATE_NEAR_PATTERN), 0.329);
});

test('extractRate: 妥当範囲外(年5.0%)は null', () => {
  const html = '<p>遅延損害金 年14.0%</p>';
  assert.equal(extractRate(html, SIMPLE_RATE_PATTERN), null);
});

test('extractRate: マッチしなければ null', () => {
  assert.equal(extractRate('<p>金利は店頭表示</p>', SIMPLE_RATE_PATTERN), null);
});
