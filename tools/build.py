#!/usr/bin/env python3
"""Baut die Lernbegleiter-Dateien aus Kapitel-Fragmenten.

Aufruf:  python3 tools/build.py [kapitelnummern ...]      (ohne Argument: alle vorhandenen)

Jedes Kapitel liegt in tools/kap/kNN.html (Körper) und optional tools/kap/kNN.js / kNN.css.
Die Körper benutzen kleine Baustein-Tags (x-vn, x-anat, x-pt, …), die hier zu HTML werden.
Ausgabe: Lernbegleiter/NN_Name.html, jede Datei läuft für sich allein.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = os.path.join(ROOT, 'tools')
OUT = os.path.join(ROOT, 'Lernbegleiter')

# Teile: (Nummer, Dateiname, Kurztitel für Menü/Teilwechsel, Plotly nötig?)
PARTS = [
    (1, '01_Grundlagen_Wahrscheinlichkeit', 'Kap. 1 · Grundlagen W-Rechnung'),
    (2, '02_Verteilungen', 'Kap. 2 · Verteilungen'),
    (3, '03_Deskriptive_Statistik', 'Kap. 3 · Deskriptive Statistik'),
    (4, '04_Mehrdimensionale_Verteilungen', 'Kap. 4 · Mehrdimensional'),
    (5, '05_Grenzwertsaetze', 'Kap. 5 · Grenzwertsätze'),
    (6, '06_Parameterschaetzung', 'Kap. 6 · Parameterschätzung'),
    (7, '07_Tests_und_Vertrauensintervalle', 'Kap. 7 · Tests & VI'),
    (8, '08_Zwei_Stichproben', 'Kap. 8 · Zwei Stichproben'),
    (9, '09_Rechner', '🧰 Statistik-Rechner'),
]

SRC = {
    'G': '<span class="src g" title="Inhalt aus der Grundlage (Lernbegleiter-HTML / Skript L. Meier)">📘 Grundlage</span>',
    'N': '<span class="src n" title="neu ergänzt">✚ Neu</span>',
    'GN': '<span class="src g" title="Grundlage, hier vertieft und erweitert">📘 Grundlage ✚ erweitert</span>',
}


def attrs(s):
    """Attribute eines Tags als dict (Werte in "…")."""
    return {k: html.unescape(v) for k, v in re.findall(r'([\w-]+)="(.*?)"', s, re.S)}


def aesc(s):
    return html.escape(s, quote=True)


def srcbadge(a, default='N'):
    k = a.get('src', default)
    return SRC.get(k, ''), (' is-g' if 'G' in k else '')


def number_steps(body):
    """<x-step h="…">…</x-step> → nummerierte Schritte ①②③ (Zähler je Block)."""
    n = [0]

    def rep(m):
        n[0] += 1
        a = attrs(m.group(1))
        head = '<b class="h">' + a['h'] + '</b> ' if a.get('h') else ''
        return ('<div class="vn-step"><span class="vnn">%d</span><div>%s%s</div></div>' % (n[0], head, m.group(2)))
    return re.sub(r'<x-step((?:\s[^>]*)?)>(.*?)</x-step>', rep, body, flags=re.S)


def common(body):
    body = re.sub(r'<x-res>(.*?)</x-res>', r'<div class="vn-res">✔ \1</div>', body, flags=re.S)
    body = re.sub(r'<x-trap>(.*?)</x-trap>', r'<div class="trap"><b>⚠ Typische Falle.</b> \1</div>', body, flags=re.S)
    return body


def x_vn(m):
    a = attrs(m.group(1)); body = m.group(2)
    badge, g = srcbadge(a)
    task = re.search(r'<x-task>(.*?)</x-task>', body, re.S)
    rest = re.sub(r'<x-task>.*?</x-task>', '', body, count=1, flags=re.S)
    rest = common(number_steps(rest))
    kind = a.get('kind', 'vn')
    if kind == 'bl':
        cls, lab, sm = 'vonnull blsol', a.get('badge', 'Übung'), 'Lösung Schritt für Schritt'
    else:
        cls, lab, sm = 'vonnull', 'Von null · Abschnitt ' + a['sec'], 'Lösung von null, Schritt für Schritt'
    return ('<div class="%s%s" id="%s" data-sec="%s">%s<div class="vn-ttl"><span class="vn-badge">%s</span>%s</div>'
            '<div class="vn-task"><b>Prüfungsaufgabe (für sich allein lösbar).</b> %s</div>'
            '<details><summary>%s</summary>%s</details></div>'
            % (cls, g, a['id'], a.get('sec', ''), badge, lab, a['q'], task.group(1) if task else '', sm, rest))


def x_sol(m):
    a = attrs(m.group(1))
    return '<details class="sol"><summary>%s</summary>%s</details>' % (a.get('s', 'Lösung Schritt für Schritt'), common(number_steps(m.group(2))))


def x_anat(m):
    a = attrs(m.group(1)); body = m.group(2)
    badge, g = srcbadge(a)
    rows = re.findall(r'<x-a\s+s="(.*?)"\s*>(.*?)</x-a>', body, re.S)
    read = re.search(r'<x-read>(.*?)</x-read>', body, re.S)
    why = re.search(r'<x-why>(.*?)</x-why>', body, re.S)
    extra = re.sub(r'<x-a\s.*?</x-a>|<x-read>.*?</x-read>|<x-why>.*?</x-why>', '', body, flags=re.S).strip()
    out = '<div class="card anat-card has-src%s">%s<b>🔬 Anatomie: %s</b>' % (g, badge, a['t'])
    if a.get('f'):
        out += '<div class="anat-f">\\[ %s \\]</div>' % a['f']
    if extra:
        out += extra
    out += '<div class="anat">' + ''.join(
        '<div><span class="sym">\\(%s\\)</span><span>%s</span></div>' % (html.unescape(s), t) for s, t in rows) + '</div>'
    if why:
        out += '<div class="why">🧠 <b>Warum so?</b> %s</div>' % why.group(1)
    if read:
        out += '<div class="read">📖 <b>Vorlesen:</b> %s</div>' % read.group(1)
    return out + '</div>'


def x_pt(m):
    body = m.group(1)
    g = lambda t: (re.search(r'<x-%s>(.*?)</x-%s>' % (t, t), body, re.S) or [None, ''])[1]
    return ('<div class="pt is-g">%s<div class="ptq"><b>🎓 Prüfungs-Trainer.</b> %s</div>'
            '<div class="pt-grid"><div><i>🗝️ ERKENNEN</i>%s</div><div><i>⚙️ LÖSEN</i>%s</div><div><i>🗣️ SAGEN</i>%s</div></div></div>'
            % (SRC['G'], g('q'), g('e'), g('l'), g('s')))


def x_card(m):
    a = attrs(m.group(1)); badge, g = srcbadge(a)
    cls = a.get('cls', '')
    return '<div class="card has-src %s%s"%s>%s<b>%s</b>%s</div>' % (
        cls, g, (' id="%s"' % a['id']) if a.get('id') else '', badge, a.get('t', ''), m.group(2))


def x_viz(m):
    a = attrs(m.group(1)); badge, g = srcbadge(a)
    return '<div class="viz has-src%s"%s>%s<b>👁️ Woran erkennbar? %s</b>%s</div>' % (
        g, (' id="%s"' % a['id']) if a.get('id') else '', badge, a.get('t', ''), m.group(2))


def x_idea(m):
    a = attrs(m.group(1)); badge, g = srcbadge(a)
    return '<div class="idea has-src%s" style="position:relative">%s<b>🔑 Idee.</b> %s</div>' % (g, badge, m.group(2))


def x_g(m):
    return '<div class="gblk is-g"><div>%s</div></div>' % m.group(1)


def x_ex(m):
    a = attrs(m.group(1)); body = common(number_steps(m.group(2)))
    lv = a.get('l', '1'); name = {'1': 'leicht', '2': 'mittel', '3': 'schwer'}[lv]
    body = re.sub(r'<x-v>(.*?)</x-v>', r'<div class="verdict"><b>Verdict:</b> \1</div>', body, flags=re.S)
    src = a.get('src', 'N')
    tag = '<span class="srcin%s">%s</span>' % ('' if 'G' in src else ' n', '📘 Grundlage' if 'G' in src else '✚ Neu')
    return '<div class="ex%s"><div class="lvl l%s">Beispiel %s · %s %s</div><b>%s</b>%s</div>' % (
        ' is-g' if 'G' in src else '', lv, lv, name, tag, a.get('t', ''), body)


def code_lines(name, ext):
    p = os.path.join(T, 'code', name + '.' + ext)
    return read(p).rstrip('\n').split('\n') if os.path.exists(p) else []


def strip_mark(l):
    return re.sub(r'\s*#@[\w-]+\s*$', '', l)


def code_block(lines, lang, title, note):
    rows = ''.join('<div class="row" data-src="%s"><span class="ln">%d</span>%s</div>' % (aesc(strip_mark(l)), i + 1, html.escape(strip_mark(l)))
                   for i, l in enumerate(lines))
    return ('<div class="code" data-lang="%s"><div class="ch"><b>%s</b><span>%s</span></div><pre>%s</pre></div>'
            % (lang, title, note, rows))


def x_code(m):
    a = attrs(m.group(1)); code = m.group(2).strip('\n')
    lang = a.get('lang', 'R')
    return code_block(code.split('\n'), lang, a.get('t', lang), a.get('note', ''))


def x_code2(m):
    """R und Python nebeneinander (Dateien tools/code/NAME.R und NAME.py)."""
    name = m.group(1); a = attrs(m.group(2)); t = a.get('t', '')
    r, py = code_lines(name, 'R'), code_lines(name, 'py')
    if not r and not py:
        raise SystemExit('Code fehlt: ' + name)
    return ('<div class="two code2">%s%s</div>' % (
        code_block(r, 'R', 'R · ' + t, 'Basis-R, vollständig lauffähig') if r else '',
        code_block(py, 'Python', 'Python · ' + t, 'numpy / scipy / matplotlib, vollständig lauffähig') if py else ''))


def vid_title(f):
    base = f.split('/')[-1]
    base = re.sub(r'\s*\[[^\]]+\]\.mp4$', '', base)
    return base.replace('：', ':').replace('＂', '"')


def x_vid(m):
    a = attrs(m.group(1)); f = a['f']
    folder = f.split('/')[0] if '/' in f else 'Hauptordner'
    note = a.get('n', '')
    return ('<span class="vid" data-f="%s"><span class="vt">🎬 %s</span>%s<span class="vs2">%s</span>'
            '<a class="vopen" href="videos/%s" target="_blank" rel="noopener">▶ öffnen</a><button class="vcopy" type="button">📋 Pfad</button></span>'
            % (aesc(f), html.escape(vid_title(f)), (' <span class="muted small">' + note + '</span>') if note else '',
               html.escape(folder), aesc(f)))


def x_vids(m):
    return '<div class="vids"><span class="muted small" style="align-self:center">Passende Videos (lokal):</span>%s</div>' % m.group(1)


COURSE = [('1', 'Grundlagen', 'Ω, P, Bayes'), ('2', 'Verteilungen', 'X, E, Var'), ('3', 'Deskriptiv', 'x̄, s, Quantile'),
          ('4', 'Mehrdim.', 'Cov, Corr'), ('5', 'Grenzwerte', 'GGZ, ZGS'), ('6', 'Schätzen', 'MoM, ML, SE'),
          ('7', 'Tests & VI', 'H₀, p, VI'), ('8', 'Zwei Stichpr.', 'gepaart, t')]


_CC = [0]


def x_course(m):
    cur = attrs(m.group(1)).get('cur', '1')
    _CC[0] += 1
    mid = 'arrC%d' % _CC[0]
    w, gap = 190, 14
    out = '<svg viewBox="0 0 %d 128" role="img" aria-label="Brücke durch Statistik I">' % (8 * w + 7 * gap + 20)
    out += '<defs><marker id="%s" ' % mid + 'viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#8b949e"/></marker></defs>'
    for i, (n, t, d) in enumerate(COURSE):
        x = 10 + i * (w + gap)
        on = n == cur
        out += ('<rect x="%d" y="40" width="%d" height="66" rx="11" fill="#1c2129" stroke="%s" stroke-width="%s"/>'
                '<text x="%d" y="66" fill="#e6edf3" font-size="17" font-weight="700" text-anchor="middle">Kap. %s · %s</text>'
                '<text x="%d" y="90" fill="#8b949e" font-size="14" text-anchor="middle">%s</text>'
                % (x, w, '#bc8cff' if on else '#30363d', '3' if on else '1.2', x + w / 2, n, t, x + w / 2, d))
        if i < 7:
            out += '<line x1="%d" y1="73" x2="%d" y2="73" stroke="#8b949e" stroke-width="1.6" marker-end="url(#%s)"/>' % (x + w, x + w + gap - 1, mid)
        if on:
            out += '<text x="%d" y="28" fill="#bc8cff" font-size="16" font-weight="700" text-anchor="middle">▼ DU BIST HIER</text>' % (x + w / 2)
    return '<div class="bridge">' + out + '</svg></div>'


def expand(body):
    body = re.sub(r'<x-vn((?:\s[^>]*)?)>(.*?)</x-vn>', x_vn, body, flags=re.S)
    body = re.sub(r'<x-sol((?:\s[^>]*)?)>(.*?)</x-sol>', x_sol, body, flags=re.S)
    body = re.sub(r'<x-anat((?:\s[^>]*)?)>(.*?)</x-anat>', x_anat, body, flags=re.S)
    body = re.sub(r'<x-pt>(.*?)</x-pt>', x_pt, body, flags=re.S)
    body = re.sub(r'<x-ex((?:\s[^>]*)?)>(.*?)</x-ex>', x_ex, body, flags=re.S)
    body = re.sub(r'<x-ex3>(.*?)</x-ex3>', r'<div class="ex3">\1</div>', body, flags=re.S)
    body = re.sub(r'<x-card((?:\s[^>]*)?)>(.*?)</x-card>', x_card, body, flags=re.S)
    body = re.sub(r'<x-viz((?:\s[^>]*)?)>(.*?)</x-viz>', x_viz, body, flags=re.S)
    body = re.sub(r'<x-idea((?:\s[^>]*)?)>(.*?)</x-idea>', x_idea, body, flags=re.S)
    body = re.sub(r'<x-g>(.*?)</x-g>', x_g, body, flags=re.S)
    body = re.sub(r'<x-code2 f="([\w-]+)"((?:\s[^>]*?)?)/>', x_code2, body)
    body = re.sub(r'<x-code((?:\s[^>]*)?)>(.*?)</x-code>', x_code, body, flags=re.S)
    body = re.sub(r'<x-vid((?:\s[^>]*?)?)/>', x_vid, body, flags=re.S)
    body = re.sub(r'<x-vids>(.*?)</x-vids>', x_vids, body, flags=re.S)
    body = re.sub(r'<x-course((?:\s[^>]*?)?)/>', x_course, body)
    body = common(number_steps(body))
    bad = re.findall(r'\\text\{[^}]*[%§][^}]*\}', body)
    if bad:
        raise SystemExit('Verbotene Zeichen in \\text{}: %s' % bad[:3])
    left = re.findall(r'<x-[a-z0-9]+', body)
    if left:
        raise SystemExit('Nicht expandierte Tags: %s' % sorted(set(left)))
    return body


def menu(body, num):
    """Menü aus <section id data-m="Titel|Einzeiler"> und <h3/h4 id data-m> in Lesereihenfolge."""
    groups, quick = [], []
    for m in re.finditer(r'<(section|h3|h4|div)\s[^>]*?id="([^"]+)"[^>]*?data-m="([^"]+)"', body):
        tag, id_, dm = m.groups()
        t, _, d = html.unescape(dm).partition('|')
        if tag == 'section':
            groups.append((t, [(id_, t, d, False)]))
            quick.append((id_, t, d))
        elif groups:
            groups[-1][1].append((id_, t, d, True))
    grid = ''
    for t, items in groups:
        grid += '<div><h5>%s</h5>' % html.escape(t)
        for id_, tt, d, sub in items:
            grid += '<a href="#%s"%s><b>%s</b><span>%s</span></a>' % (id_, ' class="sub"' if sub else '', html.escape(tt), html.escape(d))
        grid += '</div>'
    ql = ''.join('<a href="#%s">%s<small>%s</small></a>' % (i, html.escape(t), html.escape(d.split(',')[0][:34])) for i, t, d in quick)
    parts = ''.join('<a href="%s.html" data-part="%d"%s>%s</a>' % (f, k, ' class="cur"' if n == num else '', html.escape(tt))
                    for k, (n, f, tt) in enumerate(PARTS))
    return grid, ql, parts


def read(p, default=''):
    return open(p, encoding='utf-8').read() if os.path.exists(p) else default


def build(num):
    n, fname, short = PARTS[num - 1]
    body = read(os.path.join(T, 'kap', 'k%02d.html' % num))
    if not body:
        return None
    meta = dict(re.findall(r'<!--\s*(\w+):\s*(.*?)\s*-->', body.split('\n', 20)[0] + '\n'.join(body.split('\n')[:12])))
    title = meta.get('title', short)
    sub = meta.get('sub', '')
    body = expand(body)
    grid, ql, parts = menu(body, num)
    css = read(os.path.join(T, 'base.css')) + '\n' + read(os.path.join(T, 'kap', 'k%02d.css' % num))
    js = read(os.path.join(T, 'engine.js'))
    kjs = read(os.path.join(T, 'kap', 'k%02d.js' % num))
    kjs = re.sub(r"CODE\('([\w-]+)'\)", lambda m: json.dumps({'R': code_lines(m.group(1), 'R'), 'Python': code_lines(m.group(1), 'py')}, ensure_ascii=False), kjs)
    plotly = '<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>\n' if ('Plotly' in kjs or 'LB.plot(' in kjs) else ''
    page = f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)} · Lernbegleiter Statistik I</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Crimson+Pro:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>
{plotly}<style>
{css}
</style>
</head>
<body>
<header class="lbtop">
  <button class="lbburger" id="lbOpen" aria-label="Inhalt öffnen">☰ Inhalt</button>
  <div class="lbt"><b>{html.escape(title)}</b><span>{html.escape(sub)}</span></div>
  <nav class="lbq">{ql}</nav>
</header>
<div class="lbmenu" id="lbMenu"><div class="lbm-in">
  <div class="lbm-head"><b>☰ Inhalt · {html.escape(title)}</b><button class="lbburger sp" data-close>✕ schließen</button></div>
  <div class="lbm-parts"><span class="muted">Teil wechseln:</span>{parts}</div>
  <div class="lbm-grid">{grid}</div>
  <div class="lbm-opts">
    <label><input type="checkbox" id="lbHlG"> 📘 Grundlage-Inhalte hervorheben</label>
    <label>🎬 Video-Ordner <input type="text" id="lbVbase" value="videos/" title="relativ zur HTML-Datei (z. B. Symlink „videos") oder absolut, z. B. /home/NAME/Videos/Statistik/"></label>
    <span>Esc schließt · T = Teile</span>
  </div>
</div></div>
<button class="lbfab" id="lbFab" aria-label="Inhalt öffnen">☰</button>
<main class="wrap">
{body}
<footer class="foot">Lernbegleiter Statistik I · {html.escape(title)} · 📘 Grundlage = Inhalt aus dem bisherigen Lernbegleiter (Skript L. Meier, ETH) · ✚ Neu = ergänzt · alle Zahlen per Skript nachgerechnet.</footer>
</main>
<script>
{js}
</script>
<script>
{kjs}
</script>
</body>
</html>
'''
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, fname + '.html')
    open(path, 'w', encoding='utf-8').write(page)
    return path


if __name__ == '__main__':
    nums = [int(x) for x in sys.argv[1:]] or [p[0] for p in PARTS]
    for k in nums:
        p = build(k)
        if p:
            print('gebaut:', os.path.relpath(p, ROOT), '%.0f KB' % (os.path.getsize(p) / 1024))
