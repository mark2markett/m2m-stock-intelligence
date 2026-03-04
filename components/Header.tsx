'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#111827] border-b border-[#1f2937]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <span className="text-[#00E59B] font-bold text-2xl tracking-tight">M2M</span>
            <div className="h-6 w-px bg-[#1f2937]"></div>
            <div>
              <h1 className="text-lg font-bold text-[#E5E7EB]">Stock Intelligence</h1>
              <p className="text-xs text-[#6B7280]">Educational Market Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <TrendingUp className="h-4 w-4 text-[#00E59B]" />
            <span>Powered by AI & Real-Time Data</span>
          </div>
        </div>
      </div>
    </header>
  );
};
