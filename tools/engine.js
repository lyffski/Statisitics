/* =====================================================================
   Lernbegleiter-Engine (gemeinsam für alle Kapitel)
   Namensraum window.LB · KaTeX-Makros · Menü · Farbwörter · Tracer
   Statistik-Funktionen · Plotly-Hilfen · Video-Links · Teilwechsel
   ===================================================================== */
(function () {
'use strict';
const LB = window.LB = window.LB || {};
LB.inits = LB.inits || [];
LB.on = fn => LB.inits.push(fn);                                   // Kapitel-Skripte melden Init-Funktionen an

/* ---------- Rollenfarben (identisch zu :root in base.css) ---------- */
LB.C = { res: '#f85149', chg: '#d29922', rule: '#bc8cff', par: '#58a6ff', idx: '#3fb950', cond: '#56d4dd', mem: '#f778ba',
         text: '#e6edf3', muted: '#8b949e', border: '#30363d', card2: '#1c2129' };
LB.rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };

/* ---------- KaTeX: eine Konfiguration für alle Aufrufe ---------- */
LB.KOPT = {
  delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }],
  throwOnError: false,
  macros: {
    '\\Res': '\\textcolor{f85149}{#1}', '\\Chg': '\\textcolor{d29922}{#1}', '\\Rule': '\\textcolor{bc8cff}{#1}',
    '\\Par': '\\textcolor{58a6ff}{#1}', '\\Idx': '\\textcolor{3fb950}{#1}', '\\Cond': '\\textcolor{56d4dd}{#1}',
    '\\Mem': '\\textcolor{f778ba}{#1}',
    '\\PP': '\\Rule{P}',                                            // Wahrscheinlichkeits-Operator
    '\\EE': '\\Rule{E}',                                            // Erwartungswert-Operator
    '\\Var': '\\Rule{\\operatorname{Var}}',
    '\\Cov': '\\Rule{\\operatorname{Cov}}',
    '\\Corr': '\\Rule{\\operatorname{Corr}}',
    '\\sd': '\\Rule{\\sigma}',
    '\\given': '\\,\\Cond{\\vert}\\,',                              // Bedingungsstrich
    '\\Om': '\\Mem{\\Omega}',                                       // Grundraum
    '\\iid': '\\Rule{\\overset{\\text{i.i.d.}}{\\sim}}',
    '\\dd': '\\,\\mathrm{d}',
    '\\mA': '\\Mem{A}', '\\mB': '\\Mem{B}', '\\mX': '\\Mem{X}', '\\mY': '\\Mem{Y}',
    '\\capc': '\\mathbin{\\Chg{\\cap}}', '\\cupc': '\\mathbin{\\Chg{\\cup}}', '\\co': '^{\\Chg{c}}',
    '\\setm': '\\mathbin{\\Chg{\\setminus}}',
    '\\pf': '\\Rule{p}', '\\ff': '\\Rule{f}', '\\FF': '\\Rule{F}', '\\WW': '\\Mem{\\mathcal{W}}',
    '\\mx': '\\Mem{x}', '\\mZ': '\\Mem{Z}', '\\mT': '\\Mem{T}',
    '\\Bin': '\\Rule{\\operatorname{Bin}}', '\\Pois': '\\Rule{\\operatorname{Pois}}', '\\Geom': '\\Rule{\\operatorname{Geom}}',
    '\\Bern': '\\Rule{\\operatorname{Bernoulli}}', '\\Uni': '\\Rule{\\operatorname{Uni}}', '\\Nor': '\\Rule{\\mathcal{N}}', '\\Expo': '\\Rule{\\operatorname{Exp}}'
  }
};
LB.tex = el => { if (window.renderMathInElement && el) window.renderMathInElement(el, LB.KOPT); };
LB.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
LB.$ = (s, r) => (r || document).querySelector(s);
LB.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
LB.fmt = (v, d) => { if (d === undefined) d = 4; if (!isFinite(v)) return '–'; const s = Number(v).toFixed(d); return s === '-' + (0).toFixed(d) ? (0).toFixed(d) : s; };
LB.store = {                                                       // localStorage ist unter file:// oft gesperrt
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* egal */ } }
};
LB.inFrame = (() => { try { return window.parent !== window; } catch (e) { return true; } })();

