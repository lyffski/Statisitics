/* Kapitel 4 · Mehrdimensionale Verteilungen: Visuals, Tracer, Training */
LB.KW = [
  ['Zufallsvariablen', 'mem'], ['Paar', 'mem'],
  ['gemeinsame Verteilung', 'rule'], ['gemeinsame Dichte', 'rule'], ['Kovarianz', 'rule'], ['Korrelation', 'rule'], ['Kovarianzmatrix', 'rule'],
  ['Unabhängigkeit', 'rule'], ['unabhängig', 'rule'], ['abhängig', 'rule'], ['unkorreliert', 'rule'], ['Linearität', 'rule'], ['Normalverteilung', 'rule'],
  ['Randverteilung', 'chg'], ['Randdichte', 'chg'], ['Faltung', 'chg'], ['wegsummieren', 'chg'], ['herausintegrieren', 'chg'],
  ['bedingte', 'cond'], ['bedingten', 'cond'], ['Bereich', 'cond']
];
const S = LB.S, C = LB.C;

/* ---------------------------------------------------------------- Heatmap */
LB.on(function heat() {
  if (!document.getElementById('hmPlot')) return;
  const P = [[0.080, 0.015, 0.003, 0.002], [0.050, 0.350, 0.050, 0.050], [0.030, 0.060, 0.180, 0.030], [0.001, 0.002, 0.007, 0.090]];
  const pX = P.map(r => S.sum(r)), pY = [0, 1, 2, 3].map(j => S.sum(P.map(r => r[j]))), Q = pX.map(a => pY.map(b => a * b));
  const draw = v => {
    const Z = v === 'joint' ? P : v === 'prod' ? Q : P.map((r, i) => r.map((p, j) => p - Q[i][j]));
    const div = v === 'diff';
    LB.plot('hmPlot', [{ type: 'heatmap', z: Z, x: ['Y=1', 'Y=2', 'Y=3', 'Y=4'], y: ['X=1', 'X=2', 'X=3', 'X=4'], text: Z.map(r => r.map(p => p.toFixed(3))), texttemplate: '%{text}',
      colorscale: div ? [[0, C.par], [0.5, '#161b22'], [1, C.res]] : [[0, '#161b22'], [1, C.rule]], zmid: div ? 0 : undefined, zmin: div ? -0.15 : 0, zmax: div ? 0.15 : 0.36, showscale: false, hoverinfo: 'skip' }],
      { height: 320, yaxis: { autorange: 'reversed' }, margin: { l: 60, r: 10, t: 10, b: 40 } });
    LB.$$('#hmSeg .btn').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  };
  document.getElementById('hmSeg').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) draw(b.dataset.v); });
  draw('joint');
});

/* ---------------------------------------------------------------- P(Y<X) Exp */
LB.on(function expRace() {
  if (!document.getElementById('exlOut')) return;
  LB.bind(['exl1', 'exl2'], v => { const o = document.getElementById('exlOut'); o.innerHTML = '\\(\\PP(\\mY<\\mX)=\\tfrac{' + v.exl2 + '}{' + v.exl1 + '+' + v.exl2 + '}=\\Res{' + LB.fmt(v.exl2 / (v.exl1 + v.exl2), 4) + '}\\) · mittlere Lebensdauern \\(1/\\lambda_1=' + LB.fmt(1 / v.exl1, 2) + '\\), \\(1/\\lambda_2=' + LB.fmt(1 / v.exl2, 2) + '\\)'; LB.tex(o); });
});

