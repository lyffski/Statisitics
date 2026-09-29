# t-Test für den Erwartungswert, Schritt für Schritt
x <- c(5.1, 4.9, 5.6, 5.8, 5.3, 5.5, 5.2, 5.4)   # Messwerte #@data
mu0 <- 5; alpha <- 0.05                    # Sollwert und Niveau, zweiseitig #@par
n <- length(x)                             # Stichprobenumfang #@n
xbar <- mean(x); s <- sd(x)                # Mittel und Standardabweichung (n - 1) #@ms
se <- s / sqrt(n)                          # geschätzter Standardfehler #@se
t <- (xbar - mu0) / se                     # Teststatistik: Abweichung in Standardfehlern #@t
krit <- qt(1 - alpha / 2, df = n - 1)      # kritischer Wert t_{n-1, 1-alpha/2} #@krit
p <- 2 * (1 - pt(abs(t), df = n - 1))      # zweiseitiger P-Wert #@p
vi <- xbar + c(-1, 1) * krit * se          # Vertrauensintervall (Dualität) #@vi
cat("t =", t, " krit =", krit, " p =", p, " verwerfen:", abs(t) >= krit, "\n")   #@out
t.test(x, mu = mu0)                        # eingebaut: gleiche Zahlen