/* =====================================================================
   Statistik-Funktionen (JS-Spiegel der C++-Programme)
   ===================================================================== */
const S = LB.S = {};
S.lgamma = function (x) {                                         // log Γ(x), Lanczos g=7
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - S.lgamma(1 - x);
  x -= 1; let a = c[0]; const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
};
S.choose = (n, k) => (k < 0 || k > n) ? 0 : Math.round(Math.exp(S.lgamma(n + 1) - S.lgamma(k + 1) - S.lgamma(n - k + 1)));
S.lchoose = (n, k) => S.lgamma(n + 1) - S.lgamma(k + 1) - S.lgamma(n - k + 1);
S.fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
S.gammaP = function (a, x) {                                      // regularisierte untere unvollständige Gamma-Funktion
  if (x <= 0) return 0;
  const gln = S.lgamma(a);
  if (x < a + 1) { let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-15) break; }
    return sum * Math.exp(-x + a * Math.log(x) - gln); }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break; }
  return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
};
S.betacf = function (a, b, x) {                                    // Kettenbruch für die unvollständige Beta-Funktion
  const qab = a + b, qap = a + 1, qam = a - 1; let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < 1e-300) d = 1e-300; d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) { const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
    const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break; }
  return h;
};
S.betaI = function (a, b, x) {                                     // regularisierte unvollständige Beta-Funktion I_x(a,b)
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(S.lgamma(a + b) - S.lgamma(a) - S.lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return (x < (a + 1) / (a + b + 2)) ? bt * S.betacf(a, b, x) / a : 1 - bt * S.betacf(b, a, 1 - x) / b;
};
S.erfc = x => x >= 0 ? 1 - S.gammaP(0.5, x * x) : 1 + S.gammaP(0.5, x * x);
S.normPdf = (x, mu = 0, s = 1) => { const z = (x - mu) / s; return Math.exp(-0.5 * z * z) / (s * Math.sqrt(2 * Math.PI)); };
S.Phi = x => 0.5 * S.erfc(-x / Math.SQRT2);                        // Standardnormal-Verteilungsfunktion Φ
S.normCdf = (x, mu = 0, s = 1) => S.Phi((x - mu) / s);
S.PhiInv = function (p) {                                          // Φ⁻¹(p): Acklam + zwei Newton-Schritte
  if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0],
    b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1],
    c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0],
    d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0];
  let q, r, x;
  if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else if (p <= 1 - 0.02425) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  for (let k = 0; k < 2; k++) { const e = S.Phi(x) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2); x = x - u / (1 + x * u / 2); }
  return x;
};
S.tPdf = (t, nu) => Math.exp(S.lgamma((nu + 1) / 2) - S.lgamma(nu / 2)) / Math.sqrt(nu * Math.PI) * Math.pow(1 + t * t / nu, -(nu + 1) / 2);
S.tCdf = (t, nu) => { const p = 0.5 * S.betaI(nu / 2, 0.5, nu / (nu + t * t)); return t > 0 ? 1 - p : p; };
S.chi2Cdf = (x, k) => x <= 0 ? 0 : S.gammaP(k / 2, x / 2);
S.chi2Pdf = (x, k) => x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - S.lgamma(k / 2));
S.invert = function (cdf, p, lo, hi) {                             // Quantil per Bisektion einer monotonen Verteilungsfunktion
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; if (hi - lo < 1e-12) break; }
  return (lo + hi) / 2;
};
S.tInv = (p, nu) => S.invert(x => S.tCdf(x, nu), p, -1e4, 1e4);
S.chi2Inv = (p, k) => S.invert(x => S.chi2Cdf(x, k), p, 0, 1e4);
S.binomPmf = (k, n, p) => { if (k < 0 || k > n || k !== Math.floor(k)) return 0; if (p <= 0) return k === 0 ? 1 : 0; if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(S.lchoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); };
S.binomCdf = (k, n, p) => { let s = 0; for (let i = 0; i <= Math.min(k, n); i++) s += S.binomPmf(i, n, p); return Math.min(1, s); };
S.poisPmf = (k, l) => (k < 0 || k !== Math.floor(k)) ? 0 : Math.exp(-l + k * Math.log(l) - S.lgamma(k + 1));
S.poisCdf = (k, l) => { let s = 0; for (let i = 0; i <= k; i++) s += S.poisPmf(i, l); return Math.min(1, s); };
S.geomPmf = (k, p) => k < 1 ? 0 : Math.pow(1 - p, k - 1) * p;       // Anzahl Versuche bis zum ersten Erfolg (k = 1, 2, …)
S.hyperPmf = (k, N, M, n) => Math.exp(S.lchoose(M, k) + S.lchoose(N - M, n - k) - S.lchoose(N, n));
S.expPdf = (x, l) => x < 0 ? 0 : l * Math.exp(-l * x);
S.expCdf = (x, l) => x < 0 ? 0 : 1 - Math.exp(-l * x);
/* Deskriptive Kennzahlen, Quantil-Definition wie im Skript */
S.sum = a => a.reduce((s, x) => s + x, 0);
S.mean = a => S.sum(a) / a.length;
S.var = a => { const m = S.mean(a); return a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1); };
S.sd = a => Math.sqrt(S.var(a));
S.sorted = a => a.slice().sort((x, y) => x - y);
S.quantile = function (a, alpha) {                                 // α·n ganzzahlig → Mittel zweier Nachbarn, sonst x_(⌈α n⌉)
  const s = S.sorted(a), n = s.length, an = alpha * n, r = Math.round(an);
  if (Math.abs(an - r) < 1e-9) { if (r <= 0) return s[0]; if (r >= n) return s[n - 1]; return 0.5 * (s[r - 1] + s[r]); }
  return s[Math.ceil(an) - 1];
};
S.median = a => S.quantile(a, 0.5);
S.cor = (x, y) => { const mx = S.mean(x), my = S.mean(y); let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxy / Math.sqrt(sxx * syy); };
S.parse = str => (str || '').split(/[\s,;]+/).map(s => s.trim()).filter(s => s !== '').map(Number).filter(x => !isNaN(x));
S.rng = function (seed) {                                          // reproduzierbarer Zufall (mulberry32)
  let t = seed >>> 0;
  const u = () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; };
  u.norm = () => { let a = 0; while (a === 0) a = u(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * u()); };
  return u;
};

