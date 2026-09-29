# Gepaarter t-Test: Differenzen bilden, dann Ein-Stichproben-t-Test
vorher <- c(5.2, 6.1, 4.8, 5.9, 6.3, 5.5, 4.9, 6.0)    # Bedingung A #@a
nachher <- c(4.7, 5.4, 4.9, 5.1, 5.8, 4.8, 4.6, 5.3)   # Bedingung B, gleiche Einheiten #@b
u <- vorher - nachher                      # Differenz pro Paar #@u
n <- length(u)                             # Anzahl Paare #@n
ubar <- mean(u); su <- sd(u)               # Mittel und Standardabweichung der Differenzen #@ms
t <- ubar / (su / sqrt(n))                 # Teststatistik für H0: E[U] = 0 #@t
krit <- qt(0.975, n - 1)                   # t_{n-1, 0.975}, zweiseitig alpha = 0.05 #@krit
p <- 2 * pt(-abs(t), n - 1)                # P-Wert #@p
cat("t =", t, " krit =", krit, " p =", p, "\n")   #@out
t.test(vorher, nachher, paired = TRUE)     # eingebaut, identisch
t.test(vorher, nachher, var.equal = TRUE)  # FALSCH für gepaarte Daten: verschenkt das Pairing
