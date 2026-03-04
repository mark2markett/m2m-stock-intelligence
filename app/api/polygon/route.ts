import { NextRequest, NextResponse } from 'next/server';
import { PolygonService } from '@/lib/server/polygonService';
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
    const type = searchParams.get('type') || 'details';

    if (!SYMBOL_REGEX.test(symbol)) {
      return NextResponse.json(
        { error: 'Invalid stock symbol. Must be 1-5 uppercase letters.' },
        { status: 400 }
      );
    }

    let data;
    switch (type) {
      case 'historical':
        const timeframe = searchParams.get('timeframe') || 'day';
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        data = await PolygonService.getHistoricalData(symbol, timeframe, Math.min(limit, 200));
        break;
      case 'company':
        data = await PolygonService.getCompanyInfo(symbol);
        break;
      default:
        data = await PolygonService.getStockDetails(symbol);
        break;
    }

    return NextResponse.json(data, {
      headers: { 'X-RateLimit-Remaining': String(remaining) }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch stock data.' },
      { status: 500 }
    );
  }
}
