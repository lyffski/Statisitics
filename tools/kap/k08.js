/* Kapitel 8 · Vergleich zweier Stichproben: Visuals, Werkzeuge, Tracer, Training */
LB.KW = [
  ['gepaart', 'rule'], ['ungepaart', 'rule'], ['Differenzen', 'chg'], ['gepoolte Varianz', 'chg'], ['gepoolten Varianz', 'chg'], ['Blockbildung', 'rule'], ['Randomisierung', 'rule'],
  ['Zwei-Stichproben-t-Test', 'rule'], ['Welch-Test', 'rule'], ['Wilcoxon', 'rule'], ['Mann-Whitney', 'rule'], ['Nullhypothese', 'cond'],
  ['Teststatistik', 'chg'], ['P-Wert', 'res'], ['Vertrauensintervall', 'res'], ['verwerfen', 'res'], ['Freiheitsgrade', 'idx'], ['Steigung', 'par'], ['signifikant', 'rule']
];
const S = LB.S, C = LB.C;
const segBind = (id, cb) => { let v = document.querySelector('#' + id + ' .btn.on').dataset.s; document.getElementById(id).addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; v = b.dataset.s; LB.$$('#' + id + ' .btn').forEach(x => x.classList.toggle('on', x === b)); cb(); }); return () => v; };
const VOR = [5.2, 6.1, 4.8, 5.9, 6.3, 5.5, 4.9, 6.0], NACH = [4.7, 5.4, 4.9, 5.1, 5.8, 4.8, 4.6, 5.3];

/* Zwei-Stichproben-Kennzahlen (gepoolt oder Welch) */
function two(x, y, lvl, welch) {
  const n = x.length, m = y.length, mx = S.mean(x), my = S.mean(y), vx = S.var(x), vy = S.var(y), d = mx - my;
  let se, df, sp2 = ((n - 1) * vx + (m - 1) * vy) / (n + m - 2);
  if (welch) { se = Math.sqrt(vx / n + vy / m); df = (vx / n + vy / m) ** 2 / ((vx / n) ** 2 / (n - 1) + (vy / m) ** 2 / (m - 1)); }
  else { se = Math.sqrt(sp2) * Math.sqrt(1 / n + 1 / m); df = n + m - 2; }
  const t = d / se, p = 2 * (1 - S.tCdf(Math.abs(t), df)), q = S.tInv(1 - (1 - lvl) / 2, df);
  return { n, m, mx, my, vx, vy, d, sp2, se, df, t, p, q, lo: d - q * se, hi: d + q * se };
}
/* Einfacher Mann-Whitney-P-Wert (Normalapproximation mit Bindungskorrektur, ohne Stetigkeitskorrektur) */
function mwP(x, y) {
  const all = x.map(v => [v, 0]).concat(y.map(v => [v, 1])).sort((a, b) => a[0] - b[0]), N = all.length, rk = new Array(N);
  let tie = 0;
  for (let i = 0; i < N;) { let j = i; while (j + 1 < N && all[j + 1][0] === all[i][0]) j++; const r = (i + j) / 2 + 1, c = j - i + 1; tie += c ** 3 - c; for (let k = i; k <= j; k++) rk[k] = r; i = j + 1; }
  const n = x.length, m = y.length; let R = 0; all.forEach((a, i) => { if (a[1] === 0) R += rk[i]; });
  const U = R - n * (n + 1) / 2, mu = n * m / 2, sg = Math.sqrt(n * m / 12 * ((N + 1) - tie / (N * (N - 1))));
  return { U, p: 2 * (1 - S.Phi(Math.abs(U - mu) / sg)) };
}

