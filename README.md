# Sejlvejr ⚓

Vejrprogram til sejlads. Viser vindforhold, bølger, Beaufort-skala og sejlads-anbefalinger.

## Web-app (anbefalet)

Åbn `index.html` i en browser – eller host den gratis på **GitHub Pages**:

1. Gå til **Settings → Pages** i dit GitHub repository
2. Vælg **Deploy from branch → main → / (root)**
3. Din app er live på `https://<brugernavn>.github.io/<repo-navn>/`

Virker på PC, telefon og tablet – ingen installation.

## Funktioner

- Søg på havn eller by (f.eks. Skagen, Aarhus, Rønne)
- Aktuelle vindforhold i m/s og knob
- Beaufort-skala med dansk beskrivelse
- Vindstød og retning
- Bølgehøjde og -periode (marine data)
- Lufttryk, temperatur og sigtbarhed
- 12-timers forecast
- Grøn/gul/rød sejlads-vurdering

Data fra [Open-Meteo](https://open-meteo.com/) – gratis, ingen API-nøgle.

## Kommandolinje (alternativ)

```bash
python3 vejr.py Skagen
```

Kræver Python 3.10+.
