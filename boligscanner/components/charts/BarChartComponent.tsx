'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  formatValue?: (v: number) => string;
}

export default function BarChartComponent({
  data,
  height = 200,
  formatValue = (v) => v.toLocaleString('da-DK'),
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6B6560' }}
          axisLine={{ stroke: '#E8E6E0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6B6560' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(v)}
          width={60}
        />
        <Tooltip
          formatter={(value: number) => [formatValue(value), '']}
          contentStyle={{
            border: '1px solid #E8E6E0',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || '#1B2A4A'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
