/* Kapitel 1 · Grundlagen der Wahrscheinlichkeitsrechnung: Visuals, Tracer, Training */
LB.KW = [
  ['Grundraum', 'mem'], ['Elementarereignis', 'mem'], ['Ereignis', 'mem'], ['Gegenereignis', 'mem'], ['Partition', 'mem'], ['Zufallsexperiment', 'rule'],
  ['Axiom', 'rule'], ['Laplace', 'rule'], ['Kolmogorov', 'rule'], ['Additionssatz', 'rule'], ['Multiplikationsregel', 'rule'], ['Siebformel', 'rule'],
  ['Satz von Bayes', 'rule'], ['totalen Wahrscheinlichkeit', 'rule'], ['totale W\'keit', 'rule'], ['Produktformel', 'rule'], ['disjunkt', 'rule'], ['unabhängig', 'rule'], ['Unabhängigkeit', 'rule'],
  ['Schnitt', 'chg'], ['Vereinigung', 'chg'], ['Komplement', 'chg'],
  ['bedingte', 'cond'], ['Bedingung', 'cond'],
  ['Basisrate', 'par'], ['Sensitivität', 'par'], ['Prävalenz', 'par'],
  ['relative Häufigkeit', 'idx'], ['Zähler', 'idx'], ['gesucht', 'res'], ['Gesucht', 'res']
];

/* ---------------------------------------------------------------- Venn-Diagramm */
LB.on(function venn() {
  const box = document.getElementById('venn'); if (!box) return;
  const C = LB.C;
  box.innerHTML = `<svg viewBox="0 0 460 300" role="img" aria-label="Venn-Diagramm">
   <defs>
    <clipPath id="vnClipA"><circle cx="175" cy="150" r="100"/></clipPath>
    <mask id="vnNoA"><rect width="460" height="300" fill="#fff"/><circle cx="175" cy="150" r="100" fill="#000"/></mask>
    <mask id="vnNoB"><rect width="460" height="300" fill="#fff"/><circle cx="285" cy="150" r="100" fill="#000"/></mask>
    <mask id="vnNoAB"><rect width="460" height="300" fill="#fff"/><circle cx="175" cy="150" r="100" fill="#000"/><circle cx="285" cy="150" r="100" fill="#000"/></mask>
   </defs>
   <rect x="8" y="8" width="444" height="284" rx="14" fill="#0b0f14" stroke="${C.mem}" stroke-width="1.5"/>
   <g id="vnHi" fill="${LB.rgba(C.chg, 0.55)}"></g>
   <circle cx="175" cy="150" r="100" fill="none" stroke="${C.mem}" stroke-width="2.4"/>
   <circle cx="285" cy="150" r="100" fill="none" stroke="${C.par}" stroke-width="2.4"/>
   <g font-family="Source Sans 3,sans-serif" font-weight="700" font-size="22" fill="${C.text}" text-anchor="middle">
    <text x="30" y="36" fill="${C.mem}">Ω</text><text x="110" y="60" fill="${C.mem}">A</text><text x="350" y="60" fill="${C.par}">B</text>
    <text x="125" y="140">1</text><text x="140" y="185">2</text><text x="230" y="158">3</text><text x="330" y="158">4</text>
    <text x="410" y="250">5</text><text x="50" y="260">6</text></g></svg>`;
  const hi = document.getElementById('vnHi');
  const A = '<circle cx="175" cy="150" r="100"/>', B = '<circle cx="285" cy="150" r="100"/>', R = '<rect x="8" y="8" width="444" height="284" rx="14"/>';
  const ops = {
    AnB: [`<g clip-path="url(#vnClipA)">${B}</g>`, '\\(\\mA\\capc\\mB=\\{3\\}\\)', 'Schnitt „und“: nur die Linse, beide Bedingungen gleichzeitig.'],
    AuB: [A + B, '\\(\\mA\\cupc\\mB=\\{1,2,3,4\\}\\)', 'Vereinigung „oder“: alles, was in mindestens einem Kreis liegt.'],
    Ac: [`<g mask="url(#vnNoA)">${R}</g>`, '\\(\\mA\\co=\\{4,5,6\\}\\)', 'Komplement „nicht A“: alles außerhalb von A.'],
    AmB: [`<g mask="url(#vnNoB)">${A}</g>`, '\\(\\mA\\setm\\mB=\\{1,2\\}\\)', 'Differenz: A ohne den Teil, der auch in B liegt. Es gilt \\(\\mA\\setm\\mB=\\mA\\capc\\mB\\co\\).'],
    BmA: [`<g mask="url(#vnNoA)">${B}</g>`, '\\(\\mB\\setm\\mA=\\{4\\}\\)', 'Differenz andersherum: B ohne A.'],
    none: [`<g mask="url(#vnNoAB)">${R}</g>`, '\\((\\mA\\cupc\\mB)\\co=\\mA\\co\\capc\\mB\\co=\\{5,6\\}\\)', 'De Morgan: „nicht (A oder B)“ = „nicht A und nicht B“.'],
    xor: [`<g mask="url(#vnNoB)">${A}</g><g mask="url(#vnNoA)">${B}</g>`, '\\((\\mA\\setm\\mB)\\cupc(\\mB\\setm\\mA)=\\{1,2,4\\}\\)', 'Genau eines: Vereinigung ohne die Linse; \\(\\PP=\\PP(\\mA)+\\PP(\\mB)-2\\PP(\\mA\\capc\\mB)\\).']
  };
  const set = op => {
    hi.innerHTML = ops[op][0];
    document.getElementById('vennTxt').innerHTML = ops[op][1];
    document.getElementById('vennSet').innerHTML = ops[op][2] + ' Laplace-W\'keit am Würfel: \\(\\Res{' + ({ AnB: '1/6', AuB: '4/6', Ac: '3/6', AmB: '2/6', BmA: '1/6', none: '2/6', xor: '3/6' })[op] + '}\\).';
    LB.$$('#vennBtns .btn').forEach(b => b.classList.toggle('on', b.dataset.op === op));
    LB.tex(document.getElementById('vennTxt')); LB.tex(document.getElementById('vennSet'));
  };
  document.getElementById('vennBtns').addEventListener('click', e => { const b = e.target.closest('[data-op]'); if (b) set(b.dataset.op); });
  set('AnB');
});

/* ---------------------------------------------------------------- relative Häufigkeit (Simulation) */
LB.on(function freq() {
  if (!document.getElementById('fqPlot')) return;
  let seed = 7;
  const run = LB.bind(['fqN', 'fqP'], v => {
    const r = LB.S.rng(seed), n = v.fqN, p = v.fqP; let t = 0; const xs = [], ys = [];
    for (let i = 1; i <= n; i++) { if (r() < p) t++; xs.push(i); ys.push(t / i); }
    LB.plot('fqPlot', [
      { x: xs, y: ys, mode: 'lines', line: { color: LB.C.idx, width: 2 }, name: 'fₙ(A)' },
      { x: [1, n], y: [p, p], mode: 'lines', line: { color: LB.C.par, dash: 'dash', width: 2 }, name: 'P(A)' }
    ], { height: 300, showlegend: true, xaxis: { title: 'Anzahl Würfe n', type: 'log' }, yaxis: { title: 'relative Häufigkeit', range: [0, 1] } });
  });
  document.getElementById('fqNew').addEventListener('click', () => { seed++; run(); });
});

