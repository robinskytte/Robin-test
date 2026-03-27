'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAddress } from '@/lib/dawa';
import { getMunicipalityCode, getPropertyPrices, getPopulationData, getIncomeData } from '@/lib/statbank';
import {
  generateBBRData, generateFamilyData, generateRiskData,
  generateBuildingPotentialData, generateNeighborhoodData,
  generateClimateData, generateTrendData,
} from '@/lib/mockData';
import type { DawaAddress, FullAnalysis } from '@/lib/types';
import AnalysisMap from '@/components/AnalysisMap';
import LayerToggle from '@/components/LayerToggle';
import FamilieFlyt from '@/components/sections/FamilieFlyt';
import BoligRisiko from '@/components/sections/BoligRisiko';
import BygPotentiale from '@/components/sections/BygPotentiale';
import NaerOmraadeScore from '@/components/sections/NaerOmraadeScore';
import KlimaBolig from '@/components/sections/KlimaBolig';
import BoligPuls from '@/components/sections/BoligPuls';

function AnalyseContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const router = useRouter();
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(['family']);

  useEffect(() => {
    if (!id) {
      setError('Ingen adresse angivet.');
      setLoading(false);
      return;
    }

    async function loadAnalysis() {
      setLoading(true);
      setError(null);
      try {
        const address = await getAddress(id);
        if (!address) {
          setError('Adressen blev ikke fundet. Prøv igen fra forsiden.');
          setLoading(false);
          return;
        }

        // Defensive: check required nested fields exist
        const coords = address?.adgangsadresse?.koordinater;
        if (!coords || coords.length < 2) {
          setError('Kunne ikke hente koordinater for adressen.');
          setLoading(false);
          return;
        }

        const [lng, lat] = coords;
        const postalCode = address.adgangsadresse?.postnummer?.nr ?? '1000';
        const municipalityName = address.adgangsadresse?.kommune?.navn ?? 'København';
        const munCode = getMunicipalityCode(municipalityName);

        const bbr = generateBBRData(lat, lng, postalCode);
        const family = generateFamilyData(lat, lng, postalCode);
        const risk = generateRiskData(lat, lng);
        const neighborhood = generateNeighborhoodData(lat, lng);
        const climate = generateClimateData(lat, lng, bbr);
        let trends = generateTrendData(lat, lng);

        const avgSqmPrice = trends.priceHistory.length > 0
          ? trends.priceHistory[trends.priceHistory.length - 1].value
          : 20000;
        const buildingPotential = generateBuildingPotentialData(lat, lng, postalCode, avgSqmPrice);

        // Try to enhance with real StatBank data (non-critical)
        try {
          const [priceData, popData, incData] = await Promise.allSettled([
            getPropertyPrices(munCode),
            getPopulationData(munCode),
            getIncomeData(munCode),
          ]);

          if (priceData.status === 'fulfilled' && priceData.value) {
            const { labels, values } = priceData.value;
            if (labels.length > 0 && values.length > 0) {
              const history = labels.map((l: string, i: number) => ({
                year: parseInt(l) || 2015 + i,
                value: values[i] || 0,
              })).filter((d: { value: number }) => d.value > 0);
              if (history.length > 0) trends = { ...trends, priceHistory: history };
            }
          }
          if (popData.status === 'fulfilled' && popData.value) {
            const { labels, values } = popData.value;
            if (labels.length > 0 && values.length > 0) {
              const pop = labels.map((l: string, i: number) => ({
                year: parseInt(l) || 2015 + i,
                value: values[i] || 0,
              })).filter((d: { value: number }) => d.value > 0);
              if (pop.length > 0) trends = { ...trends, populationTrend: pop };
            }
          }
          if (incData.status === 'fulfilled' && incData.value) {
            const { labels, values } = incData.value;
            if (labels.length > 0 && values.length > 0) {
              const inc = labels.map((l: string, i: number) => ({
                year: parseInt(l) || 2015 + i,
                value: values[i] || 0,
              })).filter((d: { value: number }) => d.value > 0);
              if (inc.length > 0) trends = { ...trends, incomeTrend: inc };
            }
          }
          if (trends.priceHistory.length >= 2) {
            const first = trends.priceHistory[0].value;
            const last = trends.priceHistory[trends.priceHistory.length - 1].value;
            const change = (last - first) / first;
            trends.trajectory = change > 0.3 ? 'STIGENDE' : change > 0.05 ? 'STABIL' : 'FALDENDE';
          }
        } catch {
          // StatBank optional — continue with mock data
        }

        setAnalysis({
          address: address as DawaAddress,
          bbr,
          family,
          risk,
          buildingPotential,
          neighborhood,
          climate,
          trends,
        });
      } catch (err) {
        console.error('BoligScanner analysis error:', err);
        setError('Der opstod en fejl ved indlæsning af data. Tjek din internetforbindelse og prøv igen.');
      }
      setLoading(false);
    }

    loadAnalysis();
  }, [id]);

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-navy rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-warm-gray-700">Henter analyse...</p>
        </div>
      </main>
    );
  }

  if (error || !analysis) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-terra text-xl">!</span>
          </div>
          <h2 className="font-serif text-xl text-navy mb-2">Noget gik galt</h2>
          <p className="text-sm text-warm-gray-700 mb-6">{error || 'Ukendt fejl'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-navy text-white text-sm font-medium hover:bg-navy-light transition-colors"
          >
            Søg igen
          </button>
        </div>
      </main>
    );
  }

  const { address } = analysis;
  const [lng, lat] = address.adgangsadresse.koordinater;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/')}
            className="font-serif text-lg text-navy hover:text-gold transition-colors shrink-0"
          >
            BoligScanner
          </button>
          <div className="text-right min-w-0">
            <p className="text-sm font-medium text-navy truncate">{address.adressebetegnelse}</p>
            <p className="text-xs text-warm-gray-500">
              {address.adgangsadresse.kommune.navn} · {address.adgangsadresse.postnummer.nr}
            </p>
          </div>
        </div>
      </nav>

      {/* BBR bar */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-warm-gray-700">
          <span><strong className="text-navy font-semibold">{analysis.bbr.buildingArea} m²</strong> bolig</span>
          <span><strong className="text-navy font-semibold">{analysis.bbr.plotArea} m²</strong> grund</span>
          <span>Opført <strong className="text-navy font-semibold">{analysis.bbr.constructionYear}</strong></span>
          <span>Energi <strong className="text-navy font-semibold">{analysis.bbr.energyLabel}</strong></span>
          <span className="text-warm-gray-500 italic">Simuleret BBR</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map */}
          <div className="lg:w-[58%] w-full">
            <div className="lg:sticky lg:top-24">
              <div className="relative border border-gray-200 overflow-hidden bg-white">
                <AnalysisMap lat={lat} lng={lng} activeLayers={activeLayers} />
                <LayerToggle activeLayers={activeLayers} onToggle={toggleLayer} />
              </div>
              <div className="mt-3 flex justify-end">
                <a href={`/rapport?id=${encodeURIComponent(id)}`} className="text-xs text-warm-gray-500 hover:text-navy transition-colors">
                  Fuld rapport →
                </a>
              </div>
            </div>
          </div>

          {/* Report */}
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

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12 py-6 px-6">
        <div className="max-w-[1400px] mx-auto text-xs text-warm-gray-500 text-center">
          BoligScanner beta — simulerede data. Ikke juridisk rådgivning.
        </div>
      </footer>
    </div>
  );
}

export default function AnalysePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-navy rounded-full animate-spin" />
      </main>
    }>
      <AnalyseContent />
    </Suspense>
  );
}
