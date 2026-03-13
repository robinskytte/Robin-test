#!/usr/bin/env python3
"""
Sejlvejr - Vejrprogram til sejlads
Bruger Open-Meteo API (gratis, ingen API-nøgle krævet)
"""

import sys
import math
import urllib.request
import urllib.parse
import json
from datetime import datetime


# ---------- Beaufort skala ----------

BEAUFORT = [
    (0,   0.3,  "Vindstille",     "Ideelt til motorbåd"),
    (1,   1.5,  "Næsten stille",  "Kan sejles, næppe mærkbar vind"),
    (2,   3.3,  "Svag vind",      "Let sejlads, god for begyndere"),
    (3,   5.4,  "Let brise",      "God sejlads, lille krusning"),
    (4,   7.9,  "Moderat brise",  "Udmærket sejlads, bølger op til 1 m"),
    (5,  10.7,  "Frisk brise",    "God sejlads for øvede, bølger 1-2 m"),
    (6,  13.8,  "Stiv kuling",    "Kræver erfaring, rev ind"),
    (7,  17.1,  "Hård kuling",    "Kun for erfarne, fuldt rev"),
    (8,  20.7,  "Storm",          "Undga sejlads hvis muligt"),
    (9,  24.4,  "Stærk storm",    "FARLIGT – bliv i havn"),
    (10, 28.4,  "Fuld storm",     "MEGET FARLIGT"),
    (11, 32.6,  "Orkan nær",      "EKSTREMT FARLIGT"),
    (12, 999.0, "Orkan",          "EKSTREMT FARLIGT"),
]


def beaufort(ms: float) -> tuple[int, str, str]:
    """Returner (beaufort-tal, beskrivelse, anbefaling) for en vindstyrke i m/s."""
    for bf, grænse, navn, råd in BEAUFORT:
        if ms <= grænse:
            return bf, navn, råd
    return 12, "Orkan", "EKSTREMT FARLIGT"


# ---------- Vindretning ----------

RETNINGER = ["N", "NNØ", "NØ", "ØNØ", "Ø", "ØSØ", "SØ", "SSØ",
             "S", "SSV", "SV", "VSV", "V", "VNV", "NV", "NNV"]


def vindretning(grader: float) -> str:
    idx = round(grader / 22.5) % 16
    return RETNINGER[idx]


# ---------- Vejrkodesymboler ----------

VEJR_KODER = {
    0:  ("Klar himmel",         "☀️"),
    1:  ("Mest klar",           "🌤️"),
    2:  ("Delvist skyet",       "⛅"),
    3:  ("Overskyet",           "☁️"),
    45: ("Tåge",                "🌫️"),
    48: ("Rimtåge",             "🌫️"),
    51: ("Let støvregn",        "🌦️"),
    53: ("Moderat støvregn",    "🌦️"),
    55: ("Kraftig støvregn",    "🌧️"),
    61: ("Let regn",            "🌧️"),
    63: ("Moderat regn",        "🌧️"),
    65: ("Kraftig regn",        "🌧️"),
    71: ("Let sne",             "🌨️"),
    73: ("Moderat sne",         "🌨️"),
    75: ("Kraftig sne",         "❄️"),
    80: ("Regnbyger",           "🌦️"),
    81: ("Kraftige regnbyger",  "🌧️"),
    82: ("Voldsomme byger",     "⛈️"),
    95: ("Tordenvejr",          "⛈️"),
    99: ("Kraftigt tordenvejr", "⛈️"),
}


def vejrbeskrivelse(kode: int) -> tuple[str, str]:
    return VEJR_KODER.get(kode, ("Ukendt", "❓"))


# ---------- API kald ----------

def hent_koordinater(bynavn: str) -> tuple[float, float, str]:
    """Brug Open-Meteo geocoding til at finde koordinater."""
    url = (
        "https://geocoding-api.open-meteo.com/v1/search?"
        + urllib.parse.urlencode({"name": bynavn, "count": 1, "language": "da"})
    )
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read())
    if not data.get("results"):
        raise ValueError(f"Fandt ikke stedet: '{bynavn}'")
    r = data["results"][0]
    navn = r.get("name", bynavn)
    land = r.get("country", "")
    return r["latitude"], r["longitude"], f"{navn}, {land}"


