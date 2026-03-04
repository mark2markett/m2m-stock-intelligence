'use client';

import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';

interface StockSearchFormProps {
  onAnalyze: (symbol: string) => void;
  isLoading: boolean;
}

export const StockSearchForm: React.FC<StockSearchFormProps> = ({ onAnalyze, isLoading }) => {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onAnalyze(symbol.trim().toUpperCase());
    }
  };

  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];

  return (
    <div className="bg-[#111827] rounded-xl p-6 md:p-8 border border-[#1f2937]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#00E59B]/10 rounded-lg">
          <TrendingUp className="h-6 w-6 text-[#00E59B]" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-[#E5E7EB]">Market Analysis</h2>
          <p className="text-[#9CA3AF] text-sm md:text-base">
            Enter a stock symbol to generate educational analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-3 h-5 w-5 text-[#6B7280]" />
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="w-full pl-12 pr-4 py-3 bg-[#0a0e17] border border-[#1f2937] rounded-lg focus:ring-2 focus:ring-[#00E59B] focus:border-transparent transition-all duration-200 text-base md:text-lg text-[#E5E7EB] placeholder-[#6B7280]"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !symbol.trim()}
          className="w-full bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] py-3 md:py-4 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a0e17]"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Generate Analysis
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-xs md:text-sm text-[#6B7280] mb-3">Popular stocks:</p>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {popularStocks.map((stock) => (
            <button
              key={stock}
              onClick={() => setSymbol(stock)}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-[#1f2937] hover:bg-[#374151] text-[#E5E7EB] rounded-md transition-colors duration-150"
              disabled={isLoading}
            >
              {stock}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
