/* Kapitel 5 · Grenzwertsätze: Visuals, Tracer, Training */
LB.KW = [
  ['i.i.d.', 'rule'], ['Gesetz der großen Zahlen', 'rule'], ['Grenzwertsatz', 'rule'], ['Tschebyschow', 'rule'], ['Normalapproximation', 'chg'],
  ['Stetigkeitskorrektur', 'chg'], ['standardisieren', 'chg'], ['unabhängig', 'rule'], ['identisch verteilt', 'rule'],
  ['Summe', 'mem'], ['Mittel', 'mem'], ['Wiederholungen', 'mem'], ['Standardfehler', 'res'], ['Schätzer', 'chg']
];
const S = LB.S, C = LB.C;

/* ---------------------------------------------------------------- √n */
LB.on(function sqrtn() {
  if (!document.getElementById('snPlot')) return;
  const sig = Math.sqrt(35 / 12), ns = [], ss = []; for (let n = 1; n <= 400; n++) { ns.push(n); ss.push(sig / Math.sqrt(n)); }
  LB.bind(['snN'], v => {
    const n = v.snN, s = sig / Math.sqrt(n);
    LB.plot('snPlot', [LB.curve(x => S.normPdf(x, 3.5, s), 1, 6, C.rule, 400), LB.area(x => S.normPdf(x, 3.5, s), 3.5 - s, 3.5 + s, LB.rgba(C.par, 0.3))],
      { height: 280, xaxis: { range: [1, 6], title: 'Mittel von n Würfen · σ_X̄ = ' + LB.fmt(s, 4) }, yaxis: { rangemode: 'tozero' } });
    LB.plot('snCurve', [{ x: ns, y: ss, mode: 'lines', line: { color: C.chg, width: 2.5 } }, { x: [n], y: [s], mode: 'markers', marker: { color: C.res, size: 12 } }],
      { height: 280, xaxis: { title: 'n', type: 'log' }, yaxis: { title: 'σ/√n', rangemode: 'tozero' } });
  });
});

/* ---------------------------------------------------------------- GGZ */
LB.on(function ggz() {
  if (!document.getElementById('ggPlot')) return;
  let seed = 1;
  const run = LB.bind(['ggN'], v => {
    const N = v.ggN, cols = [C.mem, C.par, C.idx, C.chg, C.cond], tr = [];
    for (let k = 0; k < 5; k++) { const r = S.rng(seed * 10 + k); let s = 0; const ys = [];
      for (let i = 1; i <= N; i++) { s += 1 + Math.floor(r() * 6); ys.push(s / i); } tr.push({ y: ys, mode: 'lines', line: { color: cols[k], width: 1.4 }, hoverinfo: 'skip' }); }
    const xs = [], up = [], lo = []; const sg = Math.sqrt(35 / 12); for (let i = 1; i <= N; i++) { xs.push(i); up.push(3.5 + 2 * sg / Math.sqrt(i)); lo.push(3.5 - 2 * sg / Math.sqrt(i)); }
    tr.forEach(t => t.x = xs);
    tr.push({ x: xs, y: up, mode: 'lines', line: { color: C.muted, dash: 'dot' } }, { x: xs, y: lo, mode: 'lines', line: { color: C.muted, dash: 'dot' } }, { x: [1, N], y: [3.5, 3.5], mode: 'lines', line: { color: C.res, width: 2.5 } });
    LB.plot('ggPlot', tr, { height: 320, xaxis: { title: 'Anzahl Würfe n', type: 'log' }, yaxis: { title: 'laufendes Mittel', range: [1, 6] } });
  });
  document.getElementById('ggNew').addEventListener('click', () => { seed++; run(); });
});

/* ---------------------------------------------------------------- ZGS wächst */
LB.on(function zgs() {
  if (!document.getElementById('zgPlot')) return;
  const D = { uni: { g: r => r(), m: 0.5, v: 1 / 12, lo: 0, hi: 1 }, bern: { g: r => r() < 0.2 ? 1 : 0, m: 0.2, v: 0.16, lo: 0, hi: 1 },
    exp: { g: r => -Math.log(1 - r()), m: 1, v: 1, lo: 0, hi: 4 }, die: { g: r => 1 + Math.floor(r() * 6), m: 3.5, v: 35 / 12, lo: 1, hi: 6 } };
  let cur = 'uni';
  const draw = () => {
    const n = +document.getElementById('zgN').value, d = D[cur], r = S.rng(77), M = 4000, mean = [];
    document.querySelector('output[for="zgN"]').textContent = n;
    for (let k = 0; k < M; k++) { let s = 0; for (let i = 0; i < n; i++) s += d.g(r); mean.push(s / n); }
    const sd = Math.sqrt(d.v / n), lo = Math.min(d.lo, d.m - 4 * sd), hi = Math.max(d.hi, d.m + 4 * sd);
    LB.plot('zgPlot', [{ type: 'histogram', x: mean, histnorm: 'probability density', nbinsx: cur === 'bern' || cur === 'die' ? Math.min(80, n * (cur === 'die' ? 5 : 1) + 1) : 50, marker: { color: LB.rgba(C.mem, 0.6) } },
      LB.curve(x => S.normPdf(x, d.m, sd), lo, hi, C.rule, 300)], { height: 320, xaxis: { range: [lo, hi], title: 'Mittel von n Summanden' }, yaxis: { title: 'Dichte' } });
    LB.$$('#zgSeg .btn').forEach(b => b.classList.toggle('on', b.dataset.d === cur));
  };
  document.getElementById('zgSeg').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (b) { cur = b.dataset.d; draw(); } });
  document.getElementById('zgN').addEventListener('input', draw); draw();
});