/* ---------------------------------------------------------------- 8.1 gepaart vs. ungepaart */
LB.on(function gpViz() {
  if (!document.getElementById('gpPlot')) return;
  let mode = () => 'u';
  const run = () => {
    const tr = [];
    if (mode() === 'u') {
      tr.push({ x: VOR.map(() => 'vorher'), y: VOR, type: 'box', boxpoints: 'all', jitter: 0.4, pointpos: 0, marker: { color: C.par }, line: { color: C.par }, name: 'vorher' });
      tr.push({ x: NACH.map(() => 'nachher'), y: NACH, type: 'box', boxpoints: 'all', jitter: 0.4, pointpos: 0, marker: { color: C.chg }, line: { color: C.chg }, name: 'nachher' });
    } else {
      VOR.forEach((v, i) => tr.push({ x: ['vorher', 'nachher'], y: [v, NACH[i]], mode: 'lines+markers', line: { color: NACH[i] < v ? C.idx : C.res, width: 2 }, marker: { color: [C.par, C.chg], size: 9 }, name: 'Person ' + (i + 1) }));
    }
    LB.plot('gpPlot', tr, { height: 300, showlegend: false, yaxis: { title: 'Messwert' } });
  };
  mode = segBind('gpSeg', run); run();
});

/* ---------------------------------------------------------------- 8.2 Block-Varianz */
LB.on(function blockViz() {
  if (!document.getElementById('blRaw')) return;
  const r = S.rng(81), base = [], e1 = [], e2 = []; for (let i = 0; i < 12; i++) { base.push(r.norm()); e1.push(r.norm() * 0.6); e2.push(r.norm() * 0.6); }
  LB.bind(['blS', 'blE'], v => {
    const a = base.map((b, i) => 20 + v.blS * b + v.blE + e1[i]), b = base.map((bb, i) => 20 + v.blS * bb + e2[i]), u = a.map((x, i) => x - b[i]);
    const tr = a.map((x, i) => ({ x: ['A', 'B'], y: [x, b[i]], mode: 'lines+markers', line: { color: LB.rgba(C.muted, 0.7), width: 1.5 }, marker: { color: [C.par, C.chg], size: 8 } }));
    LB.plot('blRaw', tr, { height: 280, showlegend: false, title: { text: 'Rohwerte (12 Einheiten)', font: { size: 13 } }, yaxis: { title: 'Wert' } });
    LB.plot('blDiff', [{ y: u, x: u.map(() => 'U = A − B'), type: 'box', boxpoints: 'all', pointpos: 0, jitter: 0.4, marker: { color: C.chg }, line: { color: C.chg } },
      { x: ['U = A − B', 'U = A − B'], y: [0, 0], mode: 'markers', marker: { color: C.muted, symbol: 'line-ew-open', size: 40 } }],
      { height: 280, showlegend: false, title: { text: 'Differenzen', font: { size: 13 } } });
    const g = two(a, b, 0.95, false), su = S.sd(u), tp = S.mean(u) / (su / Math.sqrt(12)), pp = 2 * (1 - S.tCdf(Math.abs(tp), 11));
    document.getElementById('blOut').innerHTML = 'ungepaart: \\(S_{\\text{pool}}=' + LB.fmt(Math.sqrt(g.sp2), 3) + '\\), t = ' + LB.fmt(g.t, 3) + ', P = ' + LB.fmt(g.p, 4) + ' · gepaart: \\(s_U=' + LB.fmt(su, 3) + '\\), <b class="kw-res">t = ' + LB.fmt(tp, 3) + ', P = ' + LB.fmt(pp, 4) + '</b>';
    LB.tex(document.getElementById('blOut'));
  });
});

