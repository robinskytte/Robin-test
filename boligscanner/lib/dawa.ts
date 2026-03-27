import { DawaAutocompleteResult, DawaAddress } from './types';

const DAWA_BASE = 'https://api.dataforsyningen.dk';

export async function searchAddresses(query: string): Promise<DawaAutocompleteResult[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `${DAWA_BASE}/adresser/autocomplete?q=${encodeURIComponent(query)}&per_side=6`
    );
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('DAWA autocomplete error:', err);
    return [];
  }
}

export async function getAddress(id: string): Promise<DawaAddress | null> {
  try {
    // Try /adresser/{id} first
    const res = await fetch(`${DAWA_BASE}/adresser/${encodeURIComponent(id)}`);
    if (!res.ok) {
      console.warn(`DAWA /adresser/${id} returned ${res.status}`);
      return null;
    }
    const data = await res.json();
    console.log('DAWA address response:', data);

    // Verify it has the expected structure
    if (data && data.adgangsadresse && data.adgangsadresse.koordinater) {
      return data;
    }

    console.warn('DAWA address missing koordinater:', {
      hasAdgangsadresse: !!data?.adgangsadresse,
      hasKoordinater: !!data?.adgangsadresse?.koordinater,
      koordinater: data?.adgangsadresse?.koordinater,
    });

    return data || null;
  } catch (err) {
    console.error('DAWA fetch error:', err);
    return null;
  }
}

// Fallback: estimate coordinates from postal code
const POSTAL_CODE_COORDS: Record<string, [number, number]> = {
  '1000': [12.5652, 55.6761], // København K
  '1100': [12.5651, 55.6711], // København Ø
  '1200': [12.5524, 55.6837], // København V
  '1300': [12.5734, 55.6582], // København S
  '1400': [12.5858, 55.6669], // København NV
  '1500': [12.5510, 55.6761], // København V
  '2100': [12.6150, 55.7191], // København NØ
  '2200': [12.4943, 55.6542], // København Nørrebro
  '8000': [10.2038, 56.1629], // Aarhus
  '5000': [10.3875, 55.4037], // Odense
  '9000': [10.2270, 57.0488], // Aalborg
};

export function estimateCoordinatesFromPostalCode(postalCode: string): [number, number] {
  if (POSTAL_CODE_COORDS[postalCode]) {
    return POSTAL_CODE_COORDS[postalCode];
  }
  // Default to Copenhagen if not found
  return [12.5651, 55.6761];
}
