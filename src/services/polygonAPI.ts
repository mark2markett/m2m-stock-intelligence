// Polygon.io API integration
export class PolygonService {
  private static readonly BASE_URL = 'https://api.polygon.io/v2';
  private static readonly REST_URL = 'https://api.polygon.io/v3';
  private static apiKey = import.meta.env.VITE_POLYGON_API_KEY;
  
  // Get stock details
  static async getStockDetails(symbol: string) {
    console.log(`Fetching stock details for ${symbol} from Polygon.io`);
    
    if (!this.apiKey || this.apiKey === 'your_polygon_api_key_here') {
      console.error('Polygon API key not configured properly');
      throw new Error('Polygon API key not configured. Please add your API key to the .env file.');
    }

    try {
      // Get ticker details for company info
      const detailsUrl = `${this.REST_URL}/reference/tickers/${symbol}?apikey=${this.apiKey}`;
      console.log('Fetching ticker details from:', detailsUrl);
      
      const detailsResponse = await fetch(detailsUrl);
      
      if (!detailsResponse.ok) {
        console.error(`Ticker details API error: ${detailsResponse.status}`);
        throw new Error(`Failed to fetch ticker details: ${detailsResponse.status}`);
      }
      
      const detailsData = await detailsResponse.json();
      console.log('Ticker details response:', detailsData);
      
      // Get current snapshot data (15-minute delayed for free tier)
      const snapshotUrl = `${this.BASE_URL}/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${this.apiKey}`;
      console.log('Fetching current snapshot data from:', snapshotUrl);

      const snapshotResponse = await fetch(snapshotUrl);

      if (!snapshotResponse.ok) {
        throw new Error(`Failed to fetch snapshot data: ${snapshotResponse.status}`);
      }

      const snapshotData = await snapshotResponse.json();
      console.log('Snapshot response:', snapshotData);

      if (!snapshotData.ticker) {
        throw new Error('No snapshot data available from Polygon.io');
      }

      const ticker = snapshotData.ticker;
      // Use latest price from snapshot (could be intraday if market is open)
      const currentPrice = ticker.lastTrade?.p || ticker.day?.c || ticker.prevDay?.c;
      const previousClose = ticker.prevDay?.c || currentPrice;
      const volume = ticker.day?.v || ticker.prevDay?.v || 0;

      // Calculate change using the snapshot data
      const change = previousClose > 0 ? currentPrice - previousClose : 0;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      console.log('Price calculation:', {
        currentPrice,
        previousClose,
        change,
        changePercent: changePercent.toFixed(2) + '%',
        lastTradeTime: ticker.lastTrade?.t ? new Date(ticker.lastTrade.t / 1000000).toLocaleString() : 'N/A'
      });
      
      const stockDetails = {
        symbol: symbol.toUpperCase(),
        name: detailsData.results?.name || `${symbol.toUpperCase()} Corporation`,
        price: currentPrice,
        change,
        changePercent,
        volume: volume || 0,
        marketCap: detailsData.results?.market_cap || 0,
        peRatio: 0, // Would need additional API call for fundamentals
        lastUpdated: new Date().toISOString()
      };
      
      console.log('Final stock details:', stockDetails);
      return stockDetails;
      
    } catch (error) {
      console.error('Error fetching stock details from Polygon.io:', error);
      throw error;
    }
  }
  
  // Get historical price data
  static async getHistoricalData(symbol: string, timeframe: string = 'day', limit: number = 50) {
    console.log(`Fetching historical data for ${symbol} from Polygon.io`);
    
    if (!this.apiKey || this.apiKey === 'your_polygon_api_key_here') {
      console.error('Polygon API key not configured properly');
      throw new Error('Polygon API key not configured. Please add your API key to the .env file.');
    }

    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (limit + 10)); // Reduced buffer for faster loading
      
      const multiplier = timeframe === 'week' ? 1 : timeframe === '4hour' ? 4 : 1;
      const timespan = timeframe === 'week' ? 'week' : timeframe === '4hour' ? 'hour' : 'day';
      
      const histUrl = `${this.BASE_URL}/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}?adjusted=true&sort=asc&limit=${limit}&apikey=${this.apiKey}`;
      console.log('Fetching historical data from:', histUrl);
      
      const response = await fetch(histUrl);
      
      if (!response.ok) {
        console.error(`Historical data API error: ${response.status}`);
        throw new Error(`Failed to fetch historical data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Historical data response:', data);
      
      if (!data.results || data.results.length === 0) {
        throw new Error('No historical data available from Polygon.io');
      }
      
      const historicalData = data.results.map((bar: any) => ({
        timestamp: new Date(bar.t).toISOString(),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      }));
      
      console.log(`Historical data processed: ${historicalData.length} bars`);
      
      return historicalData;
      
    } catch (error) {
      console.error('Error fetching historical data from Polygon.io:', error);
      throw error;
    }
  }
  
  // Get earnings data
  static async getEarningsData(symbol: string) {
    console.log(`Fetching earnings data for ${symbol}`);
    
    // Note: Polygon.io earnings data requires a paid plan
    // For now, return mock data but structure for real API
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

  // Get company information
  static async getCompanyInfo(symbol: string) {
    console.log(`Fetching company info for ${symbol} from Polygon.io`);
    
    if (!this.apiKey || this.apiKey === 'your_polygon_api_key_here') {
      console.error('Polygon API key not configured properly');
      throw new Error('Polygon API key not configured. Please add your API key to the .env file.');
    }

    try {
      const companyUrl = `${this.REST_URL}/reference/tickers/${symbol}?apikey=${this.apiKey}`;
      console.log('Fetching company info from:', companyUrl);
      
      const response = await fetch(companyUrl);
      
      if (!response.ok) {
        console.error(`Company info API error: ${response.status}`);
        throw new Error(`Failed to fetch company info: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Company info response:', data);
      
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
      console.error('Error fetching company info from Polygon.io:', error);
      throw error;
    }
  }
}