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
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Stock Analysis</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Enter a stock symbol to generate comprehensive analysis
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base md:text-lg"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !symbol.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 md:py-4 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Generate Analysis Report
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6">
        <p className="text-xs md:text-sm text-gray-500 mb-3">Popular stocks:</p>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {popularStocks.map((stock) => (
            <button
              key={stock}
              onClick={() => setSymbol(stock)}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-150"
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