# Erwartungswert und Varianz aus einer Wahrscheinlichkeitsfunktion
import numpy as np

x = np.array([10, 2, -3])                  # mögliche Werte x_k (Gewinn in Euro) #@x
p = np.array([0.1, 0.3, 0.6])              # Wahrscheinlichkeiten p(x_k) #@p
assert abs(p.sum() - 1) < 1e-12            # Kontrolle: alle p zusammen ergeben 1 #@chk
EX, EX2 = 0.0, 0.0                         # Summen für E[X] und E[X^2] #@init
for k in range(len(x)):                    # jeden möglichen Wert einmal #@loop
    EX += x[k] * p[k]                      # Wert mal Wahrscheinlichkeit aufsummieren #@ex
    EX2 += x[k] ** 2 * p[k]                # Quadrat mal Wahrscheinlichkeit #@ex2
VarX = EX2 - EX ** 2                       # Verschiebungssatz: E[X^2] - E[X]^2 #@var
sdX = np.sqrt(VarX)                        # Standardabweichung, gleiche Einheit wie X #@sd
print(f"E = {EX:.4f}  Var = {VarX:.4f}  sd = {sdX:.4f}")   #@out
# kurz und vektorisiert:
print(np.sum(x * p), np.sum((x - np.sum(x * p)) ** 2 * p))   # E[X] und Var(X) über die Definition
