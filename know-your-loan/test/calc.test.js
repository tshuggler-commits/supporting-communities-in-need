const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/calc.js');

const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('parseNumber handles common typing styles', () => {
  assert.equal(C.parseNumber('1000', '.'), 1000);
  assert.equal(C.parseNumber('1,000', '.'), 1000);
  assert.equal(C.parseNumber('1,000.50', '.'), 1000.5);
  assert.equal(C.parseNumber('1.000,50', ','), 1000.5);
  assert.equal(C.parseNumber('1.000', ','), 1000);
  assert.equal(C.parseNumber('1,5', ','), 1.5);
  assert.equal(C.parseNumber('1 000', '.'), 1000);
  assert.equal(C.parseNumber('2.5', '.'), 2.5);
  assert.ok(Number.isNaN(C.parseNumber('abc', '.')));
  assert.ok(Number.isNaN(C.parseNumber('', '.')));
});

test('single payment: borrow 100, repay 130 after one month', () => {
  const r = C.analyze({ amount: 100, upfrontFees: 0, count: 1, installment: 130, periodLength: 1, periodUnit: 'month' });
  assert.equal(r.status, 'ok');
  near(r.received, 100);
  near(r.cost, 30);
  near(r.costPer100, 30);
  near(r.paybackPer100, 130);
  near(r.ratePerPeriod, 0.3);
  near(r.apr, 3.6);
  near(r.monthlyRate, 0.3);
});

test('fee taken first raises the real rate', () => {
  // Contract says 1000, 100 is kept back, borrower repays 1100 after a month.
  const r = C.analyze({ amount: 1000, upfrontFees: 100, count: 1, installment: 1100, periodLength: 1, periodUnit: 'month' });
  near(r.received, 900);
  near(r.cost, 200);
  near(r.costPer100, (200 / 900) * 100, 1e-9);
  near(r.ratePerPeriod, 200 / 900, 1e-9);
  near(r.feeSharePct, 10);
});

test('standard amortizing loan matches the textbook payment', () => {
  // 1000 at 1% per month over 12 months has a payment of 88.8487887...
  const pmt = (1000 * 0.01) / (1 - Math.pow(1.01, -12));
  const r = C.analyze({ amount: 1000, upfrontFees: 0, count: 12, installment: pmt, periodLength: 1, periodUnit: 'month' });
  near(r.ratePerPeriod, 0.01, 1e-9);
  near(r.apr, 0.12, 1e-8);
});

test('flat rate quote hides a much higher real rate', () => {
  // "Flat 10% per month" on 1000 for 6 months: interest 600, payment (1000+600)/6.
  const r = C.analyze({
    amount: 1000, upfrontFees: 0, count: 6, installment: 1600 / 6,
    periodLength: 1, periodUnit: 'month', quotedMonthlyPct: 10
  });
  // Checked separately with an annuity formula: the true monthly rate is 15.34%, not 10%.
  near(r.monthlyRate, 0.153408, 1e-5);
  assert.equal(r.quotedGap, 'higher');
  // The rate must balance the cash flows.
  const payments = Array(6).fill(1600 / 6);
  near(C.gap(r.ratePerPeriod, 1000, payments), 0, 1e-6);
});

test('weekly payments convert to a yearly rate using 52 weeks', () => {
  const r = C.analyze({ amount: 1000, upfrontFees: 0, count: 10, installment: 130, periodLength: 1, periodUnit: 'week' });
  near(r.periodsPerYear, 365 / 7, 1e-9);
  near(r.apr, r.ratePerPeriod * (365 / 7), 1e-12);
  near(r.totalRepay, 1300);
});

test('later fees are added to the final payment', () => {
  const r = C.analyze({ amount: 1000, upfrontFees: 0, count: 2, installment: 550, periodLength: 1, periodUnit: 'month', laterFees: 50 });
  near(r.totalRepay, 1150);
  near(C.gap(r.ratePerPeriod, 1000, [550, 600]), 0, 1e-6);
});

test('zero cost loan has zero rate', () => {
  const r = C.analyze({ amount: 1000, upfrontFees: 0, count: 4, installment: 250, periodLength: 1, periodUnit: 'month' });
  near(r.ratePerPeriod, 0, 1e-9);
  near(r.cost, 0);
});

test('paying back less than received is flagged', () => {
  const r = C.analyze({ amount: 1000, upfrontFees: 0, count: 1, installment: 900, periodLength: 1, periodUnit: 'month' });
  assert.equal(r.status, 'ok');
  assert.equal(r.lessThanReceived, true);
  assert.ok(r.ratePerPeriod < 0);
});

test('incomplete and invalid input', () => {
  assert.equal(C.analyze({ amount: NaN, count: 1, installment: 10, periodLength: 1 }).status, 'incomplete');
  const bad = C.analyze({ amount: 100, upfrontFees: 100, count: 1.5, installment: 10, periodLength: 1, periodUnit: 'month' });
  assert.equal(bad.status, 'invalid');
  assert.ok(bad.errors.includes('errFees'));
  assert.ok(bad.errors.includes('errCount'));
});

test('very short loans give large but finite yearly numbers', () => {
  const r = C.analyze({ amount: 100, upfrontFees: 0, count: 1, installment: 110, periodLength: 7, periodUnit: 'day' });
  assert.ok(Number.isFinite(r.apr));
  near(r.apr, 0.1 * (365 / 7), 1e-9);
});
