import { NextRequest, NextResponse } from 'next/server';
import { AnalysisEngine } from '@/lib/server/analysisEngine';
import { PolygonService } from '@/lib/server/polygonService';
import { NewsService } from '@/lib/server/newsService';
import { TechnicalIndicators } from '@/lib/utils/technicalIndicators';
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

    const report = await AnalysisEngine.generateAnalysis(symbol);

    const [stockData, historicalData, newsData] = await Promise.all([
      PolygonService.getStockDetails(symbol),
      PolygonService.getHistoricalData(symbol, 'day', 25),
      NewsService.getStockNews(symbol, 3)
    ]);

    const closes = historicalData.map((d: any) => d.close);
    const highs = historicalData.map((d: any) => d.high);
    const lows = historicalData.map((d: any) => d.low);
    const volumes = historicalData.map((d: any) => d.volume);

    const indicatorResults = TechnicalIndicators.computeIndicators(highs, lows, closes, volumes, 'daily');

    report.historicalData = historicalData;

    return NextResponse.json(
      {
        report,
        stockData,
        indicators: indicatorResults.indicators,
        news: newsData
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        }
      }
    );
  } catch (error) {
    console.error('Analysis endpoint error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
