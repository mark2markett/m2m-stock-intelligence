import 'server-only';
import type { OptionsData, M2MScorecard } from '@/lib/types';

export class OpenAIService {
  private static readonly API_URL = 'https://api.openai.com/v1/chat/completions';

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
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured.');
    }

    const prompt = this.buildAnalysisPrompt(
      symbol,
      stockData,
      indicators,
      support,
      resistance,
      sentimentData,
      volatilityRegime,
      setupStage,
      lifecycleRationale,
      rsiInterpretation,
      optionsData,
      scorecard,
      setupQuality,
      signalConfidence,
      dominantTrend
    );

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an institutional-grade technical analyst for the M2M Stock Intelligence platform. Generate deep, data-driven analysis for educational purposes.

LANGUAGE RULES:
- ALLOWED: "the data suggests an entry zone near $X", "logical stop placement at $Y based on ATR/support", "indicators point to", "historical patterns show", "the setup implies"
- FORBIDDEN: "you should buy/sell", "we recommend", "take a position", "consider buying/selling", "investors should"
- Frame all analysis as educational observation of what the data shows, not personal investment advice.

When a trade setup exists, provide a structured educational trade framework with specific levels derived from the data. When no setup exists, explain what conditions would need to develop.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
  }

  /**
   * Scanner AI — narrative-only insight for a scanned stock.
   * Quality, confidence, earlyStage, and catalystPresent are computed
   * algorithmically in scannerEngine.ts. The AI provides only the
   * narrative fields that require contextual interpretation.
   */
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
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured.');
    }

    const supportStr = data.support.slice(0, 3).map(s => '$' + s.toFixed(2)).join(', ') || 'none';
    const resistStr = data.resistance.slice(0, 3).map(r => '$' + r.toFixed(2)).join(', ') || 'none';

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

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a quantitative setup scanner for the M2M Stock Intelligence platform. Your task: identify the single most important signal and primary risk for a stock setup. Use observational educational language — never advisory language. Return ONLY valid JSON with keySignal, risk, and summary fields.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const parsed = JSON.parse(responseData.choices[0].message.content);

    return {
      keySignal: String(parsed.keySignal || '').slice(0, 80),
      risk: String(parsed.risk || '').slice(0, 80),
      summary: String(parsed.summary || '').slice(0, 250),
    };
  }

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

    const marketCap = stockData.marketCap
      ? `$${(stockData.marketCap / 1e9).toFixed(1)}B`
      : 'N/A';
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
   - Risk/Reward Ratio: calculate from entry, stop, and Target 1
   - Position Sizing Note: reference 1-2% portfolio risk framework
   Frame as "the data suggests" and "logical placement based on", never as advice.`}

**9. Educational Summary** — Synthesize the key takeaway: what the confluence of indicators shows, what to watch for next, and what conditions would confirm or invalidate the current setup.

Each section should provide specific, data-driven insights referencing the actual numbers provided. Be precise with price levels and indicator values. Do NOT pad with generic disclaimers — the educational framing in the system prompt is sufficient.

IMPORTANT: Format each section exactly as **N. Section Name** followed by content on new lines. ${!optionsData ? 'Omit section 4 entirely (skip from 3 to 5).' : ''}`;
  }
}
