# Statistik I · interaktive Lernbegleiter

Eigenständige HTML-Dateien pro Kapitel (dunkler Bildatlas-Stil, KaTeX, Plotly), gebaut nach dem Skill „Interaktive Lernbegleiter“.

| Datei | Inhalt |
|---|---|
| `Lernbegleiter/01_Grundlagen_Wahrscheinlichkeit.html` | Kap. 1: Ω, Axiome, Siebformel, Laplace, Unabhängigkeit, bedingte W'keit, totale W'keit, Bayes |
| `Lernbegleiter/0N_….html` | weitere Kapitel (in Arbeit) |
| `Grundlage/statistik-lernbegleiter-komplett1.html` | bisheriger Lernbegleiter (Skript L. Meier), Quelle aller „📘 Grundlage“-Inhalte |

**Kennzeichen:** 📘 Grundlage = aus dem bisherigen Lernbegleiter übernommen · ✚ Neu = ergänzt (Von-null-Karten, R/Python-Code, Tracer, Modulinhalte wie Siebformel und lineare Regression).

**Code:** R (Basis-R) und Python (numpy/scipy/matplotlib) nebeneinander, wie im Modul vorgesehen. Die Python-Programme in `tools/code/*.py` sind ausgeführt und geprüft; die R-Programme sind Zeile für Zeile gleich aufgebaut.

**Videos:** Die 🎬-Links zeigen auf deine lokalen `.mp4`-Dateien. Entweder neben den HTML-Dateien einen Symlink anlegen:

```bash
cd Lernbegleiter && ln -s ~/Pfad/zu/deinen/Videos videos
```

oder im ☰-Menü unter „Video-Ordner“ den absoluten Pfad eintragen (z. B. `/home/NAME/Videos/Statistik/`). Unterordner `init/`, `init2/`, `statquest/` wie in deiner Ordnerstruktur.

## Bauen und testen

```bash
python3 tools/build.py            # alle Kapitel aus tools/kap/ bauen
LIBS=/pfad/zu/libs node tools/test/test.js Lernbegleiter/*.html   # KaTeX, JS-Fehler, IDs, Überlauf, Menü, Tracer
```
