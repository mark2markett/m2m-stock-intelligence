import type { TechnicalIndicators as TI, M2MScorecard, M2MScoreFactor, NewsItem } from '@/lib/types';
import { analyzeSentiment } from '@/lib/utils/sentimentAnalysis';

export type SetupStage = 'Setup Forming' | 'Just Triggered' | 'Mid Setup' | 'Late Setup';

const PUBLICATION_THRESHOLD = 65;
const REQUIRED_FACTORS_PASSED = 4;
const TOTAL_FACTORS = 6;

export class TradeSetupAnalyzer {
  static analyzeSetupStage(
    indicators: TI,
    currentPrice: number,
    support: number[],
    resistance: number[],
    recentPrices: number[]
  ): SetupStage {
    const { rsi, macd, ema20, ema50, bollingerBands } = indicators;

    const nearResistance = resistance.some(r => Math.abs(currentPrice - r) / currentPrice < 0.02);
    const nearSupport = support.some(s => Math.abs(currentPrice - s) / currentPrice < 0.02);
    const recentBreakout = this.checkRecentBreakout(recentPrices, resistance, support);

    const macdBullish = macd.macd > macd.signal;
    const emaBullish = ema20 > ema50;
    const rsiBullish = rsi > 50 && rsi < 80;

    const macdMagnitude = Math.abs(macd.macd);
    const histogramRatio = macdMagnitude > 0 ? Math.abs(macd.histogram) / macdMagnitude : 0;
    const recentMacdCross = histogramRatio < 0.15;

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

    const brokeResistance = resistance.some(r =>
      currentPrice > r && previousPrices.some(p => p < r * 0.98)
    );

    const brokeSupport = support.some(s =>
      currentPrice < s && previousPrices.some(p => p > s * 1.02)
    );

    return brokeResistance || brokeSupport;
  }

  /**
   * M2M 6-Factor Scoring System
   *
   * 1. Strategy Signal Strength (25 pts) - RSI/MACD/EMA alignment
   * 2. Short Interest Alignment (20 pts) - placeholder until data source available
   * 3. Technical Structure (20 pts) - ADX trend strength, Bollinger position, setup stage
   * 4. Options Quality (15 pts) - placeholder until options data available
   * 5. Risk/Reward Ratio (10 pts) - ATR-based R/R assessment
   * 6. Catalyst Presence (10 pts) - news sentiment signal
   *
   * Publication threshold: 65+ total score
   * Multi-factor confirmation: 4 of 6 factors must pass
   */
  static calculateM2MScorecard(
    indicators: TI,
    setupStage: SetupStage,
    volatilityRegime: 'High' | 'Normal' | 'Low',
    newsData: NewsItem[],
    currentPrice: number,
    support: number[],
    resistance: number[]
  ): M2MScorecard {
    const factors: M2MScoreFactor[] = [
      this.scoreStrategySignalStrength(indicators),
      this.scoreShortInterestAlignment(),
      this.scoreTechnicalStructure(indicators, setupStage, currentPrice),
      this.scoreOptionsQuality(),
      this.scoreRiskReward(indicators, currentPrice, support, resistance),
      this.scoreCatalystPresence(newsData),
    ];

    const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
    const maxScore = factors.reduce((sum, f) => sum + f.maxPoints, 0);
    const factorsPassed = factors.filter(f => f.passed).length;

    const meetsPublicationThreshold = totalScore >= PUBLICATION_THRESHOLD;
    const meetsMultiFactorRule = factorsPassed >= REQUIRED_FACTORS_PASSED;
    const publishable = meetsPublicationThreshold && meetsMultiFactorRule;

    return {
      totalScore,
      maxScore,
      factorsPassed,
      totalFactors: TOTAL_FACTORS,
      meetsPublicationThreshold,
      meetsMultiFactorRule,
      publishable,
      factors,
    };
  }

