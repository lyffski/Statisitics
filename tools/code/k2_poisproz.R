# Poissonprozess simulieren: exponentielle Zwischenzeiten, Poisson-Anzahl
set.seed(1)                                # reproduzierbarer Zufall
lambda <- 3; t_end <- 2                    # Rate pro Stunde, Beobachtungsdauer in Stunden
zeiten <- cumsum(rexp(100, rate = lambda)) # Ankunftszeiten = aufsummierte Zwischenzeiten
N <- sum(zeiten <= t_end)                  # Anzahl Ereignisse in [0, t_end]
Ns <- replicate(10000, sum(cumsum(rexp(100, lambda)) <= t_end))   # 10000 Wiederholungen
c(mean(Ns), var(Ns))                       # beide nahe lambda * t_end = 6
c(mean(Ns == 4), dpois(4, lambda * t_end)) # Simulation gegen Formel P(N = 4)
mean(rexp(10000, lambda) > 0.5); pexp(0.5, lambda, lower.tail = FALSE)   # P(erste Wartezeit > 30 min)
