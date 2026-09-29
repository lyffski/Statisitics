# P(a < X <= b) für X ~ N(mu, sigma^2) als Fläche: Rechtecke unter der Dichte
from scipy.stats import norm

mu, sigma = 0, 1                           # Parameter der Normalverteilung #@par
a, b, m = -1, 1, 8                         # Grenzen und Anzahl Rechtecke #@ab
h = (b - a) / m                            # Breite eines Rechtecks #@h
flaeche = 0.0                              # Summe der Rechtecksflächen #@f0
for i in range(1, m + 1):                  # Rechteck Nummer i #@loop
    xm = a + (i - 0.5) * h                 # Mitte des i-ten Rechtecks #@xm
    flaeche += norm.pdf(xm, mu, sigma) * h # Höhe f(xm) mal Breite h #@add
exakt = norm.cdf(b, mu, sigma) - norm.cdf(a, mu, sigma)   # F(b) - F(a) #@ex
print("Rechtecke:", flaeche, " exakt:", exakt)            #@out
