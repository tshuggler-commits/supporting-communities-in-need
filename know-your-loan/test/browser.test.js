// Browser test for Know Your Loan. It opens the app in Chromium and checks:
//   - the page loading
//   - the math, with its mistakes and warnings
//   - saved offers
//   - the warning signs
//   - the printed worksheet
//   - Spanish and French
//   - offline use
//   - sideways scrolling on narrow phones
//   - privacy
//
// Usage, from the repo root: node know-your-loan/test/browser.test.js [output-dir] [app-url]
//   With no app-url it serves this repo itself, laid out the way GitHub Pages serves it.
//   For the live site, pass https://tshuggler-commits.github.io/supporting-communities-in-need/know-your-loan/
//   Screenshots and PDFs go in output-dir, a folder in the system's temporary folder by default.
// Needs Playwright with Chromium: npm ci, then npx playwright install chromium.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PREFIX = '/supporting-communities-in-need/';
let BASE = process.argv[3];
let ORIGIN;
const SHOTS = process.argv[2] || path.join(os.tmpdir(), 'kyl-browser-test');
fs.mkdirSync(SHOTS, { recursive: true });
const phone = devices['Pixel 5'];

// A small server for this repo, with the types a browser needs to run the app and its offline code.
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};
// It refuses any name part that starts with a dot, so .git and the like stay private.
function serve() {
  const server = http.createServer((req, res) => {
    const notFound = () => { res.writeHead(404); res.end(); };
    try {
      const url = decodeURIComponent(new URL(req.url, 'http://local').pathname);
      if (!url.startsWith(PREFIX) || url.includes('\0')) return notFound();
      if (url.split('/').some((part) => part.startsWith('.'))) return notFound();
      let file = path.join(ROOT, url.slice(PREFIX.length));
      if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return notFound();
      if (url.endsWith('/')) file = path.join(file, 'index.html');
      fs.readFile(file, (err, data) => {
        if (err) return notFound();
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    } catch (e) {
      notFound();
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// A stand-in for the rest of the internet. Chromium sends ordinary web traffic for another site here,
// whether a page or the offline code sends it. Beacons sent as a page closes come here too. This
// refuses each request and writes it down. Only the app's own address skips it. Some routes go
// around it, such as WebRTC. CLAUDE.md's backlog lists the ones known.
function outsideWorld() {
  const seen = [];
  const server = http.createServer((req, res) => { seen.push(req.method + ' ' + req.url); res.writeHead(403); res.end(); });
  server.on('connect', (req, socket) => {
    socket.on('error', () => {});
    seen.push('CONNECT ' + req.url);
    socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, seen })));
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok });
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail !== undefined ? '   -> ' + detail : ''));
}

