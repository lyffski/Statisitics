# Laplace-Modell: zwei faire Würfel, A = "Augensumme >= k"
k <- 10                                    # Schwelle des Ereignisses A #@k
moeglich <- 0; guenstig <- 0               # Zähler für |Omega| und |A| #@init
for (a in 1:6) {                           # Augenzahl des ersten Würfels #@la
  for (b in 1:6) {                         # Augenzahl des zweiten Würfels #@lb
    moeglich <- moeglich + 1               # jedes Paar (a,b) ist ein Elementarereignis #@m
    if (a + b >= k) guenstig <- guenstig + 1   # liegt (a,b) in A? dann günstig #@g
  }
}
P <- guenstig / moeglich                   # Laplace: P(A) = |A| / |Omega| #@P
cat(guenstig, "/", moeglich, "=", P, "\n") #@out
# dasselbe vektorisiert: alle 36 Paare als Tabelle
Om <- expand.grid(a = 1:6, b = 1:6)        # Grundraum als Datentabelle
mean(Om$a + Om$b >= k)                     # Anteil günstiger Zeilen = P(A)
