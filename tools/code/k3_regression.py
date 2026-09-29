# Einfache lineare Regression mit der Methode der kleinsten Quadrate
import numpy as np
from scipy import stats

x = np.array([1, 2, 3, 4, 5])              # erklärende Variable #@x
y = np.array([2, 4, 5, 4, 5])              # Zielgröße #@y
mx, my = x.mean(), y.mean()                # Schwerpunkt der Punktwolke #@m
Sxy = np.sum((x - mx) * (y - my))          # Summe der Kreuzprodukte #@sxy
Sxx = np.sum((x - mx) ** 2)                # Summe der Quadrate in x #@sxx
b = Sxy / Sxx                              # Steigung #@b
a = my - b * mx                            # Achsenabschnitt: Gerade geht durch (mx, my) #@a
yhat = a + b * x                           # vorhergesagte Werte auf der Geraden #@yhat
res = y - yhat                             # Residuen: Abstand senkrecht zur x-Achse #@res
R2 = 1 - np.sum(res ** 2) / np.sum((y - my) ** 2)   # Bestimmtheitsmaß #@R2
print(f"y = {a:.4f} + {b:.4f} x   R^2 = {R2:.4f}")   #@out
fit = stats.linregress(x, y); print(fit.intercept, fit.slope, fit.rvalue ** 2)   # eingebaut
