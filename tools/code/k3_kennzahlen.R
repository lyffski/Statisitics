# Kennzahlen einer Stichprobe von Hand: Mittel, Varianz, Quantile wie im Skript
x <- c(12, 15, 11, 18, 14, 13, 30, 16)      # Daten x_1 bis x_n #@data
n <- length(x)                             # Stichprobenumfang #@n
summe <- 0                                 # Summe aller Werte #@s0
for (i in 1:n) summe <- summe + x[i]       # aufsummieren #@sum
xbar <- summe / n                          # arithmetisches Mittel #@mean
q <- 0                                     # Summe der quadrierten Abweichungen #@q0
for (i in 1:n) q <- q + (x[i] - xbar)^2    # Abstand zum Mittel, quadriert #@sq
s2 <- q / (n - 1)                          # empirische Varianz mit Nenner n - 1 #@s2
s <- sqrt(s2)                              # empirische Standardabweichung #@s
xs <- sort(x)                              # geordnete Werte x_(1) <= ... <= x_(n) #@sort
quant <- function(alpha) {                 # empirisches Quantil nach Skript #@qf
  k <- alpha * n                           # Position alpha * n #@pos
  if (k == round(k)) (xs[k] + xs[k + 1]) / 2 else xs[ceiling(k)]   # ganzzahlig: mitteln #@case
}
c(xbar, s2, s, quant(0.25), quant(0.5), quant(0.75))   #@out
# eingebaut: mean(x); var(x); sd(x); quantile(x, c(.25, .5, .75), type = 2)  (type 2 = Skript!)
