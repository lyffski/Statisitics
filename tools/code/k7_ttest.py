# t-Test für den Erwartungswert, Schritt für Schritt
import numpy as np
from scipy import stats

x = np.array([5.1, 4.9, 5.6, 5.8, 5.3, 5.5, 5.2, 5.4])   # Messwerte #@data
mu0, alpha = 5, 0.05                       # Sollwert und Niveau, zweiseitig #@par
n = len(x)                                 # Stichprobenumfang #@n
xbar, s = x.mean(), x.std(ddof=1)          # Mittel und Standardabweichung (n - 1) #@ms
se = s / np.sqrt(n)                        # geschätzter Standardfehler #@se
t = (xbar - mu0) / se                      # Teststatistik: Abweichung in Standardfehlern #@t
krit = stats.t.ppf(1 - alpha / 2, df=n - 1)   # kritischer Wert t_{n-1, 1-alpha/2} #@krit
p = 2 * stats.t.sf(abs(t), df=n - 1)       # zweiseitiger P-Wert #@p
vi = xbar + np.array([-1, 1]) * krit * se  # Vertrauensintervall (Dualität) #@vi
print(f"t = {t:.4f}  krit = {krit:.4f}  p = {p:.4f}  verwerfen: {abs(t) >= krit}")   #@out
print(stats.ttest_1samp(x, mu0))           # eingebaut: gleiche Zahlen
