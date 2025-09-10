export interface OptimizerInput {
  tickers: string[];
  weights: number[];
  benchmark: string;
  years: number;
}

export interface AssetData {
  ticker: string;
  prices: number[];
  returns: number[];
  dates: string[];
}

export interface PortfolioMetrics {
  beta: number;
  volatility: number;
  cagr: number;
  return12m: number;
  correlation: number;
  sharpeRatio: number;
}

export interface BenchmarkMetrics {
  volatility: number;
  cagr: number;
  return12m: number;
  sharpeRatio: number;
}

export interface CorrelationData {
  matrix: number[][];
  tickers: string[];
  highCorrelationPairs: Array<{
    ticker1: string;
    ticker2: string;
    correlation: number;
  }>;
}

export interface PerformanceData {
  dates: string[];
  portfolioValues: number[];
  benchmarkValues: number[];
}

export interface CAGRData {
  ticker: string;
  cagr: number;
  isPortfolio?: boolean;
  isBenchmark?: boolean;
}

export interface OptimizerResult {
  portfolioMetrics: PortfolioMetrics;
  benchmarkMetrics: BenchmarkMetrics;
  correlationData: CorrelationData;
  performanceData: PerformanceData;
  cagrData: CAGRData[];
  weights: number[];
  tickers: string[];
  benchmark: string;
}

export interface ExportData {
  summary: {
    conjunto: string;
    beta: string;
    volatilidad: string;
    cagr: string;
    rendimiento12m: string;
    correlacion: string;
    sharpeRatio: string;
  }[];
  correlationMatrix: Record<string, Record<string, number>>;
  evolution: Array<{
    fecha: string;
    cartera: number;
    benchmark: number;
  }>;
}