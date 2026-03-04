import 'server-only';
import { TechnicalIndicators } from '@/lib/utils/technicalIndicators';
import { SupportResistanceAnalyzer } from '@/lib/utils/supportResistance';
import { TradeSetupAnalyzer } from '@/lib/utils/tradeSetupAnalysis';
import { PolygonService } from './polygonService';
import { NewsService } from './newsService';
import { OpenAIService } from './openaiService';
import type { AnalysisReport, AnalysisResult, ReportSection } from '@/lib/types';

export class AnalysisEngine {
  /**
   * Returns all data needed for display in a single call,
   * eliminating duplicate API fetches.
   */
  static async generateAnalysis(symbol: string): Promise<AnalysisResult> {
    const historicalLimit = 60;
    const newsLimit = 3;

    const [stockData, historicalData, newsData] = await Promise.all([
      PolygonService.getStockDetails(symbol),
      PolygonService.getHistoricalData(symbol, 'day', historicalLimit),
      NewsService.getStockNews(symbol, newsLimit)
    ]);

    const closes = historicalData.map((d: any) => d.close);
    const highs = historicalData.map((d: any) => d.high);
    const lows = historicalData.map((d: any) => d.low);
    const volumes = historicalData.map((d: any) => d.volume);

    const indicatorResults = TechnicalIndicators.computeIndicators(highs, lows, closes, volumes, 'daily');
    const indicators = indicatorResults.indicators;

    const pivots = SupportResistanceAnalyzer.findPivotPoints(highs, lows, closes);
    const { support, resistance } = SupportResistanceAnalyzer.getKeyLevels(pivots, stockData.price);

    const setupStage = TradeSetupAnalyzer.analyzeSetupStage(indicators, stockData.price, support, resistance, closes);

    const rsiInterpretation = TechnicalIndicators.interpretRsiForPdf(
      indicators.rsi,
      stockData.price,
      indicators.ema20,
      indicators.ema50,
      indicators.macd.macd,
      indicators.adx
    );

    const scorecard = TradeSetupAnalyzer.calculateM2MScorecard(
      indicators,
      setupStage,
      indicatorResults.regime as 'High' | 'Normal' | 'Low',
      newsData,
      stockData.price,
      support,
      resistance
    );

    let sections: ReportSection[];
    let partial = false;
    let aiError: string | undefined;

    try {
      const aiGeneratedReport = await OpenAIService.generateAnalysisReport(
        symbol,
        stockData,
        indicators,
        support,
        resistance,
        this.formatSentimentData(newsData),
        indicatorResults.regime as 'High' | 'Normal' | 'Low',
        setupStage,
        this.generateLifecycleRationale(setupStage),
        rsiInterpretation
      );
      sections = this.parseAIReportToSections(aiGeneratedReport);
    } catch (err) {
      partial = true;
      aiError = err instanceof Error ? err.message : 'AI analysis unavailable';
      sections = this.generateFallbackSections(indicators, scorecard, setupStage, stockData.price, support, resistance);
    }

    const report: AnalysisReport = {
      symbol: stockData.symbol,
      setupStage,
      scorecard,
      volatilityRegime: indicatorResults.regime as 'High' | 'Normal' | 'Low',
      confidenceScore: scorecard.totalScore,
      actionable: scorecard.publishable,
      recommendation: this.generateRecommendation(scorecard, setupStage, indicators, stockData.price, support, resistance),
      sections,
      historicalData
    };

    return {
      report,
      stockData,
      indicators,
      news: newsData,
      partial,
      aiError,
    };
  }

  private static formatSentimentData(newsData: any[]): string {
    if (newsData.length === 0) return 'No significant news items found';

    return newsData.map(news =>
      `${news.headline} - Sentiment: ${news.sentiment} (${news.source})`
    ).join('\n');
  }

  private static generateLifecycleRationale(setupStage: string): string {
    switch (setupStage) {
      case 'Just Triggered':
        return 'Recent breakout confirmed with volume and indicator alignment';
      case 'Mid Setup':
        return 'Setup progressing with some positive signals but awaiting full confirmation';
      case 'Setup Forming':
        return 'Indicators beginning to align but no clear trigger signal yet';
      case 'Late Setup':
        return 'Move appears extended with potential exhaustion signals present';
      default:
        return 'Mixed signals requiring further development';
    }
  }

