# Histogramm, Boxplot und empirische Verteilungsfunktion
import math
import numpy as np
import matplotlib.pyplot as plt

x = np.array([3.600, 1.800, 3.333, 2.283, 4.533, 2.883, 4.700, 3.600, 1.950, 4.350])   # Old Faithful (min)
k = math.ceil(1 + math.log2(len(x)))       # Sturges: Anzahl Klassen
fig, ax = plt.subplots(1, 3, figsize=(12, 3.5))
ax[0].hist(x, bins=k, density=True)        # Histogramm mit Fläche 1 = empirische Dichte
ax[1].boxplot(x, orientation="horizontal")             # Box = Quartile, Strich = Median, Whisker bis 1.5 IQR
xs = np.sort(x); ax[2].step(xs, np.arange(1, len(x) + 1) / len(x), where="post")   # Treppe F_n(x)
print(np.mean(x <= 3.5))                   # F_n(3.5) = Anteil der Daten <= 3.5
plt.show()
