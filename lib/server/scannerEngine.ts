import 'server-only';
import { AnalysisEngine } from './analysisEngine';
import type { SP500Stock, ScannerStockResult, AnalysisResult } from '@/lib/types';

const CONCURRENCY = 10;

function mapToScannerResult(stock: SP500Stock, analysis: AnalysisResult): ScannerStockResult {
  const { report, stockData, indicators } = analysis;

  const macdSignal: 'bullish' | 'bearish' = indicators.macd.macd > indicators.macd.signal ? 'bullish' : 'bearish';

  const ema20above50 = indicators.ema20 > indicators.ema50;
  const priceAboveEma20 = stockData.price > indicators.ema20;
  const trendAlignment: 'bullish' | 'bearish' | 'neutral' =
    ema20above50 && priceAboveEma20 ? 'bullish' :
    !ema20above50 && !priceAboveEma20 ? 'bearish' : 'neutral';

  return {
    symbol: stockData.symbol,
    name: stock.name,
    sector: stock.sector,
    price: stockData.price,
    change: stockData.change,
    changePercent: stockData.changePercent,
    volume: stockData.volume,
    marketCap: stockData.marketCap,
    m2mScore: report.scorecard.totalScore,
    m2mMaxScore: report.scorecard.maxScore,
    factorsPassed: report.scorecard.factorsPassed,
    totalFactors: report.scorecard.totalFactors,
    publishable: report.scorecard.publishable,
    setupStage: report.setupStage,
    volatilityRegime: report.volatilityRegime,
    rsi: indicators.rsi,
    macdSignal,
    trendAlignment,
    recommendation: report.recommendation.slice(0, 300),
    partial: analysis.partial || false,
    analyzedAt: new Date().toISOString(),
  };
}

function mapToErrorResult(stock: SP500Stock, error: string): ScannerStockResult {
  return {
    symbol: stock.symbol,
    name: stock.name,
    sector: stock.sector,
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 0,
    m2mScore: 0,
    m2mMaxScore: 0,
    factorsPassed: 0,
    totalFactors: 0,
    publishable: false,
    setupStage: 'Unknown',
    volatilityRegime: 'Normal',
    rsi: 0,
    macdSignal: 'bearish',
    trendAlignment: 'neutral',
    recommendation: '',
    partial: false,
    error,
    analyzedAt: new Date().toISOString(),
  };
}

async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number
): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await fn(item);
    }
  });
  await Promise.all(workers);
}

export class ScannerEngine {
  static async analyzeBatch(stocks: SP500Stock[]): Promise<ScannerStockResult[]> {
    const results: ScannerStockResult[] = [];

    await runWithConcurrency(stocks, async (stock) => {
      try {
        const analysis = await AnalysisEngine.generateAnalysis(stock.symbol);
        results.push(mapToScannerResult(stock, analysis));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        console.error(`[Scanner] Failed to analyze ${stock.symbol}: ${message}`);
        results.push(mapToErrorResult(stock, message));
      }
    }, CONCURRENCY);

    return results;
  }
}
