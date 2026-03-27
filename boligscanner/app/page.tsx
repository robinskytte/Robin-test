'use client';

import { useRouter } from 'next/navigation';
import AddressSearch from '@/components/AddressSearch';
import { DawaAutocompleteResult } from '@/lib/types';

const DIMENSIONS = [
  { icon: '👨‍👩‍👧‍👦', title: 'Familievenlighed', desc: 'Skoler, institutioner, legepladser og pendlertider' },
  { icon: '⚠️', title: 'Risikoscreening', desc: 'Forurening, oversvømmelse, støj og radon' },
  { icon: '🏗️', title: 'Byggepotentiale', desc: 'Udvidelsesmuligheder og bebyggelsesprocent' },
  { icon: '📊', title: 'Nabolagsprofil', desc: 'Kriminalitet, indkomst og faciliteter' },
  { icon: '🌡️', title: 'Klimarisiko 2050', desc: 'Havstigning, skybrud og klimasikring' },
  { icon: '📈', title: 'Boligpuls', desc: 'Prisudvikling, befolkning og områdetrend' },
];

export default function HomePage() {
  const router = useRouter();

  const handleSelect = (address: DawaAutocompleteResult) => {
    router.push(`/analyse?id=${encodeURIComponent(address.adresse.id)}`);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-2xl text-navy tracking-tight">BoligScanner</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        <div className="max-w-2xl w-full text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-navy mb-4 leading-tight">
            Kend din bolig — før du køber
          </h2>
          <p className="text-lg text-warm-gray-700 mb-10">
            Samlet overblik over risici, potentiale og nabolag for enhver dansk adresse
          </p>

          <div className="w-full max-w-xl mx-auto mb-4">
            <AddressSearch onSelect={handleSelect} large />
          </div>
          <p className="text-sm text-warm-gray-500">
            Indtast en adresse og få en komplet analyse på sekunder
          </p>
        </div>
      </section>

      {/* Dimensions Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIMENSIONS.map((dim) => (
            <div
              key={dim.title}
              className="border border-warm-gray-200 rounded-[4px] p-5 bg-white hover:border-warm-gray-300 transition-colors"
            >
              <div className="text-2xl mb-2">{dim.icon}</div>
              <h3 className="font-serif text-lg text-navy mb-1">{dim.title}</h3>
              <p className="text-sm text-warm-gray-700">{dim.desc}</p>
            </div>
          ))}
        </div>

        {/* Data sources */}
        <div className="mt-12 text-center">
          <p className="text-xs text-warm-gray-500 mb-2">Data fra</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-warm-gray-500">
            <span>Danmarks Statistik</span>
            <span>•</span>
            <span>DAWA / Klimadatastyrelsen</span>
            <span>•</span>
            <span>OpenStreetMap</span>
          </div>
        </div>
      </section>
    </main>
  );
}
