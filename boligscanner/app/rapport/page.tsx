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
import FamilieFlyt from '@/components/sections/FamilieFlyt';
import BoligRisiko from '@/components/sections/BoligRisiko';
import BygPotentiale from '@/components/sections/BygPotentiale';
import NaerOmraadeScore from '@/components/sections/NaerOmraadeScore';
import KlimaBolig from '@/components/sections/KlimaBolig';
import BoligPuls from '@/components/sections/BoligPuls';

function RapportContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const router = useRouter();
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    async function loadAnalysis() {
      try {
        const address = await getAddress(id);
        if (!address) { setLoading(false); return; }

        const [lng, lat] = address.adgangsadresse.koordinater;
        const postalCode = address.adgangsadresse.postnummer.nr;
        const municipalityName = address.adgangsadresse.kommune.navn;
        const munCode = getMunicipalityCode(municipalityName);

        const bbr = generateBBRData(lat, lng, postalCode);
        const family = generateFamilyData(lat, lng, postalCode);
        const risk = generateRiskData(lat, lng);
        const neighborhood = generateNeighborhoodData(lat, lng);
        const climate = generateClimateData(lat, lng, bbr);
        let trends = generateTrendData(lat, lng);

        const avgSqmPrice = trends.priceHistory.length > 0
          ? trends.priceHistory[trends.priceHistory.length - 1].value : 20000;
        const buildingPotential = generateBuildingPotentialData(lat, lng, postalCode, avgSqmPrice);

        try {
          const [priceData, popData, incData] = await Promise.allSettled([
            getPropertyPrices(munCode),
            getPopulationData(munCode),
            getIncomeData(munCode),
          ]);

          if (priceData.status === 'fulfilled' && priceData.value) {
            const { labels, values } = priceData.value;
            if (labels.length > 0 && values.length > 0) {
              trends = { ...trends, priceHistory: labels.map((l: string, i: number) => ({
                year: parseInt(l) || 2015 + i, value: values[i] || 0,
              })).filter((d: { value: number }) => d.value > 0) };
            }
          }
          if (popData.status === 'fulfilled' && popData.value) {
            const { labels, values } = popData.value;
            if (labels.length > 0 && values.length > 0) {
              trends = { ...trends, populationTrend: labels.map((l: string, i: number) => ({
                year: parseInt(l) || 2015 + i, value: values[i] || 0,
              })).filter((d: { value: number }) => d.value > 0) };
            }
          }
          if (incData.status === 'fulfilled' && incData.value) {
            const { labels, values } = incData.value;
            if (labels.length > 0 && values.length > 0) {
              trends = { ...trends, incomeTrend: labels.map((l: string, i: number) => ({
                year: parseInt(l) || 2015 + i, value: values[i] || 0,
              })).filter((d: { value: number }) => d.value > 0) };
            }
          }
          if (trends.priceHistory.length >= 2) {
            const first = trends.priceHistory[0].value;
            const last = trends.priceHistory[trends.priceHistory.length - 1].value;
            const change = (last - first) / first;
            trends.trajectory = change > 0.3 ? 'STIGENDE' : change > 0.05 ? 'STABIL' : 'FALDENDE';
          }
        } catch { /* use mock */ }

        setAnalysis({
          address: address as DawaAddress,
          bbr, family, risk, buildingPotential, neighborhood, climate, trends,
        });
      } catch { /* error */ }
      setLoading(false);
    }
    loadAnalysis();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-warm-gray-300 border-t-navy rounded-full animate-spin" />
      </main>
    );
  }

  if (!analysis) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-warm-gray-700">Adressen blev ikke fundet.</p>
      </main>
    );
  }

  const { address } = analysis;
  const today = new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 print:py-4">
      {/* Report Header */}
      <div className="border-b border-warm-gray-200 pb-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-2xl text-navy">BoligScanner</h1>
          <button
            onClick={() => router.push(`/analyse?id=${encodeURIComponent(id)}`)}
            className="text-sm text-navy hover:text-gold transition-colors print:hidden"
          >
            ← Tilbage til analyse
          </button>
        </div>
        <h2 className="font-serif text-3xl text-navy mb-2">Ejendomsrapport</h2>
        <p className="text-lg text-warm-gray-900">{address.adressebetegnelse}</p>
        <p className="text-sm text-warm-gray-500">
          {address.adgangsadresse.kommune.navn} · {address.adgangsadresse.postnummer.nr} {address.adgangsadresse.postnummer.navn}
        </p>
        <p className="text-xs text-warm-gray-500 mt-2">Rapport genereret: {today}</p>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Boligareal', value: `${analysis.bbr.buildingArea} m²` },
            { label: 'Grundareal', value: `${analysis.bbr.plotArea} m²` },
            { label: 'Opførselsår', value: `${analysis.bbr.constructionYear}` },
            { label: 'Energimærke', value: analysis.bbr.energyLabel },
          ].map((item) => (
            <div key={item.label} className="border border-warm-gray-200 rounded-[4px] p-3 bg-warm-gray-100">
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

      <div className="mt-12 pt-6 border-t border-warm-gray-200">
        <h3 className="font-serif text-lg text-navy mb-3">Datakilder</h3>
        <ul className="text-xs text-warm-gray-500 space-y-1">
          <li>• Adressedata: DAWA, Klimadatastyrelsen (api.dataforsyningen.dk)</li>
          <li>• Befolkningsdata: Danmarks Statistik, tabel FOLK1A (api.statbank.dk)</li>
          <li>• Indkomstdata: Danmarks Statistik, tabel INDKP101</li>
          <li>• Ejendomsdata: Simuleret (BBR-integration kræver Datafordeler-adgang)</li>
          <li>• Plandata: Simuleret (kræver Plandata.dk API-adgang)</li>
          <li>• Miljødata: Simuleret (kræver Danmarks Miljøportal API-adgang)</li>
          <li>• Klimadata: Simuleret (kræver DMI Open Data API-nøgle)</li>
        </ul>
        <div className="mt-6 p-4 border border-warm-gray-200 rounded-[4px] bg-warm-gray-100">
          <p className="text-xs text-warm-gray-700">
            <strong>Disclaimer:</strong> BoligScanner er i betaversion. Simulerede data anvendes hvor API-adgang kræver registrering.
            Brug ikke denne rapport som grundlag for købsbeslutninger uden professionel rådgivning.
          </p>
        </div>
        <p className="text-center text-xs text-warm-gray-500 mt-6">Powered by BoligScanner — beta version</p>
      </div>
    </main>
  );
}

export default function RapportPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-warm-gray-300 border-t-navy rounded-full animate-spin" />
      </main>
    }>
      <RapportContent />
    </Suspense>
  );
}
