# Relative Häufigkeit f_n(A) für A = "Kopf" Wurf für Wurf mitrechnen
wuerfe <- c("K", "Z", "K", "K", "Z", "Z", "K", "Z", "K", "K")   # beobachtete Würfe #@data
n <- length(wuerfe)                        # Anzahl Wiederholungen n #@n
treffer <- 0                               # wie oft ist A bisher eingetreten? #@t0
for (i in 1:n) {                           # Wurf Nummer i läuft von 1 bis n #@loop
  if (wuerfe[i] == "K") treffer <- treffer + 1    # A tritt ein: Zähler erhöhen #@if
  f <- treffer / i                         # relative Häufigkeit f_i(A) = treffer / i #@f
  cat("i =", i, "  f =", round(f, 4), "\n")       # Zwischenstand ausgeben #@out
}
# dasselbe vektorisiert in einer Zeile:
f_alle <- cumsum(wuerfe == "K") / seq_len(n)    # alle f_1 bis f_n auf einmal #@vec
plot(f_alle, type = "b", ylim = c(0, 1)); abline(h = 0.5, lty = 2)   # Kurve und wahres P(A)
