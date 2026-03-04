import 'server-only';

const BASE_URL = 'https://api.polygon.io/v2';
const REST_URL = 'https://api.polygon.io/v3';

function getApiKey(): string {
  const key = process.env.POLYGON_API_KEY;
  if (!key || key === 'your_polygon_api_key_here') {
    throw new Error('Polygon API key not configured.');
  }
  return key;
}

export class PolygonService {
  static async getStockDetails(symbol: string) {
    const apiKey = getApiKey();

    try {
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

      return {
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
    } catch (error) {
      console.error('Error fetching stock details:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async getHistoricalData(symbol: string, timeframe: string = 'day', limit: number = 50) {
    const apiKey = getApiKey();

    try {
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

      return data.results.map((bar: any) => ({
        timestamp: new Date(bar.t).toISOString(),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async getEarningsData(symbol: string) {
    const nextEarnings = new Date();
    nextEarnings.setDate(nextEarnings.getDate() + Math.floor(Math.random() * 60) + 10);

    const lastEarnings = new Date();
    lastEarnings.setDate(lastEarnings.getDate() - Math.floor(Math.random() * 90));

    return {
      nextDate: nextEarnings.toISOString(),
      lastDate: lastEarnings.toISOString(),
      lastSurprise: (Math.random() - 0.5) * 0.5,
      lastSurprisePercent: (Math.random() - 0.5) * 20
    };
  }

  static async getCompanyInfo(symbol: string) {
    const apiKey = getApiKey();

    try {
      const companyUrl = `${REST_URL}/reference/tickers/${symbol}?apikey=${apiKey}`;
      const response = await fetch(companyUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch company info: ${response.status}`);
      }

      const data = await response.json();

      return {
        name: data.results?.name || `${symbol.toUpperCase()} Corporation`,
        description: data.results?.description || '',
        industry: data.results?.sic_description || 'Technology',
        sector: data.results?.sic_description || 'Technology',
        marketCap: data.results?.market_cap || 0,
        employees: data.results?.total_employees || 0,
        homepage: data.results?.homepage_url || ''
      };
    } catch (error) {
      console.error('Error fetching company info:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}
