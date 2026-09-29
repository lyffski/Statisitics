/* Teil 9 · Statistik-Rechner: alle Tests und Verteilungen, jeweils mit R- und Python-Aufruf */
LB.KW = [['P-Wert', 'res'], ['Teststatistik', 'chg'], ['Vertrauensintervall', 'res'], ['Sollwert', 'par'], ['Differenzen', 'chg'], ['gepoolte Varianz', 'chg'], ['Freiheitsgrade', 'idx']];
const S = LB.S, C = LB.C;
const $ = id => document.getElementById(id);
const num = id => parseFloat(String($(id).value).replace(',', '.'));
const data = id => S.parse($(id).value);
const F = (x, k) => (x === Infinity ? '∞' : x === -Infinity ? '−∞' : LB.fmt(x, k === undefined ? 4 : k));
const ALT_R = { ne: '"two.sided"', gt: '"greater"', lt: '"less"' }, ALT_PY = { ne: '"two-sided"', gt: '"greater"', lt: '"less"' };
const vecR = a => 'c(' + a.join(', ') + ')', vecPy = a => 'np.array([' + a.join(', ') + '])';
const verdict = (rej, h0) => rej ? '<b class="bad">🔴 ' + h0 + ' verwerfen</b> (signifikant)' : '<b class="ok">🟢 ' + h0 + ' nicht verwerfen</b>';

/* Live-Code: R und Python nebeneinander, mit den eingegebenen Daten */
function liveCode(id, title, R, Py) {
  const blk = (L, lines, note) => '<div class="code" data-lang="' + L + '"><div class="ch"><b>' + L + ' · ' + title + '</b><span>' + note + '</span></div><pre>' +
    lines.map((l, i) => '<div class="row"><span class="ln">' + (i + 1) + '</span>' + LB.hlLine(l, L) + '</div>').join('') + '</pre></div>';
  $(id).innerHTML = '<div class="two code2 livecode">' + blk('R', R, 'mit deinen Daten') + blk('Python', ['import numpy as np', 'from scipy import stats'].concat(Py), 'numpy / scipy') + '</div>';
}

/* P-Wert aus Verteilungsfunktion (links: cdf(stat), rechts: sf(stat)) */
const pSide = (side, lo, hi) => side === 'gt' ? hi : side === 'lt' ? lo : Math.min(1, 2 * Math.min(lo, hi));

/* Ränge mit Mittelung bei Bindungen; liefert auch Σ(t³ − t) */
function ranks(a) {
  const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = new Array(a.length); let tie = 0;
  for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const c = j - i + 1; tie += c * c * c - c;
    for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; }
  return { r, tie };
}
const round10 = x => Math.round(x * 1e10) / 1e10;

/* Wilcoxon-Vorzeichen-Rang-Test wie R: exakt ohne Bindungen/Nullen (n < 50), sonst Normalapprox. mit Stetigkeitskorrektur */
function signedRank(d0, side) {
  const zeros = d0.filter(x => x === 0).length, d = d0.filter(x => x !== 0), n = d.length;
  if (n < 1) return null;
  const { r, tie } = ranks(d.map(Math.abs)); let V = 0; d.forEach((x, i) => { if (x > 0) V += r[i]; });
  const mu = n * (n + 1) / 4;
  if (n < 50 && tie === 0 && zeros === 0) {
    const M = n * (n + 1) / 2, c = new Array(M + 1).fill(0); c[0] = 1;
    for (let k = 1; k <= n; k++) for (let s = M; s >= k; s--) c[s] += c[s - k];
    const tot = Math.pow(2, n), le = v => { let s = 0; for (let i = 0; i <= Math.min(v, M); i++) s += c[i]; return s / tot; };
    const lo = le(V), hi = 1 - le(V - 1);
    const p = side === 'gt' ? hi : side === 'lt' ? lo : Math.min(1, 2 * (V > mu ? hi : lo));
    return { V, n, p, exact: true, mu };
  }
  const sg = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24 - tie / 48), corr = side === 'gt' ? 0.5 : side === 'lt' ? -0.5 : 0.5 * Math.sign(V - mu), z = (V - mu - corr) / sg;
  const p = side === 'gt' ? 1 - S.Phi(z) : side === 'lt' ? S.Phi(z) : Math.min(1, 2 * Math.min(S.Phi(z), 1 - S.Phi(z)));
  return { V, n, p, exact: false, z, mu, zeros };
}

/* Mann-Whitney (Zwei-Stichproben-Wilcoxon) wie R: W = Rangsumme(X) − n(n+1)/2 */
function mannWhitney(x, y, side) {
  const n = x.length, m = y.length, { r, tie } = ranks(x.concat(y));
  let R = 0; for (let i = 0; i < n; i++) R += r[i];
  const W = R - n * (n + 1) / 2, mu = n * m / 2;
  if (n < 50 && m < 50 && tie === 0) {
    let prev = [], cur;
    for (let i = 0; i <= n; i++) { cur = []; for (let j = 0; j <= m; j++) { const a = new Array(i * j + 1).fill(0);
        if (i === 0 || j === 0) a[0] = 1; else { const A = prev[j], B = cur[j - 1]; for (let u = 0; u <= i * j; u++) a[u] = (u - j >= 0 && u - j < A.length ? A[u - j] : 0) + (u < B.length ? B[u] : 0); }
        cur.push(a); } prev = cur; }
    const dist = cur[m], tot = dist.reduce((s, v) => s + v, 0), le = w => { let s = 0; for (let u = 0; u <= Math.min(w, n * m); u++) s += dist[u]; return s / tot; };
    const lo = le(W), hi = 1 - le(W - 1);
    const p = side === 'gt' ? hi : side === 'lt' ? lo : Math.min(1, 2 * (W > mu ? hi : lo));
    return { W, p, exact: true, mu };
  }
  const N = n + m, sg = Math.sqrt(n * m / 12 * ((N + 1) - tie / (N * (N - 1)))), corr = side === 'gt' ? 0.5 : side === 'lt' ? -0.5 : 0.5 * Math.sign(W - mu), z = (W - mu - corr) / sg;
  const p = side === 'gt' ? 1 - S.Phi(z) : side === 'lt' ? S.Phi(z) : Math.min(1, 2 * Math.min(S.Phi(z), 1 - S.Phi(z)));
  return { W, p, exact: false, z, mu };
}