def hent_vejr(lat: float, lon: float) -> dict:
    """Hent aktuelle vejrdata og marin forecast fra Open-Meteo."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ",".join([
            "temperature_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "surface_pressure",
            "relative_humidity_2m",
            "visibility",
        ]),
        "hourly": ",".join([
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "wave_height",
            "wave_period",
            "wave_direction",
            "weather_code",
        ]),
        "forecast_days": 2,
        "wind_speed_unit": "ms",
        "timezone": "Europe/Copenhagen",
    }
    url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=10) as resp:
        return json.loads(resp.read())


# ---------- Visning ----------

LINJE = "─" * 60


def farve(tekst: str, kode: str) -> str:
    """Simpel ANSI farve-wrapper (virker i de fleste terminaler)."""
    koder = {"rød": "31", "grøn": "32", "gul": "33", "blå": "34",
             "cyan": "36", "fed": "1", "nul": "0"}
    start = "\033[" + koder.get(kode, "0") + "m"
    slut = "\033[0m"
    return start + tekst + slut


def sejlads_vurdering(bf: int, bølge: float | None) -> tuple[str, str]:
    """Returner (farvekode, samlet anbefaling)."""
    if bf <= 3 and (bølge is None or bølge < 0.5):
        return "grøn", "IDEELLE SEJLFORHOLD"
    if bf <= 5 and (bølge is None or bølge < 1.5):
        return "grøn", "GODE SEJLFORHOLD"
    if bf <= 6 and (bølge is None or bølge < 2.5):
        return "gul",  "ACCEPTABLE SEJLFORHOLD (krav erfaring)"
    if bf <= 7:
        return "rød",  "VANSKELIGE SEJLFORHOLD – overvej at blive i havn"
    return "rød", "FRARÅDER SEJLADS – farlige forhold"


def vis_nuvaerende(data: dict, stednavn: str) -> int:
    """Vis nuværende vejr. Returnerer Beaufort-tal."""
    c = data["current"]
    wind_ms   = c["wind_speed_10m"]
    wind_dir  = c["wind_direction_10m"]
    gusts_ms  = c["wind_gusts_10m"]
    temp      = c["temperature_2m"]
    feels     = c["apparent_temperature"]
    pressure  = c["surface_pressure"]
    humidity  = c["relative_humidity_2m"]
    vis_m     = c.get("visibility", None)
    wcode     = c["weather_code"]

    bf_tal, bf_navn, bf_råd = beaufort(wind_ms)
    vejr_navn, vejr_ikon    = vejrbeskrivelse(wcode)

    print()
    print(farve(LINJE, "blå"))
    print(farve(f"  SEJLVEJR – {stednavn}", "fed"))
    print(farve(f"  {datetime.now().strftime('%d. %B %Y  %H:%M')}", "cyan"))
    print(farve(LINJE, "blå"))

    print(f"\n  {vejr_ikon}  {vejr_navn}")
    print(f"\n  Temperatur  : {temp:.1f} °C  (føles som {feels:.1f} °C)")
    print(f"  Luftfugtighed: {humidity:.0f} %")
    print(f"  Lufttryk    : {pressure:.0f} hPa")
    if vis_m is not None:
        print(f"  Sigtbarhed  : {vis_m/1000:.1f} km")

    print(f"\n  {'─'*30}")
    print(f"  VIND")
    print(f"  {'─'*30}")
    print(f"  Styrke    : {wind_ms:.1f} m/s  ({wind_ms * 1.944:.1f} knob)")
    print(f"  Retning   : {wind_dir:.0f}°  ({vindretning(wind_dir)})")
    print(f"  Vindstød  : {gusts_ms:.1f} m/s  ({gusts_ms * 1.944:.1f} knob)")
    bf_tekst = f"Beaufort {bf_tal}  –  {bf_navn}"
    bf_farve = "grøn" if bf_tal <= 5 else ("gul" if bf_tal <= 6 else "rød")
    print(f"  Beaufort  : {farve(bf_tekst, bf_farve)}")
    print(f"  Råd       : {bf_råd}")

    return bf_tal


def vis_bølger(data: dict) -> float | None:
    """Vis nuværende bølgedata (første time i forecast). Returner bølgehøjde."""
    hourly = data.get("hourly", {})
    if "wave_height" not in hourly:
        return None

    # Find nuværende time-indeks
    tider = hourly.get("time", [])
    nu = datetime.now().strftime("%Y-%m-%dT%H:00")
    idx = 0
    for i, t in enumerate(tider):
        if t >= nu:
            idx = i
            break

    bølge_h   = hourly["wave_height"][idx]
    bølge_p   = hourly.get("wave_period", [None] * (idx + 1))[idx]
    bølge_dir = hourly.get("wave_direction", [None] * (idx + 1))[idx]

    print(f"\n  {'─'*30}")
    print(f"  BØLGER")
    print(f"  {'─'*30}")
    if bølge_h is not None:
        print(f"  Højde     : {bølge_h:.1f} m")
    if bølge_p is not None:
        print(f"  Periode   : {bølge_p:.0f} s")
    if bølge_dir is not None:
        print(f"  Retning   : {bølge_dir:.0f}°  ({vindretning(bølge_dir)})")

    return bølge_h


def vis_forecast(data: dict, timer: int = 12):
    """Vis vejr-forecast for de næste `timer` timer."""
    hourly = data.get("hourly", {})
    tider  = hourly.get("time", [])
    nu     = datetime.now().strftime("%Y-%m-%dT%H:00")

    start = 0
    for i, t in enumerate(tider):
        if t >= nu:
            start = i
            break

    print(f"\n  {'─'*30}")
    print(f"  FORECAST – næste {timer} timer")
    print(f"  {'─'*30}")
    print(f"  {'Tid':<8} {'Vind':>10} {'Stød':>10} {'Retning':>8} {'Bølge':>7}  Bf")

    for i in range(start, min(start + timer, len(tider))):
        t     = tider[i]
        tidsp = datetime.fromisoformat(t).strftime("%a %H:%M")
        ws    = hourly["wind_speed_10m"][i]
        wd    = hourly["wind_direction_10m"][i]
        wg    = hourly["wind_gusts_10m"][i]
        wh    = (hourly["wave_height"][i]
                 if "wave_height" in hourly else None)

        bf_tal, _, _ = beaufort(ws)
        bf_farve = "grøn" if bf_tal <= 5 else ("gul" if bf_tal <= 6 else "rød")

        bølge_str = f"{wh:.1f} m" if wh is not None else "  –  "
        linje = (
            f"  {tidsp:<8} "
            f"{ws:>6.1f} m/s "
            f"{wg:>6.1f} m/s "
            f"{vindretning(wd):>6}   "
            f"{bølge_str:>6}  "
            f"{farve(str(bf_tal), bf_farve)}"
        )
        print(linje)


def vis_samlet_vurdering(bf_tal: int, bølge_h: float | None):
    farvekode, vurdering = sejlads_vurdering(bf_tal, bølge_h)
    print(f"\n  {'─'*30}")
    print(f"  SEJLADS-VURDERING")
    print(f"  {'─'*30}")
    print(f"  {farve(vurdering, farvekode)}")
    print()
    print(farve(LINJE, "blå"))
    print()


# ---------- Hovedprogram ----------

def main():
    # Sted fra kommandolinje eller spørg brugeren
    if len(sys.argv) > 1:
        søg = " ".join(sys.argv[1:])
    else:
        print(farve("\n  SEJLVEJR – Vejrprogram til sejlads", "fed"))
        søg = input("  Indtast havn eller by: ").strip()
        if not søg:
            søg = "København"

    print(f"\n  Henter vejrdata for '{søg}'...")

    try:
        lat, lon, stednavn = hent_koordinater(søg)
        data = hent_vejr(lat, lon)
    except Exception as e:
        print(farve(f"\n  FEJL: {e}", "rød"))
        sys.exit(1)

    bf_tal  = vis_nuvaerende(data, stednavn)
    bølge_h = vis_bølger(data)
    vis_forecast(data, timer=12)
    vis_samlet_vurdering(bf_tal, bølge_h)


if __name__ == "__main__":
    main()
