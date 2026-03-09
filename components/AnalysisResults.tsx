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
  onDownloadPDF: () => void;
  isMobile?: boolean;
  isPartialResult?: boolean;
}

const MOBILE_SECTIONS = ['chart', 'scorecard', 'indicators', 'news', 'analysis', 'trade', 'summary'] as const;

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  report,
  stockData,
  indicators,
  newsData,
  optionsData,
  optimalTrade: optimalTradeData,
  onDownloadPDF,
  isMobile = false,
  isPartialResult = false,
}) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const swipeRef = useRef<HTMLDivElement>(null);

  const handleSwipeLeft = useCallback(() => {
    setActiveSectionIndex(i => Math.min(i + 1, MOBILE_SECTIONS.length - 1));
  }, []);
  const handleSwipeRight = useCallback(() => {
    setActiveSectionIndex(i => Math.max(i - 1, 0));
  }, []);

  useSwipe(swipeRef, { onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight });

  const getSetupStageIcon = (stage: string) => {
    switch (stage) {
      case 'Setup Forming': return <Clock className="h-4 w-4" />;
      case 'Just Triggered': return <CheckCircle className="h-4 w-4" />;
      case 'Mid Setup': return <TrendingUp className="h-4 w-4" />;
      case 'Late Setup': return <AlertTriangle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = max > 0 ? (score / max) * 100 : 0;
    if (pct >= 70) return 'text-[#00E59B]';
    if (pct >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number, max: number) => {
    const pct = max > 0 ? (score / max) * 100 : 0;
    if (pct >= 70) return 'bg-[#00E59B]';
    if (pct >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const { scorecard } = report;

  // --- Shared section renderers ---
  const renderHeaderCard = () => (
    <div className="bg-[#111827] rounded-xl p-4 sm:p-6 border border-[#1f2937]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E5E7EB]">{stockData.symbol}</h1>
          <p className="text-[#9CA3AF]">{stockData.name}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-2xl font-semibold text-[#E5E7EB]">${stockData.price.toFixed(2)}</span>
            <span className={`flex items-center gap-1 ${stockData.change >= 0 ? 'text-[#00E59B]' : 'text-red-400'}`}>
              {stockData.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {stockData.change >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        {!isMobile && (
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] px-4 py-2 rounded-lg font-semibold transition-colors duration-200 min-h-[44px]"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="flex items-center gap-2 mb-2">
            {getSetupStageIcon(report.setupStage)}
            <span className="text-xs sm:text-sm text-[#9CA3AF]">Setup Stage</span>
          </div>
          <span className="font-semibold text-[#E5E7EB] text-sm sm:text-base">{report.setupStage}</span>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF] mb-2">M2M Score</div>
          <span className={`font-semibold text-sm sm:text-base ${getScoreColor(scorecard.totalScore, scorecard.maxScore)}`}>
            {scorecard.totalScore}/{scorecard.maxScore}
          </span>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF] mb-2">
            <span className="sm:hidden">Factors</span>
            <span className="hidden sm:inline">Factors Passed</span>
          </div>
          <span className={`font-semibold text-sm sm:text-base ${scorecard.meetsMultiFactorRule ? 'text-[#00E59B]' : 'text-yellow-400'}`}>
            {scorecard.factorsPassed}/{scorecard.totalFactors}
          </span>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF] mb-2">Volatility</div>
          <span className="font-semibold text-[#E5E7EB] text-sm sm:text-base">{report.volatilityRegime}</span>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span className="text-xs sm:text-sm text-[#9CA3AF]">Setup Quality</span>
          </div>
          <span className={`inline-block px-2 py-0.5 rounded text-xs sm:text-sm font-semibold ${
            report.setupQuality === 'high' ? 'bg-[#00E59B]/15 text-[#00E59B]' :
            report.setupQuality === 'moderate' ? 'bg-yellow-400/15 text-yellow-400' :
            'bg-[#374151] text-[#9CA3AF]'
          }`}>
            {report.setupQuality.toUpperCase()}
          </span>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs sm:text-sm text-[#9CA3AF]">Signal Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm sm:text-base ${
              report.signalConfidence >= 70 ? 'text-[#00E59B]' :
              report.signalConfidence >= 45 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {report.signalConfidence}
            </span>
            <div className="flex-1 bg-[#1f2937] rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  report.signalConfidence >= 70 ? 'bg-[#00E59B]' :
                  report.signalConfidence >= 45 ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}
                style={{ width: `${report.signalConfidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScorecard = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#E5E7EB]">
          <BarChart3 className="h-5 w-5 text-[#00E59B]" />
          M2M 6-Factor Scorecard
        </h3>
        <div className="flex items-center gap-2">
          {scorecard.publishable ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#00E59B]/10 text-[#00E59B]">
              <CheckCircle className="h-3 w-3" /> Publishable
            </span>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-400/10 text-red-400">
              <XCircle className="h-3 w-3" /> Below Threshold
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-4 mb-6 text-xs">
        <div className={`flex items-center gap-1 ${scorecard.meetsPublicationThreshold ? 'text-[#00E59B]' : 'text-red-400'}`}>
          {scorecard.meetsPublicationThreshold ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          Score {'>'}= 65 threshold
        </div>
        <div className={`flex items-center gap-1 ${scorecard.meetsMultiFactorRule ? 'text-[#00E59B]' : 'text-red-400'}`}>
          {scorecard.meetsMultiFactorRule ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          3-of-6 factor rule
        </div>
      </div>
      <div className="space-y-4">
        {scorecard.factors.map((factor, index) => (
          <div key={index} className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {factor.passed ? <CheckCircle className="h-4 w-4 text-[#00E59B]" /> : <XCircle className="h-4 w-4 text-red-400" />}
                <span className="text-sm font-medium text-[#E5E7EB]">{factor.name}</span>
              </div>
              <span className={`text-sm font-semibold ${getScoreColor(factor.score, factor.maxPoints)}`}>
                {factor.score}/{factor.maxPoints}
              </span>
            </div>
            <div className="w-full bg-[#1f2937] rounded-full h-1.5 mb-2">
              <div
                className={`h-1.5 rounded-full ${getScoreBarColor(factor.score, factor.maxPoints)}`}
                style={{ width: `${(factor.score / factor.maxPoints) * 100}%` }}
              />
            </div>
            <p className="text-xs text-[#6B7280]">{factor.rationale}</p>
          </div>
        ))}
      </div>
    </>
  );

  const renderChart = () => {
    if (!report.historicalData || report.historicalData.length < 20) return null;
    return (
      <>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#E5E7EB]">
          <LineChart className="h-5 w-5 text-[#00E59B]" />
          Daily Price Chart
        </h3>
        <DailyChart historicalData={report.historicalData} />
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#E5E7EB] inline-block" /> Close</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#00E59B] inline-block" /> EMA 20</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#EF4444] inline-block" /> EMA 50</span>
        </div>
      </>
    );
  };

  const renderIndicators = () => (
    <>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#E5E7EB]">
        <BarChart3 className="h-5 w-5 text-[#00E59B]" />
        Technical Indicators
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF]">RSI (14)</div>
          <div className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">{indicators.rsi.toFixed(1)}</div>
          <div className={`text-xs ${indicators.rsi > 70 ? 'text-red-400' : indicators.rsi < 30 ? 'text-[#00E59B]' : 'text-[#6B7280]'}`}>
            {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
          </div>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF]">MACD</div>
          <div className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">{indicators.macd.macd.toFixed(3)}</div>
          <div className={`text-xs ${indicators.macd.macd > indicators.macd.signal ? 'text-[#00E59B]' : 'text-red-400'}`}>
            {indicators.macd.macd > indicators.macd.signal ? 'Bullish' : 'Bearish'}
          </div>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF]">ATR (14)</div>
          <div className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">{indicators.atr.toFixed(2)}</div>
          <div className="text-xs text-[#6B7280]">{report.volatilityRegime} Volatility</div>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF]">ADX (14)</div>
          <div className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">{indicators.adx.toFixed(1)}</div>
          <div className={`text-xs ${indicators.adx > 25 ? 'text-[#00E59B]' : 'text-[#6B7280]'}`}>
            {indicators.adx > 25 ? 'Strong Trend' : 'Weak Trend'}
          </div>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF]">
            <span className="sm:hidden">Bollinger</span>
            <span className="hidden sm:inline">Bollinger Position</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">
            {stockData.price > indicators.bollingerBands.upper ? 'Upper' :
             stockData.price < indicators.bollingerBands.lower ? 'Lower' : 'Middle'}
          </div>
          <div className="text-xs text-[#6B7280]">
            ${indicators.bollingerBands.lower.toFixed(2)} - ${indicators.bollingerBands.upper.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
          <div className="text-xs sm:text-sm text-[#9CA3AF]">CMF (20)</div>
          <div className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">{indicators.cmf.toFixed(3)}</div>
          <div className={`text-xs ${indicators.cmf > 0.1 ? 'text-[#00E59B]' : indicators.cmf < -0.1 ? 'text-red-400' : 'text-[#6B7280]'}`}>
            {indicators.cmf > 0.1 ? 'Accumulation' : indicators.cmf < -0.1 ? 'Distribution' : 'Balanced'}
          </div>
        </div>
        {optionsData && (
          <>
            <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
              <div className="text-xs sm:text-sm text-[#9CA3AF]">Put/Call Ratio</div>
              <div className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">{optionsData.putCallRatio.toFixed(2)}</div>
              <div className={`text-xs ${optionsData.putCallRatio < 0.7 ? 'text-[#00E59B]' : optionsData.putCallRatio > 1.0 ? 'text-red-400' : 'text-[#6B7280]'}`}>
                {optionsData.putCallRatio < 0.7 ? 'Bullish' : optionsData.putCallRatio > 1.0 ? 'Bearish' : 'Neutral'}
              </div>
            </div>
            <div className="bg-[#0a0e17] rounded-lg p-3 sm:p-4 border border-[#1f2937]">
              <div className="text-xs sm:text-sm text-[#9CA3AF]">Avg IV</div>
              <div className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">{(optionsData.avgImpliedVolatility * 100).toFixed(1)}%</div>
              <div className="text-xs text-[#6B7280]">
                {optionsData.contractCount} contracts
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );

  const renderNews = () => {
    if (newsData.length === 0) return null;
    return (
      <>
        <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">Recent News & Sentiment</h3>
        <div className="space-y-3">
          {newsData.slice(0, 4).map((news, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-[#0a0e17] rounded-lg border border-[#1f2937]">
              <div className="flex-1">
                <h4 className="font-medium text-[#E5E7EB] text-sm sm:text-base">{news.headline}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    news.sentiment === 'Positive' ? 'bg-[#00E59B]/10 text-[#00E59B]' :
                    news.sentiment === 'Negative' ? 'bg-red-400/10 text-red-400' :
                    'bg-[#1f2937] text-[#9CA3AF]'
                  }`}>{news.sentiment}</span>
                  <span className="text-xs text-[#6B7280]">{news.source}</span>
                  {news.date && (
                    <span className="text-xs text-[#6B7280]">
                      · {new Date(news.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderAnalysis = () => (
    <>
      <h3 className="text-lg font-semibold mb-6 text-[#E5E7EB]">Detailed Analysis</h3>
      <div className="space-y-6">
        {report.sections.map((section, index) => (
          <div key={index} className="border-l-4 border-[#00E59B]/30 pl-4">
            <h4 className="font-semibold text-[#E5E7EB] mb-2">{section.title}</h4>
            <p className="text-[#9CA3AF] leading-relaxed whitespace-pre-line text-sm sm:text-base">{section.content}</p>
          </div>
        ))}
      </div>
    </>
  );

  const getQualitySummary = () => {
    // Derive dominant direction (same logic as analysisEngine.generateRecommendation)
    const bullishCount = [
      indicators.rsi > 50,
      indicators.macd.macd > indicators.macd.signal,
      indicators.ema20 > indicators.ema50,
      stockData.price > indicators.ema20,
    ].filter(Boolean).length;
    const direction = bullishCount >= 3 ? 'Bullish' : bullishCount <= 1 ? 'Bearish' : 'Neutral';

    switch (report.setupQuality) {
      case 'high':
        return {
          icon: <CheckCircle className="h-5 w-5 text-[#00E59B]" />,
          text: `HIGH-QUALITY ${direction.toUpperCase()} SETUP`,
          color: 'text-[#00E59B]',
        };
      case 'moderate':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
          text: `MODERATE ${direction.toUpperCase()} SETUP — DEVELOPING`,
          color: 'text-yellow-400',
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-[#9CA3AF]" />,
          text: `NO CLEAR ${direction.toUpperCase()} SETUP — MONITORING`,
          color: 'text-[#9CA3AF]',
        };
    }
  };

  const renderSummary = () => {
    const qualitySummary = getQualitySummary();
    return (
      <>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#E5E7EB]">
          {qualitySummary.icon}
          Observation Summary
        </h3>
        <p className={`font-medium mb-2 ${qualitySummary.color}`}>
          {qualitySummary.text}
        </p>
        <p className="text-[#9CA3AF] text-sm sm:text-base">{report.recommendation}</p>
      </>
    );
  };

  // --- Partial result banner ---
  const partialBanner = isPartialResult && (
    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
      <p className="text-sm text-yellow-400">AI analysis unavailable. Technical data shown.</p>
    </div>
  );

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    const currentSection = MOBILE_SECTIONS[activeSectionIndex];
    return (
      <div className="space-y-4" ref={swipeRef}>
        {partialBanner}
        {renderHeaderCard()}

        {/* Mobile download button */}
        <button
          onClick={onDownloadPDF}
          className="w-full flex items-center justify-center gap-2 bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] min-h-[44px] py-3 rounded-lg font-semibold transition-colors"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>

        {/* Dot indicators */}
        <div className="flex justify-center gap-0">
          {MOBILE_SECTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSectionIndex(i)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`Go to section ${i + 1}`}
            >
              <span
                className={`block w-2 h-2 rounded-full transition-colors ${
                  i === activeSectionIndex ? 'bg-[#00E59B]' : 'bg-[#374151]'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Accordion sections */}
        {currentSection === 'chart' && (
          <AccordionSection title="Daily Chart" icon={<LineChart className="h-4 w-4 text-[#00E59B]" />} defaultOpen>
            {renderChart() || <p className="text-sm text-[#6B7280]">Insufficient data for chart.</p>}
          </AccordionSection>
        )}
        {currentSection === 'scorecard' && (
          <AccordionSection title="M2M Scorecard" icon={<BarChart3 className="h-4 w-4 text-[#00E59B]" />} defaultOpen>
            {renderScorecard()}
          </AccordionSection>
        )}
        {currentSection === 'indicators' && (
          <AccordionSection title="Technical Indicators" icon={<TrendingUp className="h-4 w-4 text-[#00E59B]" />} defaultOpen>
            {renderIndicators()}
          </AccordionSection>
        )}
        {currentSection === 'news' && (
          <AccordionSection title="News & Sentiment" icon={<Newspaper className="h-4 w-4 text-[#00E59B]" />} defaultOpen>
            {renderNews() || <p className="text-sm text-[#6B7280]">No recent news available.</p>}
          </AccordionSection>
        )}
        {currentSection === 'analysis' && (
          <AccordionSection title="Detailed Analysis" icon={<FileText className="h-4 w-4 text-[#00E59B]" />} defaultOpen>
            {renderAnalysis()}
          </AccordionSection>
        )}
        {currentSection === 'trade' && optimalTradeData && (
          <OptimalTrade trade={optimalTradeData} symbol={stockData.symbol} />
        )}
        {currentSection === 'trade' && !optimalTradeData && (
          <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
            <p className="text-sm text-[#6B7280]">Optimal trade analysis unavailable for this request.</p>
          </div>
        )}
        {currentSection === 'summary' && (
          <AccordionSection title="Observation Summary" icon={<CheckCircle className="h-4 w-4 text-[#00E59B]" />} defaultOpen>
            {renderSummary()}
          </AccordionSection>
        )}
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div className="space-y-6">
      {partialBanner}
      {renderHeaderCard()}

      {report.historicalData && report.historicalData.length >= 20 && (
        <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
          {renderChart()}
        </div>
      )}

      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
        {renderScorecard()}
      </div>

      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
        {renderIndicators()}
      </div>

      {newsData.length > 0 && (
        <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
          {renderNews()}
        </div>
      )}

      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
        {renderAnalysis()}
      </div>

      {optimalTradeData && (
        <OptimalTrade trade={optimalTradeData} symbol={stockData.symbol} />
      )}

      <div className="bg-[#111827] rounded-xl p-6 border border-[#00E59B]/20">
        {renderSummary()}
      </div>
    </div>
  );
};
