import { DawaAutocompleteResult, DawaAddress } from './types';

const DAWA_BASE = 'https://api.dataforsyningen.dk';

export async function searchAddresses(query: string): Promise<DawaAutocompleteResult[]> {
  if (!query || query.length < 2) return [];
  const res = await fetch(
    `${DAWA_BASE}/adresser/autocomplete?q=${encodeURIComponent(query)}&per_side=6`
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getAddress(id: string): Promise<DawaAddress | null> {
  const res = await fetch(`${DAWA_BASE}/adresser/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}
