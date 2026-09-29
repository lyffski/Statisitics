# Zwei-Stichproben-t-Test (ungepaart, gleiche Varianz)
x <- c(402, 415, 388, 397, 410, 385, 399, 421, 393, 379)   # Gruppe X #@x
y <- c(378, 395, 362, 388, 401, 370, 383, 359)             # Gruppe Y #@y
n <- length(x); m <- length(y)             # Umfänge dürfen verschieden sein #@nm
sp2 <- ((n - 1) * var(x) + (m - 1) * var(y)) / (n + m - 2) # gepoolte Varianz #@sp
se <- sqrt(sp2) * sqrt(1 / n + 1 / m)      # Standardfehler der Differenz #@se
t <- (mean(x) - mean(y)) / se              # Teststatistik #@t
df <- n + m - 2                            # Freiheitsgrade #@df
p <- 2 * pt(-abs(t), df)                   # P-Wert zweiseitig #@p
vi <- mean(x) - mean(y) + c(-1, 1) * qt(0.975, df) * se    # 95-%-VI für mu_X - mu_Y #@vi
cat("t =", t, " df =", df, " p =", p, " VI =", vi, "\n")   #@out
t.test(x, y, var.equal = TRUE)             # eingebaut; ohne var.equal: Welch-Test
wilcox.test(x, y)                          # Zwei-Stichproben-Wilcoxon (Mann-Whitney)
