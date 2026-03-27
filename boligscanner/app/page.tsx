'use client';

import { useRouter } from 'next/navigation';
import AddressSearch from '@/components/AddressSearch';
import { DawaAutocompleteResult } from '@/lib/types';

const DIMENSIONS = [
  { icon: '🏠', title: 'Familievenlighed', desc: 'Skoler, institutioner og pendlertider' },
  { icon: '⚠', title: 'Risikoscreening', desc: 'Forurening, oversvømmelse og støj' },
  { icon: '📐', title: 'Byggepotentiale', desc: 'Udvidelsesmuligheder og bebyggelsesprocent' },
  { icon: '📍', title: 'Nabolagsprofil', desc: 'Kriminalitet, indkomst og faciliteter' },
  { icon: '🌿', title: 'Klimarisiko 2050', desc: 'Havstigning, skybrud og klimasikring' },
  { icon: '📈', title: 'Boligpuls', desc: 'Prisudvikling og områdetrend' },
];

export default function HomePage() {
  const router = useRouter();

  const handleSelect = (address: DawaAutocompleteResult) => {
    router.push(`/analyse?id=${encodeURIComponent(address.adresse.id)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-serif text-xl text-navy tracking-tight">BoligScanner</span>
          <span className="text-xs text-warm-gray-500 hidden sm:block">Beta — Gratis at bruge</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl w-full text-center">
          <p className="text-sm font-medium text-gold uppercase tracking-widest mb-5">
            Ejendomsanalyse
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-navy mb-6 leading-tight">
            Kend din bolig<br />— før du køber
          </h1>
          <p className="text-lg text-warm-gray-700 mb-10 max-w-lg mx-auto leading-relaxed">
            Én samlet rapport over risici, potentiale og nabolag for enhver dansk adresse.
          </p>

          <div className="w-full max-w-xl mx-auto mb-3">
            <AddressSearch onSelect={handleSelect} large />
          </div>
          <p className="text-sm text-warm-gray-500">
            Søg på f.eks. <em>Vesterbrogade 1, København</em>
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Dimensions */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <p className="text-xs font-semibold text-warm-gray-500 uppercase tracking-widest mb-10 text-center">
          Hvad rapporten dækker
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
          {DIMENSIONS.map((dim) => (
            <div key={dim.title} className="bg-white px-6 py-8">
              <div className="text-xl mb-3">{dim.icon}</div>
              <h3 className="text-sm font-semibold text-navy mb-1">{dim.title}</h3>
              <p className="text-xs text-warm-gray-700 leading-relaxed">{dim.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-warm-gray-500">
          <span>Data: Danmarks Statistik · DAWA · OpenStreetMap</span>
          <span className="text-center">
            BoligScanner beta — simulerede data. Ikke juridisk rådgivning.
          </span>
        </div>
      </footer>
    </div>
  );
}
