# Lineare Regression mit t-Test für die Steigung
import numpy as np
from scipy import stats

x = np.array([1, 2, 3, 4, 5]); y = np.array([2, 4, 5, 4, 5])   # Daten
n = len(x)
b = np.sum((x - x.mean()) * (y - y.mean())) / np.sum((x - x.mean()) ** 2)   # Steigung 0.6
a = y.mean() - b * x.mean()                # Achsenabschnitt 2.2
res = y - (a + b * x)                      # Residuen
s2 = np.sum(res ** 2) / (n - 2)            # Fehlervarianz, zwei Parameter geschätzt: n - 2
se_b = np.sqrt(s2 / np.sum((x - x.mean()) ** 2))   # Standardfehler der Steigung
t = b / se_b                               # Test H0: beta = 0 (kein linearer Zusammenhang)
print(t, 2 * stats.t.sf(abs(t), n - 2))    # t = 2.12, p = 0.124
print(b + np.array([-1, 1]) * stats.t.ppf(0.975, n - 2) * se_b)   # 95-%-VI für die Steigung
print(stats.linregress(x, y))              # slope, stderr, pvalue: dieselben Zahlen
