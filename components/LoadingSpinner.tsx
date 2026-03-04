'use client';

import React from 'react';
import { BarChart3, TrendingUp, Search, FileText } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="bg-[#111827] rounded-xl p-8 border border-[#1f2937]">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E59B] mx-auto"></div>
          <BarChart3 className="h-6 w-6 text-[#00E59B] absolute top-3 left-1/2 transform -translate-x-1/2" />
        </div>

        <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4">Generating Analysis</h3>

        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3 p-3 bg-[#00E59B]/5 rounded-lg border border-[#00E59B]/20">
            <Search className="h-4 w-4 text-[#00E59B]" />
            <span className="text-sm text-[#9CA3AF]">Fetching real-time market data...</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#00E59B]/5 rounded-lg border border-[#00E59B]/20">
            <TrendingUp className="h-4 w-4 text-[#00E59B]" />
            <span className="text-sm text-[#9CA3AF]">Computing 15+ technical indicators...</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#00E59B]/5 rounded-lg border border-[#00E59B]/20">
            <BarChart3 className="h-4 w-4 text-[#00E59B]" />
            <span className="text-sm text-[#9CA3AF]">AI analysis in progress...</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#00E59B]/5 rounded-lg border border-[#00E59B]/20">
            <FileText className="h-4 w-4 text-[#00E59B]" />
            <span className="text-sm text-[#9CA3AF]">Finalizing educational report...</span>
          </div>
        </div>

        <p className="text-xs text-[#6B7280] mt-6">Analysis typically takes 5-10 seconds</p>
      </div>
    </div>
  );
};
