import { TechnicalIndicators } from '../utils/technicalIndicators';
import { SupportResistanceAnalyzer } from '../utils/supportResistance';
import { TradeSetupAnalyzer } from '../utils/tradeSetupAnalysis';
import { PolygonService } from './polygonAPI';
import { NewsService } from './newsService';
import { OpenAIService } from './openaiService';
import { AnalysisReport, ReportSection } from '../types';

export class AnalysisEngine {
  static async generateAnalysis(symbol: string): Promise<AnalysisReport> {
    console.log(`Starting analysis for ${symbol}`);
    
    // Historical data requirements for statistical reliability
    const historicalLimit = 60; // Increased for accurate technical indicators
    const newsLimit = 3; // Reduced for faster loading
    
    console.log(`Starting comprehensive analysis for ${symbol}`);
    
    try {
      // Sequential data fetching with timeout protection
      console.log('Fetching all data in parallel...');
      
      const [stockData, historicalData, newsData] = await Promise.all([
        PolygonService.getStockDetails(symbol),
        PolygonService.getHistoricalData(symbol, 'day', historicalLimit),
        NewsService.getStockNews(symbol, newsLimit)
      ]);
      
      console.log('✓ All data fetched:', {
        stock: stockData.name,
        price: stockData.price,
        historicalBars: historicalData.length,
        newsArticles: newsData.length
      });
      
      // Step 4: Calculate technical indicators
      console.log('Step 4: Calculating technical indicators...');
      const closes = historicalData.map(d => d.close);
      const highs = historicalData.map(d => d.high);
      const lows = historicalData.map(d => d.low);
      const volumes = historicalData.map(d => d.volume);
      
      const indicatorResults = TechnicalIndicators.computeIndicators(highs, lows, closes, volumes, 'daily');
      const indicators = indicatorResults.indicators;
      console.log('✓ Technical indicators calculated:', {
        rsi: indicators.rsi.toFixed(1),
        macd: indicators.macd.macd.toFixed(3),
        regime: indicatorResults.regime
      });
      
      // Step 5: Analyze support and resistance
      console.log('Step 5: Analyzing support and resistance...');
      const pivots = SupportResistanceAnalyzer.findPivotPoints(highs, lows, closes);
      const { support, resistance } = SupportResistanceAnalyzer.getKeyLevels(pivots, stockData.price);
      console.log('✓ Support/Resistance levels:', { support, resistance });
      
      // Step 6: Analyze trade setup
      console.log('Step 6: Analyzing trade setup...');
      const setupStage = TradeSetupAnalyzer.analyzeSetupStage(indicators, stockData.price, support, resistance, closes);
      const newsSentiment = NewsService.analyzeSentiment(newsData);

      // Get RSI interpretation
      const rsiInterpretation = TechnicalIndicators.interpretRsiForPdf(
        indicators.rsi,
        stockData.price,
        indicators.ema20,
        indicators.ema50,
        indicators.macd.macd,
        indicators.adx
      );
      
      console.log('✓ Setup analysis complete:', {
        setupStage,
        sentiment: newsSentiment,
        rsiZone: rsiInterpretation.zone
      });
      
      // Step 7: Calculate trade quality
      console.log('Step 7: Calculating trade quality...');
      const tradeQuality = TradeSetupAnalyzer.calculateTradeQuality(
        indicators,
        setupStage,
        indicatorResults.regime as 'High' | 'Normal' | 'Low',
        newsSentiment
      );
      console.log('✓ Trade quality calculated:', tradeQuality);
      
      // Step 8: Generate AI report using OpenAI
      console.log('Step 8: Generating AI analysis report...');
      
      const aiGeneratedReport = await OpenAIService.generateAnalysisReport(
        symbol,
        stockData,
        indicators,
        support,
        resistance,
        this.formatSentimentData(newsData),
        indicatorResults.regime as 'High' | 'Normal' | 'Low',
        setupStage,
        this.generateLifecycleRationale(setupStage, indicators, support, resistance),
        rsiInterpretation
      );
      
      console.log('✓ AI report generated successfully, length:', aiGeneratedReport.length);
      
      // Step 9: Parse AI report into sections
      console.log('Step 9: Parsing AI report into sections...');
      const sections = this.parseAIReportToSections(aiGeneratedReport);
      console.log(`✓ Report parsed into ${sections.length} sections`);
      
      // Step 10: Create final analysis report
      const finalReport: AnalysisReport = {
        symbol: stockData.symbol,
        setupStage,
        tradeQuality: tradeQuality.tier,
        volatilityRegime: indicatorResults.regime as 'High' | 'Normal' | 'Low',
        confidenceScore: tradeQuality.score,
        actionable: tradeQuality.score >= 60,
        recommendation: this.generateRecommendation(tradeQuality, setupStage, indicators, stockData.price, support, resistance),
        sections,
        historicalData // Include historical data for charting
      };
      
      console.log('✓ Analysis complete for', symbol, '- Confidence:', finalReport.confidenceScore);
      return finalReport;
      
    } catch (error) {
      console.error('❌ Analysis failed for', symbol, ':', error);
      throw error; // Don't fall back to mock data, let the error bubble up
    }
  }
  
