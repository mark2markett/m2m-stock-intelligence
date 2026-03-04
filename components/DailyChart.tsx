'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TechnicalIndicators } from '@/lib/utils/technicalIndicators';
import type { HistoricalDataPoint } from '@/lib/types';

interface DailyChartProps {
  historicalData: HistoricalDataPoint[];
}

export const DailyChart: React.FC<DailyChartProps> = ({ historicalData }) => {
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length < 20) return [];

    const closes = historicalData.map(d => d.close);
    const ema20 = TechnicalIndicators.ema(closes, 20);
    const ema50 = TechnicalIndicators.ema(closes, 50);

    return historicalData.map((d, i) => ({
      date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      close: d.close,
      ema20: ema20[i],
      ema50: ema50[i],
    }));
  }, [historicalData]);

  if (chartData.length === 0) return null;

  const closes = chartData.map(d => d.close);
  const minPrice = Math.min(...closes) * 0.98;
  const maxPrice = Math.max(...closes) * 1.02;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickLine={{ stroke: '#374151' }}
            axisLine={{ stroke: '#374151' }}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickLine={{ stroke: '#374151' }}
            axisLine={{ stroke: '#374151' }}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#E5E7EB',
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              name === 'close' ? 'Close' : name === 'ema20' ? 'EMA 20' : 'EMA 50',
            ]}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#E5E7EB"
            strokeWidth={1.5}
            dot={false}
            name="close"
          />
          <Line
            type="monotone"
            dataKey="ema20"
            stroke="#00E59B"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
            name="ema20"
          />
          <Line
            type="monotone"
            dataKey="ema50"
            stroke="#EF4444"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
            name="ema50"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
