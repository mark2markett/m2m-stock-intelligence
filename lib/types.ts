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

export interface NewsItem {
  headline: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  date: string;
  source: string;
}

export interface M2MScoreFactor {
  name: string;
  maxPoints: number;
  score: number;
  passed: boolean;
  rationale: string;
}

export interface M2MScorecard {
  totalScore: number;
  maxScore: number;
  factorsPassed: number;
  totalFactors: number;
  meetsPublicationThreshold: boolean;
  meetsMultiFactorRule: boolean;
  publishable: boolean;
  factors: M2MScoreFactor[];
}

export interface AnalysisReport {
  symbol: string;
  setupStage: 'Setup Forming' | 'Just Triggered' | 'Mid Setup' | 'Late Setup';
  scorecard: M2MScorecard;
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

export interface AnalysisResult {
  report: AnalysisReport;
  stockData: StockData;
  indicators: TechnicalIndicators;
  news: NewsItem[];
}
