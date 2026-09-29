# Lineare Transformation Y = a + bX: Celsius nach Fahrenheit
import numpy as np
from scipy.stats import norm

mu, sigma = 20, 3                          # X ~ N(20, 3^2) in Grad Celsius
a, b = 32, 1.8                             # Y = 32 + 1.8 X in Grad Fahrenheit
print(a + b * mu, abs(b) * sigma)          # E[Y] = 68, sd(Y) = 5.4
print(norm.sf(77, a + b * mu, abs(b) * sigma))   # P(Y > 77), sf = 1 - cdf
print(1 - norm.cdf((25 - mu) / sigma))     # gleich: P(X > 25) über z = (25 - 20) / 3
x = np.random.default_rng(0).normal(mu, sigma, 100_000); y = a + b * x   # Kontrolle per Simulation
print(y.mean(), y.std(ddof=1))
