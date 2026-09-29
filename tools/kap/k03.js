/* Kapitel 3 · Deskriptive Statistik: Visuals, Tracer, Training */
LB.KW = [
  ['Stichprobe', 'mem'], ['Grundgesamtheit', 'mem'], ['Daten', 'mem'], ['Beobachtungen', 'mem'], ['Ausreißer', 'mem'],
  ['arithmetische Mittel', 'res'], ['Mittelwert', 'res'], ['Standardabweichung', 'res'], ['Kennzahl', 'res'],
  ['Median', 'rule'], ['Quantil', 'rule'], ['Quartil', 'rule'], ['Quartilsdifferenz', 'rule'], ['Histogramm', 'rule'], ['Boxplot', 'rule'],
  ['robust', 'rule'], ['Sturges', 'rule'], ['Korrelation', 'rule'], ['Kovarianz', 'rule'], ['Bestimmtheitsmaß', 'rule'], ['kleinsten Quadrate', 'rule'],
  ['Residuen', 'chg'], ['Residuum', 'chg'], ['ordnen', 'chg'], ['Abweichung', 'chg'],
  ['Streudiagramm', 'cond'], ['empirisch', 'idx']
];
const S = LB.S, C = LB.C;
/* bimodaler Beispieldatensatz, reproduzierbar */
const BIMODAL = (() => { const r = S.rng(11), a = []; for (let i = 0; i < 120; i++) a.push(2 + 0.5 * r.norm()); for (let i = 0; i < 80; i++) a.push(4.3 + 0.45 * r.norm()); return a.map(x => Math.round(x * 100) / 100); })();

/* ---------------------------------------------------------------- robust vs. empfindlich */
LB.on(function robust() {
  if (!document.getElementById('rbPlot')) return;
  const base = [1.800, 1.950, 2.283, 2.883, 3.333, 3.600, 3.600, 4.350, 4.533];
  LB.bind(['rbX'], v => {
    const d = base.concat([v.rbX]), m = S.mean(d), md = S.median(d);
    LB.plot('rbPlot', [{ x: d, y: d.map(() => 0), mode: 'markers', marker: { color: d.map((x, i) => i === d.length - 1 ? C.chg : C.mem), size: 13 }, hovertemplate: '%{x}<extra></extra>' },
      { x: [m, m], y: [-0.8, 0.8], mode: 'lines', line: { color: C.res, width: 3 }, name: 'Mittel' },
      { x: [md, md], y: [-0.8, 0.8], mode: 'lines', line: { color: C.idx, width: 3, dash: 'dash' }, name: 'Median' }],
      { height: 220, showlegend: true, xaxis: { title: 'Wert', range: [0, 61] }, yaxis: { visible: false, range: [-1, 1] } });
    document.getElementById('rbOut').innerHTML = 'Mittel <b class="kw-res">' + LB.fmt(m, 3) + '</b> · Median <b class="kw-idx">' + LB.fmt(md, 4) + '</b> · s = ' + LB.fmt(S.sd(d), 3) + ' · IQR = ' + LB.fmt(S.quantile(d, 0.75) - S.quantile(d, 0.25), 3);
  });
});

/* ---------------------------------------------------------------- Histogramm */
LB.on(function histo() {
  if (!document.getElementById('hiPlot')) return;
  const lo = Math.min(...BIMODAL), hi = Math.max(...BIMODAL), st = Math.ceil(1 + Math.log2(BIMODAL.length));
  LB.bind(['hiK'], v => {
    const k = v.hiK, w = (hi - lo) / k, cnt = new Array(k).fill(0);
    BIMODAL.forEach(x => cnt[Math.min(k - 1, Math.floor((x - lo) / w))]++);
    const xs = cnt.map((_, i) => lo + (i + 0.5) * w), ys = cnt.map(c => c / (BIMODAL.length * w));
    LB.plot('hiPlot', [{ type: 'bar', x: xs, y: ys, width: w * 0.98, marker: { color: LB.rgba(C.rule, 0.75) }, hovertemplate: 'Klasse um %{x:.2f}: Dichte %{y:.3f}<extra></extra>' }],
      { height: 300, xaxis: { title: 'Wert · Sturges: ' + st + ' Klassen (n = 200)' }, yaxis: { title: 'Dichte (Fläche 1)' },
        shapes: [{ type: 'line', x0: 0, x1: 1, xref: 'paper', y0: 0, y1: 0, line: { color: C.border } }],
        annotations: [{ xref: 'paper', yref: 'paper', x: 0.99, y: 0.98, text: k === st ? '= Sturges-Empfehlung' : (k < st ? 'weniger als Sturges' : 'mehr als Sturges'), showarrow: false, font: { color: k === st ? C.idx : C.chg } }] });
  });
});