/* =====================================================================
   Plotly-Hilfen (dunkles Layout, Rollenfarben)
   ===================================================================== */
LB.PCFG = { displayModeBar: false, responsive: true };
LB.lay = function (extra) {
  const L = { margin: { l: 55, r: 18, t: 20, b: 45 }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Source Sans 3, Segoe UI, sans-serif', size: 13, color: LB.C.text }, showlegend: false,
    xaxis: { zeroline: false, gridcolor: '#252b33', linecolor: LB.C.border }, yaxis: { zeroline: false, gridcolor: '#252b33', linecolor: LB.C.border },
    legend: { bgcolor: 'rgba(0,0,0,0)', orientation: 'h', y: 1.12 } };
  if (extra) for (const k in extra) {
    if ((k === 'xaxis' || k === 'yaxis') && typeof extra[k] === 'object') L[k] = Object.assign({}, L[k], extra[k]); else L[k] = extra[k];
  }
  return L;
};
LB.plot = (el, traces, layout) => { if (!window.Plotly) return; const e = typeof el === 'string' ? document.getElementById(el) : el; if (e) Plotly.react(e, traces, LB.lay(layout), LB.PCFG); };
LB.area = function (f, a, b, color, n) {                           // gefüllte Fläche unter einer Dichte
  n = n || 120; const xs = [a], ys = [0];
  for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; xs.push(x); ys.push(f(x)); }
  xs.push(b); ys.push(0);
  return { x: xs, y: ys, fill: 'toself', mode: 'none', fillcolor: color, hoverinfo: 'skip' };
};
LB.curve = function (f, a, b, color, n, extra) {
  n = n || 200; const xs = [], ys = [];
  for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; xs.push(x); ys.push(f(x)); }
  return Object.assign({ x: xs, y: ys, mode: 'lines', line: { color: color, width: 2.6 }, hoverinfo: 'skip' }, extra || {});
};
/* Regler binden: bind(['id1','id2'], fn) → fn(values) bei jeder Änderung, Ausgabe in <output for=id> */
LB.bind = function (ids, fn) {
  const els = ids.map(id => document.getElementById(id));
  const run = () => {
    const v = {};
    els.forEach(e => { if (!e) return; const val = e.type === 'checkbox' ? e.checked : (e.type === 'range' || e.type === 'number' ? parseFloat(e.value) : e.value);
      v[e.id] = val; const o = document.querySelector('output[for="' + e.id + '"]'); if (o) o.textContent = e.dataset.fmt ? LB.fmt(val, +e.dataset.fmt) : e.value; });
    fn(v);
  };
  els.forEach(e => e && e.addEventListener('input', run));
  run(); return run;
};

