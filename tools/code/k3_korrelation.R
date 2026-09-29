# Empirische Kovarianz und Korrelation Schritt für Schritt
x <- c(1, 2, 3, 4, 5)                      # erste Messgröße #@x
y <- c(2, 4, 5, 4, 5)                      # zweite Messgröße, paarweise zu x #@y
n <- length(x); mx <- mean(x); my <- mean(y)   # Umfang und Mittelwerte #@m
sxy <- 0; sxx <- 0; syy <- 0               # drei Summen #@init
for (i in 1:n) {                           # jedes Paar einmal #@loop
  dx <- x[i] - mx; dy <- y[i] - my         # Abweichungen vom jeweiligen Mittel #@d
  sxy <- sxy + dx * dy                     # gemeinsame Abweichung #@xy
  sxx <- sxx + dx^2; syy <- syy + dy^2     # quadrierte Abweichungen #@xx
}
r <- sxy / sqrt(sxx * syy)                 # r = s_xy / (s_x s_y), Nenner n - 1 kürzt sich #@r
cat("s_xy =", sxy / (n - 1), " r =", r, "\n")   #@out
# eingebaut: cov(x, y); cor(x, y); plot(x, y)
