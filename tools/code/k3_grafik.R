# Histogramm, Boxplot und empirische Verteilungsfunktion
x <- c(3.600, 1.800, 3.333, 2.283, 4.533, 2.883, 4.700, 3.600, 1.950, 4.350)   # Old Faithful (min)
k <- ceiling(1 + log2(length(x)))          # Sturges: Anzahl Klassen
hist(x, breaks = k, freq = FALSE)          # Histogramm mit Fläche 1 = empirische Dichte
boxplot(x, horizontal = TRUE)              # Box = Quartile, Strich = Median, Whisker bis 1.5 IQR
plot(ecdf(x))                              # Treppe F_n(x)
Fn <- ecdf(x); Fn(3.5)                     # Anteil der Daten <= 3.5
boxplot.stats(x)$out                       # Ausreißer nach der 1.5-IQR-Regel