  /** Factor 1: Strategy Signal Strength (25 pts) */
  private static scoreStrategySignalStrength(indicators: TI): M2MScoreFactor {
    const maxPoints = 25;
    let score = 0;
    const reasons: string[] = [];

    const { rsi, macd, ema20, ema50 } = indicators;

    const emaBullish = ema20 > ema50;
    const macdBullish = macd.macd > macd.signal;
    const rsiBullish = rsi > 50;

    // All three aligned in same direction = strongest signal
    const allBullish = emaBullish && macdBullish && rsiBullish;
    const allBearish = !emaBullish && !macdBullish && !rsiBullish;

    if (allBullish || allBearish) {
      score += 15;
      reasons.push(`All 3 signals aligned ${allBullish ? 'bullish' : 'bearish'}`);
    } else {
      let aligned = 0;
      if (emaBullish) aligned++;
      if (macdBullish) aligned++;
      if (rsiBullish) aligned++;
      score += aligned * 4;
      reasons.push(`${aligned}/3 signals aligned`);
    }

    // RSI in favorable zone (not extreme)
    if (rsi > 30 && rsi < 70) {
      score += 5;
      reasons.push('RSI in healthy range');
    }

    // MACD histogram momentum
    if (Math.abs(macd.histogram) > 0) {
      const histogramDirectionMatchesMacd =
        (macd.macd > 0 && macd.histogram > 0) ||
        (macd.macd < 0 && macd.histogram < 0);
      if (histogramDirectionMatchesMacd) {
        score += 5;
        reasons.push('MACD histogram confirms momentum');
      }
    }

    score = Math.min(score, maxPoints);
    const passed = score >= maxPoints * 0.5; // 13+ to pass

    return {
      name: 'Strategy Signal Strength',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }

  /** Factor 2: Short Interest Alignment (20 pts) - Placeholder */
  private static scoreShortInterestAlignment(): M2MScoreFactor {
    const maxPoints = 20;
    // Placeholder: award neutral score until short interest data is available
    const score = 10;
    return {
      name: 'Short Interest Alignment',
      maxPoints,
      score,
      passed: true,
      rationale: 'Placeholder — short interest data not yet integrated. Neutral score applied.',
    };
  }

  /** Factor 3: Technical Structure (20 pts) */
  private static scoreTechnicalStructure(
    indicators: TI,
    setupStage: SetupStage,
    currentPrice: number
  ): M2MScoreFactor {
    const maxPoints = 20;
    let score = 0;
    const reasons: string[] = [];

    // ADX trend strength
    if (indicators.adx > 25) {
      score += 6;
      reasons.push('ADX confirms trend strength');
    } else if (indicators.adx > 20) {
      score += 3;
      reasons.push('ADX shows moderate trend');
    } else {
      reasons.push('ADX weak — no clear trend');
    }

    // Bollinger Band position
    const { upper, lower, middle } = indicators.bollingerBands;
    const bbPosition = (currentPrice - lower) / (upper - lower);
    if (bbPosition > 0.2 && bbPosition < 0.8) {
      score += 4;
      reasons.push('Price within Bollinger mid-zone');
    } else if (bbPosition >= 0.8) {
      score += 2;
      reasons.push('Price near upper Bollinger');
    } else {
      score += 2;
      reasons.push('Price near lower Bollinger');
    }

    // Setup stage bonus
    switch (setupStage) {
      case 'Just Triggered':
        score += 8;
        reasons.push('Setup just triggered');
        break;
      case 'Mid Setup':
        score += 6;
        reasons.push('Mid-setup progression');
        break;
      case 'Setup Forming':
        score += 3;
        reasons.push('Setup still forming');
        break;
      case 'Late Setup':
        score += 1;
        reasons.push('Late-stage setup — extended');
        break;
    }

    // Stochastic confirmation
    const { k } = indicators.stochastic;
    if (k > 20 && k < 80) {
      score += 2;
      reasons.push('Stochastic in healthy range');
    }

    score = Math.min(score, maxPoints);
    const passed = score >= maxPoints * 0.5; // 10+ to pass

    return {
      name: 'Technical Structure',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }

  /** Factor 4: Options Quality (15 pts) - Placeholder */
  private static scoreOptionsQuality(): M2MScoreFactor {
    const maxPoints = 15;
    // Placeholder: award neutral score until options chain data is available
    const score = 8;
    return {
      name: 'Options Quality',
      maxPoints,
      score,
      passed: true,
      rationale: 'Placeholder — options chain data not yet integrated. Neutral score applied.',
    };
  }

  /** Factor 5: Risk/Reward Ratio (10 pts) */
  private static scoreRiskReward(
    indicators: TI,
    currentPrice: number,
    support: number[],
    resistance: number[]
  ): M2MScoreFactor {
    const maxPoints = 10;
    let score = 0;
    const reasons: string[] = [];

    const validSupport = support.filter(s => s < currentPrice * 0.99);
    const validResistance = resistance.filter(r => r > currentPrice * 1.01);

    const nearestSupport = validSupport.length > 0 ? validSupport[0] : currentPrice * 0.95;
    const nearestResistance = validResistance.length > 0 ? validResistance[0] : currentPrice * 1.05;

    const risk = Math.abs(currentPrice - nearestSupport);
    const reward = Math.abs(nearestResistance - currentPrice);
    const rrRatio = risk > 0 ? reward / risk : 0;

    if (rrRatio >= 3) {
      score += 10;
      reasons.push(`Excellent R/R ratio: ${rrRatio.toFixed(1)}:1`);
    } else if (rrRatio >= 2) {
      score += 7;
      reasons.push(`Good R/R ratio: ${rrRatio.toFixed(1)}:1`);
    } else if (rrRatio >= 1.5) {
      score += 5;
      reasons.push(`Acceptable R/R ratio: ${rrRatio.toFixed(1)}:1`);
    } else if (rrRatio >= 1) {
      score += 3;
      reasons.push(`Marginal R/R ratio: ${rrRatio.toFixed(1)}:1`);
    } else {
      reasons.push(`Poor R/R ratio: ${rrRatio.toFixed(1)}:1`);
    }

    const passed = score >= maxPoints * 0.5; // 5+ to pass

    return {
      name: 'Risk/Reward Ratio',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }

  /** Factor 6: Catalyst Presence (10 pts) */
  private static scoreCatalystPresence(newsData: NewsItem[]): M2MScoreFactor {
    const maxPoints = 10;
    let score = 0;
    const reasons: string[] = [];

    if (newsData.length === 0) {
      score = 3;
      reasons.push('No recent news — neutral catalyst environment');
    } else {
      const sentiment = analyzeSentiment(newsData);

      if (sentiment === 'Positive') {
        score = 10;
        reasons.push('Positive news sentiment provides catalyst support');
      } else if (sentiment === 'Neutral') {
        score = 5;
        reasons.push('Neutral news sentiment — no catalyst headwind or tailwind');
      } else {
        score = 1;
        reasons.push('Negative news sentiment presents catalyst headwind');
      }
    }

    const passed = score >= maxPoints * 0.5; // 5+ to pass

    return {
      name: 'Catalyst Presence',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }
}
