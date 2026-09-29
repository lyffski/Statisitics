# Verteilung der Summe S = X + Y zweier unabhängiger diskreter ZV (Faltung)
import numpy as np

pX = np.full(6, 1 / 6)                     # X: fairer Würfel, Werte 1 bis 6 #@pX
pY = np.full(6, 1 / 6)                     # Y: fairer Würfel, Werte 1 bis 6 #@pY
pS = np.zeros(13)                          # P(S = s) für s = 0 bis 12 #@pS0
for s in range(2, 13):                     # jede mögliche Summe #@loopS
    for k in range(1, 7):                  # X = k, dann muss Y = s - k sein #@loopK
        if 1 <= s - k <= 6:                # nur erlaubte Werte von Y #@if
            pS[s] += pX[k - 1] * pY[s - k - 1]   # Unabhängigkeit: Produkt, dann summieren #@add
print(np.round(pS[2:] * 36))               # in 36steln: 1 2 3 4 5 6 5 4 3 2 1 #@out
print(np.convolve(pX, pY) * 36)            # dasselbe mit der eingebauten Faltung
