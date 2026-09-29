# Relative Häufigkeit f_n(A) für A = "Kopf" Wurf für Wurf mitrechnen
import numpy as np
import matplotlib.pyplot as plt

wuerfe = list("KZKKZZKZKK")                # beobachtete Würfe #@data
n = len(wuerfe)                            # Anzahl Wiederholungen n #@n
treffer = 0                                # wie oft ist A bisher eingetreten? #@t0
for i in range(1, n + 1):                  # Wurf Nummer i läuft von 1 bis n #@loop
    if wuerfe[i - 1] == "K":               # A tritt ein (Python zählt ab 0) #@if
        treffer += 1                       # Zähler erhöhen
    f = treffer / i                        # relative Häufigkeit f_i(A) = treffer / i #@f
    print(f"i = {i}  f = {f:.4f}")         # Zwischenstand ausgeben #@out
# dasselbe vektorisiert in einer Zeile:
f_alle = np.cumsum(np.array(wuerfe) == "K") / np.arange(1, n + 1)   # alle f_1 bis f_n #@vec
plt.plot(f_alle, "o-"); plt.axhline(0.5, ls="--"); plt.ylim(0, 1); plt.show()   # Kurve und wahres P(A)
