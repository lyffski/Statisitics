# Vorzeichen-Test, Wilcoxon-Test und Macht (Power)
y <- c(1002.1, 1003.4, 999.2, 1001.8, 1004.0, 1002.9, 1000.6, 1003.1, 1001.2, 1002.5)
d <- y - 1000                              # Abweichungen vom Sollwert
Q <- sum(d > 0)                            # Vorzeichen-Test: Anzahl positiver Vorzeichen
binom.test(Q, length(d), 0.5)              # Q ~ Bin(n, 0.5) unter H0, p = 0.0215
W <- sum(rank(abs(d))[d > 0])              # Wilcoxon: Rangsumme der positiven Abweichungen
W; wilcox.test(y, mu = 1000)               # W = 53, p = 0.0059
t.test(y, mu = 1000)$p.value               # t-Test zum Vergleich
# Macht des einseitigen Z-Tests: sigma = 4, n = 25, mu0 = 50, wahres mu1 = 52
1 - pnorm(qnorm(0.95) - (52 - 50) / (4 / sqrt(25)))    # 0.804
power.t.test(delta = 2, sd = 4, power = 0.9, type = "one.sample", alternative = "one.sided")   # nötiges n (t-Version)