/* ---------------------------------------------------------------- Var(X±Y) */
LB.on(function varSum() {
  if (!document.getElementById('vsPlot')) return;
  LB.bind(['vsX', 'vsY', 'vsR'], v => {
    const cov = v.vsR * Math.sqrt(v.vsX * v.vsY), sp = v.vsX + v.vsY + 2 * cov, sm = v.vsX + v.vsY - 2 * cov;
    LB.plot('vsPlot', [{ type: 'bar', orientation: 'h', y: ['Var(X−Y)', 'Var(X+Y)'], x: [v.vsX, v.vsX], name: 'Var(X)', marker: { color: C.mem } },
      { type: 'bar', orientation: 'h', y: ['Var(X−Y)', 'Var(X+Y)'], x: [v.vsY, v.vsY], name: 'Var(Y)', marker: { color: C.par } },
      { type: 'bar', orientation: 'h', y: ['Var(X−Y)', 'Var(X+Y)'], x: [-2 * cov, 2 * cov], name: '±2Cov', marker: { color: C.chg } }],
      { height: 240, barmode: 'relative', showlegend: true, margin: { l: 80, r: 20, t: 30, b: 35 }, xaxis: { title: 'Varianz' } });
    const o = document.getElementById('vsOut');
    o.innerHTML = '\\(\\Cov=\\rho\\sigma_X\\sigma_Y=' + LB.fmt(cov, 3) + '\\) · \\(\\Var(\\mX+\\mY)=\\Res{' + LB.fmt(sp, 3) + '}\\) · \\(\\Var(\\mX-\\mY)=\\Res{' + LB.fmt(sm, 3) + '}\\)';
    LB.tex(o);
  });
});

/* ---------------------------------------------------------------- 2D-Normal */
LB.on(function biNorm() {
  if (!document.getElementById('bnPlot')) return;
  const r0 = S.rng(9), Z = []; for (let i = 0; i < 400; i++) Z.push([r0.norm(), r0.norm()]);
  LB.bind(['bnR', 'bnL'], v => {
    const rho = v.bnR, xs = Z.map(z => z[0]), ys = Z.map(z => rho * z[0] + Math.sqrt(1 - rho * rho) * z[1]);
    const g = []; for (let i = 0; i <= 60; i++) g.push(-3 + 6 * i / 60);
    const zz = g.map(y => g.map(x => Math.exp(-(x * x - 2 * rho * x * y + y * y) / (2 * (1 - rho * rho))) / (2 * Math.PI * Math.sqrt(1 - rho * rho))));
    const tr = [{ type: 'contour', x: g, y: g, z: zz, contours: { coloring: 'lines' }, colorscale: [[0, C.rule], [1, C.rule]], showscale: false, line: { width: 1.5 }, ncontours: 7, hoverinfo: 'skip' },
      { x: xs, y: ys, mode: 'markers', marker: { color: LB.rgba(C.mem, 0.55), size: 5 }, hoverinfo: 'skip' }];
    if (v.bnL) tr.push({ x: [-3, 3], y: [-3 * rho, 3 * rho], mode: 'lines', line: { color: C.chg, width: 3 }, hoverinfo: 'skip' });
    LB.plot('bnPlot', tr, { height: 380, xaxis: { range: [-3, 3], title: 'x (standardisiert)', scaleanchor: 'y' }, yaxis: { range: [-3, 3], title: 'y' },
      annotations: [{ xref: 'paper', yref: 'paper', x: 0.02, y: 0.98, showarrow: false, text: 'empirisch r = ' + LB.fmt(S.cor(xs, ys), 3), font: { color: C.res } }] });
  });
  const r1 = S.rng(4), ax = [], ay = [], cx = [], cy = [];
  for (let i = 0; i < 300; i++) { ax.push(r1.norm()); ay.push(r1.norm()); const t = 2 * Math.PI * r1(); cx.push(Math.cos(t) * 1.8 + 0.08 * r1.norm()); cy.push(Math.sin(t) * 1.8 + 0.08 * r1.norm()); }
  LB.plot('ucPlot', [{ x: ax, y: ay, mode: 'markers', marker: { color: C.par, size: 5 }, xaxis: 'x', yaxis: 'y' }, { x: cx, y: cy, mode: 'markers', marker: { color: C.res, size: 5 }, xaxis: 'x2', yaxis: 'y2' }],
    { height: 320, grid: { rows: 1, columns: 2, pattern: 'independent' }, xaxis: { range: [-3, 3] }, yaxis: { range: [-3, 3] }, xaxis2: { range: [-3, 3], gridcolor: '#252b33', zeroline: false }, yaxis2: { range: [-3, 3], gridcolor: '#252b33', zeroline: false },
      annotations: [{ xref: 'x domain', yref: 'y domain', x: 0.02, y: 0.98, showarrow: false, text: 'unabhängig, r = ' + LB.fmt(S.cor(ax, ay), 3), font: { color: C.par } },
        { xref: 'x2 domain', yref: 'y2 domain', x: 0.02, y: 0.98, showarrow: false, text: 'Kreis (abhängig), r = ' + LB.fmt(S.cor(cx, cy), 3), font: { color: C.res } }] });
});