  private static parseAIReportToSections(aiReport: string): ReportSection[] {
    const sections: ReportSection[] = [];
    const lines = aiReport.split('\n').filter(line => line.trim());
    let currentSection: ReportSection | null = null;

    for (const line of lines) {
      const headerMatch = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*\s*$/) ||
                         line.match(/^\*\*(.+?)\*\*\s*$/) ||
                         line.match(/^(\d+)\.\s*(.+)$/) ||
                         line.match(/^##\s*(.+)$/) ||
                         line.match(/^#\s*(.+)$/);

      if (headerMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }

        const title = headerMatch[2] || headerMatch[1];
        currentSection = {
          title: title.replace(/\*\*/g, '').trim(),
          content: ''
        };
      } else if (currentSection && line.trim()) {
        if (currentSection.content && !currentSection.content.endsWith(' ')) {
          currentSection.content += ' ';
        }
        currentSection.content += line.trim();
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    if (sections.length === 0) {
      const fallbackSections = aiReport.split(/\*\*\d+\.\s*(.+?)\*\*/g);

      for (let i = 1; i < fallbackSections.length; i += 2) {
        if (fallbackSections[i] && fallbackSections[i + 1]) {
          sections.push({
            title: fallbackSections[i].trim(),
            content: fallbackSections[i + 1].trim()
          });
        }
      }

      if (sections.length === 0) {
        sections.push({
          title: 'Complete Analysis Report',
          content: aiReport.replace(/\*\*/g, '').trim()
        });
      }
    }

    return sections;
  }

  private static generateRecommendation(
    scorecard: any,
    setupStage: string,
    indicators: any,
    currentPrice: number,
    support: number[],
    resistance: number[]
  ): string {
    const rsiTrend = indicators.rsi > 50 ? 'bullish' : 'bearish';
    const macdTrend = indicators.macd.macd > 0 ? 'bullish' : 'bearish';
    const emaTrend = indicators.ema20 > indicators.ema50 ? 'bullish' : 'bearish';
    const priceTrend = currentPrice > indicators.ema20 ? 'bullish' : 'bearish';

    const bullishCount = [rsiTrend, macdTrend, emaTrend, priceTrend].filter(t => t === 'bullish').length;
    const overallTrend = bullishCount >= 3 ? 'bullish' : bullishCount <= 1 ? 'bearish' : 'neutral';

    const atrMultiplier = this.getATRMultiplier(setupStage, indicators.adx);

    let recommendedStop: number;
    let targetPrice: number;

    const minRiskPercent = 0.01;
    const maxRiskPercent = 0.10;

    if (overallTrend === 'bullish') {
      const atrStop = currentPrice - (indicators.atr * atrMultiplier);

      const validSupport = support.filter(s => s < currentPrice * 0.99);
      const nearestSupport = validSupport.length > 0 ? validSupport[0] : null;

      let calculatedStop = atrStop;
      if (nearestSupport) {
        const supportStop = nearestSupport * 0.98;
        calculatedStop = Math.max(atrStop, supportStop);
      }

      const minStop = currentPrice * (1 - maxRiskPercent);
      const maxStop = currentPrice * (1 - minRiskPercent);
      recommendedStop = Math.max(minStop, Math.min(maxStop, calculatedStop));

      const validResistance = resistance.filter(r => r > currentPrice * 1.01);
      if (validResistance.length > 0) {
        targetPrice = validResistance[0];
      } else {
        const risk = currentPrice - recommendedStop;
        targetPrice = currentPrice + (risk * 2);
      }

    } else if (overallTrend === 'bearish') {
      const atrStop = currentPrice + (indicators.atr * atrMultiplier);

      const validResistance = resistance.filter(r => r > currentPrice * 1.01);
      const nearestResistance = validResistance.length > 0 ? validResistance[0] : null;

      let calculatedStop = atrStop;
      if (nearestResistance) {
        const resistanceStop = nearestResistance * 1.02;
        calculatedStop = Math.min(atrStop, resistanceStop);
      }

      const maxStop = currentPrice * (1 + maxRiskPercent);
      const minStop = currentPrice * (1 + minRiskPercent);
      recommendedStop = Math.min(maxStop, Math.max(minStop, calculatedStop));

      const validSupport = support.filter(s => s < currentPrice * 0.99);
      if (validSupport.length > 0) {
        targetPrice = validSupport[0];
      } else {
        const risk = recommendedStop - currentPrice;
        targetPrice = currentPrice - (risk * 2);
      }

    } else {
      const validSupport = support.filter(s => s < currentPrice * 0.99);
      const validResistance = resistance.filter(r => r > currentPrice * 1.01);

      recommendedStop = validSupport.length > 0 ? validSupport[0] * 0.98 : currentPrice * 0.95;
      targetPrice = validResistance.length > 0 ? validResistance[0] : currentPrice * 1.03;

      const minStop = currentPrice * (1 - maxRiskPercent);
      const maxStop = currentPrice * (1 - minRiskPercent);
      recommendedStop = Math.max(minStop, Math.min(maxStop, recommendedStop));
    }

    const riskPercent = Math.abs((currentPrice - recommendedStop) / currentPrice * 100);
    const rewardPercent = Math.abs((targetPrice - currentPrice) / currentPrice * 100);
    const rewardRiskRatio = rewardPercent / riskPercent;

    const scoreSummary = `M2M Score: ${scorecard.totalScore}/${scorecard.maxScore} (${scorecard.factorsPassed}/${scorecard.totalFactors} factors passed).`;

    if (scorecard.publishable) {
      if (overallTrend === 'bullish') {
        return `${scoreSummary} Multiple bullish indicators aligned. Historical patterns suggest bullish momentum with key support near $${recommendedStop.toFixed(2)} (${riskPercent.toFixed(1)}% below current price) and observed resistance near $${targetPrice.toFixed(2)} (${rewardPercent.toFixed(1)}% above, ${rewardRiskRatio.toFixed(1)}:1 R/R ratio).`;
      } else if (overallTrend === 'bearish') {
        return `${scoreSummary} Technical indicators show bearish alignment. Historical patterns suggest downward momentum with overhead resistance near $${recommendedStop.toFixed(2)} (${riskPercent.toFixed(1)}% above current price) and observed support near $${targetPrice.toFixed(2)} (${rewardPercent.toFixed(1)}% below, ${rewardRiskRatio.toFixed(1)}:1 R/R ratio).`;
      } else {
        const validSupport = support.filter(s => s < currentPrice * 0.99);
        const validResistance = resistance.filter(r => r > currentPrice * 1.01);
        return `${scoreSummary} Mixed signals observed across indicators. No clear directional bias at this time. Key levels to watch: Support $${validSupport[0]?.toFixed(2) || (currentPrice * 0.95).toFixed(2)}, Resistance $${validResistance[0]?.toFixed(2) || (currentPrice * 1.05).toFixed(2)}.`;
      }
    } else if (scorecard.totalScore >= 50) {
      return `${scoreSummary} Moderate ${overallTrend} pattern developing. Indicators show partial alignment but lack full confirmation. Further observation warranted before drawing conclusions.`;
    } else {
      return `${scoreSummary} Current indicator readings do not show a high-confidence pattern. Conditions remain mixed and may require further development before a clear signal emerges.`;
    }
  }

  private static getATRMultiplier(setupStage: string, adx: number): number {
    let baseMultiplier = 2.0;

    switch (setupStage) {
      case 'Just Triggered':
        baseMultiplier = 1.5;
        break;
      case 'Mid Setup':
        baseMultiplier = 2.0;
        break;
      case 'Setup Forming':
        baseMultiplier = 2.5;
        break;
      case 'Late Setup':
        baseMultiplier = 1.2;
        break;
    }

    if (adx > 40) {
      baseMultiplier *= 1.2;
    } else if (adx < 20) {
      baseMultiplier *= 0.8;
    }

    return baseMultiplier;
  }

  private static generateFallbackSections(
    indicators: any,
    scorecard: any,
    setupStage: string,
    price: number,
    support: number[],
    resistance: number[]
  ): ReportSection[] {
    const rsiStatus = indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'neutral';
    const macdStatus = indicators.macd.macd > indicators.macd.signal ? 'bullish crossover' : 'bearish crossover';
    const trendStatus = indicators.ema20 > indicators.ema50 ? 'bullish (EMA20 > EMA50)' : 'bearish (EMA20 < EMA50)';

    return [
      {
        title: 'Technical Summary',
        content: `RSI(14): ${indicators.rsi.toFixed(1)} (${rsiStatus}). MACD: ${indicators.macd.macd.toFixed(3)} showing ${macdStatus}. Trend alignment: ${trendStatus}. ADX: ${indicators.adx.toFixed(1)} indicating ${indicators.adx > 25 ? 'strong' : 'weak'} trend strength. CMF: ${indicators.cmf.toFixed(3)} showing ${indicators.cmf > 0.1 ? 'accumulation' : indicators.cmf < -0.1 ? 'distribution' : 'balanced flow'}.`
      },
      {
        title: 'Key Levels',
        content: `Current price: $${price.toFixed(2)}. Setup stage: ${setupStage}. Support levels: ${support.slice(0, 3).map(s => '$' + s.toFixed(2)).join(', ') || 'N/A'}. Resistance levels: ${resistance.slice(0, 3).map(r => '$' + r.toFixed(2)).join(', ') || 'N/A'}.`
      },
      {
        title: 'Scorecard Overview',
        content: `M2M Score: ${scorecard.totalScore}/${scorecard.maxScore}. Factors passed: ${scorecard.factorsPassed}/${scorecard.totalFactors}. Publication threshold ${scorecard.meetsPublicationThreshold ? 'met' : 'not met'}. Multi-factor rule ${scorecard.meetsMultiFactorRule ? 'met' : 'not met'}.`
      },
      {
        title: 'Note',
        content: 'AI-generated detailed analysis was unavailable for this request. The technical data and scorecard above are computed from real market data. Re-run the analysis to attempt a full AI-powered report.'
      }
    ];
  }
}
