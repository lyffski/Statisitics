# Binomialtest einseitig nach oben: Verwerfungsbereich K = {g, ..., n} konstruieren
n <- 50; p0 <- 0.05; alpha <- 0.05; x <- 6   # H0: p = p0, HA: p > p0, Beobachtung x #@par
g <- 0                                     # Kandidat g für die Grenze von K #@c0
repeat {                                   # kleinstes g mit P(X >= g) <= alpha suchen #@loop
  schwanz <- 1 - pbinom(g - 1, n, p0)      # P_{p0}(X >= g), W'keit für Fehler 1. Art #@tail
  if (schwanz <= alpha) break              # klein genug: gefunden #@if
  g <- g + 1                               # sonst Grenze nach rechts schieben #@inc
}
pwert <- 1 - pbinom(x - 1, n, p0)          # P-Wert: P(X >= x) unter H0 #@p
cat("K = {", g, ",...,", n, "}  x in K:", x >= g, " p =", pwert, "\n")   #@out
binom.test(x, n, p0, alternative = "greater")   # eingebaut
