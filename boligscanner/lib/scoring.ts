export function getRiskColor(level: 'LAV' | 'MODERAT' | 'HØJ' | 'lav' | 'moderat' | 'høj'): string {
  const l = level.toLowerCase();
  if (l === 'lav') return '#5C8A6A';
  if (l === 'moderat') return '#D4915C';
  return '#C4594A';
}

export function getGradeColor(grade: string): string {
  if (grade === 'A' || grade === 'B') return '#5C8A6A';
  if (grade === 'C' || grade === 'D') return '#D4915C';
  return '#C4594A';
}

export function getScoreColor(score: number, max = 10): string {
  const ratio = score / max;
  if (ratio >= 0.7) return '#5C8A6A';
  if (ratio >= 0.4) return '#D4915C';
  return '#C4594A';
}

export function getTrajectoryColor(trajectory: 'STIGENDE' | 'STABIL' | 'FALDENDE'): string {
  if (trajectory === 'STIGENDE') return '#5C8A6A';
  if (trajectory === 'STABIL') return '#D4915C';
  return '#C4594A';
}

export function getTrajectoryArrow(trajectory: 'STIGENDE' | 'STABIL' | 'FALDENDE'): string {
  if (trajectory === 'STIGENDE') return '↗';
  if (trajectory === 'STABIL') return '→';
  return '↘';
}

export function formatNumber(n: number): string {
  return n.toLocaleString('da-DK');
}

export function formatCurrency(n: number): string {
  return n.toLocaleString('da-DK') + ' kr.';
}