/* Konfidenzgrenzen je nach Alternative (wie t.test in R) */
function ciSide(est, se, side, lvl, qf) {
  if (side === 'ne') { const q = qf(1 - (1 - lvl) / 2); return [est - q * se, est + q * se]; }
  const q = qf(lvl); return side === 'gt' ? [est - q * se, Infinity] : [-Infinity, est + q * se];
}

/* Dichte mit Verwerfungsbereich und beobachteter Statistik */
function nullPlot(el, f, stat, crit, side, title, R) {
  R = Math.max(R || 4.5, Math.abs(stat) + 1);
  const tr = [LB.curve(f, -R, R, C.rule, 300)];
  if (side !== 'lt') tr.push(LB.area(f, crit, R, LB.rgba(C.res, 0.5)));
  if (side !== 'gt') tr.push(LB.area(f, -R, -crit, LB.rgba(C.res, 0.5)));
  tr.push({ x: [stat, stat], y: [0, f(0) * 1.05], mode: 'lines', line: { color: C.idx, width: 3 } });
  LB.plot(el, tr, { height: 270, showlegend: false, xaxis: { title, range: [-R, R] }, yaxis: { rangemode: 'tozero' } });
}

/* Boxplot nach Skript-Quantilen (Plotly mit vorberechneten Kennzahlen) */
function boxTrace(a, name, col) {
  const q1 = S.quantile(a, 0.25), md = S.median(a), q3 = S.quantile(a, 0.75), iqr = q3 - q1, inn = a.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
  return [{ type: 'box', name, q1: [q1], median: [md], q3: [q3], lowerfence: [Math.min(...inn)], upperfence: [Math.max(...inn)], x: [name], marker: { color: col }, line: { color: col }, fillcolor: LB.rgba(col, 0.25) },
    { x: a.map(() => name), y: a, mode: 'markers', marker: { color: a.map(v => inn.includes(v) ? LB.rgba(col, 0.8) : C.res), size: 7 }, name }];
}

/* ================================================================ 1 Deskriptiv */
LB.on(function desc() {
  if (!$('dsA')) return;
  const run = () => {
    const A = data('dsA'), B = data('dsB'), has = B.length >= 2, out = $('dsStats');
    if (A.length < 2) { out.innerHTML = '<span class="bad">Stichprobe A braucht mindestens 2 Werte.</span>'; return; }
    const cols = [['A', A, C.par]].concat(has ? [['B', B, C.chg]] : []);
    const rows = [['n', a => a.length, 0, 'idx'], ['Mittel x̄', S.mean, 4, 'mem'], ['Median', S.median, 4, 'mem'], ['s (n − 1)', S.sd, 4, 'chg'], ['s²', S.var, 4, 'chg'],
      ['Min', a => Math.min(...a), 4], ['q₀.₂₅', a => S.quantile(a, 0.25), 4], ['q₀.₇₅', a => S.quantile(a, 0.75), 4], ['Max', a => Math.max(...a), 4],
      ['IQR', a => S.quantile(a, 0.75) - S.quantile(a, 0.25), 4], ['Spannweite', a => Math.max(...a) - Math.min(...a), 4]];
    out.innerHTML = '<table class="tbl"><tr><th>Kennzahl</th>' + cols.map(c => '<th class="r">' + c[0] + '</th>').join('') + '</tr>' +
      rows.map(r => '<tr><td' + (r[3] ? ' class="kw-' + r[3] + '"' : '') + '>' + r[0] + '</td>' + cols.map(c => '<td class="r">' + (r[2] ? F(r[1](c[1]), r[2]) : r[1](c[1])) + '</td>').join('') + '</tr>').join('') + '</table>';
    LB.plot('dsBox', [].concat(...cols.map(c => boxTrace(c[1], c[0], c[2]))), { height: 300, showlegend: false, title: { text: 'Boxplot (Skript-Quantile)', font: { size: 13 } } });
    LB.plot('dsHist', cols.map(c => ({ x: c[1], type: 'histogram', name: c[0], opacity: 0.6, marker: { color: c[2] } })), { height: 300, barmode: 'overlay', title: { text: 'Histogramm', font: { size: 13 } } });
    const qq = [];
    cols.forEach(c => { const s = S.sorted(c[1]), n = s.length, z = s.map((_, i) => S.PhiInv((i + 0.5) / n)), m = S.mean(s), sd = S.sd(s);
      qq.push({ x: z, y: s, mode: 'markers', name: c[0], marker: { color: c[2], size: 8 } }, { x: [z[0], z[n - 1]], y: [m + sd * z[0], m + sd * z[n - 1]], mode: 'lines', line: { color: c[2], dash: 'dot' }, showlegend: false }); });
    LB.plot('dsQQ', qq, { height: 300, title: { text: '✚ Normalplot: Punkte nahe der Linie ⇒ Normalverteilung plausibel', font: { size: 13 } }, xaxis: { title: 'theoretische Quantile Φ⁻¹((i − 0.5)/n)' }, yaxis: { title: 'geordnete Daten' } });
    const skew = a => S.mean(a) - S.median(a);
    $('dsRead').innerHTML = '<b>So liest du es:</b> ' + cols.map(c => c[0] + ': Mittel ' + (Math.abs(skew(c[1])) < 0.1 * S.sd(c[1]) ? '≈ Median → eher symmetrisch' : skew(c[1]) > 0 ? '&gt; Median → rechtsschief' : '&lt; Median → linksschief')).join(' · ') +
      '. Ausreißer (rot) liegen mehr als 1.5 · IQR außerhalb der Box. Quantile nach Skript-Definition (R <code>type = 2</code>).';
    const R = ['x <- ' + vecR(A)].concat(has ? ['y <- ' + vecR(B)] : []).concat(['mean(x); median(x); sd(x); var(x)', 'quantile(x, c(0.25, 0.75), type = 2)   # Skript-Definition',
      has ? 'boxplot(x, y, names = c("A", "B"))' : 'boxplot(x)', 'hist(x)', 'qqnorm(x); qqline(x)   # Normalplot']);
    const Py = ['import matplotlib.pyplot as plt', 'x = ' + vecPy(A)].concat(has ? ['y = ' + vecPy(B)] : []).concat(['print(x.mean(), np.median(x), x.std(ddof=1), x.var(ddof=1))',
      'print(np.quantile(x, [0.25, 0.75], method="averaged_inverted_cdf"))   # Skript', has ? 'plt.boxplot([x, y], labels=["A", "B"]); plt.show()' : 'plt.boxplot(x); plt.show()',
      'plt.hist(x); plt.show()', 'stats.probplot(x, plot=plt); plt.show()   # Normalplot']);
    liveCode('dsCode', 'Deskriptiv', R, Py);
  };
  ['dsA', 'dsB'].forEach(id => $(id).addEventListener('input', run)); run();
});

