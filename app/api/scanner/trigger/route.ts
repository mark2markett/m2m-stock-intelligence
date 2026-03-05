import { NextRequest, NextResponse } from 'next/server';
import { SP500_CONSTITUENTS } from '@/lib/data/sp500';
import { ScannerEngine } from '@/lib/server/scannerEngine';
import { KVStore } from '@/lib/server/kvStore';
import type { ScanBatchStatus, ScannerStockResult, ScannerResult } from '@/lib/types';

const BATCH_SIZE = 10;

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = request.headers.get('authorization');
  if (cronSecret === `Bearer ${process.env.CRON_SECRET}`) return true;

  const secret = request.nextUrl.searchParams.get('secret');
  if (secret === process.env.CRON_SECRET) return true;

  return false;
}

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const scanDate = now.toISOString().split('T')[0];
  const totalStocks = SP500_CONSTITUENTS.length;
  const totalBatches = Math.ceil(totalStocks / BATCH_SIZE);

  const status: ScanBatchStatus = {
    scanDate,
    totalBatches,
    completedBatches: 0,
    currentBatch: 0,
    status: 'running',
    stocksProcessed: 0,
    totalStocks,
    startedAt: now.toISOString(),
    lastUpdatedAt: now.toISOString(),
  };
  await KVStore.setScanStatus(status);

  // Process all batches sequentially
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * BATCH_SIZE;
    const batchStocks = SP500_CONSTITUENTS.slice(start, start + BATCH_SIZE);
    const batchResults = await ScannerEngine.analyzeBatch(batchStocks);
    await KVStore.setBatchResults(scanDate, batchIndex, batchResults);

    status.completedBatches = batchIndex + 1;
    status.currentBatch = batchIndex + 1;
    status.stocksProcessed = Math.min((batchIndex + 1) * BATCH_SIZE, totalStocks);
    status.lastUpdatedAt = new Date().toISOString();
    await KVStore.setScanStatus(status);
  }

  // Finalize — merge all batches into a single result
  const allStocks: ScannerStockResult[] = [];
  for (let i = 0; i < totalBatches; i++) {
    const batchResults = await KVStore.getBatchResults(scanDate, i);
    if (batchResults) {
      allStocks.push(...batchResults);
    }
  }

  const successStocks = allStocks.filter(s => !s.error);
  const errorStocks = allStocks.filter(s => !!s.error);

  const sorted = [...successStocks].sort((a, b) => b.m2mScore - a.m2mScore);
  const topByScore = sorted.slice(0, 20).map(s => s.symbol);
  const justTriggered = successStocks.filter(s => s.setupStage === 'Just Triggered').map(s => s.symbol);
  const publishable = successStocks.filter(s => s.publishable).map(s => s.symbol);

  const bySector: Record<string, number> = {};
  for (const stock of successStocks) {
    bySector[stock.sector] = (bySector[stock.sector] || 0) + 1;
  }

  const result: ScannerResult = {
    scanDate,
    startedAt: status.startedAt,
    completedAt: new Date().toISOString(),
    totalStocks: allStocks.length,
    successCount: successStocks.length,
    errorCount: errorStocks.length,
    stocks: allStocks,
    topByScore,
    justTriggered,
    publishable,
    bySector,
  };

  await KVStore.setLatestResult(result);

  status.status = 'completed';
  status.lastUpdatedAt = new Date().toISOString();
  await KVStore.setScanStatus(status);

  return NextResponse.json({
    message: 'Scan complete',
    scanDate,
    totalStocks: allStocks.length,
    successCount: successStocks.length,
    errorCount: errorStocks.length,
    topByScore: topByScore.slice(0, 5),
  });
}