/* ---------------------------------------------------------------- Boxplot-Baukasten */
LB.on(function boxb() {
  if (!document.getElementById('bxPlot')) return;
  const base = [11, 12, 13, 14, 15, 16, 18];
  LB.bind(['bxV'], v => {
    const d = base.concat([v.bxV]), q1 = S.quantile(d, 0.25), q3 = S.quantile(d, 0.75), md = S.median(d), iqr = q3 - q1, lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
    const inside = d.filter(x => x >= lo && x <= hi), out = d.filter(x => x < lo || x > hi), wl = Math.min(...inside), wh = Math.max(...inside);
    const shapes = [
      { type: 'rect', x0: q1, x1: q3, y0: -0.4, y1: 0.4, line: { color: C.rule, width: 2 }, fillcolor: LB.rgba(C.rule, 0.18) },
      { type: 'line', x0: md, x1: md, y0: -0.4, y1: 0.4, line: { color: C.idx, width: 3 } },
      { type: 'line', x0: wl, x1: q1, y0: 0, y1: 0, line: { color: C.text, width: 2 } }, { type: 'line', x0: q3, x1: wh, y0: 0, y1: 0, line: { color: C.text, width: 2 } },
      { type: 'line', x0: wl, x1: wl, y0: -0.2, y1: 0.2, line: { color: C.text, width: 2 } }, { type: 'line', x0: wh, x1: wh, y0: -0.2, y1: 0.2, line: { color: C.text, width: 2 } },
      { type: 'line', x0: lo, x1: lo, y0: -0.7, y1: 0.7, line: { color: C.cond, dash: 'dot' } }, { type: 'line', x0: hi, x1: hi, y0: -0.7, y1: 0.7, line: { color: C.cond, dash: 'dot' } }];
    LB.plot('bxPlot', [{ x: inside, y: inside.map(() => -0.6), mode: 'markers', marker: { color: C.mem, size: 8 }, hovertemplate: '%{x}<extra></extra>' },
      { x: out, y: out.map(() => 0), mode: 'markers', marker: { color: C.res, size: 13, symbol: 'circle-open', line: { width: 3 } }, hovertemplate: 'Ausreißer %{x}<extra></extra>' }],
      { height: 220, shapes, xaxis: { range: [-22, 62], title: 'Wert' }, yaxis: { visible: false, range: [-1, 1] } });
    document.getElementById('bxOut').innerHTML = 'q₀.₂₅ = ' + q1 + ' · Median = ' + md + ' · q₀.₇₅ = ' + q3 + ' · IQR = ' + iqr + ' · Grenzen [' + LB.fmt(lo, 3) + ', ' + LB.fmt(hi, 3) + '] · Whisker ' + wl + ' bis ' + wh + ' · Ausreißer: <b class="kw-res">' + (out.length ? out.join(', ') : 'keine') + '</b>';
  });
});

/* ---------------------------------------------------------------- empirische Verteilungsfunktion */
LB.on(function ecdfv() {
  if (!document.getElementById('ecPlot')) return;
  const s = S.sorted(BIMODAL), n = s.length, x = [s[0] - 0.5], y = [0];
  s.forEach((v, i) => { x.push(v, v); y.push(i / n, (i + 1) / n); }); x.push(s[n - 1] + 0.5); y.push(1);
  LB.plot('ecPlot', [{ x, y, mode: 'lines', line: { color: C.chg, width: 2 }, hoverinfo: 'skip' },
    { x: s, y: s.map(() => -0.03), mode: 'markers', marker: { symbol: 'line-ns-open', color: C.mem, size: 10 }, hoverinfo: 'skip' }],
    { height: 300, xaxis: { title: 'x' }, yaxis: { title: 'Fₙ(x)', range: [-0.06, 1.03] } });
});

/* ---------------------------------------------------------------- Korrelation */
LB.on(function corr() {
  if (!document.getElementById('coPlot')) return;
  let seed = 5;
  const run = LB.bind(['coR'], v => {
    const r0 = Math.max(-0.999, Math.min(0.999, v.coR)), rr = S.rng(seed), n = 60, x = [], y = [];
    for (let i = 0; i < n; i++) { const a = rr.norm(), b = rr.norm(); x.push(a); y.push(r0 * a + Math.sqrt(1 - r0 * r0) * b); }
    const r = S.cor(x, y), mx = S.mean(x), my = S.mean(y), bb = r * S.sd(y) / S.sd(x);
    LB.plot('coPlot', [{ x, y, mode: 'markers', marker: { color: C.mem, size: 8 } },
      { x: [-3, 3], y: [my + bb * (-3 - mx), my + bb * (3 - mx)], mode: 'lines', line: { color: C.chg, width: 2 } }],
      { height: 330, xaxis: { range: [-3.2, 3.2], title: 'x' }, yaxis: { range: [-3.5, 3.5], title: 'y' } });
    document.getElementById('coOut').innerHTML = 'empirisches r dieser 60 Punkte = <b class="kw-res">' + LB.fmt(r, 3) + '</b> · Stärke: ' + (Math.abs(r) > 0.8 ? 'stark' : Math.abs(r) > 0.5 ? 'mittel' : Math.abs(r) > 0.2 ? 'schwach' : 'kaum linear') + ', Richtung: ' + (r > 0 ? 'gleichläufig' : 'gegenläufig');
  });
  document.getElementById('coNew').addEventListener('click', () => { seed++; run(); });
});