/* ---------------------------------------------------------------- 8.3 Zwei-Stichproben-t live */
LB.on(function tsViz() {
  if (!document.getElementById('tsDens')) return;
  LB.bind(['tsX', 'tsY', 'tsN', 'tsM', 'tsS'], v => {
    const n = v.tsN, m = v.tsM, se = v.tsS * Math.sqrt(1 / n + 1 / m), df = n + m - 2, d = v.tsX - v.tsY, t = d / se, q = S.tInv(0.975, df), p = 2 * (1 - S.tCdf(Math.abs(t), df));
    const f = x => S.tPdf(x, df), R = Math.max(5, Math.abs(t) + 1);
    LB.plot('tsDens', [LB.curve(f, -R, R, C.rule, 300), LB.area(f, q, R, LB.rgba(C.res, 0.5)), LB.area(f, -R, -q, LB.rgba(C.res, 0.5)), { x: [t, t], y: [0, 0.42], mode: 'lines', line: { color: C.idx, width: 3 } }],
      { height: 260, showlegend: false, xaxis: { title: 'T unter H₀ ~ t_' + df }, yaxis: { rangemode: 'tozero' } });
    const lo = d - q * se, hi = d + q * se;
    LB.plot('tsCI', [{ x: [lo, hi], y: [1, 1], mode: 'lines', line: { color: C.res, width: 8 } }, { x: [d], y: [1], mode: 'markers', marker: { color: C.mem, size: 13, symbol: 'diamond' } },
      { x: [0, 0], y: [0.5, 1.5], mode: 'lines', line: { color: C.muted, dash: 'dot', width: 2 } }],
      { height: 220, showlegend: false, xaxis: { title: 'VI für μ_X − μ_Y' }, yaxis: { visible: false, range: [0.4, 1.6] } });
    document.getElementById('tsOut').innerHTML = 'SE = ' + LB.fmt(se, 3) + ' · <b class="kw-res">t = ' + LB.fmt(t, 3) + '</b> (df ' + df + ', Grenze ±' + LB.fmt(q, 3) + ') · P = ' + LB.fmt(p, 4) + ' · VI [' + LB.fmt(lo, 2) + '; ' + LB.fmt(hi, 2) + '] ' +
      (Math.abs(t) >= q ? '→ <b class="bad">H₀ verwerfen</b> (0 ∉ VI)' : '→ <b class="ok">nicht verwerfen</b> (0 ∈ VI)');
  });
});

