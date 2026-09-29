# Lineare Regression mit t-Test für die Steigung
x <- c(1, 2, 3, 4, 5); y <- c(2, 4, 5, 4, 5)   # Daten
n <- length(x)
b <- sum((x - mean(x)) * (y - mean(y))) / sum((x - mean(x))^2)   # Steigung 0.6
a <- mean(y) - b * mean(x)                 # Achsenabschnitt 2.2
res <- y - (a + b * x)                     # Residuen
s2 <- sum(res^2) / (n - 2)                 # Fehlervarianz, zwei Parameter geschätzt: n - 2
se_b <- sqrt(s2 / sum((x - mean(x))^2))    # Standardfehler der Steigung
t <- b / se_b                              # Test H0: beta = 0 (kein linearer Zusammenhang)
c(t, 2 * pt(-abs(t), n - 2))               # t = 2.12, p = 0.124
b + c(-1, 1) * qt(0.975, n - 2) * se_b     # 95-%-VI für die Steigung
summary(lm(y ~ x))                         # dieselben Zahlen in der Zeile "x"
