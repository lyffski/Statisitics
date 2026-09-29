# Gepaarter t-Test: Differenzen bilden, dann Ein-Stichproben-t-Test
import numpy as np
from scipy import stats

vorher = np.array([5.2, 6.1, 4.8, 5.9, 6.3, 5.5, 4.9, 6.0])    # Bedingung A #@a
nachher = np.array([4.7, 5.4, 4.9, 5.1, 5.8, 4.8, 4.6, 5.3])   # Bedingung B, gleiche Einheiten #@b
u = vorher - nachher                       # Differenz pro Paar #@u
n = len(u)                                 # Anzahl Paare #@n
ubar, su = u.mean(), u.std(ddof=1)         # Mittel und Standardabweichung der Differenzen #@ms
t = ubar / (su / np.sqrt(n))               # Teststatistik für H0: E[U] = 0 #@t
krit = stats.t.ppf(0.975, n - 1)           # t_{n-1, 0.975}, zweiseitig alpha = 0.05 #@krit
p = 2 * stats.t.sf(abs(t), n - 1)          # P-Wert #@p
print(f"t = {t:.4f}  krit = {krit:.4f}  p = {p:.4f}")   #@out
print(stats.ttest_rel(vorher, nachher))    # eingebaut, identisch
print(stats.ttest_ind(vorher, nachher))    # FALSCH für gepaarte Daten: verschenkt das Pairing
