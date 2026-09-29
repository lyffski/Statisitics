# Laplace-Modell: zwei faire Würfel, A = "Augensumme >= k"
import itertools
import numpy as np

k = 10                                     # Schwelle des Ereignisses A #@k
moeglich, guenstig = 0, 0                  # Zähler für |Omega| und |A| #@init
for a in range(1, 7):                      # Augenzahl des ersten Würfels #@la
    for b in range(1, 7):                  # Augenzahl des zweiten Würfels #@lb
        moeglich += 1                      # jedes Paar (a,b) ist ein Elementarereignis #@m
        if a + b >= k:                     # liegt (a,b) in A? #@g
            guenstig += 1                  # dann ist es günstig
P = guenstig / moeglich                    # Laplace: P(A) = |A| / |Omega| #@P
print(guenstig, "/", moeglich, "=", P)     #@out
# dasselbe vektorisiert: alle 36 Paare als Array
Om = np.array(list(itertools.product(range(1, 7), repeat=2)))   # Grundraum, 36 Zeilen
print(np.mean(Om.sum(axis=1) >= k))        # Anteil günstiger Zeilen = P(A)
