# Binomialverteilung Bin(n, p): Tabelle von p(x) und F(x) selbst berechnen
from math import comb
from scipy import stats
import matplotlib.pyplot as plt

n, p = 10, 0.25                            # Parameter: Versuche und Erfolgs-W'keit #@par
F = 0.0                                    # kumulierte Summe F(x) = P(X <= x) #@F0
for x in range(n + 1):                     # alle möglichen Werte 0 bis n #@loop
    px = comb(n, x) * p**x * (1 - p)**(n - x)   # Reihenfolgen * Erfolge * Misserfolge #@px
    F += px                                # bis x aufsummieren #@F
    print(x, round(px, 4), round(F, 4))    # Zeile der Tabelle ausgeben #@out
# eingebaut: pmf = Wahrscheinlichkeit, cdf = Verteilungsfunktion, ppf = Quantil, rvs = Zufallszahlen
X = stats.binom(n, p)
print(X.pmf(2), X.cdf(4), 1 - X.cdf(4))    # P(X=2), P(X<=4), P(X>=5)
plt.bar(range(n + 1), X.pmf(range(n + 1))); plt.show()   # Stabdiagramm von p(x)
