import { VolatilityRegime } from '@/lib/types';

export class VolatilityAnalyzer {
  static analyzeVolatilityRegime(
    atr: number,
    currentPrice: number,
    bollingerBands: { upper: number; lower: number; middle: number },
    historicalATR: number[]
  ): VolatilityRegime {
    const atrPercent = (atr / currentPrice) * 100;

    const bbWidth = ((bollingerBands.upper - bollingerBands.lower) / bollingerBands.middle) * 100;

    const sortedATR = [...historicalATR].sort((a, b) => a - b);
    const atrRank = sortedATR.findIndex(val => val >= atr);
    const atrPercentile = atrRank >= 0 ? (atrRank / sortedATR.length) * 100 : 50;

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

  static adjustIndicatorThresholds(regime: 'High' | 'Normal' | 'Low') {
    switch (regime) {
      case 'High':
        return {
          rsiOverbought: 75,
          rsiOversold: 25,
          stopLossMultiplier: 1.5,
          confirmationPeriod: 3
        };
      case 'Low':
        return {
          rsiOverbought: 65,
          rsiOversold: 35,
          stopLossMultiplier: 0.8,
          confirmationPeriod: 1
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
