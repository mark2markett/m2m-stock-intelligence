import { TechnicalIndicators, SupportResistanceAnalyzer } from '@/lib/utils/technicalIndicators';
import { TradeSetupAnalyzer } from '@/lib/utils/tradeSetupAnalysis';
import { PolygonService } from './polygonService';
import { NewsService } from './newsService';
import { OpenAIService } from './openaiService';
import { assessQuality } from '@/lib/utils/qualityAssessment';
import type { AnalysisReport, AnalysisResult, ReportSection, OptimalTrade } from '@/lib/types';

export class AnalysisEngine {
  /**
   * Returns all data needed for display in a single call,
   * eliminating duplicate API fetches.
   */
  static async generateAnalysis(symbol: string): Promise<AnalysisResult> {
    const historicalLimit = 120;
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

    // Fetch options data (non-blocking — null on failure)
    const optionsData = await PolygonService.getOptionsSnapshot(symbol, stockData.price);

    // Fetch multi-timeframe data (non-blocking — null on failure for each)
    // Weekly: EMA5/EMA13 | 4h: EMA8/EMA20
    // Graceful failure: if Polygon plan doesn't support these, scoring skips MTF
    const [weeklyEma, fourHourEma] = await Promise.all([
      this.fetchMultiTimeframeEma(symbol, 'week', 5, 13, 52),
      this.fetchMultiTimeframeEma(symbol, '4hour', 8, 20, 60),
    ]);

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
      resistance,
      optionsData,
      weeklyEma,
      fourHourEma,
    );

    let sections: ReportSection[];
    let partial = false;
    let aiError: string | undefined;
    let optimalTrade: OptimalTrade | undefined;

    const quality = assessQuality(scorecard, indicators, setupStage, optionsData !== null);
    const dominantTrend = this.computeDominantTrend(indicators, stockData.price);

    // Run main AI analysis and optimal trade call in parallel
    const aiReportPromise = OpenAIService.generateAnalysisReport(
      symbol,
      stockData,
      indicators,
      support,
      resistance,
      this.formatSentimentData(newsData),
      indicatorResults.regime as 'High' | 'Normal' | 'Low',
      setupStage,
      this.generateLifecycleRationale(setupStage),
      rsiInterpretation,
      optionsData,
      scorecard,
      quality.setupQuality,
      quality.signalConfidence,
      dominantTrend
    );

    const optimalTradePromise = OpenAIService.generateOptimalTrade({
      symbol,
      price: stockData.price,
      changePercent: stockData.changePercent,
      indicators,
      support,
      resistance,
      optionsData,
      scorecard,
      setupQuality: quality.setupQuality,
      signalConfidence: quality.signalConfidence,
      dominantTrend,
      setupStage,
      volatilityRegime: indicatorResults.regime as string,
      atr: indicators.atr,
    }).catch(() => undefined);

    try {
      const [aiGeneratedReport, tradeResult] = await Promise.all([
        aiReportPromise,
        optimalTradePromise,
      ]);
      sections = this.parseAIReportToSections(aiGeneratedReport);
      optimalTrade = tradeResult;
    } catch (err) {
      partial = true;
      aiError = err instanceof Error ? err.message : 'AI analysis unavailable';
      sections = this.generateFallbackSections(indicators, scorecard, setupStage, stockData.price, support, resistance);
      // Still try to get optimal trade even if main analysis failed
      optimalTrade = await optimalTradePromise.catch(() => undefined);
    }

    const report: AnalysisReport = {
      symbol: stockData.symbol,
      setupStage,
      scorecard,
      volatilityRegime: indicatorResults.regime as 'High' | 'Normal' | 'Low',
      confidenceScore: scorecard.totalScore,
      actionable: scorecard.publishable,
      setupQuality: quality.setupQuality,
      signalConfidence: quality.signalConfidence,
      earlyStage: quality.earlyStage,
      catalystPresent: quality.catalystPresent,
      recommendation: this.generateRecommendation(scorecard, setupStage, indicators, stockData.price, support, resistance),
      sections,
      historicalData
    };

    return {
      report,
      stockData,
      indicators,
      news: newsData,
      optionsData: optionsData || undefined,
      optimalTrade,
      partial,
      aiError,
    };
  }

  /**
   * Fetch EMA values for a non-daily timeframe.
   * Returns { fast, slow } EMA values, or null if the fetch fails
   * (e.g. Polygon plan doesn't include intraday/weekly data).
   *
   * @param symbol    - Ticker symbol
   * @param timeframe - Polygon multiplier/timespan combo ('week' | '4hour')
   * @param fastPeriod - Fast EMA period
   * @param slowPeriod - Slow EMA period
   * @param barsNeeded - How many bars to fetch (needs >= slowPeriod)
   */
  private static async fetchMultiTimeframeEma(
    symbol: string,
    timeframe: 'week' | '4hour',
    fastPeriod: number,
    slowPeriod: number,
    barsNeeded: number,
  ): Promise<{ fast: number; slow: number } | null> {
    try {
      const multiplier = timeframe === '4hour' ? 4 : 1;
      const timespan = timeframe === '4hour' ? 'hour' : 'week';

      const data = await PolygonService.getHistoricalData(symbol, timespan, barsNeeded, multiplier);
      if (!data || data.length < slowPeriod) return null;

      const closes = data.map((d: any) => d.close);
      const highs = data.map((d: any) => d.high);
      const lows = data.map((d: any) => d.low);
      const volumes = data.map((d: any) => d.volume);

      const result = TechnicalIndicators.computeIndicators(highs, lows, closes, volumes,
        timeframe === 'week' ? 'weekly' : '4h'
      );

      return {
        fast: result.indicators.ema20,   // ema20 field holds the fast EMA for the given timeframe
        slow: result.indicators.ema50,   // ema50 field holds the slow EMA for the given timeframe
      };
    } catch {
      // Non-fatal: if MTF data is unavailable, scoring continues without it
      return null;
    }
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

  private static generateFallbackSections(
    indicators: any,
    scorecard: any,
    setupStage: string,
    currentPrice: number,
    support: number[],
    resistance: number[]
  ): ReportSection[] {
    return [
      {
        title: 'Technical Summary',
        content: `Setup stage: ${setupStage}. RSI: ${indicators.rsi.toFixed(1)}, MACD: ${indicators.macd.macd.toFixed(3)}, EMA20: ${indicators.ema20.toFixed(2)}, EMA50: ${indicators.ema50.toFixed(2)}.`
      },
      {
        title: 'Score Summary',
        content: `M2M Score: ${scorecard.totalScore}/${scorecard.maxScore}. ${scorecard.factorsPassed}/${scorecard.totalFactors} factors passed. ${scorecard.publishable ? 'Setup meets publication threshold.' : 'Setup does not meet publication threshold.'}`
      }
    ];
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

  private static computeDominantTrend(
    indicators: any,
    price: number
  ): 'bullish' | 'bearish' | 'neutral' {
    const bullishCount = [
      indicators.rsi > 50,
      indicators.macd.macd > indicators.macd.signal,
      indicators.ema20 > indicators.ema50,
      price > indicators.ema20
    ].filter(Boolean).length;

    if (bullishCount >= 3) return 'bullish';
    if (bullishCount <= 1) return 'bearish';
    return 'neutral';
  }
}
