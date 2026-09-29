# Zentraler Grenzwertsatz per Simulation: Mittel von n Exponential-Werten
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm

rng = np.random.default_rng(1)
n, m = 30, 10_000                          # Stichprobenumfang und Anzahl Wiederholungen
mittel = rng.exponential(1.0, size=(m, n)).mean(axis=1)   # m Stichprobenmittel, Exp(1)
print(mittel.mean(), mittel.std(ddof=1), 1 / np.sqrt(n))  # E = 1 und sd = sigma / sqrt(n)
fig, ax = plt.subplots(1, 2, figsize=(11, 3.5))
ax[0].hist(mittel, bins=50, density=True)  # fast eine Glocke, obwohl Exp schief ist
t = np.linspace(0.3, 1.8, 200); ax[0].plot(t, norm.pdf(t, 1, 1 / np.sqrt(n)))   # ZGS-Näherung
laufend = np.cumsum(rng.integers(1, 7, 1000)) / np.arange(1, 1001)   # GGZ: laufendes Mittel
ax[1].plot(laufend); ax[1].axhline(3.5, color="red"); plt.show()
