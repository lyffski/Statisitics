// Prüft die Gesamtdatei: jeder Teil entpackt, lädt ohne Fehler, meldet 'ready', Video-Links absolut.
// Aufruf: LIBS=/pfad/zu/libs node tools/test/bundle_test.js Lernbegleiter/00_Alle_Teile.html
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const LIBS = process.env.LIBS || path.join(__dirname, 'libs');
(async () => {
  const f = path.resolve(process.argv[2] || 'Lernbegleiter/00_Alle_Teile.html');
  const b = await pw.chromium.launch(); let fail = 0;
  for (const [w, h] of [[1920, 1080], [390, 800]]) {
    const page = await b.newPage({ viewport: { width: w, height: h } });
    await page.route(/KaTeX\/0\.16\.9\/(.*)$/, (r, req) => { const m = req.url().match(/KaTeX\/0\.16\.9\/(.*)$/); const p = path.join(LIBS, 'katex-0.16.9', 'dist', m[1]); fs.existsSync(p) ? r.fulfill({ path: p }) : r.abort(); });
    await page.route(/cdn\.plot\.ly/, r => r.fulfill({ path: path.join(LIBS, 'plotly.js-dist-min-2.27.0', 'plotly.min.js') }));
    await page.route(/fonts\./, r => r.abort());
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    await page.goto('file://' + f + '#teil1'); await page.waitForTimeout(300);
    const n = await page.evaluate(() => document.querySelectorAll('#tabs button').length);
    for (let i = 0; i < n; i++) {
      await page.click('#tabs button[data-i="' + i + '"]');
      await page.waitForFunction(k => window.__lbReady[k], i, { timeout: 15000 });
      await page.waitForTimeout(150);
      const fr = page.frames().filter(x => x.url().startsWith('blob:'))[i];
      const info = await fr.evaluate(() => ({ single: document.querySelectorAll('a[href$=".html"]').length, h: document.querySelector('.lbt b') && document.querySelector('.lbt b').textContent, v: (document.querySelector('.vid a.vopen') || {}).href || '-', ov: document.documentElement.scrollWidth - window.innerWidth,
        kx: document.querySelectorAll('.katex-error').length }));
      const hash = await page.evaluate(() => location.hash);
      const okV = info.v === '-' || info.v.startsWith('file:///home/lllvrm/Personal/Statistics/');
      const ok = okV && info.single === 0 && info.ov <= 1 && info.kx === 0;
      if (!ok) fail++;
      console.log((ok ? '✓' : '✗') + ' ' + w + ' Teil ' + (i + 1) + ' ' + hash + ' · ' + info.h + ' · Video ' + (info.v === '-' ? 'keins' : okV ? 'absolut ok' : info.v) + ' · Überlauf ' + info.ov + ' · KaTeX-Fehler ' + info.kx + ' · .html-Links ' + info.single);
    }
    const sov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (sov > 1) { fail++; console.log('✗ Hülle läuft über: ' + sov); }
    if (errs.length) { fail++; console.log('✗ Fehler:', errs); }
    await page.close();
  }
  await b.close();
  console.log(fail ? fail + ' Problem(e)' : 'alles ok'); process.exit(fail ? 1 : 0);
})();