const bags = {};
const bagFor = (label) => bags[label] || (bags[label] = { console: [], errors: [], bad: [], failed: [], external: [] });
const outside = (u) => !u.startsWith(ORIGIN) && !u.startsWith('data:') && !u.startsWith('blob:');
// Links that open a connection early, such as preconnect, contact a site before any request does.
// This runs in every page before the app's own code. It reports each link that points away, when it
// is added or when its rel or href changes later. Links inside other elements count too.
const HINT = 'KYL-OUTSIDE-LINK ';
function watchLinks(hint) {
  const log = console.log.bind(console);
  const report = (l) => {
    if (/(^|\s)(preconnect|dns-prefetch|prefetch|preload|modulepreload|prerender)(\s|$)/i.test(l.rel || '') &&
      l.href && new URL(l.href, location.href).origin !== location.origin) log(hint + l.rel + ' ' + l.href);
  };
  const scan = (n) => {
    if (n.nodeName === 'LINK') report(n);
    if (n.querySelectorAll) n.querySelectorAll('link').forEach(report);
  };
  new MutationObserver((changes) => changes.forEach((c) => {
    if (c.type === 'attributes') scan(c.target);
    c.addedNodes.forEach(scan);
  })).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['rel', 'href'] });
}
// Requests are watched on the whole browser context, so requests from the offline code count too.
const watchedContexts = new WeakSet();
function watchContext(context) {
  if (watchedContexts.has(context)) return;
  watchedContexts.add(context);
  context.addInitScript(watchLinks, HINT);
  context.on('request', (r) => {
    if (outside(r.url())) bagFor('outside').external.push(r.url() + (r.serviceWorker() ? ' (from the offline code)' : ''));
  });
}
function watch(page, label) {
  const bag = bagFor(label);
  watchContext(page.context());
  page.on('console', (m) => {
    if (m.type() === 'error') bag.console.push(m.text());
    if (m.text().startsWith(HINT)) bagFor('outside').external.push(m.text().slice(HINT.length));
  });
  page.on('pageerror', (e) => bag.errors.push(String(e)));
  page.on('response', (r) => { if (r.status() >= 400) bag.bad.push(r.status() + ' ' + r.url()); });
  page.on('requestfailed', (r) => bag.failed.push(r.url() + ' ' + (r.failure() && r.failure().errorText)));
  page.on('websocket', (ws) => { if (outside(ws.url().replace(/^ws/, 'http'))) bag.external.push(ws.url()); });
  return page;
}

async function open(context, label, hash) {
  const page = watch(await context.newPage(), label);
  await page.goto(BASE + (hash || ''), { waitUntil: 'load' });
  return page;
}

async function fillLoan(page, v) {
  for (const id of ['amount', 'fees', 'count', 'installment', 'periodLength']) {
    if (v[id] !== undefined) await page.fill('#' + id, String(v[id]));
  }
  if (v.unit) await page.selectOption('#periodUnit', v.unit);
  if (v.quoted !== undefined || v.later !== undefined || v.money !== undefined) {
    if (!(await page.$eval('details.more', (d) => d.open))) await page.click('details.more summary');
    if (v.later !== undefined) await page.fill('#later', String(v.later));
    if (v.quoted !== undefined) await page.fill('#quoted', String(v.quoted));
    if (v.money !== undefined) await page.fill('#money', String(v.money));
  }
}

async function rowMap(page) {
  const pairs = await page.$$eval('#result dl.rows > div', (ds) =>
    ds.map((d) => [d.querySelector('dt').textContent, d.querySelector('dd').textContent]));
  return Object.fromEntries(pairs);
}
const sentence = (page) => page.textContent('#result p.big').catch(() => null);
const T = (page, lang, key) => page.evaluate(([l, k]) => window.KYL_LOCALES[l][k], [lang, key]);
// Every box is measured against the screen's real width. On a phone the browser widens the page to
// fit wide content, so comparing the page's width with itself always passes.
const pastEdge = (page, width) => page.evaluate((w) => [...document.querySelectorAll('body *')]
  .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > w + 0.5 || r.left < -0.5); })
  .map((e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ' to ' + Math.round(e.getBoundingClientRect().right) + 'px'), width);
const sideways = async (page, width) => (await pastEdge(page, width)).slice(0, 4).join(' | ') || 'none';
const norm = (s) => (s || '').replace(/[  ]/g, ' ');

// The whole run stops after 5 minutes and fails. Some waits inside a page have no limit of their own.
const RUN_LIMIT_MIN = 5;
setTimeout(() => {
  console.log(`\nFAIL  The test ran past ${RUN_LIMIT_MIN} minutes and was stopped. Something it waited for never came.`);
  process.exit(3);
}, RUN_LIMIT_MIN * 60 * 1000);