/* ================================================================ 2 Ein-Stichprobe */
LB.on(function oneSample() {
  if (!$('osData')) return;
  const run = () => {
    const x = data('osData'), mu0 = num('osMu'), lvl = num('osC'), test = $('osTest').value, side = $('osSide').value, sig = num('osSig'), n = x.length, a = 1 - lvl;
    $('osSigWrap').style.display = test === 'z' ? '' : 'none';
    $('osC').nextElementSibling.textContent = F(lvl, 2);
    const st = $('osStats'), vd = $('osVerdict');
    if (n < 2 || isNaN(mu0) || (test === 'z' && !(sig > 0))) { st.innerHTML = '<span class="bad">Mindestens 2 Werte, μ₀ und (für Z) σ &gt; 0 angeben.</span>'; vd.innerHTML = ''; return; }
    const xb = S.mean(x), s = S.sd(x), H0 = 'H₀: ' + (test === 'sign' || test === 'wil' ? 'Median' : 'μ') + ' = ' + mu0;
    let R = ['x <- ' + vecR(x)], Py = ['x = ' + vecPy(x)], p, rows, rej;
    if (test === 't' || test === 'z') {
      const isT = test === 't', se = (isT ? s : sig) / Math.sqrt(n), T = (xb - mu0) / se, df = n - 1;
      const cdf = v => isT ? S.tCdf(v, df) : S.Phi(v), qf = q => isT ? S.tInv(q, df) : S.PhiInv(q);
      p = pSide(side, cdf(T), 1 - cdf(T)); rej = p <= a;
      const ci = ciSide(xb, se, side, lvl, qf), crit = side === 'ne' ? qf(1 - a / 2) : qf(1 - a);
      rows = [['n', n, 'idx'], ['x̄', F(xb), 'mem'], [isT ? 's' : 'σ (bekannt)', F(isT ? s : sig), isT ? 'chg' : 'par'], ['SE', F(se), 'rule'], [isT ? 't' : 'z', F(T), 'res'],
        [isT ? 'df' : 'Verteilung', isT ? df : 'N(0,1)', 'idx'], ['Grenze', (side === 'ne' ? '±' : side === 'lt' ? '−' : '') + F(crit, 3), 'rule'], ['P-Wert', F(p), 'res'], ['VI ' + Math.round(lvl * 100) + ' %', '[' + F(ci[0], 3) + '; ' + F(ci[1], 3) + ']', 'res']];
      nullPlot('osPlot', isT ? v => S.tPdf(v, df) : v => S.normPdf(v), T, crit, side, isT ? 'T unter H₀ ~ t_' + df : 'Z unter H₀ ~ N(0,1)');
      if (isT) { R.push('t.test(x, mu = ' + mu0 + ', alternative = ' + ALT_R[side] + ', conf.level = ' + lvl + ')');
        Py.push('res = stats.ttest_1samp(x, popmean=' + mu0 + ', alternative=' + ALT_PY[side] + ')', 'print(res.statistic, res.pvalue)', 'print(res.confidence_interval(confidence_level=' + lvl + '))'); }
      else { const pr = side === 'ne' ? '2 * pnorm(-abs(z))' : side === 'gt' ? 'pnorm(z, lower.tail = FALSE)' : 'pnorm(z)', pp = side === 'ne' ? '2 * stats.norm.sf(abs(z))' : side === 'gt' ? 'stats.norm.sf(z)' : 'stats.norm.cdf(z)';
        R.push('mu0 <- ' + mu0 + '; sigma <- ' + sig, 'z <- (mean(x) - mu0) / (sigma / sqrt(length(x)))', 'p <- ' + pr, 'c(z = z, p = p)');
        Py.push('mu0, sigma = ' + mu0 + ', ' + sig, 'z = (x.mean() - mu0) / (sigma / np.sqrt(len(x)))', 'p = ' + pp, 'print(z, p)'); }
    } else if (test === 'sign') {
      const m = x.filter(v => v !== mu0).length, k = x.filter(v => v > mu0).length;
      const lo = S.binomCdf(k, m, 0.5), hi = 1 - S.binomCdf(k - 1, m, 0.5); p = pSide(side, lo, hi); rej = p <= a;
      rows = [['n (ohne = μ₀)', m, 'idx'], ['Q = #(x > μ₀)', k, 'res'], ['unter H₀', 'Bin(' + m + ', 0.5)', 'rule'], ['P-Wert', F(p), 'res']];
      const ks = Array.from({ length: m + 1 }, (_, i) => i), pm = ks.map(i => S.binomPmf(i, m, 0.5));
      const ext = i => side === 'gt' ? i >= k : side === 'lt' ? i <= k : S.binomPmf(i, m, 0.5) <= S.binomPmf(k, m, 0.5) * (1 + 1e-7);
      LB.plot('osPlot', [{ type: 'bar', x: ks, y: pm, marker: { color: ks.map(i => ext(i) ? C.res : C.rule), line: { color: ks.map(i => i === k ? C.idx : 'rgba(0,0,0,0)'), width: 3 } } }],
        { height: 270, xaxis: { title: 'Q unter H₀ ~ Bin(' + m + ', 0.5); rot = so extrem wie beobachtet (P-Wert)' }, yaxis: { title: 'P(Q = q)' } });
      R.push('binom.test(sum(x > ' + mu0 + '), sum(x != ' + mu0 + '), p = 0.5, alternative = ' + ALT_R[side] + ')');
      Py.push('res = stats.binomtest(int(np.sum(x > ' + mu0 + ')), int(np.sum(x != ' + mu0 + ')), p=0.5, alternative=' + ALT_PY[side] + ')', 'print(res.pvalue)');
    } else {
      const w = signedRank(x.map(v => round10(v - mu0)), side);
      if (!w) { st.innerHTML = '<span class="bad">Alle Werte gleich μ₀.</span>'; return; }
      p = w.p; rej = p <= a;
      rows = [['n (ohne Nullen)', w.n, 'idx'], ['V = Σ Ränge(d > 0)', F(w.V, 1), 'res'], ['E[V] unter H₀', F(w.mu, 2), 'rule'], ['Methode', w.exact ? 'exakt' : 'Normalapprox.', 'rule'], ['P-Wert', F(p), 'res']];
      LB.plot('osPlot', [{ type: 'bar', x: x.map((_, i) => i + 1), y: x.map(v => v - mu0), marker: { color: x.map(v => v > mu0 ? C.idx : v < mu0 ? C.res : C.muted) } }],
        { height: 270, xaxis: { title: 'Beobachtung i', dtick: 1 }, yaxis: { title: 'dᵢ = xᵢ − μ₀' } });
      R.push('wilcox.test(x, mu = ' + mu0 + ', alternative = ' + ALT_R[side] + ')   # bei Bindungen: Normalapprox.');
      Py.push('res = stats.wilcoxon(x - ' + mu0 + ', alternative=' + ALT_PY[side] + ')   # SciPy kann bei Bindungen anders rechnen', 'print(res.statistic, res.pvalue)');
    }
    st.innerHTML = LB.kvHTML(rows);
    vd.innerHTML = '<span class="vdict">' + verdict(rej, H0) + '</span> · P-Wert ' + F(p) + (rej ? ' ≤ ' : ' &gt; ') + 'α = ' + F(a, 3) +
      (test === 'wil' && p !== null ? ' · Wilcoxon-Methode wie R (<code>wilcox.test</code>): exakt ohne Bindungen und Nullen, sonst Normalapproximation mit Stetigkeitskorrektur.' : '');
    liveCode('osCode', 'Ein-Stichprobe', R, Py);
  };
  ['osData', 'osMu', 'osC', 'osTest', 'osSig', 'osSide'].forEach(id => $(id).addEventListener('input', run)); run();
});

