import React, { useState } from 'react';
import { BarChart3, TrendingUp, FileText } from 'lucide-react';
import { StockSearchForm } from './components/StockSearchForm';
import { AnalysisResults } from './components/AnalysisResults';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AnalysisEngine } from './services/analysisEngine';
import { PDFGenerator } from './services/pdfGenerator';
import { PolygonService } from './services/polygonAPI';
import { NewsService } from './services/newsService';
import { TechnicalIndicators } from './utils/technicalIndicators';
import type { AnalysisReport, StockData, NewsItem } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [currentStock, setCurrentStock] = useState<StockData | null>(null);
  const [currentIndicators, setCurrentIndicators] = useState<TechnicalIndicators | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsItem[]>([]);
  
  const handleAnalyze = async (symbol: string) => {
    setIsLoading(true);
    setCurrentReport(null);
    setCurrentStock(null);
    setCurrentIndicators(null);
    setCurrentNews([]);
    
    try {
      console.log(`Starting analysis for ${symbol}`);
      
      // Show immediate feedback
      const startTime = performance.now();
      
      const report = await AnalysisEngine.generateAnalysis(symbol);
      
      const endTime = performance.now();
      console.log(`✓ Analysis completed in ${((endTime - startTime) / 1000).toFixed(1)}s`);
      
      // Use cached data for display (already fetched in analysis)
      const [stockData, historicalData, newsData] = await Promise.all([
        PolygonService.getStockDetails(symbol), // Will use cache
        PolygonService.getHistoricalData(symbol, 'day', 25), // Will use cache
        NewsService.getStockNews(symbol, 3) // Will use cache if implemented
      ]);
      
      // Calculate indicators for display
      const closes = historicalData.map(d => d.close);
      const highs = historicalData.map(d => d.high);
      const lows = historicalData.map(d => d.low);
      const volumes = historicalData.map(d => d.volume);
      
      const indicatorResults = TechnicalIndicators.computeIndicators(highs, lows, closes, volumes, 'daily');
      
      // Add historical data to the report for charting
      report.historicalData = historicalData;
      
      setCurrentReport(report);
      setCurrentStock(stockData);
      setCurrentIndicators(indicatorResults.indicators);
      setCurrentNews(newsData);
      
      console.log(`📊 Final state set:`, {
        report: !!report,
        stock: !!stockData,
        indicators: !!indicatorResults.indicators,
        newsCount: newsData.length,
        newsSample: newsData.slice(0, 2).map(n => ({ headline: n.headline.substring(0, 30), sentiment: n.sentiment }))
      });
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      
      // Show specific error message to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('API key not configured')) {
        alert('API keys not configured. Please check your .env file and ensure you have valid Polygon.io and OpenAI API keys.');
      } else {
        alert(`Analysis failed: ${errorMessage}`);
      }
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
      a.download = `${currentStock.symbol}-analysis-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Stock Analysis Pro</h1>
              <p className="text-xs text-gray-600">Professional Technical Analysis & Reports</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Powered by AI & Real-Time Data</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section with Large Logo */}
          <div className="text-center mb-8 px-4 md:px-0">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-2 md:p-4 bg-white rounded-2xl shadow-2xl border-4 border-blue-300">
                <img 
                  src="/public/Untitled.png" 
                  alt="Mark 2 Market Logo" 
                  className="h-12 md:h-20 w-auto"
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-2">Stock Analysis Pro</h1>
                <h2 className="text-lg md:text-xl text-gray-600">
                  Professional Stock Analysis Platform
                </h2>
              </div>
            </div>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Generate comprehensive technical analysis reports with AI-powered insights, 
              multi-timeframe indicators, and professional PDF outputs for informed trading decisions.
            </p>
          </div>
          
          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <StockSearchForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
          
          {/* Results */}
          <div className="max-w-6xl mx-auto">
            {isLoading && <LoadingSpinner />}
            
            {currentReport && currentStock && currentIndicators && !isLoading && (
              <AnalysisResults
                report={currentReport}
                stockData={currentStock}
                indicators={currentIndicators}
                newsData={currentNews}
                onDownloadPDF={handleDownloadPDF}
              />
            )}
          </div>
          
          {/* Features Overview */}
          {!currentReport && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <BarChart3 className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">Technical Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Advanced technical indicators including RSI, MACD, Bollinger Bands, and more
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">Setup Classification</h3>
                <p className="text-gray-600 text-sm">
                  Identify trade setup lifecycle stages and quality scoring
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <FileText className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800 mb-2">PDF Reports</h3>
                <p className="text-gray-600 text-sm">
                  Professional PDF reports with comprehensive analysis and recommendations
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;