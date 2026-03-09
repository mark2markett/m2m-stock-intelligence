import type { M2MScorecard, TechnicalIndicators } from '@/lib/types';

export interface QualityAssessment {
  setupQuality: 'high' | 'moderate' | 'low';
  signalConfidence: number;
  earlyStage: boolean;
  catalystPresent: boolean;
}

// ---------------------------------------------------------------------------
// Helper: look up a factor by name instead of by array index.
// This makes the code resilient to factor reordering and new factor additions.
// ---------------------------------------------------------------------------
function getFactorByName(scorecard: M2MScorecard, name: string) {
  const factor = scorecard.factors.find(f => f.name === name);
  if (!factor) {
    // Graceful fallback: return a neutral non-passing placeholder
    return { name, maxPoints: 0, score: 0, passed: false, rationale: 'Factor not found' };
  }
  return factor;
}

/**
 * Adjusted scoring that removes the Options factor contribution when options
 * data is unavailable (scanner mode).
 *
 * When hasOptionsData is false, the Options Quality factor returns a neutral
 * 14/28 (50%). We strip it from both the numerator and denominator so the
 * adjusted percentage reflects the 5 real factors that were actually scored.
 *
 * Adjusted max without options = 72 (22 + 18 + 12 + 12 + 8), real factors = 5.
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

  const optionsFactor = getFactorByName(scorecard, 'Options Quality');
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
 *   - Signal Strength passes    (>= 50% of 22pts = 11+)
 *   - Technical Structure passes (>= 50% of 18pts = 9+)
 *   - Risk/Reward passes         (>= 50% of 12pts = 6+, i.e. R/R >= 1.5:1)
 *   - Adjusted score >= 70%
 *   - 3+ real factors pass
 *
 * MODERATE requires ALL of:
 *   - Adjusted score >= 45%
 *   - 2+ real factors pass
 *
 * LOW: everything else.
 */
function computeSetupQuality(scorecard: M2MScorecard, hasOptionsData: boolean): 'high' | 'moderate' | 'low' {
  const { adjustedPct, realFactorsPassed } = getAdjustedScoring(scorecard, hasOptionsData);

  const signalStrengthPasses = getFactorByName(scorecard, 'Strategy Signal Strength').passed;
  const techStructurePasses  = getFactorByName(scorecard, 'Technical Structure').passed;
  const riskRewardPasses     = getFactorByName(scorecard, 'Risk/Reward Ratio').passed;

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
 * Confidence score (0–100) measuring signal clarity and assessment reliability.
 *
 * Five continuous dimensions:
 * 1. Directional Consensus (30%): Do 5 independent signals agree?
 * 2. Trend Strength (25%):        Continuous ADX scale (0→0, 25→50, 50+→100)
 * 3. Momentum Confirmation (20%): Do momentum sub-indicators confirm?
 * 4. Score Conviction (15%):      How far is adjusted score from ambiguity (50%)?
 * 5. Data Completeness (10%):     100 with options data, 80 without
 *
 * CMF threshold uses > 0.10 (calibrated to match the new scoring tier boundary
 * for "moderate accumulation") rather than the naive > 0 from the old system.
 */
function computeConfidence(scorecard: M2MScorecard, indicators: TechnicalIndicators, hasOptionsData: boolean): number {
  // 1. Directional Consensus (30%)
  const signals = [
    indicators.ema20 > indicators.ema50,
    indicators.macd.macd > indicators.macd.signal,
    indicators.rsi > 50,
    indicators.cmf > 0.10,   // updated: matches moderate accumulation threshold
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
 * @param scorecard      - M2M scorecard from TradeSetupAnalyzer
 * @param indicators     - Technical indicators
 * @param setupStage     - Current setup stage
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
    catalystPresent: getFactorByName(scorecard, 'Catalyst Presence').passed,
  };
}
