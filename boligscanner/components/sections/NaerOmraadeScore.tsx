'use client';

import { NeighborhoodData } from '@/lib/types';
import ScoreBadge from '@/components/ScoreBadge';
import DataSourceFooter from '@/components/DataSourceFooter';
import RadarChartComponent from '@/components/charts/RadarChartComponent';

interface NaerOmraadeScoreProps {
  data: NeighborhoodData;
}

export default function NaerOmraadeScore({ data }: NaerOmraadeScoreProps) {
  // Compute radar dimensions
  const safetyScore = Math.max(0, Math.min(10, 10 - (data.crimeIndex - 50) / 10));
  const incomeScore = Math.min(10, data.incomeLevel / 15);
  const facilitiesScore = Math.min(10, data.amenities.length * 2);
  const ageDiversityScore = Math.min(10, data.ageDistribution.length * 1.5);
  const accessibilityScore = Math.min(10, (facilitiesScore + safetyScore) / 2);

  const radarData = [
    { dimension: 'Sikkerhed', value: Number(safetyScore.toFixed(1)), fullMark: 10 },
    { dimension: 'Indkomst', value: Number(incomeScore.toFixed(1)), fullMark: 10 },
    { dimension: 'Faciliteter', value: Number(facilitiesScore.toFixed(1)), fullMark: 10 },
    { dimension: 'Aldersfordeling', value: Number(ageDiversityScore.toFixed(1)), fullMark: 10 },
    { dimension: 'Tilgængelighed', value: Number(accessibilityScore.toFixed(1)), fullMark: 10 },
  ];

  // Find max percentage for scaling horizontal bars
  const maxPercentage = Math.max(...data.ageDistribution.map((d) => d.percentage));

  return (
    <section className="bg-white rounded-lg border border-warm-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy text-lg">
            🏘️
          </div>
          <h2 className="text-xl font-serif text-navy">Nabolagsprofil</h2>
        </div>
        <ScoreBadge type="score" value={data.score} />
      </div>

      {/* Key findings */}
      <ul className="text-sm font-sans text-warm-gray-700 space-y-1">
        <li>• Kriminalitetsindeks: {data.crimeIndex} (landsgennemsnit: 100)</li>
        <li>• Indkomstniveau: {data.incomeLevel} (landsgennemsnit: 100)</li>
        <li>• {data.amenities.length} faciliteter i nærområdet</li>
      </ul>

      {/* Radar chart */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Nabolagsdimensioner</h3>
        <RadarChartComponent data={radarData} />
      </div>

      {/* Age distribution - horizontal bars */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-3">Aldersfordeling</h3>
        <div className="space-y-2">
          {data.ageDistribution.map((group, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs font-sans text-warm-gray-500 w-16 text-right shrink-0">
                {group.group}
              </span>
              <div className="flex-1 h-5 bg-warm-gray-100 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all"
                  style={{
                    width: `${(group.percentage / maxPercentage) * 100}%`,
                    backgroundColor: '#1B2A4A',
                    opacity: 0.7 + (group.percentage / maxPercentage) * 0.3,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-warm-gray-700 w-10 shrink-0">
                {group.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities table */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Faciliteter i nærområdet</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-warm-gray-200 text-left text-warm-gray-500">
                <th className="pb-2 pr-4 font-medium">Navn</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 font-medium">Afstand</th>
              </tr>
            </thead>
            <tbody>
              {data.amenities.map((amenity, index) => (
                <tr key={index} className="border-b border-warm-gray-100 text-warm-gray-700">
                  <td className="py-2 pr-4">{amenity.name}</td>
                  <td className="py-2 pr-4 capitalize">{amenity.type}</td>
                  <td className="py-2">{amenity.distance} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DataSourceFooter
        sources={[
          { label: 'Befolkningsdata', source: 'Danmarks Statistik' },
          { label: 'Kriminalitet og faciliteter', source: 'Simuleret datasæt', simulated: true },
        ]}
      />
    </section>
  );
}
