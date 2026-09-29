/* Kapitel 6 · Parameterschätzungen: Visuals, Tracer, Training */
LB.KW = [
  ['Schätzer', 'chg'], ['Schätzung', 'chg'], ['Punktschätzung', 'chg'], ['Daten', 'mem'], ['Realisierungen', 'mem'],
  ['Momentenmethode', 'rule'], ['Maximum-Likelihood', 'rule'], ['Likelihood', 'rule'], ['Erwartungstreue', 'rule'], ['erwartungstreu', 'rule'],
  ['Normalplot', 'rule'], ['QQ-Plot', 'rule'], ['konsistent', 'rule'], ['Standardfehler', 'res'], ['Vertrauensintervall', 'res'],
  ['wahre Wert', 'par'], ['wahren Wert', 'par'], ['Parameter', 'par'], ['Test', 'cond']
];
const S = LB.S, C = LB.C;

/* ---------------------------------------------------------------- Normalplot */
LB.on(function qq() {
  if (!document.getElementById('qqPlot')) return;
  let dist = 'norm', seed = 3;
  const gen = { norm: r => 10 + 2 * r.norm(), skew: r => -Math.log(1 - r()) * 3, heavy: r => { const z = r.norm(), c = r.norm(), q = r.norm(), w = r.norm(); return 10 + 2 * z / Math.sqrt((c * c + q * q + w * w) / 3); }, unif: r => 10 * r() };
  const draw = () => {
    const n = +document.getElementById('qqN').value, r = S.rng(seed), x = []; for (let i = 0; i < n; i++) x.push(gen[dist](r));
    document.querySelector('output[for="qqN"]').textContent = n;
    const s = S.sorted(x), z = s.map((_, k) => S.PhiInv((k + 0.5) / n));
    const q1 = S.quantile(x, 0.25), q3 = S.quantile(x, 0.75), z1 = S.PhiInv(0.25), z3 = S.PhiInv(0.75), b = (q3 - q1) / (z3 - z1), a = q1 - b * z1;
    LB.plot('qqPlot', [{ x: z, y: s, mode: 'markers', marker: { color: C.mem, size: 6 } }, { x: [-3, 3], y: [a - 3 * b, a + 3 * b], mode: 'lines', line: { color: C.chg, width: 2 } }],
      { height: 300, xaxis: { title: 'theoretische Quantile z', range: [-3, 3] }, yaxis: { title: 'geordnete Daten x₍ₖ₎' } });
    LB.plot('qqHist', [{ type: 'histogram', x, nbinsx: 25, marker: { color: LB.rgba(C.rule, 0.6) } }], { height: 300, xaxis: { title: 'Daten' } });
    LB.$$('#qqSeg .btn').forEach(bb => bb.classList.toggle('on', bb.dataset.d === dist));
  };
  document.getElementById('qqSeg').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (b) { dist = b.dataset.d; draw(); } });
  document.getElementById('qqN').addEventListener('input', draw);
  document.getElementById('qqNew').addEventListener('click', () => { seed++; draw(); });
  draw();
});

