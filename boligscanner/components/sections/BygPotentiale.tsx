'use client';

import { BuildingPotentialData } from '@/lib/types';
import DataSourceFooter from '@/components/DataSourceFooter';
import SimulatedDataText from '@/components/SimulatedDataText';
import BarChartComponent from '@/components/charts/BarChartComponent';
import { formatCurrency, formatNumber } from '@/lib/scoring';

interface BygPotentialeProps {
  data: BuildingPotentialData;
}

export default function BygPotentiale({ data }: BygPotentialeProps) {
  const chartData = [
    { name: 'Nuværende', value: data.currentArea, color: '#1B2A4A' },
    { name: 'Tilgængelig', value: data.allowedArea, color: '#5C8A6A' },
  ];

  const zoneLabels: Record<string, string> = {
    byzone: 'Byzone',
    landzone: 'Landzone',
    sommerhusområde: 'Sommerhusområde',
  };

  return (
    <section className="bg-white rounded-lg border border-warm-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy text-lg">
            🏗️
          </div>
          <h2 className="text-xl font-serif text-navy">Udvidelsesmuligheder</h2>
        </div>
      </div>

      {/* Key findings */}
      <ul className="text-sm font-sans space-y-1">
        <li>• <SimulatedDataText>Resterende udnyttelig areal: {formatNumber(data.remainingArea)} m²</SimulatedDataText></li>
        <li>• <SimulatedDataText>Estimeret udvidelsesværdi: {formatCurrency(data.estimatedExtensionValue)}</SimulatedDataText></li>
      </ul>

      {/* Bar chart: current vs allowed */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Nuværende vs. tilladt areal (m²)</h3>
        <BarChartComponent
          data={chartData}
          formatValue={(v) => `${formatNumber(v)} m²`}
        />
      </div>

      {/* Remaining buildable area */}
      <div className="bg-warm-gray-50 rounded-md p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-sans text-warm-gray-600">Resterende m² til udnyttelse</span>
          <SimulatedDataText className="text-lg font-semibold">{formatNumber(data.remainingArea)} m²</SimulatedDataText>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-sans text-warm-gray-600">Estimeret udvidelsesværdi</span>
          <SimulatedDataText className="text-lg font-semibold">{formatCurrency(data.estimatedExtensionValue)}</SimulatedDataText>
        </div>
      </div>

      {/* Plan data details */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Plandata <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret)</span></h3>
        <div className="grid grid-cols-2 gap-3 text-sm font-sans">
          <div className="bg-warm-gray-50 rounded-md p-3">
            <p className="text-xs text-warm-gray-500">Zone</p>
            <SimulatedDataText className="font-semibold block">{zoneLabels[data.planData.zoneStatus]}</SimulatedDataText>
          </div>
          <div className="bg-warm-gray-50 rounded-md p-3">
            <p className="text-xs text-warm-gray-500">Maks. højde</p>
            <SimulatedDataText className="font-semibold block">{data.planData.maxHeight} m</SimulatedDataText>
          </div>
          <div className="bg-warm-gray-50 rounded-md p-3">
            <p className="text-xs text-warm-gray-500">Bebyggelsesprocent</p>
            <SimulatedDataText className="font-semibold block">{data.planData.bebyggelsesprocent}%</SimulatedDataText>
          </div>
          <div className="bg-warm-gray-50 rounded-md p-3">
            <p className="text-xs text-warm-gray-500">Lokalplanref.</p>
            <SimulatedDataText className="font-semibold block">{data.planData.lokalplanRef}</SimulatedDataText>
          </div>
        </div>
      </div>

      <DataSourceFooter
        sources={[
          { label: 'BBR-data', source: 'Simuleret BBR-udtræk', simulated: true },
          { label: 'Plandata', source: 'Simuleret plandata', simulated: true },
        ]}
      />
    </section>
  );
}