/* ================================================================ 3 Zwei Stichproben */
LB.on(function twoSample() {
  if (!$('twA')) return;
  const run = () => {
    const x = data('twA'), y = data('twB'), lvl = num('twC'), test = $('twTest').value, side = $('twSide').value, a = 1 - lvl, n = x.length, m = y.length;
    $('twC').nextElementSibling.textContent = F(lvl, 2);
    const st = $('twStats'), vd = $('twVerdict');
    if (n < 2 || m < 2) { st.innerHTML = '<span class="bad">Je Gruppe mindestens 2 Werte.</span>'; vd.innerHTML = ''; return; }
    const mx = S.mean(x), my = S.mean(y), vx = S.var(x), vy = S.var(y), d = mx - my;
    const R = ['x <- ' + vecR(x), 'y <- ' + vecR(y)], Py = ['x = ' + vecPy(x), 'y = ' + vecPy(y)];
    let p, rows;
    if (test !== 'mw') {
      const welch = test === 'welch', sp2 = ((n - 1) * vx + (m - 1) * vy) / (n + m - 2);
      const se = welch ? Math.sqrt(vx / n + vy / m) : Math.sqrt(sp2 * (1 / n + 1 / m));
      const df = welch ? (vx / n + vy / m) ** 2 / ((vx / n) ** 2 / (n - 1) + (vy / m) ** 2 / (m - 1)) : n + m - 2;
      const T = d / se; p = pSide(side, S.tCdf(T, df), 1 - S.tCdf(T, df));
      const ci = ciSide(d, se, side, lvl, q => S.tInv(q, df)), crit = S.tInv(side === 'ne' ? 1 - a / 2 : 1 - a, df);
      rows = [['n, m', n + ', ' + m, 'idx'], ['x̄, ȳ', F(mx, 3) + ', ' + F(my, 3), 'mem'], ['s_X, s_Y', F(Math.sqrt(vx), 3) + ', ' + F(Math.sqrt(vy), 3), 'chg'],
        welch ? ['SE (Welch)', F(se), 'chg'] : ['S²_pool', F(sp2), 'chg'], ['t', F(T), 'res'], ['df', welch ? F(df, 2) : df, 'idx'], ['Grenze', (side === 'ne' ? '±' : side === 'lt' ? '−' : '') + F(crit, 3), 'rule'],
        ['P-Wert', F(p), 'res'], ['VI μ_X − μ_Y', '[' + F(ci[0], 3) + '; ' + F(ci[1], 3) + ']', 'res']];
      nullPlot('twPlot', v => S.tPdf(v, df), T, crit, side, 'T unter H₀ ~ t_' + (welch ? F(df, 1) : df));
      R.push('t.test(x, y, ' + (welch ? '' : 'var.equal = TRUE, ') + 'alternative = ' + ALT_R[side] + ', conf.level = ' + lvl + ')' + (welch ? '   # Welch ist Standard in R' : ''));
      Py.push('res = stats.ttest_ind(x, y, equal_var=' + (welch ? 'False' : 'True') + ', alternative=' + ALT_PY[side] + ')', 'print(res.statistic, res.pvalue)', 'print(res.confidence_interval(confidence_level=' + lvl + '))');
    } else {
      const w = mannWhitney(x, y, side); p = w.p;
      rows = [['n, m', n + ', ' + m, 'idx'], ['Median X, Y', F(S.median(x), 3) + ', ' + F(S.median(y), 3), 'mem'], ['W (R) = U_X', F(w.W, 1), 'res'], ['E[W] unter H₀', F(w.mu, 1), 'rule'],
        ['Methode', w.exact ? 'exakt' : 'Normalapprox.', 'rule'], ['P-Wert', F(p), 'res']];
      const { r } = ranks(x.concat(y));
      LB.plot('twPlot', [{ x: x, y: x.map(() => 'X'), mode: 'markers+text', text: r.slice(0, n).map(v => F(v, 1)), textposition: 'top center', marker: { color: C.par, size: 10 }, textfont: { color: C.par } },
        { x: y, y: y.map(() => 'Y'), mode: 'markers+text', text: r.slice(n).map(v => F(v, 1)), textposition: 'top center', marker: { color: C.chg, size: 10 }, textfont: { color: C.chg } }],
        { height: 250, showlegend: false, xaxis: { title: 'Messwert (Zahlen = gemeinsame Ränge)' }, yaxis: { type: 'category' } });
      R.push('wilcox.test(x, y, alternative = ' + ALT_R[side] + ')   # Mann-Whitney');
      Py.push('res = stats.mannwhitneyu(x, y, alternative=' + ALT_PY[side] + ')', 'print(res.statistic, res.pvalue)');
    }
    st.innerHTML = LB.kvHTML(rows);
    vd.innerHTML = '<span class="vdict">' + verdict(p <= a, 'H₀: μ_X = μ_Y') + '</span> · P-Wert ' + F(p) + (p <= a ? ' ≤ ' : ' &gt; ') + 'α = ' + F(a, 3);
    liveCode('twCode', 'Zwei Stichproben', R, Py);
  };
  ['twA', 'twB', 'twC', 'twTest', 'twSide'].forEach(id => $(id).addEventListener('input', run)); run();
});

