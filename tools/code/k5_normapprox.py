# Normalapproximation der Binomialverteilung, mit und ohne Stetigkeitskorrektur
import math
from scipy.stats import norm, binom

n, p, x = 100, 0.3, 25                     # X ~ Bin(n, p), gesucht P(X <= x) #@par
mu = n * p                                 # Erwartungswert np #@mu
sigma = math.sqrt(n * p * (1 - p))         # Standardabweichung sqrt(np(1-p)) #@sd
z = (x - mu) / sigma                       # standardisieren #@z
naeh = norm.cdf(z)                         # ZGS: P(X <= x) ungefähr Phi(z) #@phi
zk = (x + 0.5 - mu) / sigma                # Stetigkeitskorrektur: Grenze x + 0.5 #@zk
naehk = norm.cdf(zk)                       # korrigierte Näherung #@phik
exakt = binom.cdf(x, n, p)                 # exakter Wert zum Vergleich #@ex
print(naeh, naehk, exakt)                  #@out