/* ---------------------------------------------------------------- Werkzeuge */
LB.on(function tools8() {
  if (!document.getElementById('w1A')) return;
  const val = id => S.parse(document.getElementById(id).value);
  const w1 = () => {
    const a = val('w1A'), b = val('w1B'), o = document.getElementById('w1Out');
    if (a.length < 2 || b.length < 2) { o.textContent = 'Je Gruppe mindestens 2 Werte.'; return; }
    LB.plot('w1Box', [{ y: a, type: 'box', name: 'A', boxpoints: 'all', pointpos: 0, jitter: 0.3, marker: { color: C.par }, line: { color: C.par } }, { y: b, type: 'box', name: 'B', boxpoints: 'all', pointpos: 0, jitter: 0.3, marker: { color: C.chg }, line: { color: C.chg } }],
      { height: 280, showlegend: false });
    LB.plot('w1Hist', [{ x: a, type: 'histogram', name: 'A', opacity: 0.6, marker: { color: C.par } }, { x: b, type: 'histogram', name: 'B', opacity: 0.6, marker: { color: C.chg } }], { height: 280, barmode: 'overlay', showlegend: true });
    const row = (nm, x) => '<tr><td>' + nm + '</td><td class="r">' + x.length + '</td><td class="r">' + LB.fmt(S.mean(x), 3) + '</td><td class="r">' + LB.fmt(S.median(x), 3) + '</td><td class="r">' + LB.fmt(S.sd(x), 3) + '</td><td class="r">' + LB.fmt(S.quantile(x, 0.25), 3) + '</td><td class="r">' + LB.fmt(S.quantile(x, 0.75), 3) + '</td></tr>';
    o.innerHTML = '<table class="tbl"><tr><th>Gruppe</th><th class="r">n</th><th class="r">x̄</th><th class="r">Median</th><th class="r">s</th><th class="r">q₀.₂₅</th><th class="r">q₀.₇₅</th></tr>' + row('A', a) + row('B', b) + '</table>';
  };
  const w2 = () => {
    const x = val('w2X'), y = val('w2Y'), o = document.getElementById('w2Out'), lvl = +document.getElementById('w2L').value, W = document.getElementById('w2W').checked;
    document.querySelector('output[for="w2L"]').textContent = LB.fmt(lvl, 2);
    if (x.length < 2 || y.length < 2) { o.textContent = 'Je Gruppe mindestens 2 Werte.'; return; }
    const g = two(x, y, lvl, W), mw = mwP(x, y);
    o.innerHTML = LB.kvHTML([['n, m', g.n + ', ' + g.m, 'idx'], ['x̄ − ȳ', LB.fmt(g.d, 4), 'mem'], [W ? 'SE (Welch)' : 'S²_pool', W ? LB.fmt(g.se, 4) : LB.fmt(g.sp2, 4), 'chg'], ['t', LB.fmt(g.t, 4), 'res'],
      ['df', W ? LB.fmt(g.df, 2) : g.df, 'idx'], ['P-Wert', LB.fmt(g.p, 4), 'res'], ['VI ' + Math.round(lvl * 100) + ' %', '[' + LB.fmt(g.lo, 3) + '; ' + LB.fmt(g.hi, 3) + ']', 'res'], ['Mann-Whitney P ≈', LB.fmt(mw.p, 4), 'rule']]) +
      '<p>' + (g.p <= 1 - lvl ? '<b class="bad">H₀: μ_X = μ_Y verwerfen</b> (0 ∉ VI)' : '<b class="ok">H₀ nicht verwerfen</b> (0 ∈ VI)') + ' · Mann-Whitney hier per Normalapproximation (R/SciPy rechnen bei kleinen n exakt).</p>';
  };
  const w3 = () => {
    const a = val('w3A'), b = val('w3B'), o = document.getElementById('w3Out');
    if (a.length !== b.length || a.length < 2) { o.innerHTML = '<span class="bad">Gepaart braucht gleich viele Werte (≥ 2) in beiden Feldern.</span>'; return; }
    const u = a.map((x, i) => x - b[i]), n = u.length, ub = S.mean(u), su = S.sd(u), t = ub / (su / Math.sqrt(n)), q = S.tInv(0.975, n - 1), p = 2 * (1 - S.tCdf(Math.abs(t), n - 1)), se = su / Math.sqrt(n);
    LB.plot('w3Pairs', a.map((x, i) => ({ x: ['A', 'B'], y: [x, b[i]], mode: 'lines+markers', line: { color: b[i] < x ? C.idx : C.res }, marker: { color: [C.par, C.chg], size: 8 } })), { height: 280, showlegend: false });
    LB.plot('w3Diff', [{ x: u.map((_, i) => i + 1), y: u, type: 'bar', marker: { color: u.map(v => v >= 0 ? C.chg : C.res) } }, { x: [0.5, n + 0.5], y: [ub, ub], mode: 'lines', line: { color: C.mem, dash: 'dash' } }],
      { height: 280, showlegend: false, xaxis: { title: 'Paar i', dtick: 1 }, yaxis: { title: 'uᵢ = aᵢ − bᵢ' } });
    const g = two(a, b, 0.95, false);
    o.innerHTML = LB.kvHTML([['n Paare', n, 'idx'], ['ū', LB.fmt(ub, 4), 'chg'], ['s_U', LB.fmt(su, 4), 'chg'], ['t', LB.fmt(t, 4), 'res'], ['df', n - 1, 'idx'], ['P-Wert', LB.fmt(p, 4), 'res'],
      ['VI 95 %', '[' + LB.fmt(ub - q * se, 3) + '; ' + LB.fmt(ub + q * se, 3) + ']', 'res'], ['ungepaart (falsch) P', LB.fmt(g.p, 4), 'muted']]);
  };
  ['w1A', 'w1B'].forEach(id => document.getElementById(id).addEventListener('input', w1));
  ['w2X', 'w2Y', 'w2L', 'w2W'].forEach(id => document.getElementById(id).addEventListener('input', w2));
  ['w3A', 'w3B'].forEach(id => document.getElementById(id).addEventListener('input', w3));
  w1(); w2(); w3();
});

