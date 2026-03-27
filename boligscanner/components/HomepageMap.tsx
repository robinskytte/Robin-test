'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const DynamicMap = dynamic(
  () => import('@/components/AnalysisMap'),
  { ssr: false, loading: () => <div className="w-full h-96 bg-warm-gray-100 rounded-lg flex items-center justify-center text-warm-gray-500">Kort indlæses...</div> }
);

interface HomepageMapProps {
  onAddressSelect?: (lat: number, lng: number) => void;
}

export default function HomepageMap({ onAddressSelect }: HomepageMapProps) {
  const [activeLayers] = useState(['family']);

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-serif text-navy mb-3">Udforskeelse på kort</h3>
        <p className="text-sm text-warm-gray-600 mb-4">Søg efter en adresse ovenfor for at udforske boligmarkedet på kortet.</p>
      </div>
      <div className="rounded-lg overflow-hidden border border-warm-gray-200 shadow-sm h-96">
        <DynamicMap
          lat={56.26}
          lng={9.50}
          activeLayers={activeLayers}
        />
      </div>
      <p className="text-xs text-warm-gray-500 italic">Kort viser Danmark centreret. Søg efter en konkret adresse for at få præcise analyser.</p>
    </div>
  );
}
