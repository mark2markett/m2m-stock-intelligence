import { NextRequest, NextResponse } from 'next/server';
import { AnalysisEngine } from '@/lib/server/analysisEngine';

export const maxDuration = 60;


const COMMON_SYMBOLS = [
  'AAPL','MSFT','GOOGL','GOOG','AMZN','TSLA','NVDA','META','NFLX','AMD',
  'INTC','ORCL','CRM','ADBE','PYPL','SHOP','SQ','COIN','UBER','LYFT',
  'DIS','BA','JPM','GS','MS','BAC','WFC','C','V','MA','AXP',
  'JNJ','PFE','UNH','MRK','ABBV','LLY','BMY','AMGN','GILD','MRNA',
  'WMT','HD','COST','TGT','LOW','NKE','SBUX','MCD','KO','PEP',
  'XOM','CVX','COP','SLB','OXY','F','GM','RIVN','LCID',
  'SPY','QQQ','DIA','IWM','VTI','VOO','ARKK',
];

function getSimilarSymbols(input: string): string[] {
  const upper = input.toUpperCase();
  if (!upper) return [];
  return COMMON_SYMBOLS
    .filter(s => s.startsWith(upper[0]) || s.includes(upper))
    .slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed, remaining, resetMs } = checkRateLimit(ip);

    if (!allowed) {
      const retryAfter = Math.ceil(resetMs / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.', type: 'rate_limit', retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const body = await request.json();
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim().toUpperCase() : '';

    if (!SYMBOL_REGEX.test(symbol)) {
      return NextResponse.json(
        {
          error: 'Invalid stock symbol. Must be 1-5 uppercase letters.',
          type: 'invalid_symbol',
          suggestions: getSimilarSymbols(symbol)
        },
        { status: 400 }
      );
    }

    const result = await AnalysisEngine.generateAnalysis(symbol);

    return NextResponse.json(
      {
        report: result.report,
        stockData: result.stockData,
        indicators: result.indicators,
        news: result.news,
        optionsData: result.optionsData,
        optimalTrade: result.optimalTrade,
        partial: result.partial || false,
        aiError: result.aiError,
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        }
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.', type: 'server_error' },
      { status: 500 }
    );
  }
}