(async () => {
  let server = null;
  if (!BASE) {
    server = await serve();
    BASE = `http://127.0.0.1:${server.address().port}${PREFIX}know-your-loan/`;
  }
  ORIGIN = new URL(BASE).origin + '/';
  console.log('Testing ' + BASE);
  const outside = await outsideWorld();
  const app = new URL(BASE);
  const appHost = app.hostname + ':' + (app.port || (app.protocol === 'https:' ? '443' : '80'));
  // <-loopback> sends loopback addresses through the stand-in as well, apart from the app's own.
  const browser = await chromium.launch({
    proxy: { server: 'http://127.0.0.1:' + outside.server.address().port, bypass: '<-loopback>,' + appHost },
  });

  // ---------- 1. Page loads (English, phone) ----------
  console.log('\n== 1. Page loads ==');
  const ctxEn = await browser.newContext({ ...phone, locale: 'en-US' });
  let p = await open(ctxEn, 'english');
  // Widths depend on the font, so say which one this run measured with.
  const cdp = await ctxEn.newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const doc = await cdp.send('DOM.getDocument');
  const h2 = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'h2' });
  const fonts = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId: h2.nodeId })).fonts.map((f) => f.familyName);
  console.log('      Font measured with: ' + (fonts.join(', ') || 'unknown'));
  await cdp.detach();
  check('Page title is "Know Your Loan"', (await p.title()) === 'Know Your Loan', await p.title());
  check('Heading shows', (await p.textContent('h1')) === 'Know Your Loan');
  const langs = await p.$$eval('#lang option', (os) => os.map((o) => o.value + ':' + o.textContent));
  check('Language menu offers all three languages', langs.join(',') === 'en:English,es:Español,fr:Français', langs.join(', '));
  const locGaps = await p.evaluate(() => {
    const L = window.KYL_LOCALES, en = Object.keys(L.en), out = {};
    for (const l of Object.keys(L)) {
      const missing = en.filter((k) => !(k in L[l]));
      const empty = Object.keys(L[l]).filter((k) => typeof L[l][k] === 'string' && L[l][k].trim() === '');
      out[l] = { keys: Object.keys(L[l]).length, missing, empty };
    }
    return out;
  });
  for (const l of ['es', 'fr']) {
    check(`Every English text has a translation in ${l.toUpperCase()}`, locGaps[l].missing.length === 0 && locGaps[l].empty.length === 0,
      `${locGaps[l].keys} keys; missing: ${locGaps[l].missing.join(',') || 'none'}; empty: ${locGaps[l].empty.join(',') || 'none'}`);
  }
  check('Empty form shows the "fill in" message', (await p.textContent('#result p.empty')) === (await T(p, 'en', 'emptyResult')));
  const sideEn = await sideways(p, phone.viewport.width);
  check('No sideways scrolling on a phone', sideEn === 'none', sideEn);
  const manifestOk = await p.evaluate(async () => {
    const m = await (await fetch('manifest.webmanifest')).json();
    const icons = await Promise.all(m.icons.map(async (i) => (await fetch(i.src)).status));
    return { name: m.name, start: m.start_url, icons };
  });
  check('Install file (manifest) reads and its icons load', manifestOk.icons.every((s) => s === 200), JSON.stringify(manifestOk));
  await p.close();

  // ---------- 2. The math ----------
  console.log('\n== 2. The math ==');
  p = await open(ctxEn, 'english');
  await fillLoan(p, { amount: 100, count: 1, installment: 130, periodLength: 1, unit: 'month' });
  let r = await rowMap(p);
  check('Borrow 100, repay 130 in a month: sentence', (await sentence(p)) === 'For every 100 you receive, you pay back 130.', await sentence(p));
  check('...cost is 30', r['The loan costs you'] === '30', r['The loan costs you']);
  check('...real cost per month is 30%', r['Real cost per month'] === '30%', r['Real cost per month']);
  check('...yearly rate is 360%', r['Yearly rate (APR)'] === '360%', r['Yearly rate (APR)']);
  check('...label switches to "after" for one payment', /after/i.test(await p.textContent('#schedule-prefix')), await p.textContent('#schedule-prefix'));
  await p.close();

  p = await open(ctxEn, 'english');
  await fillLoan(p, { amount: 1000, fees: 100, count: 1, installment: 1100, periodLength: 1, unit: 'month' });
  r = await rowMap(p);
  check('Fee of 100 taken first: you receive 900', r['You receive in hand'] === '900', r['You receive in hand']);
  check('...cost is 200, not 100', r['The loan costs you'] === '200', r['The loan costs you']);
  check('...real monthly cost is 22.2%', r['Real cost per month'] === '22.2%', r['Real cost per month']);
  await p.close();

  p = await open(ctxEn, 'english');
  await fillLoan(p, { amount: 1000, count: 6, installment: 266.67, periodLength: 1, unit: 'month', quoted: 10, money: 'USD' });
  const cmp = await p.textContent('#result p.compare.bad').catch(() => null);
  check('"Flat 10% a month" is shown as about 15.3% a month, in red', cmp === 'The lender said 10% per month. The real cost is about 15.3% per month.', cmp);
  check('Currency label shows on amounts', (await sentence(p)).includes('USD'), await sentence(p));
  await p.screenshot({ path: path.join(SHOTS, '1-phone-english-result.png'), fullPage: true });
  await p.close();

  p = await open(ctxEn, 'english');
  await fillLoan(p, { amount: 1000, count: 10, installment: 130, periodLength: 1, unit: 'week' });
  r = await rowMap(p);
  check('Weekly payments: 10 x 130 = 1,300 paid back', r['You pay back in total'] === '1,300', r['You pay back in total']);
  await p.close();

  // ---------- 3. Mistakes and warnings ----------
  console.log('\n== 3. Mistakes and warnings ==');
  p = await open(ctxEn, 'english');
  await fillLoan(p, { amount: 100, count: 1.5, installment: 10, periodLength: 1 });
  await p.waitForSelector('#result ul.errors li', { timeout: 5000 }).catch(() => {});
  let errs = await p.$$eval('#result ul.errors li', (ls) => ls.map((l) => l.textContent));
  check('1.5 payments gives a clear message', errs.includes(await T(p, 'en', 'errCount')), errs.join(' | '));
  await p.fill('#count', '1');
  await p.fill('#fees', '150');
  const feesMsg = await T(p, 'en', 'errFees');
  await p.waitForFunction((m) => [...document.querySelectorAll('#result ul.errors li')].some((l) => l.textContent === m),
    feesMsg, { timeout: 5000 }).catch(() => {});
  errs = await p.$$eval('#result ul.errors li', (ls) => ls.map((l) => l.textContent));
  check('Fees bigger than the loan gives a clear message', errs.includes(await T(p, 'en', 'errFees')), errs.join(' | '));
  await p.close();

  p = await open(ctxEn, 'english');
  await fillLoan(p, { amount: 1000, count: 1, installment: 900, periodLength: 1 });
  check('Paying back less than received shows a warning', (await p.textContent('#result p.warn').catch(() => null)) === (await T(p, 'en', 'lessWarn')));
  await p.close();

  // ---------- 4. Saved offers ----------
  console.log('\n== 4. Saved offers ==');
  p = await open(ctxEn, 'english');
  await fillLoan(p, { amount: 100, count: 1, installment: 130, periodLength: 1 });
  await p.fill('#save-name', 'Lender A');
  await p.click('#save-btn');
  await p.fill('#amount', '1000'); await p.fill('#fees', '100'); await p.fill('#installment', '1100');
  await p.fill('#save-name', 'Lender B');
  await p.click('#save-btn');
  let names = await p.$$eval('#saved-list .name', (ns) => ns.map((n) => n.textContent));
  check('Two offers saved, cheapest listed first', names.join(',') === 'Lender B,Lender A', names.join(', '));
  await p.reload({ waitUntil: 'load' });
  names = await p.$$eval('#saved-list .name', (ns) => ns.map((n) => n.textContent));
  check('Saved offers are still there after reopening', names.length === 2, names.join(', '));
  await p.click('#saved-list li:nth-child(1) button[data-open]');
  check('"Open" puts the saved numbers back in the form', (await p.inputValue('#amount')) === '1000' && (await p.inputValue('#fees')) === '100');
  await p.click('#saved-list li:nth-child(2) button[data-del]');
  names = await p.$$eval('#saved-list .name', (ns) => ns.map((n) => n.textContent));
  check('"Delete" removes an offer', names.join(',') === 'Lender B', names.join(', '));
  await p.close();

  // ---------- 5. Warning signs tab ----------
  console.log('\n== 5. Warning signs ==');
  p = await open(ctxEn, 'english', '#signs');
  check('Warning signs tab opens', await p.isVisible('#tab-signs') && !(await p.isVisible('#tab-calc')));
  const boxes = await p.$$('#signs-list input[type=checkbox]');
  check('10 warning signs listed', boxes.length === 10, boxes.length);
  await boxes[0].check(); await boxes[3].check();
  check('Ticking 2 signs updates the count', (await p.textContent('#signs-summary')) === '2 signs marked.', await p.textContent('#signs-summary'));
  check('...and shows advice', (await p.textContent('#signs-advice')).length > 0);
  await p.click('#signs-clear');
  check('"Clear" unticks them', (await p.textContent('#signs-summary')) === (await T(p, 'en', 'signsNone')));
  await p.click('#nav-calc');
  // The tab switches on the next tick (about 30 ms), so wait for it instead of checking at once.
  const backToCalc = await p.waitForSelector('#tab-calc', { state: 'visible', timeout: 3000 }).then(() => true, () => false);
  check('Bottom menu goes back to the calculator', backToCalc);
  await p.close();

  // ---------- 6. Paper worksheet ----------
  console.log('\n== 6. Paper worksheet ==');
  p = await open(ctxEn, 'english', '#sheet');
  check('Worksheet tab opens with a print button', await p.isVisible('#print-btn'));
  const fillRows = await p.$$eval('#sheet table:not(.compare-table) tr', (t) => t.length);
  check('Worksheet has 9 lines to fill in', fillRows === 9, fillRows);
  await p.screenshot({ path: path.join(SHOTS, '3-phone-worksheet.png'), fullPage: true });
  await p.close();
  // Spanish and French run longer than English, so every language is printed on both paper sizes.
  // Letter is standard in Nicaragua and much of the Americas; A4 in most other places.
  for (const lang of ['en', 'es', 'fr']) {
    for (const format of ['A4', 'Letter']) {
      const ctxPrint = await browser.newContext({ locale: 'en-US' });
      p = await open(ctxPrint, 'print', '#calc'); // print from the calculator tab on purpose
      await p.selectOption('#lang', lang);
      // Each line of the worksheet must be on the page in the chosen language. It is read from the
      // element that holds its words, and that element must have height and count as visible. Tick
      // boxes and writing spaces are counted the same way. It also looks for text and pictures
      // outside the worksheet. This reads the page at the width inside the print margins, not the PDF.
      // Reviews found many ways past it, and the CLAUDE.md backlog lists them. The print event fires first, as it
      // does when a phone prints.
      await p.setViewportSize({ width: Math.floor(((format === 'A4' ? 210 : 215.9) - 28) * 96 / 25.4), height: 1000 });
      await p.emulateMedia({ media: 'print' });
      await p.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
      const printed = await p.evaluate((l) => {
        const seen = (e) => !!e && e.getBoundingClientRect().height > 0 && e.checkVisibility({ visibilityProperty: true, opacityProperty: true });
        const shown = (sel) => seen(document.querySelector(sel));
        const L = window.KYL_LOCALES[l], EN = window.KYL_LOCALES.en;
        const keys = ['sheetTitle', 'sheetLead', 'sheetLender', 'sheetDate', 'sheetCompareTitle', 'sheetCompare', 'sheetAskTitle',
          'sheetSignsTitle', 'signsAdvice', 'sheetFooter'];
        for (const c of 'ABCDEFGHI') keys.push('s' + c);
        for (let i = 1; i <= 8; i++) keys.push('a' + i);
        for (let i = 1; i <= 10; i++) keys.push('s' + i);
        const parts = [...document.querySelectorAll('#sheet *')];
        // The words an element holds itself, leaving out those of the elements inside it.
        const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
        const has = (text) => parts.some((e) => seen(e) && own(e) === text.trim());
        const want = keys.map((k) => L[k]).concat([1, 2, 3].map((n) => L.sheetOffer + ' ' + n));
        const english = keys.map((k) => [EN[k], L[k]]).concat([1, 2, 3].map((n) => [EN.sheetOffer + ' ' + n, L.sheetOffer + ' ' + n]));
        const sheet = document.querySelector('#sheet');
        // Visible elements inside body and outside the worksheet that hold text of their own, or are
        // img or svg elements.
        const extra = [...document.body.querySelectorAll('*')].filter((e) => seen(e) && !sheet.contains(e) &&
          (e.tagName === 'IMG' || e.tagName.toLowerCase() === 'svg' || [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())))
          .map((e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''));
        return { sheet: seen(sheet), page2: shown('#sheet .page2'), extra,
          blanks: [...sheet.querySelectorAll('td.fill, .compare-table td')].filter(seen).length,
          boxes: [...sheet.querySelectorAll('.box')].filter(seen).length,
          missing: want.filter((s) => !has(s)),
          english: l === 'en' ? [] : english.filter(([e, x]) => e !== x && parts.some((p) => p.textContent.trim() === e.trim())).map(([e]) => e) };
      }, lang);
      // 9 writing cells and 3 comparison cells. A tick box beside each of the 8 questions and 10 signs.
      const alone = printed.sheet && printed.page2 && printed.extra.length === 0 && printed.blanks === 12 && printed.boxes === 18 &&
        printed.missing.length === 0 && printed.english.length === 0;
      const file = path.join(SHOTS, `worksheet-${lang}-${format}.pdf`);
      await p.pdf({ path: file, format, printBackground: true });
      const pages = (fs.readFileSync(file, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      check(`Worksheet prints on 2 pages, and the print layout holds its text in its language: ${lang.toUpperCase()} on ${format}`,
        pages === 2 && alone, pages + ' pages, ' + JSON.stringify(printed));
      await ctxPrint.close();
    }
  }

  // ---------- 7. Spanish ----------
  console.log('\n== 7. Spanish ==');
  const ctxEs = await browser.newContext({ ...phone, locale: 'en-US' });
  p = await open(ctxEs, 'spanish');
  await p.selectOption('#lang', 'es');
  check('Switching to Spanish changes the heading', (await p.textContent('h1')) === (await T(p, 'es', 'appName')), await p.textContent('h1'));
  check('...and the page language', (await p.getAttribute('html', 'lang')) === 'es');
  const leftEnglish = await p.$$eval('[data-i18n]', (els) => els.filter((e) => e.textContent === window.KYL_LOCALES.en[e.getAttribute('data-i18n')] && window.KYL_LOCALES.en[e.getAttribute('data-i18n')] !== window.KYL_LOCALES.es[e.getAttribute('data-i18n')]).map((e) => e.getAttribute('data-i18n')));
  check('...with no English left on screen', leftEnglish.length === 0, leftEnglish.join(',') || 'none');
  await fillLoan(p, { amount: '1.000', count: 1, installment: '1.100,50', periodLength: 1 });
  r = await rowMap(p);
  const esSentence = norm(await sentence(p));
  check('Spanish number style: "1.000" and "1.100,50" read as 1000 and 1100.50', esSentence.includes('110,05'), esSentence);
  check('...cost shown as 100,5', Object.values(r).includes('100,5'), JSON.stringify(r));
  await p.screenshot({ path: path.join(SHOTS, '2-phone-spanish-result.png'), fullPage: true });
  await p.reload({ waitUntil: 'load' });
  check('Spanish is remembered after reopening', (await p.inputValue('#lang')) === 'es');
  await p.close();
  const ctxEsPhone = await browser.newContext({ ...phone, locale: 'es-ES' });
  p = await open(ctxEsPhone, 'spanish');
  check('A phone set to Spanish opens in Spanish by itself', (await p.inputValue('#lang')) === 'es');
  await p.close();

  // ---------- 8. French ----------
  console.log('\n== 8. French ==');
  const ctxFr = await browser.newContext({ ...phone, locale: 'en-US' });
  p = await open(ctxFr, 'french');
  await p.selectOption('#lang', 'fr');
  check('Switching to French changes the heading', (await p.textContent('h1')) === (await T(p, 'fr', 'appName')), await p.textContent('h1'));
  await fillLoan(p, { amount: 100, count: 1, installment: 130, periodLength: 1 });
  r = await rowMap(p);
  const frVals = Object.values(r).map(norm);
  check('French result shows "30 %" a month and "360 %" a year', frVals.includes('30 %') && frVals.includes('360 %'), frVals.join(' | '));
  const sideFr = await sideways(p, phone.viewport.width);
  check('No sideways scrolling in French', sideFr === 'none', sideFr);
  await p.close();

  // ---------- 9. Offline ----------
  console.log('\n== 9. Works without internet ==');
  const ctxOff = await browser.newContext({ ...phone, locale: 'en-US' });
  p = await open(ctxOff, 'offline-first-visit');
  // Give the offline code 15 seconds to install. A broken one never gets ready, so do not wait forever.
  const installed = await p.evaluate(() => Promise.race([
    navigator.serviceWorker.ready.then(async () => !!((await navigator.serviceWorker.getRegistration()) || {}).active),
    new Promise((done) => setTimeout(() => done(false), 15000)),
  ]));
  const cached = installed ? await p.evaluate(async () => {
    const text = await (await fetch('sw.js')).text();
    const list = text.match(/const ASSETS = \[([\s\S]*?)\];/);
    const keys = await caches.keys();
    const c = keys.length ? await caches.open(keys[0]) : null;
    return { cache: keys.join(','), files: c ? (await c.keys()).length : 0, listed: list ? (list[1].match(/'[^']*'/g) || []).length : -1 };
  }) : { cache: 'none', files: 0, listed: -1 };
  check('First visit saves the app on the phone', installed && cached.listed > 0 && cached.files === cached.listed,
    (installed ? '' : 'the offline code did not install in 15 s; ') + cached.cache + ', ' + cached.files + ' of ' + cached.listed + ' files');
  await p.reload({ waitUntil: 'load' });
  await ctxOff.setOffline(true);
  const pOff = watch(await ctxOff.newPage(), 'offline');
  let offlineLoaded = true;
  try { await pOff.goto(BASE, { waitUntil: 'load', timeout: 15000 }); } catch (e) { offlineLoaded = false; }
  check('With internet OFF, the app still opens', offlineLoaded && (await pOff.textContent('h1').catch(() => '')) === 'Know Your Loan');
  if (offlineLoaded) {
    await fillLoan(pOff, { amount: 100, count: 1, installment: 130, periodLength: 1 });
    check('...and the calculator still works', (await sentence(pOff)) === 'For every 100 you receive, you pay back 130.');
    await pOff.selectOption('#lang', 'fr');
    check('...and French still works', (await pOff.textContent('h1')) === (await T(pOff, 'fr', 'appName')));
  }
  await ctxOff.setOffline(false);
  await ctxOff.close();

  // ---------- 10. Desktop ----------
  console.log('\n== 10. Laptop screen ==');
  const ctxDesk = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'en-US' });
  p = await open(ctxDesk, 'desktop');
  const sideDesk = await sideways(p, 1280);
  check('Opens on a laptop-size screen with no sideways scrolling', sideDesk === 'none', sideDesk);
  await ctxDesk.close();

  // ---------- 11. Narrow phones ----------
  // Spanish and French run longer than English, and 320 px is the narrowest phone in common use.
  // Each screen is checked at four common widths, in the states the test fills in below. Very large
  // amounts are left out on purpose: they still run past the edge (CLAUDE.md backlog).
  console.log('\n== 11. Narrow phones ==');
  for (const width of [320, 360, 375, 393]) {
    for (const lang of ['en', 'es', 'fr']) {
      const ctxNarrow = await browser.newContext({ viewport: { width, height: 740 }, isMobile: true, hasTouch: true, locale: 'en-US' });
      p = await open(ctxNarrow, 'narrow');
      await p.selectOption('#lang', lang);
      const over = [];
      const look = async (state) => (await pastEdge(p, width)).forEach((x) => over.push(state + ': ' + x));
      // No real taps here: content pushed past the screen can block a tap, and other sections test taps.
      try {
        await look('Calculate, empty');
        await fillLoan(p, { amount: 1000, count: 10, installment: 130, periodLength: 2, unit: 'week' });
        await look('Calculate, every 2 weeks');
        await fillLoan(p, { count: 1, periodLength: 1, unit: 'month' });
        await look('Calculate, one payment');
        await p.evaluate(() => { document.querySelector('details.more').open = true; });
        await fillLoan(p, { count: 6, installment: 200, quoted: 10, money: 'Córdobas' });
        await look("Calculate, the lender's rate and a money name");
        await p.fill('#save-name', 'Préstamo del grupo de ahorro');
        await p.$eval('#save-btn', (b) => b.click());
        await look('Calculate, a saved offer');
        await p.fill('#count', '1.5');
        await p.waitForSelector('#result ul.errors li', { timeout: 5000 }).catch(() => {});
        await look('Calculate, a mistake in the form');
        for (const tab of ['signs', 'sheet']) {
          await p.evaluate((x) => { location.hash = '#' + x; }, tab);
          await p.waitForSelector('#tab-' + tab, { state: 'visible', timeout: 3000 });
          await look(tab === 'signs' ? 'Warning signs' : 'Paper worksheet');
        }
      } catch (e) {
        over.push('the test could not finish these screens: ' + String(e.message || e).split('\n')[0]);
      }
      check(`Nothing runs past a ${width} px screen in ${lang.toUpperCase()}`, over.length === 0, over.slice(0, 4).join(' | ') || 'none');
      await ctxNarrow.close();
    }
  }

  // ---------- Errors and privacy ----------
  // Close every page first, so requests sent as a page closes are counted too.
  await browser.close();
  await new Promise((done) => setTimeout(done, 500));
  console.log('\n== Errors and privacy (all runs) ==');
  const all = (k, skip) => Object.entries(bags).filter(([l]) => !(skip || []).includes(l)).flatMap(([l, b]) => b[k].map((x) => l + ': ' + x));
  const jsErr = all('errors').concat(all('console'));
  check('No JavaScript errors', jsErr.length === 0, jsErr.join(' || ') || 'none');
  const missing = all('bad').concat(all('failed'));
  check('No missing or broken files, online or offline', missing.length === 0, missing.join(' || ') || 'none');
  const ext = all('external').concat(outside.seen.map((x) => 'network: ' + x));
  check('No ordinary web request to another site, and no link that opens one early', ext.length === 0, ext.join(' || ') || 'none');

  outside.server.close();
  if (server) server.close();
  const failed = results.filter((x) => !x.ok).length;
  console.log(`\nTOTAL: ${results.length - failed} passed, ${failed} failed, out of ${results.length}`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('TEST SCRIPT CRASHED:', e); process.exit(2); });
