import 'server-only';

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
    rsiInterpretation: any
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
      rsiInterpretation
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
            content: 'You are an educational market data analyst for the M2M Stock Intelligence platform. Generate observational technical analysis for educational purposes only. Never use advisory language like "consider buying", "you should", "we recommend", or "take a position". Instead use observational language like "indicators suggest", "historical patterns show", "data points to". Always frame analysis as educational observation, not investment advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
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
    rsiInterpretation: any
  ): string {
    return `Generate a comprehensive stock analysis report for ${symbol} with the following data:

STOCK DATA:
- Price: $${stockData.price.toFixed(2)}
- Change: ${stockData.changePercent.toFixed(2)}%
- Volume: ${stockData.volume.toLocaleString()}

TECHNICAL INDICATORS:
- RSI: ${indicators.rsi.toFixed(1)} (${rsiInterpretation.zone})
- MACD: ${indicators.macd.macd.toFixed(3)} vs Signal: ${indicators.macd.signal.toFixed(3)}
- EMA20: $${indicators.ema20.toFixed(2)}, EMA50: $${indicators.ema50.toFixed(2)}
- ATR: ${indicators.atr.toFixed(2)}
- ADX: ${indicators.adx.toFixed(1)}
- Bollinger Bands: ${indicators.bollingerBands.lower.toFixed(2)} - ${indicators.bollingerBands.upper.toFixed(2)}

SUPPORT/RESISTANCE:
- Support Levels: ${support.map(s => '$' + s.toFixed(2)).join(', ')}
- Resistance Levels: ${resistance.map(r => '$' + r.toFixed(2)).join(', ')}

MARKET CONDITIONS:
- Setup Stage: ${setupStage}
- Volatility Regime: ${volatilityRegime}
- News Sentiment: ${sentimentData}

Please provide a detailed analysis with exactly these sections (use **1. Section Name** format):

**1. Technical Indicator Analysis**
**2. Trend and Momentum Assessment**
**3. Support and Resistance Analysis**
**4. Volume and Money Flow Analysis**
**5. Risk Assessment and Volatility**
**6. Setup Quality and Timing**
**7. Key Levels and Price Targets**
**8. Educational Summary**

Each section should be 2-3 sentences with specific observational insights based on the data provided. Use educational framing — describe what the data shows, not what to do with it. Never say "buy", "sell", "consider", "recommend", or "take a position".

IMPORTANT: Format each section exactly as shown with **1. Section Name** followed by content on new lines.`;
  }
}
