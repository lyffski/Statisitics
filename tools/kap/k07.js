/* Kapitel 7 · Tests und Vertrauensintervalle: Visuals, Tracer, Training */
LB.KW = [
  ['Nullhypothese', 'cond'], ['Alternative', 'cond'], ['Alternativhypothese', 'cond'], ['Sollwert', 'par'], ['Niveau', 'par'], ['Signifikanzniveau', 'par'],
  ['Verwerfungsbereich', 'res'], ['P-Wert', 'res'], ['Vertrauensintervall', 'res'], ['verwerfen', 'res'], ['Teststatistik', 'chg'],
  ['Fehler 1. Art', 'rule'], ['Fehler 2. Art', 'rule'], ['Macht', 'rule'], ['t-Test', 'rule'], ['Z-Test', 'rule'], ['Binomialtest', 'rule'],
  ['Wilcoxon', 'rule'], ['Vorzeichen-Test', 'rule'], ['Dualität', 'rule'], ['signifikant', 'rule'], ['Relevanz', 'rule'], ['Daten', 'mem']
];
const S = LB.S, C = LB.C;
const segBind = (id, cb) => { let v = document.querySelector('#' + id + ' .btn.on').dataset.s; document.getElementById(id).addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; v = b.dataset.s; LB.$$('#' + id + ' .btn').forEach(x => x.classList.toggle('on', x === b)); cb(); }); return () => v; };

/* ---------------------------------------------------------------- Binomialtest-Bereich */
LB.on(function binTest() {
  if (!document.getElementById('btPlot')) return;
  let side = () => 'gt';
  const run = () => {
    const n = +document.getElementById('btN').value, p = +document.getElementById('btP').value, a = +document.getElementById('btA').value, x = Math.min(+document.getElementById('btX').value, n), sd = side();
    ['btN', 'btP', 'btA', 'btX'].forEach(id => { const o = document.querySelector('output[for="' + id + '"]'); const e = document.getElementById(id); o.textContent = e.dataset.fmt ? LB.fmt(+e.value, +e.dataset.fmt) : e.value; });
    const pm = [], F = []; let c = 0; for (let k = 0; k <= n; k++) { pm.push(S.binomPmf(k, n, p)); c += pm[k]; F.push(c); }
    const up = k => 1 - (k > 0 ? F[k - 1] : 0), lo = k => F[k];
    let inK;
    if (sd === 'gt') { let g = n + 1; for (let k = 0; k <= n; k++) if (up(k) <= a) { g = k; break; } inK = k => k >= g; }
    else if (sd === 'lt') { let g = -1; for (let k = n; k >= 0; k--) if (lo(k) <= a) { g = k; break; } inK = k => k <= g; }
    else { let gu = n + 1, gl = -1; for (let k = 0; k <= n; k++) if (up(k) <= a / 2) { gu = k; break; } for (let k = n; k >= 0; k--) if (lo(k) <= a / 2) { gl = k; break; } inK = k => k >= gu || k <= gl; }
    const ks = pm.map((_, k) => k), lvl = S.sum(ks.filter(inK).map(k => pm[k]));
    const pv = sd === 'gt' ? up(x) : sd === 'lt' ? lo(x) : Math.min(1, 2 * Math.min(up(x), lo(x)));
    LB.plot('btPlot', [{ type: 'bar', x: ks, y: pm, marker: { color: ks.map(k => inK(k) ? C.res : C.rule), line: { color: ks.map(k => k === x ? C.idx : 'rgba(0,0,0,0)'), width: 3 } } }],
      { height: 300, xaxis: { title: 'Anzahl x unter H₀: Bin(' + n + ', ' + LB.fmt(p, 2) + ')' }, yaxis: { title: 'P(X = x)' } });
    const K = ks.filter(inK), ks2 = K.length ? (K.length > 8 ? '{' + K.slice(0, 3).join(', ') + ', …, ' + K.slice(-2).join(', ') + '}' : '{' + K.join(', ') + '}') : '∅';
    document.getElementById('btOut').innerHTML = 'K = ' + ks2 + ' · tatsächliches Niveau P(X ∈ K) = ' + LB.fmt(lvl, 4) + ' ≤ α · Beobachtung x = ' + x + (inK(x) ? ' ∈ K → <b class="bad">H₀ verwerfen</b>' : ' ∉ K → <b class="ok">H₀ nicht verwerfen</b>') + ' · P-Wert = ' + LB.fmt(pv, 4);
  };
  side = segBind('btSeg', run);
  ['btN', 'btP', 'btA', 'btX'].forEach(id => document.getElementById(id).addEventListener('input', run)); run();
});

