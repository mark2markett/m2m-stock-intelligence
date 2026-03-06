import 'server-only';
import { CacheService } from './cacheService';
import type { OptionsData, OptionContract } from '@/lib/types';

const BASE_URL = 'https://api.polygon.io/v2';
const REST_URL = 'https://api.polygon.io/v3';

const POLYGON_CACHE_TTL = 5; // 5 minutes

function getApiKey(): string {
  const key = process.env.POLYGON_API_KEY;
  if (!key || key === 'your_polygon_api_key_here') {
    throw new Error('Polygon API key not configured.');
  }
  return key;
}

export class PolygonService {
  static async getStockDetails(symbol: string) {
    const cacheKey = `stock-details-${symbol}`;
    const cached = CacheService.get(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();

    const detailsUrl = `${REST_URL}/reference/tickers/${symbol}?apikey=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      throw new Error(`Failed to fetch ticker details: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();

    const snapshotUrl = `${BASE_URL}/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${apiKey}`;
    const snapshotResponse = await fetch(snapshotUrl);

    if (!snapshotResponse.ok) {
      throw new Error(`Failed to fetch snapshot data: ${snapshotResponse.status}`);
    }

    const snapshotData = await snapshotResponse.json();

    if (!snapshotData.ticker) {
      throw new Error('No snapshot data available from Polygon.io');
    }

    const ticker = snapshotData.ticker;
    const currentPrice = ticker.lastTrade?.p || ticker.day?.c || ticker.prevDay?.c;
    const previousClose = ticker.prevDay?.c || currentPrice;
    const volume = ticker.day?.v || ticker.prevDay?.v || 0;

    const change = previousClose > 0 ? currentPrice - previousClose : 0;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    const result = {
      symbol: symbol.toUpperCase(),
      name: detailsData.results?.name || `${symbol.toUpperCase()} Corporation`,
      price: currentPrice,
      change,
      changePercent,
      volume: volume || 0,
      marketCap: detailsData.results?.market_cap || 0,
      peRatio: 0,
      lastUpdated: new Date().toISOString()
    };

    CacheService.set(cacheKey, result, POLYGON_CACHE_TTL);
    return result;
  }

  static async getHistoricalData(symbol: string, timeframe: string = 'day', limit: number = 50) {
    const cacheKey = `historical-${symbol}-${timeframe}-${limit}`;
    const cached = CacheService.get(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (limit + 10));

    const multiplier = timeframe === 'week' ? 1 : timeframe === '4hour' ? 4 : 1;
    const timespan = timeframe === 'week' ? 'week' : timeframe === '4hour' ? 'hour' : 'day';

    const histUrl = `${BASE_URL}/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}?adjusted=true&sort=asc&limit=${limit}&apikey=${apiKey}`;
    const response = await fetch(histUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('No historical data available from Polygon.io');
    }

    const result = data.results.map((bar: any) => ({
      timestamp: new Date(bar.t).toISOString(),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v
    }));

    CacheService.set(cacheKey, result, POLYGON_CACHE_TTL);
    return result;
  }

  static async getOptionsSnapshot(symbol: string, currentPrice: number): Promise<OptionsData | null> {
    const cacheKey = `options-snapshot-${symbol}`;
    const cached = CacheService.get(cacheKey);
    if (cached) return cached as OptionsData;

    try {
      const apiKey = getApiKey();

      const today = new Date();
      const maxExpiry = new Date();
      maxExpiry.setDate(today.getDate() + 45);

      const strikeFrom = (currentPrice * 0.8).toFixed(2);
      const strikeTo = (currentPrice * 1.2).toFixed(2);
      const expiryTo = maxExpiry.toISOString().split('T')[0];

      const url = `${REST_URL}/snapshot/options/${symbol}?strike_price.gte=${strikeFrom}&strike_price.lte=${strikeTo}&expiration_date.lte=${expiryTo}&limit=250&apikey=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.results || data.results.length === 0) return null;

      let totalCallVolume = 0, totalPutVolume = 0;
      let totalCallOI = 0, totalPutOI = 0;
      let ivSum = 0, ivCount = 0;
      let nearMoneyIVSum = 0, nearMoneyIVCount = 0;

      const allContracts: (OptionContract & { liquidityScore: number })[] = [];

      for (const contract of data.results) {
        const details = contract.details;
        const greeks = contract.greeks;
        const dayData = contract.day;

        if (!details) continue;

        const isCall = details.contract_type === 'call';
        const vol = dayData?.volume || 0;
        const oi = contract.open_interest || 0;
        const iv = greeks?.implied_volatility;
        const bid = dayData?.close ? (dayData.close * 0.98) : 0;
        const ask = dayData?.close ? (dayData.close * 1.02) : 0;
        const lastQuote = contract.last_quote;
        const contractBid = lastQuote?.bid ?? bid;
        const contractAsk = lastQuote?.ask ?? ask;

        if (isCall) {
          totalCallVolume += vol;
          totalCallOI += oi;
        } else {
          totalPutVolume += vol;
          totalPutOI += oi;
        }

        if (iv && iv > 0) {
          ivSum += iv;
          ivCount++;

          const strike = details.strike_price;
          if (strike && Math.abs(strike - currentPrice) / currentPrice < 0.05) {
            nearMoneyIVSum += iv;
            nearMoneyIVCount++;
          }
        }

        // Preserve contract details for optimal trade analysis
        const expDate = details.expiration_date;
        const daysToExpiry = expDate
          ? Math.ceil((new Date(expDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        if (greeks && daysToExpiry > 0 && (vol > 0 || oi > 10)) {
          allContracts.push({
            ticker: details.ticker || `${symbol}${expDate}${isCall ? 'C' : 'P'}${details.strike_price}`,
            contractType: isCall ? 'call' : 'put',
            strikePrice: details.strike_price,
            expirationDate: expDate,
            daysToExpiry,
            bid: contractBid,
            ask: contractAsk,
            midpoint: (contractBid + contractAsk) / 2,
            volume: vol,
            openInterest: oi,
            impliedVolatility: iv || 0,
            delta: greeks.delta || 0,
            gamma: greeks.gamma || 0,
            theta: greeks.theta || 0,
            vega: greeks.vega || 0,
            liquidityScore: vol + (oi * 0.5),
          });
        }
      }

      // Sort by liquidity and take top 20 (10 calls + 10 puts ideally)
      allContracts.sort((a, b) => b.liquidityScore - a.liquidityScore);
      const topCalls = allContracts.filter(c => c.contractType === 'call').slice(0, 10);
      const topPuts = allContracts.filter(c => c.contractType === 'put').slice(0, 10);
      const topContracts: OptionContract[] = [...topCalls, ...topPuts].map(
        ({ liquidityScore: _, ...contract }) => contract
      );

      const totalCallVol = totalCallVolume || 1;
      const result: OptionsData = {
        putCallRatio: totalPutVolume / totalCallVol,
        totalCallVolume,
        totalPutVolume,
        totalCallOI,
        totalPutOI,
        avgImpliedVolatility: ivCount > 0 ? ivSum / ivCount : 0,
        nearMoneyIV: nearMoneyIVCount > 0 ? nearMoneyIVSum / nearMoneyIVCount : 0,
        contractCount: data.results.length,
        topContracts,
      };

      CacheService.set(cacheKey, result, POLYGON_CACHE_TTL);
      return result;
    } catch {
      return null;
    }
  }

  static async getCompanyInfo(symbol: string) {
    const cacheKey = `company-info-${symbol}`;
    const cached = CacheService.get(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();

    const companyUrl = `${REST_URL}/reference/tickers/${symbol}?apikey=${apiKey}`;
    const response = await fetch(companyUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch company info: ${response.status}`);
    }

    const data = await response.json();

    const result = {
      name: data.results?.name || `${symbol.toUpperCase()} Corporation`,
      description: data.results?.description || '',
      industry: data.results?.sic_description || 'Technology',
      sector: data.results?.sic_description || 'Technology',
      marketCap: data.results?.market_cap || 0,
      employees: data.results?.total_employees || 0,
      homepage: data.results?.homepage_url || ''
    };

    CacheService.set(cacheKey, result, POLYGON_CACHE_TTL);
    return result;
  }
}