/* ---------------------------------------------------------------- Likelihood */
LB.on(function mlViz() {
  if (!document.getElementById('mlCurve')) return;
  LB.bind(['mlL', 'mlD'], v => {
    const x = S.parse(v.mlD).map(Math.round).filter(k => k >= 0), lam = v.mlL;
    if (!x.length) { document.getElementById('mlOut').textContent = 'Bitte nicht-negative ganze Zahlen eingeben.'; return; }
    const ll = l => S.sum(x.map(k => k * Math.log(l) - l - S.lgamma(k + 1))), xb = S.mean(x), top = Math.max(...x) + 2, ks = [];
    for (let k = 0; k <= top; k++) ks.push(k);
    LB.plot('mlBar', [{ type: 'bar', x: ks, y: ks.map(k => x.filter(q => q === k).length / x.length), name: 'Daten', marker: { color: LB.rgba(C.mem, 0.6) } },
      { x: ks, y: ks.map(k => S.poisPmf(k, lam)), mode: 'markers+lines', name: 'Pois(λ)', line: { color: C.par } }],
      { height: 280, showlegend: true, xaxis: { title: 'x' }, yaxis: { title: 'Anteil / W\'keit' } });
    const ls = []; for (let i = 1; i <= 240; i++) ls.push(0.05 * i);
    LB.plot('mlCurve', [{ x: ls, y: ls.map(ll), mode: 'lines', line: { color: C.rule, width: 2.5 } }, { x: [lam], y: [ll(lam)], mode: 'markers', marker: { color: C.chg, size: 12 } },
      { x: [xb], y: [ll(xb)], mode: 'markers', marker: { color: C.res, size: 12, symbol: 'star' } }],
      { height: 280, xaxis: { title: 'λ', range: [0, 12] }, yaxis: { title: 'ℓ(λ)', range: [ll(xb) - 25, ll(xb) + 2] } });
    const o = document.getElementById('mlOut');
    o.innerHTML = '\\(\\ell(' + LB.fmt(lam, 2) + ')=' + LB.fmt(ll(lam), 3) + '\\) · Maximum (Stern) bei \\(\\Chg{\\hat\\lambda}=\\bar x=\\Res{' + LB.fmt(xb, 4) + '}\\) mit \\(\\ell=' + LB.fmt(ll(xb), 3) + '\\)';
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- n vs n-1 */
LB.on(function bias() {
  if (!document.getElementById('bsPlot')) return;
  let den = 'n1';
  const draw = () => {
    const n = +document.getElementById('bsN').value, r = S.rng(99), est = [];
    document.querySelector('output[for="bsN"]').textContent = n;
    for (let k = 0; k < 4000; k++) { const x = []; for (let i = 0; i < n; i++) x.push(r.norm()); const m = S.mean(x); const q = S.sum(x.map(v => (v - m) ** 2)); est.push(q / (den === 'n' ? n : n - 1)); }
    const me = S.mean(est);
    LB.plot('bsPlot', [{ type: 'histogram', x: est, nbinsx: 60, marker: { color: LB.rgba(den === 'n' ? C.chg : C.idx, 0.6) } }],
      { height: 280, xaxis: { title: 'Varianz-Schätzung', range: [0, 4] }, shapes: [{ type: 'line', x0: 1, x1: 1, yref: 'paper', y0: 0, y1: 1, line: { color: C.par, dash: 'dash', width: 2 } }, { type: 'line', x0: me, x1: me, yref: 'paper', y0: 0, y1: 1, line: { color: C.res, width: 3 } }] });
    const o = document.getElementById('bsOut');
    o.innerHTML = 'Mittel der 4000 Schätzungen = <b class="kw-res">' + LB.fmt(me, 4) + '</b> (wahr: 1; Theorie mit Nenner n: (n−1)/n = ' + LB.fmt((n - 1) / n, 4) + ')';
    LB.$$('#bsSeg .btn').forEach(b => b.classList.toggle('on', b.dataset.d === den));
  };
  document.getElementById('bsSeg').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (b) { den = b.dataset.d; draw(); } });
  document.getElementById('bsN').addEventListener('input', draw); draw();
});

/* ---------------------------------------------------------------- CI-Wand */
LB.on(function ciWall() {
  if (!document.getElementById('ciPlot')) return;
  let seed = 5;
  const run = LB.bind(['ciL', 'ciN'], v => {
    const lvl = v.ciL, n = v.ciN, z = S.PhiInv(1 - (1 - lvl) / 2), se = 1 / Math.sqrt(n), r = S.rng(seed);
    const hx = [], hy = [], mx = [], my = []; let hit = 0;
    for (let k = 1; k <= 100; k++) { let s = 0; for (let i = 0; i < n; i++) s += r.norm(); const m = s / n, lo = m - z * se, hi = m + z * se, ok = lo <= 0 && hi >= 0;
      if (ok) { hit++; hx.push(lo, hi, null); hy.push(k, k, null); } else { mx.push(lo, hi, null); my.push(k, k, null); } }
    LB.plot('ciPlot', [{ x: hx, y: hy, mode: 'lines', line: { color: C.idx, width: 2 }, hoverinfo: 'skip' }, { x: mx, y: my, mode: 'lines', line: { color: C.res, width: 3 }, hoverinfo: 'skip' }],
      { height: 460, xaxis: { range: [-1.5, 1.5], title: 'Intervall für μ' }, yaxis: { title: 'Stichprobe Nr.', range: [0, 101] }, shapes: [{ type: 'line', x0: 0, x1: 0, y0: 0, y1: 101, line: { color: C.par, dash: 'dash', width: 2 } }] });
    document.getElementById('ciOut').innerHTML = hit + ' von 100 Intervallen treffen μ = 0 (Soll ≈ ' + Math.round(100 * lvl) + ') · z = ' + LB.fmt(z, 3) + ' · Breite = ' + LB.fmt(2 * z * se, 3);
  });
  document.getElementById('ciNew').addEventListener('click', () => { seed++; run(); });
});

/* ================================================================ Tracer */
LB.on(function tracers6() {
  new LB.Tracer({
    id: 'trMl', title: 'log-Likelihood auf einem Gitter maximieren', langs: CODE('k6_ml'), input: '2 3 1 4 0', hint: 'Poisson-Daten (ganze Zahlen ≥ 0)',
    examples: [['Grundlage', '2 3 1 4 0'], ['seltene Ereignisse', '0 1 0 0 2 1 0'], ['viele Ereignisse', '3 4 2 5 3 4']],
    parse: s => { const x = S.parse(s); if (!x.length || x.some(v => v < 0 || v !== Math.round(v))) throw new Error('nicht-negative ganze Zahlen'); return x; },
    codeFor: (x, L, lines) => lines.map(l => /#@data\s*$/.test(l) ? (L === 'R' ? 'x <- c(' + x.join(', ') + ')' : 'x = np.array([' + x.join(', ') + '])') + '   # Daten #@data' : l),
    run(rec, x) {
      const grid = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4], rows = []; let best = null, bestL = -Infinity, cur = null;
      const st = () => ({ rows: rows.slice(), best, bestL, cur });
      rec.step('data', 'n = ' + x.length + ', Summe = ' + S.sum(x) + '.', st());
      rec.step('grid', 'Kandidaten λ = 0.5 bis 4 in Schritten von 0.5.', st());
      rec.step('init', 'Noch kein Bester.', st());
      grid.forEach(l => {
        cur = l; rec.step('loop', '\\(\\lambda=' + l + '\\).', st());
        const ll = S.sum(x.map(k => k * Math.log(l) - l - S.lgamma(k + 1))); rows.push([l, ll]);
        rec.step('ll', '\\(\\ell(' + l + ')=' + S.sum(x) + '\\log' + l + '-' + x.length + '\\cdot' + l + '-\\text{const}=' + LB.fmt(ll, 4) + '\\)', st());
        if (ll > bestL) { bestL = ll; best = l; rec.step('max', 'neuer Bestwert bei λ = ' + l + '.', st()); } else rec.step('max', 'kleiner als bei λ = ' + best + ' → nichts tun.', st());
      });
      cur = null;
      rec.step('out', 'Gitter-Maximum \\(\\lambda=' + best + '\\); exakt \\(\\Chg{\\hat\\lambda}=\\bar x=\\Res{' + LB.fmt(S.mean(x), 4) + '}\\)', st());
    },
    view: s => '<table class="tbl"><tr><th>λ</th><th class="r">ℓ(λ)</th></tr>' + s.rows.map(r => '<tr' + (r[0] === s.best ? ' style="outline:1px solid var(--idx)"' : '') + '><td class="kw-par">' + r[0] + '</td><td class="r">' + LB.fmt(r[1], 4) + '</td></tr>').join('') + '</table>' +
      LB.kvHTML([['aktuelles λ', s.cur === null ? '–' : s.cur, 'par'], ['bestes λ', s.best === null ? '–' : s.best, 'res'], ['bestes ℓ', s.best === null ? '–' : LB.fmt(s.bestL, 4), 'res']])
  });

  new LB.Tracer({
    id: 'trVi', title: 'Standardfehler und Vertrauensintervall', langs: CODE('k6_vi'), input: '21.3 4 16 0.95', hint: 'x̄ σ n Niveau',
    examples: [['Messungen', '21.3 4 16 0.95'], ['99 %', '21.3 4 16 0.99'], ['Grundlage n = 100', '50 10 100 0.95'], ['Grundlage n = 64', '100 16 64 0.95']],
    parse: s => { const v = S.parse(s); if (v.length !== 4 || v[1] <= 0 || v[2] < 1 || v[3] <= 0 || v[3] >= 1) throw new Error('Format: x̄ σ n Niveau (0 < Niveau < 1)'); return { m: v[0], s: v[1], n: Math.round(v[2]), l: v[3] }; },
    codeFor: (d, L, lines) => lines.map(l => /#@par\s*$/.test(l) ? (L === 'R' ? 'xbar <- ' + d.m + '; sigma <- ' + d.s + '; n <- ' + d.n : 'xbar, sigma, n = ' + d.m + ', ' + d.s + ', ' + d.n) + '   # Mittel, sigma, Umfang #@par' :
      /#@alpha\s*$/.test(l) ? (L === 'R' ? 'alpha <- ' : 'alpha = ') + LB.fmt(1 - d.l, 4) + '   # 1 - Niveau #@alpha' : l),
    run(rec, d) {
      const v = { se: null, z: null, lo: null, hi: null, nn: null }; const st = () => Object.assign({ d }, v);
      rec.step('par', '\\(\\bar x=' + d.m + ',\\ \\sigma=' + d.s + ',\\ n=' + d.n + '\\)', st());
      rec.step('alpha', '\\(\\alpha=1-' + d.l + '=' + LB.fmt(1 - d.l, 4) + '\\)', st());
      v.se = d.s / Math.sqrt(d.n); rec.step('se', '\\(\\operatorname{SE}=\\tfrac{' + d.s + '}{\\sqrt{' + d.n + '}}=' + LB.fmt(v.se, 4) + '\\)', st());
      v.z = S.PhiInv(1 - (1 - d.l) / 2); rec.step('z', '\\(z_{' + LB.fmt(1 - (1 - d.l) / 2, 4) + '}=' + LB.fmt(v.z, 4) + '\\)', st());
      v.lo = d.m - v.z * v.se; v.hi = d.m + v.z * v.se; rec.step('ci', '\\(\\Res{I}=' + d.m + '\\pm' + LB.fmt(v.z, 3) + '\\cdot' + LB.fmt(v.se, 4) + '=\\Res{[' + LB.fmt(v.lo, 3) + ';\\ ' + LB.fmt(v.hi, 3) + ']}\\)', st());
      rec.step('out', 'Ausgabe von SE und Intervall.', st());
      v.nn = Math.ceil((v.z * d.s / 0.5) ** 2); rec.step('n', 'Für halbe Breite 0.5 bräuchte man \\(n\\ge(' + LB.fmt(v.z, 3) + '\\cdot' + d.s + '/0.5)^2\\), also \\(n=' + v.nn + '\\).', st());
    },
    view: s => LB.kvHTML([['SE', s.se === null ? '–' : LB.fmt(s.se, 4), 'rule'], ['z', s.z === null ? '–' : LB.fmt(s.z, 4), 'chg'], ['untere Grenze', s.lo === null ? '–' : LB.fmt(s.lo, 3), 'res'], ['obere Grenze', s.hi === null ? '–' : LB.fmt(s.hi, 3), 'res'], ['n für ±0.5', s.nn === null ? '–' : s.nn, 'par']])
  });
});

/* ---------------------------------------------------------------- Training */
LB.on(function train6() {
  if (!document.getElementById('q6Task')) return;
  const r = S.rng(Date.now() % 12345); let cur; const pick = a => a[Math.floor(r() * a.length)];
  const tasks = [
    () => { const x = [0, 1, 2, 3].map(() => Math.floor(r() * 6)).concat([Math.floor(r() * 6)]); return { t: 'Poisson-Daten ' + x.join(', ') + '. ML-Schätzer für λ?', a: S.mean(x), s: 'λ̂ = x̄' }; },
    () => { const t = [0, 1, 2, 3].map(() => Math.round((0.5 + 8 * r()) * 10) / 10); return { t: 'Lebensdauern ' + t.join(', ') + ', Modell Exp(λ). ML-Schätzer für λ?', a: 1 / S.mean(t), s: 'λ̂ = 1/t̄ = 1/' + LB.fmt(S.mean(t), 4) }; },
    () => { const m = pick([48.2, 101.5, 7.3]), s = pick([2, 5, 12]), n = pick([16, 25, 36, 100]); return { t: 'x̄ = ' + m + ', σ = ' + s + ' bekannt, n = ' + n + '. <b>Obere</b> Grenze des 95-%-Vertrauensintervalls?', a: m + 1.959964 * s / Math.sqrt(n), s: 'x̄ + 1.96·σ/√n' }; },
    () => { const x = [0, 1, 2, 3].map(() => 1 + Math.floor(r() * 9)); return { t: 'Daten ' + x.join(', ') + '. Varianz-Schätzwert mit Nenner n (Momentenmethode)?', a: S.var(x) * (x.length - 1) / x.length, s: '(1/n)Σ(xᵢ−x̄)²; erwartungstreu wäre s² = ' + LB.fmt(S.var(x), 4) }; }
  ];
  const neu = () => { cur = pick(tasks)(); document.getElementById('q6Task').innerHTML = cur.t + ' (4 Nachkommastellen)'; document.getElementById('q6In').value = ''; document.getElementById('q6Res').innerHTML = ''; };
  document.getElementById('q6New').addEventListener('click', neu);
  document.getElementById('q6Chk').addEventListener('click', () => { const v = parseFloat(document.getElementById('q6In').value.replace(',', '.'));
    document.getElementById('q6Res').innerHTML = (Math.abs(v - cur.a) < 6e-4 ? '<b class="ok">✔ richtig.</b> ' : '<b class="bad">✗ noch nicht.</b> ') + 'Lösung: <b class="kw-res">' + LB.fmt(cur.a, 4) + '</b> · ' + cur.s; });
  neu();
});
