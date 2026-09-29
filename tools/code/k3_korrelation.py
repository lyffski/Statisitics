# Empirische Kovarianz und Korrelation Schritt für Schritt
import numpy as np

x = np.array([1, 2, 3, 4, 5])              # erste Messgröße #@x
y = np.array([2, 4, 5, 4, 5])              # zweite Messgröße, paarweise zu x #@y
n, mx, my = len(x), x.mean(), y.mean()     # Umfang und Mittelwerte #@m
sxy = sxx = syy = 0.0                      # drei Summen #@init
for i in range(n):                         # jedes Paar einmal #@loop
    dx, dy = x[i] - mx, y[i] - my          # Abweichungen vom jeweiligen Mittel #@d
    sxy += dx * dy                         # gemeinsame Abweichung #@xy
    sxx += dx ** 2; syy += dy ** 2         # quadrierte Abweichungen #@xx
r = sxy / np.sqrt(sxx * syy)               # r = s_xy / (s_x s_y), Nenner n - 1 kürzt sich #@r
print("s_xy =", sxy / (n - 1), " r =", r)  #@out
# eingebaut: np.cov(x, y)[0, 1]; np.corrcoef(x, y)[0, 1]
