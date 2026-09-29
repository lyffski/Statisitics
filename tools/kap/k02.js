/* Kapitel 2 · Wahrscheinlichkeitsverteilungen: Visuals, Tracer, Training */
LB.KW = [
  ['Zufallsvariable', 'mem'], ['Wertebereich', 'mem'], ['Daten', 'mem'],
  ['Wahrscheinlichkeitsfunktion', 'rule'], ['Dichte', 'rule'], ['Verteilungsfunktion', 'rule'], ['Erwartungswert', 'rule'], ['Varianz', 'rule'],
  ['Standardabweichung', 'rule'], ['Quantil', 'rule'], ['Median', 'rule'], ['Bernoulli', 'rule'], ['Binomialverteilung', 'rule'], ['Poissonverteilung', 'rule'],
  ['Normalverteilung', 'rule'], ['Exponentialverteilung', 'rule'], ['Poissonprozess', 'rule'], ['diskret', 'rule'], ['stetig', 'rule'],
  ['Standardisierung', 'chg'], ['standardisieren', 'chg'], ['Transformation', 'chg'], ['Gegenereignis', 'chg'],
  ['Parameter', 'par'], ['Erfolgswahrscheinlichkeit', 'par'], ['Rate', 'par'], ['gesucht', 'res']
];
const S = LB.S, C = LB.C;

/* ---------------------------------------------------------------- p(x) und Treppe */
LB.on(function pmfcdf() {
  if (!document.getElementById('pmfPlot')) return;
  const dists = {
    fair: [1, 2, 3, 4, 5, 6].map(() => 1 / 6),
    loaded: [1, 1, 1, 1, 1, 2].map(w => w / 7),
    max: [1, 2, 3, 4, 5, 6].map(x => (2 * x - 1) / 36)
  };
  const draw = d => {
    const p = dists[d], xs = [1, 2, 3, 4, 5, 6];
    const E = S.sum(xs.map((x, i) => x * p[i]));
    LB.plot('pmfPlot', [{ type: 'bar', x: xs, y: p, marker: { color: C.rule }, width: 0.15, hovertemplate: 'p(%{x}) = %{y:.4f}<extra></extra>' },
      { x: [E], y: [0], mode: 'markers', marker: { symbol: 'triangle-up', size: 16, color: C.res } }],
      { height: 280, xaxis: { title: 'x', dtick: 1 }, yaxis: { title: 'p(x)', range: [0, 0.35] }, annotations: [{ x: E, y: 0.03, text: 'E = ' + LB.fmt(E, 3), showarrow: false, font: { color: C.res } }] });
    const cx = [0], cy = [0]; let F = 0;
    xs.forEach((x, i) => { cx.push(x, x); cy.push(F, F + p[i]); F += p[i]; }); cx.push(7); cy.push(1);
    LB.plot('cdfPlot', [{ x: cx, y: cy, mode: 'lines', line: { color: C.chg, width: 2.6 }, hoverinfo: 'skip' },
      { x: xs, y: xs.map((x, i) => S.sum(p.slice(0, i + 1))), mode: 'markers', marker: { color: C.chg, size: 9 }, hovertemplate: 'F(%{x}) = %{y:.4f}<extra></extra>' }],
      { height: 280, xaxis: { title: 'x', dtick: 1, range: [0, 7] }, yaxis: { title: 'F(x)', range: [0, 1.05] } });
    LB.$$('#dieSeg .btn').forEach(b => b.classList.toggle('on', b.dataset.d === d));
  };
  document.getElementById('dieSeg').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (b) draw(b.dataset.d); });
  draw('fair');
});

