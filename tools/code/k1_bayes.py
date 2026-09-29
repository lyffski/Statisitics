# Satz der totalen W'keit und Satz von Bayes für k Ursachen B_1 bis B_k
import numpy as np

prior = np.array([0.5, 0.3, 0.2])          # P(B_i): Gewicht jeder Ursache, Summe 1 #@prior
like = np.array([0.01, 0.02, 0.03])        # P(A | B_i): W'keit der Beobachtung A je Ursache #@like
k = len(prior)                             # Anzahl der Fälle #@k
pfad = np.zeros(k)                         # Pfad-W'keiten P(A ∩ B_i) #@pfad0
PA = 0.0                                   # P(A), wird aufsummiert #@PA0
for i in range(k):                         # jeden Ast des Baums einmal #@l1
    pfad[i] = like[i] * prior[i]           # Multiplikationsregel: P(A | B_i) P(B_i) #@mul
    PA += pfad[i]                          # alle Pfade, die in A enden, aufsummieren #@sum
for i in range(k):                         # jetzt die Bedingung umdrehen #@l2
    post = pfad[i] / PA                    # Bayes: P(B_i | A) = Pfad i / P(A) #@post
    print(f"P(B{i + 1} | A) = {post:.4f}") #@out
# vektorisiert: posterior = like * prior / np.sum(like * prior)
