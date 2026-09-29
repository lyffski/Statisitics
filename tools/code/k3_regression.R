# Einfache lineare Regression mit der Methode der kleinsten Quadrate
x <- c(1, 2, 3, 4, 5)                      # erklärende Variable #@x
y <- c(2, 4, 5, 4, 5)                      # Zielgröße #@y
mx <- mean(x); my <- mean(y)               # Schwerpunkt der Punktwolke #@m
Sxy <- sum((x - mx) * (y - my))            # Summe der Kreuzprodukte #@sxy
Sxx <- sum((x - mx)^2)                     # Summe der Quadrate in x #@sxx
b <- Sxy / Sxx                             # Steigung #@b
a <- my - b * mx                           # Achsenabschnitt: Gerade geht durch (mx, my) #@a
yhat <- a + b * x                          # vorhergesagte Werte auf der Geraden #@yhat
res <- y - yhat                            # Residuen: Abstand senkrecht zur x-Achse #@res
R2 <- 1 - sum(res^2) / sum((y - my)^2)     # Bestimmtheitsmaß #@R2
cat("y =", a, "+", b, "x   R^2 =", R2, "\n")   #@out
fit <- lm(y ~ x); coef(fit); summary(fit)$r.squared   # eingebaut
plot(x, y); abline(fit)                    # Punktwolke mit Ausgleichsgerade
