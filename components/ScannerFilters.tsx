'use client';

import { Search, X } from 'lucide-react';

export interface ScannerFilterState {
  search: string;
  sector: string;
  setupStage: string;
  publishableOnly: boolean;
  minScore: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

interface ScannerFiltersProps {
  filters: ScannerFilterState;
  onChange: (filters: ScannerFilterState) => void;
  sectors: string[];
  stages: string[];
}

export function ScannerFilters({ filters, onChange, sectors, stages }: ScannerFiltersProps) {
  const update = (patch: Partial<ScannerFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
      {/* Search + Publishable toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full pl-9 pr-8 py-2 bg-[#0a0e17] border border-[#1f2937] rounded-lg text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#00E59B]/50"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#E5E7EB]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => update({ publishableOnly: !filters.publishableOnly })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filters.publishableOnly
              ? 'bg-[#00E59B]/20 text-[#00E59B] border border-[#00E59B]/40'
              : 'bg-[#0a0e17] text-[#6B7280] border border-[#1f2937] hover:border-[#374151]'
          }`}
        >
          Publishable Only
        </button>
      </div>

      {/* Dropdowns row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.sector}
          onChange={(e) => update({ sector: e.target.value })}
          className="bg-[#0a0e17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#00E59B]/50"
        >
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.setupStage}
          onChange={(e) => update({ setupStage: e.target.value })}
          className="bg-[#0a0e17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#00E59B]/50"
        >
          <option value="">All Stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
          className="bg-[#0a0e17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#00E59B]/50"
        >
          <option value="m2mScore">Sort: M2M Score</option>
          <option value="changePercent">Sort: Change %</option>
          <option value="rsi">Sort: RSI</option>
          <option value="volume">Sort: Volume</option>
          <option value="symbol">Sort: Symbol</option>
        </select>

        <button
          onClick={() => update({ sortDir: filters.sortDir === 'desc' ? 'asc' : 'desc' })}
          className="px-3 py-2 bg-[#0a0e17] border border-[#1f2937] rounded-lg text-sm text-[#6B7280] hover:text-[#E5E7EB] transition-colors"
        >
          {filters.sortDir === 'desc' ? '↓ Desc' : '↑ Asc'}
        </button>
      </div>
    </div>
  );
}
