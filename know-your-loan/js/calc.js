/*
 * Know Your Loan: calculation module.
 * Works in the browser (window.KYLCalc) and in Node (require) so it can be tested.
 *
 * The borrower enters what the contract says. We find the rate that makes
 * "money received" equal to "payments made", which is the real cost of the loan.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KYLCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DAYS_PER_UNIT = { day: 1, week: 7, month: 365 / 12 };

  /* Turn text such as "1,000", "1.000,50" or "1 000.5" into a number.
     decimalHint is the decimal mark of the current language ('.' or ','). */
  function parseNumber(input, decimalHint) {
    if (typeof input === 'number') return input;
    if (input === null || input === undefined) return NaN;
    var s = String(input).replace(/[\s  ']/g, '');
    if (s === '') return NaN;
    if (/[^\d.,]/.test(s)) return NaN;
    var dots = (s.match(/\./g) || []).length;
    var commas = (s.match(/,/g) || []).length;
    var lastDot = s.lastIndexOf('.');
    var lastComma = s.lastIndexOf(',');

    if (dots && commas) {
      var decimalMark = lastDot > lastComma ? '.' : ',';
      var thousandsMark = decimalMark === '.' ? ',' : '.';
      s = s.split(thousandsMark).join('').replace(decimalMark, '.');
    } else if (commas) {
      var afterComma = s.length - lastComma - 1;
      if (commas > 1 || (afterComma === 3 && decimalHint !== ',')) s = s.split(',').join('');
      else s = s.replace(',', '.');
    } else if (dots) {
      var afterDot = s.length - lastDot - 1;
      if (dots > 1 || (afterDot === 3 && decimalHint === ',')) s = s.split('.').join('');
    }
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  /* Money received minus the present value of the payments. Rises as rate rises. */
  function gap(rate, received, payments) {
    var v = received;
    for (var i = 0; i < payments.length; i++) v -= payments[i] / Math.pow(1 + rate, i + 1);
    return v;
  }

  /* Rate per payment period that makes the loan balance out (internal rate of return). */
  function solveRate(received, payments) {
    var total = 0;
    for (var i = 0; i < payments.length; i++) total += payments[i];
    if (Math.abs(total - received) < 1e-9) return 0;

    var lo, hi;
    if (total > received) {
      lo = 0;
      hi = 1;
      while (gap(hi, received, payments) < 0 && hi < 1e9) hi *= 2;
    } else {
      hi = 0;
      lo = -0.999999;
    }
    for (var n = 0; n < 200; n++) {
      var mid = (lo + hi) / 2;
      if (gap(mid, received, payments) < 0) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /*
   * input: {
   *   amount, upfrontFees, count, installment, periodLength, periodUnit,
   *   laterFees, quotedMonthlyPct
   * }   (numbers; NaN or undefined means "not given")
   */
  function analyze(input) {
    var amount = input.amount;
    var count = input.count;
    var installment = input.installment;
    var periodLength = isNaN(input.periodLength) || input.periodLength === undefined ? NaN : input.periodLength;
    var unit = input.periodUnit || 'month';
    var upfront = isNaN(input.upfrontFees) || input.upfrontFees === undefined ? 0 : input.upfrontFees;
    var later = isNaN(input.laterFees) || input.laterFees === undefined ? 0 : input.laterFees;
    var quoted = input.quotedMonthlyPct;

    var missing = [];
    if (!isFinite(amount)) missing.push('amount');
    if (!isFinite(count)) missing.push('count');
    if (!isFinite(installment)) missing.push('installment');
    if (!isFinite(periodLength)) missing.push('periodLength');
    if (missing.length) return { status: 'incomplete', missing: missing };

    var errors = [];
    if (amount <= 0) errors.push('errAmount');
    if (upfront < 0 || upfront >= amount) errors.push('errFees');
    if (count < 1 || Math.floor(count) !== count) errors.push('errCount');
    if (installment <= 0) errors.push('errInstallment');
    if (periodLength <= 0) errors.push('errEvery');
    if (later < 0) errors.push('errLater');
    if (errors.length) return { status: 'invalid', errors: errors };

    var received = amount - upfront;
    var payments = [];
    for (var i = 0; i < count; i++) payments.push(installment);
    payments[count - 1] += later;

    var totalRepay = installment * count + later;
    var cost = totalRepay - received;
    var periodDays = periodLength * DAYS_PER_UNIT[unit];
    var periodsPerYear = 365 / periodDays;
    var rate = solveRate(received, payments);
    var apr = rate * periodsPerYear;
    var monthly = (rate * periodsPerYear) / 12;

    var out = {
      status: 'ok',
      received: received,
      totalRepay: totalRepay,
      cost: cost,
      paybackPer100: (totalRepay / received) * 100,
      costPer100: (cost / received) * 100,
      feeSharePct: (upfront / amount) * 100,
      ratePerPeriod: rate,
      periodsPerYear: periodsPerYear,
      apr: apr,
      monthlyRate: monthly,
      totalLength: count * periodLength,
      lengthUnit: unit,
      lessThanReceived: totalRepay < received
    };

    if (isFinite(quoted) && quoted > 0) {
      out.quotedMonthlyPct = quoted;
      out.realMonthlyPct = monthly * 100;
      var diff = (out.realMonthlyPct - quoted) / quoted;
      out.quotedGap = Math.abs(diff) < 0.1 ? 'match' : diff > 0 ? 'higher' : 'lower';
    }
    return out;
  }

  return { parseNumber: parseNumber, solveRate: solveRate, analyze: analyze, gap: gap };
});