/* ---------------------------------------------------------------- Anscombe */
LB.on(function anscombe() {
  if (!document.getElementById('anPlot')) return;
  const x1 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], x4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8];
  const Y = [[8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68], [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],
    [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73], [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]];
  const tr = [], ann = [];
  Y.forEach((y, k) => {
    const x = k === 3 ? x4 : x1, r = S.cor(x, y), ax = k ? 'x' + (k + 1) : 'x', ay = k ? 'y' + (k + 1) : 'y';
    tr.push({ x, y, mode: 'markers', marker: { color: C.mem, size: 8 }, xaxis: ax, yaxis: ay });
    tr.push({ x: [3, 20], y: [3 + 0.5 * 3, 3 + 0.5 * 20], mode: 'lines', line: { color: C.chg, width: 1.5 }, xaxis: ax, yaxis: ay });
    ann.push({ text: ['I', 'II', 'III', 'IV'][k] + ': r = ' + LB.fmt(r, 3), xref: ax + ' domain', yref: ay + ' domain', x: 0.03, y: 0.97, showarrow: false, font: { color: C.res } });
  });
  const L = { height: 420, grid: { rows: 2, columns: 2, pattern: 'independent' }, annotations: ann, margin: { l: 40, r: 10, t: 10, b: 30 } };
  ['xaxis', 'xaxis2', 'xaxis3', 'xaxis4'].forEach(a => L[a] = { range: [2, 20], gridcolor: '#252b33', zeroline: false });
  ['yaxis', 'yaxis2', 'yaxis3', 'yaxis4'].forEach(a => L[a] = { range: [2, 14], gridcolor: '#252b33', zeroline: false });
  LB.plot('anPlot', tr, L);
});

/* ---------------------------------------------------------------- Regression per Klick */
LB.on(function regClick() {
  const el = document.getElementById('rgPlot'); if (!el || !window.Plotly) return;
  const ex = () => [[1, 2], [2, 4], [3, 5], [4, 4], [5, 5]];
  let pts = ex();
  const draw = () => {
    const tr = [{ x: pts.map(p => p[0]), y: pts.map(p => p[1]), mode: 'markers', marker: { color: C.mem, size: 11 }, hoverinfo: 'x+y' }];
    let msg = 'Mindestens zwei Punkte mit verschiedenen x setzen.';
    if (pts.length >= 2) {
      const x = pts.map(p => p[0]), y = pts.map(p => p[1]), mx = S.mean(x), my = S.mean(y);
      const Sxx = S.sum(x.map(v => (v - mx) ** 2)), Sxy = S.sum(x.map((v, i) => (v - mx) * (y[i] - my)));
      if (Sxx > 1e-12) {
        const b = Sxy / Sxx, a = my - b * mx, yh = x.map(v => a + b * v), sse = S.sum(y.map((v, i) => (v - yh[i]) ** 2)), sst = S.sum(y.map(v => (v - my) ** 2));
        const rx = [], ry = []; x.forEach((v, i) => { rx.push(v, v, null); ry.push(y[i], yh[i], null); });
        tr.push({ x: rx, y: ry, mode: 'lines', line: { color: C.res, dash: 'dot', width: 1.5 }, hoverinfo: 'skip' });
        tr.push({ x: [0, 10], y: [a, a + 10 * b], mode: 'lines', line: { color: C.chg, width: 2.5 }, hoverinfo: 'skip' });
        tr.push({ x: [mx], y: [my], mode: 'markers', marker: { symbol: 'x', color: C.par, size: 12 }, hoverinfo: 'skip' });
        msg = 'n = ' + pts.length + ' · \\(\\hat y=\\Res{' + LB.fmt(a, 3) + '}+\\Res{' + LB.fmt(b, 3) + '}\\,x\\) · SSE = ' + LB.fmt(sse, 3) + ' · \\(R^2=' + (sst > 0 ? LB.fmt(1 - sse / sst, 4) : '–') + '\\) · \\(r=' + (sst > 0 ? LB.fmt(S.cor(x, y), 4) : '–') + '\\) · blaues ✕ = Schwerpunkt';
      }
    }
    LB.plot(el, tr, { height: 360, xaxis: { range: [0, 10], title: 'x', fixedrange: true }, yaxis: { range: [0, 10], title: 'y', fixedrange: true }, dragmode: false });
    const o = document.getElementById('rgOut'); o.innerHTML = msg; LB.tex(o);
  };
  draw();
  el.addEventListener('click', e => {
    const fl = el._fullLayout; if (!fl) return;
    const bb = el.getBoundingClientRect(), xa = fl.xaxis, ya = fl.yaxis;
    const px = e.clientX - bb.left - xa._offset, py = e.clientY - bb.top - ya._offset;
    if (px < 0 || py < 0 || px > xa._length || py > ya._length) return;
    pts.push([Math.round(xa.p2l(px) * 10) / 10, Math.round(ya.p2l(py) * 10) / 10]); draw();
  });
  document.getElementById('rgUndo').addEventListener('click', () => { pts.pop(); draw(); });
  document.getElementById('rgReset').addEventListener('click', () => { pts = ex(); draw(); });
  document.getElementById('rgClear').addEventListener('click', () => { pts = []; draw(); });
});

