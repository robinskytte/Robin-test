'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: { year: number; value: number }[];
  color?: string;
  label?: string;
  formatValue?: (v: number) => string;
  height?: number;
}

export default function TrendChart({
  data,
  color = '#1B2A4A',
  label = 'Værdi',
  formatValue = (v) => v.toLocaleString('da-DK'),
  height = 200,
}: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: '#6B6560' }}
          axisLine={{ stroke: '#E8E6E0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6B6560' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(v)}
          width={70}
        />
        <Tooltip
          formatter={(value: number) => [formatValue(value), label]}
          labelStyle={{ color: '#1B2A4A', fontWeight: 600 }}
          contentStyle={{
            border: '1px solid #E8E6E0',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
