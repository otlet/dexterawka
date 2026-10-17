import test from 'node:test';
import assert from 'node:assert/strict';
import { PLATFORMS, getStatuses, parseMoney, calculateEarnings, MAX_CENTS } from '../assets/docs/js/earnings-calculator-model.mjs';

const calculate = (overrides = {}) => calculateEarnings({ platformId: 'wolt', statusId: 'employed', incomeCents: 100000, ...overrides });

test('all six platforms are individual choices', () => {
  assert.deepEqual(PLATFORMS.map(p => p.id), ['glovo', 'uber-eats', 'wolt', 'pyszne', 'bolt-food', 'stuart']);
});

test('original standard and Stuart deductions are preserved for every available status', () => {
  const standard = { employed: 18720, 'young-employed': 9000, student: 0, 'unemployed-ppk': 29820, 'unemployed-no-ppk': 27820, 'young-unemployed-ppk': 21250, 'young-unemployed-no-ppk': 19250, 'b2b-ryczalt': 8500, 'b2b-skala': 12000 };
  const stuart = { employed: 18720, 'young-employed': 9000, student: 0, 'unemployed-ppk': 48610, 'unemployed-no-ppk': 45110, 'young-unemployed-ppk': 40040, 'b2b-ryczalt': 8500, 'b2b-skala': 12000 };
  for (const platform of PLATFORMS) {
    const expected = platform.id === 'stuart' ? stuart : standard;
    assert.deepEqual(getStatuses(platform.id).map(s => s.id), Object.keys(expected));
    for (const [statusId, taxCents] of Object.entries(expected)) {
      const result = calculate({ platformId: platform.id, statusId });
      assert.equal(result.taxCents, taxCents, `${platform.id} / ${statusId}`);
      assert.equal(result.appFeeCents, platform.id === 'glovo' ? 492 : 0);
      assert.equal(result.profitCents, 100000 - taxCents - (platform.id === 'glovo' ? 492 : 0));
    }
  }
});

test('Glovo takes exactly 4.92 PLN after the percentage deduction', () => {
  const result = calculate({ platformId: 'glovo', cashCents: 20000 });
  assert.equal(result.taxCents, 18720);
  assert.equal(result.appFeeCents, 492);
  assert.equal(result.profitCents, 80788);
  assert.equal(result.transferCents, 60788);
});

test('cash changes the transfer but never the combined earnings', () => {
  for (const platform of PLATFORMS) {
    for (const status of getStatuses(platform.id)) {
      const base = calculate({ platformId: platform.id, statusId: status.id });
      const withCash = calculate({ platformId: platform.id, statusId: status.id, cashCents: 30000 });
      assert.equal(withCash.profitCents, base.profitCents);
      assert.equal(withCash.transferCents, base.transferCents - 30000);
      assert.equal(withCash.transferCents + withCash.cashCents, withCash.profitCents);
    }
  }
});

test('B2B deducts only the requested tax and the explicit application fee', () => {
  for (const platform of PLATFORMS) {
    for (const [statusId, taxCents] of [['b2b-ryczalt', 8500], ['b2b-skala', 12000]]) {
      const result = calculate({ platformId: platform.id, statusId, cashCents: 10000 });
      assert.equal(result.b2b, true);
      assert.equal(result.taxCents, taxCents);
      assert.equal(result.transferCents, 90000 - taxCents - (platform.id === 'glovo' ? 492 : 0));
    }
  }
});

test('money input accepts Polish decimal and grouping separators without converting VAT', () => {
  for (const value of ['1234,56', '1234.56', '1 234,56', '1\u00a0234,56', '1\u202f234,56']) {
    assert.equal(parseMoney(value), 123456);
  }
  assert.equal(parseMoney('1,2'), 120);
  assert.equal(parseMoney('1230'), 123000);
  assert.equal(parseMoney(''), null);
  assert.equal(parseMoney('', { optional: true }), 0);
  for (const value of ['-10', '12,345', 'NaN', 'Infinity', '1e5', '12abc', '1.234,56', '1000000000']) {
    assert.equal(Number.isNaN(parseMoney(value)), true, value);
  }
});

test('zero revenue does not create an application charge; negative balances remain visible', () => {
  assert.equal(calculate({ platformId: 'glovo', incomeCents: 0 }).appFeeCents, 0);
  assert.equal(calculate({ incomeCents: 10000, cashCents: 10000 }).transferCents, -1872);
  assert.equal(calculate({ platformId: 'glovo', statusId: 'student', incomeCents: 100 }).profitCents, -392);
});

test('tax rounds once to the nearest grosz, including exact half-grosz cases', () => {
  assert.equal(calculate({ statusId: 'b2b-ryczalt', incomeCents: 100 }).taxCents, 9);
  assert.equal(calculate({ statusId: 'b2b-ryczalt', incomeCents: 99 }).taxCents, 8);
  assert.equal(calculate({ incomeCents: 10001 }).taxCents, 1872);
  const large = calculate({ incomeCents: MAX_CENTS });
  assert.equal(Number.isSafeInteger(large.taxCents), true);
  assert.equal(large.profitCents + large.taxCents, MAX_CENTS);
});

test('unknown platform/status and malformed amounts cannot produce a financial result', () => {
  assert.equal(calculate({ cashCents: undefined }).cashCents, 0);
  assert.throws(() => calculate({ platformId: 'unknown' }), RangeError);
  assert.throws(() => calculate({ statusId: 'unknown' }), RangeError);
  assert.throws(() => calculate({ platformId: 'stuart', statusId: 'young-unemployed-no-ppk' }), RangeError);
  for (const value of [-1, NaN, Infinity, 1.23, MAX_CENTS + 1, null, undefined]) {
    assert.throws(() => calculate({ incomeCents: value }), RangeError);
    if (value !== undefined) assert.throws(() => calculate({ cashCents: value }), RangeError);
  }
});
