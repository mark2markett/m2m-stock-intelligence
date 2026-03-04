export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  lastUpdated: string;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  ema20: number;
  ema50: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  atr: number;
  adx: number;
  stochastic: {
    k: number;
    d: number;
  };
  cmf: number;
}

export interface SupportResistance {
  support: number[];
  resistance: number[];
}

export interface EarningsData {
  nextDate: string;
  lastDate: string;
  lastSurprise: number;
  lastSurprisePercent: number;
}

export interface NewsItem {
  headline: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  date: string;
  source: string;
}

export interface AnalysisReport {
  symbol: string;
  setupStage: 'Setup Forming' | 'Just Triggered' | 'Mid Setup' | 'Late Setup';
  tradeQuality: 'Tier 1' | 'Tier 2' | 'Tier 3';
  volatilityRegime: 'High' | 'Normal' | 'Low';
  confidenceScore: number;
  actionable: boolean;
  recommendation: string;
  sections: ReportSection[];
  historicalData?: HistoricalDataPoint[];
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface VolatilityRegime {
  regime: 'High' | 'Normal' | 'Low';
  atrPercentile: number;
  bbWidth: number;
}

export interface HistoricalDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}