/* ================================================================ Tracer */
LB.on(function tracers8() {
  const f = (v, k) => v === null ? '–' : LB.fmt(v, k || 4);
  new LB.Tracer({
    id: 'trGp', title: 'gepaarter t-Test: Differenzen → Ein-Stichproben-t', langs: CODE('k8_gepaart'), input: VOR.join(' ') + ' ; ' + NACH.join(' '), hint: 'Werte A ; Werte B (gleich viele)',
    examples: [['vorher/nachher', VOR.join(' ') + ' ; ' + NACH.join(' ')], ['kein Effekt', '10 12 9 11 13 ; 10.2 11.7 9.3 10.8 13.1'], ['Laborvergleich', '31.2 28.4 30.1 29.8 32.5 27.9 30.6 ; 29.1 27.6 28.0 29.9 30.2 26.8 28.1']],
    parse: s => { const p = s.split(';'); if (p.length !== 2) throw new Error('Format: A-Werte ; B-Werte'); const a = S.parse(p[0]), b = S.parse(p[1]);
      if (a.length !== b.length || a.length < 2) throw new Error('gleich viele Werte (≥ 2) nötig'); return { a, b }; },
    codeFor: (d, L, lines) => lines.map(l => /#@a\s*$/.test(l) ? (L === 'R' ? 'vorher <- c(' + d.a.join(', ') + ')' : 'vorher = np.array([' + d.a.join(', ') + '])') + '   # Bedingung A #@a' :
      /#@b\s*$/.test(l) ? (L === 'R' ? 'nachher <- c(' + d.b.join(', ') + ')' : 'nachher = np.array([' + d.b.join(', ') + '])') + '   # Bedingung B #@b' : l),
    run(rec, d) {
      const v = { u: [], n: null, ub: null, su: null, t: null, k: null, p: null }; const st = () => Object.assign({}, v, { u: v.u.slice() });
      rec.step('a', 'Bedingung A: ' + d.a.length + ' Werte.', st());
      rec.step('b', 'Bedingung B an denselben Einheiten.', st());
      v.u = d.a.map((x, i) => Math.round((x - d.b[i]) * 1e10) / 1e10); rec.step('u', 'Differenzen \\(\\Chg{u_i}=a_i-b_i\\): ' + v.u.map(x => LB.fmt(x, 3)).join(', '), st());
      v.n = v.u.length; rec.step('n', 'n = ' + v.n + ' Paare → df = ' + (v.n - 1) + '.', st());
      v.ub = S.mean(v.u); v.su = S.sd(v.u); rec.step('ms', '\\(\\bar u=' + LB.fmt(v.ub, 4) + '\\), \\(s_U=' + LB.fmt(v.su, 4) + '\\)', st());
      v.t = v.ub / (v.su / Math.sqrt(v.n)); rec.step('t', '\\(\\Res{t}=\\tfrac{' + LB.fmt(v.ub, 4) + '}{' + LB.fmt(v.su, 4) + '/\\sqrt{' + v.n + '}}=\\Res{' + LB.fmt(v.t, 4) + '}\\)', st());
      v.k = S.tInv(0.975, v.n - 1); rec.step('krit', '\\(t_{' + (v.n - 1) + ',0.975}=' + LB.fmt(v.k, 4) + '\\)', st());
      v.p = 2 * (1 - S.tCdf(Math.abs(v.t), v.n - 1)); rec.step('p', 'P-Wert = ' + LB.fmt(v.p, 4), st());
      rec.step('out', Math.abs(v.t) >= v.k ? '<b class="bad">|t| ≥ Grenze → H₀: E[U] = 0 verwerfen</b>' : '<b class="ok">|t| &lt; Grenze → H₀ nicht verwerfen</b>', st());
    },
    view: s => (s.u.length ? '<div class="cells">' + s.u.map(x => '<span class="kw-chg">' + LB.fmt(x, 3) + '</span>').join(' · ') + '</div>' : '') +
      LB.kvHTML([['n', s.n === null ? '–' : s.n, 'idx'], ['ū', f(s.ub), 'chg'], ['s_U', f(s.su), 'chg'], ['t', f(s.t), 'res'], ['krit', f(s.k), 'rule'], ['P-Wert', f(s.p), 'res']])
  });

  new LB.Tracer({
    id: 'trZs', title: 'Zwei-Stichproben-t-Test mit gepoolter Varianz', langs: CODE('k8_zweistich'), input: '402 415 388 397 410 385 399 421 393 379 ; 378 395 362 388 401 370 383 359', hint: 'Gruppe X ; Gruppe Y',
    examples: [['Produktionslinien', '402 415 388 397 410 385 399 421 393 379 ; 378 395 362 388 401 370 383 359'], ['vorher/nachher ungepaart (falsch!)', VOR.join(' ') + ' ; ' + NACH.join(' ')], ['kein Unterschied', '20 22 19 21 23 20 ; 21 20 22 19 21']],
    parse: s => { const p = s.split(';'); if (p.length !== 2) throw new Error('Format: X-Werte ; Y-Werte'); const x = S.parse(p[0]), y = S.parse(p[1]);
      if (x.length < 2 || y.length < 2) throw new Error('je Gruppe mindestens 2 Werte'); return { x, y }; },
    codeFor: (d, L, lines) => lines.map(l => /#@x\s*$/.test(l) ? (L === 'R' ? 'x <- c(' + d.x.join(', ') + ')' : 'x = np.array([' + d.x.join(', ') + '])') + '   # Gruppe X #@x' :
      /#@y\s*$/.test(l) ? (L === 'R' ? 'y <- c(' + d.y.join(', ') + ')' : 'y = np.array([' + d.y.join(', ') + '])') + '   # Gruppe Y #@y' : l),
    run(rec, d) {
      const v = { n: null, m: null, sp2: null, se: null, t: null, df: null, p: null, lo: null, hi: null }; const st = () => Object.assign({}, v);
      rec.step('x', 'Gruppe X: ' + d.x.length + ' Werte, \\(\\bar x=' + LB.fmt(S.mean(d.x), 4) + '\\), \\(s_X=' + LB.fmt(S.sd(d.x), 4) + '\\)', st());
      rec.step('y', 'Gruppe Y: ' + d.y.length + ' Werte, \\(\\bar y=' + LB.fmt(S.mean(d.y), 4) + '\\), \\(s_Y=' + LB.fmt(S.sd(d.y), 4) + '\\)', st());
      const g = two(d.x, d.y, 0.95, false);
      v.n = g.n; v.m = g.m; rec.step('nm', 'n = ' + g.n + ', m = ' + g.m + '.', st());
      v.sp2 = g.sp2; rec.step('sp', '\\(\\Chg{S^2_{\\text{pool}}}=\\tfrac{' + (g.n - 1) + '\\cdot' + LB.fmt(g.vx, 3) + '+' + (g.m - 1) + '\\cdot' + LB.fmt(g.vy, 3) + '}{' + g.df + '}=' + LB.fmt(g.sp2, 4) + '\\)', st());
      v.se = g.se; rec.step('se', '\\(\\operatorname{SE}=S_{\\text{pool}}\\sqrt{1/n+1/m}=' + LB.fmt(g.se, 4) + '\\)', st());
      v.t = g.t; rec.step('t', '\\(\\Res{t}=\\tfrac{' + LB.fmt(g.d, 4) + '}{' + LB.fmt(g.se, 4) + '}=\\Res{' + LB.fmt(g.t, 4) + '}\\)', st());
      v.df = g.df; rec.step('df', 'df = n + m − 2 = ' + g.df + ', Grenze \\(t_{' + g.df + ',0.975}=' + LB.fmt(g.q, 4) + '\\)', st());
      v.p = g.p; rec.step('p', 'P-Wert = ' + LB.fmt(g.p, 4), st());
      v.lo = g.lo; v.hi = g.hi; rec.step('vi', '95-%-VI für \\(\\mu_X-\\mu_Y\\): [' + LB.fmt(g.lo, 3) + '; ' + LB.fmt(g.hi, 3) + ']', st());
      rec.step('out', Math.abs(g.t) >= g.q ? '<b class="bad">|t| ≥ Grenze → H₀: μ_X = μ_Y verwerfen</b>' : '<b class="ok">|t| &lt; Grenze → H₀ nicht verwerfen</b>', st());
    },
    view: s => LB.kvHTML([['n, m', s.n === null ? '–' : s.n + ', ' + s.m, 'idx'], ['S²_pool', f(s.sp2), 'chg'], ['SE', f(s.se), 'rule'], ['t', f(s.t), 'res'], ['df', s.df === null ? '–' : s.df, 'idx'], ['P-Wert', f(s.p), 'res'],
      ['VI', s.lo === null ? '–' : '[' + LB.fmt(s.lo, 3) + '; ' + LB.fmt(s.hi, 3) + ']', 'res']])
  });
});

/* ---------------------------------------------------------------- Training */
LB.on(function train8() {
  if (!document.getElementById('q8Task')) return;
  const r = S.rng(Date.now() % 8888); let cur; const pick = a => a[Math.floor(r() * a.length)];
  const neu = () => {
    if (r() < 0.5) {
      const n = pick([6, 8, 10, 12]), ub = pick([0.4, 0.8, 1.2, 2.5]), su = pick([0.9, 1.5, 2.0]);
      cur = { t: ub / (su / Math.sqrt(n)), df: n - 1 };
      document.getElementById('q8Task').innerHTML = '<b>Gepaart:</b> n = ' + n + ' Paare, mittlere Differenz \\(\\bar u=' + ub + '\\), \\(s_U=' + su + '\\). Teste \\(H_0:\\EE[U]=0\\).';
    } else {
      const n = pick([8, 10, 12, 15]), m = pick([7, 9, 12, 14]), xb = pick([50, 52.4, 61.3]), d = pick([1.5, 3, 4.2, 6]), sx = pick([3, 4.5, 6]), sy = pick([3.5, 5, 6.5]);
      const sp = Math.sqrt(((n - 1) * sx * sx + (m - 1) * sy * sy) / (n + m - 2));
      cur = { t: d / (sp * Math.sqrt(1 / n + 1 / m)), df: n + m - 2 };
      document.getElementById('q8Task').innerHTML = '<b>Ungepaart:</b> n = ' + n + ', \\(\\bar x=' + xb + '\\), \\(s_X=' + sx + '\\); m = ' + m + ', \\(\\bar y=' + LB.fmt(xb - d, 2) + '\\), \\(s_Y=' + sy + '\\). Zwei-Stichproben-t-Test (gleiche Varianz).';
    }
    LB.tex(document.getElementById('q8Task'));
    ['q8t', 'q8d'].forEach(id => document.getElementById(id).value = ''); document.getElementById('q8Res').innerHTML = '';
  };
  document.getElementById('q8New').addEventListener('click', neu);
  document.getElementById('q8Chk').addEventListener('click', () => {
    const a = parseFloat(document.getElementById('q8t').value.replace(',', '.')), b = parseFloat(document.getElementById('q8d').value);
    const p = 2 * (1 - S.tCdf(Math.abs(cur.t), cur.df));
    document.getElementById('q8Res').innerHTML = (Math.abs(a - cur.t) < 0.01 ? '<span class="ok">✔ ' : '<span class="bad">✗ ') + 't = ' + LB.fmt(cur.t, 4) + '</span> · ' + (b === cur.df ? '<span class="ok">✔ ' : '<span class="bad">✗ ') + 'df = ' + cur.df + '</span> · P = ' + LB.fmt(p, 4) + ' → bei α = 0.05 ' + (p <= 0.05 ? 'verwerfen' : 'nicht verwerfen');
  });
  neu();
});
