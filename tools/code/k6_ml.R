# Maximum-Likelihood numerisch: log-Likelihood der Poissonverteilung auf einem Gitter
x <- c(2, 3, 1, 4, 0)                      # beobachtete Anzahlen #@data
lambdas <- seq(0.5, 4, by = 0.5)           # Kandidaten für lambda #@grid
best <- NA; bestL <- -Inf                  # bisher bester Wert #@init
for (lam in lambdas) {                     # jeden Kandidaten prüfen #@loop
  l <- sum(x * log(lam) - lam - lfactorial(x))   # log-Likelihood l(lambda) #@ll
  if (l > bestL) { bestL <- l; best <- lam }      # größer als bisher? merken #@max
}
cat("Gitter-Maximum bei", best, " Mittel =", mean(x), "\n")   # ML-Schätzer = Mittel #@out
optimize(function(l) sum(dpois(x, l, log = TRUE)), c(0.01, 10), maximum = TRUE)$maximum   # genau
