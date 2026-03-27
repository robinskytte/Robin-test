import { getRiskColor, getGradeColor, getScoreColor, getTrajectoryColor, getTrajectoryArrow } from '@/lib/scoring';

interface ScoreBadgeProps {
  type: 'grade' | 'risk' | 'score' | 'trajectory';
  value: string | number;
  max?: number;
  label?: string;
}

export default function ScoreBadge({ type, value, max = 10, label }: ScoreBadgeProps) {
  let color: string;
  let display: string;

  switch (type) {
    case 'grade':
      color = getGradeColor(value as string);
      display = value as string;
      break;
    case 'risk':
      color = getRiskColor(value as 'LAV' | 'MODERAT' | 'HØJ');
      display = value as string;
      break;
    case 'score':
      color = getScoreColor(value as number, max);
      display = `${value}/${max}`;
      break;
    case 'trajectory':
      color = getTrajectoryColor(value as 'STIGENDE' | 'STABIL' | 'FALDENDE');
      display = `${getTrajectoryArrow(value as 'STIGENDE' | 'STABIL' | 'FALDENDE')} ${value}`;
      break;
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-white rounded-[4px] min-w-[3rem]"
        style={{ backgroundColor: color }}
      >
        {display}
      </span>
      {label && <span className="text-sm text-warm-gray-700">{label}</span>}
    </div>
  );
}
