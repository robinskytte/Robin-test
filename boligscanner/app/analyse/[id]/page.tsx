'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AnalysePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(['family']);

  useEffect(() => {
    async function loadAnalysis() {
      setLoading(true);
      try {
        const address = await getAddress(id);
        if (!address) {
          setError('Adressen blev ikke fundet.');
          setLoading(false);
          return;
        }

        const [lng, lat] = address.adgangsadresse.koordinater;
        const postalCode = address.adgangsadresse.postnummer.nr;
        const municipalityName = address.adgangsadresse.kommune.navn;
        const munCode = getMunicipalityCode(municipalityName);

        // Generate mock/hybrid data
        const bbr = generateBBRData(lat, lng, postalCode);
        const family = generateFamilyData(lat, lng, postalCode);
        const risk = generateRiskData(lat, lng);
        const neighborhood = generateNeighborhoodData(lat, lng);
        const climate = generateClimateData(lat, lng, bbr);
        let trends = generateTrendData(lat, lng);

        // Estimated sqm price for building potential
        const avgSqmPrice = trends.priceHistory.length > 0
          ? trends.priceHistory[trends.priceHistory.length - 1].value
          : 20000;
        const buildingPotential = generateBuildingPotentialData(lat, lng, postalCode, avgSqmPrice);

        // Try to enhance with real StatBank data
        try {
          const [priceData, popData, incData] = await Promise.allSettled([
            getPropertyPrices(munCode),
            getPopulationData(munCode),
            getIncomeData(munCode),
          ]);

          if (priceData.status === 'fulfilled' && priceData.value) {
            const { labels, values } = priceData.value;
            if (labels.length > 0 && values.length > 0) {
              trends = {
                ...trends,
                priceHistory: labels.map((label: string, i: number) => ({
                  year: parseInt(label) || 2015 + i,
                  value: values[i] || 0,
                })).filter((d: { value: number }) => d.value > 0),
              };
            }
          }

          if (popData.status === 'fulfilled' && popData.value) {
            const { labels, values } = popData.value;
            if (labels.length > 0 && values.length > 0) {
              trends = {
                ...trends,
                populationTrend: labels.map((label: string, i: number) => ({
                  year: parseInt(label) || 2015 + i,
                  value: values[i] || 0,
                })).filter((d: { value: number }) => d.value > 0),
              };
            }
          }

          if (incData.status === 'fulfilled' && incData.value) {
            const { labels, values } = incData.value;
            if (labels.length > 0 && values.length > 0) {
              trends = {
                ...trends,
                incomeTrend: labels.map((label: string, i: number) => ({
                  year: parseInt(label) || 2015 + i,
                  value: values[i] || 0,
                })).filter((d: { value: number }) => d.value > 0),
              };
            }
          }

          // Recalculate trajectory
          if (trends.priceHistory.length >= 2) {
            const first = trends.priceHistory[0].value;
            const last = trends.priceHistory[trends.priceHistory.length - 1].value;
            const change = (last - first) / first;
            trends.trajectory = change > 0.3 ? 'STIGENDE' : change > 0.05 ? 'STABIL' : 'FALDENDE';
          }
        } catch {
          // StatBank data fetch failed — use mock data
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
      } catch {
        setError('Der opstod en fejl ved indlæsning af data.');
      }
      setLoading(false);
    }

    loadAnalysis();
  }, [id]);

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer)
        ? prev.filter((l) => l !== layer)
        : [...prev, layer]
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-warm-gray-300 border-t-navy rounded-full animate-spin mx-auto mb-4" />
          <p className="text-warm-gray-700">Analyserer adresse...</p>
        </div>
      </main>
    );
  }

  if (error || !analysis) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="font-serif text-2xl text-navy mb-2">Fejl</h2>
          <p className="text-warm-gray-700 mb-4">{error || 'Ukendt fejl'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-navy text-white rounded-[4px] text-sm hover:bg-navy-light transition-colors"
          >
            Tilbage til forsiden
          </button>
        </div>
      </main>
    );
  }

  const { address } = analysis;
  const [lng, lat] = address.adgangsadresse.koordinater;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-warm-gray-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="font-serif text-xl text-navy hover:text-navy-light transition-colors">
            BoligScanner
          </button>
          <div className="text-right">
            <p className="text-sm font-medium text-warm-gray-900">{address.adressebetegnelse}</p>
            <p className="text-xs text-warm-gray-500">
              {address.adgangsadresse.kommune.navn} · {address.adgangsadresse.postnummer.nr} {address.adgangsadresse.postnummer.navn}
            </p>
          </div>
        </div>
      </header>

      {/* BBR Summary Bar */}
      <div className="border-b border-warm-gray-200 bg-warm-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-warm-gray-700">
          <span><strong className="text-warm-gray-900">{analysis.bbr.buildingArea} m²</strong> bolig</span>
          <span><strong className="text-warm-gray-900">{analysis.bbr.plotArea} m²</strong> grund</span>
          <span>Opført <strong className="text-warm-gray-900">{analysis.bbr.constructionYear}</strong></span>
          <span>Energimærke <strong className="text-warm-gray-900">{analysis.bbr.energyLabel}</strong></span>
          <span>{analysis.bbr.material} · {analysis.bbr.heatingType}</span>
          <span className="text-xs text-warm-gray-500 italic">(Simuleret BBR-data)</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Column */}
          <div className="lg:w-[60%] w-full">
            <div className="sticky top-4">
              <div className="relative border border-warm-gray-200 rounded-[4px] overflow-hidden bg-white">
                <AnalysisMap lat={lat} lng={lng} activeLayers={activeLayers} />
                <LayerToggle activeLayers={activeLayers} onToggle={toggleLayer} />
              </div>
              <div className="mt-3 flex justify-end">
                <a
                  href={`/rapport/${id}`}
                  className="text-sm text-navy hover:text-gold transition-colors"
                >
                  Se fuld rapport →
                </a>
              </div>
            </div>
          </div>

          {/* Report Column */}
          <div className="lg:w-[40%] w-full space-y-6">
            <FamilieFlyt data={analysis.family} />
            <BoligRisiko data={analysis.risk} />
            <BygPotentiale data={analysis.buildingPotential} />
            <NaerOmraadeScore data={analysis.neighborhood} />
            <KlimaBolig data={analysis.climate} />
            <BoligPuls data={analysis.trends} />
          </div>
        </div>
      </div>
    </main>
  );
}
