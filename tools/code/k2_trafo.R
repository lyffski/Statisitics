# Lineare Transformation Y = a + bX: Celsius nach Fahrenheit
mu <- 20; sigma <- 3                       # X ~ N(20, 3^2) in Grad Celsius
a <- 32; b <- 1.8                          # Y = 32 + 1.8 X in Grad Fahrenheit
c(a + b * mu, abs(b) * sigma)              # E[Y] = 68, sd(Y) = 5.4
1 - pnorm(77, a + b * mu, abs(b) * sigma)  # P(Y > 77) direkt in Fahrenheit
1 - pnorm((25 - mu) / sigma)               # gleich: P(X > 25) über z = (25 - 20) / 3
x <- rnorm(1e5, mu, sigma); y <- a + b * x # Kontrolle per Simulation
c(mean(y), sd(y))