/* =====================================================================
   Code-Hervorhebung für R und Python: Kommentare, Strings, Schlüsselwörter,
   Funktionen, Zahlen, Zuweisung. Marker "#@name" am Zeilenende werden entfernt.
   ===================================================================== */
const KW = {
  R: new Set('function if else for while repeat in return TRUE FALSE NULL NA Inf break next library'.split(' ')),
  Python: new Set('def if elif else for while in return True False None import from as lambda with and or not pass break continue print'.split(' '))
};
LB.stripMark = l => l.replace(/\s*#@[\w-]+\s*$/, '');
LB.markOf = l => { const m = l.match(/#@([\w-]+)\s*$/); return m ? m[1] : ''; };
LB.hlLine = function (line, lang) {
  lang = lang || 'R'; const kws = KW[lang] || KW.R;
  let out = '', i = 0; const n = line.length;
  while (i < n) {
    const ch = line[i];
    if (ch === '#') { out += '<span class="tok-c">' + LB.esc(line.slice(i)) + '</span>'; break; }
    if (ch === '"' || ch === "'") { let j = i + 1; while (j < n && line[j] !== ch) { if (line[j] === '\\') j++; j++; }
      out += '<span class="tok-s">' + LB.esc(line.slice(i, j + 1)) + '</span>'; i = j + 1; continue; }
    if (line.startsWith('<-', i)) { out += '<span class="tok-a">&lt;-</span>'; i += 2; continue; }
    if (/[A-Za-z_.]/.test(ch)) { let j = i + 1; while (j < n && /[A-Za-z0-9_.]/.test(line[j])) j++;
      const w = line.slice(i, j);
      if (kws.has(w)) out += '<span class="tok-k">' + LB.esc(w) + '</span>';
      else if (line[j] === '(') out += '<span class="tok-t">' + LB.esc(w) + '</span>';
      else out += LB.esc(w);
      i = j; continue; }
    if (/[0-9]/.test(ch)) { let j = i + 1; while (j < n && /[0-9.eE]/.test(line[j])) j++; out += '<span class="tok-n">' + line.slice(i, j) + '</span>'; i = j; continue; }
    out += LB.esc(ch); i++;
  }
  return out;
};

/* =====================================================================
   Code-Tracer: zeichnet alle Schritte einmal auf, spielt dann ab
   ===================================================================== */
LB.Tracer = class {
  constructor(o) {
    this.o = o; this.root = document.getElementById(o.id); if (!this.root) return;
    this.langs = o.langs || { R: o.code };                            // {R: [...], Python: [...]}
    this.lang = LB.store.get('lb-lang', 'R'); if (!this.langs[this.lang]) this.lang = Object.keys(this.langs)[0];
    this.root.classList.add('tracer');
    const ex = (o.examples || []).map((e, k) => '<option value="' + k + '">' + LB.esc(e[0]) + '</option>').join('');
    this.root.innerHTML =
      '<div class="tr-head"><b>▶ ' + LB.esc(o.title) + '</b>' +
      '<label>Eingabe <input class="tr-in" value="' + LB.esc(o.input) + '" aria-label="Eingabe"></label>' +
      (ex ? '<select class="tr-ex" aria-label="Beispiele"><option value="">Beispiele …</option>' + ex + '</select>' : '') +
      '<span class="seg tr-lang">' + Object.keys(this.langs).map(L => '<button data-lang="' + L + '">' + L + '</button>').join('') + '</span>' +
      '<button data-a="run">↻ neu starten</button>' + (o.hint ? '<span class="muted small">' + o.hint + '</span>' : '') + '</div>' +
      '<div class="tr-grid"><pre class="tr-code"></pre><div class="tr-state"></div></div>' +
      '<div class="tr-ctl"><button data-a="first" title="Anfang">⏮</button><button data-a="prev" title="zurück">◀</button>' +
      '<input type="range" class="tr-pos" min="0" value="0" aria-label="Schritt">' +
      '<button data-a="next" title="vor">▶</button><button data-a="last" title="Ende">⏭</button>' +
      '<button data-a="auto">⏯ auto</button><span class="tr-cnt"></span></div>' +
      '<div class="tr-msg"></div>';
    this.q = s => this.root.querySelector(s);
    this.root.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (b) this.act(b.dataset.a);
      const l = e.target.closest('[data-lang]'); if (l) { LB.store.set('lb-lang', l.dataset.lang); LB.$$('.tracer').forEach(t => t._tr && t._tr.setLang(l.dataset.lang)); }
    });
    this.root._tr = this;
    this.q('.tr-pos').addEventListener('input', e => this.show(+e.target.value));
    this.q('.tr-in').addEventListener('keydown', e => { if (e.key === 'Enter') this.run(); });
    const sel = this.q('.tr-ex');
    if (sel) sel.addEventListener('change', () => { if (sel.value !== '') { this.q('.tr-in').value = o.examples[+sel.value][1]; this.run(); } sel.value = ''; });
    this.run();
  }
  setLang(L) { if (!this.langs[L]) return; this.lang = L; this.renderCode(); this.show(this.i || 0); }
  renderCode() {
    let lines = this.langs[this.lang];
    if (this.o.codeFor && this.inp !== undefined) lines = this.o.codeFor(this.inp, this.lang, lines);
    this.q('.tr-code').innerHTML = lines.map((l, i) =>
      '<div class="row" data-k="' + LB.markOf(l) + '"><span class="ln">' + (i + 1) + '</span>' + LB.hlLine(LB.stripMark(l), this.lang) + '<span class="hits"></span></div>').join('');
    LB.$$('[data-lang]', this.root).forEach(b => b.classList.toggle('on', b.dataset.lang === this.lang));
  }
  run() {
    const snaps = [];
    const rec = { step: (line, msg, st) => snaps.push({ line, msg, st: JSON.parse(JSON.stringify(st)) }) };
    let inp;
    try { inp = this.o.parse(this.q('.tr-in').value); }
    catch (e) { snaps.push({ line: 0, msg: '⚠ Eingabe nicht lesbar: ' + LB.esc(e.message), st: null }); }
    this.inp = inp; this.renderCode();
    if (inp !== undefined) { try { this.o.run(rec, inp); } catch (e) { snaps.push({ line: 0, msg: '⚠ ' + LB.esc(e.message), st: null }); } }
    this.snaps = snaps.length ? snaps : [{ line: 0, msg: '(keine Schritte)', st: null }];
    this.q('.tr-pos').max = this.snaps.length - 1;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.show(0);
  }
  act(a) {
    const n = this.snaps.length - 1;
    if (a === 'run') this.run();
    else if (a === 'first') this.show(0);
    else if (a === 'prev') this.show(Math.max(0, this.i - 1));
    else if (a === 'next') this.show(Math.min(n, this.i + 1));
    else if (a === 'last') this.show(n);
    else if (a === 'auto') {
      if (this.timer) { clearInterval(this.timer); this.timer = null; return; }
      if (this.i >= n) this.show(0);
      this.timer = setInterval(() => { if (this.i >= n) { clearInterval(this.timer); this.timer = null; } else this.show(this.i + 1); }, this.o.speed || 750);
    }
  }
  show(i) {
    this.i = i; const s = this.snaps[i]; this.q('.tr-pos').value = i;
    const hits = {};
    for (let k = 0; k <= i; k++) hits[this.snaps[k].line] = (hits[this.snaps[k].line] || 0) + 1;
    this.root.querySelectorAll('.tr-code .row').forEach(r => {
      const k = r.dataset.k; r.classList.toggle('cur', !!k && k === s.line);
      r.querySelector('.hits').textContent = k && hits[k] ? '×' + hits[k] : '';
    });
    const st = this.q('.tr-state'); st.innerHTML = s.st ? this.o.view(s.st) : '';
    this.q('.tr-msg').innerHTML = s.msg;
    this.q('.tr-cnt').textContent = 'Schritt ' + i + ' / ' + (this.snaps.length - 1);
    LB.tex(this.q('.tr-msg')); LB.tex(st);
  }
};
/* Hilfen für Zustandsansichten */
LB.kvHTML = (pairs) => '<div class="kv">' + pairs.map(p => '<div><i>' + p[0] + '</i><span' + (p[2] ? ' class="kw-' + p[2] + '"' : '') + '>' + p[1] + '</span></div>').join('') + '</div>';
LB.cellsHTML = (arr, cls) => '<div class="cells">' + arr.map((x, k) => '<span class="c ' + ((cls && cls(k)) || '') + '">' + x + '<i>' + k + '</i></span>').join('') + '</div>';

/* =====================================================================
   Farbige Schlüsselwörter im Fließtext (Wortliste Begriff → Rolle)
   ===================================================================== */
LB.KW = LB.KW || [];
const SKIP = 'pre, code, .katex, h1, h2, h3, h4, h5, button, svg, .vn-badge, .src, .srcin, .vn-res, .kw, a, summary, .lbtop, .lbmenu, .vid, .tracer, .legend, th, label, output, .plot, .anat .sym, select, textarea, .nokw';
LB.kwColor = function () {
  if (!LB.KW.length) return;
  const terms = LB.KW.slice().sort((a, b) => b[0].length - a[0].length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(?<![\\p{L}\\p{N}])(' + terms.map(t => esc(t[0])).join('|') + ')(\\p{Ll}{0,3})(?![\\p{L}\\p{N}])', 'u');
  const role = {}; terms.forEach(t => role[t[0]] = t[1]);
  const blocks = LB.$$('main p, main li, main td, main .vn-step > div, main .vn-task, main .pt-grid > div, main .ptq, main .anat > div > span:last-child, main .read, main .why, main .recog, main .verdict, main .trap, main .gblk > div');
  blocks.forEach(bl => {
    if (bl.closest(SKIP)) return;
    const used = new Set(); let count = 0;
    const walker = document.createTreeWalker(bl, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement && n.parentElement.closest(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (count >= 6) break;
      let txt = node.nodeValue, m, frag = null, last = 0, off = 0;
      while (count < 6 && (m = re.exec(txt.slice(off))) !== null) {
        const start = off + m.index, word = m[0], base = m[1];
        off = start + word.length;
        if (used.has(base)) continue;
        used.add(base); count++;
        if (!frag) frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode(txt.slice(last, start)));
        const sp = document.createElement('span'); sp.className = 'kw kw-' + role[base]; sp.textContent = word; frag.appendChild(sp);
        last = start + word.length;
      }
      if (frag) { frag.appendChild(document.createTextNode(txt.slice(last))); node.parentNode.replaceChild(frag, node); }
    }
  });
};

/* =====================================================================
   Menü, Grundlage-Hervorhebung, Teilwechsel
   ===================================================================== */
LB.menu = open => document.body.classList.toggle('menu-open', open);
function initMenu() {
  const m = document.getElementById('lbMenu'); if (!m) return;
  LB.$$('#lbOpen, #lbFab').forEach(b => b.addEventListener('click', () => LB.menu(true)));
  m.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (a && a.dataset.part !== undefined && LB.inFrame) { e.preventDefault(); window.parent.postMessage({ lb: 'part', i: +a.dataset.part }, '*'); LB.menu(false); return; }
    if (e.target.closest('[data-close]') || a || e.target.id === 'lbMenu') LB.menu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') LB.menu(false);
    if ((e.key === 't' || e.key === 'T') && !e.target.closest('input, textarea, select') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (LB.inFrame) window.parent.postMessage({ lb: 'overview' }, '*'); else LB.menu(!document.body.classList.contains('menu-open'));
    }
  });
  const hl = document.getElementById('lbHlG');
  if (hl) { hl.checked = LB.store.get('lb-hlg', '0') === '1'; document.body.classList.toggle('hl-g', hl.checked);
    hl.addEventListener('change', () => { document.body.classList.toggle('hl-g', hl.checked); LB.store.set('lb-hlg', hl.checked ? '1' : '0'); }); }
}

