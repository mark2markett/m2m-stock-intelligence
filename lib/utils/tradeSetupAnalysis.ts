import { analyzeSentiment } from './sentimentAnalysis';
import type {
  TechnicalIndicators as TI,
  M2MScorecard,
  M2MScoreFactor,
  NewsItem,
  OptionsData,
} from '@/lib/types';

export type SetupStage = 'Setup Forming' | 'Just Triggered' | 'Mid Setup' | 'Late Setup';

const PUBLICATION_THRESHOLD = 65;
const REQUIRED_FACTORS_PASSED = 3;
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
   * 1. Strategy Signal Strength  (22 pts) - RSI/MACD/EMA alignment + MTF penalties
   * 2. Technical Structure       (18 pts) - ADX, Bollinger position, setup stage
   * 3. Options Quality           (28 pts) - real options chain data from Polygon
   * 4. Risk/Reward Ratio         (12 pts) - ATR-based R/R using nearest S/R
   * 5. Catalyst Presence         (12 pts) - news sentiment signal
   * 6. Money Flow (CMF)          ( 8 pts) - Chaikin Money Flow accumulation signal
   *
   * Total max: 100 pts
   * Publication threshold: 65+ total score
   * Multi-factor confirmation: 3 of 6 factors must pass
   *
   * Multi-timeframe alignment (optional — gracefully skipped if data unavailable):
   *   Weekly EMA trend:  bullish = +3pts, bearish = -3pts (applied in Factor 1)
   *   4h EMA trend:      bullish = +1.5pts, bearish = -1.5pts (applied in Factor 1)
   */
  static calculateM2MScorecard(
    indicators: TI,
    setupStage: SetupStage,
    volatilityRegime: 'High' | 'Normal' | 'Low',
    newsData: NewsItem[],
    currentPrice: number,
    support: number[],
    resistance: number[],
    optionsData?: OptionsData | null,
    // Optional multi-timeframe EMA values — pass null/undefined to skip MTF scoring
    weeklyEma?: { fast: number; slow: number } | null,
    fourHourEma?: { fast: number; slow: number } | null,
  ): M2MScorecard {
    const factors: M2MScoreFactor[] = [
      this.scoreStrategySignalStrength(indicators, weeklyEma, fourHourEma),
      this.scoreTechnicalStructure(indicators, setupStage, currentPrice),
      this.scoreOptionsQuality(optionsData || null, indicators.atr, currentPrice),
      this.scoreRiskReward(indicators, currentPrice, support, resistance),
      this.scoreCatalystPresence(newsData),
      this.scoreMoneyFlow(indicators.cmf),
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

  /**
   * Factor 1: Strategy Signal Strength (22 pts)
   *
   * Base scoring (18 pts max):
   *   All 3 aligned same direction = 18pts
   *   Partial alignment = aligned count × 5pts
   *   RSI healthy zone (30–70) = +2pts (was 6, reduced to make room for MTF)
   *   MACD histogram confirms = +2pts
   *
   * Multi-timeframe adjustments (applied after base, can go negative):
   *   Weekly EMA bullish = +3, bearish = -3
   *   4h EMA bullish = +1.5, bearish = -1.5
   *
   * Note: score is clamped to [0, 22] after MTF adjustments.
   * Penalising counter-trend setups is intentional — they have
   * asymmetrically wider drawdown risk.
   */
  private static scoreStrategySignalStrength(
    indicators: TI,
    weeklyEma?: { fast: number; slow: number } | null,
    fourHourEma?: { fast: number; slow: number } | null,
  ): M2MScoreFactor {
    const maxPoints = 22;
    let score = 0;
    const reasons: string[] = [];

    const { rsi, macd, ema20, ema50 } = indicators;

    const emaBullish = ema20 > ema50;
    const macdBullish = macd.macd > macd.signal;
    const rsiBullish = rsi > 50;

    const allBullish = emaBullish && macdBullish && rsiBullish;
    const allBearish = !emaBullish && !macdBullish && !rsiBullish;

    if (allBullish || allBearish) {
      score += 18;
      reasons.push(`All 3 signals aligned ${allBullish ? 'bullish' : 'bearish'}`);
    } else {
      let aligned = 0;
      if (emaBullish) aligned++;
      if (macdBullish) aligned++;
      if (rsiBullish) aligned++;
      score += aligned * 5;
      reasons.push(`${aligned}/3 signals aligned`);
    }

    // RSI in healthy zone
    if (rsi > 30 && rsi < 70) {
      score += 2;
      reasons.push('RSI in healthy range');
    }

    // MACD histogram momentum
    if (Math.abs(macd.histogram) > 0) {
      const histConfirms =
        (macd.macd > 0 && macd.histogram > 0) ||
        (macd.macd < 0 && macd.histogram < 0);
      if (histConfirms) {
        score += 2;
        reasons.push('MACD histogram confirms momentum');
      }
    }

    // Multi-timeframe alignment (optional, gracefully skipped if null)
    if (weeklyEma != null) {
      const weeklyBullish = weeklyEma.fast > weeklyEma.slow;
      if (weeklyBullish) {
        score += 3;
        reasons.push('Weekly EMA trend aligned bullish (+3)');
      } else {
        score -= 3;
        reasons.push('Weekly EMA trend counter-trend bearish (-3)');
      }
    }

    if (fourHourEma != null) {
      const fourHBullish = fourHourEma.fast > fourHourEma.slow;
      if (fourHBullish) {
        score += 1.5;
        reasons.push('4h EMA trend aligned bullish (+1.5)');
      } else {
        score -= 1.5;
        reasons.push('4h EMA trend counter-trend bearish (-1.5)');
      }
    }

    score = Math.max(0, Math.min(score, maxPoints));
    const passed = score >= maxPoints * 0.5; // 11+ to pass

    return {
      name: 'Strategy Signal Strength',
      maxPoints,
      score: Math.round(score * 10) / 10,
      passed,
      rationale: reasons.join('; '),
    };
  }

  /** Factor 2: Technical Structure (18 pts) */
  private static scoreTechnicalStructure(
    indicators: TI,
    setupStage: SetupStage,
    currentPrice: number
  ): M2MScoreFactor {
    const maxPoints = 18;
    let score = 0;
    const reasons: string[] = [];

    // ADX trend strength (up to 6)
    if (indicators.adx > 25) {
      score += 6;
      reasons.push('ADX confirms trend strength');
    } else if (indicators.adx > 20) {
      score += 3;
      reasons.push('ADX shows moderate trend');
    } else {
      reasons.push('ADX weak — no clear trend');
    }

    // Bollinger Band position (up to 4)
    const { upper, lower } = indicators.bollingerBands;
    const bbPosition = (currentPrice - lower) / (upper - lower);
    if (bbPosition > 0.2 && bbPosition < 0.8) {
      score += 4;
      reasons.push('Price within Bollinger mid-zone');
    } else if (bbPosition >= 0.8) {
      score += 1;
      reasons.push('Price near upper Bollinger');
    } else {
      score += 1;
      reasons.push('Price near lower Bollinger');
    }

    // Setup stage bonus (up to 6)
    switch (setupStage) {
      case 'Just Triggered':
        score += 6;
        reasons.push('Setup just triggered');
        break;
      case 'Mid Setup':
        score += 5;
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

    // Stochastic confirmation (up to 2)
    const { k } = indicators.stochastic;
    if (k > 20 && k < 80) {
      score += 2;
      reasons.push('Stochastic in healthy range');
    }

    score = Math.min(score, maxPoints);
    const passed = score >= maxPoints * 0.5; // 9+ to pass

    return {
      name: 'Technical Structure',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }

  /**
   * Factor 3: Options Quality (28 pts)
   *
   * Fallback when no options data: 14/28 (neutral 50%), passed=true.
   * This is intentionally neutral — it should not inflate or deflate
   * the score when the data simply isn't available.
   */
  private static scoreOptionsQuality(
    optionsData: OptionsData | null,
    atr: number,
    currentPrice: number
  ): M2MScoreFactor {
    const maxPoints = 28;

    if (!optionsData) {
      return {
        name: 'Options Quality',
        maxPoints,
        score: 14,  // exactly 50% — neutral, not a gift
        passed: true,
        rationale: 'Options data unavailable — neutral score applied.',
      };
    }

    let score = 0;
    const reasons: string[] = [];

    // Liquidity (11 pts): total volume + OI
    const totalVolume = optionsData.totalCallVolume + optionsData.totalPutVolume;
    const totalOI = optionsData.totalCallOI + optionsData.totalPutOI;
    if (totalVolume > 10000 && totalOI > 50000) {
      score += 11;
      reasons.push('Excellent options liquidity');
    } else if (totalVolume > 5000 && totalOI > 20000) {
      score += 8;
      reasons.push('Good options liquidity');
    } else if (totalVolume > 1000 && totalOI > 5000) {
      score += 4;
      reasons.push('Moderate options liquidity');
    } else {
      score += 1;
      reasons.push('Low options liquidity');
    }

    // Put/Call Ratio (9 pts)
    const pcr = optionsData.putCallRatio;
    if (pcr < 0.7) {
      score += 9;
      reasons.push(`Bullish P/C ratio: ${pcr.toFixed(2)}`);
    } else if (pcr <= 1.0) {
      score += 6;
      reasons.push(`Neutral P/C ratio: ${pcr.toFixed(2)}`);
    } else {
      score += 2;
      reasons.push(`Bearish P/C ratio: ${pcr.toFixed(2)}`);
    }

    // IV Assessment (8 pts): compare avg IV to realized vol (ATR/price)
    const realizedVol = (atr / currentPrice) * Math.sqrt(252) * 100; // annualized %
    const avgIV = optionsData.avgImpliedVolatility * 100;
    const ivRatio = avgIV > 0 ? realizedVol / avgIV : 1;

    if (ivRatio > 0.8 && ivRatio < 1.2) {
      score += 8;
      reasons.push('IV fairly priced vs realized vol');
    } else if (ivRatio >= 1.2) {
      score += 6;
      reasons.push('IV below realized vol — options cheap');
    } else {
      score += 3;
      reasons.push('IV elevated vs realized vol — options expensive');
    }

    score = Math.min(score, maxPoints);
    const passed = score >= maxPoints * 0.5; // 14+ to pass

    return {
      name: 'Options Quality',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }

  /** Factor 4: Risk/Reward Ratio (12 pts) */
  private static scoreRiskReward(
    indicators: TI,
    currentPrice: number,
    support: number[],
    resistance: number[]
  ): M2MScoreFactor {
    const maxPoints = 12;
    let score = 0;
    const reasons: string[] = [];

    // support[] is now sorted nearest-first after the supportResistance.ts fix
    const validSupport = support.filter(s => s < currentPrice * 0.99);
    const validResistance = resistance.filter(r => r > currentPrice * 1.01);

    const nearestSupport = validSupport.length > 0 ? validSupport[0] : currentPrice * 0.95;
    const nearestResistance = validResistance.length > 0 ? validResistance[0] : currentPrice * 1.05;

    const risk = Math.abs(currentPrice - nearestSupport);
    const reward = Math.abs(nearestResistance - currentPrice);
    const rrRatio = risk > 0 ? reward / risk : 0;

    if (rrRatio >= 3) {
      score += 12;
      reasons.push(`Excellent R/R ratio: ${rrRatio.toFixed(1)}:1`);
    } else if (rrRatio >= 2) {
      score += 9;
      reasons.push(`Good R/R ratio: ${rrRatio.toFixed(1)}:1`);
    } else if (rrRatio >= 1.5) {
      score += 6;
      reasons.push(`Acceptable R/R ratio: ${rrRatio.toFixed(1)}:1`);
    } else if (rrRatio >= 1) {
      score += 3;
      reasons.push(`Marginal R/R ratio: ${rrRatio.toFixed(1)}:1`);
    } else {
      reasons.push(`Poor R/R ratio: ${rrRatio.toFixed(1)}:1`);
    }

    const passed = score >= maxPoints * 0.5; // 6+ to pass

    return {
      name: 'Risk/Reward Ratio',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }

  /** Factor 5: Catalyst Presence (12 pts) */
  private static scoreCatalystPresence(newsData: NewsItem[]): M2MScoreFactor {
    const maxPoints = 12;
    let score = 0;
    const reasons: string[] = [];

    if (newsData.length === 0) {
      score = 4;
      reasons.push('No recent news — neutral catalyst environment');
    } else {
      const sentiment = analyzeSentiment(newsData);

      if (sentiment === 'Positive') {
        score = 12;
        reasons.push('Positive news sentiment provides catalyst support');
      } else if (sentiment === 'Neutral') {
        score = 6;
        reasons.push('Neutral news sentiment — no catalyst headwind or tailwind');
      } else {
        score = 1;
        reasons.push('Negative news sentiment presents catalyst headwind');
      }
    }

    const passed = score >= maxPoints * 0.5; // 6+ to pass

    return {
      name: 'Catalyst Presence',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }

  /**
   * Factor 6: Money Flow / CMF (8 pts)
   *
   * CMF(20) measures institutional accumulation/distribution pressure.
   * It is a confirming factor — strong standalone signals are rare,
   * but it validates or undermines the directional thesis from other factors.
   *
   * Thresholds (asymmetric — bearish penalised more sharply):
   *   > +0.20  = 8pts  (strong accumulation)
   *   +0.10 to +0.20 = 6pts  (moderate accumulation)
   *   +0.02 to +0.10 = 4pts  (mild positive flow)
   *   -0.05 to +0.02 = 3pts  (near-zero / indeterminate)
   *   -0.15 to -0.05 = 1pt   (mild distribution)
   *   < -0.15        = 0pts  (significant distribution)
   */
  private static scoreMoneyFlow(cmf: number): M2MScoreFactor {
    const maxPoints = 8;
    let score = 0;
    const reasons: string[] = [];

    if (cmf > 0.20) {
      score = 8;
      reasons.push(`Strong accumulation — CMF: ${cmf.toFixed(3)}`);
    } else if (cmf > 0.10) {
      score = 6;
      reasons.push(`Moderate accumulation — CMF: ${cmf.toFixed(3)}`);
    } else if (cmf > 0.02) {
      score = 4;
      reasons.push(`Mild positive flow — CMF: ${cmf.toFixed(3)}`);
    } else if (cmf > -0.05) {
      score = 3;
      reasons.push(`Near-zero flow — CMF: ${cmf.toFixed(3)}`);
    } else if (cmf > -0.15) {
      score = 1;
      reasons.push(`Mild distribution pressure — CMF: ${cmf.toFixed(3)}`);
    } else {
      score = 0;
      reasons.push(`Significant distribution — CMF: ${cmf.toFixed(3)}`);
    }

    const passed = score >= maxPoints * 0.5; // 4+ to pass

    return {
      name: 'Money Flow',
      maxPoints,
      score,
      passed,
      rationale: reasons.join('; '),
    };
  }
}
