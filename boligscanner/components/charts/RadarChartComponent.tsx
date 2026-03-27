'use client';

import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

interface RadarChartProps {
  data: { dimension: string; value: number; fullMark: number }[];
  height?: number;
}

export default function RadarChartComponent({ data, height = 250 }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#E8E6E0" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 11, fill: '#6B6560' }}
        />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            border: '1px solid #E8E6E0',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#1B2A4A"
          fill="#1B2A4A"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
