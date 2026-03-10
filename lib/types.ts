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
  setupStage: 'Setup Forming' | 'Just Triggered' | 'Mid Setup' | 'Late Setup' | 'Breakdown' | 'Bearish Momentum' | 'Oversold Bounce' | 'Ranging';
  scorecard: M2MScorecard;
  volatilityRegime: 'High' | 'Normal' | 'Low';
  confidenceScore: number;
  actionable: boolean;
  setupQuality: 'high' | 'moderate' | 'low';
  signalConfidence: number;
  earlyStage: boolean;
  catalystPresent: boolean;
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

export interface OptionContract {
  ticker: string;
  contractType: 'call' | 'put';
  strikePrice: number;
  expirationDate: string;
  daysToExpiry: number;
  bid: number;
  ask: number;
  midpoint: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface OptionsData {
  putCallRatio: number;
  totalCallVolume: number;
  totalPutVolume: number;
  totalCallOI: number;
  totalPutOI: number;
  avgImpliedVolatility: number;
  nearMoneyIV: number;
  contractCount: number;
  topContracts?: OptionContract[];
}

export interface OptimalTradeleg {
  contractType: 'call' | 'put';
  strikePrice: number;
  expirationDate: string;
  action: 'buy' | 'sell';
  estimatedPrice: number;
  delta: number;
  reasoning: string;
}

export interface OptimalTrade {
  hasSetup: boolean;
  vehicle: 'stock' | 'options';
  direction: 'bullish' | 'bearish' | 'neutral';
  strategy: string;
  reasoning: string;
  entryZone: string;
  stopLoss: string;
  target1: string;
  target2: string;
  riskRewardRatio: string;
  positionSizing: string;
  legs?: OptimalTradeleg[];
  maxRisk: string;
  maxReward: string;
  ivEnvironment: string;
  timeHorizon: string;
  conditionsNeeded?: string[];
  educationalDisclaimer: string;
}

export interface AnalysisResult {
  report: AnalysisReport;
  stockData: StockData;
  indicators: TechnicalIndicators;
  news: NewsItem[];
  optionsData?: OptionsData;
  optimalTrade?: OptimalTrade;
  partial?: boolean;
  aiError?: string;
}

export type ErrorType = 'invalid_symbol' | 'rate_limit' | 'offline' | 'timeout' | 'server_error' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  retryAfter?: number;
  suggestions?: string[];
  partialData?: boolean;
}

// --- Scanner Types ---

export interface SP500Stock {
  symbol: string;
  name: string;
  sector: string;
}

export interface ScannerStockResult {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  m2mScore: number;
  m2mMaxScore: number;
  factorsPassed: number;
  totalFactors: number;
  publishable: boolean;
  setupStage: string;
  volatilityRegime: string;
  rsi: number;
  macdSignal: 'bullish' | 'bearish';
  trendAlignment: 'bullish' | 'bearish' | 'neutral';
  recommendation: string;
  aiSetupQuality: 'high' | 'moderate' | 'low';
  aiConfidence: number;
  aiEarlyStage: boolean;
  aiKeySignal: string;
  aiRisk: string;
  aiCatalystPresent: boolean;
  aiSummary: string;
  partial: boolean;
  error?: string;
  analyzedAt: string;
}

export interface ScannerResult {
  scanDate: string;
  startedAt: string;
  completedAt: string;
  totalStocks: number;
  successCount: number;
  errorCount: number;
  stocks: ScannerStockResult[];
  topByScore: string[];
  justTriggered: string[];
  publishable: string[];
  earlyStage: string[];
  highQuality: string[];
  bySector: Record<string, number>;
}

export interface ScanBatchStatus {
  scanDate: string;
  totalBatches: number;
  completedBatches: number;
  currentBatch: number;
  status: 'running' | 'completed' | 'failed';
  stocksProcessed: number;
  totalStocks: number;
  startedAt: string;
  lastUpdatedAt: string;
}