/* ================================================================ 4 Gepaart */
LB.on(function paired() {
  if (!$('prA')) return;
  const run = () => {
    const A = data('prA'), B = data('prB'), lvl = num('prC'), test = $('prTest').value, side = $('prSide').value, al = 1 - lvl;
    $('prC').nextElementSibling.textContent = F(lvl, 2);
    const st = $('prStats'), vd = $('prVerdict');
    if (A.length !== B.length || A.length < 2) { st.innerHTML = '<span class="bad">Gepaart braucht gleich viele Werte (≥ 2) in A und B. Aktuell: ' + A.length + ' und ' + B.length + '.</span>'; vd.innerHTML = ''; return; }
    const u = A.map((v, i) => round10(v - B[i])), n = u.length, ub = S.mean(u), su = S.sd(u);
    const R = ['a <- ' + vecR(A), 'b <- ' + vecR(B)], Py = ['a = ' + vecPy(A), 'b = ' + vecPy(B)];
    let p, rows;
    if (test === 't') {
      const se = su / Math.sqrt(n), T = ub / se, df = n - 1; p = pSide(side, S.tCdf(T, df), 1 - S.tCdf(T, df));
      const ci = ciSide(ub, se, side, lvl, q => S.tInv(q, df)), crit = S.tInv(side === 'ne' ? 1 - al / 2 : 1 - al, df);
      rows = [['n Paare', n, 'idx'], ['ū', F(ub), 'chg'], ['s_U', F(su), 'chg'], ['SE', F(se), 'rule'], ['t', F(T), 'res'], ['df', df, 'idx'], ['P-Wert', F(p), 'res'], ['VI für E[U]', '[' + F(ci[0], 3) + '; ' + F(ci[1], 3) + ']', 'res']];
      nullPlot('prPlot', v => S.tPdf(v, df), T, crit, side, 'T unter H₀ ~ t_' + df);
      R.push('t.test(a, b, paired = TRUE, alternative = ' + ALT_R[side] + ', conf.level = ' + lvl + ')');
      Py.push('res = stats.ttest_rel(a, b, alternative=' + ALT_PY[side] + ')', 'print(res.statistic, res.pvalue)', 'print(res.confidence_interval(confidence_level=' + lvl + '))');
    } else {
      const w = signedRank(u, side); if (!w) { st.innerHTML = '<span class="bad">Alle Differenzen sind 0.</span>'; return; }
      p = w.p;
      rows = [['n (ohne Nullen)', w.n, 'idx'], ['Median U', F(S.median(u)), 'chg'], ['V', F(w.V, 1), 'res'], ['E[V] unter H₀', F(w.mu, 2), 'rule'], ['Methode', w.exact ? 'exakt' : 'Normalapprox.', 'rule'], ['P-Wert', F(p), 'res']];
      LB.plot('prPlot', [{ x: u.map((_, i) => i + 1), y: u, type: 'bar', marker: { color: u.map(v => v > 0 ? C.chg : C.res) } }], { height: 280, showlegend: false, xaxis: { title: 'Paar i', dtick: 1 }, yaxis: { title: 'uᵢ = aᵢ − bᵢ' } });
      R.push('wilcox.test(a, b, paired = TRUE, alternative = ' + ALT_R[side] + ')');
      Py.push('res = stats.wilcoxon(a, b, alternative=' + ALT_PY[side] + ')   # SciPy kann bei Bindungen exakt statt approx. rechnen', 'print(res.statistic, res.pvalue)');
    }
    LB.plot('prPairs', A.map((v, i) => ({ x: ['A', 'B'], y: [v, B[i]], mode: 'lines+markers', line: { color: B[i] < v ? C.idx : C.res, width: 2 }, marker: { color: [C.par, C.chg], size: 8 } })), { height: 280, showlegend: false, title: { text: 'Paare (grün: A > B)', font: { size: 13 } } });
    st.innerHTML = LB.kvHTML(rows) + '<div class="cells">Differenzen: ' + u.map(v => '<span class="kw-chg">' + F(v, 3) + '</span>').join(' · ') + '</div>';
    vd.innerHTML = '<span class="vdict">' + verdict(p <= al, 'H₀: kein Unterschied') + '</span> · P-Wert ' + F(p) + (p <= al ? ' ≤ ' : ' &gt; ') + 'α = ' + F(al, 3);
    liveCode('prCode', 'Gepaart', R, Py);
  };
  ['prA', 'prB', 'prC', 'prTest', 'prSide'].forEach(id => $(id).addEventListener('input', run)); run();
});

