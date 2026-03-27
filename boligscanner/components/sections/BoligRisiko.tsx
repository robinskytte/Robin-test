'use client';

import { RiskData } from '@/lib/types';
import ScoreBadge from '@/components/ScoreBadge';
import DataSourceFooter from '@/components/DataSourceFooter';
import SimulatedDataText from '@/components/SimulatedDataText';
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
      <ul className="text-sm font-sans space-y-1">
        <li>• <SimulatedDataText>Jordforurening: {environmental.contamination.status === 'ingen' ? 'Ingen registreret' : environmental.contamination.status}</SimulatedDataText></li>
        <li>• <SimulatedDataText>Oversvømmelsesrisiko: {environmental.floodRisk.level}</SimulatedDataText></li>
        <li>• <SimulatedDataText>Radon: {environmental.radonRisk.level} ({environmental.radonRisk.bqm3} Bq/m³)</SimulatedDataText></li>
      </ul>

      {/* Contamination */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Jordforurening <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret)</span></h3>
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: contaminationColorMap[environmental.contamination.status] }}
          />
          <SimulatedDataText className="text-sm font-sans">
            {environmental.contamination.status === 'ingen'
              ? 'Ingen registreret forurening'
              : `Kortlagt som ${environmental.contamination.status}`}
          </SimulatedDataText>
        </div>
        <p className="text-xs text-red-400 opacity-75 mt-1 font-sans">{environmental.contamination.description}</p>
      </div>

      {/* Flood risk */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Oversvømmelsesrisiko <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret)</span></h3>
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
          <span className="text-sm font-semibold text-red-400 opacity-75 w-8 text-right">
            {environmental.floodRisk.score}/10
          </span>
        </div>
        <p className="text-xs text-red-400 opacity-75 font-sans">{environmental.floodRisk.description}</p>
      </div>

      {/* Noise level */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Støjniveau <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret)</span></h3>
        <div className="flex items-center gap-3">
          <SimulatedDataText className="px-2 py-0.5 text-xs font-semibold rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
            {environmental.noiseLevel.db} dB
          </SimulatedDataText>
          <SimulatedDataText className="text-sm font-sans capitalize">{environmental.noiseLevel.level}</SimulatedDataText>
        </div>
      </div>

      {/* Radon */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Radonrisiko <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret)</span></h3>
        <div className="flex items-center gap-3">
          <SimulatedDataText className="px-2 py-0.5 text-xs font-semibold rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
            {environmental.radonRisk.level.toUpperCase()}
          </SimulatedDataText>
          <SimulatedDataText className="text-sm font-sans">{environmental.radonRisk.bqm3} Bq/m³</SimulatedDataText>
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