/* ---------------------------------------------------------------- Faltung Uni(3,5)+Uni(6,10) */
LB.on(function convo() {
  if (!document.getElementById('fvTop')) return;
  const fX = x => (x >= 3 && x <= 5) ? 0.5 : 0, fY = y => (y >= 6 && y <= 10) ? 0.25 : 0;
  const fS = s => { const lo = Math.max(3, s - 10), hi = Math.min(5, s - 6); return hi > lo ? (hi - lo) * 0.125 : 0; };
  LB.bind(['fvS'], v => {
    const s = v.fvS, xs = []; for (let i = 0; i <= 400; i++) xs.push(-8 + 22 * i / 400);
    const lo = Math.max(3, s - 10), hi = Math.min(5, s - 6);
    const tr = [{ x: xs, y: xs.map(fX), mode: 'lines', line: { color: C.par, width: 2.5, shape: 'hv' }, name: 'f_X(x)' },
      { x: xs, y: xs.map(x => fY(s - x)), mode: 'lines', line: { color: C.chg, width: 2.5, dash: 'dash' }, name: 'f_Y(s − x)' }];
    if (hi > lo) tr.push({ x: [lo, lo, hi, hi], y: [0, 0.125, 0.125, 0], fill: 'toself', mode: 'none', fillcolor: LB.rgba(C.rule, 0.45), name: 'Produkt' });
    LB.plot('fvTop', tr, { height: 230, showlegend: true, xaxis: { range: [-8, 14], title: 'x' }, yaxis: { range: [0, 0.6] } });
    const ss = []; for (let i = 0; i <= 200; i++) ss.push(8 + 8 * i / 200);
    LB.plot('fvBot', [{ x: ss, y: ss.map(fS), mode: 'lines', line: { color: C.rule, width: 2.5 }, fill: 'tozeroy', fillcolor: LB.rgba(C.rule, 0.15) },
      { x: [s], y: [fS(s)], mode: 'markers', marker: { color: C.res, size: 12 } }],
      { height: 230, xaxis: { range: [8, 16], title: 's' }, yaxis: { range: [0, 0.3], title: 'f_S(s)' },
        annotations: [{ x: s, y: fS(s) + 0.03, text: 'f_S(' + LB.fmt(s, 1) + ') = ' + LB.fmt(fS(s), 4), showarrow: false, font: { color: C.res } }] });
  });
});

