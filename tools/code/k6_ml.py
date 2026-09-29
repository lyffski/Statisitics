# Maximum-Likelihood numerisch: log-Likelihood der Poissonverteilung auf einem Gitter
import numpy as np
from scipy import stats, optimize
from scipy.special import gammaln

x = np.array([2, 3, 1, 4, 0])              # beobachtete Anzahlen #@data
lambdas = np.arange(0.5, 4.01, 0.5)        # Kandidaten für lambda #@grid
best, bestL = None, -np.inf                # bisher bester Wert #@init
for lam in lambdas:                        # jeden Kandidaten prüfen #@loop
    l = np.sum(x * np.log(lam) - lam - gammaln(x + 1))   # log-Likelihood l(lambda) #@ll
    if l > bestL: bestL, best = l, lam     # größer als bisher? merken #@max
print("Gitter-Maximum bei", best, " Mittel =", x.mean())   # ML-Schätzer = Mittel #@out
res = optimize.minimize_scalar(lambda l: -stats.poisson.logpmf(x, l).sum(), bounds=(0.01, 10), method="bounded")
print(res.x)                               # genau: 2.0
