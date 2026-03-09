'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, BarChart3, XCircle, Newspaper, FileText, LineChart, Shield, Activity } from 'lucide-react';
import { AccordionSection } from '@/components/AccordionSection';
import { DailyChart } from '@/components/DailyChart';
import { useSwipe } from '@/hooks/useSwipe';
import type { AnalysisReport, StockData, TechnicalIndicators, NewsItem, OptionsData, OptimalTrade as OptimalTradeType } from '@/lib/types';
import { OptimalTrade } from '@/components/OptimalTrade';

interface AnalysisResultsProps {
  report: AnalysisReport;
  stockData: StockData;
  indicators: TechnicalIndicators;
  newsData: NewsItem[];
  optionsData?: OptionsData;
  optimalTrade?: OptimalTradeType;
  onDownloadPDF: () =\u003e void;
  isMobile?: boolean;
  isPartialResult?: boolean;
}

const MOBILE_SECTIONS = ['chart', 'scorecard', 'indicators', 'news', 'analysis', 'trade', 'summary'] as const;

export const AnalysisResults: React.FC\u003cAnalysisResultsProps\u003e = ({
  report,
  stockData,
  indicators,
  newsData,
  optionsData,
  optimalTrade: optimalTradeData,
  onDownloadPDF,
  isMobile = false,
  isPartialResult = false,
}) =\u003e {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const swipeRef = useRef\u003cHTMLDivElement\u003e(null);

  const handleSwipeLeft = useCallback(() =\u003e {
    setActiveSectionIndex(i =\u003e Math.min(i + 1, MOBILE_SECTIONS.length - 1));
  }, []);
  const handleSwipeRight = useCallback(() =\u003e {
    setActiveSectionIndex(i =\u003e Math.max(i - 1, 0));
  }, []);

  useSwipe(swipeRef, { onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight });

  const getSetupStageIcon = (stage: string) =\u003e {
    switch (stage) {
      case 'Setup Forming': return \u003cClock className=\"h-4 w-4\" /\u003e;
      case 'Just Triggered': return \u003cCheckCircle className=\"h-4 w-4\" /\u003e;
      case 'Mid Setup': return \u003cTrendingUp className=\"h-4 w-4\" /\u003e;
      case 'Late Setup': return \u003cAlertTriangle className=\"h-4 w-4\" /\u003e;
      default: return \u003cBarChart3 className=\"h-4 w-4\" /\u003e;
    }
  };

  const getScoreColor = (score: number, max: number) =\u003e {
    const pct = max \u003e 0 ? (score / max) * 100 : 0;
    if (pct \u003e= 70) return 'text-[#00E59B]';
    if (pct \u003e= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number, max: number) =\u003e {
    const pct = max \u003e 0 ? (score / max) * 100 : 0;
    if (pct \u003e= 70) return 'bg-[#00E59B]';
    if (pct \u003e= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const { scorecard } = report;

  // --- Shared section renderers ---
  const renderHeaderCard = () =\u003e (
    \u003cdiv className=\"bg-[#111827] rounded-xl p-4 sm:p-6 border border-[#1f2937]\"\u003e
      \u003cdiv className=\"flex justify-between items-start mb-6\"\u003e
        \u003cdiv\u003e
          \u003ch1 className=\"text-2xl font-bold text-[#E5E7EB]\"\u003e{stockData.symbol}\u003c/h1\u003e
          \u003cp className=\"text-[#9CA3AF]\"\u003e{stockData.name}\u003c/p\u003e
          \u003cdiv className=\"flex items-center gap-4 mt-2\"\u003e
            \u003cspan className=\"text-2xl font-semibold text-[#E5E7EB]\"\u003e${stockData.price.toFixed(2)}\u003c/span\u003e
            \u003cspan className={`flex items-center gap-1 ${stockData.change \u003e= 0 ? 'text-[#00E59B]' : 'text-red-400'}`}\u003e
              {stockData.change \u003e= 0 ? \u003cTrendingUp className=\"h-4 w-4\" /\u003e : \u003cTrendingDown className=\"h-4 w-4\" /\u003e}
              {stockData.change \u003e= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
            \u003c/span\u003e
          \u003c/div\u003e
        \u003c/div\u003e
        {!isMobile \u0026\u0026 (
          \u003cbutton
            onClick={onDownloadPDF}
            className=\"flex items-center gap-2 bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] px-4 py-2 rounded-lg font-semibold transition-colors duration-200 min-h-[44px]\"
          \u003e
            \u003cDownload className=\"h-4 w-4\" /\u003e
            Download PDF
          \u003c/button\u003e
        )}
      \u003c/div\u003e
      \u003cdiv className=\"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4\"\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"flex items-center gap-2 mb-2\"\u003e
            {getSetupStageIcon(report.setupStage)}
            \u003cspan className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eSetup Stage\u003c/span\u003e
          \u003c/div\u003e
          \u003cspan className=\"font-semibold text-[#E5E7EB] text-sm sm:text-base\"\u003e{report.setupStage}\u003c/span\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF] mb-2\"\u003eM2M Score\u003c/div\u003e
          \u003cspan className={`font-semibold text-sm sm:text-base ${getScoreColor(scorecard.totalScore, scorecard.maxScore)}`}\u003e
            {scorecard.totalScore}/{scorecard.maxScore}
          \u003c/span\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF] mb-2\"\u003e
            \u003cspan className=\"sm:hidden\"\u003eFactors\u003c/span\u003e
            \u003cspan className=\"hidden sm:inline\"\u003eFactors Passed\u003c/span\u003e
          \u003c/div\u003e
          \u003cspan className={`font-semibold text-sm sm:text-base ${scorecard.meetsMultiFactorRule ? 'text-[#00E59B]' : 'text-yellow-400'}`}\u003e
            {scorecard.factorsPassed}/{scorecard.totalFactors}
          \u003c/span\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF] mb-2\"\u003eVolatility\u003c/div\u003e
          \u003cspan className=\"font-semibold text-[#E5E7EB] text-sm sm:text-base\"\u003e{report.volatilityRegime}\u003c/span\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"flex items-center gap-2 mb-2\"\u003e
            \u003cShield className=\"h-4 w-4\" /\u003e
            \u003cspan className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eSetup Quality\u003c/span\u003e
          \u003c/div\u003e
          \u003cspan className={`inline-block px-2 py-0.5 rounded text-xs sm:text-sm font-semibold ${
            report.setupQuality === 'high' ? 'bg-[#00E59B]/15 text-[#00E59B]' :
            report.setupQuality === 'moderate' ? 'bg-yellow-400/15 text-yellow-400' :
            'bg-[#374151] text-[#9CA3AF]'
          }`}\u003e
            {report.setupQuality.toUpperCase()}
          \u003c/span\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"flex items-center gap-2 mb-2\"\u003e
            \u003cActivity className=\"h-4 w-4\" /\u003e
            \u003cspan className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eSignal Confidence\u003c/span\u003e
          \u003c/div\u003e
          \u003cdiv className=\"flex items-center gap-2\"\u003e
            \u003cspan className={`font-semibold text-sm sm:text-base ${
              report.signalConfidence \u003e= 70 ? 'text-[#00E59B]' :
              report.signalConfidence \u003e= 45 ? 'text-yellow-400' :
              'text-red-400'
            }`}\u003e
              {report.signalConfidence}
            \u003c/span\u003e
            \u003cdiv className=\"flex-1 bg-[#1f2937] rounded-full h-1.5\"\u003e
              \u003cdiv
                className={`h-1.5 rounded-full ${
                  report.signalConfidence \u003e= 70 ? 'bg-[#00E59B]' :
                  report.signalConfidence \u003e= 45 ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}
                style={{ width: `${report.signalConfidence}%` }}
              /\u003e
            \u003c/div\u003e
          \u003c/div\u003e
        \u003c/div\u003e
      \u003c/div\u003e
    \u003c/div\u003e
  );

  const renderScorecard = () =\u003e (
    \u003c\u003e
      \u003cdiv className=\"flex items-center justify-between mb-4\"\u003e
        \u003ch3 className=\"text-lg font-semibold flex items-center gap-2 text-[#E5E7EB]\"\u003e
          \u003cBarChart3 className=\"h-5 w-5 text-[#00E59B]\" /\u003e
          M2M 6-Factor Scorecard
        \u003c/h3\u003e
        \u003cdiv className=\"flex items-center gap-2\"\u003e
          {scorecard.publishable ? (
            \u003cspan className=\"flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#00E59B]/10 text-[#00E59B]\"\u003e
              \u003cCheckCircle className=\"h-3 w-3\" /\u003e Publishable
            \u003c/span\u003e
          ) : (
            \u003cspan className=\"flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-400/10 text-red-400\"\u003e
              \u003cXCircle className=\"h-3 w-3\" /\u003e Below Threshold
            \u003c/span\u003e
          )}
        \u003c/div\u003e
      \u003c/div\u003e
      \u003cdiv className=\"flex gap-4 mb-6 text-xs\"\u003e
        \u003cdiv className={`flex items-center gap-1 ${scorecard.meetsPublicationThreshold ? 'text-[#00E59B]' : 'text-red-400'}`}\u003e
          {scorecard.meetsPublicationThreshold ? \u003cCheckCircle className=\"h-3 w-3\" /\u003e : \u003cXCircle className=\"h-3 w-3\" /\u003e}
          Score {'\u003e'}= 65 threshold
        \u003c/div\u003e
        \u003cdiv className={`flex items-center gap-1 ${scorecard.meetsMultiFactorRule ? 'text-[#00E59B]' : 'text-red-400'}`}\u003e
          {scorecard.meetsMultiFactorRule ? \u003cCheckCircle className=\"h-3 w-3\" /\u003e : \u003cXCircle className=\"h-3 w-3\" /\u003e}
          3-of-6 factor rule
        \u003c/div\u003e
      \u003c/div\u003e
      \u003cdiv className=\"space-y-4\"\u003e
        {scorecard.factors.map((factor, index) =\u003e (
          \u003cdiv key={index} className=\"bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]\"\u003e
            \u003cdiv className=\"flex items-center justify-between mb-2\"\u003e
              \u003cdiv className=\"flex items-center gap-2\"\u003e
                {factor.passed ? \u003cCheckCircle className=\"h-4 w-4 text-[#00E59B]\" /\u003e : \u003cXCircle className=\"h-4 w-4 text-red-400\" /\u003e}
                \u003cspan className=\"text-sm font-medium text-[#E5E7EB]\"\u003e{factor.name}\u003c/span\u003e
              \u003c/div\u003e
              \u003cspan className={`text-sm font-semibold ${getScoreColor(factor.score, factor.maxPoints)}`}\u003e
                {factor.score}/{factor.maxPoints}
              \u003c/span\u003e
            \u003c/div\u003e
            \u003cdiv className=\"w-full bg-[#1f2937] rounded-full h-1.5 mb-2\"\u003e
              \u003cdiv
                className={`h-1.5 rounded-full ${getScoreBarColor(factor.score, factor.maxPoints)}`}
                style={{ width: `${(factor.score / factor.maxPoints) * 100}%` }}
              /\u003e
            \u003c/div\u003e
            \u003cp className=\"text-xs text-[#6B7280]\"\u003e{factor.rationale}\u003c/p\u003e
          \u003c/div\u003e
        ))}
      \u003c/div\u003e
    \u003c/\u003e
  );

  const renderChart = () =\u003e {
    if (!report.historicalData || report.historicalData.length \u003c 20) return null;
    return (
      \u003c\u003e
        \u003ch3 className=\"text-lg font-semibold mb-4 flex items-center gap-2 text-[#E5E7EB]\"\u003e
          \u003cLineChart className=\"h-5 w-5 text-[#00E59B]\" /\u003e
          Daily Price Chart
        \u003c/h3\u003e
        \u003cDailyChart historicalData={report.historicalData} /\u003e
        \u003cdiv className=\"flex items-center justify-center gap-6 mt-3 text-xs text-[#6B7280]\"\u003e
          \u003cspan className=\"flex items-center gap-1.5\"\u003e\u003cspan className=\"w-4 h-0.5 bg-[#E5E7EB] inline-block\" /\u003e Close\u003c/span\u003e
          \u003cspan className=\"flex items-center gap-1.5\"\u003e\u003cspan className=\"w-4 h-0.5 bg-[#00E59B] inline-block\" /\u003e EMA 20\u003c/span\u003e
          \u003cspan className=\"flex items-center gap-1.5\"\u003e\u003cspan className=\"w-4 h-0.5 bg-[#EF4444] inline-block\" /\u003e EMA 50\u003c/span\u003e
        \u003c/div\u003e
      \u003c/\u003e
    );
  };

  const renderIndicators = () =\u003e (
    \u003c\u003e
      \u003ch3 className=\"text-lg font-semibold mb-4 flex items-center gap-2 text-[#E5E7EB]\"\u003e
        \u003cBarChart3 className=\"h-5 w-5 text-[#00E59B]\" /\u003e
        Technical Indicators
      \u003c/h3\u003e
      \u003cdiv className=\"grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4\"\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eRSI (14)\u003c/div\u003e
          \u003cdiv className=\"text-lg sm:text-xl font-semibold text-[#E5E7EB]\"\u003e{indicators.rsi.toFixed(1)}\u003c/div\u003e
          \u003cdiv className={`text-xs ${indicators.rsi \u003e 70 ? 'text-red-400' : indicators.rsi \u003c 30 ? 'text-[#00E59B]' : 'text-[#6B7280]'}`}\u003e
            {indicators.rsi \u003e 70 ? 'Overbought' : indicators.rsi \u003c 30 ? 'Oversold' : 'Neutral'}
          \u003c/div\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eMACD\u003c/div\u003e
          \u003cdiv className=\"text-lg sm:text-xl font-semibold text-[#E5E7EB]\"\u003e{indicators.macd.macd.toFixed(3)}\u003c/div\u003e
          \u003cdiv className={`text-xs ${indicators.macd.macd \u003e indicators.macd.signal ? 'text-[#00E59B]' : 'text-red-400'}`}\u003e
            {indicators.macd.macd \u003e indicators.macd.signal ? 'Bullish' : 'Bearish'}
          \u003c/div\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eATR (14)\u003c/div\u003e
          \u003cdiv className=\"text-lg sm:text-xl font-semibold text-[#E5E7EB]\"\u003e{indicators.atr.toFixed(2)}\u003c/div\u003e
          \u003cdiv className=\"text-xs text-[#6B7280]\"\u003e{report.volatilityRegime} Volatility\u003c/div\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eADX (14)\u003c/div\u003e
          \u003cdiv className=\"text-lg sm:text-xl font-semibold text-[#E5E7EB]\"\u003e{indicators.adx.toFixed(1)}\u003c/div\u003e
          \u003cdiv className={`text-xs ${indicators.adx \u003e 25 ? 'text-[#00E59B]' : 'text-[#6B7280]'}`}\u003e
            {indicators.adx \u003e 25 ? 'Strong Trend' : 'Weak Trend'}
          \u003c/div\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003e
            \u003cspan className=\"sm:hidden\"\u003eBollinger\u003c/span\u003e
            \u003cspan className=\"hidden sm:inline\"\u003eBollinger Position\u003c/span\u003e
          \u003c/div\u003e
          \u003cdiv className=\"text-lg sm:text-xl font-semibold text-[#E5E7EB]\"\u003e
            {stockData.price \u003e indicators.bollingerBands.upper ? 'Upper' :
             stockData.price \u003c indicators.bollingerBands.lower ? 'Lower' : 'Middle'}
          \u003c/div\u003e
          \u003cdiv className=\"text-xs text-[#6B7280]\"\u003e
            ${indicators.bollingerBands.lower.toFixed(2)} - ${indicators.bollingerBands.upper.toFixed(2)}
          \u003c/div\u003e
        \u003c/div\u003e
        \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
          \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eCMF (20)\u003c/div\u003e
          \u003cdiv className=\"text-lg sm:text-xl font-semibold text-[#E5E7EB]\"\u003e{indicators.cmf.toFixed(3)}\u003c/div\u003e
          \u003cdiv className={`text-xs ${indicators.cmf \u003e 0.1 ? 'text-[#00E59B]' : indicators.cmf \u003c -0.1 ? 'text-red-400' : 'text-[#6B7280]'}`}\u003e
            {indicators.cmf \u003e 0.1 ? 'Accumulation' : indicators.cmf \u003c -0.1 ? 'Distribution' : 'Balanced'}
          \u003c/div\u003e
        \u003c/div\u003e
        {optionsData \u0026\u0026 (
          \u003c\u003e
            \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
              \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003ePut/Call Ratio\u003c/div\u003e
              \u003cdiv className=\"text-lg sm:text-xl font-semibold text-[#E5E7EB]\"\u003e{optionsData.putCallRatio.toFixed(2)}\u003c/div\u003e
              \u003cdiv className={`text-xs ${optionsData.putCallRatio \u003c 0.7 ? 'text-[#00E59B]' : optionsData.putCallRatio \u003e 1.0 ? 'text-red-400' : 'text-[#6B7280]'}`}\u003e
                {optionsData.putCallRatio \u003c 0.7 ? 'Bullish' : optionsData.putCallRatio \u003e 1.0 ? 'Bearish' : 'Neutral'}
              \u003c/div\u003e
            \u003c/div\u003e
            \u003cdiv className=\"bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]\"\u003e
              \u003cdiv className=\"text-xs sm:text-sm text-[#9CA3AF]\"\u003eAvg IV\u003c/div\u003e
              \u003cdiv className=\"text-lg sm:text-xl font-semibold text-[#E5E7EB]\"\u003e{(optionsData.avgImpliedVolatility * 100).toFixed(1)}%\u003c/div\u003e
              \u003cdiv className=\"text-xs text-[#6B7280]\"\u003e
                {optionsData.contractCount} contracts
              \u003c/div\u003e
            \u003c/div\u003e
          \u003c/\u003e
        )}
      \u003c/div\u003e
    \u003c/\u003e
  );

  const renderNews = () =\u003e {
    if (newsData.length === 0) return null;
    return (
      \u003c\u003e
        \u003ch3 className=\"text-lg font-semibold mb-4 text-[#E5E7EB]\"\u003eRecent News \u0026 Sentiment\u003c/h3\u003e
        \u003cdiv className=\"space-y-3\"\u003e
          {newsData.slice(0, 4).map((news, index) =\u003e (
            \u003cdiv key={index} className=\"flex items-start gap-3 p-3 bg-[#0a0e17] rounded-lg border border-[#1f2937]\"\u003e
              \u003cdiv className=\"flex-1\"\u003e
                \u003ch4 className=\"font-medium text-[#E5E7EB] text-sm sm:text-base\"\u003e{news.headline}\u003c/h4\u003e
                \u003cdiv className=\"flex items-center gap-2 mt-1\"\u003e
                  \u003cspan className={`px-2 py-1 rounded-full text-xs font-medium ${
                    news.sentiment === 'Positive' ? 'bg-[#00E59B]/10 text-[#00E59B]' :
                    news.sentiment === 'Negative' ? 'bg-red-400/10 text-red-400' :
                    'bg-[#1f2937] text-[#9CA3AF]'
                  }`}\u003e{news.sentiment}\u003c/span\u003e
                  \u003cspan className=\"text-xs text-[#6B7280]\"\u003e{news.source}\u003c/span\u003e
                  {news.date \u0026\u0026 (
                    \u003cspan className=\"text-xs text-[#6B7280]\"\u003e
                      · {new Date(news.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    \u003c/span\u003e
                  )}
                \u003c/div\u003e
              \u003c/div\u003e
            \u003c/div\u003e
          ))}
        \u003c/div\u003e
      \u003c/\u003e
    );
  };

  const renderAnalysis = () =\u003e (
    \u003c\u003e
      \u003ch3 className=\"text-lg font-semibold mb-6 text-[#E5E7EB]\"\u003eDetailed Analysis\u003c/h3\u003e
      \u003cdiv className=\"space-y-6\"\u003e
        {report.sections.map((section, index) =\u003e (
          \u003cdiv key={index} className=\"border-l-4 border-[#00E59B]/30 pl-4\"\u003e
            \u003ch4 className=\"font-semibold text-[#E5E7EB] mb-2\"\u003e{section.title}\u003c/h4\u003e
            \u003cp className=\"text-[#9CA3AF] leading-relaxed whitespace-pre-line text-sm sm:text-base\"\u003e{section.content}\u003c/p\u003e
          \u003c/div\u003e
        ))}
      \u003c/div\u003e
    \u003c/\u003e
  );

  const getQualitySummary = () =\u003e {
    // Derive dominant direction (same logic as analysisEngine.generateRecommendation)
    const bullishCount = [
      indicators.rsi \u003e 50,
      indicators.macd.macd \u003e indicators.macd.signal,
      indicators.ema20 \u003e indicators.ema50,
      stockData.price \u003e indicators.ema20,
    ].filter(Boolean).length;
    const direction = bullishCount \u003e= 3 ? 'Bullish' : bullishCount \u003c= 1 ? 'Bearish' : 'Neutral';

    switch (report.setupQuality) {
      case 'high':
        return {
          icon: \u003cCheckCircle className=\"h-5 w-5 text-[#00E59B]\" /\u003e,
          text: `HIGH-QUALITY ${direction.toUpperCase()} SETUP`,
          color: 'text-[#00E59B]',
        };
      case 'moderate':
        return {
          icon: \u003cAlertTriangle className=\"h-5 w-5 text-yellow-400\" /\u003e,
          text: `MODERATE ${direction.toUpperCase()} SETUP — DEVELOPING`,
          color: 'text-yellow-400',
        };
      default:
        return {
          icon: \u003cAlertTriangle className=\"h-5 w-5 text-[#9CA3AF]\" /\u003e,
          text: `NO CLEAR ${direction.toUpperCase()} SETUP — MONITORING`,
          color: 'text-[#9CA3AF]',
        };
    }
  };

  const renderSummary = () =\u003e {
    const qualitySummary = getQualitySummary();
    return (
      \u003c\u003e
        \u003ch3 className=\"text-lg font-semibold mb-3 flex items-center gap-2 text-[#E5E7EB]\"\u003e
          {qualitySummary.icon}
          Observation Summary
        \u003c/h3\u003e
        \u003cp className={`font-medium mb-2 ${qualitySummary.color}`}\u003e
          {qualitySummary.text}
        \u003c/p\u003e
        \u003cp className=\"text-[#9CA3AF] text-sm sm:text-base\"\u003e{report.recommendation}\u003c/p\u003e
      \u003c/\u003e
    );
  };

  // --- Partial result banner ---
  const partialBanner = isPartialResult \u0026\u0026 (
    \u003cdiv className=\"bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 flex items-center gap-2\"\u003e
      \u003cAlertTriangle className=\"h-4 w-4 text-yellow-400 flex-shrink-0\" /\u003e
      \u003cp className=\"text-sm text-yellow-400\"\u003eAI analysis unavailable. Technical data shown.\u003c/p\u003e
    \u003c/div\u003e
  );

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    const currentSection = MOBILE_SECTIONS[activeSectionIndex];
    return (
      \u003cdiv className=\"space-y-4\" ref={swipeRef}\u003e
        {partialBanner}
        {renderHeaderCard()}

        {/* Mobile download button */}
        \u003cbutton
          onClick={onDownloadPDF}
          className=\"w-full flex items-center justify-center gap-2 bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] min-h-[44px] py-3 rounded-lg font-semibold transition-colors\"
        \u003e
          \u003cDownload className=\"h-4 w-4\" /\u003e
          Download PDF
        \u003c/button\u003e

        {/* Dot indicators */}
        \u003cdiv className=\"flex justify-center gap-0\"\u003e
          {MOBILE_SECTIONS.map((_, i) =\u003e (
            \u003cbutton
              key={i}
              onClick={() =\u003e setActiveSectionIndex(i)}
              className=\"min-h-[44px] min-w-[44px] flex items-center justify-center\"
              aria-label={`Go to section ${i + 1}`}
            \u003e
              \u003cspan
                className={`block w-2 h-2 rounded-full transition-colors ${
                  i === activeSectionIndex ? 'bg-[#00E59B]' : 'bg-[#374151]'
                }`}
              /\u003e
            \u003c/button\u003e
          ))}
        \u003c/div\u003e

        {/* Accordion sections */}
        {currentSection === 'chart' \u0026\u0026 (
          \u003cAccordionSection title=\"Daily Chart\" icon={\u003cLineChart className=\"h-4 w-4 text-[#00E59B]\" /\u003e} defaultOpen\u003e
            {renderChart() || \u003cp className=\"text-sm text-[#6B7280]\"\u003eInsufficient data for chart.\u003c/p\u003e}
          \u003c/AccordionSection\u003e
        )}
        {currentSection === 'scorecard' \u0026\u0026 (
          \u003cAccordionSection title=\"M2M Scorecard\" icon={\u003cBarChart3 className=\"h-4 w-4 text-[#00E59B]\" /\u003e} defaultOpen\u003e
            {renderScorecard()}
          \u003c/AccordionSection\u003e
        )}
        {currentSection === 'indicators' \u0026\u0026 (
          \u003cAccordionSection title=\"Technical Indicators\" icon={\u003cTrendingUp className=\"h-4 w-4 text-[#00E59B]\" /\u003e} defaultOpen\u003e
            {renderIndicators()}
          \u003c/AccordionSection\u003e
        )}
        {currentSection === 'news' \u0026\u0026 (
          \u003cAccordionSection title=\"News \u0026 Sentiment\" icon={\u003cNewspaper className=\"h-4 w-4 text-[#00E59B]\" /\u003e} defaultOpen\u003e
            {renderNews() || \u003cp className=\"text-sm text-[#6B7280]\"\u003eNo recent news available.\u003c/p\u003e}
          \u003c/AccordionSection\u003e
        )}
        {currentSection === 'analysis' \u0026\u0026 (
          \u003cAccordionSection title=\"Detailed Analysis\" icon={\u003cFileText className=\"h-4 w-4 text-[#00E59B]\" /\u003e} defaultOpen\u003e
            {renderAnalysis()}
          \u003c/AccordionSection\u003e
        )}
        {currentSection === 'trade' \u0026\u0026 optimalTradeData \u0026\u0026 (
          \u003cOptimalTrade trade={optimalTradeData} symbol={stockData.symbol} /\u003e
        )}
        {currentSection === 'trade' \u0026\u0026 !optimalTradeData \u0026\u0026 (
          \u003cdiv className=\"bg-[#111827] rounded-xl p-6 border border-[#1f2937]\"\u003e
            \u003cp className=\"text-sm text-[#6B7280]\"\u003eOptimal trade analysis unavailable for this request.\u003c/p\u003e
          \u003c/div\u003e
        )}
        {currentSection === 'summary' \u0026\u0026 (
          \u003cAccordionSection title=\"Observation Summary\" icon={\u003cCheckCircle className=\"h-4 w-4 text-[#00E59B]\" /\u003e} defaultOpen\u003e
            {renderSummary()}
          \u003c/AccordionSection\u003e
        )}
      \u003c/div\u003e
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    \u003cdiv className=\"space-y-6\"\u003e
      {partialBanner}
      {renderHeaderCard()}

      {report.historicalData \u0026\u0026 report.historicalData.length \u003e= 20 \u0026\u0026 (
        \u003cdiv className=\"bg-[#111827] rounded-xl p-6 border border-[#1f2937]\"\u003e
          {renderChart()}
        \u003c/div\u003e
      )}

      \u003cdiv className=\"bg-[#111827] rounded-xl p-6 border border-[#1f2937]\"\u003e
        {renderScorecard()}
      \u003c/div\u003e

      \u003cdiv className=\"bg-[#111827] rounded-xl p-6 border border-[#1f2937]\"\u003e
        {renderIndicators()}
      \u003c/div\u003e

      {newsData.length \u003e 0 \u0026\u0026 (
        \u003cdiv className=\"bg-[#111827] rounded-xl p-6 border border-[#1f2937]\"\u003e
          {renderNews()}
        \u003c/div\u003e
      )}

      \u003cdiv className=\"bg-[#111827] rounded-xl p-6 border border-[#1f2937]\"\u003e
        {renderAnalysis()}
      \u003c/div\u003e

      {optimalTradeData \u0026\u0026 (
        \u003cOptimalTrade trade={optimalTradeData} symbol={stockData.symbol} /\u003e
      )}

      \u003cdiv className=\"bg-[#111827] rounded-xl p-6 border border-[#00E59B]/20\"\u003e
        {renderSummary()}
      \u003c/div\u003e
    \u003c/div\u003e
  );
};
stylingDirectives
pl-s
pl-kos
pl-k
pl-v
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-kos
pl-v
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-kos
pl-v
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-kos
pl-s1
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-k
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-k
pl-v
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-kos
pl-v
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-smi
pl-kos
pl-c1
pl-smi
pl-kos
pl-c1
pl-smi
pl-kos
pl-c1
pl-smi
pl-kos
pl-c1
pl-smi
pl-kos
pl-kos
pl-kos
pl-c1
pl-smi
pl-kos
pl-c1
pl-smi
pl-kos
pl-c1
pl-kos
pl-kos
pl-c1
pl-smi
pl-k
pl-kos
pl-c1
pl-smi
pl-kos
pl-c1
pl-smi
pl-kos
pl-kos
pl-k
pl-c1
pl-c1
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-k
pl-k
pl-kos
pl-k
pl-k
pl-v
pl-v
pl-kos
pl-smi
pl-c1
pl-smi
pl-c1
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-c1
pl-s1
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-c1
pl-c1
pl-kos
pl-kos
pl-kos
pl-c1
pl-kos
pl-k
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-k
pl-s1
pl-c1
pl-en
pl-c1
pl-smi
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-k
pl-s1
pl-c1
pl-en
pl-kos
pl-kos
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-s1
pl-c1
pl-v
pl-kos
pl-en
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-k
pl-s1
pl-c1
pl-en
pl-kos
pl-kos
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-s1
pl-c1
pl-v
pl-kos
pl-en
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-kos
pl-c1
pl-s1
pl-kos
pl-c1
pl-s1
pl-kos
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-s1
pl-smi
pl-kos
pl-c1
pl-kos
pl-k
pl-kos
pl-s1
pl-kos
pl-kos
pl-k
pl-s
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-k
pl-s
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-k
pl-s
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-k
pl-s
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-k
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-s1
pl-smi
pl-kos
pl-s1
pl-smi
pl-kos
pl-c1
pl-kos
pl-k
pl-s1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-c1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-k
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-s
pl-kos
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-s1
pl-smi
pl-kos
pl-s1
pl-smi
pl-kos
pl-c1
pl-kos
pl-k
pl-s1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-c1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-k
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-k
pl-s
pl-kos
pl-k
pl-s
pl-kos
pl-kos
pl-kos
pl-k
pl-kos
pl-kos
pl-c1
pl-s1
pl-kos
pl-c
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-s
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-s
pl-s
pl-s1
pl-s
pl-s
pl-s1
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-s1
pl-s
pl-s
pl-s1
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-s1
pl-s
pl-s
pl-s1
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-kos
pl-c1
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-kos
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-kos
pl-c1
pl-s
pl-s1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-k
pl-kos
pl-c1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-k
pl-c1
pl-kos
pl-k
pl-kos
pl-c1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-k
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-k
pl-c1
pl-kos
pl-k
pl-kos
pl-c1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-en
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-s
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-s
pl-s
pl-s1
pl-s
pl-s
pl-s1
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-k
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-k
pl-s
pl-k
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-s
pl-kos
pl-c1
pl-s
pl-kos
pl-kos
pl-k
pl-s
pl-k
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-s
pl-kos
pl-c1
pl-s
pl-kos
pl-kos
pl-k
pl-k
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-s
pl-kos
pl-c1
pl-s
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-k
pl-s1
pl-c1
pl-en
pl-kos
pl-kos
pl-kos
pl-k
pl-kos
pl-c1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-c
pl-k
pl-s1
pl-c1
pl-s1
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-c
pl-k
pl-kos
pl-s1
pl-kos
pl-kos
pl-k
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-kos
pl-k
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-c
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-c
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-kos
pl-kos
pl-kos
pl-c1
pl-en
pl-kos
pl-s1
pl-kos
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-kos
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s
pl-s1
pl-s1
pl-c1
pl-s1
pl-s
pl-s
pl-s
pl-s1
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-c
pl-kos
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-v
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-v
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-v
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-v
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-v
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-s1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-v
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-c
pl-k
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
pl-kos
pl-kos
pl-kos
colorizedLines
title
m2m-stock-intelligence/components/AnalysisResults.tsx at main · mark2markett/m2m-stock-intelligence
appPayload
enabled_features
issue_form_upload_field
meta
title
m2m-stock-intelligence/components/AnalysisResults.tsx at main · mark2markett/m2m-stock-intelligence
react-app.reactRoot
github-code-view-meta-stats
github-code-view-meta-stats
publish

code-view-repo-link
/mark2markett/m2m-stock-intelligence
true

header-permalink-button
read-only-cursor-text-area

--spacing:var(--spacing-none)
prc-PageLayout-PageLayoutRoot--KH-d
prc-PageLayout-PageLayoutWrapper-2BhU2
full
prc-PageLayout-PageLayoutContent-BneH9
CodeViewFileTreeLayout-module__sidebar__n_Aau
0
prc-PageLayout-PaneWrapper-pHPop ReposFileTreePane-module__Pane__rBZpI ReposFileTreePane-module__HideTree__AYZnm ReposFileTreePane-module__HidePane__VHAVt
--offset-header:0px;--spacing-row:var(--spacing-none);--spacing-column:var(--spacing-none)
false
start
true
prc-PageLayout-HorizontalDivider-JLVqp prc-PageLayout-PaneHorizontalDivider-9tbnE
none
none
start
--spacing-divider:var(--spacing-none);--spacing:var(--spacing-none)
prc-PageLayout-Pane-AyzHK
true
--spacing:var(--spacing-none);--pane-min-width:256px;--pane-max-width:calc(100vw - var(--pane-max-width-diff));--pane-width-size:var(--pane-width-large);--pane-width:320px
prc-PageLayout-VerticalDivider-9QRmK prc-PageLayout-PaneVerticalDivider-le57g
none
line
line
start
--spacing:var(--spacing-none)
prc-PageLayout-DraggableHandle-9s6B4
slider
Draggable pane splitter
256
600
320
Pane width 320 pixels
0
prc-PageLayout-ContentWrapper-gR9eG
prc-PageLayout-Content-xWL-A
full
--spacing:var(--spacing-none)
SharedPageLayout-module__content__IwGAp
repos-split-pane-content
0
container CodeViewHeader-module__Box__JkPOb
tmp-px-3 tmp-pt-3 pb-0
StickyHeader
CodeViewHeader-module__Box_1__SbNDV
CodeViewHeader-module__Box_2__TB46f
react-code-view-header-wrap--narrow CodeViewHeader-module__Box_3__q1zUL
CodeViewHeader-module__treeToggleWrapper__RQ__9
use-tree-pane-module__Heading__s4QbZ prc-Heading-Heading-MtWFE
button
Expand file tree
expand-file-tree-button-mobile
prc-Button-ButtonBase-9n-Xk ExpandFileTreeButton-module__Button_1__Svs95
false
medium
invisible
buttonContent
center
prc-Button-ButtonContent-Iohp5
leadingVisual
prc-Button-Visual-YNt2F prc-Button-VisualWrap-E4cnq
true
false
octicon octicon-arrow-left
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z
text
prc-Button-Label-FWkx3
IconButton
button
expand-file-tree-button
repos-file-tree
prc-Button-ButtonBase-9n-Xk position-relative ExpandFileTreeButton-module__expandButton__hDOcv ExpandFileTreeButton-module__filesButtonBreakpoint__zEvz3 fgColor-muted prc-Button-IconButton-fyge7
false
true
medium
invisible
_R_15dajal1d_
true
false
octicon octicon-sidebar-collapse
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M6.823 7.823a.25.25 0 0 1 0 .354l-2.396 2.396A.25.25 0 0 1 4 10.396V5.604a.25.25 0 0 1 .427-.177Z
M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25H9.5v-13H1.75a.25.25 0 0 0-.25.25ZM11 14.5h3.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H11Z
prc-TooltipV2-Tooltip-tLeuB
se
true
_R_15dajal1d_


read-only-cursor-text-area
react-code-view-header-mb--narrow mr-2
button
true
false
0
main branch
anchor-button
Switch branches/tags
prc-Button-ButtonBase-9n-Xk ref-selector-class RefSelectorAnchoredOverlay-module__RefSelectorOverlayBtn__a3WK3
false
medium
default
ref-picker-repos-header-ref-selector-wide
buttonContent
center
prc-Button-ButtonContent-Iohp5
text
prc-Button-Label-FWkx3
RefSelectorAnchoredOverlay-module__RefSelectorOverlayContainer__yaf4p
RefSelectorAnchoredOverlay-module__RefSelectorOverlayHeader__XtXRG
true
false
octicon octicon-git-branch
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z
max-width:125px
ref-selector-button-text-container RefSelectorAnchoredOverlay-module__RefSelectorBtnTextContainer__Di3rk
RefSelectorAnchoredOverlay-module__RefSelectorText__w_fmP
trailingVisual
prc-Button-Visual-YNt2F prc-Button-VisualWrap-E4cnq
true
false
octicon octicon-triangle-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z

ref-selector-hotkey-button
read-only-cursor-text-area
react-code-view-header-mb--narrow CodeViewHeader-module__Box_5__MQ0hL
Breadcrumb-module__container__Vxvev Breadcrumb-module__lg__Rjz0A
breadcrumbs
repos-header-breadcrumb-heading
repos-header-breadcrumb
Breadcrumb-module__nav__rQFDj
sr-only ScreenReaderHeading-module__userSelectNone__rwWIk prc-Heading-Heading-MtWFE
screen-reader-heading
repos-header-breadcrumb-heading
Breadcrumb-module__list__ZH6zr
Breadcrumb-module__listItem__Ib0x_
Breadcrumb-module__repoLink__O2Nbs prc-Link-Link-9ZwDx
breadcrumbs-repo-link
/mark2markett/m2m-stock-intelligence/tree/main
true
Breadcrumb-module__listItem__Ib0x_
Breadcrumb-module__separator__eNwsI Breadcrumb-module__lg__Rjz0A
true
Breadcrumb-module__directoryLink__kQy_t prc-Link-Link-9ZwDx
/mark2markett/m2m-stock-intelligence/tree/main/components
true
breadcrumbs-filename
Breadcrumb-module__filename__equZR
Breadcrumb-module__separator__eNwsI Breadcrumb-module__lg__Rjz0A
true
Breadcrumb-module__filenameHeading__MNMtw Breadcrumb-module__lg__Rjz0A prc-Heading-Heading-MtWFE
-1
file-name-id
IconButton
button
prc-Button-ButtonBase-9n-Xk ml-2 prc-Button-IconButton-fyge7
false
true
small
invisible
_R_1tdajal1d_
true
false
octicon octicon-copy
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z
M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z
CopyToClipboardButton-module__tooltip__BhMvU prc-TooltipV2-Tooltip-tLeuB
nw
Copy path
true
_R_1tdajal1d_
react-code-view-header-element--wide
CodeViewHeader-module__Box_7___0R6c
d-flex gap-2
Box-sc-62in7e-0 CodeViewHeader-module__FileResultsList__JDzUy
TextInput__StyledTextInput-sc-ttxlvl-0 d-flex FileResultsList-module__FilesSearchBox__ivVkc TextInput-wrapper prc-components-TextInputWrapper-Hpdqi prc-components-TextInputBaseWrapper-wY-n0
true
true
false
TextInput-icon
_R_1cmdajal1d_
true
true
false
octicon octicon-search
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z
text
Go to file
combobox
file-results-list
false
dialog
off
false
Go to file
_R_1cmdajal1d_ _R_1cmdajal1dH1_
input
prc-components-Input-IwWrt

TextInput-icon
_R_1cmdajal1dH1_
true


read-only-cursor-text-area



read-only-cursor-text-area



read-only-cursor-text-area

button
display:none
prc-Button-ButtonBase-9n-Xk NavigationMenu-module__Button__LpKgm
false
true
medium
default
buttonContent
center
prc-Button-ButtonContent-Iohp5
text
prc-Button-Label-FWkx3


read-only-cursor-text-area
IconButton
button
more-file-actions-button-nav-menu-wide
true
false
0
prc-Button-ButtonBase-9n-Xk js-blob-dropdown-click NavigationMenu-module__IconButton__HpX3G prc-Button-IconButton-fyge7
false
true
medium
default
_R_7p6dajal1d_
_R_96dajal1d_
true
false
octicon octicon-kebab-horizontal
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z
prc-TooltipV2-Tooltip-tLeuB
nw
true
_R_7p6dajal1d_
react-code-view-header-element--narrow
CodeViewHeader-module__Box_7___0R6c
d-flex gap-2


read-only-cursor-text-area



read-only-cursor-text-area

button
display:none
prc-Button-ButtonBase-9n-Xk NavigationMenu-module__Button__LpKgm
false
true
medium
default
buttonContent
center
prc-Button-ButtonContent-Iohp5
text
prc-Button-Label-FWkx3


read-only-cursor-text-area
IconButton
button
more-file-actions-button-nav-menu-narrow
true
false
0
prc-Button-ButtonBase-9n-Xk js-blob-dropdown-click NavigationMenu-module__IconButton__HpX3G prc-Button-IconButton-fyge7
false
true
medium
default
_R_7p7dajal1d_
_R_97dajal1d_
true
false
octicon octicon-kebab-horizontal
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z
prc-TooltipV2-Tooltip-tLeuB
nw
true
_R_7p7dajal1d_
tmp-mx-3
react-code-view-bottom-padding
BlobTopBanners-module__Box__v_nvx


read-only-cursor-text-area

d-flex flex-column border rounded-2 tmp-mb-3 pl-1
LatestCommit-module__Box__B25ZT
sr-only ScreenReaderHeading-module__userSelectNone__rwWIk prc-Heading-Heading-MtWFE
screen-reader-heading
width:120px
Skeleton Skeleton--text
loading
d-flex flex-shrink-0 gap-2
latest-commit-details
d-none d-sm-flex flex-items-center
d-flex gap-2
sr-only ScreenReaderHeading-module__userSelectNone__rwWIk prc-Heading-Heading-MtWFE
screen-reader-heading
/mark2markett/m2m-stock-intelligence/commits/main/components/AnalysisResults.tsx
prc-Button-ButtonBase-9n-Xk d-none d-lg-flex LinkButton-module__linkButton__nFnov flex-items-center fgColor-default
false
small
invisible
buttonContent
center
prc-Button-ButtonContent-Iohp5
leadingVisual
prc-Button-Visual-YNt2F prc-Button-VisualWrap-E4cnq
true
false
octicon octicon-history
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
m.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z
text
prc-Button-Label-FWkx3
fgColor-default
d-sm-none
d-flex d-lg-none
View commit history for this file.
/mark2markett/m2m-stock-intelligence/commits/main/components/AnalysisResults.tsx
prc-Button-ButtonBase-9n-Xk LinkButton-module__linkButton__nFnov flex-items-center fgColor-default
false
small
invisible
_R_15lalajal1d_
buttonContent
center
prc-Button-ButtonContent-Iohp5
leadingVisual
prc-Button-Visual-YNt2F prc-Button-VisualWrap-E4cnq
true
false
octicon octicon-history
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
m.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z
prc-TooltipV2-Tooltip-tLeuB
s
tooltip
true
_R_15lalajal1d_
d-flex flex-row
container BlobViewContent-module__blobContainer__DtH2d
react-code-size-details-banner BlobViewContent-module__codeSizeDetails__e5sUw
react-code-size-details-banner CodeSizeDetails-module__Box__VcD6l
text-mono CodeSizeDetails-module__Box_1__GVxQL
blob-size
CodeSizeDetails-module__Truncate_1__lE93V prc-Truncate-Truncate-2G1eo
true
22.6 KB
--truncate-max-width:100%
react-blob-view-header-sticky BlobViewContent-module__stickyHeader__VwxB5
repos-sticky-header
BlobViewHeader-module__Box__yhm9u
react-blob-sticky-header
FileNameStickyHeader-module__outerWrapper__ZL4Xc FileNameStickyHeader-module__outerWrapperHidden__Zpynk
FileNameStickyHeader-module__Box_1__Hazu5
FileNameStickyHeader-module__Box_2__hoolP
FileNameStickyHeader-module__Box_3__MVKsk
button
true
false
0
main branch
anchor-button
Switch branches/tags
prc-Button-ButtonBase-9n-Xk ref-selector-class RefSelectorAnchoredOverlay-module__RefSelectorOverlayBtn__a3WK3
false
medium
default
ref-picker-repos-header-ref-selector
buttonContent
center
prc-Button-ButtonContent-Iohp5
text
prc-Button-Label-FWkx3
RefSelectorAnchoredOverlay-module__RefSelectorOverlayContainer__yaf4p
RefSelectorAnchoredOverlay-module__RefSelectorOverlayHeader__XtXRG
true
false
octicon octicon-git-branch
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z
max-width:125px
ref-selector-button-text-container RefSelectorAnchoredOverlay-module__RefSelectorBtnTextContainer__Di3rk
RefSelectorAnchoredOverlay-module__RefSelectorText__w_fmP
trailingVisual
prc-Button-Visual-YNt2F prc-Button-VisualWrap-E4cnq
true
false
octicon octicon-triangle-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z

ref-selector-hotkey-button
read-only-cursor-text-area
FileNameStickyHeader-module__Box_4__FLhtt
Breadcrumb-module__container__Vxvev Breadcrumb-module__md__Wb1Gs
breadcrumbs
sticky-breadcrumb-heading
sticky-breadcrumb
Breadcrumb-module__nav__rQFDj
sr-only ScreenReaderHeading-module__userSelectNone__rwWIk prc-Heading-Heading-MtWFE
screen-reader-heading
sticky-breadcrumb-heading
Breadcrumb-module__list__ZH6zr
Breadcrumb-module__listItem__Ib0x_
Breadcrumb-module__repoLink__O2Nbs prc-Link-Link-9ZwDx
breadcrumbs-repo-link
/mark2markett/m2m-stock-intelligence/tree/main
true
Breadcrumb-module__listItem__Ib0x_
Breadcrumb-module__separator__eNwsI Breadcrumb-module__md__Wb1Gs
true
Breadcrumb-module__directoryLink__kQy_t prc-Link-Link-9ZwDx
/mark2markett/m2m-stock-intelligence/tree/main/components
true
breadcrumbs-filename
Breadcrumb-module__filename__equZR
Breadcrumb-module__separator__eNwsI Breadcrumb-module__md__Wb1Gs
true
Breadcrumb-module__filenameHeading__MNMtw Breadcrumb-module__md__Wb1Gs prc-Heading-Heading-MtWFE
-1
sticky-file-name-id
button
prc-Button-ButtonBase-9n-Xk FileNameStickyHeader-module__Button__LSEU_ FileNameStickyHeader-module__GoToTopButton__nxAFn
false
small
invisible
buttonContent
center
prc-Button-ButtonContent-Iohp5
leadingVisual
prc-Button-Visual-YNt2F prc-Button-VisualWrap-E4cnq
true
false
octicon octicon-arrow-up
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M3.47 7.78a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018L9 4.81v7.44a.75.75 0 0 1-1.5 0V4.81L4.53 7.78a.75.75 0 0 1-1.06 0Z
text
prc-Button-Label-FWkx3
BlobViewHeader-module__Box_1__VEmuQ
sr-only ScreenReaderHeading-module__userSelectNone__rwWIk prc-Heading-Heading-MtWFE
screen-reader-heading
BlobViewHeader-module__Box_2__icUs2
File view
prc-SegmentedControl-SegmentedControl-lqIXp BlobTabButtons-module__SegmentedControl__jen2u
default
small
prc-SegmentedControl-Item-tSCQh

true
prc-SegmentedControl-Button-E48xz
button
--separator-color:transparent
prc-SegmentedControl-Content-1COlk segmentedControl-content
prc-SegmentedControl-Text-7S2y2 segmentedControl-text
Code
prc-SegmentedControl-Item-tSCQh
false
prc-SegmentedControl-Button-E48xz
button
--separator-color:var(--borderColor-default)
prc-SegmentedControl-Content-1COlk segmentedControl-content
prc-SegmentedControl-Text-7S2y2 segmentedControl-text
Blame


read-only-cursor-text-area


read-only-cursor-text-area
react-code-size-details-in-header CodeSizeDetails-module__Box__VcD6l
text-mono CodeSizeDetails-module__Box_1__GVxQL
blob-size
CodeSizeDetails-module__Truncate_1__lE93V prc-Truncate-Truncate-2G1eo
true
22.6 KB
--truncate-max-width:100%
BlobViewHeader-module__Box_3__ng6v2
react-blob-header-edit-and-raw-actions BlobViewHeader-module__Box_4__J4Y4W
prc-ButtonGroup-ButtonGroup-vFUrY
https://github.com/mark2markett/m2m-stock-intelligence/raw/refs/heads/main/components/AnalysisResults.tsx
raw-button
prc-Button-ButtonBase-9n-Xk LinkButton-module__linkButton__nFnov BlobViewHeader-module__LinkButton__X9kx2
false
true
small
default
buttonContent
center
prc-Button-ButtonContent-Iohp5
text
prc-Button-Label-FWkx3
IconButton
button
copy-raw-button
prc-Button-ButtonBase-9n-Xk prc-Button-IconButton-fyge7
false
true
small
default
_R_6arj6alajal1d_
true
false
octicon octicon-copy
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z
M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z
prc-TooltipV2-Tooltip-tLeuB
n
true
_R_6arj6alajal1d_
IconButton
button
download-raw-button
prc-Button-ButtonBase-9n-Xk BlobViewHeader-module__downloadButton__ef459 prc-Button-IconButton-fyge7
false
true
small
default
_R_3arj6alajal1d_
true
false
octicon octicon-download
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z
M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z
prc-TooltipV2-Tooltip-tLeuB
n
true
_R_3arj6alajal1d_

raw-button-shortcut
read-only-cursor-text-area

copy-raw-button-shortcut
read-only-cursor-text-area

download-raw-button-shortcut
read-only-cursor-text-area
IconButton
button
false
false
symbols-pane
symbols-button
prc-Button-ButtonBase-9n-Xk BlobViewHeader-module__IconButton_2__RyjZg prc-Button-IconButton-fyge7
false
true
small
invisible
_R_vj6alajal1d_
symbols-button
true
false
octicon octicon-code-square
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25Zm7.47 3.97a.75.75 0 0 1 1.06 0l2 2a.75.75 0 0 1 0 1.06l-2 2a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L10.69 8 9.22 6.53a.75.75 0 0 1 0-1.06ZM6.78 6.53 5.31 8l1.47 1.47a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-2-2a.75.75 0 0 1 0-1.06l2-2a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z
prc-TooltipV2-Tooltip-tLeuB
nw
true
_R_vj6alajal1d_
react-blob-header-edit-and-raw-actions-combined
IconButton
button
More file actions
more-file-actions-button
true
false
0
prc-Button-ButtonBase-9n-Xk js-blob-dropdown-click BlobViewHeader-module__IconButton__XrMQY prc-Button-IconButton-fyge7
false
true
small
invisible
_R_3t7j6alajal1d_
_R_57j6alajal1d_
true
false
octicon octicon-kebab-horizontal
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z
prc-TooltipV2-Tooltip-tLeuB
nw
true
_R_3t7j6alajal1d_
BlobViewContent-module__blobContentWrapper__JS0W6
file-name-id-wide file-name-id-mobile
BlobContent-module__blobContentSection__VOgZq
margin-top:46px
CodeBlob-module__codeBlobWrapper__RS6In
padding-top:8px;padding-bottom:8px
highlighted-line-menu-positioner
position-relative
copilot-button-positioner
position-relative
CodeBlob-module__codeBlobInner__tfjuQ
react-code-file-contents CodeLinesSSR-module__codeFileContents__ARmAN
presentation
true
4
true
tab-size:4;max-width:unset
true
react-line-numbers
pointer-events:auto
1
react-line-number react-code-text
padding-right:16px
2
react-line-number react-code-text
padding-right:16px
3
react-line-number react-code-text
padding-right:16px
4
react-line-number react-code-text
padding-right:16px
5
react-line-number react-code-text
padding-right:16px
6
react-line-number react-code-text
padding-right:16px
7
react-line-number react-code-text
padding-right:16px
8
react-line-number react-code-text
padding-right:16px
9
react-line-number react-code-text
padding-right:16px
10
react-line-number react-code-text
padding-right:16px
11
react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
12
child-of-line-10  react-line-number react-code-text
padding-right:16px
13
child-of-line-10  react-line-number react-code-text
padding-right:16px
14
child-of-line-10  react-line-number react-code-text
padding-right:16px
15
child-of-line-10  react-line-number react-code-text
padding-right:16px
16
child-of-line-10  react-line-number react-code-text
padding-right:16px
17
child-of-line-10  react-line-number react-code-text
padding-right:16px
18
child-of-line-10  react-line-number react-code-text
padding-right:16px
19
child-of-line-10  react-line-number react-code-text
padding-right:16px
20
child-of-line-10  react-line-number react-code-text
padding-right:16px
21
react-line-number react-code-text
padding-right:16px
22
react-line-number react-code-text
padding-right:16px
23
react-line-number react-code-text
padding-right:16px
24
react-line-number react-code-text
padding-right:16px
25
react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
26
child-of-line-24  react-line-number react-code-text
padding-right:16px
27
child-of-line-24  react-line-number react-code-text
padding-right:16px
28
child-of-line-24  react-line-number react-code-text
padding-right:16px
29
child-of-line-24  react-line-number react-code-text
padding-right:16px
30
child-of-line-24  react-line-number react-code-text
padding-right:16px
31
child-of-line-24  react-line-number react-code-text
padding-right:16px
32
child-of-line-24  react-line-number react-code-text
padding-right:16px
33
child-of-line-24  react-line-number react-code-text
padding-right:16px
34
child-of-line-24  react-line-number react-code-text
padding-right:16px
35
child-of-line-24  react-line-number react-code-text
padding-right:16px
36
child-of-line-24  react-line-number react-code-text
padding-right:16px
37
child-of-line-24  react-line-number react-code-text
padding-right:16px
38
child-of-line-24  react-line-number react-code-text
padding-right:16px
39
child-of-line-24  react-line-number react-code-text
padding-right:16px
40
child-of-line-24  react-line-number react-code-text
padding-right:16px
41
child-of-line-24  react-line-number react-code-text
padding-right:16px
42
child-of-line-24  react-line-number react-code-text
padding-right:16px
43
child-of-line-24  react-line-number react-code-text
padding-right:16px
44
child-of-line-24  react-line-number react-code-text
padding-right:16px
45
child-of-line-24  react-line-number react-code-text
padding-right:16px
46
child-of-line-24  react-line-number react-code-text
padding-right:16px
47
child-of-line-24  react-line-number react-code-text
padding-right:16px
48
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
49
child-of-line-24 child-of-line-47  react-line-number react-code-text
padding-right:16px
50
child-of-line-24 child-of-line-47  react-line-number react-code-text
padding-right:16px
51
child-of-line-24 child-of-line-47  react-line-number react-code-text
padding-right:16px
52
child-of-line-24 child-of-line-47  react-line-number react-code-text
padding-right:16px
53
child-of-line-24 child-of-line-47  react-line-number react-code-text
padding-right:16px
54
child-of-line-24 child-of-line-47  react-line-number react-code-text
padding-right:16px
55
child-of-line-24 child-of-line-47  react-line-number react-code-text
padding-right:16px
56
child-of-line-24  react-line-number react-code-text
padding-right:16px
57
child-of-line-24  react-line-number react-code-text
padding-right:16px
58
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
59
child-of-line-24 child-of-line-57  react-line-number react-code-text
padding-right:16px
60
child-of-line-24 child-of-line-57  react-line-number react-code-text
padding-right:16px
61
child-of-line-24 child-of-line-57  react-line-number react-code-text
padding-right:16px
62
child-of-line-24 child-of-line-57  react-line-number react-code-text
padding-right:16px
63
child-of-line-24  react-line-number react-code-text
padding-right:16px
64
child-of-line-24  react-line-number react-code-text
padding-right:16px
65
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
66
child-of-line-24 child-of-line-64  react-line-number react-code-text
padding-right:16px
67
child-of-line-24 child-of-line-64  react-line-number react-code-text
padding-right:16px
68
child-of-line-24 child-of-line-64  react-line-number react-code-text
padding-right:16px
69
child-of-line-24 child-of-line-64  react-line-number react-code-text
padding-right:16px
70
child-of-line-24  react-line-number react-code-text
padding-right:16px
71
child-of-line-24  react-line-number react-code-text
padding-right:16px
72
child-of-line-24  react-line-number react-code-text
padding-right:16px
73
child-of-line-24  react-line-number react-code-text
padding-right:16px
74
child-of-line-24  react-line-number react-code-text
padding-right:16px
75
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
76
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
77
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
78
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
79
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
80
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
81
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
82
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
83
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
84
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
85
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
86
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
87
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
88
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
89
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
90
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
91
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
92
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
93
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
94
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
95
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
96
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
97
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
98
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
99
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
100
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
101
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
102
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
103
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
104
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
105
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
106
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
107
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
108
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
109
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
110
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
111
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
112
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
113
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
114
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
115
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
116
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
117
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
118
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
119
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
120
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
121
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
122
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
123
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
124
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
125
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
126
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
127
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
128
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
129
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
130
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
131
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
132
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
133
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
134
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
135
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
136
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
137
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
138
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
139
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
140
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
141
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
142
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
143
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
144
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
145
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
146
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
147
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
148
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
149
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
150
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
151
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
152
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
153
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
154
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
155
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
156
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
157
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
158
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
159
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
160
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
161
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
162
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
163
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
164
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
165
child-of-line-24 child-of-line-74  react-line-number react-code-text
padding-right:16px
166
child-of-line-24  react-line-number react-code-text
padding-right:16px
167
child-of-line-24  react-line-number react-code-text
padding-right:16px
168
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
169
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
170
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
171
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
172
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
173
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
174
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
175
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
176
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
177
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
178
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
179
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
180
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
181
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
182
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
183
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
184
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
185
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
186
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
187
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
188
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
189
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
190
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
191
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
192
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
193
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
194
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
195
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
196
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
197
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
198
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
199
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
200
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
201
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
202
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
203
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
204
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
205
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
206
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
207
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
208
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
209
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
210
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
211
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
212
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
213
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
214
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
215
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
216
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
217
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
218
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
219
child-of-line-24 child-of-line-167  react-line-number react-code-text
padding-right:16px
220
child-of-line-24  react-line-number react-code-text
padding-right:16px
221
child-of-line-24  react-line-number react-code-text
padding-right:16px
222
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
223
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
224
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
225
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
226
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
227
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
228
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
229
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
230
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
231
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
232
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
233
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
234
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
235
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
236
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
237
child-of-line-24 child-of-line-221  react-line-number react-code-text
padding-right:16px
238
child-of-line-24  react-line-number react-code-text
padding-right:16px
239
child-of-line-24  react-line-number react-code-text
padding-right:16px
240
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
241
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
242
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
243
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
244
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
245
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
246
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
247
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
248
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
249
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
250
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
251
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
252
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
253
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
254
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
255
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
256
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
257
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
258
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
259
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
260
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
261
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
262
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
263
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
264
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
265
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
266
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
267
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
268
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
269
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
270
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
271
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
272
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
273
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
274
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
275
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
276
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
277
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
278
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
279
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
280
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
281
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
282
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
283
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
284
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
285
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
286
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
287
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
288
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
289
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
290
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
291
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
292
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
293
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
294
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
295
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
296
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
297
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
298
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
299
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
300
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
301
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
302
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
303
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
304
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
305
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
306
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
307
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
308
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
309
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
310
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
311
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
312
child-of-line-24 child-of-line-239  react-line-number react-code-text
padding-right:16px
313
child-of-line-24  react-line-number react-code-text
padding-right:16px
314
child-of-line-24  react-line-number react-code-text
padding-right:16px
315
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
316
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
317
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
318
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
319
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
320
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
321
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
322
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
323
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
324
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
325
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
326
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
327
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
328
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
329
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
330
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
331
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
332
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
333
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
334
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
335
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
336
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
337
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
338
child-of-line-24 child-of-line-314  react-line-number react-code-text
padding-right:16px
339
child-of-line-24  react-line-number react-code-text
padding-right:16px
340
child-of-line-24  react-line-number react-code-text
padding-right:16px
341
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
342
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
343
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
344
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
345
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
346
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
347
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
348
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
349
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
350
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
351
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
352
child-of-line-24 child-of-line-340  react-line-number react-code-text
padding-right:16px
353
child-of-line-24  react-line-number react-code-text
padding-right:16px
354
child-of-line-24  react-line-number react-code-text
padding-right:16px
355
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
356
child-of-line-24 child-of-line-354  react-line-number react-code-text
padding-right:16px
357
child-of-line-24 child-of-line-354  react-line-number react-code-text
padding-right:16px
358
child-of-line-24 child-of-line-354  react-line-number react-code-text
padding-right:16px
359
child-of-line-24 child-of-line-354  react-line-number react-code-text
padding-right:16px
360
child-of-line-24 child-of-line-354  react-line-number react-code-text
padding-right:16px
361
child-of-line-24 child-of-line-354  react-line-number react-code-text
padding-right:16px
362
child-of-line-24 child-of-line-354  react-line-number react-code-text
padding-right:16px
363
child-of-line-24 child-of-line-354  react-line-number react-code-text
padding-right:16px
364
child-of-line-24  react-line-number react-code-text
padding-right:16px
365
child-of-line-24  react-line-number react-code-text
padding-right:16px
366
child-of-line-24  react-line-number react-code-text
padding-right:16px
LineNumber-module__codeAlert__WexRo LineNumber-module__codeAlertRight__hdWmf
Collapse code section
button
0
LineNumber-module__codeFoldingChevron__sY2Yt
true
false
octicon octicon-chevron-down
0 0 16 16
16
16
currentColor
inline-block
visible
vertical-align:text-bottom
M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z
367
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
368
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
369
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
370
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
371
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
372
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
373
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
374
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
375
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
376
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
377
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
378
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
379
child-of-line-24 child-of-line-365  react-line-number react-code-text
padding-right:16px
380
child-of-line-24  react-line-number react-code-text
padding-right:16px
381
child-of-line-24  react-line-number react-code-text
padding-right:16px
382
child-of-line-24  react-line-number react-code-text
padding-right:16px
383
child-of-line-24  react-line-number react-code-text
padding-right:16px
384
child-of-line-24  react-line-number react-code-text
padding-right:16px
385
child-of-line-24  react-line-number react-code-text
padding-right:16px
386
child-of-line-24  react-line-number react-code-text
padding-right:16px
387
child-of-line-24  react-line-number react-code-text
padding-right:16px
388
child-of-line-24  react-line-number react-code-text
padding-right:16px
389
child-of-line-24  react-line-number react-code-text
padding-right:16px
390
child-of-line-24  react-line-number react-code-text
padding-right:16px
391
child-of-line-24  react-line-number react-code-text
padding-right:16px
392
child-of-line-24  react-line-number react-code-text
padding-right:16px
393
child-of-line-24  react-line-number react-code-text
padding-right:16px
394
child-of-line-24  react-line-number react-code-text
padding-right:16px
395
child-of-line-24  react-line-number react-code-text
padding-right:16px
396
child-of-line-24  react-line-number react-code-text
padding-right:16px
397
child-of-line-24  react-line-number react-code-text
padding-right:16px
398
child-of-line-24  react-line-number react-code-text
padding-right:16px
399
child-of-line-24  react-line-number react-code-text
padding-right:16px
400
child-of-line-24  react-line-number react-code-text
padding-right:16px
401
child-of-line-24  react-line-number react-code-text
padding-right:16px
402
child-of-line-24  react-line-number react-code-text
padding-right:16px
403
child-of-line-24  react-line-number react-code-text
padding-right:16px
404
child-of-line-24  react-line-number react-code-text
padding-right:16px
405
child-of-line-24  react-line-number react-code-text
padding-right:16px
406
child-of-line-24  react-line-number react-code-text
padding-right:16px
407
child-of-line-24  react-line-number react-code-text
padding-right:16px
408
child-of-line-24  react-line-number react-code-text
padding-right:16px
409
child-of-line-24  react-line-number react-code-text
padding-right:16px
410
child-of-line-24  react-line-number react-code-text
padding-right:16px
411
child-of-line-24  react-line-number react-code-text
padding-right:16px
412
child-of-line-24  react-line-number react-code-text
padding-right:16px
413
child-of-line-24  react-line-number react-code-text
padding-right:16px
414
child-of-line-24  react-line-number react-code-text
padding-right:16px
415
child-of-line-24  react-line-number react-code-text
padding-right:16px
416
child-of-line-24  react-line-number react-code-text
padding-right:16px
417
child-of-line-24  react-line-number react-code-text
padding-right:16px
418
child-of-line-24  react-line-number react-code-text
padding-right:16px
419
child-of-line-24  react-line-number react-code-text
padding-right:16px
420
child-of-line-24  react-line-number react-code-text
padding-right:16px
421
child-of-line-24  react-line-number react-code-text
padding-right:16px
422
child-of-line-24  react-line-number react-code-text
padding-right:16px
423
child-of-line-24  react-line-number react-code-text
padding-right:16px
424
child-of-line-24  react-line-number react-code-text
padding-right:16px
425
child-of-line-24  react-line-number react-code-text
padding-right:16px
426
child-of-line-24  react-line-number react-code-text
padding-right:16px
427
child-of-line-24  react-line-number react-code-text
padding-right:16px
428
child-of-line-24  react-line-number react-code-text
padding-right:16px
429
child-of-line-24  react-line-number react-code-text
padding-right:16px
430
child-of-line-24  react-line-number react-code-text
padding-right:16px
431
child-of-line-24  react-line-number react-code-text
padding-right:16px
432
child-of-line-24  react-line-number react-code-text
padding-right:16px
433
child-of-line-24  react-line-number react-code-text
padding-right:16px
434
child-of-line-24  react-line-number react-code-text
padding-right:16px
435
child-of-line-24  react-line-number react-code-text
padding-right:16px
436
child-of-line-24  react-line-number react-code-text
padding-right:16px
437
child-of-line-24  react-line-number react-code-text
padding-right:16px
438
child-of-line-24  react-line-number react-code-text
padding-right:16px
439
child-of-line-24  react-line-number react-code-text
padding-right:16px
440
child-of-line-24  react-line-number react-code-text
padding-right:16px
441
child-of-line-24  react-line-number react-code-text
padding-right:16px
442
child-of-line-24  react-line-number react-code-text
padding-right:16px
443
child-of-line-24  react-line-number react-code-text
padding-right:16px
444
child-of-line-24  react-line-number react-code-text
padding-right:16px
445
child-of-line-24  react-line-number react-code-text
padding-right:16px
446
child-of-line-24  react-line-number react-code-text
padding-right:16px
447
child-of-line-24  react-line-number react-code-text
padding-right:16px
448
child-of-line-24  react-line-number react-code-text
padding-right:16px
449
child-of-line-24  react-line-number react-code-text
padding-right:16px
450
child-of-line-24  react-line-number react-code-text
padding-right:16px
451
child-of-line-24  react-line-number react-code-text
padding-right:16px
452
child-of-line-24  react-line-number react-code-text
padding-right:16px
453
child-of-line-24  react-line-number react-code-text
padding-right:16px
454
child-of-line-24  react-line-number react-code-text
padding-right:16px
455
child-of-line-24  react-line-number react-code-text
padding-right:16px
456
child-of-line-24  react-line-number react-code-text
padding-right:16px
457
child-of-line-24  react-line-number react-code-text
padding-right:16px
458
child-of-line-24  react-line-number react-code-text
padding-right:16px
459
child-of-line-24  react-line-number react-code-text
padding-right:16px
460
child-of-line-24  react-line-number react-code-text
padding-right:16px
461
child-of-line-24  react-line-number react-code-text
padding-right:16px
462
child-of-line-24  react-line-number react-code-text
padding-right:16px
463
child-of-line-24  react-line-number react-code-text
padding-right:16px
464
child-of-line-24  react-line-number react-code-text
padding-right:16px
465
child-of-line-24  react-line-number react-code-text
padding-right:16px
466
child-of-line-24  react-line-number react-code-text
padding-right:16px
467
child-of-line-24  react-line-number react-code-text
padding-right:16px
468
child-of-line-24  react-line-number react-code-text
padding-right:16px
469
child-of-line-24  react-line-number react-code-text
padding-right:16px
470
child-of-line-24  react-line-number react-code-text
padding-right:16px
471
child-of-line-24  react-line-number react-code-text
padding-right:16px
472
child-of-line-24  react-line-number react-code-text
padding-right:16px
473
child-of-line-24  react-line-number react-code-text
padding-right:16px
474
child-of-line-24  react-line-number react-code-text
padding-right:16px
475
child-of-line-24  react-line-number react-code-text
padding-right:16px
476
child-of-line-24  react-line-number react-code-text
padding-right:16px
477
child-of-line-24  react-line-number react-code-text
padding-right:16px
478
child-of-line-24  react-line-number react-code-text
padding-right:16px
479
child-of-line-24  react-line-number react-code-text
padding-right:16px
480
child-of-line-24  react-line-number react-code-text
padding-right:16px
481
child-of-line-24  react-line-number react-code-text
padding-right:16px
482
child-of-line-24  react-line-number react-code-text
padding-right:16px
483
child-of-line-24  react-line-number react-code-text
padding-right:16px
484
child-of-line-24  react-line-number react-code-text
padding-right:16px
485
child-of-line-24  react-line-number react-code-text
padding-right:16px
486
child-of-line-24  react-line-number react-code-text
padding-right:16px
487
child-of-line-24  react-line-number react-code-text
padding-right:16px
488
child-of-line-24  react-line-number react-code-text
padding-right:16px
489
child-of-line-24  react-line-number react-code-text
padding-right:16px
490
child-of-line-24  react-line-number react-code-text
padding-right:16px
491
child-of-line-24  react-line-number react-code-text
padding-right:16px
492
child-of-line-24  react-line-number react-code-text
padding-right:16px
493
child-of-line-24  react-line-number react-code-text
padding-right:16px
494
child-of-line-24  react-line-number react-code-text
padding-right:16px
495
child-of-line-24  react-line-number react-code-text
padding-right:16px
496
child-of-line-24  react-line-number react-code-text
padding-right:16px
497
child-of-line-24  react-line-number react-code-text
padding-right:16px
498
child-of-line-24  react-line-number react-code-text
padding-right:16px
499
child-of-line-24  react-line-number react-code-text
padding-right:16px
500
child-of-line-24  react-line-number react-code-text
padding-right:16px
501
child-of-line-24  react-line-number react-code-text
padding-right:16px
502
child-of-line-24  react-line-number react-code-text
padding-right:16px
503
child-of-line-24  react-line-number react-code-text
padding-right:16px
504
child-of-line-24  react-line-number react-code-text
padding-right:16px
505
child-of-line-24  react-line-number react-code-text
padding-right:16px
506
child-of-line-24  react-line-number react-code-text
padding-right:16px
507
react-line-number react-code-text
padding-right:16px
react-code-lines
react-code-text react-code-line-contents
min-height:auto
LC1
react-file-line html-div
code-cell
1
position:relative
pl-s
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC2
react-file-line html-div
code-cell
2
position:relative
react-code-text react-code-line-contents
min-height:auto
LC3
react-file-line html-div
code-cell
3
position:relative
pl-k
pl-v
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-k
pl-s
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC4
react-file-line html-div
code-cell
4
position:relative
pl-k
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-k
pl-s
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC5
react-file-line html-div
code-cell
5
position:relative
pl-k
pl-kos
pl-v
pl-kos
pl-k
pl-s
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC6
react-file-line html-div
code-cell
6
position:relative
pl-k
pl-kos
pl-v
pl-kos
pl-k
pl-s
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC7
react-file-line html-div
code-cell
7
position:relative
pl-k
pl-kos
pl-s1
pl-kos
pl-k
pl-s
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC8
react-file-line html-div
code-cell
8
position:relative
pl-k
pl-k
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-kos
pl-v
pl-k
pl-v
pl-kos
pl-k
pl-s
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC9
react-file-line html-div
code-cell
9
position:relative
pl-k
pl-kos
pl-v
pl-kos
pl-k
pl-s
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC10
react-file-line html-div
code-cell
10
position:relative
react-code-text react-code-line-contents
min-height:auto
LC11
react-file-line html-div
code-cell
11
position:relative
pl-k
pl-smi
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC12
react-file-line html-div
code-cell
12
position:relative
pl-c1
pl-smi
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC13
react-file-line html-div
code-cell
13
position:relative
pl-c1
pl-smi
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC14
react-file-line html-div
code-cell
14
position:relative
pl-c1
pl-smi
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC15
react-file-line html-div
code-cell
15
position:relative
pl-c1
pl-smi
pl-kos
pl-kos
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC16
react-file-line html-div
code-cell
16
position:relative
pl-c1
pl-smi
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC17
react-file-line html-div
code-cell
17
position:relative
pl-c1
pl-smi
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC18
react-file-line html-div
code-cell
18
position:relative
pl-c1
pl-kos
pl-kos
pl-c1
pl-smi
pl-k
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC19
react-file-line html-div
code-cell
19
position:relative
pl-c1
pl-smi
pl-kos
child-of-line-10  react-code-text react-code-line-contents
min-height:auto
LC20
react-file-line html-div
code-cell
20
position:relative
pl-c1
pl-smi
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC21
react-file-line html-div
code-cell
21
position:relative
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC22
react-file-line html-div
code-cell
22
position:relative
react-code-text react-code-line-contents
min-height:auto
LC23
react-file-line html-div
code-cell
23
position:relative
pl-k
pl-c1
pl-c1
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-s
pl-kos
pl-k
pl-k
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC24
react-file-line html-div
code-cell
24
position:relative
react-code-text react-code-line-contents
min-height:auto
LC25
react-file-line html-div
code-cell
25
position:relative
pl-k
pl-k
pl-v
pl-v
pl-kos
pl-smi
pl-c1
pl-smi
pl-c1
pl-c1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC26
react-file-line html-div
code-cell
26
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC27
react-file-line html-div
code-cell
27
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC28
react-file-line html-div
code-cell
28
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC29
react-file-line html-div
code-cell
29
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC30
react-file-line html-div
code-cell
30
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC31
react-file-line html-div
code-cell
31
position:relative
pl-c1
pl-s1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC32
react-file-line html-div
code-cell
32
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC33
react-file-line html-div
code-cell
33
position:relative
pl-c1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC34
react-file-line html-div
code-cell
34
position:relative
pl-c1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC35
react-file-line html-div
code-cell
35
position:relative
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC36
react-file-line html-div
code-cell
36
position:relative
pl-k
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC37
react-file-line html-div
code-cell
37
position:relative
pl-k
pl-s1
pl-c1
pl-en
pl-c1
pl-smi
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC38
react-file-line html-div
code-cell
38
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC39
react-file-line html-div
code-cell
39
position:relative
pl-k
pl-s1
pl-c1
pl-en
pl-kos
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC40
react-file-line html-div
code-cell
40
position:relative
pl-en
pl-kos
pl-s1
pl-c1
pl-v
pl-kos
pl-en
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC41
react-file-line html-div
code-cell
41
position:relative
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC42
react-file-line html-div
code-cell
42
position:relative
pl-k
pl-s1
pl-c1
pl-en
pl-kos
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC43
react-file-line html-div
code-cell
43
position:relative
pl-en
pl-kos
pl-s1
pl-c1
pl-v
pl-kos
pl-en
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC44
react-file-line html-div
code-cell
44
position:relative
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC45
react-file-line html-div
code-cell
45
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC46
react-file-line html-div
code-cell
46
position:relative
pl-en
pl-kos
pl-s1
pl-kos
pl-kos
pl-c1
pl-s1
pl-kos
pl-c1
pl-s1
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC47
react-file-line html-div
code-cell
47
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC48
react-file-line html-div
code-cell
48
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-s1
pl-smi
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-47  react-code-text react-code-line-contents
min-height:auto
LC49
react-file-line html-div
code-cell
49
position:relative
pl-k
pl-kos
pl-s1
pl-kos
pl-kos
child-of-line-24 child-of-line-47  react-code-text react-code-line-contents
min-height:auto
LC50
react-file-line html-div
code-cell
50
position:relative
pl-k
pl-s
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-47  react-code-text react-code-line-contents
min-height:auto
LC51
react-file-line html-div
code-cell
51
position:relative
pl-k
pl-s
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-47  react-code-text react-code-line-contents
min-height:auto
LC52
react-file-line html-div
code-cell
52
position:relative
pl-k
pl-s
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-47  react-code-text react-code-line-contents
min-height:auto
LC53
react-file-line html-div
code-cell
53
position:relative
pl-k
pl-s
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-47  react-code-text react-code-line-contents
min-height:auto
LC54
react-file-line html-div
code-cell
54
position:relative
pl-k
pl-k
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-47  react-code-text react-code-line-contents
min-height:auto
LC55
react-file-line html-div
code-cell
55
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC56
react-file-line html-div
code-cell
56
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC57
react-file-line html-div
code-cell
57
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC58
react-file-line html-div
code-cell
58
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-s1
pl-smi
pl-kos
pl-s1
pl-smi
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-57  react-code-text react-code-line-contents
min-height:auto
LC59
react-file-line html-div
code-cell
59
position:relative
pl-k
pl-s1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-c1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
child-of-line-24 child-of-line-57  react-code-text react-code-line-contents
min-height:auto
LC60
react-file-line html-div
code-cell
60
position:relative
pl-k
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-k
pl-s
pl-kos
child-of-line-24 child-of-line-57  react-code-text react-code-line-contents
min-height:auto
LC61
react-file-line html-div
code-cell
61
position:relative
pl-k
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-k
pl-s
pl-kos
child-of-line-24 child-of-line-57  react-code-text react-code-line-contents
min-height:auto
LC62
react-file-line html-div
code-cell
62
position:relative
pl-k
pl-s
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC63
react-file-line html-div
code-cell
63
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC64
react-file-line html-div
code-cell
64
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC65
react-file-line html-div
code-cell
65
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-s1
pl-smi
pl-kos
pl-s1
pl-smi
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-64  react-code-text react-code-line-contents
min-height:auto
LC66
react-file-line html-div
code-cell
66
position:relative
pl-k
pl-s1
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-c1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
child-of-line-24 child-of-line-64  react-code-text react-code-line-contents
min-height:auto
LC67
react-file-line html-div
code-cell
67
position:relative
pl-k
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-k
pl-s
pl-kos
child-of-line-24 child-of-line-64  react-code-text react-code-line-contents
min-height:auto
LC68
react-file-line html-div
code-cell
68
position:relative
pl-k
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-k
pl-s
pl-kos
child-of-line-24 child-of-line-64  react-code-text react-code-line-contents
min-height:auto
LC69
react-file-line html-div
code-cell
69
position:relative
pl-k
pl-s
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC70
react-file-line html-div
code-cell
70
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC71
react-file-line html-div
code-cell
71
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC72
react-file-line html-div
code-cell
72
position:relative
pl-k
pl-kos
pl-kos
pl-c1
pl-s1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC73
react-file-line html-div
code-cell
73
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC74
react-file-line html-div
code-cell
74
position:relative
pl-c
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC75
react-file-line html-div
code-cell
75
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC76
react-file-line html-div
code-cell
76
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC77
react-file-line html-div
code-cell
77
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC78
react-file-line html-div
code-cell
78
position:relative
pl-c1
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC79
react-file-line html-div
code-cell
79
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC80
react-file-line html-div
code-cell
80
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC81
react-file-line html-div
code-cell
81
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC82
react-file-line html-div
code-cell
82
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC83
react-file-line html-div
code-cell
83
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC84
react-file-line html-div
code-cell
84
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC85
react-file-line html-div
code-cell
85
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC86
react-file-line html-div
code-cell
86
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC87
react-file-line html-div
code-cell
87
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC88
react-file-line html-div
code-cell
88
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC89
react-file-line html-div
code-cell
89
position:relative
pl-kos
pl-c1
pl-s1
pl-c1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC90
react-file-line html-div
code-cell
90
position:relative
pl-c1
pl-s1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC91
react-file-line html-div
code-cell
91
position:relative
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC92
react-file-line html-div
code-cell
92
position:relative
pl-c1
pl-c1
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC93
react-file-line html-div
code-cell
93
position:relative
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC94
react-file-line html-div
code-cell
94
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC95
react-file-line html-div
code-cell
95
position:relative
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC96
react-file-line html-div
code-cell
96
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC97
react-file-line html-div
code-cell
97
position:relative
pl-kos
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC98
react-file-line html-div
code-cell
98
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC99
react-file-line html-div
code-cell
99
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC100
react-file-line html-div
code-cell
100
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC101
react-file-line html-div
code-cell
101
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC102
react-file-line html-div
code-cell
102
position:relative
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC103
react-file-line html-div
code-cell
103
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC104
react-file-line html-div
code-cell
104
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC105
react-file-line html-div
code-cell
105
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC106
react-file-line html-div
code-cell
106
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC107
react-file-line html-div
code-cell
107
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC108
react-file-line html-div
code-cell
108
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC109
react-file-line html-div
code-cell
109
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC110
react-file-line html-div
code-cell
110
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC111
react-file-line html-div
code-cell
111
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC112
react-file-line html-div
code-cell
112
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC113
react-file-line html-div
code-cell
113
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC114
react-file-line html-div
code-cell
114
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC115
react-file-line html-div
code-cell
115
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC116
react-file-line html-div
code-cell
116
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC117
react-file-line html-div
code-cell
117
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC118
react-file-line html-div
code-cell
118
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC119
react-file-line html-div
code-cell
119
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC120
react-file-line html-div
code-cell
120
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC121
react-file-line html-div
code-cell
121
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC122
react-file-line html-div
code-cell
122
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC123
react-file-line html-div
code-cell
123
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC124
react-file-line html-div
code-cell
124
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC125
react-file-line html-div
code-cell
125
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC126
react-file-line html-div
code-cell
126
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC127
react-file-line html-div
code-cell
127
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC128
react-file-line html-div
code-cell
128
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC129
react-file-line html-div
code-cell
129
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC130
react-file-line html-div
code-cell
130
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC131
react-file-line html-div
code-cell
131
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC132
react-file-line html-div
code-cell
132
position:relative
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC133
react-file-line html-div
code-cell
133
position:relative
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC134
react-file-line html-div
code-cell
134
position:relative
pl-s
pl-s1
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC135
react-file-line html-div
code-cell
135
position:relative
pl-s
pl-s1
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC136
react-file-line html-div
code-cell
136
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC137
react-file-line html-div
code-cell
137
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC138
react-file-line html-div
code-cell
138
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC139
react-file-line html-div
code-cell
139
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC140
react-file-line html-div
code-cell
140
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC141
react-file-line html-div
code-cell
141
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC142
react-file-line html-div
code-cell
142
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC143
react-file-line html-div
code-cell
143
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC144
react-file-line html-div
code-cell
144
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC145
react-file-line html-div
code-cell
145
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC146
react-file-line html-div
code-cell
146
position:relative
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC147
react-file-line html-div
code-cell
147
position:relative
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC148
react-file-line html-div
code-cell
148
position:relative
pl-s
pl-s1
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC149
react-file-line html-div
code-cell
149
position:relative
pl-s
pl-s1
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC150
react-file-line html-div
code-cell
150
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC151
react-file-line html-div
code-cell
151
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC152
react-file-line html-div
code-cell
152
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC153
react-file-line html-div
code-cell
153
position:relative
pl-c1
pl-s1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC154
react-file-line html-div
code-cell
154
position:relative
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC155
react-file-line html-div
code-cell
155
position:relative
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC156
react-file-line html-div
code-cell
156
position:relative
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC157
react-file-line html-div
code-cell
157
position:relative
pl-s
pl-s1
pl-s
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC158
react-file-line html-div
code-cell
158
position:relative
pl-s
pl-s1
pl-kos
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC159
react-file-line html-div
code-cell
159
position:relative
pl-c1
pl-c1
pl-kos
pl-kos
pl-c1
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC160
react-file-line html-div
code-cell
160
position:relative
pl-kos
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC161
react-file-line html-div
code-cell
161
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC162
react-file-line html-div
code-cell
162
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC163
react-file-line html-div
code-cell
163
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC164
react-file-line html-div
code-cell
164
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-74  react-code-text react-code-line-contents
min-height:auto
LC165
react-file-line html-div
code-cell
165
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC166
react-file-line html-div
code-cell
166
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC167
react-file-line html-div
code-cell
167
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC168
react-file-line html-div
code-cell
168
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC169
react-file-line html-div
code-cell
169
position:relative
pl-c1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC170
react-file-line html-div
code-cell
170
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC171
react-file-line html-div
code-cell
171
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC172
react-file-line html-div
code-cell
172
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC173
react-file-line html-div
code-cell
173
position:relative
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC174
react-file-line html-div
code-cell
174
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC175
react-file-line html-div
code-cell
175
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC176
react-file-line html-div
code-cell
176
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC177
react-file-line html-div
code-cell
177
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC178
react-file-line html-div
code-cell
178
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC179
react-file-line html-div
code-cell
179
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC180
react-file-line html-div
code-cell
180
position:relative
pl-kos
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC181
react-file-line html-div
code-cell
181
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC182
react-file-line html-div
code-cell
182
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC183
react-file-line html-div
code-cell
183
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC184
react-file-line html-div
code-cell
184
position:relative
pl-kos
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC185
react-file-line html-div
code-cell
185
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC186
react-file-line html-div
code-cell
186
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC187
react-file-line html-div
code-cell
187
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC188
react-file-line html-div
code-cell
188
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC189
react-file-line html-div
code-cell
189
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC190
react-file-line html-div
code-cell
190
position:relative
pl-kos
pl-s
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC191
react-file-line html-div
code-cell
191
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC192
react-file-line html-div
code-cell
192
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC193
react-file-line html-div
code-cell
193
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC194
react-file-line html-div
code-cell
194
position:relative
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC195
react-file-line html-div
code-cell
195
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC196
react-file-line html-div
code-cell
196
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC197
react-file-line html-div
code-cell
197
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC198
react-file-line html-div
code-cell
198
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC199
react-file-line html-div
code-cell
199
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC200
react-file-line html-div
code-cell
200
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC201
react-file-line html-div
code-cell
201
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC202
react-file-line html-div
code-cell
202
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC203
react-file-line html-div
code-cell
203
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC204
react-file-line html-div
code-cell
204
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC205
react-file-line html-div
code-cell
205
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC206
react-file-line html-div
code-cell
206
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC207
react-file-line html-div
code-cell
207
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC208
react-file-line html-div
code-cell
208
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC209
react-file-line html-div
code-cell
209
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC210
react-file-line html-div
code-cell
210
position:relative
pl-c1
pl-s1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC211
react-file-line html-div
code-cell
211
position:relative
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-en
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC212
react-file-line html-div
code-cell
212
position:relative
pl-c1
pl-c1
pl-kos
pl-kos
pl-c1
pl-s
pl-s1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-kos
pl-kos
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC213
react-file-line html-div
code-cell
213
position:relative
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC214
react-file-line html-div
code-cell
214
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC215
react-file-line html-div
code-cell
215
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC216
react-file-line html-div
code-cell
216
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC217
react-file-line html-div
code-cell
217
position:relative
pl-kos
pl-kos
pl-kos
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC218
react-file-line html-div
code-cell
218
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-167  react-code-text react-code-line-contents
min-height:auto
LC219
react-file-line html-div
code-cell
219
position:relative
pl-kos
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC220
react-file-line html-div
code-cell
220
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC221
react-file-line html-div
code-cell
221
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC222
react-file-line html-div
code-cell
222
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC223
react-file-line html-div
code-cell
223
position:relative
pl-k
pl-kos
pl-c1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-k
pl-c1
pl-kos
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC224
react-file-line html-div
code-cell
224
position:relative
pl-k
pl-kos
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC225
react-file-line html-div
code-cell
225
position:relative
pl-c1
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC226
react-file-line html-div
code-cell
226
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC227
react-file-line html-div
code-cell
227
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC228
react-file-line html-div
code-cell
228
position:relative
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC229
react-file-line html-div
code-cell
229
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC230
react-file-line html-div
code-cell
230
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC231
react-file-line html-div
code-cell
231
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC232
react-file-line html-div
code-cell
232
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC233
react-file-line html-div
code-cell
233
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC234
react-file-line html-div
code-cell
234
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC235
react-file-line html-div
code-cell
235
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC236
react-file-line html-div
code-cell
236
position:relative
pl-kos
pl-c1
child-of-line-24 child-of-line-221  react-code-text react-code-line-contents
min-height:auto
LC237
react-file-line html-div
code-cell
237
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC238
react-file-line html-div
code-cell
238
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC239
react-file-line html-div
code-cell
239
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC240
react-file-line html-div
code-cell
240
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC241
react-file-line html-div
code-cell
241
position:relative
pl-c1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC242
react-file-line html-div
code-cell
242
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC243
react-file-line html-div
code-cell
243
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC244
react-file-line html-div
code-cell
244
position:relative
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC245
react-file-line html-div
code-cell
245
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC246
react-file-line html-div
code-cell
246
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC247
react-file-line html-div
code-cell
247
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC248
react-file-line html-div
code-cell
248
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC249
react-file-line html-div
code-cell
249
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC250
react-file-line html-div
code-cell
250
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC251
react-file-line html-div
code-cell
251
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC252
react-file-line html-div
code-cell
252
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC253
react-file-line html-div
code-cell
253
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC254
react-file-line html-div
code-cell
254
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC255
react-file-line html-div
code-cell
255
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC256
react-file-line html-div
code-cell
256
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC257
react-file-line html-div
code-cell
257
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC258
react-file-line html-div
code-cell
258
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC259
react-file-line html-div
code-cell
259
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC260
react-file-line html-div
code-cell
260
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC261
react-file-line html-div
code-cell
261
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC262
react-file-line html-div
code-cell
262
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC263
react-file-line html-div
code-cell
263
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC264
react-file-line html-div
code-cell
264
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC265
react-file-line html-div
code-cell
265
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC266
react-file-line html-div
code-cell
266
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC267
react-file-line html-div
code-cell
267
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC268
react-file-line html-div
code-cell
268
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC269
react-file-line html-div
code-cell
269
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC270
react-file-line html-div
code-cell
270
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC271
react-file-line html-div
code-cell
271
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC272
react-file-line html-div
code-cell
272
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC273
react-file-line html-div
code-cell
273
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC274
react-file-line html-div
code-cell
274
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC275
react-file-line html-div
code-cell
275
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC276
react-file-line html-div
code-cell
276
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC277
react-file-line html-div
code-cell
277
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC278
react-file-line html-div
code-cell
278
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC279
react-file-line html-div
code-cell
279
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC280
react-file-line html-div
code-cell
280
position:relative
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-s
pl-s
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC281
react-file-line html-div
code-cell
281
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC282
react-file-line html-div
code-cell
282
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC283
react-file-line html-div
code-cell
283
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC284
react-file-line html-div
code-cell
284
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC285
react-file-line html-div
code-cell
285
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC286
react-file-line html-div
code-cell
286
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC287
react-file-line html-div
code-cell
287
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC288
react-file-line html-div
code-cell
288
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC289
react-file-line html-div
code-cell
289
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC290
react-file-line html-div
code-cell
290
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC291
react-file-line html-div
code-cell
291
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC292
react-file-line html-div
code-cell
292
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC293
react-file-line html-div
code-cell
293
position:relative
pl-kos
pl-s1
pl-c1
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC294
react-file-line html-div
code-cell
294
position:relative
pl-c1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC295
react-file-line html-div
code-cell
295
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC296
react-file-line html-div
code-cell
296
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC297
react-file-line html-div
code-cell
297
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC298
react-file-line html-div
code-cell
298
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC299
react-file-line html-div
code-cell
299
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-s
pl-s
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC300
react-file-line html-div
code-cell
300
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC301
react-file-line html-div
code-cell
301
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC302
react-file-line html-div
code-cell
302
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC303
react-file-line html-div
code-cell
303
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC304
react-file-line html-div
code-cell
304
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC305
react-file-line html-div
code-cell
305
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC306
react-file-line html-div
code-cell
306
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC307
react-file-line html-div
code-cell
307
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC308
react-file-line html-div
code-cell
308
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC309
react-file-line html-div
code-cell
309
position:relative
pl-kos
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC310
react-file-line html-div
code-cell
310
position:relative
pl-kos
pl-kos
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC311
react-file-line html-div
code-cell
311
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-239  react-code-text react-code-line-contents
min-height:auto
LC312
react-file-line html-div
code-cell
312
position:relative
pl-kos
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC313
react-file-line html-div
code-cell
313
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC314
react-file-line html-div
code-cell
314
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC315
react-file-line html-div
code-cell
315
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC316
react-file-line html-div
code-cell
316
position:relative
pl-k
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-kos
pl-k
pl-c1
pl-kos
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC317
react-file-line html-div
code-cell
317
position:relative
pl-k
pl-kos
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC318
react-file-line html-div
code-cell
318
position:relative
pl-c1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC319
react-file-line html-div
code-cell
319
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-v
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC320
react-file-line html-div
code-cell
320
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC321
react-file-line html-div
code-cell
321
position:relative
pl-kos
pl-s1
pl-kos
pl-en
pl-kos
pl-c1
pl-kos
pl-c1
pl-kos
pl-kos
pl-en
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC322
react-file-line html-div
code-cell
322
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC323
react-file-line html-div
code-cell
323
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC324
react-file-line html-div
code-cell
324
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC325
react-file-line html-div
code-cell
325
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC326
react-file-line html-div
code-cell
326
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC327
react-file-line html-div
code-cell
327
position:relative
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-s
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC328
react-file-line html-div
code-cell
328
position:relative
pl-s
pl-s1
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-s
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC329
react-file-line html-div
code-cell
329
position:relative
pl-s
pl-s1
pl-s
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC330
react-file-line html-div
code-cell
330
position:relative
pl-s
pl-s1
pl-kos
pl-kos
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC331
react-file-line html-div
code-cell
331
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC332
react-file-line html-div
code-cell
332
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC333
react-file-line html-div
code-cell
333
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC334
react-file-line html-div
code-cell
334
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC335
react-file-line html-div
code-cell
335
position:relative
pl-kos
pl-kos
pl-kos
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC336
react-file-line html-div
code-cell
336
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC337
react-file-line html-div
code-cell
337
position:relative
pl-kos
pl-c1
child-of-line-24 child-of-line-314  react-code-text react-code-line-contents
min-height:auto
LC338
react-file-line html-div
code-cell
338
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC339
react-file-line html-div
code-cell
339
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC340
react-file-line html-div
code-cell
340
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC341
react-file-line html-div
code-cell
341
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC342
react-file-line html-div
code-cell
342
position:relative
pl-c1
pl-c1
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC343
react-file-line html-div
code-cell
343
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC344
react-file-line html-div
code-cell
344
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC345
react-file-line html-div
code-cell
345
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC346
react-file-line html-div
code-cell
346
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC347
react-file-line html-div
code-cell
347
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC348
react-file-line html-div
code-cell
348
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC349
react-file-line html-div
code-cell
349
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC350
react-file-line html-div
code-cell
350
position:relative
pl-kos
pl-kos
pl-kos
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC351
react-file-line html-div
code-cell
351
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-340  react-code-text react-code-line-contents
min-height:auto
LC352
react-file-line html-div
code-cell
352
position:relative
pl-kos
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC353
react-file-line html-div
code-cell
353
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC354
react-file-line html-div
code-cell
354
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC355
react-file-line html-div
code-cell
355
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-354  react-code-text react-code-line-contents
min-height:auto
LC356
react-file-line html-div
code-cell
356
position:relative
pl-k
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24 child-of-line-354  react-code-text react-code-line-contents
min-height:auto
LC357
react-file-line html-div
code-cell
357
position:relative
pl-k
pl-s
child-of-line-24 child-of-line-354  react-code-text react-code-line-contents
min-height:auto
LC358
react-file-line html-div
code-cell
358
position:relative
pl-k
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-s
pl-kos
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-354  react-code-text react-code-line-contents
min-height:auto
LC359
react-file-line html-div
code-cell
359
position:relative
pl-k
pl-s
child-of-line-24 child-of-line-354  react-code-text react-code-line-contents
min-height:auto
LC360
react-file-line html-div
code-cell
360
position:relative
pl-k
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-s
pl-kos
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-354  react-code-text react-code-line-contents
min-height:auto
LC361
react-file-line html-div
code-cell
361
position:relative
pl-k
child-of-line-24 child-of-line-354  react-code-text react-code-line-contents
min-height:auto
LC362
react-file-line html-div
code-cell
362
position:relative
pl-k
pl-kos
pl-c1
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-s
pl-kos
pl-c1
pl-s
pl-kos
pl-kos
child-of-line-24 child-of-line-354  react-code-text react-code-line-contents
min-height:auto
LC363
react-file-line html-div
code-cell
363
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC364
react-file-line html-div
code-cell
364
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC365
react-file-line html-div
code-cell
365
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC366
react-file-line html-div
code-cell
366
position:relative
pl-k
pl-en
pl-c1
pl-kos
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC367
react-file-line html-div
code-cell
367
position:relative
pl-k
pl-s1
pl-c1
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC368
react-file-line html-div
code-cell
368
position:relative
pl-k
pl-kos
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC369
react-file-line html-div
code-cell
369
position:relative
pl-c1
pl-c1
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC370
react-file-line html-div
code-cell
370
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC371
react-file-line html-div
code-cell
371
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC372
react-file-line html-div
code-cell
372
position:relative
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC373
react-file-line html-div
code-cell
373
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC374
react-file-line html-div
code-cell
374
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-c1
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC375
react-file-line html-div
code-cell
375
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC376
react-file-line html-div
code-cell
376
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC377
react-file-line html-div
code-cell
377
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
pl-s1
pl-c1
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC378
react-file-line html-div
code-cell
378
position:relative
pl-kos
pl-c1
child-of-line-24 child-of-line-365  react-code-text react-code-line-contents
min-height:auto
LC379
react-file-line html-div
code-cell
379
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC380
react-file-line html-div
code-cell
380
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC381
react-file-line html-div
code-cell
381
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC382
react-file-line html-div
code-cell
382
position:relative
pl-c
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC383
react-file-line html-div
code-cell
383
position:relative
pl-k
pl-s1
pl-c1
pl-s1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC384
react-file-line html-div
code-cell
384
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC385
react-file-line html-div
code-cell
385
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC386
react-file-line html-div
code-cell
386
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC387
react-file-line html-div
code-cell
387
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC388
react-file-line html-div
code-cell
388
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC389
react-file-line html-div
code-cell
389
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC390
react-file-line html-div
code-cell
390
position:relative
pl-c
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC391
react-file-line html-div
code-cell
391
position:relative
pl-k
pl-kos
pl-s1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC392
react-file-line html-div
code-cell
392
position:relative
pl-k
pl-s1
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC393
react-file-line html-div
code-cell
393
position:relative
pl-k
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC394
react-file-line html-div
code-cell
394
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC395
react-file-line html-div
code-cell
395
position:relative
pl-kos
pl-s1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC396
react-file-line html-div
code-cell
396
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC397
react-file-line html-div
code-cell
397
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC398
react-file-line html-div
code-cell
398
position:relative
pl-kos
pl-c
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC399
react-file-line html-div
code-cell
399
position:relative
pl-c1
pl-s1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC400
react-file-line html-div
code-cell
400
position:relative
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC401
react-file-line html-div
code-cell
401
position:relative
pl-c1
pl-c1
pl-s
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC402
react-file-line html-div
code-cell
402
position:relative
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC403
react-file-line html-div
code-cell
403
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC404
react-file-line html-div
code-cell
404
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC405
react-file-line html-div
code-cell
405
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC406
react-file-line html-div
code-cell
406
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC407
react-file-line html-div
code-cell
407
position:relative
pl-kos
pl-c
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC408
react-file-line html-div
code-cell
408
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC409
react-file-line html-div
code-cell
409
position:relative
pl-kos
pl-c1
pl-kos
pl-en
pl-kos
pl-kos
pl-s1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC410
react-file-line html-div
code-cell
410
position:relative
pl-c1
pl-s1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC411
react-file-line html-div
code-cell
411
position:relative
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC412
react-file-line html-div
code-cell
412
position:relative
pl-c1
pl-c1
pl-kos
pl-kos
pl-kos
pl-c1
pl-en
pl-kos
pl-s1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC413
react-file-line html-div
code-cell
413
position:relative
pl-c1
pl-c1
pl-s
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC414
react-file-line html-div
code-cell
414
position:relative
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
pl-s1
pl-c1
pl-c1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC415
react-file-line html-div
code-cell
415
position:relative
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC416
react-file-line html-div
code-cell
416
position:relative
pl-c1
pl-s1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC417
react-file-line html-div
code-cell
417
position:relative
pl-c1
pl-c1
pl-kos
pl-s
pl-s1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC418
react-file-line html-div
code-cell
418
position:relative
pl-s
pl-s1
pl-s1
pl-c1
pl-s1
pl-s
pl-s
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC419
react-file-line html-div
code-cell
419
position:relative
pl-s
pl-s1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC420
react-file-line html-div
code-cell
420
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC421
react-file-line html-div
code-cell
421
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC422
react-file-line html-div
code-cell
422
position:relative
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC423
react-file-line html-div
code-cell
423
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC424
react-file-line html-div
code-cell
424
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC425
react-file-line html-div
code-cell
425
position:relative
pl-kos
pl-c
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC426
react-file-line html-div
code-cell
426
position:relative
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC427
react-file-line html-div
code-cell
427
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC428
react-file-line html-div
code-cell
428
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC429
react-file-line html-div
code-cell
429
position:relative
pl-kos
pl-v
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC430
react-file-line html-div
code-cell
430
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC431
react-file-line html-div
code-cell
431
position:relative
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC432
react-file-line html-div
code-cell
432
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC433
react-file-line html-div
code-cell
433
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC434
react-file-line html-div
code-cell
434
position:relative
pl-kos
pl-v
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC435
react-file-line html-div
code-cell
435
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC436
react-file-line html-div
code-cell
436
position:relative
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC437
react-file-line html-div
code-cell
437
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC438
react-file-line html-div
code-cell
438
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC439
react-file-line html-div
code-cell
439
position:relative
pl-kos
pl-v
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC440
react-file-line html-div
code-cell
440
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC441
react-file-line html-div
code-cell
441
position:relative
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC442
react-file-line html-div
code-cell
442
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC443
react-file-line html-div
code-cell
443
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-c1
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC444
react-file-line html-div
code-cell
444
position:relative
pl-kos
pl-v
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC445
react-file-line html-div
code-cell
445
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC446
react-file-line html-div
code-cell
446
position:relative
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC447
react-file-line html-div
code-cell
447
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC448
react-file-line html-div
code-cell
448
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC449
react-file-line html-div
code-cell
449
position:relative
pl-kos
pl-v
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC450
react-file-line html-div
code-cell
450
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC451
react-file-line html-div
code-cell
451
position:relative
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-s1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC452
react-file-line html-div
code-cell
452
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC453
react-file-line html-div
code-cell
453
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC454
react-file-line html-div
code-cell
454
position:relative
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-c1
pl-s1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC455
react-file-line html-div
code-cell
455
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC456
react-file-line html-div
code-cell
456
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC457
react-file-line html-div
code-cell
457
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC458
react-file-line html-div
code-cell
458
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC459
react-file-line html-div
code-cell
459
position:relative
pl-kos
pl-s1
pl-c1
pl-s
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC460
react-file-line html-div
code-cell
460
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-c1
pl-c1
pl-kos
pl-c1
pl-v
pl-c1
pl-c1
pl-s
pl-kos
pl-kos
pl-c1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC461
react-file-line html-div
code-cell
461
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC462
react-file-line html-div
code-cell
462
position:relative
pl-kos
pl-v
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC463
react-file-line html-div
code-cell
463
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC464
react-file-line html-div
code-cell
464
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC465
react-file-line html-div
code-cell
465
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC466
react-file-line html-div
code-cell
466
position:relative
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC467
react-file-line html-div
code-cell
467
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC468
react-file-line html-div
code-cell
468
position:relative
pl-c
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC469
react-file-line html-div
code-cell
469
position:relative
pl-k
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC470
react-file-line html-div
code-cell
470
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC471
react-file-line html-div
code-cell
471
position:relative
pl-kos
pl-s1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC472
react-file-line html-div
code-cell
472
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC473
react-file-line html-div
code-cell
473
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC474
react-file-line html-div
code-cell
474
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-s1
pl-kos
pl-c1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC475
react-file-line html-div
code-cell
475
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC476
react-file-line html-div
code-cell
476
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC477
react-file-line html-div
code-cell
477
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC478
react-file-line html-div
code-cell
478
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC479
react-file-line html-div
code-cell
479
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC480
react-file-line html-div
code-cell
480
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC481
react-file-line html-div
code-cell
481
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC482
react-file-line html-div
code-cell
482
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC483
react-file-line html-div
code-cell
483
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC484
react-file-line html-div
code-cell
484
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC485
react-file-line html-div
code-cell
485
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC486
react-file-line html-div
code-cell
486
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC487
react-file-line html-div
code-cell
487
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC488
react-file-line html-div
code-cell
488
position:relative
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-c1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC489
react-file-line html-div
code-cell
489
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC490
react-file-line html-div
code-cell
490
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC491
react-file-line html-div
code-cell
491
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC492
react-file-line html-div
code-cell
492
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC493
react-file-line html-div
code-cell
493
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC494
react-file-line html-div
code-cell
494
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC495
react-file-line html-div
code-cell
495
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC496
react-file-line html-div
code-cell
496
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC497
react-file-line html-div
code-cell
497
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC498
react-file-line html-div
code-cell
498
position:relative
pl-kos
pl-s1
pl-c1
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC499
react-file-line html-div
code-cell
499
position:relative
pl-c1
pl-v
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-c1
pl-kos
pl-s1
pl-kos
pl-c1
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC500
react-file-line html-div
code-cell
500
position:relative
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC501
react-file-line html-div
code-cell
501
position:relative
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC502
react-file-line html-div
code-cell
502
position:relative
pl-c1
pl-s1
pl-c1
pl-c1
pl-s
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC503
react-file-line html-div
code-cell
503
position:relative
pl-kos
pl-en
pl-kos
pl-kos
pl-kos
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC504
react-file-line html-div
code-cell
504
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC505
react-file-line html-div
code-cell
505
position:relative
pl-kos
pl-s1
pl-c1
child-of-line-24  react-code-text react-code-line-contents
min-height:auto
LC506
react-file-line html-div
code-cell
506
position:relative
pl-kos
pl-kos
react-code-text react-code-line-contents
min-height:auto
LC507
react-file-line html-div
code-cell
507
position:relative
pl-kos
pl-kos
copilot-button-container
highlighted-line-menu-container

hotkey-button
read-only-cursor-text-area

ScrollMarksContainer-module__scrollMarksContainer__Eu7uU
find-result-marks-container


read-only-cursor-text-area

application/json
__PRIMER_DATA__R_1___
resolvedServerColorMode
day
footer tmp-pt-7 tmp-pb-6 f6 color-fg-muted color-border-subtle p-responsive
contentinfo
d-flex flex-justify-center flex-items-center flex-column-reverse flex-lg-row flex-wrap flex-lg-nowrap
d-flex flex-items-center flex-shrink-0 mx-2
GitHub Homepage
footer-octicon mr-2
https://github.com
true
24
0 0 24 24
1.1
24
true
octicon octicon-mark-github
M10.303 16.652c-2.837-.344-4.835-2.385-4.835-5.028 0-1.074.387-2.235 1.031-3.008-.279-.709-.236-2.214.086-2.837.86-.107 2.02.344 2.708.967.816-.258 1.676-.386 2.728-.386 1.053 0 1.913.128 2.686.365.666-.602 1.848-1.053 2.708-.946.3.581.344 2.085.064 2.815.688.817 1.053 1.913 1.053 3.03 0 2.643-1.998 4.641-4.877 5.006.73.473 1.224 1.504 1.224 2.686v2.235c0 .644.537 1.01 1.182.752 3.889-1.483 6.94-5.372 6.94-10.185 0-6.081-4.942-11.044-11.022-11.044-6.081 0-10.98 4.963-10.98 11.044a10.84 10.84 0 0 0 7.112 10.206c.58.215 1.139-.172 1.139-.752v-1.719a2.768 2.768 0 0 1-1.032.215c-1.418 0-2.256-.773-2.857-2.213-.237-.58-.495-.924-.989-.988-.258-.022-.344-.129-.344-.258 0-.258.43-.451.86-.451.623 0 1.16.386 1.719 1.181.43.623.881.903 1.418.903.537 0 .881-.194 1.375-.688.365-.365.645-.687.903-.902Z
Footer
sr-only
sr-footer-heading
list-style-none d-flex flex-justify-center flex-wrap mb-2 mb-lg-0
sr-footer-heading
mx-2
{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to Terms&quot;,&quot;label&quot;:&quot;text:terms&quot;}
https://docs.github.com/site-policy/github-terms/github-terms-of-service
true
Link--secondary Link
mx-2
{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to privacy&quot;,&quot;label&quot;:&quot;text:privacy&quot;}
https://docs.github.com/site-policy/privacy-policies/github-privacy-statement
true
Link--secondary Link
mx-2
{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to security&quot;,&quot;label&quot;:&quot;text:security&quot;}
https://github.com/security
true
Link--secondary Link
mx-2
{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to status&quot;,&quot;label&quot;:&quot;text:status&quot;}
https://www.githubstatus.com/
true
Link--secondary Link
mx-2
{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to community&quot;,&quot;label&quot;:&quot;text:community&quot;}
https://github.community/
true
Link--secondary Link
mx-2
{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to docs&quot;,&quot;label&quot;:&quot;text:docs&quot;}
https://docs.github.com/
true
Link--secondary Link
mx-2
{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to contact&quot;,&quot;label&quot;:&quot;text:contact&quot;}
https://support.github.com?tags=dotcom-footer
true
Link--secondary Link
mx-2
button
Link--secondary underline-on-hover border-0 p-0 color-bg-transparent
click:cookie-consent-link#showConsentManagement
{&quot;location&quot;:&quot;footer&quot;,&quot;action&quot;:&quot;cookies&quot;,&quot;context&quot;:&quot;subfooter&quot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;cookies_link_subfooter_footer&quot;}
mx-2
button
Link--secondary underline-on-hover border-0 p-0 color-bg-transparent text-left
click:cookie-consent-link#showConsentManagement
{&quot;location&quot;:&quot;footer&quot;,&quot;action&quot;:&quot;dont_share_info&quot;,&quot;context&quot;:&quot;subfooter&quot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;dont_share_info_link_subfooter_footer&quot;}
ghcc
position-fixed bottom-0 left-0
z-index: 999999
en

false
ajax-error-message
ajax-error-message flash flash-error
true
16
0 0 16 16
1.1
16
true
octicon octicon-alert
M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z
button
flash-close js-ajax-error-dismiss
Dismiss error
true
16
0 0 16 16
1.1
16
true
octicon octicon-x
M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z
site-details-dialog
details-reset details-overlay details-overlay-dark lh-default color-fg-default hx_rsm
button
Close dialog
Box Box--overlay d-flex flex-column anim-fade-in fast hx_rsm-dialog hx_rsm-modal
Box-btn-octicon m-0 btn-octicon position-absolute right-0 top-0
button
Close dialog
true
16
0 0 16 16
1.1
16
true
octicon octicon-x
M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z
octocat-spinner tmp-my-6 js-details-dialog-spinner
Popover js-hovercard-content position-absolute
display: none; outline: none;
Popover-message Popover-message--bottom-left Popover-message--large Box color-shadow-large
width:360px;
snippet-clipboard-copy-button
zeroclipboard-container position-absolute right-0 top-0
Copy
ClipboardButton btn js-clipboard-copy m-2 p-0
Copied!
w
true
16
0 0 16 16
1.1
16
true
octicon octicon-copy js-clipboard-copy-icon m-2
M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z
M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z
true
16
0 0 16 16
1.1
16
true
octicon octicon-check js-clipboard-check-icon color-fg-success d-none m-2
M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z
snippet-clipboard-copy-button-unpositioned
zeroclipboard-container
Copy
ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center
Copied!
w
true
16
0 0 16 16
1.1
16
true
octicon octicon-copy js-clipboard-copy-icon
M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z
M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z
true
16
0 0 16 16
1.1
16
true
octicon octicon-check js-clipboard-check-icon color-fg-success d-none
M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z
js-global-screen-reader-notice
sr-only mt-n1
polite
true
js-global-screen-reader-notice-assertive
sr-only mt-n1
assertive
true