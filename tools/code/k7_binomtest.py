# Binomialtest einseitig nach oben: Verwerfungsbereich K = {g, ..., n} konstruieren
from scipy import stats

n, p0, alpha, x = 50, 0.05, 0.05, 6        # H0: p = p0, HA: p > p0, Beobachtung x #@par
g = 0                                      # Kandidat g für die Grenze von K #@c0
while True:                                # kleinstes g mit P(X >= g) <= alpha suchen #@loop
    schwanz = stats.binom.sf(g - 1, n, p0) # P_{p0}(X >= g), W'keit für Fehler 1. Art #@tail
    if schwanz <= alpha: break             # klein genug: gefunden #@if
    g += 1                                 # sonst Grenze nach rechts schieben #@inc
pwert = stats.binom.sf(x - 1, n, p0)       # P-Wert: P(X >= x) unter H0 #@p
print(f"K = {{{g},...,{n}}}  x in K: {x >= g}  p = {pwert:.4f}")   #@out
print(stats.binomtest(x, n, p0, alternative="greater"))            # eingebaut
