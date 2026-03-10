import type { OptionsData, OptionContract, M2MScorecard } from '@/lib/types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === 'your_anthropic_api_key_here') {
    throw new Error('Anthropic API key not configured.');
  }
  return key;
}

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 3000
): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid response from Anthropic API');
  }

  return data.content[0].text;
}

export class ClaudeService {

  // ─── ANALYSIS REPORT ──────────────────────────────────────────────────────

  static async generateAnalysisReport(
    symbol: string,
    stockData: any,
    indicators: any,
    support: number[],
    resistance: number[],
    sentimentData: string,
    volatilityRegime: string,
    setupStage: string,
    lifecycleRationale: string,
    rsiInterpretation: any,
    optionsData: OptionsData | null,
    scorecard: M2MScorecard,
    setupQuality: 'high' | 'moderate' | 'low',
    signalConfidence: number,
    dominantTrend: 'bullish' | 'bearish' | 'neutral'
  ): Promise<string> {
    const systemPrompt = `You are an institutional-grade technical analyst for the M2M Stock Intelligence platform. Generate deep, data-driven analysis for educational purposes.

LANGUAGE RULES:
- ALLOWED: "the data suggests an entry zone near $X", "logical stop placement at $Y based on ATR/support", "indicators point to", "historical patterns show", "the setup implies"
- FORBIDDEN: "you should buy/sell", "we recommend", "take a position", "consider buying/selling", "investors should"
- Frame all analysis as educational observation of what the data shows, not personal investment advice.

When a trade setup exists, provide a structured educational trade framework with specific levels derived from the data. When no setup exists, explain what conditions would need to develop.`;

    const userPrompt = this.buildAnalysisPrompt(
      symbol, stockData, indicators, support, resistance,
      sentimentData, volatilityRegime, setupStage, lifecycleRationale,
      rsiInterpretation, optionsData, scorecard, setupQuality,
      signalConfidence, dominantTrend
    );

    return callClaude(systemPrompt, userPrompt, 3000);
  }

  // ─── SCANNER INSIGHT ──────────────────────────────────────────────────────

