# Bedingte W'keit durch Abzählen: der Grundraum schrumpft auf B
A <- function(a, b) a + b >= 10            # Ereignis A: Augensumme mindestens 10 #@defA
B <- function(a, b) a == 6                 # Bedingung B: erster Würfel zeigt 6 #@defB
nB <- 0; nAB <- 0                          # |B| = neuer Grundraum, |A ∩ B| #@init
for (a in 1:6) {                           # erster Würfel #@la
  for (b in 1:6) {                         # zweiter Würfel #@lb
    if (!B(a, b)) next                     # nicht in B: fällt aus dem neuen Grundraum #@skip
    nB <- nB + 1                           # (a,b) liegt im neuen Grundraum B #@nB
    if (A(a, b)) nAB <- nAB + 1            # und liegt zusätzlich in A #@nAB
  }
}
P <- nAB / nB                              # P(A | B) = |A ∩ B| / |B| #@P
cat("P(A|B) =", nAB, "/", nB, "=", P, "\n")   #@out
