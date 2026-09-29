# Verteilung der Summe S = X + Y zweier unabhängiger diskreter ZV (Faltung)
pX <- rep(1/6, 6)                          # X: fairer Würfel, Werte 1 bis 6 #@pX
pY <- rep(1/6, 6)                          # Y: fairer Würfel, Werte 1 bis 6 #@pY
pS <- numeric(12)                          # P(S = s) für s = 1 bis 12 #@pS0
for (s in 2:12) {                          # jede mögliche Summe #@loopS
  for (k in 1:6) {                         # X = k, dann muss Y = s - k sein #@loopK
    if (s - k >= 1 && s - k <= 6)          # nur erlaubte Werte von Y #@if
      pS[s] <- pS[s] + pX[k] * pY[s - k]   # Unabhängigkeit: Produkt, dann summieren #@add
  }
}
round(pS[2:12] * 36)                       # in 36steln: 1 2 3 4 5 6 5 4 3 2 1 #@out
sum((1:12) * pS)                           # E[S] = 7 = E[X] + E[Y]
