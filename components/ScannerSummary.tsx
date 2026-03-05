'use client';

import { BarChart3, CheckCircle, Zap, PieChart } from 'lucide-react';
import type { ScannerResult } from '@/lib/types';

interface ScannerSummaryProps {
  result: ScannerResult;
}

export function ScannerSummary({ result }: ScannerSummaryProps) {
  const cards = [
    {
      label: 'Stocks Scanned',
      value: result.successCount,
      sub: `${result.errorCount} errors`,
      icon: BarChart3,
      color: '#00E59B',
    },
    {
      label: 'Publishable',
      value: result.publishable.length,
      sub: `of ${result.successCount}`,
      icon: CheckCircle,
      color: '#22c55e',
    },
    {
      label: 'Just Triggered',
      value: result.justTriggered.length,
      sub: 'actionable now',
      icon: Zap,
      color: '#f59e0b',
    },
    {
      label: 'Sectors',
      value: Object.keys(result.bySector).length,
      sub: `top: ${getTopSector(result.bySector)}`,
      icon: PieChart,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#111827] border border-[#1f2937] rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className="h-4 w-4" style={{ color: card.color }} />
            <span className="text-xs text-[#6B7280]">{card.label}</span>
          </div>
          <div className="text-2xl font-bold text-[#E5E7EB]">{card.value}</div>
          <div className="text-xs text-[#6B7280] mt-1">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}

function getTopSector(bySector: Record<string, number>): string {
  const entries = Object.entries(bySector);
  if (entries.length === 0) return 'N/A';
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
