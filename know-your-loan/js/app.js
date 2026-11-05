/* Know Your Loan: interface. No network calls, no tracking. Saved offers stay in this browser. */
(function () {
  'use strict';

  var C = window.KYLCalc;
  var L = window.KYL_LOCALES;
  var LANGS = Object.keys(L);
  var SIGN_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'];
  var ASK_KEYS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
  var STORE_LANG = 'kyl.lang';
  var STORE_OFFERS = 'kyl.offers';

  var lang = 'en';
  var signsChecked = {};
  var errorTimer = null;
  var lastOk = null; // last good set of numbers, used by "Save"

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function t(key, vars) {
    var dict = L[lang] || L.en;
    var s = dict[key] !== undefined ? dict[key] : L.en[key];
    if (s === undefined) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
    return s;
  }

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'class') el.className = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (kid) { if (kid) el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid); });
    return el;
  }

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { return null; }
    return null;
  }

  /* ---------- number formatting ---------- */
  function decimalMark() { return (L[lang] && L[lang]._decimal) || '.'; }

  function fmtNum(n, maxDigits) {
    var d = maxDigits !== undefined ? maxDigits : (Math.abs(n) >= 1000 ? 0 : 2);
    try { return new Intl.NumberFormat(lang, { maximumFractionDigits: d }).format(n); }
    catch (e) { return String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d)); }
  }

  function currency() { return $('#money').value.trim(); }

  function money(n) {
    var s = fmtNum(n);
    var c = currency();
    return c ? s + ' ' + c : s;
  }

  function pct(fraction) {
    var v = fraction * 100;
    var digits = Math.abs(v) >= 100 ? 0 : 1;
    var space = lang === 'fr' ? ' ' : '';
    if (v > 100000) return fmtNum(100000, 0) + space + '%+';
    return fmtNum(v, digits) + space + '%';
  }

  function unitLabel(unit, n) {
    var cap = unit.charAt(0).toUpperCase() + unit.slice(1);
    var form = 'Other';
    try { form = new Intl.PluralRules(lang).select(n) === 'one' ? 'One' : 'Other'; } catch (e) { /* keep Other */ }
    return t('unit' + cap + form);
  }

  /* ---------- reading the form ---------- */
  function num(id) { return C.parseNumber($('#' + id).value, decimalMark()); }

  function readInputs() {
    return {
      amount: num('amount'),
      upfrontFees: $('#fees').value.trim() === '' ? 0 : num('fees'),
      count: num('count'),
      installment: num('installment'),
      periodLength: num('periodLength'),
      periodUnit: $('#periodUnit').value,
      laterFees: $('#later').value.trim() === '' ? 0 : num('later'),
      quotedMonthlyPct: $('#quoted').value.trim() === '' ? NaN : num('quoted')
    };
  }

  /* ---------- static text and schedule labels ---------- */
  function applyStatic() {
    document.documentElement.lang = lang;
    document.title = t('appName');
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-placeholder]').forEach(function (el) {
      var txt = t(el.getAttribute('data-i18n-placeholder'));
      el.setAttribute('placeholder', txt);
      el.setAttribute('aria-label', txt);
    });
    updateSchedule();
    renderSigns();
    renderSheet();
    render();
    renderSaved();
  }

  function updateSchedule() {
    var single = num('count') === 1;
    $('#schedule-label').textContent = t(single ? 'fAfter' : 'fEvery');
    $('#schedule-hint').textContent = t(single ? 'hAfter' : 'hEvery');
    $('#schedule-prefix').textContent = t(single ? 'after' : 'every');
    var n = num('periodLength');
    $$('#periodUnit option').forEach(function (opt) { opt.textContent = unitLabel(opt.value, isFinite(n) ? n : 2); });
  }

  /* ---------- result ---------- */
  function row(label, value, cls) {
    return h('div', cls ? { class: cls } : null, [h('dt', { text: label }), h('dd', { text: value })]);
  }

  function render() {
    var box = $('#result');
    var inp = readInputs();
    var res = C.analyze(inp);
    clearTimeout(errorTimer);
    box.textContent = '';
    lastOk = null;
    $('#save-area').hidden = true;

    box.appendChild(h('h3', { text: t('resultTitle') }));

    if (res.status === 'incomplete') {
      box.appendChild(h('p', { class: 'empty', text: t('emptyResult') }));
      return;
    }
    if (res.status === 'invalid') {
      // Wait a moment so we do not flash errors while someone is still typing.
      errorTimer = setTimeout(function () {
        box.textContent = '';
        box.appendChild(h('h3', { text: t('resultTitle') }));
        var ul = h('ul', { class: 'errors' }, res.errors.map(function (k) { return h('li', { text: t(k) }); }));
        box.appendChild(ul);
      }, 700);
      box.appendChild(h('p', { class: 'empty', text: t('emptyResult') }));
      return;
    }

    lastOk = inp;
    $('#save-area').hidden = false;

    // Sentence
    var sentence = h('p', { class: 'big' });
    var parts = t('sentence', { a: '\u0001', b: '\u0002' }).split(/(\u0001|\u0002)/);
    parts.forEach(function (p) {
      if (p === '\u0001') sentence.appendChild(document.createTextNode(money(100)));
      else if (p === '\u0002') sentence.appendChild(h('em', { text: money(res.paybackPer100) }));
      else sentence.appendChild(document.createTextNode(p));
    });
    box.appendChild(sentence);

    // Bars
    var max = Math.max(res.received, res.totalRepay);
    var baseShare = Math.min(res.received, res.totalRepay) / res.totalRepay * 100;
    var bars = h('div', { class: 'bars', role: 'img', 'aria-label': t('barReceive') + ' ' + money(res.received) + '. ' + t('barPayback') + ' ' + money(res.totalRepay) + '.' }, [
      h('div', { class: 'bar-label' }, [h('span', { text: t('barReceive') }), h('span', { text: money(res.received) })]),
      h('div', { class: 'bar', style: 'width:' + (res.received / max * 100) + '%' }, [h('span', { class: 'base', style: 'width:100%' })]),
      h('div', { class: 'bar-label' }, [h('span', { text: t('barPayback') }), h('span', { text: money(res.totalRepay) })]),
      h('div', { class: 'bar', style: 'width:' + (res.totalRepay / max * 100) + '%' }, [
        h('span', { class: 'base', style: 'width:' + baseShare + '%' }),
        res.cost > 0 ? h('span', { class: 'extra', style: 'width:' + (100 - baseShare) + '%' }) : null
      ])
    ]);
    box.appendChild(bars);

    if (res.lessThanReceived) {
      box.appendChild(h('p', { class: 'warn', text: t('lessWarn') }));
    }

    // Rows
    var dl = h('dl', { class: 'rows' });
    dl.appendChild(row(t('rowReceive'), money(res.received)));
    dl.appendChild(row(t('rowPayback'), money(res.totalRepay)));
    if (!res.lessThanReceived) dl.appendChild(row(t('rowCost'), money(res.cost), 'key'));
    if (inp.upfrontFees > 0) dl.appendChild(row(t('rowFees'), money(inp.upfrontFees) + ' (' + pct(res.feeSharePct / 100) + ')'));
    dl.appendChild(row(t('rowLength'), fmtNum(res.totalLength) + ' ' + unitLabel(res.lengthUnit, res.totalLength)));
    if (!res.lessThanReceived) {
      dl.appendChild(row(t('rowMonthly'), pct(res.monthlyRate)));
      dl.appendChild(row(t('rowApr'), pct(res.apr)));
    }
    box.appendChild(dl);

    if (!res.lessThanReceived) {
      box.appendChild(h('p', { class: 'note', text: t('aprNote') }));
      if (res.quotedGap) {
        var key = res.quotedGap === 'match' ? 'quotedMatch' : (res.quotedGap === 'higher' ? 'quotedHigher' : 'quotedLower');
        var msg = t(key, { q: pct(res.quotedMonthlyPct / 100), r: pct(res.monthlyRate) });
        box.appendChild(h('p', { class: 'compare' + (res.quotedGap === 'higher' ? ' bad' : ''), text: msg }));
      }
    }
  }

  /* ---------- saved offers ---------- */
  function loadOffers() {
    try { return JSON.parse(store(STORE_OFFERS) || '[]'); } catch (e) { return []; }
  }
  function saveOffers(list) { store(STORE_OFFERS, JSON.stringify(list)); }

  function renderSaved() {
    var list = loadOffers();
    var sec = $('#saved');
    var ul = $('#saved-list');
    ul.textContent = '';
    sec.hidden = list.length === 0;
    var scored = list.map(function (o) { return { o: o, r: C.analyze(o.inputs) }; }).filter(function (x) { return x.r.status === 'ok'; });
    scored.sort(function (a, b) { return a.r.apr - b.r.apr; });
    scored.forEach(function (x) {
      var o = x.o, r = x.r;
      var li = h('li', null, [
        h('div', null, [
          h('div', { class: 'name', text: o.name }),
          h('div', { class: 'meta', text: t('per100', { x: fmtNum(r.costPer100) }) + ' · ' + t('yearly', { x: pct(r.apr) }) })
        ]),
        h('div', { class: 'actions' }, [
          h('button', { type: 'button', 'data-open': o.id, text: t('openBtn') }),
          h('button', { type: 'button', 'data-del': o.id, text: t('deleteBtn') })
        ])
      ]);
      ul.appendChild(li);
    });
  }

  function onSave() {
    if (!lastOk) return;
    var list = loadOffers();
    var name = $('#save-name').value.trim() || ('#' + (list.length + 1));
    list.push({ id: String(Date.now()), name: name, inputs: lastOk, money: currency() });
    saveOffers(list);
    $('#save-name').value = '';
    renderSaved();
  }

  function setField(id, value) {
    var mark = decimalMark();
    $('#' + id).value = (typeof value === 'number' && isFinite(value)) ? String(value).replace('.', mark) : '';
  }

  function onSavedClick(e) {
    var openId = e.target.getAttribute('data-open');
    var delId = e.target.getAttribute('data-del');
    var list = loadOffers();
    if (delId) {
      saveOffers(list.filter(function (o) { return o.id !== delId; }));
      renderSaved();
    } else if (openId) {
      var o = list.filter(function (x) { return x.id === openId; })[0];
      if (!o) return;
      var i = o.inputs;
      setField('amount', i.amount);
      setField('fees', i.upfrontFees || '');
      setField('count', i.count);
      setField('installment', i.installment);
      setField('periodLength', i.periodLength);
      $('#periodUnit').value = i.periodUnit;
      setField('later', i.laterFees || '');
      setField('quoted', i.quotedMonthlyPct);
      $('#money').value = o.money || '';
      updateSchedule();
      render();
      window.scrollTo(0, 0);
    }
  }

  /* ---------- warning signs ---------- */
  function renderSigns() {
    var ul = $('#signs-list');
    ul.textContent = '';
    SIGN_KEYS.forEach(function (k) {
      var cb = h('input', { type: 'checkbox', id: 'sign-' + k });
      cb.checked = !!signsChecked[k];
      cb.addEventListener('change', function () { signsChecked[k] = cb.checked; updateSignsSummary(); });
      ul.appendChild(h('li', null, [h('label', null, [cb, h('span', { text: t(k) })])]));
    });
    updateSignsSummary();
  }

  function updateSignsSummary() {
    var n = SIGN_KEYS.filter(function (k) { return signsChecked[k]; }).length;
    $('#signs-summary').textContent = n === 0 ? t('signsNone') : t('signsSome', { n: n });
    $('#signs-advice').textContent = n === 0 ? '' : t('signsAdvice');
  }

  /* ---------- printable worksheet ---------- */
  function renderSheet() {
    var s = $('#sheet');
    s.textContent = '';
    s.appendChild(h('h2', { id: 'sheet-title', text: t('sheetTitle') }));
    s.appendChild(h('p', { text: t('sheetLead') }));
    s.appendChild(h('div', { class: 'meta-row' }, [h('div', { text: t('sheetLender') }), h('div', { text: t('sheetDate') })]));

    var table = h('table');
    ['sA', 'sB', 'sC', 'sD', 'sE', 'sF', 'sG', 'sH', 'sI'].forEach(function (k) {
      table.appendChild(h('tr', null, [h('td', { text: t(k) }), h('td', { class: 'fill' })]));
    });
    s.appendChild(table);

    s.appendChild(h('h3', { text: t('sheetCompareTitle') }));
    s.appendChild(h('p', { text: t('sheetCompare') }));
    var ct = h('table', { class: 'compare-table' });
    ct.appendChild(h('tr', null, [h('th', { text: t('sheetOffer') + ' 1' }), h('th', { text: t('sheetOffer') + ' 2' }), h('th', { text: t('sheetOffer') + ' 3' })]));
    ct.appendChild(h('tr', null, [h('td'), h('td'), h('td')]));
    s.appendChild(ct);

    s.appendChild(h('h3', { text: t('sheetAskTitle') }));
    var ask = h('ul', { class: 'ask' });
    ASK_KEYS.forEach(function (k) { ask.appendChild(h('li', null, [h('span', { class: 'box' }), h('span', { text: t(k) })])); });
    s.appendChild(ask);

    var page2 = h('div', { class: 'page2' });
    page2.appendChild(h('h3', { text: t('sheetSignsTitle') }));
    var signs = h('ul', { class: 'ask' });
    SIGN_KEYS.forEach(function (k) { signs.appendChild(h('li', null, [h('span', { class: 'box' }), h('span', { text: t(k) })])); });
    page2.appendChild(signs);
    page2.appendChild(h('p', { text: t('signsAdvice') }));
    s.appendChild(page2);

    s.appendChild(h('footer', { text: t('sheetFooter') }));
  }

  /* ---------- tabs ---------- */
  function showTab() {
    var name = (location.hash || '#calc').replace('#', '');
    if (['calc', 'signs', 'sheet'].indexOf(name) < 0) name = 'calc';
    ['calc', 'signs', 'sheet'].forEach(function (n) {
      $('#tab-' + n).hidden = n !== name;
      var a = $('#nav-' + n);
      if (n === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  /* ---------- start ---------- */
  function init() {
    var saved = store(STORE_LANG);
    var guess = (navigator.language || 'en').slice(0, 2).toLowerCase();
    lang = LANGS.indexOf(saved) >= 0 ? saved : (LANGS.indexOf(guess) >= 0 ? guess : 'en');

    var sel = $('#lang');
    LANGS.forEach(function (code) { sel.appendChild(h('option', { value: code, text: L[code]._name })); });
    sel.value = lang;
    sel.addEventListener('change', function () { lang = sel.value; store(STORE_LANG, lang); applyStatic(); });

    $$('#loan-form input, #loan-form select').forEach(function (el) {
      el.addEventListener('input', function () { updateSchedule(); render(); });
      el.addEventListener('change', function () { updateSchedule(); render(); });
    });
    $('#loan-form').addEventListener('submit', function (e) { e.preventDefault(); });
    $('#save-btn').addEventListener('click', onSave);
    $('#saved-list').addEventListener('click', onSavedClick);
    $('#signs-clear').addEventListener('click', function () { signsChecked = {}; renderSigns(); });
    $('#print-btn').addEventListener('click', function () { window.print(); });
    window.addEventListener('hashchange', showTab);

    applyStatic();
    showTab();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* works without it */ }); });
    }
  }

  init();
})();
