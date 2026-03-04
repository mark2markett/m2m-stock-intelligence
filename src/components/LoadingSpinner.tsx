import React from 'react';
import { BarChart3, TrendingUp, Search, FileText } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <BarChart3 className="h-6 w-6 text-blue-600 absolute top-3 left-1/2 transform -translate-x-1/2" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generating Analysis Report</h3>
        
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Search className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-700">Fetching real-time market data...</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">Computing 15+ technical indicators...</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-700">AI analysis in progress...</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <FileText className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-gray-700">Finalizing professional report...</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">Analysis typically takes 5-10 seconds</p>
      </div>
    </div>
  );
};