  private static formatSentimentData(newsData: any[]): string {
    if (newsData.length === 0) return 'No significant news items found';
    
    return newsData.map(news => 
      `${news.headline} - Sentiment: ${news.sentiment} (${news.source})`
    ).join('\n');
  }
  
  private static generateLifecycleRationale(
    setupStage: string,
    indicators: any,
    support: number[],
    resistance: number[]
  ): string {
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
    
    console.log('Parsing AI report with', lines.length, 'lines');
    console.log('First few lines:', lines.slice(0, 5));
    
    for (const line of lines) {
      // Check for multiple header patterns
      const headerMatch = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*\s*$/) || 
                         line.match(/^\*\*(.+?)\*\*\s*$/) ||
                         line.match(/^(\d+)\.\s*(.+)$/) ||
                         line.match(/^##\s*(.+)$/) ||
                         line.match(/^#\s*(.+)$/);
                         
      if (headerMatch) {
        // Save previous section if exists
        if (currentSection) {
          console.log('✓ Adding section:', currentSection.title, 'with', currentSection.content.length, 'chars');
          sections.push(currentSection);
        }
        
        // Start new section
        const title = headerMatch[2] || headerMatch[1];
        console.log('📝 New section found:', title);
        currentSection = {
          title: title.replace(/\*\*/g, '').trim(),
          content: ''
        };
      } else if (currentSection && line.trim()) {
        // Add content to current section
        if (currentSection.content && !currentSection.content.endsWith(' ')) {
          currentSection.content += ' ';
        }
        currentSection.content += line.trim();
      }
    }
    
    // Add final section
    if (currentSection) {
      console.log('✓ Adding final section:', currentSection.title, 'with', currentSection.content.length, 'chars');
      sections.push(currentSection);
    }
    
    console.log('🎯 Total sections parsed:', sections.length);
    
    // If no sections were parsed properly, create fallback sections from the raw report
    if (sections.length === 0) {
      console.log('⚠️ No sections parsed, splitting by double asterisks');
      // Try to split by ** patterns as a fallback
      const fallbackSections = aiReport.split(/\*\*\d+\.\s*(.+?)\*\*/g);
      
      for (let i = 1; i < fallbackSections.length; i += 2) {
        if (fallbackSections[i] && fallbackSections[i + 1]) {
          sections.push({
            title: fallbackSections[i].trim(),
            content: fallbackSections[i + 1].trim()
          });
        }
      }
      
      // If still no sections, create one big section
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
    tradeQuality: any,
    setupStage: string,
    indicators: any,
    currentPrice: number,
    support: number[],
    resistance: number[]
  ): string {
    // Determine overall trend direction
    const rsiTrend = indicators.rsi > 50 ? 'bullish' : 'bearish';
    const macdTrend = indicators.macd.macd > 0 ? 'bullish' : 'bearish';
    const emaTrend = indicators.ema20 > indicators.ema50 ? 'bullish' : 'bearish';
    const priceTrend = currentPrice > indicators.ema20 ? 'bullish' : 'bearish';
    
    // Count bullish vs bearish signals
    const bullishCount = [rsiTrend, macdTrend, emaTrend, priceTrend].filter(t => t === 'bullish').length;
    const overallTrend = bullishCount >= 3 ? 'bullish' : bullishCount <= 1 ? 'bearish' : 'neutral';
    
    console.log('📊 Trend Analysis:', {
      rsi: rsiTrend,
      macd: macdTrend, 
      ema: emaTrend,
      price: priceTrend,
      overall: overallTrend,
      bullishSignals: bullishCount
    });

    // Calculate proper stop-loss using ATR-based method
    const atrMultiplier = this.getATRMultiplier(setupStage, indicators.adx);

    let recommendedStop: number;
    let targetPrice: number;

    // Risk limits: 1-10% for stops, targeting 1.5:1 to 3:1 reward-risk ratio
    const minRiskPercent = 0.01; // 1%
    const maxRiskPercent = 0.10; // 10%

    if (overallTrend === 'bullish') {
      // For bullish setups - stop below, target above
      const atrStop = currentPrice - (indicators.atr * atrMultiplier);

      // Filter support levels that are actually below current price
      const validSupport = support.filter(s => s < currentPrice * 0.99);
      const nearestSupport = validSupport.length > 0 ? validSupport[0] : null;

      // Use the tighter of ATR stop or support-based stop
      let calculatedStop = atrStop;
      if (nearestSupport) {
        const supportStop = nearestSupport * 0.98; // 2% below support
        calculatedStop = Math.max(atrStop, supportStop); // Use tighter stop
      }

      // Clamp stop within risk limits
      const minStop = currentPrice * (1 - maxRiskPercent); // Max 10% risk
      const maxStop = currentPrice * (1 - minRiskPercent); // Min 1% risk
      recommendedStop = Math.max(minStop, Math.min(maxStop, calculatedStop));

      // Target: Use resistance or 2:1 reward-risk ratio
      const validResistance = resistance.filter(r => r > currentPrice * 1.01);
      if (validResistance.length > 0) {
        targetPrice = validResistance[0];
      } else {
        // Use 2:1 reward-risk ratio if no resistance
        const risk = currentPrice - recommendedStop;
        targetPrice = currentPrice + (risk * 2);
      }

    } else if (overallTrend === 'bearish') {
      // For bearish setups - stop above, target below
      const atrStop = currentPrice + (indicators.atr * atrMultiplier);

      // Filter resistance levels that are actually above current price
      const validResistance = resistance.filter(r => r > currentPrice * 1.01);
      const nearestResistance = validResistance.length > 0 ? validResistance[0] : null;

      // Use the tighter of ATR stop or resistance-based stop
      let calculatedStop = atrStop;
      if (nearestResistance) {
        const resistanceStop = nearestResistance * 1.02; // 2% above resistance
        calculatedStop = Math.min(atrStop, resistanceStop); // Use tighter stop
      }

      // Clamp stop within risk limits
      const maxStop = currentPrice * (1 + maxRiskPercent); // Max 10% risk
      const minStop = currentPrice * (1 + minRiskPercent); // Min 1% risk
      recommendedStop = Math.min(maxStop, Math.max(minStop, calculatedStop));

      // Target: Use support or 2:1 reward-risk ratio
      const validSupport = support.filter(s => s < currentPrice * 0.99);
      if (validSupport.length > 0) {
        targetPrice = validSupport[0];
      } else {
        // Use 2:1 reward-risk ratio if no support
        const risk = recommendedStop - currentPrice;
        targetPrice = currentPrice - (risk * 2);
      }

    } else {
      // Neutral - use wider stops, no directional bias
      const validSupport = support.filter(s => s < currentPrice * 0.99);
      const validResistance = resistance.filter(r => r > currentPrice * 1.01);

      recommendedStop = validSupport.length > 0 ? validSupport[0] * 0.98 : currentPrice * 0.95;
      targetPrice = validResistance.length > 0 ? validResistance[0] : currentPrice * 1.03;

      // Ensure neutral stops are within limits
      const minStop = currentPrice * (1 - maxRiskPercent);
      const maxStop = currentPrice * (1 - minRiskPercent);
      recommendedStop = Math.max(minStop, Math.min(maxStop, recommendedStop));
    }

    // Calculate actual risk percentage
    const riskPercent = Math.abs((currentPrice - recommendedStop) / currentPrice * 100);
    const rewardPercent = Math.abs((targetPrice - currentPrice) / currentPrice * 100);
    const rewardRiskRatio = rewardPercent / riskPercent;
    
    console.log('💰 Stop/Target Analysis:', {
      currentPrice: currentPrice.toFixed(2),
      stop: recommendedStop.toFixed(2),
      target: targetPrice.toFixed(2),
      risk: riskPercent.toFixed(2) + '%',
      reward: rewardPercent.toFixed(2) + '%',
      ratio: rewardRiskRatio.toFixed(2) + ':1'
    });

    if (tradeQuality.score >= 70) {
      if (overallTrend === 'bullish') {
        return `Strong bullish setup identified. Consider long position with stop at $${recommendedStop.toFixed(2)} (${riskPercent.toFixed(1)}% risk) and initial target near $${targetPrice.toFixed(2)} (${rewardPercent.toFixed(1)}% gain, ${rewardRiskRatio.toFixed(1)}:1 R/R).`;
      } else if (overallTrend === 'bearish') {
        return `Strong bearish setup identified. Consider short position with stop at $${recommendedStop.toFixed(2)} (${riskPercent.toFixed(1)}% risk) and initial target near $${targetPrice.toFixed(2)} (${rewardPercent.toFixed(1)}% gain, ${rewardRiskRatio.toFixed(1)}:1 R/R).`;
      } else {
        const validSupport = support.filter(s => s < currentPrice * 0.99);
        const validResistance = resistance.filter(r => r > currentPrice * 1.01);
        return `Mixed signals present. Wait for clearer directional confirmation before entering positions. Monitor key levels: Support $${validSupport[0]?.toFixed(2) || (currentPrice * 0.95).toFixed(2)}, Resistance $${validResistance[0]?.toFixed(2) || (currentPrice * 1.05).toFixed(2)}.`;
      }
    } else if (tradeQuality.score >= 50) {
      return `Moderate ${overallTrend} setup developing. Consider small position or wait for better confirmation signals. Risk management is critical given current conditions.`;
    } else {
      return `Current conditions do not support high-confidence trading. Monitor for clearer signals or wait for improved setup development.`;
    }
  }
  
  // Calculate appropriate ATR multiplier based on setup stage and trend strength
  private static getATRMultiplier(setupStage: string, adx: number): number {
    let baseMultiplier = 2.0; // Standard 2x ATR
    
    // Adjust based on setup stage
    switch (setupStage) {
      case 'Just Triggered':
        baseMultiplier = 1.5; // Tighter stop for fresh breakouts
        break;
      case 'Mid Setup':
        baseMultiplier = 2.0; // Standard stop
        break;
      case 'Setup Forming':
        baseMultiplier = 2.5; // Wider stop for developing setups
        break;
      case 'Late Setup':
        baseMultiplier = 1.2; // Very tight stop for late entries
        break;
    }
    
    // Adjust based on trend strength (ADX)
    if (adx > 40) {
      baseMultiplier *= 1.2; // Wider stops in very strong trends
    } else if (adx < 20) {
      baseMultiplier *= 0.8; // Tighter stops in weak trends
    }
    
    return baseMultiplier;
  }
}