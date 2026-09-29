# Momentenmethode und Maximum-Likelihood im Vergleich, plus QQ-Plot
x <- c(1.2, 3.9, 2.5, 4.4, 0.8)            # Daten, Modell Uni(0, theta)
theta_mom <- 2 * mean(x)                   # Momente: E[X] = theta/2  ->  theta = 2 * Mittel
theta_ml <- max(x)                         # ML: L(theta) = theta^(-n) für theta >= max, fällt -> Maximum
c(theta_mom, theta_ml)                     # 5.12 und 4.4
t <- c(1.2, 3.4, 10.6, 5.8, 0.9)           # Lebensdauern, Modell Exp(lambda)
1 / mean(t)                                # ML- und Momentenschätzer: 0.228
y <- c(3.1, 4.8, 2.2, 5.9, 4.0)            # Normalplot: Punkte auf einer Geraden?
qqnorm(y); qqline(y)
