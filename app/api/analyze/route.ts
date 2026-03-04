import { NextRequest, NextResponse } from 'next/server';
import { AnalysisEngine } from '@/lib/server/analysisEngine';
import { checkRateLimit } from '@/lib/server/rateLimiter';

const SYMBOL_REGEX = /^[A-Z]{1,5}$/;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed, remaining, resetMs } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(resetMs / 1000)),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const body = await request.json();
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim().toUpperCase() : '';

    if (!SYMBOL_REGEX.test(symbol)) {
      return NextResponse.json(
        { error: 'Invalid stock symbol. Must be 1-5 uppercase letters.' },
        { status: 400 }
      );
    }

    const result = await AnalysisEngine.generateAnalysis(symbol);

    return NextResponse.json(
      {
        report: result.report,
        stockData: result.stockData,
        indicators: result.indicators,
        news: result.news
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        }
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
