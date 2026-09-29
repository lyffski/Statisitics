# Bedingte W'keit durch Abzählen: der Grundraum schrumpft auf B
def A(a, b): return a + b >= 10            # Ereignis A: Augensumme mindestens 10 #@defA
def B(a, b): return a == 6                 # Bedingung B: erster Würfel zeigt 6 #@defB
nB = nAB = 0                               # |B| = neuer Grundraum, |A ∩ B| #@init
for a in range(1, 7):                      # erster Würfel #@la
    for b in range(1, 7):                  # zweiter Würfel #@lb
        if not B(a, b): continue           # nicht in B: fällt aus dem neuen Grundraum #@skip
        nB += 1                            # (a,b) liegt im neuen Grundraum B #@nB
        if A(a, b): nAB += 1               # und liegt zusätzlich in A #@nAB
P = nAB / nB                               # P(A | B) = |A ∩ B| / |B| #@P
print(f"P(A|B) = {nAB}/{nB} = {P}")        #@out