/* ---------------------------------------------------------------- Geburtstagsproblem */
LB.on(function birthday() {
  if (!document.getElementById('bdPlot')) return;
  const pAll = n => { let q = 1; for (let i = 0; i < n; i++) q *= (365 - i) / 365; return 1 - q; };
  const xs = [], ys = []; for (let n = 1; n <= 80; n++) { xs.push(n); ys.push(pAll(n)); }
  LB.bind(['bdN'], v => {
    const n = v.bdN, p = pAll(n);
    LB.plot('bdPlot', [{ x: xs, y: ys, mode: 'lines', line: { color: LB.C.res, width: 2.5 } },
      { x: [n], y: [p], mode: 'markers', marker: { color: LB.C.chg, size: 12 } },
      { x: [1, 80], y: [0.5, 0.5], mode: 'lines', line: { color: LB.C.muted, dash: 'dot', width: 1 } }],
      { height: 260, xaxis: { title: 'Anzahl Personen n' }, yaxis: { title: 'P(mind. 2 gleich)', range: [0, 1.02] } });
    document.getElementById('bdOut').innerHTML = 'n = ' + n + ': P(alle verschieden) = ' + LB.fmt(1 - p) + ' → P(mindestens zwei gleich) = <b class="kw-res">' + LB.fmt(p) + '</b> · Anzahl Paare = ' + (n * (n - 1) / 2);
  });
});

/* ---------------------------------------------------------------- Produktformel-Prüfer */
LB.on(function prodcheck() {
  if (!document.getElementById('upPlot')) return;
  LB.bind(['upA', 'upB', 'upAB'], v => {
    const pa = v.upA, pb = v.upB, pab = v.upAB, prod = pa * pb;
    const lo = Math.max(0, pa + pb - 1), hi = Math.min(pa, pb);
    LB.plot('upPlot', [{ type: 'bar', orientation: 'h', y: ['P(A)·P(B)', 'P(A∩B)'], x: [prod, pab], marker: { color: [LB.C.par, LB.C.res] }, text: [LB.fmt(prod, 4), LB.fmt(pab, 4)], textposition: 'outside' }],
      { height: 190, margin: { l: 90, r: 40, t: 10, b: 35 }, xaxis: { range: [0, 1] } });
    let msg;
    if (pab < lo - 1e-9 || pab > hi + 1e-9) msg = '<span class="bad">⚠ unmöglich: es muss \\(' + LB.fmt(lo, 3) + '\\le\\PP(\\mA\\capc\\mB)\\le' + LB.fmt(hi, 3) + '\\) gelten (Monotonie und Additionssatz).</span>';
    else if (Math.abs(pab - prod) < 0.0051) msg = '<span class="ok">≈ unabhängig</span>: \\(\\PP(\\mA\\capc\\mB)\\approx\\PP(\\mA)\\PP(\\mB)=' + LB.fmt(prod, 4) + '\\)';
    else if (pab > prod) msg = '<b class="kw-chg">positiv abhängig</b>: die Überlappung ist größer als das Produkt, \\(\\PP(\\mA\\given\\mB)=' + LB.fmt(pb ? pab / pb : NaN, 3) + '>\\PP(\\mA)=' + LB.fmt(pa, 2) + '\\)';
    else msg = '<b class="kw-cond">negativ abhängig</b>: die Überlappung ist kleiner als das Produkt, \\(\\PP(\\mA\\given\\mB)=' + LB.fmt(pb ? pab / pb : NaN, 3) + '<\\PP(\\mA)=' + LB.fmt(pa, 2) + '\\)';
    const o = document.getElementById('upOut'); o.innerHTML = msg; LB.tex(o);
  });
});

/* ---------------------------------------------------------------- Bedingung schaltet Grundraum um */
LB.on(function condview() {
  const box = document.getElementById('cdSvg'); if (!box) return;
  const C = LB.C;
  LB.bind(['cdO'], v => {
    const o = v.cdO;                                                   // Anteil von B, der auch in A liegt
    const bx = 250, bw = 160, ax = bx + bw * (1 - o) - 120, aw = 120 + bw * o;  // A reicht von links in B hinein
    const W = 1000;
    box.innerHTML = `<svg viewBox="0 0 ${W} 250" role="img" aria-label="bedingte Wahrscheinlichkeit">
     <defs><pattern id="cdHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" fill="${LB.rgba(C.res, 0.75)}"/></pattern></defs>
     <g font-family="Source Sans 3,sans-serif" font-size="17" font-weight="700">
      <rect x="10" y="30" width="470" height="200" rx="12" fill="#0b0f14" stroke="${C.mem}"/><text x="24" y="54" fill="${C.mem}">Ω (voll)</text>
      <rect x="${ax}" y="70" width="${Math.max(aw, 0)}" height="120" fill="${LB.rgba(C.mem, 0.18)}" stroke="${C.mem}"/><text x="${ax + 8}" y="92" fill="${C.mem}">A</text>
      <rect x="${bx}" y="60" width="${bw}" height="140" fill="${LB.rgba(C.par, 0.12)}" stroke="${C.par}" stroke-width="2"/><text x="${bx + bw - 22}" y="84" fill="${C.par}">B</text>
      <rect x="${bx}" y="70" width="${bw * o}" height="120" fill="url(#cdHatch)"/>
      <text x="505" y="138" fill="${C.cond}" font-size="30">→ | B</text>
      <rect x="590" y="30" width="400" height="200" rx="12" fill="${LB.rgba(C.par, 0.12)}" stroke="${C.par}" stroke-width="2.5"/><text x="604" y="54" fill="${C.par}">nach „| B“: Ω′ = B</text>
      <rect x="590" y="30" width="${400 * o}" height="200" rx="12" fill="url(#cdHatch)"/>
      <text x="790" y="215" fill="${C.text}" text-anchor="middle">markiert: Anteil ${LB.fmt(o, 2)} von B</text></g></svg>`;
    const out = document.getElementById('cdOut');
    out.innerHTML = '\\(\\Res{\\PP(\\mA\\given\\mB)}=\\dfrac{\\PP(\\mA\\capc\\mB)}{\\PP(\\mB)}=\\Res{' + LB.fmt(o, 2) + '}\\): der markierte Anteil am neuen Grundraum B.';
    LB.tex(out);
  });
});