/* ================================================================ Tracer */
LB.on(function tracers4() {
  const vR = a => 'c(' + a.join(', ') + ')', vP = a => 'np.array([' + a.join(', ') + '])';
  new LB.Tracer({
    id: 'trTab', title: 'Ränder, E[XY], Cov, Corr aus einer Tabelle', langs: CODE('k4_tabelle'),
    vars: [['x|y', 'mem', 'Werte von X (Zeilen) und Y (Spalten)'], ['P', 'par', 'gemeinsame Tabelle P(X = x, Y = y)'], ['pX|pY', 'chg', 'Randverteilungen: Zeilen- bzw. Spaltensummen'],
      ['EX|EY', 'chg', 'Erwartungswerte aus den Rändern'], ['i|j', 'idx', 'Zeile und Spalte des aktuellen Feldes'], ['EXY', 'chg', 'E[XY]: braucht die ganze Tabelle'], ['covXY', 'res', 'Kovarianz E[XY] − E[X]E[Y]'],
      ['VX|VY', 'chg', 'Varianzen aus den Rändern'], ['rho', 'res', 'Korrelation, zwischen −1 und 1'], ['unabh', 'res', 'ist jedes Feld gleich dem Produkt seiner Ränder?']],
    together: 'Die Ränder (<span class="kw-chg">pX</span>, <span class="kw-chg">pY</span>) reichen für E[X], E[Y] und die Varianzen. Für <span class="kw-chg">EXY</span> muss jedes Feld (<span class="kw-idx">i</span>, <span class="kw-idx">j</span>) besucht werden. Kovarianz = EXY minus Produkt der Erwartungen; geteilt durch die Standardabweichungen ergibt sich <span class="kw-res">rho</span>. Unabhängigkeit ist strenger: jedes Feld muss Produkt der Ränder sein.',
    say: s => 'Die Kovarianz ist ' + LB.fmt(s.cov, 4) + ', die Korrelation ρ = ' + LB.fmt(s.rho, 3) + ': ' + (Math.abs(s.rho) < 0.05 ? 'praktisch kein linearer Zusammenhang' : (s.rho > 0 ? 'große X gehen tendenziell mit großen Y einher' : 'große X gehen tendenziell mit kleinen Y einher') + (Math.abs(s.rho) < 0.3 ? ' (schwach)' : '')) + '. X und Y sind ' + (s.ind ? '<b>unabhängig</b>: Wissen über X ändert nichts an der Verteilung von Y.' : '<b>abhängig</b>: die Verteilung von Y hängt davon ab, welches x vorliegt' + (Math.abs(s.cov) < 1e-9 ? ', obwohl die Kovarianz 0 ist (unkorreliert ≠ unabhängig).' : '.')),
   
    input: '0 1 2 ; 0 1 ; 0.10 0.20 0.15 0.25 0.05 0.25', hint: 'x-Werte ; y-Werte ; Tabelle zeilenweise',
    examples: [['Kinder und Auto', '0 1 2 ; 0 1 ; 0.10 0.20 0.15 0.25 0.05 0.25'], ['2×2 (Grundlage)', '0 1 ; 0 1 ; 0.4 0.1 0.2 0.3'], ['unabhängig', '0 1 ; 0 1 ; 0.12 0.28 0.18 0.42'], ['X, Y = X² (unkorreliert!)', '-1 0 1 ; 0 1 ; 0 0.3333333 0.3333334 0 0 0.3333333']],
    parse: s => { const p = s.split(';').map(S.parse); if (p.length !== 3) throw new Error('Format: x ; y ; Tabelle');
      const [x, y, t] = p; if (t.length !== x.length * y.length) throw new Error('Tabelle braucht ' + x.length + '·' + y.length + ' Einträge');
      if (Math.abs(S.sum(t) - 1) > 1e-5 || t.some(q => q < 0)) throw new Error('Einträge ≥ 0 mit Summe 1 (jetzt ' + LB.fmt(S.sum(t), 4) + ')');
      return { x, y, P: x.map((_, i) => t.slice(i * y.length, (i + 1) * y.length)) }; },
    codeFor: (d, L, lines) => {
      const out = []; let skip = false;
      lines.forEach(l => {
        if (/#@x\s*$/.test(l)) { out.push((L === 'R' ? 'x <- ' + vR(d.x) : 'x = ' + vP(d.x)) + '   # Werte von X #@x'); return; }
        if (/#@y\s*$/.test(l)) { out.push((L === 'R' ? 'y <- ' + vR(d.y) : 'y = ' + vP(d.y)) + '   # Werte von Y #@y'); return; }
        if (/#@P\s*$/.test(l)) { skip = true; out.push(L === 'R' ? 'P <- matrix(c(' + d.P.map(r => r.join(', ')).join(',  ') + '), nrow = ' + d.x.length + ', byrow = TRUE)   # gemeinsame Tabelle #@P' : 'P = np.array([' + d.P.map(r => '[' + r.join(', ') + ']').join(', ') + '])   # gemeinsame Tabelle #@P'); return; }
        if (skip) { if (/#@pX\s*$/.test(l)) skip = false; else return; }
        out.push(l);
      });
      return out;
    },
    run(rec, d) {
      const { x, y, P } = d; let pX = null, pY = null, EX = null, EY = null, EXY = 0, cov = null, VX = null, VY = null, rho = null, cur = null, ind = null;
      const st = () => ({ x, y, P, pX, pY, EX, EY, EXY, cov, VX, VY, rho, cur, ind });
      rec.step('x', 'Werte von X.', st()); rec.step('y', 'Werte von Y.', st()); rec.step('P', 'Gemeinsame Tabelle eingelesen (Summe 1).', st());
      pX = P.map(r => S.sum(r)); rec.step('pX', 'Rand von X = Zeilensummen: (' + pX.map(v => LB.fmt(v, 3)).join(', ') + ')', st());
      pY = y.map((_, j) => S.sum(P.map(r => r[j]))); rec.step('pY', 'Rand von Y = Spaltensummen: (' + pY.map(v => LB.fmt(v, 3)).join(', ') + ')', st());
      EX = S.sum(x.map((v, i) => v * pX[i])); EY = S.sum(y.map((v, j) => v * pY[j]));
      rec.step('E', '\\(\\EE[\\mX]=' + LB.fmt(EX, 4) + ',\\ \\EE[\\mY]=' + LB.fmt(EY, 4) + '\\)', st());
      rec.step('exy0', '\\(\\EE[\\mX\\mY]\\) startet bei 0.', st());
      for (let i = 0; i < x.length; i++) for (let j = 0; j < y.length; j++) {
        cur = [i, j]; rec.step('loop', 'Feld (' + x[i] + ', ' + y[j] + ').', st());
        EXY += x[i] * y[j] * P[i][j]; rec.step('exy', '\\(' + x[i] + '\\cdot' + y[j] + '\\cdot' + P[i][j] + '=' + LB.fmt(x[i] * y[j] * P[i][j], 4) + '\\) → \\(\\EE[\\mX\\mY]=' + LB.fmt(EXY, 4) + '\\)', st());
      }
      cur = null; cov = EXY - EX * EY;
      rec.step('cov', '\\(\\Res{\\Cov}=' + LB.fmt(EXY, 4) + '-' + LB.fmt(EX, 4) + '\\cdot' + LB.fmt(EY, 4) + '=\\Res{' + LB.fmt(cov, 4) + '}\\)', st());
      VX = S.sum(x.map((v, i) => v * v * pX[i])) - EX * EX; VY = S.sum(y.map((v, j) => v * v * pY[j])) - EY * EY;
      rec.step('var', '\\(\\Var(\\mX)=' + LB.fmt(VX, 4) + ',\\ \\Var(\\mY)=' + LB.fmt(VY, 4) + '\\)', st());
      rho = cov / Math.sqrt(VX * VY); rec.step('rho', '\\(\\Res{\\rho}=\\tfrac{' + LB.fmt(cov, 4) + '}{\\sqrt{' + LB.fmt(VX, 4) + '\\cdot' + LB.fmt(VY, 4) + '}}=\\Res{' + LB.fmt(rho, 4) + '}\\)', st());
      ind = P.every((r, i) => r.every((p, j) => Math.abs(p - pX[i] * pY[j]) < 1e-6));
      rec.step('ind', ind ? '<b class="ok">jedes Feld = Produkt der Ränder → unabhängig</b>' : '<b class="bad">mindestens ein Feld ≠ Produkt der Ränder → abhängig</b>' + (Math.abs(cov) < 1e-9 ? ' (obwohl Cov = 0: unkorreliert ≠ unabhängig!)' : ''), st());
      rec.step('out', 'Ausgabe: Cov = ' + LB.fmt(cov, 4) + ', Corr = ' + LB.fmt(rho, 4) + ', unabhängig: ' + ind, st());
    },
    view: s => {
      let h = '<table class="tbl"><tr><th>X \\ Y</th>' + s.y.map(v => '<th class="r">' + v + '</th>').join('') + '<th class="r">P(X)</th></tr>';
      s.x.forEach((xv, i) => { h += '<tr><td class="kw-mem">' + xv + '</td>' + s.y.map((_, j) => '<td class="r"' + (s.cur && s.cur[0] === i && s.cur[1] === j ? ' style="outline:2px solid var(--chg)"' : '') + '>' + s.P[i][j] + '</td>').join('') + '<td class="r kw-chg">' + (s.pX ? LB.fmt(s.pX[i], 3) : '·') + '</td></tr>'; });
      h += '<tr><td>P(Y)</td>' + s.y.map((_, j) => '<td class="r kw-chg">' + (s.pY ? LB.fmt(s.pY[j], 3) : '·') + '</td>').join('') + '<td></td></tr></table>';
      return h + LB.kvHTML([['EX', s.EX === null ? '–' : LB.fmt(s.EX, 4), 'chg'], ['EY', s.EY === null ? '–' : LB.fmt(s.EY, 4), 'chg'], ['EXY', LB.fmt(s.EXY, 4), 'chg'], ['Cov', s.cov === null ? '–' : LB.fmt(s.cov, 4), 'res'], ['Corr', s.rho === null ? '–' : LB.fmt(s.rho, 4), 'res']]);
    }
  });

  new LB.Tracer({
    id: 'trFalt', title: 'P(S = s) durch Faltung', langs: CODE('k4_faltung'),
    vars: [['pX', 'par', 'Verteilung von X: pX[k] = P(X = k)'], ['pY', 'par', 'Verteilung von Y: pY[j] = P(Y = j)'], ['pS', 'res', 'Ergebnis: pS[s] = P(S = s), wird Summand für Summand aufgefüllt'],
      ['s', 'idx', 'äußere Schleife: die Summe, deren W\'keit gerade berechnet wird'], ['k', 'chg', 'innere Schleife: Aufteilung s = k + (s − k), also X = k und Y = s − k']],
    together: 'Für jede Summe <span class="kw-idx">s</span> (außen) werden alle Aufteilungen s = <span class="kw-chg">k</span> + (s − k) durchprobiert (innen). Ist Y = s − k ein möglicher Wert, kommt der Beitrag <span class="kw-par">pX</span>[k] · <span class="kw-par">pY</span>[s − k] dazu: Produkt wegen Unabhängigkeit, Summe weil sich die Aufteilungen gegenseitig ausschließen. Am Ende steht in <span class="kw-res">pS</span> die ganze Verteilung von S = X + Y.',
    say: s => { let j = 2; s.pS.forEach((v, i) => { if (v > s.pS[j]) j = i; }); const E = LB.S.sum(s.pS.map((p, i) => i * p));
      return 'Die wahrscheinlichste Summe ist s = ' + j + ' (P = ' + LB.fmt(s.pS[j], 3) + '). Im Mittel ist S = ' + LB.fmt(E, 3) + ', genau E[X] + E[Y]. Die Summe hat mehr mögliche Werte als X und Y einzeln, und die Werte in der Mitte sind häufiger als die Ränder, weil es für sie mehr Aufteilungen gibt.'; },
    speed: 350,
    input: '1 1 1 1 1 1 ; 1 1 1 1 1 1', hint: 'Gewichte von X ; Gewichte von Y (werden normiert, Werte 1, 2, …)',
    examples: [['zwei faire Würfel', '1 1 1 1 1 1 ; 1 1 1 1 1 1'], ['Münze (1/2) + Würfel', '1 1 ; 1 1 1 1 1 1'], ['gezinkt + fair', '1 1 1 1 1 2 ; 1 1 1 1 1 1']],
    parse: s => { const [a, b] = s.split(';'); if (b === undefined) throw new Error('Format: Gewichte X ; Gewichte Y');
      let p = S.parse(a), q = S.parse(b); if (!p.length || !q.length || p.length > 8 || q.length > 8 || p.concat(q).some(v => v < 0)) throw new Error('1 bis 8 nicht-negative Gewichte je Seite');
      const sp = S.sum(p), sq = S.sum(q); return { p: p.map(v => v / sp), q: q.map(v => v / sq) }; },
    codeFor: (d, L, lines) => lines.map(l => /#@pX\s*$/.test(l) ? (L === 'R' ? 'pX <- ' + vR(d.p.map(v => +v.toFixed(4))) : 'pX = ' + vP(d.p.map(v => +v.toFixed(4)))) + '   # X: Werte 1 bis ' + d.p.length + ' #@pX' :
      /#@pY\s*$/.test(l) ? (L === 'R' ? 'pY <- ' + vR(d.q.map(v => +v.toFixed(4))) : 'pY = ' + vP(d.q.map(v => +v.toFixed(4)))) + '   # Y: Werte 1 bis ' + d.q.length + ' #@pY' : l),
    run(rec, d) {
      const m = d.p.length, n = d.q.length, pS = new Array(m + n + 1).fill(0); let s = 0, k = 0;
      const st = () => ({ d, pS: pS.slice(), s, k });
      rec.step('pX', 'Verteilung von X.', st()); rec.step('pY', 'Verteilung von Y.', st()); rec.step('pS0', 'Alle P(S = s) auf 0.', st());
      for (s = 2; s <= m + n; s++) {
        rec.step('loopS', 'Summe \\(\\Idx{s}=' + s + '\\).', st());
        for (k = 1; k <= m; k++) {
          rec.step('loopK', 'Aufteilung X = ' + k + ', also Y = ' + (s - k) + '.', st());
          const ok = s - k >= 1 && s - k <= n;
          rec.step('if', ok ? 'Y = ' + (s - k) + ' ist möglich.' : 'Y = ' + (s - k) + ' gibt es nicht → überspringen.', st());
          if (ok) { pS[s] += d.p[k - 1] * d.q[s - k - 1]; rec.step('add', '\\(+\\ ' + LB.fmt(d.p[k - 1], 4) + '\\cdot' + LB.fmt(d.q[s - k - 1], 4) + '\\) → \\(\\PP(S=' + s + ')=' + LB.fmt(pS[s], 4) + '\\)', st()); }
        }
      }
      s = 0; k = 0;
      rec.step('out', 'Fertig: \\(\\EE[S]=' + LB.fmt(S.sum(pS.map((p, i) => i * p)), 4) + '\\), Summe aller W\'keiten = ' + LB.fmt(S.sum(pS), 4), st());
    },
    view: st => {
      const W = 460, H = 210, n = st.pS.length - 1, mx = Math.max(0.2, ...st.pS), bw = Math.min(26, (W - 60) / (n - 1) - 4);
      const X = s => 40 + (s - 2) / Math.max(1, n - 2) * (W - 70), B = H - 38;
      let g = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="P(S = s) als Balken">';
      g += '<text x="8" y="14" fill="' + C.res + '" font-size="12">Balkenhöhe = pS[s] = P(S = s)</text>';
      for (let s = 2; s <= n; s++) { const x = X(s), h = st.pS[s] / mx * (B - 30), cur = s === st.s;
        g += '<rect x="' + (x - bw / 2) + '" y="' + (B - h) + '" width="' + bw + '" height="' + Math.max(h, 0.5) + '" fill="' + LB.rgba(C.res, cur ? 0.95 : 0.55) + '"' + (cur ? ' stroke="' + C.idx + '" stroke-width="2.5"' : '') + '/>';
        if (st.pS[s] > 0) g += '<text x="' + x + '" y="' + (B - h - 4) + '" fill="' + C.res + '" font-size="10" text-anchor="middle">' + LB.fmt(st.pS[s], 3) + '</text>';
        g += '<text x="' + x + '" y="' + (B + 15) + '" fill="' + C.idx + '" font-size="12" font-weight="' + (cur ? 700 : 400) + '" text-anchor="middle">' + s + '</text>'; }
      g += '<line x1="30" x2="' + (W - 20) + '" y1="' + B + '" y2="' + B + '" stroke="' + C.muted + '"/><text x="' + (W / 2) + '" y="' + (H - 4) + '" fill="' + C.idx + '" font-size="12" text-anchor="middle">s = mögliche Summe (grüner Rahmen = gerade in Arbeit)</text></svg>';
      const d = st.d, ok = st.s && st.k && st.s - st.k >= 1 && st.s - st.k <= d.q.length;
      return g + LB.kvHTML([['s', st.s || '–', 'idx', 'Summe, deren W\'keit gerade entsteht'], ['k = Wert von X', st.k || '–', 'chg', 'Aufteilung s = k + (s − k)'],
        ['s − k = Wert von Y', st.k ? st.s - st.k : '–', 'chg', ok ? 'möglich' : (st.k ? 'kein Wert von Y → übersprungen' : '')], ['pX[k]', ok ? LB.fmt(d.p[st.k - 1], 4) : '–', 'par', 'P(X = k)'],
        ['pY[s − k]', ok ? LB.fmt(d.q[st.s - st.k - 1], 4) : '–', 'par', 'P(Y = s − k)'], ['Beitrag', ok ? LB.fmt(d.p[st.k - 1] * d.q[st.s - st.k - 1], 4) : '–', 'chg', 'pX[k] · pY[s − k] (unabhängig → Produkt)'],
        ['pS[s] bisher', st.s ? LB.fmt(st.pS[st.s], 4) : '–', 'res', 'Summe aller Beiträge zu dieser Summe']]);
    }
  });
});

/* ---------------------------------------------------------------- Training */
LB.on(function train4() {
  if (!document.getElementById('q4Task')) return;
  const r = S.rng(Date.now() % 55555); let T;
  const neu = () => {
    let w = [1, 2, 3, 4].map(() => 1 + Math.floor(r() * 9)); const sw = S.sum(w); w = w.map(v => Math.round(v / sw * 100) / 100); w[3] = Math.round((1 - w[0] - w[1] - w[2]) * 100) / 100;
    if (w[3] <= 0) return neu();
    T = w; // P(0,0), P(0,1), P(1,0), P(1,1)
    document.getElementById('q4Task').innerHTML = '<table class="tbl" style="max-width:360px"><tr><th>X \\ Y</th><th class="r">0</th><th class="r">1</th></tr><tr><td>0</td><td class="r">' + T[0] + '</td><td class="r">' + T[1] + '</td></tr><tr><td>1</td><td class="r">' + T[2] + '</td><td class="r">' + T[3] + '</td></tr></table>';
    ['q4a', 'q4b', 'q4c', 'q4d'].forEach(id => document.getElementById(id).value = ''); document.getElementById('q4Res').innerHTML = '';
  };
  document.getElementById('q4New').addEventListener('click', neu);
  document.getElementById('q4Chk').addEventListener('click', () => {
    const pX1 = T[2] + T[3], pY1 = T[1] + T[3], cov = T[3] - pX1 * pY1, vs = pX1 * (1 - pX1) + pY1 * (1 - pY1) + 2 * cov;
    const want = [pX1, T[3] / pX1, cov, vs], ids = ['q4a', 'q4b', 'q4c', 'q4d'], nm = ['P(X=1)', 'P(Y=1|X=1)', 'Cov', 'Var(X+Y)'];
    document.getElementById('q4Res').innerHTML = ids.map((id, k) => { const v = parseFloat(document.getElementById(id).value.replace(',', '.'));
      return (Math.abs(v - want[k]) < 6e-4 ? '<span class="ok">✔ ' : '<span class="bad">✗ ') + nm[k] + ' = ' + LB.fmt(want[k], 4) + '</span>'; }).join(' · ') +
      '<br>Rechenweg: Cov = P(1,1) − P(X=1)P(Y=1) = ' + T[3] + ' − ' + LB.fmt(pX1, 2) + '·' + LB.fmt(pY1, 2) + '; Var(X+Y) = p(1−p) + q(1−q) + 2Cov.';
  });
  neu();
});
