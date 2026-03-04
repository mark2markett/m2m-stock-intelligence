import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/server/newsService';
import { checkRateLimit } from '@/lib/server/rateLimiter';

const SYMBOL_REGEX = /^[A-Z]{1,5}$/;

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed, remaining, resetMs } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toUpperCase() || '';
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!SYMBOL_REGEX.test(symbol)) {
      return NextResponse.json(
        { error: 'Invalid stock symbol. Must be 1-5 uppercase letters.' },
        { status: 400 }
      );
    }

    const news = await NewsService.getStockNews(symbol, Math.min(limit, 20));

    return NextResponse.json(news, {
      headers: { 'X-RateLimit-Remaining': String(remaining) }
    });
  } catch (error) {
    console.error('News proxy error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch news data.' },
      { status: 500 }
    );
  }
}
