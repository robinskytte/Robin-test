const STATBANK_BASE = 'https://api.statbank.dk/v1';

interface StatBankVariable {
  code: string;
  values: string[];
}

async function fetchStatBank(table: string, variables: StatBankVariable[]) {
  const res = await fetch(`${STATBANK_BASE}/data/${table}/JSONSTAT`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      table,
      format: 'JSONSTAT',
      variables,
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

// Parse JSON-STAT format into simple key-value pairs
function parseJsonStat(data: Record<string, unknown>): { labels: string[]; values: number[] } {
  try {
    const dataset = data.dataset || data;
    const ds = dataset as Record<string, unknown>;
    const dimensionObj = ds.dimension as Record<string, unknown>;
    const valueArr = ds.value as number[];

    // Get the time dimension labels
    const dims = dimensionObj.id as string[];
    const timeDim = dims[dims.length - 1];
    const timeDimData = dimensionObj[timeDim] as Record<string, unknown>;
    const category = timeDimData.category as Record<string, unknown>;
    const labelObj = category.label as Record<string, string>;
    const labels = Object.values(labelObj);
    return { labels, values: valueArr };
  } catch {
    return { labels: [], values: [] };
  }
}

// Municipality code mapping (partial - most common)
const MUNICIPALITY_CODES: Record<string, string> = {
  'København': '101', 'Frederiksberg': '147', 'Aarhus': '751',
  'Odense': '461', 'Aalborg': '851', 'Esbjerg': '561',
  'Randers': '730', 'Kolding': '621', 'Horsens': '615',
  'Vejle': '630', 'Roskilde': '265', 'Herning': '657',
  'Silkeborg': '740', 'Næstved': '370', 'Fredericia': '607',
  'Viborg': '791', 'Køge': '259', 'Holstebro': '661',
  'Slagelse': '330', 'Helsingør': '217', 'Hillerød': '219',
  'Sønderborg': '540', 'Holbæk': '316', 'Svendborg': '479',
  'Hjørring': '860', 'Ringsted': '329', 'Skanderborg': '746',
  'Skive': '779', 'Lyngby-Taarbæk': '173', 'Gentofte': '157',
  'Gladsaxe': '159', 'Hvidovre': '167', 'Ballerup': '151',
  'Rudersdal': '230', 'Greve': '253', 'Høje-Taastrup': '169',
  'Albertslund': '165', 'Brøndby': '153', 'Ishøj': '183',
  'Tårnby': '185', 'Vallensbæk': '187', 'Furesø': '190',
  'Frederikssund': '250', 'Lejre': '350', 'Solrød': '269',
  'Kalundborg': '326', 'Odsherred': '306', 'Sorø': '340',
  'Ringkøbing-Skjern': '760', 'Ikast-Brande': '756',
  'Hedensted': '766', 'Billund': '530', 'Nyborg': '450',
  'Faaborg-Midtfyn': '430', 'Middelfart': '410', 'Assens': '420',
  'Nordfyns': '480', 'Kerteminde': '440', 'Langeland': '482',
  'Ærø': '492', 'Haderslev': '510', 'Tønder': '550',
  'Aabenraa': '580', 'Varde': '573', 'Fanø': '563',
  'Vejen': '575', 'Lemvig': '665', 'Struer': '671',
  'Thisted': '787', 'Morsø': '773', 'Brønderslev': '810',
  'Frederikshavn': '813', 'Vesthimmerlands': '820',
  'Mariagerfjord': '846', 'Jammerbugt': '849', 'Rebild': '840',
  'Læsø': '825',
};

export function getMunicipalityCode(name: string): string {
  return MUNICIPALITY_CODES[name] || '101';
}

export async function getPropertyPrices(municipalityCode: string) {
  const data = await fetchStatBank('EJEN55', [
    { code: 'KOM', values: [municipalityCode] },
    { code: 'EJENDOMSKAT', values: ['EJDV'] },
    { code: 'Tid', values: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'] },
  ]);
  if (!data) return null;
  return parseJsonStat(data);
}

export async function getPopulationData(municipalityCode: string) {
  const data = await fetchStatBank('FOLK1A', [
    { code: 'OMRÅDE', values: [municipalityCode] },
    { code: 'KØN', values: ['TOT'] },
    { code: 'ALDER', values: ['IALT'] },
    { code: 'Tid', values: ['2015K1', '2016K1', '2017K1', '2018K1', '2019K1', '2020K1', '2021K1', '2022K1', '2023K1', '2024K1'] },
  ]);
  if (!data) return null;
  return parseJsonStat(data);
}

export async function getIncomeData(municipalityCode: string) {
  const data = await fetchStatBank('INDKP101', [
    { code: 'OMRÅDE', values: [municipalityCode] },
    { code: 'KOEN', values: ['MOK'] },
    { code: 'ENHED', values: ['116'] },
    { code: 'Tid', values: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'] },
  ]);
  if (!data) return null;
  return parseJsonStat(data);
}

export async function getCrimeData(municipalityCode: string) {
  const data = await fetchStatBank('STRAF10', [
    { code: 'OMRÅDE', values: [municipalityCode] },
    { code: 'OVERTR', values: ['I alt'] },
    { code: 'Tid', values: ['2023'] },
  ]);
  if (!data) return null;
  return parseJsonStat(data);
}
