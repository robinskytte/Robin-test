// DAWA API response types
export interface DawaAutocompleteResult {
  tekst: string;
  adresse: {
    id: string;
    vejnavn: string;
    husnr: string;
    etage: string | null;
    dør: string | null;
    postnr: string;
    postnrnavn: string;
    kommunekode: string;
  };
}

export interface DawaAddress {
  id: string;
  status: number;
  vejstykke: { navn: string };
  husnr: string;
  etage: string | null;
  dør: string | null;
  adgangsadresse: {
    id: string;
    koordinater: [number, number]; // [lng, lat]
    kommune: { kode: string; navn: string };
    postnummer: { nr: string; navn: string };
    region: { kode: string; navn: string };
    sogn: { kode: string; navn: string };
  };
  adressebetegnelse: string;
}

// Mock data types
export interface BBRData {
  constructionYear: number;
  buildingArea: number;
  plotArea: number;
  material: string;
  heatingType: string;
  energyLabel: string;
  floors: number;
  hasBasement: boolean;
  roofType: string;
}

export interface PlanData {
  bebyggelsesprocent: number;
  maxHeight: number;
  maxFloors: number;
  zoneStatus: 'byzone' | 'landzone' | 'sommerhusområde';
  lokalplanRef: string;
}

export interface EnvironmentalData {
  contamination: { status: 'ingen' | 'V1' | 'V2'; description: string };
  floodRisk: { score: number; level: 'lav' | 'moderat' | 'høj'; description: string };
  noiseLevel: { db: number; level: 'lav' | 'moderat' | 'høj' };
  radonRisk: { level: 'lav' | 'moderat' | 'høj'; bqm3: number };
}

export interface SchoolData {
  name: string;
  distance: number; // km
  gradeAverage: number;
  type: 'folkeskole' | 'privatskole';
}

export interface DaycareData {
  name: string;
  distance: number;
  type: 'vuggestue' | 'børnehave' | 'integreret';
}

export interface AmenityData {
  name: string;
  type: string;
  distance: number;
}

export interface FamilyData {
  schools: SchoolData[];
  daycares: DaycareData[];
  commuteMinutes: { copenhagen: number; aarhus: number };
  parks: { name: string; distance: number }[];
  score: string; // A-F
}

export interface RiskData {
  environmental: EnvironmentalData;
  overallLevel: 'LAV' | 'MODERAT' | 'HØJ';
}

export interface BuildingPotentialData {
  currentArea: number;
  allowedArea: number;
  remainingArea: number;
  estimatedValuePerSqm: number;
  estimatedExtensionValue: number;
  planData: PlanData;
}

export interface NeighborhoodData {
  crimeIndex: number; // relative to national avg (100)
  incomeLevel: number; // relative to national avg (100)
  ageDistribution: { group: string; percentage: number }[];
  amenities: AmenityData[];
  score: number; // 1-10
}

export interface ClimateData {
  elevation: number;
  seaLevelRiskScore: number;
  precipitationRisk: 'lav' | 'moderat' | 'høj';
  buildingVulnerability: { score: number; factors: string[] };
  adaptations: { description: string; estimatedCost: string }[];
}

export interface TrendData {
  priceHistory: { year: number; value: number }[];
  populationTrend: { year: number; value: number }[];
  incomeTrend: { year: number; value: number }[];
  trajectory: 'STIGENDE' | 'STABIL' | 'FALDENDE';
}

export interface FullAnalysis {
  // address field is kept generic — replaced with AddressResult in pages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address: any;
  bbr: BBRData;
  family: FamilyData;
  risk: RiskData;
  buildingPotential: BuildingPotentialData;
  neighborhood: NeighborhoodData;
  climate: ClimateData;
  trends: TrendData;
}
