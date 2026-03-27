'use client';

import { FamilyData } from '@/lib/types';
import ScoreBadge from '@/components/ScoreBadge';
import DataSourceFooter from '@/components/DataSourceFooter';

interface FamilieFlytProps {
  data: FamilyData;
}

export default function FamilieFlyt({ data }: FamilieFlytProps) {
  return (
    <section className="bg-white rounded-lg border border-warm-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center text-sage text-lg">
            👨‍👩‍👧
          </div>
          <h2 className="text-xl font-serif text-navy">Familievenlighed</h2>
        </div>
        <ScoreBadge type="grade" value={data.score} />
      </div>

      {/* Key findings */}
      <ul className="text-sm font-sans text-warm-gray-700 space-y-1">
        <li>• <span className="text-red-400 opacity-75">{data.schools.length} skoler i nærheden — nærmeste {data.schools[0]?.distance} km væk</span></li>
        <li>• <span className="text-red-400 opacity-75">{data.daycares.length} daginstitutioner tilgængelige</span></li>
        <li>• <span className="text-red-400 opacity-75">Nærmeste store byer: {data.majorCities[0]?.name} ({data.majorCities[0]?.distance} km), {data.majorCities[1]?.name} ({data.majorCities[1]?.distance} km)</span></li>
      </ul>

      {/* Schools table - Simulated Data */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Skoler <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret data)</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-warm-gray-200 text-left text-warm-gray-500">
                <th className="pb-2 pr-4 font-medium">Navn</th>
                <th className="pb-2 pr-4 font-medium">Afstand</th>
                <th className="pb-2 pr-4 font-medium">Karaktersnit</th>
                <th className="pb-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {data.schools.map((school, index) => (
                <tr key={index} className="border-b border-warm-gray-100 text-red-400 opacity-75">
                  <td className="py-2 pr-4">{school.name}</td>
                  <td className="py-2 pr-4">{school.distance} km</td>
                  <td className="py-2 pr-4">{school.gradeAverage.toFixed(1)}</td>
                  <td className="py-2 capitalize">{school.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daycares table - Simulated Data */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Daginstitutioner <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret data)</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-warm-gray-200 text-left text-warm-gray-500">
                <th className="pb-2 pr-4 font-medium">Navn</th>
                <th className="pb-2 pr-4 font-medium">Afstand</th>
                <th className="pb-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {data.daycares.map((daycare, index) => (
                <tr key={index} className="border-b border-warm-gray-100 text-red-400 opacity-75">
                  <td className="py-2 pr-4">{daycare.name}</td>
                  <td className="py-2 pr-4">{daycare.distance} km</td>
                  <td className="py-2 capitalize">{daycare.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Major Cities Distance - Simulated Data */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Afstand til større byer <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret)</span></h3>
        <div className="grid grid-cols-2 gap-4">
          {data.majorCities.map((city, idx) => (
            <div key={idx} className="bg-warm-gray-50 rounded-md p-3 text-center">
              <p className="text-xs text-warm-gray-500 font-sans">{city.name}</p>
              <p className="text-lg font-semibold text-red-400 opacity-75">{city.distance} km</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sports Facilities - Simulated Data */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Sportsfaciliteter <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret data)</span></h3>
        <ul className="text-sm font-sans text-red-400 opacity-75 space-y-1">
          {data.sportsFacilities.map((facility, index) => (
            <li key={index}>• {facility.name} ({facility.type}) — {facility.distance} km</li>
          ))}
        </ul>
      </div>

      {/* Parks - Simulated Data */}
      <div>
        <h3 className="text-sm font-semibold font-sans text-navy mb-2">Parker og grønne områder <span className="text-xs text-red-400 opacity-75 font-normal">(simuleret data)</span></h3>
        <ul className="text-sm font-sans text-red-400 opacity-75 space-y-1">
          {data.parks.map((park, index) => (
            <li key={index}>• {park.name} — {park.distance} km</li>
          ))}
        </ul>
      </div>

      <DataSourceFooter
        sources={[
          { label: 'Skoler, daginstitutioner, sports- og parkfaciliteter', source: 'Simuleret datasæt', simulated: true },
          { label: 'Afstand til byer', source: 'Simuleret baseret på adresse-koordinater', simulated: true },
          { label: 'Adressedata', source: 'DAWA (Danmarks Adressers Web API)' },
        ]}
      />
    </section>
  );
}
