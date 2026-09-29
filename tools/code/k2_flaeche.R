# P(a < X <= b) für X ~ N(mu, sigma^2) als Fläche: Rechtecke unter der Dichte
mu <- 0; sigma <- 1                        # Parameter der Normalverteilung #@par
a <- -1; b <- 1; m <- 8                    # Grenzen und Anzahl Rechtecke #@ab
h <- (b - a) / m                           # Breite eines Rechtecks #@h
flaeche <- 0                               # Summe der Rechtecksflächen #@f0
for (i in 1:m) {                           # Rechteck Nummer i #@loop
  xm <- a + (i - 0.5) * h                  # Mitte des i-ten Rechtecks #@xm
  flaeche <- flaeche + dnorm(xm, mu, sigma) * h    # Höhe f(xm) mal Breite h #@add
}
exakt <- pnorm(b, mu, sigma) - pnorm(a, mu, sigma)   # F(b) - F(a) #@ex
cat("Rechtecke:", flaeche, " exakt:", exakt, "\n")   #@out