/* ---------------------------------------------------------------- Modell vs. Daten */
LB.on(function modelData() {
  if (!document.getElementById('mdHist')) return;
  let seed = 21;
  const run = LB.bind(['mdN'], v => {
    const n = v.mdN, r = S.rng(seed), d = []; for (let i = 0; i < n; i++) d.push(r.norm());
    const k = Math.max(4, Math.ceil(1 + Math.log2(n))), lo = -4, w = 8 / k, cnt = new Array(k).fill(0);
    d.forEach(x => { const j = Math.floor((x - lo) / w); if (j >= 0 && j < k) cnt[j]++; });
    LB.plot('mdHist', [{ type: 'bar', x: cnt.map((_, i) => lo + (i + 0.5) * w), y: cnt.map(c => c / (n * w)), width: w * 0.97, marker: { color: LB.rgba(C.mem, 0.6) } }, LB.curve(x => S.normPdf(x), -4, 4, C.rule)],
      { height: 280, xaxis: { range: [-4, 4], title: 'Histogramm vs. Dichte' }, yaxis: { rangemode: 'tozero' } });
    const s = S.sorted(d), x = [-4], y = [0]; s.forEach((q, i) => { x.push(q, q); y.push(i / n, (i + 1) / n); }); x.push(4); y.push(1);
    LB.plot('mdEcdf', [{ x, y, mode: 'lines', line: { color: C.chg, width: 2 } }, LB.curve(t => S.Phi(t), -4, 4, C.rule)],
      { height: 280, xaxis: { range: [-4, 4], title: 'Fₙ vs. Φ' }, yaxis: { range: [0, 1.02] } });
    let ks = 0; s.forEach((q, i) => { ks = Math.max(ks, Math.abs((i + 1) / n - S.Phi(q)), Math.abs(i / n - S.Phi(q))); });
    const o = document.getElementById('mdOut');
    o.innerHTML = 'n = ' + n + ': \\(\\bar x=' + LB.fmt(S.mean(d), 3) + '\\) (Modell 0), \\(s^2=' + LB.fmt(S.var(d), 3) + '\\) (Modell 1), größter Abstand \\(|\\FF_n-\\Phi|=' + LB.fmt(ks, 3) + '\\)';
    LB.tex(o);
  });
  document.getElementById('mdNew').addEventListener('click', () => { seed++; run(); });
});

