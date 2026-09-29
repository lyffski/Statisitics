// Automatische Prüfung der Lernbegleiter (Skill Abschnitt 13).
// Aufruf: LIBS=/pfad/zu/libs node tools/test/test.js Lernbegleiter/01_*.html …
// LIBS enthält katex-0.16.9/ und plotly.js-dist-min-2.27.0/ (npm pack), damit offline getestet wird.
const path = require('path');
const fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const LIBS = process.env.LIBS || path.join(__dirname, 'libs');

async function route(page) {
  await page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/KaTeX\/0\.16\.9\/(.*)$/, (r, req) => {
    const m = req.url().match(/KaTeX\/0\.16\.9\/(.*)$/); const f = path.join(LIBS, 'katex-0.16.9', 'dist', m[1]);
    if (fs.existsSync(f)) r.fulfill({ path: f }); else r.abort();
  });
  await page.route(/cdn\.plot\.ly\/plotly-2\.27\.0\.min\.js/, r => r.fulfill({ path: path.join(LIBS, 'plotly.js-dist-min-2.27.0', 'plotly.min.js') }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
}

(async () => {
  const files = process.argv.slice(2);
  const browser = await pw.chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? undefined : undefined });
  let fail = 0;
  for (const f of files) {
    const res = {};
    for (const [w, h] of [[1920, 1080], [390, 800]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
      await route(page);
      await page.goto('file://' + path.resolve(f), { waitUntil: 'load' });
      await page.waitForTimeout(600);
      // alles aufklappen, jeden Tracer bis zum Ende
      await page.evaluate(() => { document.querySelectorAll('details').forEach(d => d.open = true); });
      await page.evaluate(() => { document.querySelectorAll('.tracer [data-a="last"]').forEach(b => b.click()); });
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => {
        const ids = {}; const dup = [];
        document.querySelectorAll('[id]').forEach(e => { if (ids[e.id]) dup.push(e.id); ids[e.id] = 1; });
        const over = [];
        document.querySelectorAll('main *').forEach(e => {
          if (e.closest('.katex-display, .js-plotly-plot, .katex')) return;
          const cs = getComputedStyle(e);
          if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && cs.overflowX !== 'visible' && cs.overflowX !== 'hidden') over.push((e.id || e.className || e.tagName).toString().slice(0, 50));
        });
        const kd = [];
        document.querySelectorAll('.katex-display').forEach(k => { if (k.scrollWidth > k.clientWidth + 2) kd.push(k.textContent.slice(0, 40)); });
        const links = []; document.querySelectorAll('#lbMenu a[href^="#"], .lbq a').forEach(a => { const id = a.getAttribute('href').slice(1); if (!document.getElementById(id)) links.push(id); });
        const secs = [...document.querySelectorAll('[data-vn]')].map(s => [s.id, s.querySelectorAll('.vonnull:not(.blsol)').length]).filter(x => x[1] < 1);
        const trEnd = [...document.querySelectorAll('.tracer')].map(t => [t.id, t.querySelector('.tr-msg').textContent.slice(0, 90)]);
        const trBad = trEnd.filter(x => /⚠|keine Schritte/.test(x[1]));
        return { katex: document.querySelectorAll('.katex').length, kerr: [...document.querySelectorAll('.katex-error')].map(e => e.title || e.textContent).slice(0, 8),
          dup, pageOver: document.documentElement.scrollWidth > innerWidth, over: over.slice(0, 10), kd: kd.slice(0, 6), links, secs, trBad,
          tracers: trEnd.length, vn: document.querySelectorAll('.vonnull').length, kw: document.querySelectorAll('.kw').length,
          kwBad: document.querySelectorAll('pre .kw, .katex .kw, .vn-badge .kw, button .kw').length, plots: document.querySelectorAll('.js-plotly-plot').length,
          vids: document.querySelectorAll('.vid').length, pt: document.querySelectorAll('.pt').length, g: document.querySelectorAll('.is-g').length };
      });
      // Menü öffnen/schließen
      if (w === 1920) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.click('#lbOpen'); const open = await page.evaluate(() => document.body.classList.contains('menu-open'));
        await page.keyboard.press('Escape'); const closed = await page.evaluate(() => !document.body.classList.contains('menu-open'));
        r.menu = open && closed;
        if (process.env.SHOT) { await page.screenshot({ path: process.env.SHOT + '-' + path.basename(f, '.html') + '-top.png' }); }
      }
      r.errs = errs; res[w] = r;
      await page.close();
    }
    const a = res[1920], b = res[390];
    const bad = a.kerr.length || a.errs.length || b.errs.length || a.dup.length || a.pageOver || b.pageOver || a.links.length || !a.menu || a.secs.length || a.trBad.length || a.kwBad || a.over.length;
    if (bad) fail++;
    console.log((bad ? '✗ ' : '✓ ') + path.basename(f));
    console.log('  katex=%d fehler=%j | vonnull=%d tracer=%d plots=%d videos=%d pt=%d grundlage=%d kw=%d', a.katex, a.kerr, a.vn, a.tracers, a.plots, a.vids, a.pt, a.g, a.kw);
    if (a.errs.length || b.errs.length) console.log('  JS-Fehler:', a.errs.concat(b.errs).slice(0, 6));
    if (a.dup.length) console.log('  doppelte IDs:', a.dup);
    if (a.pageOver || b.pageOver) console.log('  Seite scrollt seitwärts: 1920=%s 390=%s', a.pageOver, b.pageOver);
    if (a.over.length) console.log('  Elemente mit Überlauf (1920):', a.over); if (b.over.length) console.log('  (mobil, eigener Scrollbereich):', b.over.length);
    if (a.kd.length || b.kd.length) console.log('  (Hinweis) breite Formeln 1920:', a.kd, ' 390:', b.kd.length);
    if (a.links.length) console.log('  Menülinks ohne Ziel:', a.links);
    if (a.secs.length) console.log('  Unterabschnitte ohne Von-null-Karte:', a.secs);
    if (a.trBad.length) console.log('  Tracer-Probleme:', a.trBad);
    if (a.kwBad) console.log('  Farbwörter an verbotenen Stellen:', a.kwBad);
    if (!a.menu) console.log('  Menü öffnet/schließt nicht');
  }
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