/* ================================================================ 5 Macht */
LB.on(function power() {
  if (!$('pwD')) return;
  const pw = (d, n, a, side) => { const sh = d * Math.sqrt(n); if (side === 'gt') return 1 - S.Phi(S.PhiInv(1 - a) - sh); const c = S.PhiInv(1 - a / 2); return 1 - S.Phi(c - sh) + S.Phi(-c - sh); };
  const run = () => {
    ['pwD', 'pwN', 'pwA', 'pwT'].forEach(id => { const e = $(id); e.nextElementSibling.textContent = e.dataset.fmt ? F(+e.value, +e.dataset.fmt) : e.value; });
    const d = num('pwD'), n = num('pwN'), a = num('pwA'), T = num('pwT'), side = $('pwSide').value;
    const c = side === 'gt' ? S.PhiInv(1 - a) : S.PhiInv(1 - a / 2), P = pw(d, n, a, side), sh = d * Math.sqrt(n), nreq = Math.ceil(((c + S.PhiInv(T)) / d) ** 2);
    $('pwOut').innerHTML = LB.kvHTML([['Verschiebung d√n', F(sh, 3), 'par'], ['Grenze z', F(c, 3), 'rule'], ['Macht 1 − β', F(P), 'res'], ['β (Fehler 2. Art)', F(1 - P), 'chg'], ['benötigtes n für ' + F(T, 2), nreq, 'idx']]);
    const lo = -4, hi = Math.max(5, sh + 4), tr = [LB.area(x => S.normPdf(x, sh), c, hi, LB.rgba(C.idx, 0.4)), LB.area(x => S.normPdf(x), c, hi, LB.rgba(C.res, 0.6))];
    if (side === 'ne') tr.push(LB.area(x => S.normPdf(x), lo, -c, LB.rgba(C.res, 0.6)));
    tr.push(LB.curve(x => S.normPdf(x), lo, hi, C.rule, 300), LB.curve(x => S.normPdf(x, sh), lo, hi, C.par, 300), { x: [c, c], y: [0, 0.42], mode: 'lines', line: { color: C.res, width: 2.5 } });
    LB.plot('pwPlot', tr, { height: 280, showlegend: false, xaxis: { title: 'Z (lila: H₀, blau: Alternative)', range: [lo, hi] }, yaxis: { rangemode: 'tozero' } });
    const ns = Array.from({ length: 150 }, (_, i) => i + 2);
    LB.plot('pwCurve', [{ x: ns, y: ns.map(k => pw(d, k, a, side)), mode: 'lines', line: { color: C.idx, width: 2.5 } }, { x: [n], y: [P], mode: 'markers', marker: { color: C.res, size: 11 } },
      { x: [2, 151], y: [T, T], mode: 'lines', line: { color: C.muted, dash: 'dot' } }], { height: 280, showlegend: false, xaxis: { title: 'n' }, yaxis: { title: 'Macht', range: [0, 1.02] } });
    const zc = side === 'gt' ? '1 - ' + a : '1 - ' + a + ' / 2';
    liveCode('pwCode', 'Macht (Z-Näherung)', ['d <- ' + d + '; n <- ' + n + '; alpha <- ' + a, 'zc <- qnorm(' + zc + ')',
      side === 'gt' ? 'macht <- 1 - pnorm(zc - d * sqrt(n))' : 'macht <- 1 - pnorm(zc - d * sqrt(n)) + pnorm(-zc - d * sqrt(n))', 'n_noetig <- ceiling(((zc + qnorm(' + T + ')) / d)^2)', 'c(macht, n_noetig)',
      '# exakter, t-basiert: power.t.test(n = n, delta = d, sd = 1, sig.level = alpha, type = "one.sample"' + (side === 'gt' ? ', alternative = "one.sided"' : '') + ')'],
      ['d, n, alpha = ' + d + ', ' + n + ', ' + a, 'zc = stats.norm.ppf(' + zc + ')', side === 'gt' ? 'macht = stats.norm.sf(zc - d * np.sqrt(n))' : 'macht = stats.norm.sf(zc - d * np.sqrt(n)) + stats.norm.cdf(-zc - d * np.sqrt(n))',
        'n_noetig = int(np.ceil(((zc + stats.norm.ppf(' + T + ')) / d) ** 2))', 'print(macht, n_noetig)']);
  };
  ['pwD', 'pwN', 'pwA', 'pwT', 'pwSide'].forEach(id => $(id).addEventListener('input', run)); run();
});

