import type { M2MScorecard, TechnicalIndicators } from '@/lib/types';

export interface QualityAssessment {
  setupQuality: 'high' | 'moderate' | 'low';
  signalConfidence: number;
  earlyStage: boolean;
  catalystPresent: boolean;
}

/**
 * Adjusted scoring that removes the options factor inflation when options data is missing.
 *
 * Factor 3 (Options Quality) returns 13/25 with passed=true when no options data
 * is available. This inflates every stock's score by 13 and gives a free factor pass.
 * When hasOptionsData is true, we use the full score as-is.
 *
 * Adjusted max without options = 75 (30 + 25 + 10 + 10), real factors = 4.
 */
export function getAdjustedScoring(scorecard: M2MScorecard, hasOptionsData: boolean) {
  if (hasOptionsData) {
    const pct = scorecard.maxScore > 0 ? (scorecard.totalScore / scorecard.maxScore) * 100 : 0;
    return {
      adjustedScore: scorecard.totalScore,
      adjustedMax: scorecard.maxScore,
      adjustedPct: pct,
      realFactorsPassed: scorecard.factorsPassed,
    };
  }

  const optionsFactor = scorecard.factors[2]; // Factor 3: Options Quality
  const adjustedScore = scorecard.totalScore - optionsFactor.score;
  const adjustedMax = scorecard.maxScore - optionsFactor.maxPoints;
  const adjustedPct = adjustedMax > 0 ? (adjustedScore / adjustedMax) * 100 : 0;
  const realFactorsPassed = scorecard.factorsPassed - (optionsFactor.passed ? 1 : 0);
  return { adjustedScore, adjustedMax, adjustedPct, realFactorsPassed };
}

/**
 * Gate-based setup quality — institutional-grade assessment.
 *
 * A single composite score lets one strong dimension hide a weak one.
 * Gate-based quality requires each critical dimension to independently
 * meet a minimum bar before the composite applies.
 *
 * HIGH requires ALL of:
 *   - Factor 1 (Signal Strength) passes   (>= 15/30)
 *   - Factor 2 (Technical Structure) passes (>= 13/25)
 *   - Factor 4 (Risk/Reward) passes        (>= 5/10, i.e. R/R >= 1.5:1)
 *   - Adjusted score >= 70%
 *   - 3+ real factors pass
 *
 * MODERATE requires ALL of:
 *   - Adjusted score >= 45%
 *   - 2+ real factors pass
 *
 * LOW: everything else.
 *
 * Factor indices: 0=SignalStrength, 1=TechStructure, 2=Options, 3=R/R, 4=Catalyst
 */
function computeSetupQuality(scorecard: M2MScorecard, hasOptionsData: boolean): 'high' | 'moderate' | 'low' {
  const { adjustedPct, realFactorsPassed } = getAdjustedScoring(scorecard, hasOptionsData);

  const signalStrengthPasses = scorecard.factors[0].passed;
  const techStructurePasses = scorecard.factors[1].passed;
  const riskRewardPasses = scorecard.factors[3].passed;

  if (
    signalStrengthPasses &&
    techStructurePasses &&
    riskRewardPasses &&
    adjustedPct >= 70 &&
    realFactorsPassed >= 3
  ) {
    return 'high';
  }

  if (adjustedPct >= 45 && realFactorsPassed >= 2) {
    return 'moderate';
  }

  return 'low';
}

/**
 * Confidence score (0-100) measuring signal clarity and assessment reliability.
 *
 * Five continuous dimensions:
 * 1. Directional Consensus (30%): Do 5 independent signals agree?
 * 2. Trend Strength (25%): Continuous ADX scale (0->0, 25->50, 50+->100)
 * 3. Momentum Confirmation (20%): Do momentum sub-indicators confirm?
 * 4. Score Conviction (15%): How far is adjusted score from ambiguity (50%)?
 * 5. Data Completeness (10%): 100 with options data, 80 without
 */
function computeConfidence(scorecard: M2MScorecard, indicators: TechnicalIndicators, hasOptionsData: boolean): number {
  // 1. Directional Consensus (30%)
  const signals = [
    indicators.ema20 > indicators.ema50,
    indicators.macd.macd > indicators.macd.signal,
    indicators.rsi > 50,
    indicators.cmf > 0,
    indicators.stochastic.k > indicators.stochastic.d,
  ];
  const bullishCount = signals.filter(Boolean).length;
  const consensusRaw = Math.abs(bullishCount - 2.5) / 2.5;
  const consensusScore = consensusRaw * 100;

  // 2. Trend Strength (25%)
  const adxScore = Math.min(indicators.adx / 50, 1) * 100;

  // 3. Momentum Confirmation (20%)
  const histConfirms =
    (indicators.macd.macd > 0 && indicators.macd.histogram > 0) ||
    (indicators.macd.macd < 0 && indicators.macd.histogram < 0);
  const rsiHealthy = indicators.rsi > 30 && indicators.rsi < 70;
  const stochHealthy = indicators.stochastic.k > 20 && indicators.stochastic.k < 80;
  const momentumScore = (histConfirms ? 40 : 0) + (rsiHealthy ? 30 : 0) + (stochHealthy ? 30 : 0);

  // 4. Score Conviction (15%)
  const { adjustedPct } = getAdjustedScoring(scorecard, hasOptionsData);
  const convictionScore = (Math.abs(adjustedPct - 50) / 50) * 100;

  // 5. Data Completeness (10%)
  const completenessScore = hasOptionsData ? 100 : 80;

  return Math.round(
    consensusScore * 0.30 +
    adxScore * 0.25 +
    momentumScore * 0.20 +
    convictionScore * 0.15 +
    completenessScore * 0.10
  );
}

/**
 * Unified quality assessment for both single-stock analysis and scanner.
 *
 * @param scorecard - M2M scorecard from TradeSetupAnalyzer
 * @param indicators - Technical indicators
 * @param setupStage - Current setup stage
 * @param hasOptionsData - true for single-stock (full data), false for scanner
 */
export function assessQuality(
  scorecard: M2MScorecard,
  indicators: TechnicalIndicators,
  setupStage: string,
  hasOptionsData: boolean
): QualityAssessment {
  return {
    setupQuality: computeSetupQuality(scorecard, hasOptionsData),
    signalConfidence: computeConfidence(scorecard, indicators, hasOptionsData),
    earlyStage: setupStage === 'Setup Forming' || setupStage === 'Just Triggered',
    catalystPresent: scorecard.factors[4].passed,
  };
}
