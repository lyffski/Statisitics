# Unabhängigkeit prüfen: zwei faire Würfel, alle 36 Paare abzählen
import math

def A(a, b): return a % 2 == 0             # Ereignis A: erster Würfel gerade #@defA
def B(a, b): return a + b == 7             # Ereignis B: Augensumme 7 #@defB
nA = nB = nAB = 0                          # Zähler |A|, |B| und |A ∩ B| #@init
for a in range(1, 7):                      # erster Würfel #@la
    for b in range(1, 7):                  # zweiter Würfel: 36 gleich wahrscheinliche Paare #@lb
        if A(a, b): nA += 1                # Paar liegt in A #@cA
        if B(a, b): nB += 1                # Paar liegt in B #@cB
        if A(a, b) and B(a, b): nAB += 1   # Paar liegt in A und in B #@cAB
pA, pB, pAB = nA / 36, nB / 36, nAB / 36   # Laplace: P(A), P(B), P(A ∩ B) #@p
unabh = math.isclose(pAB, pA * pB)         # Produktformel P(A ∩ B) = P(A) P(B)? #@test
print(pAB, "vs", pA * pB, "unabhängig" if unabh else "abhängig")   #@out
