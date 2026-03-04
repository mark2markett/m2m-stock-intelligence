'use client';

import React from 'react';
import { Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, BarChart3, XCircle } from 'lucide-react';
import type { AnalysisReport, StockData, TechnicalIndicators, NewsItem } from '@/lib/types';

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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
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

          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="flex items-center gap-2 mb-2">
              {getSetupStageIcon(report.setupStage)}
              <span className="text-sm text-[#9CA3AF]">Setup Stage</span>
            </div>
            <span className="font-semibold text-[#E5E7EB]">{report.setupStage}</span>
          </div>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF] mb-2">M2M Score</div>
            <span className={`font-semibold ${getScoreColor(scorecard.totalScore, scorecard.maxScore)}`}>
              {scorecard.totalScore}/{scorecard.maxScore}
            </span>
          </div>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF] mb-2">Factors Passed</div>
            <span className={`font-semibold ${scorecard.meetsMultiFactorRule ? 'text-[#00E59B]' : 'text-yellow-400'}`}>
              {scorecard.factorsPassed}/{scorecard.totalFactors}
            </span>
          </div>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF] mb-2">Volatility</div>
            <span className="font-semibold text-[#E5E7EB]">{report.volatilityRegime}</span>
          </div>
        </div>
      </div>

      {/* M2M Scorecard Breakdown */}
      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-[#E5E7EB]">
            <BarChart3 className="h-5 w-5 text-[#00E59B]" />
            M2M 6-Factor Scorecard
          </h3>
          <div className="flex items-center gap-2">
            {scorecard.publishable ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#00E59B]/10 text-[#00E59B]">
                <CheckCircle className="h-3 w-3" />
                Publishable
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-400/10 text-red-400">
                <XCircle className="h-3 w-3" />
                Below Threshold
              </span>
            )}
          </div>
        </div>

        {/* Threshold indicators */}
        <div className="flex gap-4 mb-6 text-xs">
          <div className={`flex items-center gap-1 ${scorecard.meetsPublicationThreshold ? 'text-[#00E59B]' : 'text-red-400'}`}>
            {scorecard.meetsPublicationThreshold ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            Score {'>'}= 65 threshold
          </div>
          <div className={`flex items-center gap-1 ${scorecard.meetsMultiFactorRule ? 'text-[#00E59B]' : 'text-red-400'}`}>
            {scorecard.meetsMultiFactorRule ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            4-of-6 factor rule
          </div>
        </div>

        {/* Factor breakdown */}
        <div className="space-y-4">
          {scorecard.factors.map((factor, index) => (
            <div key={index} className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {factor.passed ? (
                    <CheckCircle className="h-4 w-4 text-[#00E59B]" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm font-medium text-[#E5E7EB]">{factor.name}</span>
                </div>
                <span className={`text-sm font-semibold ${getScoreColor(factor.score, factor.maxPoints)}`}>
                  {factor.score}/{factor.maxPoints}
                </span>
              </div>
              {/* Score bar */}
              <div className="w-full bg-[#1f2937] rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full ${getScoreBarColor(factor.score, factor.maxPoints)}`}
                  style={{ width: `${(factor.score / factor.maxPoints) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-[#6B7280]">{factor.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#E5E7EB]">
          <BarChart3 className="h-5 w-5 text-[#00E59B]" />
          Technical Indicators
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF]">RSI (14)</div>
            <div className="text-xl font-semibold text-[#E5E7EB]">{indicators.rsi.toFixed(1)}</div>
            <div className={`text-xs ${indicators.rsi > 70 ? 'text-red-400' : indicators.rsi < 30 ? 'text-[#00E59B]' : 'text-[#6B7280]'}`}>
              {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
            </div>
          </div>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF]">MACD</div>
            <div className="text-xl font-semibold text-[#E5E7EB]">{indicators.macd.macd.toFixed(3)}</div>
            <div className={`text-xs ${indicators.macd.macd > indicators.macd.signal ? 'text-[#00E59B]' : 'text-red-400'}`}>
              {indicators.macd.macd > indicators.macd.signal ? 'Bullish' : 'Bearish'}
            </div>
          </div>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF]">ATR (14)</div>
            <div className="text-xl font-semibold text-[#E5E7EB]">{indicators.atr.toFixed(2)}</div>
            <div className="text-xs text-[#6B7280]">{report.volatilityRegime} Volatility</div>
          </div>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF]">ADX (14)</div>
            <div className="text-xl font-semibold text-[#E5E7EB]">{indicators.adx.toFixed(1)}</div>
            <div className={`text-xs ${indicators.adx > 25 ? 'text-[#00E59B]' : 'text-[#6B7280]'}`}>
              {indicators.adx > 25 ? 'Strong Trend' : 'Weak Trend'}
            </div>
          </div>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF]">Bollinger Position</div>
            <div className="text-xl font-semibold text-[#E5E7EB]">
              {stockData.price > indicators.bollingerBands.upper ? 'Upper' :
               stockData.price < indicators.bollingerBands.lower ? 'Lower' : 'Middle'}
            </div>
            <div className="text-xs text-[#6B7280]">
              ${indicators.bollingerBands.lower.toFixed(2)} - ${indicators.bollingerBands.upper.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1f2937]">
            <div className="text-sm text-[#9CA3AF]">CMF (20)</div>
            <div className="text-xl font-semibold text-[#E5E7EB]">{indicators.cmf.toFixed(3)}</div>
            <div className={`text-xs ${indicators.cmf > 0.1 ? 'text-[#00E59B]' : indicators.cmf < -0.1 ? 'text-red-400' : 'text-[#6B7280]'}`}>
              {indicators.cmf > 0.1 ? 'Accumulation' : indicators.cmf < -0.1 ? 'Distribution' : 'Balanced'}
            </div>
          </div>
        </div>
      </div>

      {/* News Sentiment */}
      {newsData.length > 0 && (
        <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
          <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">Recent News & Sentiment</h3>
          <div className="space-y-3">
            {newsData.slice(0, 4).map((news, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-[#0a0e17] rounded-lg border border-[#1f2937]">
                <div className="flex-1">
                  <h4 className="font-medium text-[#E5E7EB]">{news.headline}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      news.sentiment === 'Positive' ? 'bg-[#00E59B]/10 text-[#00E59B]' :
                      news.sentiment === 'Negative' ? 'bg-red-400/10 text-red-400' :
                      'bg-[#1f2937] text-[#9CA3AF]'
                    }`}>
                      {news.sentiment}
                    </span>
                    <span className="text-xs text-[#6B7280]">{news.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Sections */}
      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
        <h3 className="text-lg font-semibold mb-6 text-[#E5E7EB]">Detailed Analysis</h3>
        <div className="space-y-6">
          {report.sections.map((section, index) => (
            <div key={index} className="border-l-4 border-[#00E59B]/30 pl-4">
              <h4 className="font-semibold text-[#E5E7EB] mb-2">{section.title}</h4>
              <p className="text-[#9CA3AF] leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Observation Summary */}
      <div className="bg-[#111827] rounded-xl p-6 border border-[#00E59B]/20">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#E5E7EB]">
          {report.actionable ? <CheckCircle className="h-5 w-5 text-[#00E59B]" /> : <AlertTriangle className="h-5 w-5 text-yellow-400" />}
          Observation Summary
        </h3>
        <p className="text-[#E5E7EB] font-medium mb-2">
          {report.actionable ? 'EDUCATIONAL SETUP - PATTERN IDENTIFIED' : 'NO CLEAR PATTERN - MONITORING'}
        </p>
        <p className="text-[#9CA3AF]">{report.recommendation}</p>
      </div>
    </div>
  );
};
