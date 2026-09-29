# Zwei-Stichproben-t-Test (ungepaart, gleiche Varianz)
import numpy as np
from scipy import stats

x = np.array([402, 415, 388, 397, 410, 385, 399, 421, 393, 379])   # Gruppe X #@x
y = np.array([378, 395, 362, 388, 401, 370, 383, 359])             # Gruppe Y #@y
n, m = len(x), len(y)                      # Umfänge dürfen verschieden sein #@nm
sp2 = ((n - 1) * x.var(ddof=1) + (m - 1) * y.var(ddof=1)) / (n + m - 2)   # gepoolte Varianz #@sp
se = np.sqrt(sp2) * np.sqrt(1 / n + 1 / m) # Standardfehler der Differenz #@se
t = (x.mean() - y.mean()) / se             # Teststatistik #@t
df = n + m - 2                             # Freiheitsgrade #@df
p = 2 * stats.t.sf(abs(t), df)             # P-Wert zweiseitig #@p
vi = x.mean() - y.mean() + np.array([-1, 1]) * stats.t.ppf(0.975, df) * se   # 95-%-VI #@vi
print(f"t = {t:.4f}  df = {df}  p = {p:.4f}  VI = {vi.round(2)}")   #@out
print(stats.ttest_ind(x, y))               # eingebaut; equal_var=False: Welch-Test
print(stats.mannwhitneyu(x, y))            # Zwei-Stichproben-Wilcoxon (Mann-Whitney)
