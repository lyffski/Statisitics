# Momentenmethode und Maximum-Likelihood im Vergleich, plus QQ-Plot
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

x = np.array([1.2, 3.9, 2.5, 4.4, 0.8])    # Daten, Modell Uni(0, theta)
theta_mom = 2 * x.mean()                   # Momente: E[X] = theta/2  ->  theta = 2 * Mittel
theta_ml = x.max()                         # ML: L(theta) = theta^(-n) für theta >= max, fällt -> Maximum
print(theta_mom, theta_ml)                 # 5.12 und 4.4
t = np.array([1.2, 3.4, 10.6, 5.8, 0.9])   # Lebensdauern, Modell Exp(lambda)
print(1 / t.mean())                        # ML- und Momentenschätzer: 0.228
y = np.array([3.1, 4.8, 2.2, 5.9, 4.0])    # Normalplot: Punkte auf einer Geraden?
stats.probplot(y, dist="norm", plot=plt); plt.show()
