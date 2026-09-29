# Zweidimensionale Normalverteilung simulieren
import numpy as np
from scipy.stats import norm

rng = np.random.default_rng(1)
mu = np.array([170, 70])                   # Erwartungswerte (Größe cm, Gewicht kg)
sx, sy, rho = 10, 12, 0.6                  # Standardabweichungen und Korrelation
Sigma = np.array([[sx**2, rho*sx*sy], [rho*sx*sy, sy**2]])   # Kovarianzmatrix
XY = rng.multivariate_normal(mu, Sigma, size=5000)           # Zeile = ein Paar
print(np.corrcoef(XY[:, 0], XY[:, 1])[0, 1])                 # nahe 0.6
S = XY.sum(axis=1)                         # Summe ist wieder normal
print(S.mean(), S.var(ddof=1))             # nahe 240 und 388
print(np.mean(S > 260), norm.sf(260, 240, np.sqrt(388)))     # Simulation vs. Formel
