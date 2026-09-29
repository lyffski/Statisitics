# Normalapproximation der Binomialverteilung, mit und ohne Stetigkeitskorrektur
n <- 100; p <- 0.3; x <- 25                # X ~ Bin(n, p), gesucht P(X <= x) #@par
mu <- n * p                                # Erwartungswert np #@mu
sigma <- sqrt(n * p * (1 - p))             # Standardabweichung sqrt(np(1-p)) #@sd
z <- (x - mu) / sigma                      # standardisieren #@z
naeh <- pnorm(z)                           # ZGS: P(X <= x) ungefähr Phi(z) #@phi
zk <- (x + 0.5 - mu) / sigma               # Stetigkeitskorrektur: Grenze x + 0.5 #@zk
naehk <- pnorm(zk)                         # korrigierte Näherung #@phik
exakt <- pbinom(x, n, p)                   # exakter Wert zum Vergleich #@ex
cat(naeh, naehk, exakt, "\n")              #@out
