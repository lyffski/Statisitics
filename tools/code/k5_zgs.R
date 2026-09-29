# Zentraler Grenzwertsatz per Simulation: Mittel von n Exponential-Werten
set.seed(1)
n <- 30; m <- 10000                        # Stichprobenumfang und Anzahl Wiederholungen
mittel <- replicate(m, mean(rexp(n, rate = 1)))   # m Stichprobenmittel, Exp(1): mu = 1, sigma = 1
c(mean(mittel), sd(mittel), 1 / sqrt(n))   # E = 1 und sd = sigma / sqrt(n)
hist(mittel, breaks = 50, freq = FALSE)    # fast eine Glocke, obwohl Exp schief ist
curve(dnorm(x, 1, 1 / sqrt(n)), add = TRUE, lwd = 2)   # ZGS-Näherung N(mu, sigma^2 / n)
laufend <- cumsum(sample(1:6, 1000, replace = TRUE)) / (1:1000)   # GGZ: laufendes Mittel
plot(laufend, type = "l"); abline(h = 3.5, col = "red")
