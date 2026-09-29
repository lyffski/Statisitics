# Gemeinsame Verteilung als Tabelle: Ränder, E, Kovarianz, Korrelation
import numpy as np

x = np.array([0, 1, 2])                    # Werte von X (Zeilen) #@x
y = np.array([0, 1])                       # Werte von Y (Spalten) #@y
P = np.array([[0.10, 0.20],                # P(X = x_i, Y = y_j), zeilenweise #@P
              [0.15, 0.25],
              [0.05, 0.25]])
pX = P.sum(axis=1)                         # Randverteilung von X: Zeilensummen #@pX
pY = P.sum(axis=0)                         # Randverteilung von Y: Spaltensummen #@pY
EX, EY = np.sum(x * pX), np.sum(y * pY)    # Erwartungswerte aus den Rändern #@E
EXY = 0.0                                  # E[XY] braucht die gemeinsame Tabelle #@exy0
for i in range(len(x)):                    # jedes Feld der Tabelle #@loop
    for j in range(len(y)):
        EXY += x[i] * y[j] * P[i, j]       # Wert x*y mal Wahrscheinlichkeit #@exy
covXY = EXY - EX * EY                      # Kovarianz, praktische Formel #@cov
VX = np.sum(x**2 * pX) - EX**2; VY = np.sum(y**2 * pY) - EY**2   # Varianzen #@var
rho = covXY / np.sqrt(VX * VY)             # Korrelation #@rho
unabh = np.allclose(P, np.outer(pX, pY))   # gemeinsam = Produkt der Ränder? #@ind
print("Cov =", covXY, " Corr =", rho, " unabhängig:", unabh)   #@out
