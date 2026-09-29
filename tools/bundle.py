#!/usr/bin/env python3
"""Gesamtdatei Lernbegleiter/00_Alle_Teile.html.

Jeder Teil (01…09) wird unverändert gzip-komprimiert und base64-kodiert eingebettet.
Die Hülle entpackt einen Teil erst beim Öffnen (DecompressionStream) und zeigt ihn in
einem eigenen iframe (blob:-URL). Jeder Teil läuft dadurch genau so isoliert wie als
Einzeldatei: eigene Skripte, eigener Zustand, eigenes Menü.

Nachrichten (postMessage) zwischen Teil und Hülle:
  Teil → Hülle: {lb:'ready'} · {lb:'part', i} · {lb:'overview'} · {lb:'open', f} · {lb:'vbase', v}
  Hülle → Teil: {lb:'vbase', v, abs} · {lb:'menu'}
"""
import base64, gzip, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(__file__))
from build import PARTS, OUT  # noqa: E402

T = os.path.dirname(os.path.abspath(__file__))


def meta(path):
    s = open(path, encoding='utf-8').read()
    m = re.search(r'class="lbt"><b>(.*?)</b><span>(.*?)</span>', s)
    return s, html.unescape(m.group(1)) if m else '', html.unescape(m.group(2)) if m else ''


def main():
    parts = []
    for n, fname, short in PARTS:
        p = os.path.join(OUT, fname + '.html')
        if not os.path.exists(p):
            raise SystemExit('fehlt: %s (erst tools/build.py laufen lassen)' % p)
        s, title, desc = meta(p)
        z = base64.b64encode(gzip.compress(s.encode('utf-8'), 9, mtime=0)).decode('ascii')
        parts.append({'n': n, 'file': fname + '.html', 'short': short, 'title': title, 'desc': desc, 'z': z})
    blobs = '\n'.join('<script type="application/octet-stream" id="z%d">%s</script>' % (i, p['z']) for i, p in enumerate(parts))
    info = json.dumps([{k: p[k] for k in ('n', 'file', 'short', 'title', 'desc')} for p in parts], ensure_ascii=False)
    page = open(os.path.join(T, 'shell.html'), encoding='utf-8').read().replace('/*PARTS*/[]', info).replace('<!--BLOBS-->', blobs)
    out = os.path.join(OUT, '00_Alle_Teile.html')
    open(out, 'w', encoding='utf-8').write(page)
    print('gebaut:', os.path.relpath(out, os.path.dirname(T)), '%.0f KB' % (os.path.getsize(out) / 1024))


if __name__ == '__main__':
    main()
