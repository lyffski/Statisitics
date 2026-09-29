# Gemeinsame Verteilung als Tabelle: Ränder, E, Kovarianz, Korrelation
x <- c(0, 1, 2)                            # Werte von X (Zeilen) #@x
y <- c(0, 1)                               # Werte von Y (Spalten) #@y
P <- matrix(c(0.10, 0.20,                  # P(X = x_i, Y = y_j), zeilenweise #@P
              0.15, 0.25,
              0.05, 0.25), nrow = 3, byrow = TRUE)
pX <- rowSums(P)                           # Randverteilung von X: Zeilensummen #@pX
pY <- colSums(P)                           # Randverteilung von Y: Spaltensummen #@pY
EX <- sum(x * pX); EY <- sum(y * pY)       # Erwartungswerte aus den Rändern #@E
EXY <- 0                                   # E[XY] braucht die gemeinsame Tabelle #@exy0
for (i in seq_along(x)) for (j in seq_along(y))   # jedes Feld der Tabelle #@loop
  EXY <- EXY + x[i] * y[j] * P[i, j]       # Wert x*y mal Wahrscheinlichkeit #@exy
covXY <- EXY - EX * EY                     # Kovarianz, praktische Formel #@cov
VX <- sum(x^2 * pX) - EX^2; VY <- sum(y^2 * pY) - EY^2   # Varianzen #@var
rho <- covXY / sqrt(VX * VY)               # Korrelation #@rho
unabh <- isTRUE(all.equal(P, outer(pX, pY)))   # gemeinsam = Produkt der Ränder? #@ind
cat("Cov =", covXY, " Corr =", rho, " unabhängig:", unabh, "\n")   #@out
