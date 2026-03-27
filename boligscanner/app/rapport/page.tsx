'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAddress, estimateCoordinatesFromPostalCode, type AddressResult } from '@/lib/dawa';
import { getMunicipalityCode, getPropertyPrices, getPopulationData, getIncomeData } from '@/lib/statbank';
import {
  generateBBRData, generateFamilyData, generateRiskData,
  generateBuildingPotentialData, generateNeighborhoodData,
  generateClimateData, generateTrendData,
} from '@/lib/mockData';
import type { FullAnalysis, TrendData } from '@/lib/types';
import FamilieFlyt from '@/components/sections/FamilieFlyt';
import BoligRisiko from '@/components/sections/BoligRisiko';
import BygPotentiale from '@/components/sections/BygPotentiale';
import NaerOmraadeScore from '@/components/sections/NaerOmraadeScore';
import KlimaBolig from '@/components/sections/KlimaBolig';
import BoligPuls from '@/components/sections/BoligPuls';

interface Analysis extends Omit<FullAnalysis, 'address'> {
  address: AddressResult;
}

function RapportContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    async function load() {
      try {
        const address = await getAddress(id);
        if (!address) { setLoading(false); return; }

        const [lng, lat] = address.coords ?? estimateCoordinatesFromPostalCode(address.postalCode);
        const { postalCode, municipalityName } = address;
        const munCode = getMunicipalityCode(municipalityName);

        const bbr = generateBBRData(lat, lng, postalCode);
        const family = generateFamilyData(lat, lng, postalCode);
        const risk = generateRiskData(lat, lng);
        const neighborhood = generateNeighborhoodData(lat, lng);
        const climate = generateClimateData(lat, lng, bbr);
        let trends: TrendData = generateTrendData(lat, lng);
        const avgSqmPrice = trends.priceHistory[trends.priceHistory.length - 1]?.value ?? 20000;
        const buildingPotential = generateBuildingPotentialData(lat, lng, postalCode, avgSqmPrice);

        try {
          const [priceRes, popRes, incRes] = await Promise.allSettled([
            getPropertyPrices(munCode),
            getPopulationData(munCode),
            getIncomeData(munCode),
          ]);
          if (priceRes.status === 'fulfilled' && priceRes.value?.labels?.length) {
            const { labels, values } = priceRes.value;
            const h = labels.map((l: string, i: number) => ({ year: parseInt(l) || 2015 + i, value: values[i] ?? 0 })).filter((d: { value: number }) => d.value > 0);
            if (h.length) trends = { ...trends, priceHistory: h };
          }
          if (popRes.status === 'fulfilled' && popRes.value?.labels?.length) {
            const { labels, values } = popRes.value;
            const p = labels.map((l: string, i: number) => ({ year: parseInt(l) || 2015 + i, value: values[i] ?? 0 })).filter((d: { value: number }) => d.value > 0);
            if (p.length) trends = { ...trends, populationTrend: p };
          }
          if (incRes.status === 'fulfilled' && incRes.value?.labels?.length) {
            const { labels, values } = incRes.value;
            const inc = labels.map((l: string, i: number) => ({ year: parseInt(l) || 2015 + i, value: values[i] ?? 0 })).filter((d: { value: number }) => d.value > 0);
            if (inc.length) trends = { ...trends, incomeTrend: inc };
          }
        } catch { /* use mock */ }

        setAnalysis({ address, bbr, family, risk, buildingPotential, neighborhood, climate, trends });
      } catch { /* error */ }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-navy rounded-full animate-spin" />
    </main>
  );

  if (!analysis) return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-warm-gray-700">Adressen blev ikke fundet.</p>
    </main>
  );

  const { address } = analysis;
  const today = new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="border-b border-gray-100 pb-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-2xl text-navy">BoligScanner</h1>
          <button onClick={() => router.push(`/analyse?id=${encodeURIComponent(id)}`)} className="text-sm text-navy hover:text-gold transition-colors print:hidden">
            ← Tilbage til analyse
          </button>
        </div>
        <h2 className="font-serif text-3xl text-navy mb-2">Ejendomsrapport</h2>
        <p className="text-lg text-warm-gray-900">{address.adressebetegnelse}</p>
        <p className="text-sm text-warm-gray-500">{address.municipalityName} · {address.postalCode} {address.postalName}</p>
        <p className="text-xs text-warm-gray-400 mt-1">Genereret: {today}</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Boligareal', value: `${analysis.bbr.buildingArea} m²` },
            { label: 'Grundareal', value: `${analysis.bbr.plotArea} m²` },
            { label: 'Opførselsår', value: `${analysis.bbr.constructionYear}` },
            { label: 'Energimærke', value: analysis.bbr.energyLabel },
          ].map(item => (
            <div key={item.label} className="border border-gray-100 p-3 bg-gray-50">
              <p className="text-xs text-warm-gray-500">{item.label}</p>
              <p className="text-lg font-semibold text-navy">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <FamilieFlyt data={analysis.family} />
        <BoligRisiko data={analysis.risk} />
        <BygPotentiale data={analysis.buildingPotential} />
        <NaerOmraadeScore data={analysis.neighborhood} />
        <KlimaBolig data={analysis.climate} />
        <BoligPuls data={analysis.trends} />
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100">
        <p className="text-xs text-warm-gray-500 leading-relaxed">
          <strong>Disclaimer:</strong> BoligScanner er i betaversion. Simulerede data anvendes. Ikke juridisk rådgivning.
        </p>
        <p className="text-center text-xs text-warm-gray-400 mt-6">Powered by BoligScanner — beta</p>
      </div>
    </main>
  );
}

export default function RapportPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-navy rounded-full animate-spin" /></main>}>
      <RapportContent />
    </Suspense>
  );
}
