# Standardfehler und Vertrauensintervall für mu bei bekanntem sigma
import math
import numpy as np
from scipy.stats import norm

xbar, sigma, n = 21.3, 4, 16               # Mittel, bekannte Streuung, Umfang #@par
alpha = 0.05                               # 1 - Vertrauensniveau #@alpha
se = sigma / math.sqrt(n)                  # Standardfehler des Mittels #@se
z = norm.ppf(1 - alpha / 2)                # Quantil z_{0.975} = 1.96 #@z
lo, hi = xbar - z * se, xbar + z * se      # Schätzung plus/minus z mal SE #@ci
print(f"SE = {se}  VI = [{lo:.3f}, {hi:.3f}]")   #@out
n_noetig = math.ceil((z * sigma / 0.5) ** 2)     # n für halbe Breite 0.5 #@n
# Überdeckung per Simulation: Anteil der Intervalle, die mu treffen
m = np.random.default_rng(1).normal(0, sigma, (10000, n)).mean(axis=1)
print(n_noetig, np.mean(np.abs(m) <= z * se))    # 246 und etwa 0.95