/* ================================================================ Tracer */
LB.on(function tracers3() {
  const vR = a => 'c(' + a.join(', ') + ')', vP = a => '[' + a.join(', ') + ']';
  new LB.Tracer({
    id: 'trKz', title: 'x̄, s², s und Quartile nach Skript', langs: CODE('k3_kennzahlen'),
    vars: [['x', 'mem', 'die Daten x₁ … xₙ'], ['n', 'par', 'Stichprobenumfang'], ['i', 'idx', 'Laufindex über die Daten'], ['summe', 'chg', 'Summe aller Werte'], ['xbar', 'res', 'Mittel x̄ = summe / n'],
      ['q', 'chg', 'Summe der quadrierten Abstände zum Mittel'], ['s2', 'res', 'Varianz s² = q / (n − 1)'], ['s', 'res', 'Standardabweichung √s²'], ['xs', 'mem', 'geordnete Daten x₍₁₎ ≤ … ≤ x₍ₙ₎'],
      ['alpha', 'par', 'gesuchtes Quantil-Niveau (0.25, 0.5, 0.75)'], ['k', 'idx', 'Position α·n in den geordneten Daten']],
    together: 'Erst wird aufsummiert (<span class="kw-chg">summe</span> → <span class="kw-res">xbar</span>), dann werden die Abstände zu x̄ quadriert und gesammelt (<span class="kw-chg">q</span> → <span class="kw-res">s2</span> → <span class="kw-res">s</span>). Für die Quantile werden die Daten sortiert (<span class="kw-mem">xs</span>); die Position <span class="kw-idx">k</span> = α·n entscheidet: ganzzahlig → Mittel zweier Nachbarn, sonst aufrunden.',
    say: s => 'Ein typischer Wert liegt bei x̄ = ' + LB.fmt(s.xbar, 3) + '; die Werte streuen im Schnitt etwa s = ' + LB.fmt(s.s, 3) + ' um dieses Mittel. Die mittlere Hälfte der Daten liegt zwischen ' + s.qs[0.25] + ' und ' + s.qs[0.75] + ', der Median ist ' + s.qs[0.5] + '. ' +
      (Math.abs(s.xbar - s.qs[0.5]) > 0.25 * s.s ? 'Mittel und Median liegen deutlich auseinander: die Daten sind schief oder haben Ausreißer, der Median beschreibt die Mitte hier besser.' : 'Mittel und Median liegen nahe beieinander: die Daten sind etwa symmetrisch.'),
   
    input: '12 15 11 18 14 13 30 16', hint: 'beliebige Zahlen (2 bis 25)',
    examples: [['acht Werte mit Ausreißer', '12 15 11 18 14 13 30 16'], ['Rohr-Durchmesser', '3 7 7 9 4'], ['Old Faithful', '3.6 1.8 3.333 2.283 4.533 2.883 4.7 3.6 1.95 4.35'], ['Grundlage n = 8', '2 3 5 6 8 9 11 14']],
    parse: s => { const x = S.parse(s); if (x.length < 2 || x.length > 25) throw new Error('2 bis 25 Zahlen'); return x; },
    codeFor: (x, L, lines) => lines.map(l => /#@data\s*$/.test(l) ? (L === 'R' ? 'x <- ' + vR(x) : 'x = ' + vP(x)) + '   # Daten #@data' : l),
    run(rec, x) {
      const n = x.length; let sum = 0, i = -1, xbar = null, q = 0, s2 = null, s = null, xs = null, qs = {}; const cur = { a: null, pos: null };
      const st = () => ({ x, n, sum, i, xbar, q, s2, s, xs, qs: Object.assign({}, qs), cur: Object.assign({}, cur) });
      rec.step('data', 'Daten eingelesen.', st());
      rec.step('n', '\\(\\Par{n}=' + n + '\\).', st());
      rec.step('s0', 'Summe = 0.', st());
      for (i = 0; i < n; i++) { sum += x[i]; rec.step('sum', '+ \\(x_{' + (i + 1) + '}=' + x[i] + '\\) → Summe ' + LB.fmt(sum, 4), st()); }
      i = -1; xbar = sum / n; rec.step('mean', '\\(\\Res{\\bar x}=\\tfrac{' + LB.fmt(sum, 4) + '}{' + n + '}=\\Res{' + LB.fmt(xbar, 4) + '}\\)', st());
      rec.step('q0', 'Quadratsumme = 0.', st());
      for (i = 0; i < n; i++) { const d = x[i] - xbar; q += d * d; rec.step('sq', '\\((' + x[i] + '-' + LB.fmt(xbar, 3) + ')^2=' + LB.fmt(d * d, 4) + '\\) → ' + LB.fmt(q, 4), st()); }
      i = -1; s2 = q / (n - 1); rec.step('s2', '\\(\\Res{s^2}=\\tfrac{' + LB.fmt(q, 4) + '}{' + (n - 1) + '}=\\Res{' + LB.fmt(s2, 4) + '}\\)', st());
      s = Math.sqrt(s2); rec.step('s', '\\(\\Res{s}=' + LB.fmt(s, 4) + '\\)', st());
      xs = S.sorted(x); rec.step('sort', 'Geordnet: ' + xs.join(', '), st());
      rec.step('qf', 'Quantil-Funktion nach Skript definiert.', st());
      [0.25, 0.5, 0.75].forEach(a => {
        const k = a * n; cur.a = a; cur.pos = k;
        rec.step('pos', '\\(\\alpha=' + a + '\\): Position \\(\\alpha n=' + LB.fmt(k, 2) + '\\) ' + (Math.abs(k - Math.round(k)) < 1e-9 ? '(ganzzahlig)' : '(nicht ganzzahlig)'), st());
        qs[a] = S.quantile(x, a);
        rec.step('case', Math.abs(k - Math.round(k)) < 1e-9 ? '\\(q_{' + a + '}=\\tfrac12(x_{(' + k + ')}+x_{(' + (k + 1) + ')})=' + LB.fmt(qs[a], 4) + '\\)' : '\\(q_{' + a + '}=x_{(\\lceil' + LB.fmt(k, 2) + '\\rceil)}=x_{(' + Math.ceil(k) + ')}=' + LB.fmt(qs[a], 4) + '\\)', st());
      });
      cur.a = null; cur.pos = null;
      rec.step('out', 'Ergebnis: \\(\\bar x=' + LB.fmt(xbar, 4) + ',\\ s^2=' + LB.fmt(s2, 4) + ',\\ s=' + LB.fmt(s, 4) + ',\\ q_{0.25}=' + qs[0.25] + ',\\ \\text{Median}=' + qs[0.5] + ',\\ q_{0.75}=' + qs[0.75] + '\\)', st());
    },
    view: s => (s.xs ? '' + LB.cellsHTML(s.xs.map(v => v), k => s.cur.pos !== null && (k === Math.ceil(s.cur.pos) - 1 || (Math.abs(s.cur.pos - Math.round(s.cur.pos)) < 1e-9 && (k === s.cur.pos - 1 || k === s.cur.pos))) ? 'o' : '', 1) :
      LB.cellsHTML(s.x, k => k === s.i ? 'o' : '', 1, { idx: 'i', val: 'x[i]', role: 'mem', note: 'orange = gerade in der Schleife' })) +
      LB.kvHTML([['summe', LB.fmt(s.sum, 4), 'chg'], ['x̄', s.xbar === null ? '–' : LB.fmt(s.xbar, 4), 'res'], ['q = Σ(x−x̄)²', LB.fmt(s.q, 4), 'chg'], ['s²', s.s2 === null ? '–' : LB.fmt(s.s2, 4), 'res'], ['s', s.s === null ? '–' : LB.fmt(s.s, 4), 'res'],
        ['q₀.₂₅', s.qs[0.25] === undefined ? '–' : s.qs[0.25], 'res'], ['Median', s.qs[0.5] === undefined ? '–' : s.qs[0.5], 'res'], ['q₀.₇₅', s.qs[0.75] === undefined ? '–' : s.qs[0.75], 'res']])
  });

  const pairParse = s => { const [a, b] = s.split(';'); if (b === undefined) throw new Error('Format: x-Werte ; y-Werte'); const x = S.parse(a), y = S.parse(b);
    if (x.length < 2 || x.length !== y.length || x.length > 15) throw new Error('gleich viele x und y (2 bis 15)'); return { x, y }; };
  const pairCode = (d, L, lines) => lines.map(l => /#@x\s*$/.test(l) ? (L === 'R' ? 'x <- ' + vR(d.x) : 'x = np.array(' + vP(d.x) + ')') + '   # x-Werte #@x' : /#@y\s*$/.test(l) ? (L === 'R' ? 'y <- ' + vR(d.y) : 'y = np.array(' + vP(d.y) + ')') + '   # y-Werte #@y' : l);
  const PEX = [['fünf Paare', '1 2 3 4 5 ; 2 4 5 4 5'], ['perfekt steigend', '1 2 3 4 ; 3 5 7 9'], ['U-Form', '-2 -1 0 1 2 ; 4 1 0 1 4'], ['gegenläufig', '1 2 3 4 5 6 ; 10 8 9 5 4 2']];

  new LB.Tracer({
    id: 'trKor', title: 'Kovarianz und Korrelation', langs: CODE('k3_korrelation'),
    vars: [['x|y', 'mem', 'die gepaarten Messwerte'], ['n', 'par', 'Anzahl Paare'], ['mx|my', 'par', 'Mittelwerte x̄, ȳ'], ['i', 'idx', 'aktuelles Paar'],
      ['dx|dy', 'chg', 'Abweichungen vom jeweiligen Mittel'], ['sxy', 'chg', 'Summe der Produkte dx·dy: positiv = gleichläufig'], ['sxx|syy', 'chg', 'Quadratsummen: Streuung in x bzw. y'], ['r', 'res', 'Korrelation r = sxy / √(sxx·syy), zwischen −1 und 1']],
    together: 'Pro Paar (<span class="kw-idx">i</span>) werden die Abweichungen <span class="kw-chg">dx</span>, <span class="kw-chg">dy</span> gebildet. Liegen beide auf derselben Seite ihres Mittels, ist das Produkt positiv und erhöht <span class="kw-chg">sxy</span>. Die Division durch √(sxx·syy) macht daraus die einheitenfreie Korrelation <span class="kw-res">r</span>.',
    say: s => { const a = Math.abs(s.r), w = a >= 0.8 ? 'starken' : a >= 0.5 ? 'mittleren' : a >= 0.2 ? 'schwachen' : 'kaum einen';
      return 'Die Daten zeigen ' + (a < 0.2 ? 'kaum einen linearen Zusammenhang' : 'einen ' + w + (s.r > 0 ? ' positiven' : ' negativen') + ' linearen Zusammenhang') + ' (r = ' + LB.fmt(s.r, 3) + ')' + (a >= 0.2 ? ': größere x gehen tendenziell mit ' + (s.r > 0 ? 'größeren' : 'kleineren') + ' y einher' : '') + '. r misst nur lineare Zusammenhänge und sagt nichts über Ursache und Wirkung.'; },
    input: '1 2 3 4 5 ; 2 4 5 4 5', hint: 'x-Werte ; y-Werte', examples: PEX, parse: pairParse, codeFor: pairCode,
    run(rec, d) {
      const n = d.x.length, mx = S.mean(d.x), my = S.mean(d.y); let sxy = 0, sxx = 0, syy = 0, i = -1, r = null; const rows = [];
      const st = () => ({ d, mx, my, sxy, sxx, syy, i, r, rows: rows.slice() });
      rec.step('x', 'x-Werte.', st()); rec.step('y', 'y-Werte.', st());
      rec.step('m', '\\(\\bar x=' + LB.fmt(mx, 4) + ',\\ \\bar y=' + LB.fmt(my, 4) + '\\)', st());
      rec.step('init', 'Drei Summen = 0.', st());
      for (i = 0; i < n; i++) {
        rec.step('loop', 'Paar \\(\\Idx{i}=' + (i + 1) + '\\): (' + d.x[i] + ', ' + d.y[i] + ').', st());
        const dx = d.x[i] - mx, dy = d.y[i] - my; rows.push([dx, dy]);
        rec.step('d', 'Abweichungen \\(' + LB.fmt(dx, 3) + '\\) und \\(' + LB.fmt(dy, 3) + '\\).', st());
        sxy += dx * dy; rec.step('xy', 'Produkt \\(' + LB.fmt(dx * dy, 4) + '\\) → \\(S_{xy}=' + LB.fmt(sxy, 4) + '\\)' + (dx * dy > 0 ? ' (gleichläufig)' : dx * dy < 0 ? ' (gegenläufig)' : ''), st());
        sxx += dx * dx; syy += dy * dy; rec.step('xx', '\\(S_{xx}=' + LB.fmt(sxx, 4) + ',\\ S_{yy}=' + LB.fmt(syy, 4) + '\\)', st());
      }
      i = -1; r = sxy / Math.sqrt(sxx * syy);
      rec.step('r', '\\(\\Res{r}=\\tfrac{' + LB.fmt(sxy, 4) + '}{\\sqrt{' + LB.fmt(sxx, 4) + '\\cdot' + LB.fmt(syy, 4) + '}}=\\Res{' + LB.fmt(r, 4) + '}\\)', st());
      rec.step('out', 'Ausgabe: \\(s_{xy}=' + LB.fmt(sxy / (n - 1), 4) + '\\), r = ' + LB.fmt(r, 4), st());
    },
    view: s => '<table class="tbl"><tr><th>i</th><th class="r">x</th><th class="r">y</th><th class="r">x−x̄</th><th class="r">y−ȳ</th><th class="r">Produkt</th></tr>' +
      s.d.x.map((x, k) => '<tr' + (k === s.i ? ' style="outline:1px solid var(--chg)"' : '') + '><td class="kw-idx">' + (k + 1) + '</td><td class="r kw-mem">' + x + '</td><td class="r kw-mem">' + s.d.y[k] + '</td>' +
        (s.rows[k] ? '<td class="r">' + LB.fmt(s.rows[k][0], 3) + '</td><td class="r">' + LB.fmt(s.rows[k][1], 3) + '</td><td class="r ' + (s.rows[k][0] * s.rows[k][1] >= 0 ? 'ok' : 'bad') + '">' + LB.fmt(s.rows[k][0] * s.rows[k][1], 3) + '</td>' : '<td></td><td></td><td></td>') + '</tr>').join('') +
      '</table>' + LB.kvHTML([['sxy', LB.fmt(s.sxy, 4), 'chg'], ['sxx', LB.fmt(s.sxx, 4), 'chg'], ['syy', LB.fmt(s.syy, 4), 'chg'], ['r', s.r === null ? '–' : LB.fmt(s.r, 4), 'res']])
  });

  new LB.Tracer({
    id: 'trReg', title: 'Ausgleichsgerade und R²', langs: CODE('k3_regression'),
    vars: [['x|y', 'mem', 'erklärende Größe x, Zielgröße y'], ['mx|my', 'par', 'Schwerpunkt (x̄, ȳ), die Gerade läuft durch ihn'], ['Sxy|Sxx', 'chg', 'Summe der Kreuzprodukte bzw. der Quadrate in x'],
      ['b', 'res', 'Steigung = Sxy / Sxx'], ['a', 'res', 'Achsenabschnitt = ȳ − b·x̄'], ['yhat', 'chg', 'Vorhersagen ŷᵢ = a + b·xᵢ'], ['res', 'chg', 'Residuen yᵢ − ŷᵢ (senkrechte Abstände)'], ['R2', 'res', 'Bestimmtheitsmaß: erklärter Anteil der Streuung']],
    together: 'Aus den Summen <span class="kw-chg">Sxy</span> und <span class="kw-chg">Sxx</span> entsteht die Steigung <span class="kw-res">b</span>; der Achsenabschnitt <span class="kw-res">a</span> sorgt dafür, dass die Gerade durch den Schwerpunkt geht. Die Residuen <span class="kw-chg">res</span> messen, was die Gerade nicht erklärt; <span class="kw-res">R2</span> vergleicht sie mit der Gesamtstreuung von y.',
    say: s => s.b === null ? 'Keine Gerade bestimmbar.' : 'Pro Einheit mehr x ist y im Mittel um ' + LB.fmt(s.b, 3) + ' ' + (s.b >= 0 ? 'größer' : 'kleiner') + '. Die Gerade ŷ = ' + LB.fmt(s.a, 3) + ' + ' + LB.fmt(s.b, 3) + '·x erklärt ' + Math.round(100 * s.R2) + ' Prozent der Streuung von y; der Rest ist Abweichung um die Gerade. Vorhersagen sind nur im Bereich der beobachteten x (' + Math.min(...s.d.x) + ' bis ' + Math.max(...s.d.x) + ') verlässlich.',
    input: '1 2 3 4 5 ; 2 4 5 4 5', hint: 'x-Werte ; y-Werte', examples: PEX, parse: pairParse, codeFor: pairCode,
    run(rec, d) {
      const n = d.x.length, mx = S.mean(d.x), my = S.mean(d.y); let Sxy = null, Sxx = null, b = null, a = null, yh = null, res = null, R2 = null;
      const st = () => ({ d, mx, my, Sxy, Sxx, b, a, yh, res, R2 });
      rec.step('x', 'x-Werte.', st()); rec.step('y', 'y-Werte.', st());
      rec.step('m', 'Schwerpunkt \\((\\bar x,\\bar y)=(' + LB.fmt(mx, 3) + ',' + LB.fmt(my, 3) + ')\\).', st());
      Sxy = S.sum(d.x.map((v, i) => (v - mx) * (d.y[i] - my))); rec.step('sxy', '\\(S_{xy}=' + LB.fmt(Sxy, 4) + '\\)', st());
      Sxx = S.sum(d.x.map(v => (v - mx) ** 2)); rec.step('sxx', '\\(S_{xx}=' + LB.fmt(Sxx, 4) + '\\)', st());
      if (Sxx === 0) { rec.step('b', '⚠ alle x gleich: keine Steigung bestimmbar.', st()); return; }
      b = Sxy / Sxx; rec.step('b', '\\(\\Res{b}=\\tfrac{' + LB.fmt(Sxy, 4) + '}{' + LB.fmt(Sxx, 4) + '}=\\Res{' + LB.fmt(b, 4) + '}\\)', st());
      a = my - b * mx; rec.step('a', '\\(\\Res{a}=' + LB.fmt(my, 4) + '-' + LB.fmt(b, 4) + '\\cdot' + LB.fmt(mx, 4) + '=\\Res{' + LB.fmt(a, 4) + '}\\)', st());
      yh = d.x.map(v => a + b * v); rec.step('yhat', 'Vorhersagen \\(\\hat y_i\\) berechnet.', st());
      res = d.y.map((v, i) => v - yh[i]); rec.step('res', 'Residuen \\(e_i=y_i-\\hat y_i\\), Summe \\(=' + LB.fmt(S.sum(res), 6) + '\\).', st());
      const sse = S.sum(res.map(e => e * e)), sst = S.sum(d.y.map(v => (v - my) ** 2)); R2 = sst > 0 ? 1 - sse / sst : NaN;
      rec.step('R2', '\\(\\Res{R^2}=1-\\tfrac{' + LB.fmt(sse, 4) + '}{' + LB.fmt(sst, 4) + '}=\\Res{' + LB.fmt(R2, 4) + '}\\)', st());
      rec.step('out', '\\(\\hat y=' + LB.fmt(a, 4) + '+' + LB.fmt(b, 4) + 'x\\), \\(R^2=' + LB.fmt(R2, 4) + '\\)', st());
    },
    view: s => {
      const d = s.d, W = 420, H = 190, xmn = Math.min(...d.x) - 1, xmx = Math.max(...d.x) + 1, ymn = Math.min(...d.y) - 1, ymx = Math.max(...d.y) + 1;
      const X = x => 20 + (x - xmn) / (xmx - xmn) * (W - 30), Y = y => H - 15 - (y - ymn) / (ymx - ymn) * (H - 25);
      let g = '<svg viewBox="0 0 ' + W + ' ' + H + '"><rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none"/>';
      if (s.b !== null) g += '<line x1="' + X(xmn) + '" y1="' + Y(s.a + s.b * xmn) + '" x2="' + X(xmx) + '" y2="' + Y(s.a + s.b * xmx) + '" stroke="' + C.chg + '" stroke-width="2"/>';
      if (s.res) d.x.forEach((x, i) => { g += '<line x1="' + X(x) + '" y1="' + Y(d.y[i]) + '" x2="' + X(x) + '" y2="' + Y(s.yh[i]) + '" stroke="' + C.res + '" stroke-dasharray="3 3"/>'; });
      d.x.forEach((x, i) => { g += '<circle cx="' + X(x) + '" cy="' + Y(d.y[i]) + '" r="5" fill="' + C.mem + '"/>'; });
      g += '<text x="' + X(s.mx) + '" y="' + (Y(s.my) + 5) + '" fill="' + C.par + '" font-size="16" text-anchor="middle">✕</text></svg>';
      return g + LB.kvHTML([['b', s.b === null ? '–' : LB.fmt(s.b, 4), 'res'], ['a', s.a === null ? '–' : LB.fmt(s.a, 4), 'res'], ['R²', s.R2 === null ? '–' : LB.fmt(s.R2, 4), 'res']]);
    }
  });
});

/* ---------------------------------------------------------------- Training */
LB.on(function train3() {
  if (!document.getElementById('q3Task')) return;
  const r = S.rng(Date.now() % 77777); let d;
  const neu = () => {
    const n = 5 + Math.floor(r() * 6); d = []; for (let i = 0; i < n; i++) d.push(1 + Math.floor(r() * 20));
    document.getElementById('q3Task').innerHTML = 'Daten (n = ' + n + '): <b>' + d.join(', ') + '</b>. Berechne Mittel, Standardabweichung, Median und unteres Quartil (Skript-Definition), je 2 Nachkommastellen.';
    ['q3m', 'q3s', 'q3md', 'q3q1'].forEach(id => document.getElementById(id).value = ''); document.getElementById('q3Res').innerHTML = '';
  };
  document.getElementById('q3New').addEventListener('click', neu);
  document.getElementById('q3Chk').addEventListener('click', () => {
    const want = [S.mean(d), S.sd(d), S.median(d), S.quantile(d, 0.25)], ids = ['q3m', 'q3s', 'q3md', 'q3q1'], names = ['x̄', 's', 'Median', 'q₀.₂₅'];
    document.getElementById('q3Res').innerHTML = ids.map((id, k) => { const v = parseFloat(document.getElementById(id).value.replace(',', '.')); const ok = Math.abs(v - want[k]) < 0.006;
      return (ok ? '<span class="ok">✔ ' : '<span class="bad">✗ ') + names[k] + ' = ' + LB.fmt(want[k], 4) + '</span>'; }).join(' · ') + '<br>geordnet: ' + S.sorted(d).join(', ') + ' · n·0.25 = ' + LB.fmt(d.length * 0.25, 2);
  });
  neu();
});
