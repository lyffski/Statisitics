# Kennzahlen einer Stichprobe von Hand: Mittel, Varianz, Quantile wie im Skript
import math
import numpy as np

x = [12, 15, 11, 18, 14, 13, 30, 16]       # Daten x_1 bis x_n #@data
n = len(x)                                 # Stichprobenumfang #@n
summe = 0                                  # Summe aller Werte #@s0
for i in range(n): summe += x[i]           # aufsummieren #@sum
xbar = summe / n                           # arithmetisches Mittel #@mean
q = 0.0                                    # Summe der quadrierten Abweichungen #@q0
for i in range(n): q += (x[i] - xbar) ** 2 # Abstand zum Mittel, quadriert #@sq
s2 = q / (n - 1)                           # empirische Varianz mit Nenner n - 1 #@s2
s = math.sqrt(s2)                          # empirische Standardabweichung #@s
xs = sorted(x)                             # geordnete Werte x_(1) <= ... <= x_(n) #@sort
def quant(alpha):                          # empirisches Quantil nach Skript #@qf
    k = alpha * n                          # Position alpha * n #@pos
    return (xs[round(k) - 1] + xs[round(k)]) / 2 if k == round(k) else xs[math.ceil(k) - 1]   # Python zählt ab 0 #@case
print(xbar, s2, s, quant(0.25), quant(0.5), quant(0.75))   #@out
# eingebaut: np.mean(x); np.var(x, ddof=1); np.std(x, ddof=1)
print(np.quantile(x, [.25, .5, .75], method="averaged_inverted_cdf"))   # = Skript-Definition
