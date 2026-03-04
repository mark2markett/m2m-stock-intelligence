import React from 'react';
import { Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import type { AnalysisReport, StockData, TechnicalIndicators, NewsItem } from '../types';
import { NewsService } from '../services/newsService';

interface AnalysisResultsProps {
  report: AnalysisReport;
  stockData: StockData;
  indicators: TechnicalIndicators;
  newsData: NewsItem[];
  onDownloadPDF: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  report,
  stockData,
  indicators,
  newsData,
  onDownloadPDF,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Tier 1': return 'text-green-700 bg-green-100';
      case 'Tier 2': return 'text-yellow-700 bg-yellow-100';
      case 'Tier 3': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };
  
  const getSetupStageIcon = (stage: string) => {
    switch (stage) {
      case 'Setup Forming': return <Clock className="h-4 w-4" />;
      case 'Just Triggered': return <CheckCircle className="h-4 w-4" />;
      case 'Mid Setup': return <TrendingUp className="h-4 w-4" />;
      case 'Late Setup': return <AlertTriangle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{stockData.symbol}</h1>
            <p className="text-gray-600">{stockData.name}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-semibold">${stockData.price.toFixed(2)}</span>
              <span className={`flex items-center gap-1 ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {stockData.change >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getSetupStageIcon(report.setupStage)}
              <span className="text-sm text-gray-600">Setup Stage</span>
            </div>
            <span className="font-semibold">{report.setupStage}</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Trade Quality</div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(report.tradeQuality)}`}>
              {report.tradeQuality}
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Confidence Score</div>
            <span className={`font-semibold ${getConfidenceColor(report.confidenceScore)}`}>
              {report.confidenceScore}/100
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Volatility</div>
            <span className="font-semibold">{report.volatilityRegime}</span>
          </div>
        </div>
      </div>
      
      {/* Technical Indicators */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Technical Indicators
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">RSI (14)</div>
            <div className="text-xl font-semibold">{indicators.rsi.toFixed(1)}</div>
            <div className={`text-xs ${indicators.rsi > 70 ? 'text-red-600' : indicators.rsi < 30 ? 'text-green-600' : 'text-gray-600'}`}>
              {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">MACD</div>
            <div className="text-xl font-semibold">{indicators.macd.macd.toFixed(3)}</div>
            <div className={`text-xs ${indicators.macd.macd > indicators.macd.signal ? 'text-green-600' : 'text-red-600'}`}>
              {indicators.macd.macd > indicators.macd.signal ? 'Bullish' : 'Bearish'}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">ATR (14)</div>
            <div className="text-xl font-semibold">{indicators.atr.toFixed(2)}</div>
            <div className="text-xs text-gray-600">{report.volatilityRegime} Volatility</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">ADX (14)</div>
            <div className="text-xl font-semibold">{indicators.adx.toFixed(1)}</div>
            <div className={`text-xs ${indicators.adx > 25 ? 'text-green-600' : 'text-gray-600'}`}>
              {indicators.adx > 25 ? 'Strong Trend' : 'Weak Trend'}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Bollinger Position</div>
            <div className="text-xl font-semibold">
              {stockData.price > indicators.bollingerBands.upper ? 'Upper' : 
               stockData.price < indicators.bollingerBands.lower ? 'Lower' : 'Middle'}
            </div>
            <div className="text-xs text-gray-600">
              ${indicators.bollingerBands.lower.toFixed(2)} - ${indicators.bollingerBands.upper.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">CMF (20)</div>
            <div className="text-xl font-semibold">{indicators.cmf.toFixed(3)}</div>
            <div className={`text-xs ${indicators.cmf > 0.1 ? 'text-green-600' : indicators.cmf < -0.1 ? 'text-red-600' : 'text-gray-600'}`}>
              {indicators.cmf > 0.1 ? 'Accumulation' : indicators.cmf < -0.1 ? 'Distribution' : 'Balanced'}
            </div>
          </div>
        </div>
      </div>
      
      {/* News Sentiment */}
      {newsData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Recent News & Sentiment</h3>
          <div className="space-y-3">
            {newsData.slice(0, 4).map((news, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{news.headline}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      news.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                      news.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {news.sentiment}
                    </span>
                    <span className="text-xs text-gray-500">{news.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Analysis Sections */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-6">Detailed Analysis</h3>
        <div className="space-y-6">
          {report.sections.map((section, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Final Recommendation */}
      <div className={`bg-white rounded-xl shadow-lg p-6 border ${
        report.actionable ? 'border-green-200' : 'border-yellow-200'
      }`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          {report.actionable ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-yellow-600" />}
          Final Recommendation
        </h3>
        <p className="text-gray-800 font-medium mb-2">
          {report.actionable ? 'ACTIONABLE SETUP IDENTIFIED' : 'NO CLEAR SETUP - MONITOR'}
        </p>
        <p className="text-gray-700">{report.recommendation}</p>
      </div>
    </div>
  );
};