/* ---------------------------------------------------------------- Z-Test */
LB.on(function zTest() {
  if (!document.getElementById('ztPlot')) return;
  let side = () => 'ne';
  const run = () => {
    const a = +document.getElementById('ztA').value, z = +document.getElementById('ztZ').value, sd = side();
    document.querySelector('output[for="ztA"]').textContent = LB.fmt(a, 3); document.querySelector('output[for="ztZ"]').textContent = LB.fmt(z, 2);
    const f = x => S.normPdf(x), tr = [LB.curve(f, -4.5, 4.5, C.rule)];
    let crit, rej, pv;
    if (sd === 'ne') { crit = S.PhiInv(1 - a / 2); tr.push(LB.area(f, crit, 4.5, LB.rgba(C.res, 0.5)), LB.area(f, -4.5, -crit, LB.rgba(C.res, 0.5))); rej = Math.abs(z) >= crit; pv = 2 * (1 - S.Phi(Math.abs(z))); }
    else if (sd === 'gt') { crit = S.PhiInv(1 - a); tr.push(LB.area(f, crit, 4.5, LB.rgba(C.res, 0.5))); rej = z >= crit; pv = 1 - S.Phi(z); }
    else { crit = S.PhiInv(a); tr.push(LB.area(f, -4.5, crit, LB.rgba(C.res, 0.5))); rej = z <= crit; pv = S.Phi(z); }
    tr.push({ x: [z, z], y: [0, 0.42], mode: 'lines', line: { color: C.idx, width: 3 } });
    LB.plot('ztPlot', tr, { height: 280, xaxis: { title: 'Z unter H₀ ~ N(0,1)', range: [-4.5, 4.5] }, yaxis: { rangemode: 'tozero' } });
    const o = document.getElementById('ztOut');
    o.innerHTML = 'kritischer Wert \\(' + (sd === 'ne' ? '\\pm' : '') + LB.fmt(sd === 'lt' ? crit : crit, 3) + '\\) · rote Fläche = α = W\'keit für Fehler 1. Art · z = ' + LB.fmt(z, 2) + (rej ? ' → <b class="bad">verwerfen</b>' : ' → <b class="ok">nicht verwerfen</b>') + ' · P-Wert = ' + LB.fmt(pv, 4);
    LB.tex(o);
  };
  side = segBind('ztSeg', run);
  ['ztA', 'ztZ'].forEach(id => document.getElementById(id).addEventListener('input', run)); run();
  const tab = document.getElementById('tTab');
  if (tab) { const qs = [0.9, 0.95, 0.975, 0.99, 0.995], dfs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 25, 30, 40, 60, 100, Infinity];
    tab.innerHTML = '<table class="tbl" style="font-family:JetBrains Mono,monospace;font-size:.8rem"><tr><th>df</th>' + qs.map(q => '<th class="r">' + q + '</th>').join('') + '</tr>' +
      dfs.map(d => '<tr><td><b>' + (d === Infinity ? '∞' : d) + '</b></td>' + qs.map(q => '<td class="r">' + (d === Infinity ? S.PhiInv(q) : S.tInv(q, d)).toFixed(3) + '</td>').join('') + '</tr>').join('') + '</table>'; }
});

