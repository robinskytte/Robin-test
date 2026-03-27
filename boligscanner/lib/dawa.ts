import { DawaAutocompleteResult } from './types';

const DAWA_BASE = 'https://api.dataforsyningen.dk';

export async function searchAddresses(query: string): Promise<DawaAutocompleteResult[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `${DAWA_BASE}/adresser/autocomplete?q=${encodeURIComponent(query)}&per_side=6`
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Extract coordinates from any known DAWA response format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCoords(data: any): [number, number] | null {
  // Format 1: adgangsadresse.koordinater = [lng, lat]
  const k = data?.adgangsadresse?.koordinater;
  if (Array.isArray(k) && k.length >= 2) return [k[0], k[1]];

  // Format 2: adgangsadresse.geometri.coordinates = [lng, lat]
  const g = data?.adgangsadresse?.geometri?.coordinates;
  if (Array.isArray(g) && g.length >= 2) return [g[0], g[1]];

  // Format 3: top-level koordinater
  const k2 = data?.koordinater;
  if (Array.isArray(k2) && k2.length >= 2) return [k2[0], k2[1]];

  // Format 4: top-level geometri
  const g2 = data?.geometri?.coordinates;
  if (Array.isArray(g2) && g2.length >= 2) return [g2[0], g2[1]];

  return null;
}

export interface AddressResult {
  id: string;
  adressebetegnelse: string;
  postalCode: string;
  postalName: string;
  municipalityCode: string;
  municipalityName: string;
  coords: [number, number] | null; // [lng, lat]
}

export async function getAddress(id: string): Promise<AddressResult | null> {
  try {
    const res = await fetch(`${DAWA_BASE}/adresser/${encodeURIComponent(id)}`);
    if (!res.ok) {
      console.error('DAWA /adresser/ returned', res.status);
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    console.log('DAWA raw JSON:', JSON.stringify(data).slice(0, 500));

    const coords = extractCoords(data);
    if (!coords) {
      console.warn('No coords found, keys:', Object.keys(data || {}));
    }

    // Try to get adgangsadresse details (might be nested object or just an ID string)
    const adr = data?.adgangsadresse;
    const postalCode = (typeof adr === 'object' ? adr?.postnummer?.nr : null)
      ?? data?.postnr
      ?? '1000';
    const postalName = (typeof adr === 'object' ? adr?.postnummer?.navn : null)
      ?? data?.postnrnavn
      ?? '';
    const municipalityCode = (typeof adr === 'object' ? adr?.kommune?.kode : null)
      ?? data?.kommunekode
      ?? '0101';
    const municipalityName = (typeof adr === 'object' ? adr?.kommune?.navn : null)
      ?? data?.kommunenavn
      ?? 'København';

    return {
      id: data?.id ?? id,
      adressebetegnelse: data?.adressebetegnelse ?? data?.betegnelse ?? id,
      postalCode,
      postalName,
      municipalityCode,
      municipalityName,
      coords,
    };
  } catch (err) {
    console.error('DAWA fetch exception:', err);
    return null;
  }
}

// Postal code → [lng, lat] centroids (ca. 100 most common Danish postal codes)
const POSTAL_COORDS: Record<string, [number, number]> = {
  '1000': [12.5681, 55.6784], '1050': [12.5760, 55.6752], '1100': [12.5826, 55.6786],
  '1200': [12.5533, 55.6871], '1300': [12.5550, 55.6691], '1400': [12.5699, 55.6595],
  '1500': [12.5481, 55.6784], '1600': [12.5261, 55.6815], '1700': [12.5191, 55.6891],
  '1800': [12.5062, 55.6951], '1900': [12.5042, 55.6981], '2000': [12.5261, 55.7041],
  '2100': [12.6151, 55.7191], '2200': [12.5511, 55.6981], '2300': [12.6011, 55.6611],
  '2400': [12.5081, 55.7141], '2500': [12.4681, 55.7011], '2600': [12.4551, 55.6591],
  '2605': [12.4351, 55.6431], '2610': [12.4511, 55.6391], '2620': [12.4141, 55.6511],
  '2630': [12.4211, 55.6291], '2640': [12.4581, 55.6201], '2650': [12.4701, 55.6301],
  '2660': [12.4121, 55.6451], '2665': [12.4251, 55.6081], '2670': [12.4361, 55.5981],
  '2680': [12.4611, 55.5881], '2690': [12.4761, 55.5971], '2700': [12.4391, 55.7141],
  '2720': [12.4101, 55.7281], '2730': [12.3921, 55.7161], '2740': [12.3761, 55.7281],
  '2750': [12.3681, 55.7441], '2760': [12.3831, 55.7361], '2765': [12.4041, 55.7411],
  '2770': [12.4271, 55.7421], '2791': [12.3781, 55.7041], '2800': [12.4941, 55.7771],
  '2820': [12.4581, 55.7761], '2830': [12.5031, 55.7941], '2840': [12.4891, 55.8101],
  '2850': [12.4351, 55.8001], '2860': [12.4011, 55.7761], '2870': [12.4081, 55.7561],
  '2880': [12.4051, 55.7661], '2900': [12.5751, 55.7761], '2920': [12.5781, 55.7881],
  '2930': [12.6011, 55.8001], '2942': [12.5401, 55.8101], '2950': [12.5701, 55.8201],
  '2960': [12.5901, 55.8401], '2970': [12.6101, 55.8501], '2980': [12.5511, 55.8251],
  '2990': [12.5611, 55.8451], '3000': [12.5841, 55.9611], '3050': [12.4911, 55.9491],
  '3060': [12.4681, 55.9781], '3070': [12.5141, 56.0001], '3100': [12.5471, 56.0591],
  '3200': [12.4341, 55.9081], '3400': [12.3351, 55.9781], '3460': [12.3571, 55.9171],
  '3520': [12.3701, 55.8931], '4000': [12.0871, 55.6411], '4100': [11.7771, 55.6281],
  '4200': [11.6141, 55.4661], '4300': [11.7581, 55.5781], '4400': [11.3781, 55.4261],
  '4600': [11.9571, 55.3261], '4700': [11.8781, 55.2561], '4800': [11.8951, 54.7621],
  '4900': [12.0921, 54.9081], '5000': [10.4031, 55.3961], '5200': [10.5081, 55.4151],
  '5230': [10.4651, 55.4281], '5250': [10.4021, 55.4391], '5260': [10.4341, 55.3791],
  '5270': [10.4451, 55.3671], '5290': [10.4781, 55.3951], '5300': [10.6081, 55.4881],
  '5471': [10.0771, 55.5581], '5500': [10.2221, 55.4881], '5600': [9.9041, 55.3481],
  '5700': [10.2421, 55.0741], '5800': [10.5601, 55.0661], '5900': [10.7721, 55.0661],
  '6000': [9.7441, 55.4981], '6100': [9.5041, 55.3281], '6200': [9.4091, 55.1291],
  '6400': [9.8001, 55.0951], '6700': [8.4521, 55.4821], '6800': [8.4491, 55.2141],
  '6900': [8.6281, 55.5871], '7000': [8.9141, 56.0451], '7100': [9.5321, 55.8741],
  '7400': [9.6671, 56.3451], '7500': [8.7281, 56.4561], '7600': [8.4751, 56.5041],
  '7700': [8.2721, 56.7881], '7800': [8.7691, 56.8881], '7900': [8.5091, 56.9181],
  '8000': [10.2041, 56.1531], '8200': [10.1561, 56.1961], '8210': [10.1881, 56.2041],
  '8220': [10.1321, 56.1721], '8230': [10.1681, 56.1251], '8240': [10.1501, 56.1381],
  '8250': [10.1661, 56.0831], '8260': [10.1341, 56.1281], '8270': [10.2181, 56.0781],
  '8300': [10.3371, 56.1271], '8400': [10.6041, 56.4611], '8600': [9.8041, 56.1561],
  '8700': [9.5341, 56.0441], '8800': [9.4031, 56.4611], '8900': [9.8681, 56.5991],
  '9000': [9.9231, 57.0491], '9200': [9.9121, 57.0351], '9210': [9.9541, 57.0441],
  '9220': [9.9681, 57.0231], '9230': [9.8941, 56.9811], '9240': [9.9141, 57.0111],
  '9400': [9.8771, 57.2801], '9500': [9.5081, 57.1561], '9600': [9.8621, 56.7581],
  '9700': [9.5101, 56.9181], '9800': [9.6461, 57.5351], '9900': [9.7811, 57.7251],
};

export function estimateCoordinatesFromPostalCode(postalCode: string): [number, number] {
  // Try exact match
  if (POSTAL_COORDS[postalCode]) return POSTAL_COORDS[postalCode];

  // Try rounding to nearest thousand (e.g. 2450 → 2400)
  const rounded = String(Math.floor(parseInt(postalCode) / 100) * 100);
  if (POSTAL_COORDS[rounded]) return POSTAL_COORDS[rounded];

  // Default: central Denmark (Vejle-area)
  return [9.5361, 55.7092];
}
