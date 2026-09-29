# Satz der totalen W'keit und Satz von Bayes für k Ursachen B_1 bis B_k
prior <- c(0.5, 0.3, 0.2)                  # P(B_i): Gewicht jeder Ursache, Summe 1 #@prior
like <- c(0.01, 0.02, 0.03)                # P(A | B_i): W'keit der Beobachtung A je Ursache #@like
k <- length(prior)                         # Anzahl der Fälle #@k
pfad <- numeric(k)                         # Pfad-W'keiten P(A ∩ B_i) #@pfad0
PA <- 0                                    # P(A), wird aufsummiert #@PA0
for (i in 1:k) {                           # jeden Ast des Baums einmal #@l1
  pfad[i] <- like[i] * prior[i]            # Multiplikationsregel: P(A | B_i) P(B_i) #@mul
  PA <- PA + pfad[i]                       # alle Pfade, die in A enden, aufsummieren #@sum
}
for (i in 1:k) {                           # jetzt die Bedingung umdrehen #@l2
  post <- pfad[i] / PA                     # Bayes: P(B_i | A) = Pfad i / P(A) #@post
  cat("P(B", i, "| A) =", round(post, 4), "\n")   #@out
}
# vektorisiert: posterior <- like * prior / sum(like * prior)
