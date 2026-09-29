# Statistik I · interaktive Lernbegleiter

Eigenständige HTML-Dateien pro Kapitel (dunkler Bildatlas-Stil, KaTeX, Plotly), gebaut nach dem Skill „Interaktive Lernbegleiter“.

| Datei | Inhalt |
|---|---|
| `Lernbegleiter/00_Alle_Teile.html` | **die Datei zum Verschicken**: alle Teile in einer Datei, Übersicht (Taste `T`), jeder Teil läuft isoliert in einem eigenen Rahmen. Nur diese Datei enthält die 🎓 Prüfungsaufgaben und den Video-Pfad `~/Personal/Statistics` |
| `Lernbegleiter/01_Grundlagen_Wahrscheinlichkeit.html` | Kap. 1: Ω, Axiome, Siebformel, Laplace, mehrstufige Experimente, Unabhängigkeit, bedingte W'keit, totale W'keit, Bayes |
| `Lernbegleiter/02_Verteilungen.html` | Kap. 2: Zufallsvariable, Verteilungsfunktion, E und Var, Bernoulli bis Normal, Poissonprozess, Transformation |
| `Lernbegleiter/03_Deskriptive_Statistik.html` | Kap. 3: Kennzahlen, Quantile, Grafiken, Korrelation, lineare Regression |
| `Lernbegleiter/04_Mehrdimensionale_Verteilungen.html` | Kap. 4: gemeinsame, Rand- und bedingte Verteilung, Kovarianz, Korrelation, Faltung, 2D-Normal |
| `Lernbegleiter/05_Grenzwertsaetze.html` | Kap. 5: i.i.d., √n-Gesetz, Markov/Chebyshev, Gesetz der großen Zahlen, ZGS, Normalapproximation |
| `Lernbegleiter/06_Parameterschaetzung.html` | Kap. 6: Momentenmethode, Maximum-Likelihood, Erwartungstreue, Standardfehler, Vertrauensintervall |
| `Lernbegleiter/07_Tests_und_Vertrauensintervalle.html` | Kap. 7: Hypothesen, Fehler 1./2. Art, Binomial-, Z-, t-Test, Macht, P-Wert, Dualität, Vorzeichen, Wilcoxon |
| `Lernbegleiter/08_Zwei_Stichproben.html` | Kap. 8: gepaart/ungepaart, Zwei-Stichproben-t-Test, Welch, Mann-Whitney, t-Test der Regressionssteigung |
| `Lernbegleiter/09_Rechner.html` | Statistik-Rechner: Deskriptiv, Ein-/Zwei-Stichproben, gepaart, Macht, Quantile & Verteilungen, Regression, Kombinatorik; jeweils mit R- und Python-Code zu deinen Daten |
| `Grundlage/statistik-lernbegleiter-komplett1.html` | bisheriger Lernbegleiter (Skript L. Meier), Quelle aller „📘 Grundlage“-Inhalte |
| `STATISTIK_II_NOTIZEN.md` | Videos, die erst für Statistik II gebraucht werden (bewusst nicht verlinkt) |

**Einzeldateien** `01…09_*.html`: älterer Stand ohne 🎓 Prüfungsaufgaben; es wird nur noch `00_Alle_Teile.html` aktualisiert.

**🎓 Prüfungsaufgaben:** am Ende jedes Unterkapitels eine Aufgabe, die alles aus dem Unterkapitel von null abfragt, und pro Kapitel eine Gesamtaufgabe (Abschnitt „★“). Jede Teilaufgabe (a), (b), … lässt sich einzeln aufklappen. Quelle: `tools/kap/pa/kNN.html`.

**Kennzeichen:** 📘 Grundlage = aus dem bisherigen Lernbegleiter übernommen · ✚ Neu = ergänzt (Von-null-Karten, R/Python-Code, Tracer, Modulinhalte wie Siebformel und lineare Regression).

**Code:** R (Basis-R) und Python (numpy/scipy/matplotlib) nebeneinander, wie im Modul vorgesehen. Die Python-Programme in `tools/code/*.py` sind ausgeführt und geprüft; die R-Programme sind Zeile für Zeile gleich aufgebaut.

**Videos:** Die 🎬-Links öffnen deine lokalen `.mp4`-Dateien direkt aus `/home/lllvrm/Personal/Statistics/` (Unterordner `init/`, `init2/`, `statquest/` wie in deinem `tree`). Liegt der Ordner woanders, im ☰-Menü eines beliebigen Teils unter „Video-Ordner“ den absoluten Pfad eintragen; das gilt dann für alle Teile. „📋 Pfad“ kopiert den Dateipfad, falls der Browser `file://`-Links blockiert.

## Bauen und testen

```bash
python3 tools/build.py            # alle Teile nach build/teile/ bauen (oder: python3 tools/build.py 8)
python3 tools/bundle.py           # danach die Gesamtdatei 00_Alle_Teile.html erzeugen
LIBS=/pfad/zu/libs node tools/test/test.js build/teile/0*.html      # KaTeX, JS-Fehler, IDs, Überlauf, Menü, Tracer
LIBS=/pfad/zu/libs node tools/test/bundle_test.js Lernbegleiter/00_Alle_Teile.html   # jeder Teil in der Gesamtdatei
```
