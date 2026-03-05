import { NextRequest, NextResponse } from 'next/server';
import { SP500_CONSTITUENTS } from '@/lib/data/sp500';
import { ScannerEngine } from '@/lib/server/scannerEngine';
import { KVStore } from '@/lib/server/kvStore';
import type { ScanBatchStatus } from '@/lib/types';

const BATCH_SIZE = 10;

function isAuthorized(request: NextRequest): boolean {
  // Vercel Cron sends this header automatically
  const cronSecret = request.headers.get('authorization');
  if (cronSecret === `Bearer ${process.env.CRON_SECRET}`) return true;

  // Also check query param for manual triggers
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret === process.env.CRON_SECRET) return true;

  return false;
}

export const maxDuration = 300; // Vercel Pro max

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const scanDate = now.toISOString().split('T')[0];
  const totalStocks = SP500_CONSTITUENTS.length;
  const totalBatches = Math.ceil(totalStocks / BATCH_SIZE);

  // Initialize scan status
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

  // Process batch 0 inline
  const batch0Stocks = SP500_CONSTITUENTS.slice(0, BATCH_SIZE);
  const batch0Results = await ScannerEngine.analyzeBatch(batch0Stocks);
  await KVStore.setBatchResults(scanDate, 0, batch0Results);

  // Update status
  status.completedBatches = 1;
  status.currentBatch = 1;
  status.stocksProcessed = batch0Stocks.length;
  status.lastUpdatedAt = new Date().toISOString();
  await KVStore.setScanStatus(status);

  // Chain to next batch if more remain
  if (totalBatches > 1) {
    const baseUrl = getBaseUrl(request);
    fetch(`${baseUrl}/api/scanner/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ scanDate, batchIndex: 1, totalBatches }),
    }).catch(err => console.error('[Scanner] Failed to chain batch 1:', err));
  } else {
    // Only one batch, finalize immediately
    const baseUrl = getBaseUrl(request);
    fetch(`${baseUrl}/api/scanner/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ scanDate, totalBatches }),
    }).catch(err => console.error('[Scanner] Failed to call finalize:', err));
  }

  return NextResponse.json({
    message: 'Scan started',
    scanDate,
    totalStocks,
    totalBatches,
    batch0Processed: batch0Stocks.length,
  });
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
