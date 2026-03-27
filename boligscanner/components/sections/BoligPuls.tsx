'use client';

import { TrendData } from '@/lib/types';
import ScoreBadge from '@/components/ScoreBadge';
import DataSourceFooter from '@/components/DataSourceFooter';
import TrendChart from '@/components/charts/TrendChart';

interface BoligPulsProps {
  data: TrendData;
}

export default function BoligPuls({ data }: BoligPulsProps) {
  return (
    <section className="border border-warm-gray-200 rounded-[4px] p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl text-navy">Områdets udvikling</h3>
        <ScoreBadge type="trajectory" value={data.trajectory} />
      </div>

      <ul className="text-sm text-warm-gray-700 space-y-1 mb-5">
        <li>• Prisudviklingen i området over de seneste år</li>
        <li>• Befolkningstendens viser {data.trajectory === 'STIGENDE' ? 'vækst' : data.trajectory === 'STABIL' ? 'stabilitet' : 'fald'}</li>
        <li>• Indkomstudviklingen afspejler den lokale økonomi</li>
      </ul>

      {/* Price History Chart */}
      {data.priceHistory.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-warm-gray-900 mb-2">Prisudvikling (kr./m²)</h4>
          <TrendChart
            data={data.priceHistory}
            color="#1B2A4A"
            label="Kr./m²"
            formatValue={(v) => v.toLocaleString('da-DK')}
            height={180}
          />
        </div>
      )}

      {/* Population Trend Chart */}
      {data.populationTrend.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-warm-gray-900 mb-2">Befolkningsudvikling</h4>
          <TrendChart
            data={data.populationTrend}
            color="#5C8A6A"
            label="Indbyggere"
            formatValue={(v) => v.toLocaleString('da-DK')}
            height={180}
          />
        </div>
      )}

      {/* Income Trend Chart */}
      {data.incomeTrend.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-warm-gray-900 mb-2">Indkomstudvikling</h4>
          <TrendChart
            data={data.incomeTrend}
            color="#B8944F"
            label="Gns. indkomst"
            formatValue={(v) => v.toLocaleString('da-DK') + ' kr.'}
            height={180}
          />
        </div>
      )}

      <DataSourceFooter
        sources={[
          { label: 'Ejendomsværdi', source: 'Danmarks Statistik, tabel EJEN55' },
          { label: 'Befolkning', source: 'Danmarks Statistik, tabel FOLK1A' },
          { label: 'Indkomst', source: 'Danmarks Statistik, tabel INDKP101' },
        ]}
      />
    </section>
  );
}
