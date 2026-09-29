# Standardfehler und Vertrauensintervall für mu bei bekanntem sigma
xbar <- 21.3; sigma <- 4; n <- 16          # Mittel, bekannte Streuung, Umfang #@par
alpha <- 0.05                              # 1 - Vertrauensniveau #@alpha
se <- sigma / sqrt(n)                      # Standardfehler des Mittels #@se
z <- qnorm(1 - alpha / 2)                  # Quantil z_{0.975} = 1.96 #@z
lo <- xbar - z * se; hi <- xbar + z * se   # Schätzung plus/minus z mal SE #@ci
cat("SE =", se, " VI = [", lo, ",", hi, "]\n")   #@out
n_noetig <- ceiling((z * sigma / 0.5)^2)   # n für halbe Breite 0.5 #@n
# Überdeckung per Simulation: Anteil der Intervalle, die mu treffen
mean(replicate(10000, abs(mean(rnorm(n, 0, sigma))) <= z * se))   # etwa 0.95