  static async generateScannerInsight(data: {
    symbol: string;
    price: number;
    change: number;
    rsi: number;
    macd: number;
    signal: number;
    histogram: number;
    ema20: number;
    ema50: number;
    adx: number;
    atr: number;
    bbLower: number;
    bbUpper: number;
    stochK: number;
    stochD: number;
    cmf: number;
    support: number[];
    resistance: number[];
    setupStage: string;
    volatilityRegime: string;
    score: number;
    maxScore: number;
    factorsPassed: number;
    totalFactors: number;
    publishable: boolean;
    sentiment: string;
  }): Promise<{
    keySignal: string;
    risk: string;
    summary: string;
  }> {
    const supportStr = data.support.slice(0, 3).map(s => '$' + s.toFixed(2)).join(', ') || 'none';
    const resistStr = data.resistance.slice(0, 3).map(r => '$' + r.toFixed(2)).join(', ') || 'none';

    const systemPrompt = `You are a quantitative setup scanner for the M2M Stock Intelligence platform. Your task: identify the single most important signal and primary risk for a stock setup. Use observational educational language — never advisory language.

CRITICAL: Return ONLY a valid JSON object with exactly these 3 fields — no preamble, no explanation, no markdown fences:
{"keySignal": "...", "risk": "...", "summary": "..."}`;

    const userPrompt = `Summarize the setup for ${data.symbol} at $${data.price.toFixed(2)} (${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%):

INDICATORS: RSI ${data.rsi.toFixed(1)} | MACD ${data.macd.toFixed(3)} vs Sig ${data.signal.toFixed(3)} (Hist: ${data.histogram.toFixed(3)}) | EMA20 $${data.ema20.toFixed(2)} EMA50 $${data.ema50.toFixed(2)} | ADX ${data.adx.toFixed(1)} | ATR $${data.atr.toFixed(2)} | BB ${data.bbLower.toFixed(2)}-${data.bbUpper.toFixed(2)} | Stoch K${data.stochK.toFixed(1)} D${data.stochD.toFixed(1)} | CMF ${data.cmf.toFixed(3)}
STRUCTURE: Support ${supportStr} | Resistance ${resistStr} | Stage: ${data.setupStage} | Vol Regime: ${data.volatilityRegime}
SCORECARD: ${data.score}/${data.maxScore} (${data.factorsPassed}/${data.totalFactors} factors) | Publishable: ${data.publishable ? 'yes' : 'no'}
SENTIMENT: ${data.sentiment}

Return JSON with exactly these 3 fields:
{
  "keySignal": "the single most important technical signal right now (max 80 chars)",
  "risk": "the primary risk to this setup (max 80 chars)",
  "summary": "2-3 sentence educational assessment of what the indicators show (max 250 chars)"
}`;

    const raw = await callClaude(systemPrompt, userPrompt, 400);

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      keySignal: String(parsed.keySignal || '').slice(0, 80),
      risk: String(parsed.risk || '').slice(0, 80),
      summary: String(parsed.summary || '').slice(0, 250),
    };
  }

  // ─── OPTIMAL TRADE ────────────────────────────────────────────────────────

  static async generateOptimalTrade(data: {
    symbol: string;
    price: number;
    changePercent: number;
    indicators: any;
    support: number[];
    resistance: number[];
    optionsData: OptionsData | null;
    scorecard: M2MScorecard;
    setupQuality: 'high' | 'moderate' | 'low';
    signalConfidence: number;
    dominantTrend: 'bullish' | 'bearish' | 'neutral';
    setupStage: string;
    volatilityRegime: string;
    atr: number;
  }): Promise<any> {
    const supportStr = data.support.slice(0, 3).map(s => '$' + s.toFixed(2)).join(', ') || 'none';
    const resistStr = data.resistance.slice(0, 3).map(r => '$' + r.toFixed(2)).join(', ') || 'none';

    let contractsBlock = '';
    if (data.optionsData?.topContracts && data.optionsData.topContracts.length > 0) {
      const formatContract = (c: OptionContract) =>
        `  ${c.contractType.toUpperCase()} $${c.strikePrice} exp ${c.expirationDate} (${c.daysToExpiry}d) | Bid $${c.bid.toFixed(2)} Ask $${c.ask.toFixed(2)} Mid $${c.midpoint.toFixed(2)} | Vol ${c.volume} OI ${c.openInterest} | IV ${(c.impliedVolatility * 100).toFixed(1)}% | Delta ${c.delta.toFixed(3)} Theta ${c.theta.toFixed(3)} Gamma ${c.gamma.toFixed(4)} Vega ${c.vega.toFixed(3)}`;

      const calls = data.optionsData.topContracts.filter(c => c.contractType === 'call');
      const puts = data.optionsData.topContracts.filter(c => c.contractType === 'put');

      contractsBlock = `
AVAILABLE OPTION CONTRACTS (real-time, sorted by liquidity):

CALLS (${calls.length} most liquid):
${calls.map(formatContract).join('\n')}

PUTS (${puts.length} most liquid):
${puts.map(formatContract).join('\n')}

OPTIONS AGGREGATE:
- Put/Call Ratio: ${data.optionsData.putCallRatio.toFixed(2)}
- Call Volume: ${data.optionsData.totalCallVolume.toLocaleString()} | Put Volume: ${data.optionsData.totalPutVolume.toLocaleString()}
- Call OI: ${data.optionsData.totalCallOI.toLocaleString()} | Put OI: ${data.optionsData.totalPutOI.toLocaleString()}
- Avg IV: ${(data.optionsData.avgImpliedVolatility * 100).toFixed(1)}% | Near-Money IV: ${(data.optionsData.nearMoneyIV * 100).toFixed(1)}%
- Active Contracts: ${data.optionsData.contractCount}
`;
    } else if (data.optionsData) {
      contractsBlock = `
OPTIONS AGGREGATE (no individual contract data available):
- Put/Call Ratio: ${data.optionsData.putCallRatio.toFixed(2)}
- Avg IV: ${(data.optionsData.avgImpliedVolatility * 100).toFixed(1)}%
- Near-Money IV: ${(data.optionsData.nearMoneyIV * 100).toFixed(1)}%
`;
    }

    const hasSetup = data.setupQuality !== 'low';

    const systemPrompt = `You are an institutional-grade trade structuring analyst for the M2M Stock Intelligence platform.

CRITICAL: Return ONLY a valid JSON object — no preamble, no explanation, no markdown fences.

LANGUAGE RULES: Use educational language throughout — "the data suggests", "historical patterns indicate", never "you should" or "we recommend".

R/R RATIO CALCULATION RULE: The riskRewardRatio field MUST be calculated arithmetically from your actual entryZone, stopLoss, and target1 values. Formula: (target1 - entry) / (entry - stopLoss) for longs, or (entry - target1) / (stopLoss - entry) for shorts. Express as a decimal rounded to 1 place followed by ":1". Example: entry $150.00, stop $145.00, target1 $162.00 → risk = $5.00, reward = $12.00, ratio = 2.4:1. Do NOT use placeholder text.`;

    const userPrompt = `Determine the OPTIMAL TRADE for ${data.symbol}.

STOCK: ${data.symbol} at $${data.price.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)

TECHNICAL CONTEXT:
- RSI(14): ${data.indicators.rsi.toFixed(1)}
- MACD: ${data.indicators.macd.macd.toFixed(3)} vs Signal ${data.indicators.macd.signal.toFixed(3)} (Hist: ${data.indicators.macd.histogram.toFixed(3)})
- EMA20: $${data.indicators.ema20.toFixed(2)} | EMA50: $${data.indicators.ema50.toFixed(2)}
- ATR(14): $${data.atr.toFixed(2)}
- ADX: ${data.indicators.adx.toFixed(1)}
- Bollinger: $${data.indicators.bollingerBands.lower.toFixed(2)} / $${data.indicators.bollingerBands.middle.toFixed(2)} / $${data.indicators.bollingerBands.upper.toFixed(2)}
- Stochastic: K ${data.indicators.stochastic.k.toFixed(1)} D ${data.indicators.stochastic.d.toFixed(1)}
- CMF: ${data.indicators.cmf.toFixed(3)}
- Support: ${supportStr} | Resistance: ${resistStr}

SETUP ASSESSMENT:
- Setup Quality: ${data.setupQuality.toUpperCase()}
- Signal Confidence: ${data.signalConfidence}/100
- Dominant Trend: ${data.dominantTrend.toUpperCase()}
- Setup Stage: ${data.setupStage}
- Volatility Regime: ${data.volatilityRegime}
- M2M Score: ${data.scorecard.totalScore}/${data.scorecard.maxScore} (${data.scorecard.factorsPassed}/${data.scorecard.totalFactors} factors passed)
- Publishable: ${data.scorecard.publishable ? 'YES' : 'NO'}
${contractsBlock}
${hasSetup ? `TASK: A ${data.setupQuality.toUpperCase()} quality ${data.dominantTrend} setup has been identified. Determine the optimal trade — either a stock position OR an options strategy — based on:

1. IV ENVIRONMENT: If IV is elevated (near-money IV > 40%), favor strategies that SELL premium (credit spreads, iron condors). If IV is low (< 25%), favor strategies that BUY premium (long calls/puts, debit spreads). Moderate IV allows either.

2. OPTIONS LIQUIDITY: Only recommend options if contracts have adequate volume (>50) and open interest (>100) with tight bid-ask spreads. If options are illiquid, recommend the stock trade.

3. STRATEGY SELECTION — choose the SINGLE best strategy:
   - Stock: Simple long or short position
   - Long Call/Put: Directional bet with defined risk
   - Vertical Spread (bull call, bear put): Defined risk + reduced cost basis
   - Credit Spread (bull put, bear call): Sell premium when IV is high
   - Calendar Spread: When expecting consolidation before a move
   - Iron Condor: When expecting range-bound action with high IV

4. CONTRACT SELECTION: When recommending options, reference SPECIFIC contracts from the available data above — use actual strikes, expirations, bid/ask prices.

5. RISK PARAMETERS: Use ATR(14) of $${data.atr.toFixed(2)} for stop placement. Use support/resistance for targets.` : `TASK: Setup quality is LOW — no high-confidence trade exists. Identify SPECIFIC conditions that would need to develop for a quality setup to appear.`}

Return ONLY a JSON object with EXACTLY these fields:
{
  "hasSetup": ${hasSetup},
  "vehicle": "stock" or "options",
  "direction": "bullish" or "bearish" or "neutral",
  "strategy": "name of strategy",
  "reasoning": "2-3 sentences explaining WHY this is the optimal structure",
  "entryZone": "specific price or price range",
  "stopLoss": "specific price level with reasoning",
  "target1": "conservative target price level",
  "target2": "extended target price level",
  "riskRewardRatio": "CALCULATE from your entryZone/stopLoss/target1 — e.g. '2.4:1'",
  "positionSizing": "educational note about position sizing relative to portfolio risk",
  "legs": [${hasSetup && data.optionsData?.topContracts ? `
    {
      "contractType": "call" or "put",
      "strikePrice": number,
      "expirationDate": "YYYY-MM-DD",
      "action": "buy" or "sell",
      "estimatedPrice": midpoint from data,
      "delta": delta value,
      "reasoning": "why this specific contract"
    }
  ` : ''}],
  "maxRisk": "maximum dollar risk per contract/share with explanation",
  "maxReward": "maximum reward potential with explanation",
  "ivEnvironment": "description of current IV context and how it influenced strategy choice",
  "timeHorizon": "expected holding period based on setup stage",
  "conditionsNeeded": ${!hasSetup ? '["condition 1", "condition 2", "condition 3"]' : 'null'},
  "educationalDisclaimer": "This analysis is for educational purposes only. It represents what the technical data suggests, not investment advice. All trading involves risk of loss."
}

${!hasSetup ? 'For the LOW quality scenario: set vehicle to "stock", direction to "neutral", strategy to "No Trade - Monitoring", and populate conditionsNeeded with 3-6 SPECIFIC conditions referencing actual indicator values.' : ''}

REMINDER: riskRewardRatio must be arithmetically derived from your actual price levels, not a placeholder.`;

    const raw = await callClaude(systemPrompt, userPrompt, 2000);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      hasSetup: Boolean(parsed.hasSetup),
      vehicle: parsed.vehicle === 'options' ? 'options' : 'stock',
      direction: parsed.direction || 'neutral',
      strategy: String(parsed.strategy || 'No Trade'),
      reasoning: String(parsed.reasoning || ''),
      entryZone: String(parsed.entryZone || ''),
      stopLoss: String(parsed.stopLoss || ''),
      target1: String(parsed.target1 || ''),
      target2: String(parsed.target2 || ''),
      riskRewardRatio: String(parsed.riskRewardRatio || ''),
      positionSizing: String(parsed.positionSizing || ''),
      legs: Array.isArray(parsed.legs) ? parsed.legs.map((leg: any) => ({
        contractType: leg.contractType === 'put' ? 'put' : 'call',
        strikePrice: Number(leg.strikePrice) || 0,
        expirationDate: String(leg.expirationDate || ''),
        action: leg.action === 'sell' ? 'sell' : 'buy',
        estimatedPrice: Number(leg.estimatedPrice) || 0,
        delta: Number(leg.delta) || 0,
        reasoning: String(leg.reasoning || ''),
      })) : [],
      maxRisk: String(parsed.maxRisk || ''),
      maxReward: String(parsed.maxReward || ''),
      ivEnvironment: String(parsed.ivEnvironment || ''),
      timeHorizon: String(parsed.timeHorizon || ''),
      conditionsNeeded: Array.isArray(parsed.conditionsNeeded) ? parsed.conditionsNeeded.map(String) : undefined,
      educationalDisclaimer: String(parsed.educationalDisclaimer || 'This analysis is for educational purposes only. All trading involves risk of loss.'),
    };
  }

  // ─── ANALYSIS PROMPT BUILDER ──────────────────────────────────────────────

  private static buildAnalysisPrompt(
    symbol: string,
    stockData: any,
    indicators: any,
    support: number[],
    resistance: number[],
    sentimentData: string,
    volatilityRegime: string,
    setupStage: string,
    lifecycleRationale: string,
    rsiInterpretation: any,
    optionsData: OptionsData | null,
    scorecard: M2MScorecard,
    setupQuality: 'high' | 'moderate' | 'low',
    signalConfidence: number,
    dominantTrend: 'bullish' | 'bearish' | 'neutral'
  ): string {
    const supportStr = support.slice(0, 3).map(s => '$' + s.toFixed(2)).join(', ') || 'N/A';
    const resistStr = resistance.slice(0, 3).map(r => '$' + r.toFixed(2)).join(', ') || 'N/A';

    const scorecardDetails = scorecard.factors.map(f =>
      `  - ${f.name}: ${f.score}/${f.maxPoints} (${f.passed ? 'PASS' : 'FAIL'}) — ${f.rationale}`
    ).join('\n');

    let optionsBlock = '';
    if (optionsData) {
      optionsBlock = `
OPTIONS FLOW:
- Put/Call Ratio: ${optionsData.putCallRatio.toFixed(2)}
- Call Volume: ${optionsData.totalCallVolume.toLocaleString()} | Put Volume: ${optionsData.totalPutVolume.toLocaleString()}
- Call OI: ${optionsData.totalCallOI.toLocaleString()} | Put OI: ${optionsData.totalPutOI.toLocaleString()}
- Avg Implied Volatility: ${(optionsData.avgImpliedVolatility * 100).toFixed(1)}%
- Near-Money IV: ${(optionsData.nearMoneyIV * 100).toFixed(1)}%
- Active Contracts: ${optionsData.contractCount}
`;
    }

    const rsiZone = rsiInterpretation.zone || (indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'neutral');
    const marketCap = stockData.marketCap ? `$${(stockData.marketCap / 1e9).toFixed(1)}B` : 'N/A';
    const pe = stockData.pe ? stockData.pe.toFixed(1) : 'N/A';

    return `Generate an institutional-grade technical analysis report for ${symbol} using ALL of the following data:

STOCK DATA:
- Price: $${stockData.price.toFixed(2)}
- Change: ${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%
- Volume: ${stockData.volume.toLocaleString()}
- Market Cap: ${marketCap}
- P/E Ratio: ${pe}

TECHNICAL INDICATORS (all 9):
- RSI(14): ${indicators.rsi.toFixed(1)} — Zone: ${rsiZone}
- MACD: Line ${indicators.macd.macd.toFixed(3)} | Signal ${indicators.macd.signal.toFixed(3)} | Histogram ${indicators.macd.histogram.toFixed(3)}
- EMA20: $${indicators.ema20.toFixed(2)} | EMA50: $${indicators.ema50.toFixed(2)} | Alignment: ${indicators.ema20 > indicators.ema50 ? 'Bullish (EMA20 > EMA50)' : 'Bearish (EMA20 < EMA50)'}
- ATR(14): $${indicators.atr.toFixed(2)}
- ADX(14): ${indicators.adx.toFixed(1)} — Trend Strength: ${indicators.adx > 40 ? 'Very Strong' : indicators.adx > 25 ? 'Strong' : indicators.adx > 20 ? 'Moderate' : 'Weak'}
- Bollinger Bands: Lower $${indicators.bollingerBands.lower.toFixed(2)} | Middle $${indicators.bollingerBands.middle.toFixed(2)} | Upper $${indicators.bollingerBands.upper.toFixed(2)}
- Stochastic: K ${indicators.stochastic.k.toFixed(1)} | D ${indicators.stochastic.d.toFixed(1)}
- CMF(20): ${indicators.cmf.toFixed(3)} — ${indicators.cmf > 0.1 ? 'Accumulation' : indicators.cmf < -0.1 ? 'Distribution' : 'Neutral Flow'}

SUPPORT/RESISTANCE:
- Support Levels: ${supportStr}
- Resistance Levels: ${resistStr}
${optionsBlock}
M2M SCORECARD (${scorecard.totalScore}/${scorecard.maxScore} — ${scorecard.factorsPassed}/${scorecard.totalFactors} factors passed):
${scorecardDetails}
- Publication Threshold: ${scorecard.meetsPublicationThreshold ? 'MET' : 'NOT MET'}
- Multi-Factor Rule: ${scorecard.meetsMultiFactorRule ? 'MET' : 'NOT MET'}

QUALITY ASSESSMENT:
- Setup Quality: ${setupQuality.toUpperCase()}
- Signal Confidence: ${signalConfidence}/100
- Dominant Trend: ${dominantTrend.toUpperCase()}

SETUP CONTEXT:
- Setup Stage: ${setupStage}
- Lifecycle: ${lifecycleRationale}
- Volatility Regime: ${volatilityRegime}

NEWS SENTIMENT:
${sentimentData}

Provide the analysis with exactly these sections (use **N. Section Name** format):

**1. Technical Indicator Analysis** — Interpret RSI zone, MACD crossover state, Stochastic K/D positioning, CMF reading, and ADX strength. Reference specific values.

**2. Trend and Momentum Assessment** — Assess EMA20/EMA50 alignment, price position relative to EMAs, ADX directional strength, and overall momentum consensus.

**3. Support and Resistance Analysis** — Analyze proximity to key support/resistance levels, historical strength of these levels, and their implications for price action.

**4. Options Flow Analysis** — ${optionsData ? 'Interpret the P/C ratio, IV levels (avg vs near-money), and call/put OI balance for institutional positioning signals.' : 'Options data unavailable for this stock. Skip this section entirely.'}

**5. Volume and Money Flow Analysis** — Assess CMF reading, volume trends relative to price action, and accumulation/distribution patterns.

**6. Risk Assessment and Volatility** — Evaluate ATR-based risk parameters, Bollinger Band width and positioning, and the current volatility regime implications.

**7. Setup Quality and Timing** — Interpret the M2M Scorecard results: which factors passed/failed, overall quality tier (${setupQuality}), confidence level (${signalConfidence}/100), and setup stage (${setupStage}).

**8. Trade Plan** — ${setupQuality === 'low'
  ? 'Setup quality is LOW. Do NOT provide entry/stop/target levels. Instead, explain specifically what indicator conditions or price action would need to change for a tradeable setup to develop.'
  : `Setup quality is ${setupQuality.toUpperCase()} with ${dominantTrend.toUpperCase()} bias. Provide an educational trade framework:
   - Direction: ${dominantTrend === 'neutral' ? 'Determine from indicator weight' : dominantTrend}
   - Entry Zone: derive from current price action and nearest support/resistance
   - Stop Loss: ATR-based or key level breach, with reasoning for the level
   - Target 1 (conservative): nearest resistance (bullish) or support (bearish)
   - Target 2 (extended): next level beyond Target 1
   - Risk/Reward Ratio: calculate arithmetically from entry, stop, and Target 1
   - Position Sizing Note: reference 1-2% portfolio risk framework
   Frame as "the data suggests" and "logical placement based on", never as advice.`}

**9. Educational Summary** — Synthesize the key takeaway: what the confluence of indicators shows, what to watch for next, and what conditions would confirm or invalidate the current setup.

Each section should provide specific, data-driven insights referencing the actual numbers provided. Be precise with price levels and indicator values. Do NOT pad with generic disclaimers.

IMPORTANT: Format each section exactly as **N. Section Name** followed by content on new lines. ${!optionsData ? 'Omit section 4 entirely (skip from 3 to 5).' : ''}`;
  }
}
