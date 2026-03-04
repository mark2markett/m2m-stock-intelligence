import { TechnicalIndicators as TI } from '../types';

export type SetupStage = 'Setup Forming' | 'Just Triggered' | 'Mid Setup' | 'Late Setup';

export class TradeSetupAnalyzer {
  static analyzeSetupStage(
    indicators: TI,
    currentPrice: number,
    support: number[],
    resistance: number[],
    recentPrices: number[]
  ): SetupStage {
    const { rsi, macd, ema20, ema50, bollingerBands } = indicators;
    
    // Check for recent breakouts or triggers
    const nearResistance = resistance.some(r => Math.abs(currentPrice - r) / currentPrice < 0.02);
    const nearSupport = support.some(s => Math.abs(currentPrice - s) / currentPrice < 0.02);
    const recentBreakout = this.checkRecentBreakout(recentPrices, resistance, support);
    
    // Analyze indicator signals
    const macdBullish = macd.macd > macd.signal;
    const emaBullish = ema20 > ema50;
    const rsiBullish = rsi > 50 && rsi < 80;

    // Check for recent crossovers (scale-independent)
    // Use percentage of MACD line value to determine if near zero
    const macdMagnitude = Math.abs(macd.macd);
    const histogramRatio = macdMagnitude > 0 ? Math.abs(macd.histogram) / macdMagnitude : 0;
    const recentMacdCross = histogramRatio < 0.15; // Histogram is less than 15% of MACD magnitude
    
    // Determine stage
    if (recentBreakout && recentMacdCross) {
      return 'Just Triggered';
    } else if (rsiBullish && emaBullish && macdBullish && !nearResistance) {
      if (rsi > 75 || (currentPrice > bollingerBands.upper)) {
        return 'Late Setup';
      } else {
        return 'Mid Setup';
      }
    } else if ((nearSupport || nearResistance) && !recentBreakout) {
      return 'Setup Forming';
    } else if (rsi > 80 || rsi < 20) {
      return 'Late Setup';
    } else {
      return 'Setup Forming';
    }
  }
  
  private static checkRecentBreakout(recentPrices: number[], resistance: number[], support: number[]): boolean {
    if (recentPrices.length < 3) return false;
    
    const currentPrice = recentPrices[recentPrices.length - 1];
    const previousPrices = recentPrices.slice(-5, -1);
    
    // Check if price recently broke above resistance
    const brokeResistance = resistance.some(r => 
      currentPrice > r && previousPrices.some(p => p < r * 0.98)
    );
    
    // Check if price recently broke below support
    const brokeSupport = support.some(s => 
      currentPrice < s && previousPrices.some(p => p > s * 1.02)
    );
    
    return brokeResistance || brokeSupport;
  }
  
  // Calculate trade quality score
  static calculateTradeQuality(
    indicators: TI,
    setupStage: SetupStage,
    volatilityRegime: 'High' | 'Normal' | 'Low',
    newsSentiment: 'Positive' | 'Neutral' | 'Negative'
  ): { score: number; tier: 'Tier 1' | 'Tier 2' | 'Tier 3' } {
    let score = 50; // Base score
    
    // Technical indicators alignment
    const { rsi, macd, ema20, ema50 } = indicators;
    
    // Count aligned signals
    let alignedSignals = 0;
    
    // Trend alignment
    const emaBullish = ema20 > ema50;
    const macdBullish = macd.macd > macd.signal;
    const rsiBullish = rsi > 50;
    
    // Check for alignment (all bullish or all bearish)
    if ((emaBullish && macdBullish && rsiBullish) || (!emaBullish && !macdBullish && !rsiBullish)) {
      score += 20; // Strong alignment bonus
      alignedSignals = 3;
    } else {
      // Partial alignment
      if (emaBullish) alignedSignals++;
      if (macdBullish) alignedSignals++;  
      if (rsiBullish) alignedSignals++;
      score += alignedSignals * 5;
    }
    
    // RSI not extreme (good for continuation)
    if (rsi > 30 && rsi < 70) score += 5;
    
    // Weak trend penalty (ADX < 20)  
    if (indicators.adx < 20) score -= 10;
    
    // Setup stage scoring
    switch (setupStage) {
      case 'Just Triggered':
        score += 15;
        break;
      case 'Mid Setup':
        score += 10;
        break;
      case 'Setup Forming':
        score += 5;
        break;
      case 'Late Setup':
        score -= 10;
        break;
    }
    
    // Volatility regime adjustment
    switch (volatilityRegime) {
      case 'Normal':
        score += 5;
        break;
      case 'High':
        score -= 5; // Higher risk
        break;
      case 'Low':
        score += 0; // Neutral
        break;
    }
    
    // News sentiment
    switch (newsSentiment) {
      case 'Positive':
        score += 10;
        break;
      case 'Negative':
        score -= 15;
        break;
      case 'Neutral':
        score += 0;
        break;
    }

    // Determine tier
    let tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
    if (score >= 75) {
      tier = 'Tier 1';
    } else if (score >= 50) {
      tier = 'Tier 2';
    } else {
      tier = 'Tier 3';
    }
    
    return { score: Math.max(0, Math.min(100, score)), tier };
  }
}