/* =====================================================================
   Video-Links auf lokale .mp4-Dateien (Linux Mint, file://)
   Standard: Ordner „videos/" neben der HTML-Datei (Symlink genügt),
   sonst absoluten Pfad im ☰-Menü eintragen.
   ===================================================================== */
LB.vbase = LB.store.get('lb-vbase', 'videos/');
LB.vbaseAbs = null;                                                // von der Gesamtdatei gesetzt
function vurl(f) {
  const enc = f.split('/').map(encodeURIComponent).join('/');
  let base = LB.vbaseAbs || LB.vbase || 'videos/';
  if (!/\/$/.test(base)) base += '/';
  if (/^\//.test(base)) base = 'file://' + base;                   // /home/… → file:///home/…
  try { return new URL(base + enc, LB.vbaseAbs ? undefined : document.baseURI).href; } catch (e) { return base + enc; }
}
LB.vpath = f => { const u = vurl(f); try { return decodeURIComponent(new URL(u).pathname); } catch (e) { return u; } };
function initVideos() {
  const upd = () => LB.$$('.vid').forEach(v => { const a = v.querySelector('a.vopen'); if (a) a.href = vurl(v.dataset.f); });
  upd();
  document.addEventListener('click', e => {
    const a = e.target.closest('.vid a.vopen');
    if (a && LB.inFrame) { e.preventDefault(); window.parent.postMessage({ lb: 'open', f: a.closest('.vid').dataset.f }, '*'); return; }
    const c = e.target.closest('.vid .vcopy');
    if (c) {
      const p = LB.vpath(c.closest('.vid').dataset.f);
      const done = () => { c.textContent = '✓ kopiert'; setTimeout(() => { c.textContent = '📋 Pfad'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(p).then(done, () => window.prompt('Pfad (Strg+C):', p));
      else window.prompt('Pfad (Strg+C):', p);
    }
  });
  const inp = document.getElementById('lbVbase');
  if (inp) { inp.value = LB.vbase; inp.addEventListener('change', () => { LB.vbase = inp.value.trim() || 'videos/'; LB.store.set('lb-vbase', LB.vbase); upd();
    if (LB.inFrame) window.parent.postMessage({ lb: 'vbase', v: LB.vbase }, '*'); }); }
  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.lb === 'vbase') { LB.vbaseAbs = d.abs; LB.vbase = d.v; if (inp) inp.value = d.v; upd(); }
    if (d.lb === 'menu') LB.menu(true);
  });
  LB.updVideos = upd;
}

/* =====================================================================
   Start
   ===================================================================== */
function start() {
  initMenu(); initVideos();
  LB.$$('.code pre .row').forEach(r => { const ln = r.querySelector('.ln'); const txt = r.dataset.src !== undefined ? r.dataset.src : ''; r.innerHTML = ''; r.appendChild(ln); r.insertAdjacentHTML('beforeend', LB.hlLine(txt, r.closest('.code').dataset.lang)); });
  LB.inits.forEach(fn => { try { fn(); } catch (e) { console.error(e); if (window.__lbErrors) window.__lbErrors.push(String(e)); throw e; } });
  LB.tex(document.body);
  LB.kwColor();
  document.addEventListener('toggle', e => { if (window.Plotly && e.target.open) LB.$$('.js-plotly-plot', e.target).forEach(p => Plotly.Plots.resize(p)); }, true);
  if (LB.inFrame) window.parent.postMessage({ lb: 'ready' }, '*');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
