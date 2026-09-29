# Zweidimensionale Normalverteilung simulieren (ohne Zusatzpaket)
set.seed(1)
mu <- c(170, 70)                           # Erwartungswerte (Größe cm, Gewicht kg)
sx <- 10; sy <- 12; rho <- 0.6             # Standardabweichungen und Korrelation
Sigma <- matrix(c(sx^2, rho*sx*sy, rho*sx*sy, sy^2), 2)   # Kovarianzmatrix
L <- t(chol(Sigma))                        # Sigma = L L^T (Cholesky)
Z <- matrix(rnorm(2 * 5000), nrow = 2)     # unabhängige Standardnormale
XY <- mu + L %*% Z                         # korrelierte Paare, Spalte = ein Paar
cor(XY[1, ], XY[2, ])                      # nahe 0.6
S <- XY[1, ] + XY[2, ]                     # Summe ist wieder normal
c(mean(S), var(S))                         # nahe 240 und 100 + 144 + 2*72 = 388
mean(S > 260); 1 - pnorm(260, 240, sqrt(388))   # Simulation vs. Formel
