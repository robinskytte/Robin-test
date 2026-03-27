'use client';

import { RiskData } from '@/lib/types';
import ScoreBadge from '@/components/ScoreBadge';
import DataSourceFooter from '@/components/DataSourceFooter';
import { getRiskColor } from '@/lib/scoring';

interface BoligRisikoProps {
  data: RiskData;
}

export default function BoligRisiko({ data }: BoligRisikoProps) {
  const { environmental } = data;

  const contaminationColorMap: Record<string, string> = {
    ingen: '#5C8A6A',
    V1: '#D4915C',
    V2: '#C4594A',
  };

  return (
    <section className="bg-white rounded-lg border border-warm-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-terra/10 flex items-center justify-center text-terra text-lg">
            ⚠️
          </div>
          <h2 className="text-xl font-serif text-navy">Risikoscreening</h2>
        </div>
        <ScoreBadge type="risk" value={data.overallLevel} />
      </div>

      {/* Key findings */}
      <ul className="text-sm font-sans text-warm-gray-700 space-y-1">
        <li>• Jordforurening: {environmental.contamination.status === 'ingen' ? 'Ingen registreret' : environmental.contamination.status}</li>
        <li>• Oversvømmelsesrisiko: {environmental.floodRisk.level}</li>
        <li>• Radon: {environmental.radonRisk.level} ({environmental.radonRisk.bqm3} Bq/m³)</li>
      </ul>

      {/* Contamination */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Jordforurening</h3>
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: contaminationColorMap[environmental.contamination.status] }}
          />
          <span className="text-sm font-sans text-warm-gray-700">
            {environmental.contamination.status === 'ingen'
              ? 'Ingen registreret forurening'
              : `Kortlagt som ${environmental.contamination.status}`}
          </span>
        </div>
        <p className="text-xs text-warm-gray-500 mt-1 font-sans">{environmental.contamination.description}</p>
      </div>

      {/* Flood risk */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Oversvømmelsesrisiko</h3>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex-1 h-2 bg-warm-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(environmental.floodRisk.score * 10, 100)}%`,
                backgroundColor: getRiskColor(environmental.floodRisk.level),
              }}
            />
          </div>
          <span className="text-sm font-semibold text-warm-gray-700 w-8 text-right">
            {environmental.floodRisk.score}/10
          </span>
        </div>
        <p className="text-xs text-warm-gray-500 font-sans">{environmental.floodRisk.description}</p>
      </div>

      {/* Noise level */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Støjniveau</h3>
        <div className="flex items-center gap-3">
          <span
            className="px-2 py-0.5 text-xs font-semibold text-white rounded"
            style={{ backgroundColor: getRiskColor(environmental.noiseLevel.level) }}
          >
            {environmental.noiseLevel.db} dB
          </span>
          <span className="text-sm font-sans text-warm-gray-700 capitalize">{environmental.noiseLevel.level}</span>
        </div>
      </div>

      {/* Radon */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Radonrisiko</h3>
        <div className="flex items-center gap-3">
          <span
            className="px-2 py-0.5 text-xs font-semibold text-white rounded"
            style={{ backgroundColor: getRiskColor(environmental.radonRisk.level) }}
          >
            {environmental.radonRisk.level.toUpperCase()}
          </span>
          <span className="text-sm font-sans text-warm-gray-700">{environmental.radonRisk.bqm3} Bq/m³</span>
        </div>
      </div>

      {/* Servitutter note */}
      <div className="bg-warm-gray-50 rounded-md p-3 border border-warm-gray-200">
        <p className="text-xs font-sans text-warm-gray-600">
          <span className="font-semibold">Servitutter:</span> Kræver opslag i Tinglysningsregistret
        </p>
      </div>

      <DataSourceFooter
        sources={[
          { label: 'Miljødata', source: 'Simuleret datasæt baseret på offentlige registre', simulated: true },
        ]}
      />
    </section>
  );
}