/* ================================================================ 6 Quantile & Verteilungen */
LB.on(function quant() {
  if (!$('qzP')) return;
  const bad = '<span class="bad">Eingabe prüfen</span>';
  const tex = (id, h) => { $(id).innerHTML = h; LB.tex($(id)); };
  const cells = {
    qz: () => { const p = num('qzP'); return p > 0 && p < 1 ? '\\(z_{' + p + '}=\\Res{' + F(S.PhiInv(p)) + '}\\)' : bad; },
    qt: () => { const p = num('qtP'), d = num('qtDf'); return p > 0 && p < 1 && d >= 1 ? '\\(t_{' + d + ',' + p + '}=\\Res{' + F(S.tInv(p, d)) + '}\\)' : bad; },
    qnc: () => { const x = num('qncX'); return isNaN(x) ? bad : '\\(\\Phi(' + x + ')=\\Res{' + F(S.Phi(x)) + '}\\), rechter Schwanz ' + F(1 - S.Phi(x)); },
    qtc: () => { const x = num('qtcX'), d = num('qtcDf'); return isNaN(x) || !(d >= 1) ? bad : '\\(\\PP(T\\le' + x + ')=\\Res{' + F(S.tCdf(x, d)) + '}\\), rechts ' + F(1 - S.tCdf(x, d)); },
    qb: () => { const n = Math.round(num('qbN')), p = num('qbP'), k = Math.round(num('qbK')); if (!(n >= 1 && p >= 0 && p <= 1 && k >= 0)) return bad;
      return '\\(\\PP(X=' + k + ')=\\Res{' + F(S.binomPmf(k, n, p)) + '}\\)<br>\\(\\PP(X\\le' + k + ')=' + F(S.binomCdf(k, n, p)) + '\\), \\(\\PP(X\\ge' + k + ')=' + F(1 - S.binomCdf(k - 1, n, p)) + '\\)<br>\\(\\EE[X]=' + F(n * p, 3) + '\\), \\(\\Var(X)=' + F(n * p * (1 - p), 3) + '\\)'; },
    qn: () => { const m = num('qnM'), s = num('qnS'), a = num('qnA'), b = num('qnB'); if (!(s > 0) || isNaN(m + a + b)) return bad;
      return '\\(\\PP(' + a + '\\le X\\le' + b + ')=\\Res{' + F(S.normCdf(b, m, s) - S.normCdf(a, m, s)) + '}\\)<br>\\(\\PP(X\\le' + a + ')=' + F(S.normCdf(a, m, s)) + '\\), z-Werte ' + F((a - m) / s, 3) + ' und ' + F((b - m) / s, 3); },
    qp: () => { const l = num('qpL'), k = Math.round(num('qpK')); if (!(l > 0 && k >= 0)) return bad;
      return '\\(\\PP(X=' + k + ')=\\Res{' + F(S.poisPmf(k, l)) + '}\\)<br>\\(\\PP(X\\le' + k + ')=' + F(S.poisCdf(k, l)) + '\\), \\(\\EE[X]=\\Var(X)=' + l + '\\)'; },
    qh: () => { const N = Math.round(num('qhN')), M = Math.round(num('qhM')), n = Math.round(num('qhn')), k = Math.round(num('qhK'));
      if (!(N >= 1 && M >= 0 && M <= N && n >= 0 && n <= N && k >= 0)) return bad;
      const pk = j => (j > M || j > n || n - j > N - M) ? 0 : S.hyperPmf(j, N, M, n); let c = 0; for (let j = 0; j <= k; j++) c += pk(j);
      return '\\(\\PP(X=' + k + ')=\\Res{' + F(pk(k)) + '}\\)<br>\\(\\PP(X\\le' + k + ')=' + F(Math.min(1, c)) + '\\), \\(\\EE[X]=n\\tfrac MN=' + F(n * M / N, 3) + '\\)'; },
    qg: () => { const p = num('qgP'), k = Math.round(num('qgK')); if (!(p > 0 && p <= 1 && k >= 1)) return bad;
      return '\\(\\PP(X=' + k + ')=\\Res{' + F(S.geomPmf(k, p)) + '}\\)<br>\\(\\PP(X\\le' + k + ')=' + F(1 - Math.pow(1 - p, k)) + '\\), \\(\\EE[X]=' + F(1 / p, 3) + '\\)'; },
    qe: () => { const l = num('qeL'), x = num('qeX'); if (!(l > 0) || isNaN(x)) return bad;
      return '\\(\\PP(X\\le' + x + ')=\\Res{' + F(S.expCdf(x, l)) + '}\\)<br>\\(\\PP(X&gt;' + x + ')=' + F(1 - S.expCdf(x, l)) + '\\), \\(\\EE[X]=' + F(1 / l, 3) + '\\)'; }
  };
  const ids = { qz: ['qzP'], qt: ['qtP', 'qtDf'], qnc: ['qncX'], qtc: ['qtcX', 'qtcDf'], qb: ['qbN', 'qbP', 'qbK'], qn: ['qnM', 'qnS', 'qnA', 'qnB'], qp: ['qpL', 'qpK'], qh: ['qhN', 'qhM', 'qhn', 'qhK'], qg: ['qgP', 'qgK'], qe: ['qeL', 'qeX'] };
  const plot = () => {
    const v = $('qvSel').value, bar = (ks, ps, hi, t) => LB.plot('qvPlot', [{ type: 'bar', x: ks, y: ps, marker: { color: ks.map(k => k === hi ? C.res : C.rule) } }], { height: 280, xaxis: { title: t }, yaxis: { title: 'P(X = k)' } });
    if (v === 'norm') { const m = num('qnM'), s = num('qnS'), a = num('qnA'), b = num('qnB'); if (!(s > 0)) return;
      LB.plot('qvPlot', [LB.area(x => S.normPdf(x, m, s), a, b, LB.rgba(C.res, 0.5)), LB.curve(x => S.normPdf(x, m, s), m - 4 * s, m + 4 * s, C.rule, 300)], { height: 280, showlegend: false, xaxis: { title: 'N(' + m + ', ' + s + '²), rot: P(a ≤ X ≤ b)' }, yaxis: { rangemode: 'tozero' } }); }
    else if (v === 't') { const p = num('qtP'), d = num('qtDf'); if (!(d >= 1 && p > 0 && p < 1)) return; const q = S.tInv(p, d);
      LB.plot('qvPlot', [LB.area(x => S.tPdf(x, d), -6, q, LB.rgba(C.par, 0.4)), LB.curve(x => S.tPdf(x, d), -6, 6, C.rule, 300), LB.curve(x => S.normPdf(x), -6, 6, C.muted, 200, { line: { dash: 'dot', color: C.muted } })],
        { height: 280, showlegend: false, xaxis: { title: 't_' + d + ' (gepunktet: N(0,1)); Fläche links von t_{df,p} = p' }, yaxis: { rangemode: 'tozero' } }); }
    else if (v === 'bin') { const n = Math.round(num('qbN')), p = num('qbP'), k = Math.round(num('qbK')); if (!(n >= 1 && n <= 1000)) return; const ks = Array.from({ length: n + 1 }, (_, i) => i); bar(ks, ks.map(i => S.binomPmf(i, n, p)), k, 'Bin(' + n + ', ' + p + ')'); }
    else if (v === 'pois') { const l = num('qpL'), k = Math.round(num('qpK')); if (!(l > 0)) return; const ks = Array.from({ length: Math.ceil(l + 5 * Math.sqrt(l) + 3) }, (_, i) => i); bar(ks, ks.map(i => S.poisPmf(i, l)), k, 'Pois(' + l + ')'); }
    else if (v === 'hyp') { const N = Math.round(num('qhN')), M = Math.round(num('qhM')), n = Math.round(num('qhn')), k = Math.round(num('qhK')); if (!(N >= 1 && M <= N && n <= N)) return;
      const ks = Array.from({ length: Math.min(n, M) + 1 }, (_, i) => i); bar(ks, ks.map(j => n - j > N - M ? 0 : S.hyperPmf(j, N, M, n)), k, 'Hyp(N = ' + N + ', M = ' + M + ', n = ' + n + ')'); }
    else if (v === 'geom') { const p = num('qgP'), k = Math.round(num('qgK')); if (!(p > 0 && p <= 1)) return; const ks = Array.from({ length: Math.min(60, Math.ceil(5 / p) + 2) }, (_, i) => i + 1); bar(ks, ks.map(i => S.geomPmf(i, p)), k, 'Geom(' + p + '), Anzahl Versuche'); }
    else { const l = num('qeL'), x = num('qeX'); if (!(l > 0)) return;
      LB.plot('qvPlot', [LB.area(t => S.expPdf(t, l), 0, x, LB.rgba(C.res, 0.5)), LB.curve(t => S.expPdf(t, l), 0, 6 / l, C.rule, 300)], { height: 280, showlegend: false, xaxis: { title: 'Exp(' + l + '), rot: P(X ≤ x)' }, yaxis: { rangemode: 'tozero' } }); }
  };
  const all = () => { Object.keys(cells).forEach(k => tex(k + 'Out', cells[k]())); plot(); };
  Object.keys(ids).forEach(k => ids[k].forEach(id => $(id).addEventListener('input', () => { tex(k + 'Out', cells[k]()); plot(); })));
  $('qvSel').addEventListener('input', plot);
  all();
});

