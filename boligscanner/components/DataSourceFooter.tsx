interface DataSource {
  label: string;
  source: string;
  simulated?: boolean;
}

interface DataSourceFooterProps {
  sources: DataSource[];
}

export default function DataSourceFooter({ sources }: DataSourceFooterProps) {
  return (
    <div className="mt-4 pt-3 border-t border-warm-gray-200">
      <p className="text-xs font-semibold text-warm-gray-500 mb-1">Datakilder:</p>
      <ul className="space-y-0.5">
        {sources.map((s, i) => (
          <li key={i} className="text-xs text-warm-gray-500">
            • {s.label}: {s.source}
            {s.simulated && (
              <span className="text-amber italic"> — Simuleret data</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
