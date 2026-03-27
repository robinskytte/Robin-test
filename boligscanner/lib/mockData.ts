import {
  BBRData, FamilyData, RiskData, BuildingPotentialData,
  NeighborhoodData, ClimateData, EnvironmentalData, PlanData, TrendData,
} from './types';
import { getClosestMajorCities } from './distances';

// Seeded random based on coordinates for deterministic results
function seededRandom(lat: number, lng: number, salt = 0): () => number {
  let seed = Math.abs(Math.sin(lat * 12345.6789 + lng * 98765.4321 + salt) * 43758.5453);
  return () => {
    seed = (seed * 16807 + salt) % 2147483647;
    return (seed % 10000) / 10000;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function between(min: number, max: number, rand: () => number): number {
  return Math.round(min + rand() * (max - min));
}

// Determine if address is urban based on postal code
function isUrban(postalCode: string): boolean {
  const code = parseInt(postalCode);
  // Copenhagen area, Aarhus, Odense, Aalborg core areas
  return code < 2500 || (code >= 8000 && code <= 8200) ||
    (code >= 5000 && code <= 5100) || (code >= 9000 && code <= 9100);
}

export function generateBBRData(lat: number, lng: number, postalCode: string): BBRData {
  const rand = seededRandom(lat, lng, 1);
  const urban = isUrban(postalCode);

  const era = between(1880, 2024, rand);
  const materials = era < 1930 ? ['mursten', 'bindingsværk'] :
    era < 1970 ? ['mursten', 'beton'] :
    era < 2000 ? ['mursten', 'letbeton', 'træ'] :
    ['mursten', 'træ', 'beton'];

  const energyLabels: Record<string, string[]> = {
    old: ['E', 'F', 'G', 'D'],
    mid: ['C', 'D', 'E'],
    recent: ['A', 'B', 'C'],
    new: ['A', 'A'],
  };
  const eraKey = era < 1960 ? 'old' : era < 1990 ? 'mid' : era < 2010 ? 'recent' : 'new';

  const heating = urban
    ? pick(['fjernvarme', 'fjernvarme', 'fjernvarme', 'gaskedel'], rand)
    : era > 2015
      ? pick(['varmepumpe', 'varmepumpe', 'fjernvarme'], rand)
      : pick(['oliefyr', 'gaskedel', 'varmepumpe', 'fjernvarme'], rand);

  return {
    constructionYear: era,
    buildingArea: urban ? between(60, 180, rand) : between(100, 300, rand),
    plotArea: urban ? between(150, 600, rand) : between(500, 2000, rand),
    material: pick(materials, rand),
    heatingType: heating,
    energyLabel: pick(energyLabels[eraKey], rand),
    floors: urban ? between(1, 3, rand) : between(1, 2, rand),
    hasBasement: rand() > 0.5 && era < 2000,
    roofType: pick(['tegltag', 'betontagsten', 'tagpap', 'eternit'], rand),
  };
}

export function generatePlanData(lat: number, lng: number, postalCode: string): PlanData {
  const rand = seededRandom(lat, lng, 2);
  const urban = isUrban(postalCode);

  return {
    bebyggelsesprocent: urban ? between(40, 60, rand) : between(25, 40, rand),
    maxHeight: urban ? pick([12, 15, 8.5], rand) : 8.5,
    maxFloors: urban ? between(2, 4, rand) : between(1, 2, rand),
    zoneStatus: urban ? 'byzone' : (rand() > 0.9 ? 'sommerhusområde' : rand() > 0.3 ? 'byzone' : 'landzone'),
    lokalplanRef: `LP-${between(100, 999, rand)}-${between(2010, 2024, rand)}`,
  };
}

export function generateEnvironmentalData(lat: number, lng: number): EnvironmentalData {
  const rand = seededRandom(lat, lng, 3);

  // Contamination: 5% V2, 10% V1
  const contamRoll = rand();
  const contamination = contamRoll < 0.05
    ? { status: 'V2' as const, description: 'Ejendommen er kortlagt på vidensniveau 2 (V2) — forurening konstateret.' }
    : contamRoll < 0.15
      ? { status: 'V1' as const, description: 'Ejendommen er kortlagt på vidensniveau 1 (V1) — mulig forurening.' }
      : { status: 'ingen' as const, description: 'Ingen registreret jordforurening.' };

  // Flood risk based on simulated elevation (lower lat ≈ closer to coast in DK)
  const elevation = between(1, 40, rand);
  const floodScore = Math.max(0, Math.min(10, Math.round(10 - elevation / 4)));
  const floodLevel = floodScore > 6 ? 'høj' : floodScore > 3 ? 'moderat' : 'lav';

  const noiseDb = between(40, 75, rand);

  const radonBq = between(20, 200, rand);
  const radonLevel = radonBq > 100 ? 'høj' : radonBq > 50 ? 'moderat' : 'lav';

  return {
    contamination,
    floodRisk: {
      score: floodScore,
      level: floodLevel as 'lav' | 'moderat' | 'høj',
      description: floodLevel === 'høj'
        ? 'Ejendommen ligger i et område med forhøjet oversvømmelsesrisiko.'
        : floodLevel === 'moderat'
          ? 'Moderat risiko for oversvømmelse ved ekstremnedbør.'
          : 'Lav oversvømmelsesrisiko.',
    },
    noiseLevel: {
      db: noiseDb,
      level: noiseDb > 65 ? 'høj' : noiseDb > 55 ? 'moderat' : 'lav',
    },
    radonRisk: { level: radonLevel as 'lav' | 'moderat' | 'høj', bqm3: radonBq },
  };
}

export function generateFamilyData(lat: number, lng: number, postalCode: string): FamilyData {
  const rand = seededRandom(lat, lng, 4);
  const urban = isUrban(postalCode);

  const schoolNames = ['Skovbakkeskolen', 'Strandparkskolen', 'Vesterbro Skole', 'Nørre Skole',
    'Sønderbro Skole', 'Østervangsskolen', 'Munkevængets Skole', 'Bakkegårdsskolen'];
  const daycareNames = ['Solstrålen', 'Børnehuset Regnbuen', 'Tumlegården', 'Mariehønen',
    'Skovtrolden', 'Lillebo', 'Spiren', 'Eventyrhuset'];
  const parkNames = ['Byparken', 'Skovparken', 'Strandparken', 'Lunden', 'Grønningen'];
  const sportsFacilityNames = ['Fitnesscenter Pro', 'SATS Gym', 'Crossfit Boxen', 'Svømmebad',
    'Tennisklub', 'Badmintonhal', 'Ishockey-arena', 'Atletikbane'];

  const schools = Array.from({ length: between(2, 4, rand) }, (_, i) => ({
    name: schoolNames[(Math.floor(rand() * schoolNames.length) + i) % schoolNames.length],
    distance: urban ? +(0.3 + rand() * 1.5).toFixed(1) : +(1.0 + rand() * 4.0).toFixed(1),
    gradeAverage: +(5.5 + rand() * 2.5).toFixed(1),
    type: rand() > 0.7 ? 'privatskole' as const : 'folkeskole' as const,
  })).sort((a, b) => a.distance - b.distance);

  const daycares = Array.from({ length: between(2, 4, rand) }, (_, i) => ({
    name: daycareNames[(Math.floor(rand() * daycareNames.length) + i) % daycareNames.length],
    distance: urban ? +(0.2 + rand() * 0.8).toFixed(1) : +(0.5 + rand() * 3.0).toFixed(1),
    type: pick(['vuggestue', 'børnehave', 'integreret'] as const, rand),
  })).sort((a, b) => a.distance - b.distance);

  const sportsFacilities = Array.from({ length: between(2, 4, rand) }, (_, i) => ({
    name: sportsFacilityNames[(Math.floor(rand() * sportsFacilityNames.length) + i) % sportsFacilityNames.length],
    type: pick(['fitnesscenter', 'svømmebad', 'halsport'], rand),
    distance: urban ? +(0.3 + rand() * 1.2).toFixed(1) : +(1.0 + rand() * 3.0).toFixed(1),
  })).sort((a, b) => a.distance - b.distance);

  const parks = Array.from({ length: between(1, 3, rand) }, (_, i) => ({
    name: parkNames[(Math.floor(rand() * parkNames.length) + i) % parkNames.length],
    distance: +(0.3 + rand() * 2.0).toFixed(1),
  }));

  const avgSchoolGrade = schools.reduce((s, sc) => s + sc.gradeAverage, 0) / schools.length;
  const avgSchoolDist = schools.reduce((s, sc) => s + sc.distance, 0) / schools.length;
  const familyScore = avgSchoolGrade > 7.0 && avgSchoolDist < 1.5 ? 'A' :
    avgSchoolGrade > 6.5 && avgSchoolDist < 2.5 ? 'B' :
    avgSchoolGrade > 6.0 ? 'C' : avgSchoolGrade > 5.5 ? 'D' : 'E';

  // Get 2 closest major Danish cities
  const closestCities = getClosestMajorCities(lat, lng, 2).map(city => ({
    name: city.name,
    distance: city.distance,
  }));

  return {
    schools,
    daycares,
    sportsFacilities,
    majorCities: closestCities,
    parks,
    score: familyScore,
  };
}

export function generateRiskData(lat: number, lng: number): RiskData {
  const env = generateEnvironmentalData(lat, lng);
  let riskScore = 0;
  if (env.contamination.status === 'V2') riskScore += 3;
  else if (env.contamination.status === 'V1') riskScore += 1;
  if (env.floodRisk.level === 'høj') riskScore += 2;
  else if (env.floodRisk.level === 'moderat') riskScore += 1;
  if (env.noiseLevel.level === 'høj') riskScore += 1;
  if (env.radonRisk.level === 'høj') riskScore += 1;

  return {
    environmental: env,
    overallLevel: riskScore >= 4 ? 'HØJ' : riskScore >= 2 ? 'MODERAT' : 'LAV',
  };
}

export function generateBuildingPotentialData(
  lat: number, lng: number, postalCode: string, sqmPrice: number
): BuildingPotentialData {
  const bbr = generateBBRData(lat, lng, postalCode);
  const plan = generatePlanData(lat, lng, postalCode);

  const allowedArea = Math.round(bbr.plotArea * plan.bebyggelsesprocent / 100);
  const remaining = Math.max(0, allowedArea - bbr.buildingArea);

  return {
    currentArea: bbr.buildingArea,
    allowedArea,
    remainingArea: remaining,
    estimatedValuePerSqm: sqmPrice,
    estimatedExtensionValue: remaining * sqmPrice,
    planData: plan,
  };
}

export function generateNeighborhoodData(lat: number, lng: number): NeighborhoodData {
  const rand = seededRandom(lat, lng, 6);

  const amenityTypes = [
    { type: 'Supermarked', names: ['Netto', 'Rema 1000', 'Føtex', 'SuperBrugsen', 'Lidl'] },
    { type: 'Apotek', names: ['Svane Apotek', 'Løve Apotek', 'Steno Apotek'] },
    { type: 'Læge', names: ['Lægerne i Centret', 'Lægehuset', 'Sundhedshuset'] },
    { type: 'Bibliotek', names: ['Hovedbiblioteket', 'Lokalbiblioteket'] },
    { type: 'Fitness', names: ['Fitness World', 'SATS', 'Crossfit Boxen'] },
  ];

  const amenities = amenityTypes.map(at => ({
    name: pick(at.names, rand),
    type: at.type,
    distance: +(0.2 + rand() * 2.5).toFixed(1),
  }));

  // These will be overridden with real StatBank data when available
  const crimeIndex = between(60, 160, rand);
  const incomeLevel = between(70, 150, rand);

  const ageDistribution = [
    { group: '0-17', percentage: between(15, 25, rand) },
    { group: '18-29', percentage: between(10, 22, rand) },
    { group: '30-49', percentage: between(20, 32, rand) },
    { group: '50-64', percentage: between(15, 22, rand) },
    { group: '65+', percentage: between(10, 25, rand) },
  ];

  // Normalize percentages to 100
  const total = ageDistribution.reduce((s, a) => s + a.percentage, 0);
  ageDistribution.forEach(a => a.percentage = Math.round(a.percentage / total * 100));

  const score = Math.round(
    (Math.min(incomeLevel, 150) / 150 * 4 +
    Math.min(160 - crimeIndex, 100) / 100 * 3 +
    (amenities.reduce((s, a) => s + Math.max(0, 3 - a.distance), 0) / amenities.length) * 3)
  );

  return {
    crimeIndex,
    incomeLevel,
    ageDistribution,
    amenities,
    score: Math.max(1, Math.min(10, score)),
  };
}

export function generateClimateData(lat: number, lng: number, bbr: BBRData): ClimateData {
  const rand = seededRandom(lat, lng, 7);
  const elevation = between(1, 35, rand);

  // Coastal proximity (rough estimate based on DK geography)
  const coastalScore = Math.max(0, 5 - elevation / 5);

  const vulnerabilityFactors: string[] = [];
  if (bbr.hasBasement) vulnerabilityFactors.push('Kælder øger risiko for vandskade');
  if (bbr.constructionYear < 1960) vulnerabilityFactors.push('Ældre bygning med begrænset klimasikring');
  if (bbr.roofType === 'tagpap') vulnerabilityFactors.push('Fladt tag øger risiko ved skybrud');

  return {
    elevation,
    seaLevelRiskScore: Math.round(coastalScore * 2),
    precipitationRisk: elevation < 8 ? 'høj' : elevation < 15 ? 'moderat' : 'lav',
    buildingVulnerability: {
      score: Math.min(10, vulnerabilityFactors.length * 3 + between(1, 3, rand)),
      factors: vulnerabilityFactors.length > 0 ? vulnerabilityFactors : ['Ingen væsentlige sårbarhedsfaktorer identificeret'],
    },
    adaptations: [
      { description: 'Højvandslukke i kloakafløb', estimatedCost: '15.000-25.000 kr.' },
      { description: 'Regnvandsopsamling og faskine', estimatedCost: '30.000-60.000 kr.' },
      ...(bbr.hasBasement ? [{ description: 'Pumpe og vandtæt membran i kælder', estimatedCost: '40.000-80.000 kr.' }] : []),
      ...(bbr.constructionYear < 1970 ? [{ description: 'Efterisolering af klimaskærm', estimatedCost: '150.000-300.000 kr.' }] : []),
    ],
  };
}

export function generateTrendData(lat: number, lng: number): TrendData {
  const rand = seededRandom(lat, lng, 8);

  // These will be overridden with real StatBank data when available
  const basePrice = between(15000, 45000, rand);
  const growthRate = 0.02 + rand() * 0.08;

  const priceHistory = Array.from({ length: 10 }, (_, i) => ({
    year: 2015 + i,
    value: Math.round(basePrice * Math.pow(1 + growthRate, i) * (0.95 + rand() * 0.1)),
  }));

  const basePop = between(5000, 100000, rand);
  const popGrowth = -0.01 + rand() * 0.03;
  const populationTrend = Array.from({ length: 10 }, (_, i) => ({
    year: 2015 + i,
    value: Math.round(basePop * Math.pow(1 + popGrowth, i)),
  }));

  const baseIncome = between(250000, 450000, rand);
  const incomeGrowth = 0.01 + rand() * 0.03;
  const incomeTrend = Array.from({ length: 8 }, (_, i) => ({
    year: 2015 + i,
    value: Math.round(baseIncome * Math.pow(1 + incomeGrowth, i)),
  }));

  const lastPrice = priceHistory[priceHistory.length - 1].value;
  const firstPrice = priceHistory[0].value;
  const priceChange = (lastPrice - firstPrice) / firstPrice;

  return {
    priceHistory,
    populationTrend,
    incomeTrend,
    trajectory: priceChange > 0.3 ? 'STIGENDE' : priceChange > 0.05 ? 'STABIL' : 'FALDENDE',
  };
}