/* ---------------------------------------------------------------- Wahrscheinlichkeitsbaum */
LB.on(function tree() {
  const box = document.getElementById('treeSvg'); if (!box) return;
  const C = LB.C;
  LB.bind(['trB', 'trAB', 'trABc'], v => {
    const pB = v.trB, pAB = v.trAB, pABc = v.trABc, f = x => LB.fmt(x, 4);
    const p = [pB * pAB, pB * (1 - pAB), (1 - pB) * pABc, (1 - pB) * (1 - pABc)];
    const leaf = (y, lab, val, col) => `<rect x="640" y="${y - 22}" width="330" height="40" rx="9" fill="#1c2129" stroke="${col}"/><text x="656" y="${y + 4}" fill="${col}">${lab}</text><text x="955" y="${y + 4}" fill="${C.text}" text-anchor="end">${val}</text>`;
    box.innerHTML = `<svg viewBox="0 0 1000 330" role="img" aria-label="Wahrscheinlichkeitsbaum"><g font-family="Source Sans 3,sans-serif" font-size="17">
      <circle cx="40" cy="165" r="8" fill="${C.text}"/>
      <line x1="48" y1="160" x2="300" y2="85" stroke="${C.muted}" stroke-width="2"/><line x1="48" y1="170" x2="300" y2="245" stroke="${C.muted}" stroke-width="2"/>
      <text x="150" y="105" fill="${C.par}">P(B) = ${f(pB)}</text><text x="150" y="240" fill="${C.par}">P(Bᶜ) = ${f(1 - pB)}</text>
      <rect x="300" y="65" width="80" height="40" rx="9" fill="#1c2129" stroke="${C.mem}"/><text x="340" y="91" fill="${C.mem}" text-anchor="middle">B nass</text>
      <rect x="300" y="225" width="80" height="40" rx="9" fill="#1c2129" stroke="${C.mem}"/><text x="340" y="251" fill="${C.mem}" text-anchor="middle">Bᶜ</text>
      <line x1="380" y1="80" x2="640" y2="30" stroke="${C.res}" stroke-width="2.5"/><line x1="380" y1="90" x2="640" y2="110" stroke="${C.muted}" stroke-width="2"/>
      <line x1="380" y1="240" x2="640" y2="210" stroke="${C.res}" stroke-width="2.5"/><line x1="380" y1="250" x2="640" y2="290" stroke="${C.muted}" stroke-width="2"/>
      <text x="470" y="42" fill="${C.cond}">P(A|B) = ${f(pAB)}</text><text x="470" y="118" fill="${C.cond}">P(Aᶜ|B) = ${f(1 - pAB)}</text>
      <text x="470" y="205" fill="${C.cond}">P(A|Bᶜ) = ${f(pABc)}</text><text x="470" y="292" fill="${C.cond}">P(Aᶜ|Bᶜ) = ${f(1 - pABc)}</text>
      ${leaf(30, 'A ∩ B (Unfall, nass)', f(p[0]), C.res)}${leaf(110, 'Aᶜ ∩ B', f(p[1]), C.border)}${leaf(210, 'A ∩ Bᶜ (Unfall, trocken)', f(p[2]), C.res)}${leaf(290, 'Aᶜ ∩ Bᶜ', f(p[3]), C.border)}
      </g></svg>`;
    const PA = p[0] + p[2], out = document.getElementById('treeOut');
    out.innerHTML = '1. Pfadregel (multiplizieren) gibt die Blätter. 2. Pfadregel: \\(\\Res{\\PP(\\mA)}=' + f(p[0]) + '+' + f(p[2]) + '=\\Res{' + f(PA) + '}\\). ' +
      'Umgedreht (Bayes): \\(\\PP(\\mB\\given\\mA)=' + f(p[0]) + '/' + f(PA) + '=' + (PA > 0 ? f(p[0] / PA) : '–') + '\\). Summe aller Blätter = ' + f(p[0] + p[1] + p[2] + p[3]) + ' ✓';
    LB.tex(out);
  });
});

/* ---------------------------------------------------------------- Bayes-Explorer */
LB.on(function bayesExplorer() {
  if (!document.getElementById('byPlot')) return;
  LB.bind(['byS', 'byF', 'byP'], v => {
    const s = v.byS, fa = v.byF, pr = Math.pow(10, v.byP);
    document.getElementById('byPo').textContent = LB.fmt(pr, 4);
    const post = p => s * p / (s * p + fa * (1 - p));
    const xs = [], ys = []; for (let e = -4; e <= -0.3; e += 0.02) { const p = Math.pow(10, e); xs.push(p); ys.push(post(p)); }
    LB.plot('byPlot', [{ x: xs, y: ys, mode: 'lines', line: { color: LB.C.res, width: 2.6 } },
      { x: [pr], y: [post(pr)], mode: 'markers', marker: { color: LB.C.chg, size: 12 } }],
      { height: 300, xaxis: { title: 'Basisrate P(B₁) (log)', type: 'log' }, yaxis: { title: 'P(B₁ | A)', range: [0, 1.02] } });
    const n = 1e6, b1 = n * pr, b2 = n - b1, a1 = b1 * s, a2 = b2 * fa, r = x => Math.round(x).toLocaleString('de-DE');
    const out = document.getElementById('byOut');
    out.innerHTML = '\\(\\Res{\\PP(\\Mem{B_1}\\given\\mA)}=\\dfrac{' + LB.fmt(s, 3) + '\\cdot' + LB.fmt(pr, 4) + '}{' + LB.fmt(s, 3) + '\\cdot' + LB.fmt(pr, 4) + '+' + LB.fmt(fa, 3) + '\\cdot' + LB.fmt(1 - pr, 4) + '}=\\Res{' + LB.fmt(post(pr), 4) + '}\\)';
    LB.tex(out);
    document.getElementById('byTab').innerHTML = '<table class="tbl"><tr><th>n = 1 000 000</th><th class="r">B₁ (wirklich da)</th><th class="r">B₂ (nicht da)</th><th class="r">Summe</th></tr>' +
      '<tr><td>A (Alarm)</td><td class="r"><b class="kw-res">' + r(a1) + '</b></td><td class="r">' + r(a2) + '</td><td class="r">' + r(a1 + a2) + '</td></tr>' +
      '<tr><td>Aᶜ</td><td class="r">' + r(b1 - a1) + '</td><td class="r">' + r(b2 - a2) + '</td><td class="r">' + r(n - a1 - a2) + '</td></tr>' +
      '<tr><td>Summe</td><td class="r">' + r(b1) + '</td><td class="r">' + r(b2) + '</td><td class="r">1.000.000</td></tr></table>' +
      '<p class="small">Von ' + r(a1 + a2) + ' Alarmen sind ' + r(a1) + ' echt: ' + LB.fmt(a1 / (a1 + a2), 4) + '.</p>';
  });
});

