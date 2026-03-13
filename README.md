# Sejlvejr

Vejrprogram til sejlads skrevet i Python. Viser vindforhold, bølger,
Beaufort-skala og sejlads-anbefalinger.

## Funktioner

- Aktuelle vindforhold (styrke, retning, vindstød) i m/s og knob
- Beaufort-skala med dansk beskrivelse
- Bølgehøjde og -periode (marine data)
- Lufttryk, temperatur og sigtbarhed
- 12-timers forecast
- Trafiklysvurdering af sejladsforholdene

## Brug

```bash
# Interaktiv (spørger om sted)
python3 vejr.py

# Med stedsnavn som argument
python3 vejr.py København
python3 vejr.py Aarhus
python3 vejr.py Skagen
python3 vejr.py Bornholm
```

## Krav

Kun Python 3.10+ – ingen eksterne pakker.
Data fra [Open-Meteo](https://open-meteo.com/) (gratis, ingen API-nøgle).