/* ---------------------------------------------------------------- Schwerpunkt */
LB.on(function balance() {
  if (!document.getElementById('swPlot')) return;
  LB.bind(['swW'], v => {
    const w = [1, 1, 1, 1, 1, v.swW], tot = S.sum(w), p = w.map(x => x / tot), xs = [1, 2, 3, 4, 5, 6];
    const E = S.sum(xs.map((x, i) => x * p[i])), V = S.sum(xs.map((x, i) => (x - E) ** 2 * p[i])), sd = Math.sqrt(V);
    LB.plot('swPlot', [{ type: 'bar', x: xs, y: p, marker: { color: C.rule }, width: 0.35 },
      { x: [E], y: [-0.02], mode: 'markers', marker: { symbol: 'triangle-up', size: 20, color: C.res } },
      { x: [E - sd, E + sd], y: [-0.045, -0.045], mode: 'lines+markers', line: { color: C.chg, width: 3 }, marker: { symbol: 'line-ns-open', size: 12, color: C.chg } },
      { x: [0.5, 6.5], y: [-0.005, -0.005], mode: 'lines', line: { color: C.muted, width: 4 } }],
      { height: 260, xaxis: { dtick: 1, range: [0.5, 6.5] }, yaxis: { range: [-0.06, 0.7], title: 'p(x)' } });
    const o = document.getElementById('swOut');
    o.innerHTML = '\\(\\Res{\\EE[\\mX]}=\\sum x\\,\\pf(x)=\\Res{' + LB.fmt(E, 3) + '}\\), \\(\\Var(\\mX)=' + LB.fmt(V, 3) + '\\), \\(\\sigma=' + LB.fmt(sd, 3) + '\\), \\(\\pf(6)=' + LB.fmt(p[5], 3) + '\\)';
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- Binomial-Explorer */
LB.on(function binomExp() {
  if (!document.getElementById('biPlot')) return;
  LB.bind(['biN', 'biP', 'biK'], v => {
    const n = v.biN, p = v.biP, k = Math.min(v.biK, n), xs = [], ys = [];
    for (let x = 0; x <= n; x++) { xs.push(x); ys.push(S.binomPmf(x, n, p)); }
    const F = S.binomCdf(k, n, p);
    LB.plot('biPlot', [{ type: 'bar', x: xs, y: ys, marker: { color: xs.map(x => x <= k ? C.res : C.rule) }, hovertemplate: 'P(X=%{x}) = %{y:.4f}<extra></extra>' },
      { x: [n * p], y: [0], mode: 'markers', marker: { symbol: 'triangle-up', size: 16, color: C.chg } }],
      { height: 300, xaxis: { title: 'x (Anzahl Erfolge)' }, yaxis: { title: 'p(x)' } });
    const o = document.getElementById('biOut');
    o.innerHTML = '\\(\\mX\\sim\\Bin(' + n + ',' + LB.fmt(p, 2) + ')\\): \\(\\EE=' + LB.fmt(n * p, 2) + '\\), \\(\\sigma=' + LB.fmt(Math.sqrt(n * p * (1 - p)), 3) + '\\), \\(\\Res{\\PP(\\mX\\le' + k + ')=' + LB.fmt(F, 4) + '}\\), \\(\\PP(\\mX>' + k + ')=' + LB.fmt(1 - F, 4) + '\\) · R: <code>pbinom(' + k + ', ' + n + ', ' + LB.fmt(p, 2) + ')</code>';
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- Poisson-Explorer */
LB.on(function poisExp() {
  if (!document.getElementById('poPlot')) return;
  LB.bind(['poL', 'poN', 'poB'], v => {
    const l = v.poL, n = Math.max(v.poN, Math.ceil(l) + 1), top = Math.ceil(l + 4 * Math.sqrt(l) + 3), xs = [];
    for (let x = 0; x <= top; x++) xs.push(x);
    const tr = [{ type: 'bar', name: 'Pois(λ)', x: xs, y: xs.map(x => S.poisPmf(x, l)), marker: { color: C.rule }, offset: -0.4, width: 0.4 }];
    if (v.poB) tr.push({ type: 'bar', name: 'Bin(n, λ/n)', x: xs, y: xs.map(x => S.binomPmf(x, n, l / n)), marker: { color: C.chg }, offset: 0, width: 0.4 });
    LB.plot('poPlot', tr, { height: 300, showlegend: true, barmode: 'overlay', xaxis: { title: 'x' }, yaxis: { title: 'P(X = x)' } });
    let tv = 0; for (let x = 0; x <= Math.max(top, 60); x++) tv += Math.abs(S.poisPmf(x, l) - S.binomPmf(x, n, l / n));
    const o = document.getElementById('poOut');
    o.innerHTML = 'λ = ' + LB.fmt(l, 1) + ', Binomial mit n = ' + n + ', p = λ/n = ' + LB.fmt(l / n, 4) + ' · größter Unterschied wird kleiner, je größer n: Summe |Differenzen| = ' + LB.fmt(tv, 4) + ' · \\(\\PP(\\mX=0)=e^{-\\lambda}=' + LB.fmt(Math.exp(-l), 4) + '\\)';
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- Fläche = W'keit (Riemann) */
LB.on(function areaViz() {
  if (!document.getElementById('arPlot')) return;
  LB.bind(['arA', 'arB', 'arM'], v => {
    let a = Math.min(v.arA, v.arB), b = Math.max(v.arA, v.arB); const m = v.arM, h = (b - a) / m;
    const f = x => S.normPdf(x), tr = [LB.area(f, a, b, LB.rgba(C.res, 0.35)), LB.curve(f, -4, 4, C.rule)];
    let R = 0; const rx = [], ry = [];
    for (let i = 0; i < m; i++) { const x0 = a + i * h, xm = x0 + h / 2, y = f(xm); R += y * h; rx.push(x0, x0, x0 + h, x0 + h, null); ry.push(0, y, y, 0, null); }
    if (b > a) tr.push({ x: rx, y: ry, mode: 'lines', line: { color: C.chg, width: 1.5 }, hoverinfo: 'skip' });
    LB.plot('arPlot', tr, { height: 300, xaxis: { title: 'x', range: [-4, 4] }, yaxis: { title: 'f(x)', range: [0, 0.45] } });
    const ex = S.Phi(b) - S.Phi(a), o = document.getElementById('arOut');
    o.innerHTML = '\\(\\Res{\\PP(' + LB.fmt(a, 1) + '<\\mX\\le' + LB.fmt(b, 1) + ')}=\\Phi(' + LB.fmt(b, 1) + ')-\\Phi(' + LB.fmt(a, 1) + ')=\\Res{' + LB.fmt(ex, 4) + '}\\) · ' + m + ' Rechtecke: ' + LB.fmt(R, 4) + ' (Fehler ' + LB.fmt(Math.abs(R - ex), 5) + ')';
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- Normal-Explorer */
LB.on(function normExp() {
  if (!document.getElementById('noPlot')) return;
  LB.bind(['noM', 'noS', 'noX'], v => {
    const m = v.noM, s = v.noS, x = v.noX, f = t => S.normPdf(t, m, s);
    LB.plot('noPlot', [LB.area(f, m - 2 * s, m + 2 * s, LB.rgba(C.par, 0.18)), LB.area(f, m - s, m + s, LB.rgba(C.par, 0.3)),
      LB.area(f, -8, Math.max(-8, x), LB.rgba(C.res, 0.35)), LB.curve(f, -8, 8, C.rule, 300),
      { x: [x, x], y: [0, f(x)], mode: 'lines', line: { color: C.res, width: 2 } }],
      { height: 300, xaxis: { range: [-8, 8], title: 'x' }, yaxis: { title: 'f(x)', rangemode: 'tozero' } });
    const z = (x - m) / s, o = document.getElementById('noOut');
    o.innerHTML = '\\(\\Chg{z}=\\tfrac{' + LB.fmt(x, 2) + '-(' + LB.fmt(m, 1) + ')}{' + LB.fmt(s, 1) + '}=' + LB.fmt(z, 3) + '\\), \\(\\Res{\\PP(\\mX\\le' + LB.fmt(x, 2) + ')=\\Phi(' + LB.fmt(z, 3) + ')=' + LB.fmt(S.Phi(z), 4) + '}\\) · blau: ±1σ (' + LB.fmt(S.Phi(1) - S.Phi(-1), 4) + '), ±2σ (' + LB.fmt(S.Phi(2) - S.Phi(-2), 4) + ')';
    LB.tex(o);
  });
  const tab = document.getElementById('phiTab');
  if (tab) {
    let h = '<table class="tbl" style="font-family:JetBrains Mono,monospace;font-size:.8rem"><tr><th>z</th>';
    for (let c = 0; c < 10; c++) h += '<th class="r">.0' + c + '</th>';
    h += '</tr>';
    for (let r = 0; r <= 30; r++) { h += '<tr><td><b>' + (r / 10).toFixed(1) + '</b></td>'; for (let c = 0; c < 10; c++) h += '<td class="r">' + S.Phi(r / 10 + c / 100).toFixed(4) + '</td>'; h += '</tr>'; }
    tab.innerHTML = h + '</table>';
  }
});

/* ---------------------------------------------------------------- Exponential-Explorer */
LB.on(function expExp() {
  if (!document.getElementById('exPlot')) return;
  LB.bind(['exL', 'exT'], v => {
    const l = v.exL, t = v.exT, f = x => S.expPdf(x, l), top = Math.max(15, 4 / l);
    LB.plot('exPlot', [LB.area(f, t, top, LB.rgba(C.res, 0.35)), LB.curve(f, 0, top, C.rule),
      { x: [1 / l], y: [0], mode: 'markers', marker: { symbol: 'triangle-up', size: 16, color: C.chg } }],
      { height: 280, xaxis: { title: 'x', range: [0, top] }, yaxis: { title: 'f(x)', rangemode: 'tozero' } });
    const o = document.getElementById('exOut');
    o.innerHTML = '\\(\\EE[\\mX]=1/\\lambda=' + LB.fmt(1 / l, 3) + '\\), Median \\(=\\ln2/\\lambda=' + LB.fmt(Math.LN2 / l, 3) + '\\), \\(\\Res{\\PP(\\mX>' + LB.fmt(t, 1) + ')=e^{-' + LB.fmt(l * t, 3) + '}=' + LB.fmt(Math.exp(-l * t), 4) + '}\\) (rot schattiert)';
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- Poissonprozess */
LB.on(function poisProc() {
  if (!document.getElementById('ppLine')) return;
  let seed = 3;
  const run = LB.bind(['ppL', 'ppT'], v => {
    const l = v.ppL, t = v.ppT, r = S.rng(seed), expo = () => -Math.log(1 - r()) / l;
    const ev = []; let s = expo(); while (s < t) { ev.push(s); s += expo(); }
    LB.plot('ppLine', [{ x: [0, t], y: [0, 0], mode: 'lines', line: { color: C.muted, width: 2 } },
      { x: ev, y: ev.map(() => 0), mode: 'markers', marker: { color: C.res, size: 12, symbol: 'line-ns-open', line: { width: 3 } } }],
      { height: 200, xaxis: { title: 'Zeit (Stunden) · ' + ev.length + ' Ereignisse in diesem Lauf', range: [0, t] }, yaxis: { visible: false } });
    const counts = []; for (let k = 0; k < 2000; k++) { let n = 0, u = expo(); while (u < t) { n++; u += expo(); } counts.push(n); }
    const mx = Math.max(...counts), xs = [], sim = [], th = [];
    for (let x = 0; x <= mx; x++) { xs.push(x); sim.push(counts.filter(c => c === x).length / 2000); th.push(S.poisPmf(x, l * t)); }
    LB.plot('ppHist', [{ type: 'bar', x: xs, y: sim, marker: { color: LB.rgba(C.chg, 0.7) }, name: 'Simulation' },
      { x: xs, y: th, mode: 'markers', marker: { color: C.rule, size: 9 }, name: 'Pois(λt)' }],
      { height: 280, showlegend: true, xaxis: { title: 'Anzahl N(t)' }, yaxis: { title: 'Anteil' } });
    const o = document.getElementById('ppOut');
    o.innerHTML = 'Mittel der 2000 Anzahlen = ' + LB.fmt(S.mean(counts), 3) + ', Varianz = ' + LB.fmt(S.var(counts), 3) + ' (Theorie: beide \\(\\lambda t=' + LB.fmt(l * t, 2) + '\\))';
    LB.tex(o);
  });
  document.getElementById('ppNew').addEventListener('click', () => { seed++; run(); });
});

/* ================================================================ Tracer */
LB.on(function tracers2() {
  const vecR = a => 'c(' + a.join(', ') + ')', vecP = a => 'np.array([' + a.join(', ') + '])';
  new LB.Tracer({
    id: 'trEV', title: 'E[X], E[X²], Var, σ', langs: CODE('k2_erwartung'),
    vars: [['x', 'mem', 'mögliche Werte x_k der Zufallsvariable'], ['p', 'par', 'Wahrscheinlichkeiten p(x_k), Summe 1'], ['k', 'idx', 'Nummer des aktuellen Werts'],
      ['EX', 'res', 'E[X]: wächst pro Wert um x_k · p(x_k)'], ['EX2', 'chg', 'E[X²]: Hilfsgröße, wächst um x_k² · p(x_k)'], ['VarX', 'res', 'Var(X) = E[X²] − E[X]²'], ['sdX', 'res', 'σ = √Var, in der Einheit von X']],
    together: 'Die Schleife über <span class="kw-idx">k</span> liefert pro Wert zwei Beiträge: <span class="kw-mem">x</span>·<span class="kw-par">p</span> für <span class="kw-res">EX</span> und x²·p für <span class="kw-chg">EX2</span>. Erst danach entsteht mit dem Verschiebungssatz <span class="kw-res">VarX</span> = EX2 − EX², und <span class="kw-res">sdX</span> bringt die Streuung zurück in die Einheit von X.',
    say: s => 'Auf lange Sicht ist X im Mittel ' + LB.fmt(s.EX, 3) + (s.EX < 0 ? ' (bei einem Spiel: man verliert im Mittel ' + LB.fmt(-s.EX, 3) + ' pro Runde)' : '') + '. Einzelne Werte weichen typischerweise um etwa σ = ' + LB.fmt(s.sd, 3) + ' davon ab. E ist ein Mittel über viele Wiederholungen, kein Wert, der in einer Runde vorkommen muss.',
   
    input: '10 2 -3 ; 0.1 0.3 0.6', hint: 'Werte ; Wahrscheinlichkeiten',
    examples: [['Glücksspiel', '10 2 -3 ; 0.1 0.3 0.6'], ['Grundlage-pmf', '0 1 2 ; 0.2 0.5 0.3'], ['fairer Würfel', '1 2 3 4 5 6 ; 0.1666667 0.1666667 0.1666666 0.1666667 0.1666667 0.1666666'], ['Bernoulli(0.3)', '0 1 ; 0.7 0.3']],
    parse: s => { const [a, b] = s.split(';'); if (b === undefined) throw new Error('Format: Werte ; Wahrscheinlichkeiten');
      const x = S.parse(a), p = S.parse(b); if (!x.length || x.length !== p.length) throw new Error('gleich viele Werte und Wahrscheinlichkeiten');
      if (p.some(q => q < 0) || Math.abs(S.sum(p) - 1) > 1e-6) throw new Error('p ≥ 0 und Summe 1 (jetzt ' + LB.fmt(S.sum(p), 4) + ')'); return { x, p }; },
    codeFor: (d, L, lines) => lines.map(l => /#@x\s*$/.test(l) ? (L === 'R' ? 'x <- ' + vecR(d.x) : 'x = ' + vecP(d.x)) + '   # Werte x_k #@x' : /#@p\s*$/.test(l) ? (L === 'R' ? 'p <- ' + vecR(d.p) : 'p = ' + vecP(d.p)) + '   # p(x_k) #@p' : l),
    run(rec, d) {
      let EX = 0, EX2 = 0, k = -1, V = null, sd = null; const st = () => ({ x: d.x, p: d.p, EX, EX2, k, V, sd });
      rec.step('x', 'Werte \\(x_k\\) der Zufallsvariable.', st());
      rec.step('p', 'Wahrscheinlichkeiten \\(\\pf(x_k)\\).', st());
      rec.step('chk', 'Normierung geprüft: \\(\\sum\\pf(x_k)=' + LB.fmt(S.sum(d.p), 4) + '\\) ✓', st());
      rec.step('init', 'Beide Summen starten bei 0.', st());
      for (k = 0; k < d.x.length; k++) {
        rec.step('loop', 'Wert Nummer \\(\\Idx{k}=' + (k + 1) + '\\): \\(x=' + d.x[k] + '\\).', st());
        EX += d.x[k] * d.p[k]; rec.step('ex', '\\(\\EE[\\mX]\\mathrel{+}=' + d.x[k] + '\\cdot' + d.p[k] + '=' + LB.fmt(d.x[k] * d.p[k], 4) + '\\) → ' + LB.fmt(EX, 4), st());
        EX2 += d.x[k] ** 2 * d.p[k]; rec.step('ex2', '\\(\\EE[\\mX^2]\\mathrel{+}=' + d.x[k] + '^2\\cdot' + d.p[k] + '=' + LB.fmt(d.x[k] ** 2 * d.p[k], 4) + '\\) → ' + LB.fmt(EX2, 4), st());
      }
      k = -1; V = EX2 - EX * EX;
      rec.step('var', '\\(\\Var(\\mX)=' + LB.fmt(EX2, 4) + '-' + LB.fmt(EX, 4) + '^2=\\Res{' + LB.fmt(V, 4) + '}\\)', st());
      sd = Math.sqrt(V); rec.step('sd', '\\(\\sigma=\\sqrt{' + LB.fmt(V, 4) + '}=\\Res{' + LB.fmt(sd, 4) + '}\\)', st());
      rec.step('out', 'Ausgabe: E = ' + LB.fmt(EX, 4) + ', Var = ' + LB.fmt(V, 4) + ', sd = ' + LB.fmt(sd, 4), st());
    },
    view: s => '<table class="tbl"><tr><th>k</th><th class="r">x_k</th><th class="r">p(x_k)</th><th class="r">x·p</th><th class="r">x²·p</th></tr>' +
      s.x.map((x, i) => '<tr' + (i === s.k ? ' style="outline:1px solid var(--chg)"' : '') + '><td class="kw-idx">' + (i + 1) + '</td><td class="r kw-mem">' + x + '</td><td class="r kw-par">' + s.p[i] + '</td><td class="r">' + LB.fmt(x * s.p[i], 4) + '</td><td class="r">' + LB.fmt(x * x * s.p[i], 4) + '</td></tr>').join('') + '</table>' +
      LB.kvHTML([['E[X] bisher', LB.fmt(s.EX, 4), 'res'], ['E[X²] bisher', LB.fmt(s.EX2, 4), 'chg'], ['Var', s.V === null ? '–' : LB.fmt(s.V, 4), 'res'], ['σ', s.sd === null ? '–' : LB.fmt(s.sd, 4), 'res']])
  });

  new LB.Tracer({
    id: 'trBin', title: 'Binomialtabelle p(x) und F(x)', langs: CODE('k2_binom'),
    vars: [['n', 'par', 'Anzahl unabhängiger Versuche'], ['p', 'par', 'Erfolgs-W\'keit pro Versuch'], ['x', 'idx', 'aktuelle Anzahl Erfolge, läuft 0 … n'],
      ['px', 'res', 'p(x) = P(X = x): Reihenfolgen × Erfolge × Misserfolge'], ['F', 'chg', 'F(x) = P(X ≤ x): alle p bis x aufsummiert']],
    together: 'Für jedes <span class="kw-idx">x</span> berechnet die Formel <span class="kw-res">px</span> aus drei Teilen: choose(n, x) zählt die Reihenfolgen, pˣ die Erfolge, (1 − p)ⁿ⁻ˣ die Misserfolge. <span class="kw-chg">F</span> sammelt alle px bis x auf, deshalb endet F bei 1.',
    say: s => { let m = s.rows[0]; s.rows.forEach(r => { if (r[2] > m[2]) m = r; }); const e = s.n * s.p, fl = Math.floor(e), Fe = s.rows[fl] ? s.rows[fl][3] : null;
      return 'Bei ' + s.n + ' Versuchen mit Erfolgs-W\'keit ' + s.p + ' erwartet man im Mittel np = ' + LB.fmt(e, 2) + ' Erfolge. Am wahrscheinlichsten sind genau ' + m[0] + ' Erfolge (P = ' + LB.fmt(m[2], 3) + ')' + (Fe !== null ? '; höchstens ' + fl + ' Erfolge gibt es mit W\'keit ' + LB.fmt(Fe, 3) : '') + '.'; },
   
    input: '10 0.25', hint: 'n p',
    examples: [['Multiple Choice', '10 0.25'], ['Grundlage Bin(5, 0.4)', '5 0.4'], ['Bauteile Bin(10, 0.05)', '10 0.05'], ['Münzen Bin(6, 0.5)', '6 0.5']],
    parse: s => { const v = S.parse(s); if (v.length !== 2) throw new Error('Format: n p'); const n = Math.round(v[0]), p = v[1];
      if (n < 1 || n > 30) throw new Error('n zwischen 1 und 30'); if (p < 0 || p > 1) throw new Error('p zwischen 0 und 1'); return { n, p }; },
    codeFor: (d, L, lines) => lines.map(l => /#@par\s*$/.test(l) ? (L === 'R' ? 'n <- ' + d.n + '; p <- ' + d.p : 'n, p = ' + d.n + ', ' + d.p) + '   # Parameter #@par' : l),
    run(rec, d) {
      const n = d.n, p = d.p, rows = []; let F = 0, x = -1; const st = () => ({ n, p, rows: rows.slice(), x, F });
      rec.step('par', '\\(\\mX\\sim\\Bin(' + n + ',' + p + ')\\).', st());
      rec.step('F0', '\\(\\FF\\) startet bei 0.', st());
      for (x = 0; x <= n; x++) {
        rec.step('loop', 'Wert \\(\\Idx{x}=' + x + '\\).', st());
        const c = S.choose(n, x), px = S.binomPmf(x, n, p);
        rows.push([x, c, px, null]);
        rec.step('px', '\\(\\pf(' + x + ')=\\binom{' + n + '}{' + x + '}\\,' + p + '^{' + x + '}\\,' + LB.fmt(1 - p, 4) + '^{' + (n - x) + '}=' + c + '\\cdot\\ldots=' + LB.fmt(px, 4) + '\\)', st());
        F += px; rows[rows.length - 1][3] = F;
        rec.step('F', '\\(\\FF(' + x + ')=\\PP(\\mX\\le' + x + ')=' + LB.fmt(F, 4) + '\\)', st());
        rec.step('out', 'Zeile ' + x + ' ausgegeben.', st());
      }
      x = -1;
    },
    view: s => '<table class="tbl"><tr><th>x</th><th class="r">(n über x)</th><th class="r">p(x)</th><th class="r">F(x)</th></tr>' +
      s.rows.map(r => '<tr' + (r[0] === s.x ? ' style="outline:1px solid var(--chg)"' : '') + '><td class="kw-idx">' + r[0] + '</td><td class="r">' + r[1] + '</td><td class="r kw-res">' + LB.fmt(r[2], 4) + '</td><td class="r kw-chg">' + (r[3] === null ? '·' : LB.fmt(r[3], 4)) + '</td></tr>').join('') + '</table>'
  });

  new LB.Tracer({
    id: 'trFl', title: 'Fläche unter der Normal-Dichte mit Rechtecken', langs: CODE('k2_flaeche'),
    vars: [['mu|sigma', 'par', 'Parameter der Normalverteilung'], ['a|b', 'par', 'Grenzen des Intervalls'], ['m', 'par', 'Anzahl Rechtecke'], ['h', 'chg', 'Breite eines Rechtecks = (b − a)/m'],
      ['i', 'idx', 'Nummer des Rechtecks'], ['xm', 'chg', 'Mitte des Rechtecks, dort wird die Höhe f(xm) gemessen'], ['flaeche', 'res', 'Summe Höhe × Breite ≈ P(a &lt; X ≤ b)'], ['exakt', 'res', 'F(b) − F(a), exakter Wert']],
    together: 'Das Intervall [<span class="kw-par">a</span>, <span class="kw-par">b</span>] wird in <span class="kw-par">m</span> Streifen der Breite <span class="kw-chg">h</span> zerlegt. Jedes Rechteck hat die Höhe der Dichte in seiner Mitte <span class="kw-chg">xm</span>. Die Summe aller Rechtecke (<span class="kw-res">flaeche</span>) nähert die Fläche unter der Kurve an, und Fläche = Wahrscheinlichkeit.',
    say: s => { const d = s.d, ex = LB.S.normCdf(d.b, d.mu, d.s) - LB.S.normCdf(d.a, d.mu, d.s);
      return 'Ein Wert aus N(' + d.mu + ', ' + d.s + '²) fällt mit Wahrscheinlichkeit ' + LB.fmt(ex, 4) + ' zwischen ' + d.a + ' und ' + d.b + ', also in etwa ' + Math.round(ex * 100) + ' von 100 Beobachtungen. Die ' + d.m + ' Rechtecke liefern ' + LB.fmt(s.A, 4) + ' (Fehler ' + LB.fmt(Math.abs(s.A - ex), 5) + '); mit mehr Rechtecken wird der Fehler kleiner.'; },
   
    input: '0 1 ; -1 1 ; 8', hint: 'μ σ ; a b ; m (Rechtecke)',
    examples: [['±1σ mit 8 Rechtecken', '0 1 ; -1 1 ; 8'], ['P(X ≤ 3) für N(2, 4²)', '2 4 ; -14 3 ; 20'], ['IQ 85 bis 115', '100 15 ; 85 115 ; 6']],
    parse: s => { const pr = s.split(';').map(S.parse); if (pr.length !== 3 || pr[0].length !== 2 || pr[1].length !== 2 || pr[2].length !== 1) throw new Error('Format: μ σ ; a b ; m');
      const m = Math.round(pr[2][0]); if (m < 1 || m > 40) throw new Error('m zwischen 1 und 40'); if (pr[0][1] <= 0) throw new Error('σ > 0');
      return { mu: pr[0][0], s: pr[0][1], a: pr[1][0], b: pr[1][1], m }; },
    codeFor: (d, L, lines) => lines.map(l => /#@par\s*$/.test(l) ? (L === 'R' ? 'mu <- ' + d.mu + '; sigma <- ' + d.s : 'mu, sigma = ' + d.mu + ', ' + d.s) + '   # Parameter #@par' :
      /#@ab\s*$/.test(l) ? (L === 'R' ? 'a <- ' + d.a + '; b <- ' + d.b + '; m <- ' + d.m : 'a, b, m = ' + d.a + ', ' + d.b + ', ' + d.m) + '   # Grenzen, Rechtecke #@ab' : l),
    run(rec, d) {
      const h = (d.b - d.a) / d.m; let A = 0, i = 0, xm = null; const bars = []; const st = () => ({ d, bars: bars.slice(), A, i, xm, h });
      rec.step('par', '\\(\\mX\\sim\\Nor(' + d.mu + ',' + d.s + '^2)\\).', st());
      rec.step('ab', 'Fläche von ' + d.a + ' bis ' + d.b + ' mit ' + d.m + ' Rechtecken.', st());
      rec.step('h', 'Breite \\(h=\\tfrac{' + d.b + '-(' + d.a + ')}{' + d.m + '}=' + LB.fmt(h, 4) + '\\).', st());
      rec.step('f0', 'Fläche = 0.', st());
      for (i = 1; i <= d.m; i++) {
        rec.step('loop', 'Rechteck \\(\\Idx{i}=' + i + '\\).', st());
        xm = d.a + (i - 0.5) * h; rec.step('xm', 'Mitte \\(x_m=' + LB.fmt(xm, 4) + '\\).', st());
        const y = S.normPdf(xm, d.mu, d.s); A += y * h; bars.push([xm, y]);
        rec.step('add', '\\(\\ff(x_m)\\cdot h=' + LB.fmt(y, 4) + '\\cdot' + LB.fmt(h, 4) + '=' + LB.fmt(y * h, 4) + '\\) → Summe ' + LB.fmt(A, 4), st());
      }
      const ex = S.normCdf(d.b, d.mu, d.s) - S.normCdf(d.a, d.mu, d.s); xm = null;
      rec.step('ex', 'Exakt: \\(\\FF(b)-\\FF(a)=\\Res{' + LB.fmt(ex, 4) + '}\\).', st());
      rec.step('out', 'Rechtecke ' + LB.fmt(A, 4) + ' vs. exakt ' + LB.fmt(ex, 4) + ' (Abweichung ' + LB.fmt(Math.abs(A - ex), 5) + ').', st());
    },
    view: s => {
      const d = s.d, lo = Math.min(d.a, d.mu - 4 * d.s), hi = Math.max(d.b, d.mu + 4 * d.s), W = 460, H = 150, top = S.normPdf(d.mu, d.mu, d.s) * 1.1;
      const X = x => 10 + (x - lo) / (hi - lo) * (W - 20), Y = y => H - 10 - y / top * (H - 20);
      let path = ''; for (let k = 0; k <= 120; k++) { const x = lo + (hi - lo) * k / 120; path += (k ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(S.normPdf(x, d.mu, d.s)).toFixed(1); }
      const rects = s.bars.map(b => '<rect x="' + X(b[0] - s.h / 2).toFixed(1) + '" y="' + Y(b[1]).toFixed(1) + '" width="' + Math.max(0.5, X(b[0] + s.h / 2) - X(b[0] - s.h / 2)).toFixed(1) + '" height="' + (Y(0) - Y(b[1])).toFixed(1) + '" fill="' + LB.rgba(C.chg, 0.45) + '" stroke="' + C.chg + '"/>').join('');
      return '<svg viewBox="0 0 ' + W + ' ' + H + '"><line x1="10" x2="' + (W - 10) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="' + C.muted + '"/>' + rects + '<path d="' + path + '" fill="none" stroke="' + C.rule + '" stroke-width="2"/></svg>' +
        LB.kvHTML([['i', s.i > d.m ? '–' : s.i, 'idx'], ['h', LB.fmt(s.h, 4), 'chg'], ['Fläche bisher', LB.fmt(s.A, 4), 'res']]);
    }
  });
});

/* ---------------------------------------------------------------- Training */
LB.on(function train2() {
  if (!document.getElementById('q2Task')) return;
  const r = S.rng(Date.now() % 99991); let cur;
  const pick = a => a[Math.floor(r() * a.length)];
  const tasks = [
    () => { const n = pick([5, 8, 10, 12, 20]), p = pick([0.1, 0.2, 0.3, 0.5]), k = Math.floor(r() * (n * p + 2));
      return { t: 'Ein Versuch gelingt mit W\'keit ' + p + '. Er wird ' + n + '-mal unabhängig wiederholt. Wie groß ist die W\'keit für <b>höchstens ' + k + '</b> Erfolge?', a: S.binomCdf(k, n, p), s: 'X ~ Bin(' + n + ', ' + p + '), P(X ≤ ' + k + ') = F(' + k + '); R: pbinom(' + k + ', ' + n + ', ' + p + ')' }; },
    () => { const l = pick([1, 2, 3, 4.5, 6]), k = pick([0, 1, 2, 3]);
      return { t: 'Im Mittel treten ' + l + ' seltene Ereignisse pro Tag auf. Wie groß ist die W\'keit für <b>mindestens ' + (k + 1) + '</b> Ereignisse an einem Tag?', a: 1 - S.poisCdf(k, l), s: 'X ~ Pois(' + l + '), P(X ≥ ' + (k + 1) + ') = 1 − F(' + k + '); R: 1 - ppois(' + k + ', ' + l + ')' }; },
    () => { const mu = pick([50, 100, 170, 500]), s = pick([2, 5, 10, 15]), z = pick([-1.5, -1, -0.5, 0.5, 1, 1.28, 2]), x = mu + z * s;
      return { t: 'Messwerte sind normalverteilt mit μ = ' + mu + ' und σ = ' + s + '. Wie groß ist <b>P(X ≤ ' + LB.fmt(x, 1) + ')</b>?', a: S.normCdf(x, mu, s), s: 'z = (' + LB.fmt(x, 1) + ' − ' + mu + ')/' + s + ' = ' + LB.fmt(z, 2) + ', Φ(z); R: pnorm(' + LB.fmt(x, 1) + ', ' + mu + ', ' + s + ')' }; },
    () => { const l = pick([0.1, 0.2, 0.5, 1, 2]), t = pick([1, 2, 3, 5]);
      return { t: 'Eine Wartezeit ist exponentialverteilt mit Rate λ = ' + l + '. Wie groß ist <b>P(T > ' + t + ')</b>?', a: Math.exp(-l * t), s: 'P(T > t) = e^(−λt) = e^(−' + LB.fmt(l * t, 2) + '); R: pexp(' + t + ', ' + l + ', lower.tail = FALSE)' }; },
    () => { const p = pick([0.1, 0.2, 0.25, 0.5]), k = pick([2, 3, 4, 5]);
      return { t: 'Man wiederholt einen Versuch mit Erfolgs-W\'keit ' + p + ' bis zum ersten Erfolg. Wie groß ist die W\'keit, dass <b>genau Versuch ' + k + '</b> der erste Erfolg ist?', a: Math.pow(1 - p, k - 1) * p, s: 'X ~ Geom(' + p + '), (1 − p)^(k−1)·p; R: dgeom(' + (k - 1) + ', ' + p + ')' }; }
  ];
  const neu = () => { cur = pick(tasks)(); document.getElementById('q2Task').innerHTML = cur.t + ' (4 Nachkommastellen)'; document.getElementById('q2Res').innerHTML = ''; document.getElementById('q2In').value = ''; };
  document.getElementById('q2New').addEventListener('click', neu);
  document.getElementById('q2Chk').addEventListener('click', () => {
    const v = parseFloat(document.getElementById('q2In').value.replace(',', '.'));
    document.getElementById('q2Res').innerHTML = (Math.abs(v - cur.a) < 6e-4 ? '<b class="ok">✔ richtig.</b> ' : '<b class="bad">✗ noch nicht.</b> ') + 'Lösung: <b class="kw-res">' + LB.fmt(cur.a, 4) + '</b> · ' + cur.s;
  });
  neu();
});
