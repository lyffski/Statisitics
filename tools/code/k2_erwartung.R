# Erwartungswert und Varianz aus einer Wahrscheinlichkeitsfunktion
x <- c(10, 2, -3)                          # mögliche Werte x_k (Gewinn in Euro) #@x
p <- c(0.1, 0.3, 0.6)                      # Wahrscheinlichkeiten p(x_k) #@p
stopifnot(abs(sum(p) - 1) < 1e-12)         # Kontrolle: alle p zusammen ergeben 1 #@chk
EX <- 0; EX2 <- 0                          # Summen für E[X] und E[X^2] #@init
for (k in seq_along(x)) {                  # jeden möglichen Wert einmal #@loop
  EX <- EX + x[k] * p[k]                   # Wert mal Wahrscheinlichkeit aufsummieren #@ex
  EX2 <- EX2 + x[k]^2 * p[k]               # Quadrat mal Wahrscheinlichkeit #@ex2
}
VarX <- EX2 - EX^2                         # Verschiebungssatz: E[X^2] - E[X]^2 #@var
sdX <- sqrt(VarX)                          # Standardabweichung, gleiche Einheit wie X #@sd
cat("E =", EX, " Var =", VarX, " sd =", sdX, "\n")   #@out
# kurz und vektorisiert:
sum(x * p); sum((x - sum(x * p))^2 * p)    # E[X] und Var(X) über die Definition
