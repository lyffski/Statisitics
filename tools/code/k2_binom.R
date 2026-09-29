# Binomialverteilung Bin(n, p): Tabelle von p(x) und F(x) selbst berechnen
n <- 10; p <- 0.25                         # Parameter: Versuche und Erfolgs-W'keit #@par
F <- 0                                     # kumulierte Summe F(x) = P(X <= x) #@F0
for (x in 0:n) {                           # alle möglichen Werte 0 bis n #@loop
  px <- choose(n, x) * p^x * (1 - p)^(n - x)   # Reihenfolgen * Erfolge * Misserfolge #@px
  F <- F + px                              # bis x aufsummieren #@F
  cat(x, round(px, 4), round(F, 4), "\n")  # Zeile der Tabelle ausgeben #@out
}
# eingebaut: d = Wahrscheinlichkeit, p = Verteilungsfunktion, q = Quantil, r = Zufallszahlen
dbinom(2, n, p); pbinom(4, n, p); 1 - pbinom(4, n, p)   # P(X=2), P(X<=4), P(X>=5)
barplot(dbinom(0:n, n, p), names.arg = 0:n)             # Stabdiagramm von p(x)
