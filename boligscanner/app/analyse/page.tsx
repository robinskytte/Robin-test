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
import AnalysisMap from '@/components/AnalysisMap';
import LayerToggle from '@/components/LayerToggle';
import FamilieFlyt from '@/components/sections/FamilieFlyt';
import BoligRisiko from '@/components/sections/BoligRisiko';
import BygPotentiale from '@/components/sections/BygPotentiale';
import NaerOmraadeScore from '@/components/sections/NaerOmraadeScore';
import KlimaBolig from '@/components/sections/KlimaBolig';
import BoligPuls from '@/components/sections/BoligPuls';

interface Analysis extends Omit<FullAnalysis, 'address'> {
  address: AddressResult;
}

function AnalyseContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(['family']);

  useEffect(() => {
    if (!id) { setError('Ingen adresse angivet.'); setLoading(false); return; }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const address = await getAddress(id);
        if (!address) { setError('Adressen blev ikke fundet.'); setLoading(false); return; }

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

        // Try to enhance with real StatBank data
        try {
          const [priceRes, popRes, incRes] = await Promise.allSettled([
            getPropertyPrices(munCode),
            getPopulationData(munCode),
            getIncomeData(munCode),
          ]);
          if (priceRes.status === 'fulfilled' && priceRes.value?.labels?.length) {
            const { labels, values } = priceRes.value;
            const history = labels
              .map((l: string, i: number) => ({ year: parseInt(l) || 2015 + i, value: values[i] ?? 0 }))
              .filter((d: { value: number }) => d.value > 0);
            if (history.length > 0) trends = { ...trends, priceHistory: history };
          }
          if (popRes.status === 'fulfilled' && popRes.value?.labels?.length) {
            const { labels, values } = popRes.value;
            const pop = labels
              .map((l: string, i: number) => ({ year: parseInt(l) || 2015 + i, value: values[i] ?? 0 }))
              .filter((d: { value: number }) => d.value > 0);
            if (pop.length > 0) trends = { ...trends, populationTrend: pop };
          }
          if (incRes.status === 'fulfilled' && incRes.value?.labels?.length) {
            const { labels, values } = incRes.value;
            const inc = labels
              .map((l: string, i: number) => ({ year: parseInt(l) || 2015 + i, value: values[i] ?? 0 }))
              .filter((d: { value: number }) => d.value > 0);
            if (inc.length > 0) trends = { ...trends, incomeTrend: inc };
          }
          if (trends.priceHistory.length >= 2) {
            const change = (trends.priceHistory.at(-1)!.value - trends.priceHistory[0].value) / trends.priceHistory[0].value;
            trends.trajectory = change > 0.3 ? 'STIGENDE' : change > 0.05 ? 'STABIL' : 'FALDENDE';
          }
        } catch { /* use mock trends */ }

        setAnalysis({ address, bbr, family, risk, buildingPotential, neighborhood, climate, trends });
      } catch (err) {
        console.error('BoligScanner error:', err);
        setError('Der opstod en fejl. Prøv at søge igen.');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
  };

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-navy rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-warm-gray-700">Henter analyse...</p>
      </div>
    </main>
  );

  if (error || !analysis) return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <h2 className="font-serif text-xl text-navy mb-2">Noget gik galt</h2>
        <p className="text-sm text-warm-gray-700 mb-6">{error || 'Ukendt fejl'}</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-navy text-white text-sm hover:bg-navy-light transition-colors">
          Søg igen
        </button>
      </div>
    </main>
  );

  const { address } = analysis;
  const [lng, lat] = address.coords ?? estimateCoordinatesFromPostalCode(address.postalCode);

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button onClick={() => router.push('/')} className="font-serif text-lg text-navy hover:text-gold transition-colors shrink-0">
            BoligScanner
          </button>
          <div className="text-right min-w-0">
            <p className="text-sm font-medium text-navy truncate">{address.adressebetegnelse}</p>
            <p className="text-xs text-warm-gray-500">{address.municipalityName} · {address.postalCode} {address.postalName}</p>
          </div>
        </div>
      </nav>

      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-warm-gray-700">
          <span><strong className="text-navy">{analysis.bbr.buildingArea} m²</strong> bolig</span>
          <span><strong className="text-navy">{analysis.bbr.plotArea} m²</strong> grund</span>
          <span>Opført <strong className="text-navy">{analysis.bbr.constructionYear}</strong></span>
          <span>Energi <strong className="text-navy">{analysis.bbr.energyLabel}</strong></span>
          <span className="italic text-warm-gray-400">Simuleret BBR</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[58%] w-full">
            <div className="lg:sticky lg:top-24">
              <div className="relative border border-gray-200 overflow-hidden">
                <AnalysisMap lat={lat} lng={lng} activeLayers={activeLayers} />
                <LayerToggle activeLayers={activeLayers} onToggle={toggleLayer} />
              </div>
              <div className="mt-2 flex justify-end">
                <a href={`/rapport?id=${encodeURIComponent(id)}`} className="text-xs text-warm-gray-500 hover:text-navy transition-colors">
                  Fuld rapport →
                </a>
              </div>
            </div>
          </div>

          <div className="lg:w-[42%] w-full space-y-4">
            <FamilieFlyt data={analysis.family} />
            <BoligRisiko data={analysis.risk} />
            <BygPotentiale data={analysis.buildingPotential} />
            <NaerOmraadeScore data={analysis.neighborhood} />
            <KlimaBolig data={analysis.climate} />
            <BoligPuls data={analysis.trends} />
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 mt-12 py-6 px-6 text-center text-xs text-warm-gray-500">
        BoligScanner beta — simulerede data. Ikke juridisk rådgivning.
      </footer>
    </div>
  );
}

export default function AnalysePage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-navy rounded-full animate-spin" /></main>}>
      <AnalyseContent />
    </Suspense>
  );
}