/* ---------------------------------------------------------------- Normalapprox */
LB.on(function napprox() {
  if (!document.getElementById('naPlot')) return;
  LB.bind(['naN', 'naP', 'naX'], v => {
    const n = v.naN, p = v.naP, x = Math.min(v.naX, n), mu = n * p, sd = Math.sqrt(n * p * (1 - p)), xs = [];
    for (let k = 0; k <= n; k++) xs.push(k);
    LB.plot('naPlot', [{ type: 'bar', x: xs, y: xs.map(k => S.binomPmf(k, n, p)), marker: { color: xs.map(k => k <= x ? C.par : LB.rgba(C.par, 0.35)) } },
      LB.curve(t => S.normPdf(t, mu, sd), Math.max(-1, mu - 5 * sd), Math.min(n + 1, mu + 5 * sd), C.rule, 300)],
      { height: 300, xaxis: { range: [Math.max(-1, mu - 5 * sd), Math.min(n + 1, mu + 5 * sd)] } });
    const o = document.getElementById('naOut');
    o.innerHTML = '\\(\\mu=' + LB.fmt(mu, 2) + ',\\ \\sigma=' + LB.fmt(sd, 3) + '\\) · exakt \\(\\PP(X\\le' + x + ')=\\Res{' + LB.fmt(S.binomCdf(x, n, p), 4) + '}\\) · ZGS \\(\\Phi(' + LB.fmt((x - mu) / sd, 3) + ')=' + LB.fmt(S.Phi((x - mu) / sd), 4) + '\\) · mit Korrektur \\(\\Phi(' + LB.fmt((x + 0.5 - mu) / sd, 3) + ')=' + LB.fmt(S.Phi((x + 0.5 - mu) / sd), 4) + '\\) · \\(np(1-p)=' + LB.fmt(n * p * (1 - p), 1) + '\\)';
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- Tracer */
LB.on(function tracer5() {
  new LB.Tracer({
    id: 'trNa', title: 'Normalapproximation Schritt für Schritt', langs: CODE('k5_normapprox'),
    input: '100 0.3 25', hint: 'n p x (gesucht P(X ≤ x))',
    examples: [['Bin(100, 0.3), x = 25', '100 0.3 25'], ['Grundlage Bin(100, 0.5), x = 55', '100 0.5 55'], ['1000 Münzwürfe, x = 530', '1000 0.5 530'], ['kleines n: Bin(10, 0.1), x = 1', '10 0.1 1']],
    parse: s => { const v = S.parse(s); if (v.length !== 3) throw new Error('Format: n p x'); const [n, p, x] = v; if (n < 1 || n > 5000 || p <= 0 || p >= 1 || x < 0 || x > n) throw new Error('1 ≤ n ≤ 5000, 0 < p < 1, 0 ≤ x ≤ n'); return { n: Math.round(n), p, x: Math.round(x) }; },
    codeFor: (d, L, lines) => lines.map(l => /#@par\s*$/.test(l) ? (L === 'R' ? 'n <- ' + d.n + '; p <- ' + d.p + '; x <- ' + d.x : 'n, p, x = ' + d.n + ', ' + d.p + ', ' + d.x) + '   # X ~ Bin(n, p), P(X <= x) #@par' : l),
    run(rec, d) {
      const v = { mu: null, sd: null, z: null, a: null, zk: null, ak: null, ex: null }; const st = () => Object.assign({ d }, v);
      rec.step('par', '\\(X\\sim\\Bin(' + d.n + ',' + d.p + ')\\), gesucht \\(\\PP(X\\le' + d.x + ')\\).', st());
      v.mu = d.n * d.p; rec.step('mu', '\\(\\mu=np=' + LB.fmt(v.mu, 3) + '\\)', st());
      v.sd = Math.sqrt(d.n * d.p * (1 - d.p)); rec.step('sd', '\\(\\sigma=\\sqrt{np(1-p)}=' + LB.fmt(v.sd, 4) + '\\)' + (v.sd * v.sd < 9 ? ' ⚠ np(1−p) &lt; 9: Näherung grob' : ''), st());
      v.z = (d.x - v.mu) / v.sd; rec.step('z', '\\(\\Chg{z}=\\tfrac{' + d.x + '-' + LB.fmt(v.mu, 2) + '}{' + LB.fmt(v.sd, 3) + '}=' + LB.fmt(v.z, 4) + '\\)', st());
      v.a = S.Phi(v.z); rec.step('phi', '\\(\\Phi(' + LB.fmt(v.z, 3) + ')=\\Res{' + LB.fmt(v.a, 4) + '}\\)', st());
      v.zk = (d.x + 0.5 - v.mu) / v.sd; rec.step('zk', 'Korrektur: \\(z=\\tfrac{' + d.x + '.5-' + LB.fmt(v.mu, 2) + '}{' + LB.fmt(v.sd, 3) + '}=' + LB.fmt(v.zk, 4) + '\\)', st());
      v.ak = S.Phi(v.zk); rec.step('phik', '\\(\\Phi(' + LB.fmt(v.zk, 3) + ')=\\Res{' + LB.fmt(v.ak, 4) + '}\\)', st());
      v.ex = S.binomCdf(d.x, d.n, d.p); rec.step('ex', 'exakt \\(\\PP(X\\le' + d.x + ')=' + LB.fmt(v.ex, 4) + '\\)', st());
      rec.step('out', 'Fehler ohne Korrektur ' + LB.fmt(Math.abs(v.a - v.ex), 4) + ', mit Korrektur ' + LB.fmt(Math.abs(v.ak - v.ex), 4) + '.', st());
    },
    view: s => LB.kvHTML([['μ', s.mu === null ? '–' : LB.fmt(s.mu, 3), 'par'], ['σ', s.sd === null ? '–' : LB.fmt(s.sd, 4), 'par'], ['z', s.z === null ? '–' : LB.fmt(s.z, 4), 'chg'], ['Φ(z)', s.a === null ? '–' : LB.fmt(s.a, 4), 'res'],
      ['z korr.', s.zk === null ? '–' : LB.fmt(s.zk, 4), 'chg'], ['Φ korr.', s.ak === null ? '–' : LB.fmt(s.ak, 4), 'res'], ['exakt', s.ex === null ? '–' : LB.fmt(s.ex, 4), 'idx']])
  });
});

/* ---------------------------------------------------------------- Training */
LB.on(function train5() {
  if (!document.getElementById('q5Task')) return;
  const r = S.rng(Date.now() % 31337); let cur; const pick = a => a[Math.floor(r() * a.length)];
  const tasks = [
    () => { const s = pick([4, 6, 10, 12, 15]), n = pick([16, 25, 36, 64, 100]); return { t: 'Einzelmessungen haben σ = ' + s + '. Wie groß ist die Standardabweichung des Mittels von n = ' + n + ' unabhängigen Messungen?', a: s / Math.sqrt(n), s: 'σ/√n = ' + s + '/' + Math.sqrt(n) }; },
    () => { const s = pick([5, 8, 10, 20]), z = pick([0.5, 1, 2, 2.5]); return { t: 'σ = ' + s + '. Wie viele Messungen braucht man mindestens, damit σ des Mittels höchstens ' + z + ' ist?', a: Math.ceil((s / z) ** 2), s: 'n ≥ (σ/Ziel)² = ' + LB.fmt((s / z) ** 2, 2) + ' → aufrunden', tol: 0.5 }; },
    () => { const n = pick([100, 200, 400]), p = pick([0.2, 0.4, 0.5]), mu = n * p, sd = Math.sqrt(n * p * (1 - p)), x = Math.round(mu + pick([-1, 0.5, 1, 1.5]) * sd);
      return { t: 'X ~ Bin(' + n + ', ' + p + '). Approximiere P(X ≤ ' + x + ') mit dem ZGS <b>ohne</b> Stetigkeitskorrektur.', a: S.Phi((x - mu) / sd), s: 'μ = ' + mu + ', σ = ' + LB.fmt(sd, 3) + ', z = ' + LB.fmt((x - mu) / sd, 3) }; },
    () => { const n = pick([30, 50, 100]), m = pick([2, 5, 10]), s = pick([1, 2, 4]), x = n * m + pick([-1, 1, 2]) * s * Math.sqrt(n);
      return { t: n + ' unabhängige Größen mit μ = ' + m + ', σ = ' + s + '. Approximiere P(Summe ≤ ' + LB.fmt(x, 2) + ').', a: S.normCdf(x, n * m, s * Math.sqrt(n)), s: 'S ≈ N(' + n * m + ', ' + n * s * s + '), z = ' + LB.fmt((x - n * m) / (s * Math.sqrt(n)), 3) }; }
  ];
  const neu = () => { cur = pick(tasks)(); document.getElementById('q5Task').innerHTML = cur.t + ' (4 Nachkommastellen bzw. ganze Zahl)'; document.getElementById('q5In').value = ''; document.getElementById('q5Res').innerHTML = ''; };
  document.getElementById('q5New').addEventListener('click', neu);
  document.getElementById('q5Chk').addEventListener('click', () => { const v = parseFloat(document.getElementById('q5In').value.replace(',', '.'));
    document.getElementById('q5Res').innerHTML = (Math.abs(v - cur.a) < (cur.tol || 6e-4) ? '<b class="ok">✔ richtig.</b> ' : '<b class="bad">✗ noch nicht.</b> ') + 'Lösung: <b class="kw-res">' + LB.fmt(cur.a, 4) + '</b> · ' + cur.s; });
  neu();
});
