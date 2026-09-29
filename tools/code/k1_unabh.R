# Unabhängigkeit prüfen: zwei faire Würfel, alle 36 Paare abzählen
A <- function(a, b) a %% 2 == 0            # Ereignis A: erster Würfel gerade #@defA
B <- function(a, b) a + b == 7             # Ereignis B: Augensumme 7 #@defB
nA <- 0; nB <- 0; nAB <- 0                 # Zähler |A|, |B| und |A ∩ B| #@init
for (a in 1:6) {                           # erster Würfel #@la
  for (b in 1:6) {                         # zweiter Würfel: 36 gleich wahrscheinliche Paare #@lb
    if (A(a, b)) nA <- nA + 1              # Paar liegt in A #@cA
    if (B(a, b)) nB <- nB + 1              # Paar liegt in B #@cB
    if (A(a, b) && B(a, b)) nAB <- nAB + 1 # Paar liegt in A und in B #@cAB
  }
}
pA <- nA / 36; pB <- nB / 36; pAB <- nAB / 36    # Laplace: P(A), P(B), P(A ∩ B) #@p
unabh <- isTRUE(all.equal(pAB, pA * pB))   # Produktformel P(A ∩ B) = P(A) P(B)? #@test
cat(pAB, "vs", pA * pB, if (unabh) "unabhängig" else "abhängig", "\n")   #@out