/* ================================================================ Tracer */
/* Würfelraster 6×6 für Zustandsansichten */
function diceGrid(cls) {
  let h = '<div class="dgrid"><span></span>';
  for (let b = 1; b <= 6; b++) h += '<span class="dh">b=' + b + '</span>';
  for (let a = 1; a <= 6; a++) { h += '<span class="dh">a=' + a + '</span>'; for (let b = 1; b <= 6; b++) { const c = cls(a, b); h += '<span class="dc ' + c[0] + '">' + (c[1] || (a + b)) + '</span>'; } }
  return h + '</div>';
}
/* Bedingungen „A: … ; B: …“ in JS-Funktion, R und Python übersetzen */
function parseAB(s, defA, defB) {
  const m = s.match(/A\s*:\s*([^;]+);\s*B\s*:\s*(.+)$/);
  if (!m) throw new Error('Format: A: Bedingung ; B: Bedingung (z. B. A: a%2==0 ; B: a+b==7)');
  const ok = e => { if (!/^[ab0-9+\-*%=!<>&|() ]+$/.test(e)) throw new Error('erlaubt sind a, b, Zahlen und + - * % == != < <= > >= && || ! ( )'); return e.trim(); };
  const eA = ok(m[1]), eB = ok(m[2]);
  return { eA, eB, A: new Function('a', 'b', 'return (' + eA + ');'), B: new Function('a', 'b', 'return (' + eB + ');') };
}
const toR = e => e.replace(/%/g, '%%');
const toPy = e => e.replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!(?!=)/g, 'not ').replace(/\s+/g, ' ');
function codeAB(inp, lang, lines, cmtA, cmtB) {
  return lines.map(l => {
    if (/#@defA\s*$/.test(l)) return lang === 'R' ? 'A <- function(a, b) ' + toR(inp.eA) + '    # Ereignis A: ' + cmtA + ' #@defA' : 'def A(a, b): return ' + toPy(inp.eA) + '    # Ereignis A: ' + cmtA + ' #@defA';
    if (/#@defB\s*$/.test(l)) return lang === 'R' ? 'B <- function(a, b) ' + toR(inp.eB) + '    # ' + cmtB + ' #@defB' : 'def B(a, b): return ' + toPy(inp.eB) + '    # ' + cmtB + ' #@defB';
    return l;
  });
}

LB.on(function tracers() {
  /* ---- relative Häufigkeit */
  new LB.Tracer({
    id: 'trRel', title: 'relative Häufigkeit f_i(A) Wurf für Wurf', langs: CODE('k1_relhaeuf'),
    vars: [['wuerfe', 'mem', 'die beobachteten Würfe (Daten), K = Kopf = Ereignis A'], ['n', 'par', 'Anzahl Wiederholungen, fest'], ['i', 'idx', 'Nummer des aktuellen Wurfs, läuft 1, 2, …, n'],
      ['treffer', 'chg', 'Zähler: wie oft A bisher eingetreten ist'], ['f', 'res', 'relative Häufigkeit nach i Würfen: treffer / i'], ['f_alle', 'res', 'alle f₁ … fₙ auf einmal (vektorisiert)']],
    together: 'Die Schleife geht Wurf für Wurf (<span class="kw-idx">i</span>). Bei jedem Kopf wächst <span class="kw-chg">treffer</span> um 1, und <span class="kw-res">f</span> teilt diesen Zähler durch die bisherige Anzahl i. So entsteht die Folge f₁, f₂, …, die bei vielen Wiederholungen gegen die wahre Wahrscheinlichkeit P(A) strebt.',
    say: s => 'In ' + s.n + ' Würfen kam Kopf ' + s.t + '-mal, die relative Häufigkeit ist f = ' + LB.fmt(s.f, 3) + '. Das ist eine <b>Beobachtung</b>, keine Wahrscheinlichkeit: f schätzt P(Kopf). ' + (Math.abs(s.f - 0.5) > 0.15 ? 'Der Abstand zu 0.5 ist groß, bei nur ' + s.n + ' Würfen ist das aber noch kein Beweis gegen eine faire Münze.' : 'Der Wert liegt nahe 0.5, passt also zu einer fairen Münze.') + ' Erst für sehr viele Würfe muss f nahe an P(A) liegen (Gesetz der großen Zahlen).',
   
    input: 'K Z K K Z Z K Z K K', hint: 'Würfe als K/Z eintippen',
    examples: [['Grundlage-Folge', 'K Z K K Z Z K Z K K'], ['nur Kopf', 'K K K K K'], ['abwechselnd', 'K Z K Z K Z K Z']],
    parse: s => { const w = s.toUpperCase().replace(/[^KZ]/g, '').split(''); if (!w.length) throw new Error('mindestens ein K oder Z'); if (w.length > 40) throw new Error('höchstens 40 Würfe'); return w; },
    codeFor: (w, lang, lines) => lines.map(l => /#@data\s*$/.test(l) ? (lang === 'R' ? 'wuerfe <- c(' + w.map(x => '"' + x + '"').join(', ') + ')   # beobachtete Würfe #@data' : 'wuerfe = list("' + w.join('') + '")   # beobachtete Würfe #@data') : l),
    run(rec, w) {
      const n = w.length; let t = 0, f = null, i = 0; const st = () => ({ w, i, t, f, n });
      rec.step('data', 'Daten: ' + n + ' Würfe liegen vor.', st());
      rec.step('n', '\\(\\Par{n}=' + n + '\\) Wiederholungen.', st());
      rec.step('t0', 'Zähler \\(\\Idx{\\text{treffer}}=0\\): noch nichts gezählt.', st());
      for (i = 1; i <= n; i++) {
        rec.step('loop', 'Wurf \\(\\Idx{i}=' + i + '\\) von ' + n + '.', st());
        const hit = w[i - 1] === 'K'; if (hit) t++;
        rec.step('if', 'Wurf ' + i + ' zeigt <b>' + w[i - 1] + '</b>' + (hit ? ': \\(\\mA\\) tritt ein, Zähler auf ' + t + '.' : ': \\(\\mA\\) tritt nicht ein, Zähler bleibt ' + t + '.'), st());
        f = t / i;
        rec.step('f', '\\(\\Idx{f_{' + i + '}}(\\mA)=\\tfrac{' + t + '}{' + i + '}=' + LB.fmt(f, 4) + '\\)', st());
        rec.step('out', 'Ausgabe: i = ' + i + ', f = ' + LB.fmt(f, 4), st());
      }
      i = n;
      rec.step('vec', 'Vektorisiert entsteht dieselbe Folge mit <code>cumsum</code>. Endwert \\(\\Idx{f_{' + n + '}}=' + LB.fmt(f, 4) + '\\), wahres \\(\\PP(\\mA)=0.5\\).', st());
    },
    view: s => LB.cellsHTML(s.w, k => k === s.i - 1 ? 'o' : (k < s.i ? (s.w[k] === 'K' ? 'm' : '') : 'out'), 1, { idx: 'Wurf i', val: 'wuerfe[i]', role: 'mem', note: 'grün = Kopf gezählt' }) +
      LB.kvHTML([['Wurf i', s.i, 'idx'], ['treffer', s.t, 'chg'], ['n', s.n, 'par'], ['f_i(A)', s.f === null ? '–' : LB.fmt(s.f, 4), 'res']]) +
      (s.f === null ? '' : '<div class="bar"><span style="width:' + (100 * s.f) + '%"></span><i style="left:50%"></i></div>')
  });

  /* ---- Laplace zwei Würfel */
  new LB.Tracer({
    id: 'trLap', title: 'Laplace: |A| und |Ω| abzählen', langs: CODE('k1_laplace'),
    vars: [['k', 'par', 'Schwelle: A = „Augensumme mindestens k“'], ['a', 'idx', 'Augenzahl des ersten Würfels (1 bis 6)'], ['b', 'idx', 'Augenzahl des zweiten Würfels; (a, b) ist ein Elementarereignis'],
      ['moeglich', 'mem', 'zählt jedes Paar: am Ende |Ω| = 36'], ['guenstig', 'chg', 'zählt nur Paare in A: am Ende |A|'], ['P', 'res', 'Laplace: guenstig / moeglich = P(A)']],
    together: 'Die zwei verschachtelten Schleifen (<span class="kw-idx">a</span> außen, <span class="kw-idx">b</span> innen) erzeugen alle 36 gleich wahrscheinlichen Paare. <span class="kw-mem">moeglich</span> zählt jedes Paar, <span class="kw-chg">guenstig</span> nur die mit a + b ≥ <span class="kw-par">k</span>. Laplace teilt am Ende: <span class="kw-res">P</span> = guenstig / moeglich.',
    say: s => 'Von 36 gleich wahrscheinlichen Paaren haben ' + s.g + ' eine Augensumme von mindestens ' + s.k + '. Mit zwei fairen Würfeln passiert das also mit Wahrscheinlichkeit ' + s.g + '/36 ≈ ' + LB.fmt(s.g / 36, 3) + ', auf lange Sicht in etwa ' + Math.round(100 * s.g / 36) + ' von 100 Würfen.',
   
    input: '10', hint: 'Schwelle k für „Summe ≥ k“', speed: 280,
    examples: [['Summe ≥ 10', '10'], ['Summe ≥ 7', '7'], ['Summe ≥ 2 (sicher)', '2'], ['Summe ≥ 13 (unmöglich)', '13']],
    parse: s => { const k = parseInt(s, 10); if (isNaN(k) || k < 0 || k > 20) throw new Error('eine ganze Zahl k zwischen 0 und 20'); return k; },
    codeFor: (k, lang, lines) => lines.map(l => /#@k\s*$/.test(l) ? (lang === 'R' ? 'k <- ' + k : 'k = ' + k) + '                                     # Schwelle des Ereignisses A #@k' : l),
    run(rec, k) {
      let m = 0, g = 0, a = 0, b = 0; const seen = []; const st = () => ({ k, m, g, a, b, seen: seen.slice() });
      rec.step('k', 'Ereignis \\(\\mA=\\{(a,b): a+b\\ge ' + k + '\\}\\).', st());
      rec.step('init', 'Zähler \\(|\\Om|=0\\), \\(|\\mA|=0\\).', st());
      for (a = 1; a <= 6; a++) {
        rec.step('la', 'Erster Würfel \\(\\Idx{a}=' + a + '\\).', st());
        for (b = 1; b <= 6; b++) {
          rec.step('lb', 'Zweiter Würfel \\(\\Idx{b}=' + b + '\\): Paar (' + a + ',' + b + ').', st());
          m++; rec.step('m', 'Elementarereignis Nr. ' + m + ' gezählt.', st());
          const in_ = a + b >= k; if (in_) g++; seen.push([a, b, in_]);
          rec.step('g', '\\(' + a + '+' + b + '=' + (a + b) + (in_ ? '\\ge' : '<') + k + '\\)' + (in_ ? ': günstig, \\(|\\mA|=' + g + '\\).' : ': nicht in A.'), st());
        }
      }
      a = 0; b = 0;
      rec.step('P', '\\(\\Res{\\PP(\\mA)}=\\tfrac{' + g + '}{' + m + '}=\\Res{' + LB.fmt(g / m, 4) + '}\\)', st());
      rec.step('out', 'Ausgabe: ' + g + ' / ' + m + ' = ' + LB.fmt(g / m, 6), st());
    },
    view: s => {
      const map = {}; s.seen.forEach(x => map[x[0] + ',' + x[1]] = x[2]);
      return diceGrid((a, b) => { const k = a + ',' + b; const cur = a === s.a && b === s.b; return [(k in map ? (map[k] ? 'm' : '') : 'out') + (cur ? ' o' : '')]; }) +
        LB.kvHTML([['a', s.a || '–', 'idx'], ['b', s.b || '–', 'idx'], ['moeglich = |Ω| bisher', s.m, 'mem'], ['guenstig = |A| bisher', s.g, 'chg'], ['P = |A|/|Ω| bisher', s.m ? LB.fmt(s.g / s.m, 4) : '–', 'res']]);
    }
  });

  /* ---- Unabhängigkeit */
  new LB.Tracer({
    id: 'trUnabh', title: 'Produktformel durch Abzählen prüfen', langs: CODE('k1_unabh'),
    vars: [['A', 'cond', 'Ereignis A als Bedingung an das Paar (a, b)'], ['B', 'cond', 'Ereignis B als Bedingung an das Paar (a, b)'], ['a|b', 'idx', 'Augenzahlen der beiden Würfel, zusammen alle 36 Paare'],
      ['nA', 'mem', 'zählt Paare in A → |A|'], ['nB', 'par', 'zählt Paare in B → |B|'], ['nAB', 'res', 'zählt Paare in A und B → |A ∩ B|'],
      ['pA|pB|pAB', 'chg', 'Laplace-W\'keiten: Zähler ÷ 36'], ['unabh', 'res', 'Ergebnis der Produktformel P(A ∩ B) = P(A)·P(B)']],
    together: 'Jedes der 36 Paare wird einmal besucht und bis zu dreimal gezählt: in A (<span class="kw-mem">nA</span>), in B (<span class="kw-par">nB</span>), in beiden (<span class="kw-res">nAB</span>). Geteilt durch 36 werden daraus W\'keiten. Unabhängig heißt: die Schnitt-W\'keit ist genau das Produkt der Einzel-W\'keiten.',
    say: s => { const pA = s.nA / 36, pB = s.nB / 36, pAB = s.nAB / 36, u = Math.abs(pAB - pA * pB) < 1e-12;
      return u ? 'P(A ∩ B) = ' + LB.fmt(pAB, 4) + ' ist genau P(A)·P(B). A und B sind <b>unabhängig</b>: zu wissen, dass A eingetreten ist, ändert die Chance für B nicht (P(B | A) = P(B) = ' + LB.fmt(pB, 3) + ').'
        : 'P(A ∩ B) = ' + LB.fmt(pAB, 4) + ' ≠ P(A)·P(B) = ' + LB.fmt(pA * pB, 4) + '. A und B sind <b>abhängig</b>: ' + (s.nA ? 'wenn A eingetreten ist, hat B die Chance ' + s.nAB + '/' + s.nA + ' = ' + LB.fmt(s.nAB / s.nA, 3) + ' statt ' + LB.fmt(pB, 3) + '.' : 'A tritt nie ein.'); },
   
    input: 'A: a%2==0 ; B: a+b==7', speed: 250,
    examples: [['gerade / Summe 7 (unabhängig)', 'A: a%2==0 ; B: a+b==7'], ['a=6 / Summe ≥ 10 (abhängig)', 'A: a==6 ; B: a+b>=10'], ['a gerade / b gerade', 'A: a%2==0 ; B: b%2==0'], ['Pasch / a=1', 'A: a==b ; B: a==1']],
    parse: s => parseAB(s),
    codeFor: (inp, lang, lines) => codeAB(inp, lang, lines, 'deine Bedingung', 'Ereignis B: deine Bedingung'),
    run(rec, E) {
      let nA = 0, nB = 0, nAB = 0, a = 0, b = 0; const seen = []; const st = () => ({ nA, nB, nAB, a, b, seen: seen.slice() });
      rec.step('defA', 'Ereignis A: \\(' + E.eA.replace(/%/g, '\\bmod ').replace(/&&/g, '\\land ').replace(/\|\|/g, '\\lor ') + '\\)', st());
      rec.step('defB', 'Ereignis B: \\(' + E.eB.replace(/%/g, '\\bmod ').replace(/&&/g, '\\land ').replace(/\|\|/g, '\\lor ') + '\\)', st());
      rec.step('init', 'Drei Zähler auf 0.', st());
      for (a = 1; a <= 6; a++) {
        rec.step('la', 'Erster Würfel \\(\\Idx{a}=' + a + '\\).', st());
        for (b = 1; b <= 6; b++) {
          rec.step('lb', 'Paar (' + a + ',' + b + ').', st());
          const x = !!E.A(a, b), y = !!E.B(a, b);
          if (x) nA++; rec.step('cA', x ? 'in A → \\(|\\mA|=' + nA + '\\)' : 'nicht in A', st());
          if (y) nB++; rec.step('cB', y ? 'in B → \\(|\\mB|=' + nB + '\\)' : 'nicht in B', st());
          if (x && y) nAB++; seen.push([a, b, x, y]);
          rec.step('cAB', x && y ? 'in A und B → \\(|\\mA\\capc\\mB|=' + nAB + '\\)' : 'nicht in beiden', st());
        }
      }
      a = 0; b = 0;
      const pA = nA / 36, pB = nB / 36, pAB = nAB / 36;
      rec.step('p', '\\(\\PP(\\mA)=\\tfrac{' + nA + '}{36},\\ \\PP(\\mB)=\\tfrac{' + nB + '}{36},\\ \\PP(\\mA\\capc\\mB)=\\tfrac{' + nAB + '}{36}\\)', st());
      const u = Math.abs(pAB - pA * pB) < 1e-12;
      rec.step('test', '\\(\\PP(\\mA)\\PP(\\mB)=' + LB.fmt(pA * pB, 4) + '\\) vs. \\(\\PP(\\mA\\capc\\mB)=' + LB.fmt(pAB, 4) + '\\): ' + (u ? '<b class="ok">gleich → unabhängig</b>' : '<b class="bad">verschieden → abhängig</b>'), st());
      rec.step('out', 'Ausgabe: ' + LB.fmt(pAB, 6) + ' vs ' + LB.fmt(pA * pB, 6) + (u ? ' unabhängig' : ' abhängig'), st());
    },
    view: s => {
      const map = {}; s.seen.forEach(x => map[x[0] + ',' + x[1]] = x);
      return diceGrid((a, b) => { const x = map[a + ',' + b]; const cur = a === s.a && b === s.b ? ' o' : '';
        if (!x) return ['out' + cur, '·']; return [(x[2] && x[3] ? 'ab' : x[2] ? 'aa' : x[3] ? 'bb' : '') + cur, x[2] && x[3] ? 'AB' : x[2] ? 'A' : x[3] ? 'B' : '–']; }) +
        LB.kvHTML([['|A|', s.nA, 'mem'], ['|B|', s.nB, 'par'], ['|A∩B|', s.nAB, 'res'], ['Paar', s.a ? '(' + s.a + ',' + s.b + ')' : '–', 'idx']]);
    }
  });

  /* ---- bedingte W'keit */
  new LB.Tracer({
    id: 'trBed', title: 'P(A|B): nur im neuen Grundraum B zählen', langs: CODE('k1_bedingt'),
    vars: [['A', 'cond', 'Ereignis, dessen W\'keit gesucht ist'], ['B', 'cond', 'Bedingung: was man schon weiß; wird der neue Grundraum'], ['a|b', 'idx', 'Augenzahlen, zusammen alle 36 Paare'],
      ['nB', 'par', 'zählt Paare in B → Größe des geschrumpften Grundraums'], ['nAB', 'res', 'zählt Paare in B, die auch in A liegen'], ['P', 'res', 'P(A | B) = nAB / nB']],
    together: 'Paare außerhalb von <span class="kw-cond">B</span> werden übersprungen (next/continue): sie sind durch die Information „B ist eingetreten“ ausgeschlossen. Im Rest zählt <span class="kw-par">nB</span> alle, <span class="kw-res">nAB</span> nur die günstigen. Die bedingte W\'keit ist der Anteil im neuen, kleineren Grundraum.',
    say: s => s.nB ? 'Weiß man, dass B eingetreten ist, bleiben ' + s.nB + ' gleich wahrscheinliche Paare übrig; davon liegen ' + s.nAB + ' in A. Unter dieser Information tritt A mit Wahrscheinlichkeit ' + s.nAB + '/' + s.nB + ' ≈ ' + LB.fmt(s.nAB / s.nB, 3) + ' ein. Achtung: P(B | A) ist im Allgemeinen eine andere Zahl.' : 'B kann nie eintreten, P(A | B) ist nicht definiert.',
   
    input: 'A: a+b>=10 ; B: a==6', speed: 250,
    examples: [['Summe ≥ 10 gegeben a = 6', 'A: a+b>=10 ; B: a==6'], ['Pasch gegeben Summe gerade', 'A: a==b ; B: (a+b)%2==0'], ['a = 6 gegeben Summe ≥ 10 (umgedreht!)', 'A: a==6 ; B: a+b>=10']],
    parse: s => parseAB(s),
    codeFor: (inp, lang, lines) => codeAB(inp, lang, lines, 'deine Bedingung', 'Bedingung B: deine Bedingung'),
    run(rec, E) {
      let nB = 0, nAB = 0, a = 0, b = 0; const seen = []; const st = () => ({ nB, nAB, a, b, seen: seen.slice() });
      rec.step('defA', 'Ereignis A festgelegt.', st());
      rec.step('defB', 'Bedingung B festgelegt: sie wird der neue Grundraum.', st());
      rec.step('init', '\\(|\\mB|=0,\\ |\\mA\\capc\\mB|=0\\).', st());
      for (a = 1; a <= 6; a++) {
        rec.step('la', 'Erster Würfel \\(\\Idx{a}=' + a + '\\).', st());
        for (b = 1; b <= 6; b++) {
          rec.step('lb', 'Paar (' + a + ',' + b + ').', st());
          const y = !!E.B(a, b);
          if (!y) { seen.push([a, b, false, false]); rec.step('skip', '(' + a + ',' + b + ') liegt nicht in B → übersprungen.', st()); continue; }
          nB++; rec.step('nB', 'in B: neuer Grundraum hat jetzt ' + nB + ' Elemente.', st());
          const x = !!E.A(a, b); if (x) nAB++; seen.push([a, b, true, x]);
          rec.step('nAB', x ? 'auch in A → \\(|\\mA\\capc\\mB|=' + nAB + '\\)' : 'nicht in A.', st());
        }
      }
      a = 0; b = 0;
      if (nB === 0) { rec.step('P', '\\(|\\mB|=0\\): bedingte W\'keit nicht definiert (Division durch 0).', st()); return; }
      rec.step('P', '\\(\\Res{\\PP(\\mA\\given\\mB)}=\\tfrac{' + nAB + '}{' + nB + '}=\\Res{' + LB.fmt(nAB / nB, 4) + '}\\)', st());
      rec.step('out', 'Ausgabe: P(A|B) = ' + nAB + '/' + nB + ' = ' + LB.fmt(nAB / nB, 6), st());
    },
    view: s => {
      const map = {}; s.seen.forEach(x => map[x[0] + ',' + x[1]] = x);
      return diceGrid((a, b) => { const x = map[a + ',' + b]; const cur = a === s.a && b === s.b ? ' o' : '';
        if (!x) return ['out' + cur, '·']; if (!x[2]) return ['gone' + cur, '✕']; return [(x[3] ? 'm' : 'bb') + cur, x[3] ? 'A' : 'B']; }) +
        LB.kvHTML([['|B| (neues Ω)', s.nB, 'par'], ['|A∩B|', s.nAB, 'res'], ['P(A|B) bisher', s.nB ? LB.fmt(s.nAB / s.nB, 3) : '–', 'res']]);
    }
  });

  /* ---- Bayes */
  new LB.Tracer({
    id: 'trBayes', title: 'totale W\'keit und Bayes', langs: CODE('k1_bayes'),
    vars: [['prior', 'par', 'P(Bᵢ): wie häufig jede Ursache vorab ist (Summe 1)'], ['like', 'par', 'P(A | Bᵢ): wie wahrscheinlich die Beobachtung A unter Ursache i ist'], ['k', 'par', 'Anzahl der Ursachen'],
      ['i', 'idx', 'aktueller Ast des Baums'], ['pfad', 'chg', 'Pfad-W\'keit P(A ∩ Bᵢ) = like · prior'], ['PA', 'res', 'P(A): Summe aller Pfade (totale Wahrscheinlichkeit)'], ['post', 'res', 'P(Bᵢ | A) = pfad / PA (Bayes)']],
    together: 'Erste Schleife: jeden Ast entlang multiplizieren (<span class="kw-chg">pfad</span> = <span class="kw-par">like</span> · <span class="kw-par">prior</span>) und alle Pfade in <span class="kw-res">PA</span> aufsummieren. Zweite Schleife: jeden Pfad durch PA teilen; das dreht die Bedingung um (<span class="kw-res">post</span>). Die Posteriori summieren sich zu 1.',
    say: s => { let j = 0; s.po.forEach((v, k) => { if (v > s.po[j]) j = k; });
      return 'Die Beobachtung A tritt insgesamt mit P(A) = ' + LB.fmt(s.PA, 4) + ' ein. Wurde A beobachtet, ist Ursache B' + (j + 1) + ' am wahrscheinlichsten (P = ' + LB.fmt(s.po[j], 3) + '), vorab hatte sie nur ' + s.pr[j] + '. Die Beobachtung verschiebt das Gewicht zu den Ursachen, unter denen A häufig ist.'; },
   
    input: '0.5 0.3 0.2 ; 0.01 0.02 0.03', hint: 'P(B_i) ; P(A|B_i)',
    examples: [['drei Maschinen', '0.5 0.3 0.2 ; 0.01 0.02 0.03'], ['Haarriss-Detektor', '0.001 0.999 ; 0.99 0.03'], ['Krankheitstest', '0.01 0.99 ; 0.99 0.05'], ['Straße nass', '0.2 0.8 ; 0.01 0.001']],
    parse: s => { const [a, b] = s.split(';'); if (b === undefined) throw new Error('Format: Vorab-W\'keiten ; Likelihoods');
      const pr = LB.S.parse(a), li = LB.S.parse(b);
      if (pr.length < 2 || pr.length !== li.length) throw new Error('gleich viele (mindestens 2) Werte links und rechts');
      if (Math.abs(LB.S.sum(pr) - 1) > 1e-6) throw new Error('die Vorab-W\'keiten müssen Summe 1 haben (Partition), jetzt ' + LB.fmt(LB.S.sum(pr), 4));
      if (pr.concat(li).some(x => x < 0 || x > 1)) throw new Error('alle Werte zwischen 0 und 1');
      return { pr, li }; },
    codeFor: (inp, lang, lines) => lines.map(l => {
      if (/#@prior\s*$/.test(l)) return (lang === 'R' ? 'prior <- c(' + inp.pr.join(', ') + ')' : 'prior = np.array([' + inp.pr.join(', ') + '])') + '   # P(B_i) #@prior';
      if (/#@like\s*$/.test(l)) return (lang === 'R' ? 'like <- c(' + inp.li.join(', ') + ')' : 'like = np.array([' + inp.li.join(', ') + '])') + '   # P(A | B_i) #@like';
      return l; }),
    run(rec, d) {
      const k = d.pr.length, pf = new Array(k).fill(null), po = new Array(k).fill(null); let PA = 0, i = -1;
      const st = () => ({ pr: d.pr, li: d.li, pf: pf.slice(), po: po.slice(), PA, i });
      rec.step('prior', 'Vorab-W\'keiten \\(\\PP(\\Mem{B_i})\\) der ' + k + ' Ursachen (Summe 1).', st());
      rec.step('like', 'Likelihoods \\(\\PP(\\mA\\given\\Mem{B_i})\\).', st());
      rec.step('k', '\\(\\Par{k}=' + k + '\\) Fälle.', st());
      rec.step('pfad0', 'Platz für die Pfad-W\'keiten.', st());
      rec.step('PA0', '\\(\\PP(\\mA)=0\\) zum Aufsummieren.', st());
      for (i = 0; i < k; i++) {
        rec.step('l1', 'Ast \\(\\Idx{i}=' + (i + 1) + '\\).', st());
        pf[i] = d.li[i] * d.pr[i];
        rec.step('mul', '\\(\\PP(\\mA\\capc\\Mem{B_{' + (i + 1) + '}})=' + d.li[i] + '\\cdot' + d.pr[i] + '=' + LB.fmt(pf[i], 6) + '\\)', st());
        PA += pf[i];
        rec.step('sum', '\\(\\PP(\\mA)\\) bisher \\(=' + LB.fmt(PA, 6) + '\\)', st());
      }
      for (i = 0; i < k; i++) {
        rec.step('l2', 'Umdrehen für Ursache \\(\\Idx{i}=' + (i + 1) + '\\).', st());
        po[i] = PA > 0 ? pf[i] / PA : NaN;
        rec.step('post', '\\(\\Res{\\PP(\\Mem{B_{' + (i + 1) + '}}\\given\\mA)}=\\tfrac{' + LB.fmt(pf[i], 6) + '}{' + LB.fmt(PA, 6) + '}=\\Res{' + LB.fmt(po[i], 4) + '}\\)', st());
        rec.step('out', 'Ausgabe für \\(B_{' + (i + 1) + '}\\).', st());
      }
      i = -1;
      rec.step('out', 'Fertig. Summe aller Posteriori = ' + LB.fmt(LB.S.sum(po), 4) + ' ✓', st());
    },
    view: s => '<table class="tbl"><tr><th>i</th><th class="r">P(Bᵢ)</th><th class="r">P(A|Bᵢ)</th><th class="r">pfad = P(A∩Bᵢ)</th><th class="r">P(Bᵢ|A)</th></tr>' +
      s.pr.map((p, k) => '<tr' + (k === s.i ? ' style="outline:1px solid var(--chg)"' : '') + '><td class="kw-idx">' + (k + 1) + '</td><td class="r kw-par">' + p + '</td><td class="r kw-par">' + s.li[k] + '</td><td class="r kw-chg">' + (s.pf[k] === null ? '·' : LB.fmt(s.pf[k], 6)) + '</td><td class="r kw-res">' + (s.po[k] === null ? '·' : LB.fmt(s.po[k], 4)) + '</td></tr>').join('') +
      '</table>' + LB.kvHTML([['PA = P(A) bisher', LB.fmt(s.PA, 6), 'res']])
  });
});

/* ---------------------------------------------------------------- Training */
LB.on(function training() {
  if (!document.getElementById('qbTask')) return;
  let rnd = LB.S.rng(Date.now() % 100000), cur = null;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const newB = () => {
    const pr = pick([0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3]), se = pick([0.8, 0.9, 0.95, 0.98, 0.99]), fa = pick([0.01, 0.02, 0.05, 0.1, 0.2]);
    cur = { pr, se, fa, ans: se * pr / (se * pr + fa * (1 - pr)) };
    const t = document.getElementById('qbTask');
    t.innerHTML = 'Ein Merkmal hat die Basisrate \\(\\PP(\\Mem{B_1})=\\Par{' + pr + '}\\). Ein Test erkennt es mit \\(\\PP(\\mA\\given\\Mem{B_1})=\\Par{' + se + '}\\) und schlägt ohne Merkmal mit \\(\\PP(\\mA\\given\\Mem{B_2})=\\Par{' + fa + '}\\) fälschlich an. Wie groß ist \\(\\PP(\\Mem{B_1}\\given\\mA)\\)? (4 Nachkommastellen)';
    LB.tex(t); document.getElementById('qbRes').innerHTML = ''; document.getElementById('qbIn').value = '';
  };
  document.getElementById('qbNew').addEventListener('click', newB);
  document.getElementById('qbChk').addEventListener('click', () => {
    const v = parseFloat(document.getElementById('qbIn').value.replace(',', '.')), c = cur, o = document.getElementById('qbRes');
    const z = c.se * c.pr, n = z + c.fa * (1 - c.pr);
    o.innerHTML = (Math.abs(v - c.ans) < 6e-4 ? '<b class="ok">✔ richtig.</b> ' : '<b class="bad">✗ noch nicht.</b> ') +
      'Lösung: \\(\\dfrac{' + c.se + '\\cdot' + c.pr + '}{' + c.se + '\\cdot' + c.pr + '+' + c.fa + '\\cdot' + LB.fmt(1 - c.pr, 3) + '}=\\dfrac{' + LB.fmt(z, 6) + '}{' + LB.fmt(n, 6) + '}=\\Res{' + LB.fmt(c.ans, 4) + '}\\)';
    LB.tex(o);
  });
  newB();

  const events = [
    ['Augensumme gleich s', s => (a, b) => a + b === s, () => 2 + Math.floor(rnd() * 11)],
    ['Augensumme mindestens s', s => (a, b) => a + b >= s, () => 3 + Math.floor(rnd() * 10)],
    ['mindestens eine Augenzahl s', s => (a, b) => a === s || b === s, () => 1 + Math.floor(rnd() * 6)],
    ['Pasch (beide gleich)', () => (a, b) => a === b, () => 0],
    ['Produkt der Augen gerade', () => (a, b) => (a * b) % 2 === 0, () => 0],
    ['Betrag der Differenz gleich s', s => (a, b) => Math.abs(a - b) === s, () => Math.floor(rnd() * 6)]
  ];
  let curL = null;
  const gcd = (x, y) => y ? gcd(y, x % y) : x;
  const newL = () => {
    const e = pick(events), s = e[2](), f = e[1](s); let g = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (f(a, b)) g++;
    curL = { g, txt: e[0].replace(' s', ' ' + s) };
    document.getElementById('qlTask').innerHTML = 'Zwei faire Würfel. Wie groß ist die W\'keit für: <b>' + curL.txt + '</b>? (Bruch oder Dezimalzahl)';
    document.getElementById('qlRes').innerHTML = ''; document.getElementById('qlIn').value = '';
  };
  document.getElementById('qlNew').addEventListener('click', newL);
  document.getElementById('qlChk').addEventListener('click', () => {
    const raw = document.getElementById('qlIn').value.replace(',', '.').trim(); let v;
    if (raw.includes('/')) { const [x, y] = raw.split('/').map(Number); v = x / y; } else v = parseFloat(raw);
    const ans = curL.g / 36, d = gcd(curL.g, 36), o = document.getElementById('qlRes');
    o.innerHTML = (Math.abs(v - ans) < 6e-4 ? '<b class="ok">✔ richtig.</b> ' : '<b class="bad">✗ noch nicht.</b> ') + 'Lösung: ' + curL.g + ' günstige von 36 Paaren → \\(\\Res{\\tfrac{' + curL.g / d + '}{' + 36 / d + '}\\approx' + LB.fmt(ans, 4) + '}\\)';
    LB.tex(o);
  });
  newL();
});