/* ================================================================ 7 Regression */
LB.on(function regression() {
  if (!$('rgX')) return;
  const run = () => {
    const x = data('rgX'), y = data('rgY'), lvl = num('rgC'), st = $('rgStats'), vd = $('rgVerdict');
    $('rgC').nextElementSibling.textContent = F(lvl, 2);
    if (x.length !== y.length || x.length < 3) { st.innerHTML = '<span class="bad">x und y brauchen gleich viele Werte (≥ 3). Aktuell ' + x.length + ' und ' + y.length + '.</span>'; vd.innerHTML = ''; return; }
    const n = x.length, mx = S.mean(x), my = S.mean(y); let sxx = 0, sxy = 0, syy = 0;
    x.forEach((v, i) => { sxx += (v - mx) ** 2; sxy += (v - mx) * (y[i] - my); syy += (y[i] - my) ** 2; });
    if (sxx === 0) { st.innerHTML = '<span class="bad">Alle x gleich: keine Gerade bestimmbar.</span>'; return; }
    const b = sxy / sxx, a = my - b * mx, res = y.map((v, i) => v - (a + b * x[i])), sse = res.reduce((s, e) => s + e * e, 0), r = sxy / Math.sqrt(sxx * syy);
    const df = n - 2, s2 = sse / df, seb = Math.sqrt(s2 / sxx), T = b / seb, p = 2 * (1 - S.tCdf(Math.abs(T), df)), q = S.tInv(1 - (1 - lvl) / 2, df);
    st.innerHTML = LB.kvHTML([['n', n, 'idx'], ['Achsenabschnitt a', F(a), 'par'], ['Steigung b', F(b), 'par'], ['r', F(r), 'res'], ['R² = r²', F(r * r), 'res'], ['SSE', F(sse), 'chg'],
      ['σ̂² = SSE/(n − 2)', F(s2), 'chg'], ['SE(b)', F(seb), 'rule'], ['t', F(T), 'res'], ['df', df, 'idx'], ['P-Wert', F(p), 'res'], ['VI β', '[' + F(b - q * seb, 3) + '; ' + F(b + q * seb, 3) + ']', 'res']]);
    const x0 = Math.min(...x), x1 = Math.max(...x);
    LB.plot('rgPlot', [{ x, y, mode: 'markers', marker: { color: C.mem, size: 9 }, name: 'Daten' }, { x: [x0, x1], y: [a + b * x0, a + b * x1], mode: 'lines', line: { color: C.res, width: 2.5 }, name: 'ŷ = a + bx' }].concat(
      x.map((v, i) => ({ x: [v, v], y: [y[i], a + b * v], mode: 'lines', line: { color: C.chg, width: 1.5, dash: 'dot' }, showlegend: false }))),
      { height: 300, showlegend: false, title: { text: 'ŷ = ' + F(a, 3) + ' + ' + F(b, 3) + ' x (orange: Residuen)', font: { size: 13 } } });
    LB.plot('rgRes', [{ x, y: res, mode: 'markers', marker: { color: C.chg, size: 9 } }, { x: [x0, x1], y: [0, 0], mode: 'lines', line: { color: C.muted, dash: 'dot' } }],
      { height: 300, showlegend: false, title: { text: 'Residuenplot: kein Muster ⇒ Gerade passt', font: { size: 13 } }, xaxis: { title: 'x' }, yaxis: { title: 'eᵢ = yᵢ − ŷᵢ' } });
    vd.innerHTML = '<span class="vdict">' + verdict(p <= 1 - lvl, 'H₀: β = 0') + '</span> · P-Wert ' + F(p) + ' · Kontrolle: \\(t=r\\sqrt{n-2}/\\sqrt{1-r^2}=' + F(r * Math.sqrt(df) / Math.sqrt(1 - r * r), 4) + '\\)';
    LB.tex(vd);
    liveCode('rgCode', 'Regression', ['x <- ' + vecR(x), 'y <- ' + vecR(y), 'fit <- lm(y ~ x)', 'summary(fit)   # a, b, SE, t, P-Wert, R²', 'confint(fit, level = ' + lvl + ')', 'cor(x, y)',
      'plot(x, y); abline(fit)', 'plot(x, resid(fit)); abline(h = 0)'],
      ['x = ' + vecPy(x), 'y = ' + vecPy(y), 'res = stats.linregress(x, y)', 'print(res.intercept, res.slope, res.rvalue, res.pvalue, res.stderr)',
        'q = stats.t.ppf(' + (1 - (1 - lvl) / 2).toFixed(4).replace(/0+$/, '') + ', len(x) - 2)', 'print(res.slope - q * res.stderr, res.slope + q * res.stderr)   # VI für beta']);
  };
  ['rgX', 'rgY', 'rgC'].forEach(id => $(id).addEventListener('input', run)); run();
});

/* ================================================================ 8 Kombinatorik (exakt mit BigInt) */
LB.on(function comb() {
  if (!$('kbN')) return;
  const big = v => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  const fac = n => { let f = 1n; for (let i = 2n; i <= n; i++) f *= i; return f; };
  const binom = (n, k) => { if (k < 0n || k > n) return 0n; k = k < n - k ? k : n - k; let r = 1n; for (let i = 1n; i <= k; i++) r = r * (n - k + i) / i; return r; };
  const run = () => {
    const n = Math.round(num('kbN')), k = Math.round(num('kbK')), o = $('kbOut');
    if (!(n >= 0 && k >= 0 && n <= 2000 && k <= 2000)) { o.innerHTML = '<span class="bad">0 ≤ n, k ≤ 2000</span>'; return; }
    const N = BigInt(n), K = BigInt(k);
    const rows = [['\\(n^k\\)', 'mit Zurücklegen, mit Reihenfolge', N ** K], ['\\(\\frac{n!}{(n-k)!}\\)', 'ohne Zurücklegen, mit Reihenfolge', k <= n ? fac(N) / fac(N - K) : 0n],
      ['\\(\\binom nk\\)', 'ohne Zurücklegen, ohne Reihenfolge', binom(N, K)], ['\\(\\binom{n+k-1}{k}\\)', 'mit Zurücklegen, ohne Reihenfolge', binom(N + K - 1n, K)]];
    const c = binom(N, K);
    o.innerHTML = '<table class="tbl"><tr><th>Formel</th><th>Urnenmodell</th><th class="r">Anzahl</th></tr>' + rows.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="r kw-res" style="word-break:break-all">' + big(r[2]) + '</td></tr>').join('') + '</table>' +
      '<p>\\(n!=' + (n <= 25 ? big(fac(N)) : '\\text{(' + String(fac(N)).length + ' Stellen)}') + '\\) · Laplace: genau eine Kombination ohne Reihenfolge hat \\(\\PP=1/\\binom nk\\approx' + (c > 0n ? F(1 / Number(c), 10) : '–') + '\\)</p>' +
      '<p class="muted small">R: <code>choose(' + n + ', ' + k + ')</code>, <code>factorial(' + n + ')</code> · Python: <code>math.comb(' + n + ', ' + k + ')</code>, <code>math.perm(' + n + ', ' + k + ')</code>, <code>math.factorial(' + n + ')</code></p>';
    LB.tex(o);
  };
  ['kbN', 'kbK'].forEach(id => $(id).addEventListener('input', run)); run();
});
