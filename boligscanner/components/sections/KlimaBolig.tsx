'use client';

import { ClimateData } from '@/lib/types';
import ScoreBadge from '@/components/ScoreBadge';
import DataSourceFooter from '@/components/DataSourceFooter';

interface KlimaBoligProps {
  data: ClimateData;
}

export default function KlimaBolig({ data }: KlimaBoligProps) {
  const riskLabel = data.precipitationRisk.toUpperCase() as 'LAV' | 'MODERAT' | 'HØJ';

  return (
    <section className="bg-white rounded-lg border border-warm-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center text-amber text-lg">
            🌊
          </div>
          <h2 className="text-xl font-serif text-navy">Klimarisiko 2050</h2>
        </div>
        <ScoreBadge type="risk" value={riskLabel} />
      </div>

      {/* Key findings */}
      <ul className="text-sm font-sans text-warm-gray-700 space-y-1">
        <li>• Højde over havet: {data.elevation} m</li>
        <li>• Havvandsstigning risikoscore: {data.seaLevelRiskScore}/10</li>
        <li>• {data.buildingVulnerability.factors.length} sårbarhedsfaktorer identificeret</li>
      </ul>

      {/* Elevation and sea level */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-warm-gray-50 rounded-md p-4 text-center">
          <p className="text-xs text-warm-gray-500 font-sans">Højde over havet</p>
          <p className="text-2xl font-semibold text-navy">{data.elevation} m</p>
        </div>
        <div className="bg-warm-gray-50 rounded-md p-4 text-center">
          <p className="text-xs text-warm-gray-500 font-sans">Havvandsstigningsrisiko</p>
          <p className="text-2xl font-semibold text-navy">{data.seaLevelRiskScore}<span className="text-sm text-warm-gray-400">/10</span></p>
        </div>
      </div>

      {/* Building vulnerability */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Bygningens sårbarhed</h3>
        <ul className="text-sm font-sans text-warm-gray-700 space-y-1">
          {data.buildingVulnerability.factors.map((factor, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-terra mt-0.5">•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Adaptations table */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Anbefalede tilpasninger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-warm-gray-200 text-left text-warm-gray-500">
                <th className="pb-2 pr-4 font-medium">Tiltag</th>
                <th className="pb-2 font-medium text-right">Estimeret pris</th>
              </tr>
            </thead>
            <tbody>
              {data.adaptations.map((adaptation, index) => (
                <tr key={index} className="border-b border-warm-gray-100 text-warm-gray-700">
                  <td className="py-2 pr-4">{adaptation.description}</td>
                  <td className="py-2 text-right font-medium">{adaptation.estimatedCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline: 2025 -> 2050 -> 2080 */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-3">Klimatidslinje</h3>
        <div className="relative flex items-center justify-between px-4">
          {/* Connecting line */}
          <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-warm-gray-200 -translate-y-1/2" />

          {/* 2025 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white text-xs font-semibold">
              Nu
            </div>
            <span className="text-xs text-warm-gray-500 mt-1 font-sans">2025</span>
          </div>

          {/* 2050 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-amber flex items-center justify-center text-white text-xs font-semibold">
              +25
            </div>
            <span className="text-xs text-warm-gray-500 mt-1 font-sans">2050</span>
          </div>

          {/* 2080 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-terra flex items-center justify-center text-white text-xs font-semibold">
              +55
            </div>
            <span className="text-xs text-warm-gray-500 mt-1 font-sans">2080</span>
          </div>
        </div>
        <div className="flex justify-between px-4 mt-2">
          <p className="text-xs text-warm-gray-400 font-sans text-center w-20">Nuværende risiko</p>
          <p className="text-xs text-warm-gray-400 font-sans text-center w-20">Moderat stigning</p>
          <p className="text-xs text-warm-gray-400 font-sans text-center w-20">Høj eksponering</p>
        </div>
      </div>

      <DataSourceFooter
        sources={[
          { label: 'Klimadata', source: 'Simuleret datasæt baseret på DMI-fremskrivninger', simulated: true },
        ]}
      />
    </section>
  );
}
