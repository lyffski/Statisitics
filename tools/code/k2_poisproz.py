# Poissonprozess simulieren: exponentielle Zwischenzeiten, Poisson-Anzahl
import numpy as np
from scipy import stats

rng = np.random.default_rng(1)             # reproduzierbarer Zufall
lam, t_end = 3, 2                          # Rate pro Stunde, Beobachtungsdauer in Stunden
zeiten = np.cumsum(rng.exponential(1 / lam, 100))   # Ankunftszeiten (numpy nutzt scale = 1/lambda)
N = np.sum(zeiten <= t_end)                # Anzahl Ereignisse in [0, t_end]
Ns = np.array([np.sum(np.cumsum(rng.exponential(1 / lam, 100)) <= t_end) for _ in range(10000)])
print(Ns.mean(), Ns.var(ddof=1))           # beide nahe lambda * t_end = 6
print(np.mean(Ns == 4), stats.poisson.pmf(4, lam * t_end))   # Simulation gegen Formel P(N = 4)
print(stats.expon.sf(0.5, scale=1 / lam))  # P(erste Wartezeit > 30 min) = exp(-1.5)
