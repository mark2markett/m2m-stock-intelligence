import { VolatilityRegime } from '../types';

export class VolatilityAnalyzer {
  // Determine volatility regime based on ATR and Bollinger Band width
  static analyzeVolatilityRegime(
    atr: number,
    currentPrice: number,
    bollingerBands: { upper: number; lower: number; middle: number },
    historicalATR: number[]
  ): VolatilityRegime {
    // Calculate ATR as percentage of price
    const atrPercent = (atr / currentPrice) * 100;

    // Calculate Bollinger Band width as percentage
    const bbWidth = ((bollingerBands.upper - bollingerBands.lower) / bollingerBands.middle) * 100;

    // Calculate ATR percentile compared to recent history (create copy to avoid mutation)
    const sortedATR = [...historicalATR].sort((a, b) => a - b);
    const atrRank = sortedATR.findIndex(val => val >= atr);
    const atrPercentile = atrRank >= 0 ? (atrRank / sortedATR.length) * 100 : 50;
    
    // Determine regime
    let regime: 'High' | 'Normal' | 'Low';
    
    if (atrPercentile > 75 && bbWidth > 8) {
      regime = 'High';
    } else if (atrPercentile < 25 && bbWidth < 4) {
      regime = 'Low';
    } else {
      regime = 'Normal';
    }
    
    return {
      regime,
      atrPercentile,
      bbWidth
    };
  }
  
  // Adjust indicator interpretation based on volatility regime
  static adjustIndicatorThresholds(regime: 'High' | 'Normal' | 'Low') {
    switch (regime) {
      case 'High':
        return {
          rsiOverbought: 75, // Higher threshold in high vol
          rsiOversold: 25,
          stopLossMultiplier: 1.5, // Wider stops
          confirmationPeriod: 3 // More confirmation needed
        };
      case 'Low':
        return {
          rsiOverbought: 65, // Lower threshold in low vol
          rsiOversold: 35,
          stopLossMultiplier: 0.8, // Tighter stops
          confirmationPeriod: 1 // Less confirmation needed
        };
      default:
        return {
          rsiOverbought: 70,
          rsiOversold: 30,
          stopLossMultiplier: 1.0,
          confirmationPeriod: 2
        };
    }
  }
}