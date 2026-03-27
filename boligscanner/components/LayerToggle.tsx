'use client';

interface LayerToggleProps {
  activeLayers: string[];
  onToggle: (layer: string) => void;
}

const LAYERS = [
  { key: 'family',       label: 'Familievenlighed', color: '#5C8A6A' },
  { key: 'risk',         label: 'Risici',           color: '#C4594A' },
  { key: 'building',     label: 'Byggepotentiale',  color: '#B8944F' },
  { key: 'neighborhood', label: 'N\u00E6romr\u00E5de',        color: '#1B2A4A' },
  { key: 'climate',      label: 'Klimarisiko',      color: '#D4915C' },
  { key: 'trends',       label: 'Boligpuls',        color: '#2A3D66' },
] as const;

export default function LayerToggle({ activeLayers, onToggle }: LayerToggleProps) {
  return (
    <div className="absolute top-3 right-3 z-[1000] bg-white border border-warm-gray-200 rounded-[4px] shadow-sm p-2 flex flex-col gap-1 font-sans text-sm">
      {LAYERS.map(({ key, label, color }) => {
        const active = activeLayers.includes(key);
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-[4px] hover:bg-warm-gray-100 transition-colors text-warm-gray-900 text-left"
          >
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={
                active
                  ? { backgroundColor: color }
                  : { border: `2px solid ${color}`, backgroundColor: 'transparent' }
              }
            />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
