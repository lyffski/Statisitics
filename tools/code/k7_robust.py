# Vorzeichen-Test, Wilcoxon-Test und Macht (Power)
import numpy as np
from scipy import stats

y = np.array([1002.1, 1003.4, 999.2, 1001.8, 1004.0, 1002.9, 1000.6, 1003.1, 1001.2, 1002.5])
d = y - 1000                               # Abweichungen vom Sollwert
Q = int(np.sum(d > 0))                     # Vorzeichen-Test: Anzahl positiver Vorzeichen
print(stats.binomtest(Q, len(d), 0.5).pvalue)             # Q ~ Bin(n, 0.5) unter H0, p = 0.0215
W = stats.rankdata(np.abs(d))[d > 0].sum() # Wilcoxon: Rangsumme der positiven Abweichungen
print(W, stats.wilcoxon(d).pvalue)         # W = 53, p = 0.0059 (scipy meldet min(W+, W-) = 2)
print(stats.ttest_1samp(y, 1000).pvalue)   # t-Test zum Vergleich
# Macht des einseitigen Z-Tests: sigma = 4, n = 25, mu0 = 50, wahres mu1 = 52
print(stats.norm.sf(stats.norm.ppf(0.95) - (52 - 50) / (4 / np.sqrt(25))))   # 0.804
