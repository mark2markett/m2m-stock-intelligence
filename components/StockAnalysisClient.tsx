'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, FileText } from 'lucide-react';
import { StockSearchForm } from '@/components/StockSearchForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PDFGenerator } from '@/client/pdfGenerator';
import type { AnalysisReport, StockData, TechnicalIndicators, NewsItem } from '@/lib/types';

const M2M_DISCLAIMER = "EDUCATIONAL ANALYSIS ONLY - This is a market observation for educational purposes. It is not a recommendation to buy or sell any security. Trading options involves significant risk of loss. This analysis reflects one possible interpretation of market data and should not be acted upon without your own independent research.";

export function StockAnalysisClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [currentStock, setCurrentStock] = useState<StockData | null>(null);
  const [currentIndicators, setCurrentIndicators] = useState<TechnicalIndicators | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsItem[]>([]);

  const handleAnalyze = async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentReport(null);
    setCurrentStock(null);
    setCurrentIndicators(null);
    setCurrentNews([]);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json();

      setCurrentReport(data.report);
      setCurrentStock(data.stockData);
      setCurrentIndicators(data.indicators);
      setCurrentNews(data.news);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentReport || !currentStock || !currentIndicators) return;

    try {
      const pdfBlob = await PDFGenerator.generateReport(
        currentReport,
        currentStock,
        currentIndicators,
        currentNews
      );

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentStock.symbol}-m2m-analysis-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Header */}
      <header className="bg-[#111827] border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#00E59B] font-bold text-2xl tracking-tight">M2M</span>
                <div className="h-6 w-px bg-[#1f2937]"></div>
              </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8 px-4 md:px-0">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 md:p-4 bg-[#111827] rounded-2xl border-2 border-[#00E59B]/30 shadow-lg shadow-[#00E59B]/5">
                <span className="text-[#00E59B] font-bold text-3xl md:text-5xl tracking-tight">M2M</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-5xl font-bold text-[#E5E7EB] mb-2">Stock Intelligence</h1>
                <h2 className="text-lg md:text-xl text-[#9CA3AF]">
                  Educational Market Analysis Platform
                </h2>
              </div>
            </div>
            <p className="text-base md:text-lg text-[#9CA3AF] max-w-3xl mx-auto">
              Explore technical analysis with AI-powered observations,
              multi-timeframe indicators, and detailed PDF reports for educational market research.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <StockSearchForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* Disclaimer below search form */}
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-[#6B7280] text-center leading-relaxed px-4">
              {M2M_DISCLAIMER}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="max-w-6xl mx-auto">
            {isLoading && <LoadingSpinner />}

            {currentReport && currentStock && currentIndicators && !isLoading && (
              <>
                {/* Disclaimer above results */}
                <div className="mb-6 bg-[#111827] border border-[#00E59B]/20 rounded-lg p-4">
                  <p className="text-xs text-[#00E59B]/80 text-center leading-relaxed">
                    {M2M_DISCLAIMER}
                  </p>
                </div>
                <AnalysisResults
                  report={currentReport}
                  stockData={currentStock}
                  indicators={currentIndicators}
                  newsData={currentNews}
                  onDownloadPDF={handleDownloadPDF}
                />
              </>
            )}
          </div>

          {/* Features Overview */}
          {!currentReport && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
              <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937] text-center">
                <BarChart3 className="h-10 w-10 text-[#00E59B] mx-auto mb-4" />
                <h3 className="font-semibold text-[#E5E7EB] mb-2">Technical Analysis</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Advanced technical indicators including RSI, MACD, Bollinger Bands, and more
                </p>
              </div>

              <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937] text-center">
                <TrendingUp className="h-10 w-10 text-[#00E59B] mx-auto mb-4" />
                <h3 className="font-semibold text-[#E5E7EB] mb-2">Pattern Recognition</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Identify setup lifecycle stages and quality scoring for educational study
                </p>
              </div>

              <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937] text-center">
                <FileText className="h-10 w-10 text-[#00E59B] mx-auto mb-4" />
                <h3 className="font-semibold text-[#E5E7EB] mb-2">PDF Reports</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Detailed PDF reports with comprehensive analysis for market education
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