/* ---------------------------------------------------------------- Macht */
LB.on(function power() {
  if (!document.getElementById('pwPlot')) return;
  LB.bind(['pwD', 'pwN', 'pwA'], v => {
    const sh = v.pwD * Math.sqrt(v.pwN), c = S.PhiInv(1 - v.pwA), lo = -4, hi = Math.max(5, sh + 4);
    const pw = 1 - S.Phi(c - sh);
    LB.plot('pwPlot', [LB.area(x => S.normPdf(x, sh), c, hi, LB.rgba(C.idx, 0.4)), LB.area(x => S.normPdf(x), c, hi, LB.rgba(C.res, 0.6)),
      LB.curve(x => S.normPdf(x), lo, hi, C.rule, 300, { name: 'unter H₀' }), LB.curve(x => S.normPdf(x, sh), lo, hi, C.par, 300, { name: 'unter H_A' }),
      { x: [c, c], y: [0, 0.42], mode: 'lines', line: { color: C.res, width: 2.5 } }],
      { height: 300, showlegend: false, xaxis: { title: 'Teststatistik Z', range: [lo, hi] }, yaxis: { rangemode: 'tozero' } });
    const nd = Math.ceil(((S.PhiInv(1 - v.pwA) + S.PhiInv(0.9)) / Math.max(v.pwD, 1e-9)) ** 2);
    const o = document.getElementById('pwOut');
    o.innerHTML = 'Verschiebung \\(d\\sqrt n=' + LB.fmt(sh, 3) + '\\) · Grenze \\(z_{1-\\alpha}=' + LB.fmt(c, 3) + '\\) · <b class="ok">Macht \\(1-\\beta=' + LB.fmt(pw, 4) + '\\)</b> · \\(\\beta=' + LB.fmt(1 - pw, 4) + '\\) · für Macht 0.9 bräuchte man n = ' + (v.pwD > 0 ? nd : '∞');
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- P-Wert */
LB.on(function pval() {
  if (!document.getElementById('pvPlot')) return;
  let side = () => 'ne';
  const run = () => {
    const t = +document.getElementById('pvT').value, df = +document.getElementById('pvD').value, a = +document.getElementById('pvA').value, sd = side();
    document.querySelector('output[for="pvT"]').textContent = LB.fmt(t, 2); document.querySelector('output[for="pvD"]').textContent = df; document.querySelector('output[for="pvA"]').textContent = LB.fmt(a, 2);
    const f = x => S.tPdf(x, df), tr = [LB.curve(f, -6, 6, C.rule, 300)];
    let pv;
    if (sd === 'ne') { const at = Math.abs(t); tr.push(LB.area(f, at, 6, LB.rgba(C.par, 0.5)), LB.area(f, -6, -at, LB.rgba(C.par, 0.5))); pv = 2 * (1 - S.tCdf(at, df)); }
    else { tr.push(LB.area(f, t, 6, LB.rgba(C.par, 0.5))); pv = 1 - S.tCdf(t, df); }
    tr.push({ x: [t, t], y: [0, 0.42], mode: 'lines', line: { color: C.idx, width: 3 } });
    LB.plot('pvPlot', tr, { height: 280, xaxis: { title: 'T unter H₀ ~ t_' + df, range: [-6, 6] }, yaxis: { rangemode: 'tozero' } });
    document.getElementById('pvOut').innerHTML = 'P-Wert (blaue Fläche) = <b class="kw-res">' + LB.fmt(pv, 4) + '</b> ' + (pv <= a ? '≤ α → <span class="bad">🔴 verwerfen (signifikant)</span>' : '&gt; α → <span class="ok">🟢 nicht verwerfen</span>') + ' · kritischer Wert ' + LB.fmt(sd === 'ne' ? S.tInv(1 - a / 2, df) : S.tInv(1 - a, df), 3);
  };
  side = segBind('pvSeg', run);
  ['pvT', 'pvD', 'pvA'].forEach(id => document.getElementById(id).addEventListener('input', run)); run();
});

/* ---------------------------------------------------------------- Dualität */
LB.on(function duality() {
  if (!document.getElementById('duPlot')) return;
  LB.bind(['duM', 'duL'], v => {
    const m = 1002.63, s = 1.23, n = 10, se = s / Math.sqrt(n), q = S.tInv(1 - (1 - v.duL) / 2, n - 1), lo = m - q * se, hi = m + q * se, mu0 = v.duM;
    const inI = mu0 >= lo && mu0 <= hi, t = (m - mu0) / se, pv = 2 * (1 - S.tCdf(Math.abs(t), n - 1));
    LB.plot('duPlot', [{ x: [lo, hi, hi, lo, lo], y: [0.6, 0.6, 1.4, 1.4, 0.6], fill: 'toself', mode: 'none', fillcolor: LB.rgba(C.par, 0.3) }, { x: [m], y: [1], mode: 'markers', marker: { color: C.mem, size: 12, symbol: 'diamond' } },
      { x: [mu0, mu0], y: [0.2, 1.8], mode: 'lines', line: { color: inI ? C.idx : C.res, width: 4 } }],
      { height: 200, xaxis: { range: [998, 1006], title: 'μ' }, yaxis: { visible: false, range: [0, 2] } });
    document.getElementById('duOut').innerHTML = 'VI = [' + LB.fmt(lo, 3) + '; ' + LB.fmt(hi, 3) + '] · μ₀ = ' + LB.fmt(mu0, 2) + (inI ? ' liegt drin → <b class="ok">nicht verwerfen</b>' : ' liegt außerhalb → <b class="bad">verwerfen</b>') + ' · t = ' + LB.fmt(t, 3) + ', P-Wert = ' + LB.fmt(pv, 4) + ' (Grenze α = ' + LB.fmt(1 - v.duL, 2) + ')';
  });
});

/* ================================================================ Tracer */
LB.on(function tracers7() {
  new LB.Tracer({
    id: 'trBt', title: 'Verwerfungsbereich K = {g, …, n} suchen', langs: CODE('k7_binomtest'),
    vars: [['n', 'par', 'Anzahl geprüfter Teile'], ['p0', 'par', 'Sollwert unter H₀'], ['alpha', 'par', 'Niveau: erlaubte W\'keit für Fehler 1. Art'], ['x', 'mem', 'beobachtete Anzahl'],
      ['g', 'idx', 'Kandidat für die untere Grenze von K = {g, …, n}'], ['schwanz', 'chg', 'P(X ≥ g) unter H₀: Fehler-1.-Art-W\'keit dieses K'], ['pwert', 'res', 'P-Wert P(X ≥ x) unter H₀']],
    together: 'Die Grenze <span class="kw-idx">g</span> wird so lange nach rechts geschoben, bis die Schwanz-W\'keit <span class="kw-chg">schwanz</span> ≤ <span class="kw-par">alpha</span> ist: dann ist K = {g, …, n} der kleinste zulässige Verwerfungsbereich. Die Beobachtung <span class="kw-mem">x</span> wird damit verglichen; der <span class="kw-res">pwert</span> sagt dasselbe als Zahl.',
    say: s => (s.d.x >= s.g ? 'Mit ' + s.d.x + ' von ' + s.d.n + ' ist das Ergebnis unter H₀ (p = ' + s.d.p + ') so selten (P-Wert ' + LB.fmt(s.pv, 4) + ' ≤ ' + s.d.a + '), dass wir H₀ <b>verwerfen</b>: die Daten sprechen signifikant für einen höheren Anteil als ' + s.d.p + '.'
      : 'Mit ' + s.d.x + ' von ' + s.d.n + ' ist das Ergebnis unter H₀ (p = ' + s.d.p + ') nicht ungewöhnlich genug (P-Wert ' + LB.fmt(s.pv, 4) + ' &gt; ' + s.d.a + '). Wir können H₀ <b>nicht verwerfen</b>; das heißt nicht, dass H₀ bewiesen ist, die Daten reichen nur nicht für das Gegenteil.'),
    input: '50 0.05 0.05 6', hint: 'n p₀ α x', speed: 500,
    examples: [['Lieferant 5 %', '50 0.05 0.05 6'], ['Grundlage Bauteile', '20 0.1 0.05 5'], ['Münze 10 Würfe, x = 7', '10 0.5 0.05 7']],
    parse: s => { const v = S.parse(s); if (v.length !== 4) throw new Error('Format: n p0 alpha x'); const [n, p, a, x] = v; if (n < 1 || n > 200 || p <= 0 || p >= 1 || a <= 0 || a >= 0.5 || x < 0 || x > n) throw new Error('Wertebereiche prüfen'); return { n: Math.round(n), p, a, x: Math.round(x) }; },
    codeFor: (d, L, lines) => lines.map(l => /#@par\s*$/.test(l) ? (L === 'R' ? 'n <- ' + d.n + '; p0 <- ' + d.p + '; alpha <- ' + d.a + '; x <- ' + d.x : 'n, p0, alpha, x = ' + d.n + ', ' + d.p + ', ' + d.a + ', ' + d.x) + '   # H0: p = p0, HA: p > p0 #@par' : l),
    run(rec, d) {
      let g = 0, tail = null, pv = null; const tried = []; const st = () => ({ d, g, tail, tried: tried.slice(), pv });
      rec.step('par', '\\(H_0:p=' + d.p + '\\), \\(H_A:p>' + d.p + '\\), n = ' + d.n + ', α = ' + d.a + '.', st());
      rec.step('c0', 'Grenze g beginnt bei 0.', st());
      while (true) {
        rec.step('loop', 'Kandidat \\(g=' + g + '\\).', st());
        tail = 1 - S.binomCdf(g - 1, d.n, d.p); tried.push([g, tail]);
        rec.step('tail', '\\(\\PP_{p_0}(X\\ge' + g + ')=' + LB.fmt(tail, 4) + '\\)', st());
        if (tail <= d.a) { rec.step('if', LB.fmt(tail, 4) + ' ≤ α → gefunden: \\(K=\\{' + g + ',\\dots,' + d.n + '\\}\\).', st()); break; }
        rec.step('if', LB.fmt(tail, 4) + ' &gt; α → noch zu wahrscheinlich.', st());
        g++; rec.step('inc', 'g = ' + g + '.', st());
      }
      pv = 1 - S.binomCdf(d.x - 1, d.n, d.p);
      rec.step('p', 'P-Wert \\(=\\PP_{p_0}(X\\ge' + d.x + ')=\\Res{' + LB.fmt(pv, 4) + '}\\)', st());
      rec.step('out', 'x = ' + d.x + (d.x >= g ? ' ∈ K → <b class="bad">H₀ verwerfen</b>' : ' ∉ K → <b class="ok">H₀ nicht verwerfen</b>'), st());
    },
    view: s => '<table class="tbl"><tr><th>g</th><th class="r">P(X ≥ g)</th><th>≤ α?</th></tr>' + s.tried.map(r => '<tr><td class="kw-idx">' + r[0] + '</td><td class="r kw-chg">' + LB.fmt(r[1], 4) + '</td><td>' + (r[1] <= s.d.a ? '<span class="ok">ja</span>' : 'nein') + '</td></tr>').join('') + '</table>' +
      LB.kvHTML([['g', s.g, 'idx'], ['α', s.d.a, 'par'], ['x', s.d.x, 'mem'], ['P-Wert', s.pv === null ? '–' : LB.fmt(s.pv, 4), 'res']])
  });

  new LB.Tracer({
    id: 'trTt', title: 't-Test Schritt für Schritt', langs: CODE('k7_ttest'),
    vars: [['x', 'mem', 'Messwerte'], ['mu0', 'par', 'Sollwert unter H₀'], ['alpha', 'par', 'Niveau (zweiseitig)'], ['n', 'par', 'Stichprobenumfang'], ['xbar|s', 'mem', 'Mittel und Standardabweichung der Daten'],
      ['se', 'rule', 'geschätzter Standardfehler s/√n'], ['t', 'res', 'Teststatistik: Abstand x̄ − μ₀ in Standardfehlern'], ['krit', 'rule', 'kritischer Wert t_{n−1, 1−α/2}'], ['p', 'res', 'P-Wert'], ['vi', 'res', 'Vertrauensintervall für μ']],
    together: 'Die Daten liefern <span class="kw-mem">xbar</span> und <span class="kw-mem">s</span>, daraus den Standardfehler <span class="kw-rule">se</span>. <span class="kw-res">t</span> misst, wie viele Standardfehler das Mittel vom Sollwert entfernt ist. Ist |t| ≥ <span class="kw-rule">krit</span> (gleichbedeutend: p ≤ α, oder μ₀ liegt nicht im VI), wird H₀ verworfen.',
    say: (s, d) => (Math.abs(s.t) >= s.k ? 'Das Mittel ' + LB.fmt(s.xbar, 3) + ' weicht signifikant vom Sollwert ' + d.m0 + ' ab (t = ' + LB.fmt(s.t, 2) + ', P-Wert ' + LB.fmt(s.p, 4) + '). '
      : 'Das Mittel ' + LB.fmt(s.xbar, 3) + ' weicht nicht signifikant vom Sollwert ' + d.m0 + ' ab (t = ' + LB.fmt(s.t, 2) + ', P-Wert ' + LB.fmt(s.p, 4) + '). ') + 'Plausible Werte für den wahren Erwartungswert liegen zwischen ' + LB.fmt(s.lo, 3) + ' und ' + LB.fmt(s.hi, 3) + '.',
    input: '5.1 4.9 5.6 5.8 5.3 5.5 5.2 5.4 ; 5 ; 0.05', hint: 'Daten ; μ₀ ; α (zweiseitig)',
    examples: [['acht Messungen', '5.1 4.9 5.6 5.8 5.3 5.5 5.2 5.4 ; 5 ; 0.05'], ['Füllmengen', '1002.1 1003.4 999.2 1001.8 1004.0 1002.9 1000.6 1003.1 1001.2 1002.5 ; 1000 ; 0.05'], ['kein Effekt', '10.2 9.8 10.1 9.7 10.3 9.9 ; 10 ; 0.05']],
    parse: s => { const p = s.split(';'); if (p.length !== 3) throw new Error('Format: Daten ; mu0 ; alpha'); const x = S.parse(p[0]), m0 = parseFloat(p[1]), a = parseFloat(p[2]);
      if (x.length < 2 || isNaN(m0) || !(a > 0 && a < 0.5)) throw new Error('mindestens 2 Werte, 0 < α < 0.5'); return { x, m0, a }; },
    codeFor: (d, L, lines) => lines.map(l => /#@data\s*$/.test(l) ? (L === 'R' ? 'x <- c(' + d.x.join(', ') + ')' : 'x = np.array([' + d.x.join(', ') + '])') + '   # Messwerte #@data' :
      /#@par\s*$/.test(l) ? (L === 'R' ? 'mu0 <- ' + d.m0 + '; alpha <- ' + d.a : 'mu0, alpha = ' + d.m0 + ', ' + d.a) + '   # Sollwert, Niveau #@par' : l),
    run(rec, d) {
      const n = d.x.length, v = { xbar: null, s: null, se: null, t: null, k: null, p: null, lo: null, hi: null }; const st = () => Object.assign({ n }, v);
      rec.step('data', n + ' Messwerte.', st());
      rec.step('par', '\\(H_0:\\mu=' + d.m0 + '\\), \\(H_A:\\mu\\ne' + d.m0 + '\\), α = ' + d.a + '.', st());
      rec.step('n', 'n = ' + n + ', Freiheitsgrade ' + (n - 1) + '.', st());
      v.xbar = S.mean(d.x); v.s = S.sd(d.x); rec.step('ms', '\\(\\bar x=' + LB.fmt(v.xbar, 4) + '\\), \\(s=' + LB.fmt(v.s, 4) + '\\)', st());
      v.se = v.s / Math.sqrt(n); rec.step('se', '\\(\\operatorname{SE}=' + LB.fmt(v.se, 4) + '\\)', st());
      v.t = (v.xbar - d.m0) / v.se; rec.step('t', '\\(\\Res{t}=\\tfrac{' + LB.fmt(v.xbar, 4) + '-' + d.m0 + '}{' + LB.fmt(v.se, 4) + '}=\\Res{' + LB.fmt(v.t, 4) + '}\\)', st());
      v.k = S.tInv(1 - d.a / 2, n - 1); rec.step('krit', '\\(t_{' + (n - 1) + ',' + LB.fmt(1 - d.a / 2, 3) + '}=' + LB.fmt(v.k, 4) + '\\)', st());
      v.p = 2 * (1 - S.tCdf(Math.abs(v.t), n - 1)); rec.step('p', 'P-Wert \\(=' + LB.fmt(v.p, 4) + '\\)', st());
      v.lo = v.xbar - v.k * v.se; v.hi = v.xbar + v.k * v.se; rec.step('vi', 'VI \\(=[' + LB.fmt(v.lo, 4) + ';\\ ' + LB.fmt(v.hi, 4) + ']\\)' + (d.m0 >= v.lo && d.m0 <= v.hi ? ', enthält μ₀' : ', enthält μ₀ nicht'), st());
      rec.step('out', Math.abs(v.t) >= v.k ? '<b class="bad">|t| ≥ kritischer Wert → H₀ verwerfen</b>' : '<b class="ok">|t| &lt; kritischer Wert → H₀ nicht verwerfen</b>', st());
    },
    view: s => LB.kvHTML([['x̄', s.xbar === null ? '–' : LB.fmt(s.xbar, 4), 'mem'], ['s', s.s === null ? '–' : LB.fmt(s.s, 4), 'mem'], ['SE', s.se === null ? '–' : LB.fmt(s.se, 4), 'rule'], ['t', s.t === null ? '–' : LB.fmt(s.t, 4), 'res'],
      ['krit', s.k === null ? '–' : LB.fmt(s.k, 4), 'rule'], ['P-Wert', s.p === null ? '–' : LB.fmt(s.p, 4), 'res'], ['VI unten', s.lo === null ? '–' : LB.fmt(s.lo, 4), 'res'], ['VI oben', s.hi === null ? '–' : LB.fmt(s.hi, 4), 'res']])
  });
});

/* ---------------------------------------------------------------- Training */
LB.on(function train7() {
  if (!document.getElementById('q7Task')) return;
  const r = S.rng(Date.now() % 4242); let cur; const pick = a => a[Math.floor(r() * a.length)];
  const neu = () => {
    const kind = pick(['z', 't']), n = pick([9, 16, 25, 36]), m0 = pick([50, 100, 20]), sd = pick([4, 6, 10]), off = pick([-1.5, -0.6, 0.4, 1, 2]) * sd / Math.sqrt(n), xb = Math.round((m0 + off) * 100) / 100;
    const stat = (xb - m0) / (sd / Math.sqrt(n)), p = kind === 'z' ? 2 * (1 - S.Phi(Math.abs(stat))) : 2 * (1 - S.tCdf(Math.abs(stat), n - 1));
    cur = { stat, p, kind, n };
    document.getElementById('q7Task').innerHTML = 'n = ' + n + ' Messungen, x̄ = ' + xb + ', ' + (kind === 'z' ? 'σ = ' + sd + ' <b>bekannt</b>' : 's = ' + sd + ' (σ <b>unbekannt</b>)') + '. Teste zweiseitig \\(H_0:\\mu=' + m0 + '\\). Gib die Teststatistik und den P-Wert an (4 Stellen).';
    LB.tex(document.getElementById('q7Task'));
    ['q7s', 'q7p'].forEach(id => document.getElementById(id).value = ''); document.getElementById('q7Res').innerHTML = '';
  };
  document.getElementById('q7New').addEventListener('click', neu);
  document.getElementById('q7Chk').addEventListener('click', () => {
    const a = parseFloat(document.getElementById('q7s').value.replace(',', '.')), b = parseFloat(document.getElementById('q7p').value.replace(',', '.'));
    document.getElementById('q7Res').innerHTML = (Math.abs(a - cur.stat) < 6e-3 ? '<span class="ok">✔ ' : '<span class="bad">✗ ') + (cur.kind === 'z' ? 'z' : 't') + ' = ' + LB.fmt(cur.stat, 4) + '</span> · ' +
      (Math.abs(b - cur.p) < 2e-3 ? '<span class="ok">✔ ' : '<span class="bad">✗ ') + 'P-Wert = ' + LB.fmt(cur.p, 4) + '</span> · ' + (cur.kind === 'z' ? 'Z-Test, Φ' : 't-Test mit df = ' + (cur.n - 1)) + ' · Entscheidung bei α = 0.05: ' + (cur.p <= 0.05 ? 'verwerfen' : 'nicht verwerfen');
  });
  neu();
});
