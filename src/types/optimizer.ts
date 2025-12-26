// Input types
export interface OptimizerInput {
  tickers: string[];
  weights: number[];
  benchmark: string;
  years: number;
  riskFreeRate?: number;
  minWeight?: number;
  targetReturn?: number;
  mode?: 'analyze' | 'optimize';
}

// Portfolio weight for optimization results
export interface PortfolioWeight {
  asset: string;
  weight: number;
}

// Optimized portfolio result
export interface OptimizedPortfolio {
  name: string;
  returns: number;
  volatility: number;
  sharpe: number;
  weights: PortfolioWeight[];
}

// Efficient frontier data
export interface EfficientFrontierData {
  returns: number[];
  volatility: number[];
}

// Random portfolios from Monte Carlo
export interface RandomPortfoliosData {
  returns: number[];
  volatility: number[];
  sharpe: number[];
}

// VaR result
export interface VaRResult {
  portfolio: string;
  var1d: number;
  var10d: number;
}

// Stress test scenario
export interface StressScenario {
  portfolio: string;
  scenarios: Record<string, number>;
}

// Historical scenarios for stress testing
export interface HistoricalScenario {
  name: string;
  shockSpy: number;
}

// Asset data from Yahoo Finance
export interface AssetData {
  ticker: string;
  prices: number[];
  returns: number[];
  dates: string[];
}

// Portfolio metrics
export interface PortfolioMetrics {
  beta: number;
  volatility: number;
  cagr: number;
  return12m: number;
  correlation: number;
  sharpeRatio: number;
}

// Benchmark metrics
export interface BenchmarkMetrics {
  volatility: number;
  cagr: number;
  return12m: number;
  sharpeRatio: number;
}

// Correlation data
export interface CorrelationData {
  matrix: number[][];
  tickers: string[];
  highCorrelationPairs: Array<{
    ticker1: string;
    ticker2: string;
    correlation: number;
  }>;
}

// Performance data for charts
export interface PerformanceData {
  dates: string[];
  portfolioValues: number[];
  benchmarkValues: number[];
}

// CAGR data
export interface CAGRData {
  ticker: string;
  cagr: number;
  isPortfolio?: boolean;
  isBenchmark?: boolean;
}

// Complete optimizer result
export interface OptimizerResult {
  // Existing metrics
  portfolioMetrics: PortfolioMetrics;
  benchmarkMetrics: BenchmarkMetrics;
  correlationData: CorrelationData;
  performanceData: PerformanceData;
  cagrData: CAGRData[];
  weights: number[];
  tickers: string[];
  benchmark: string;
  
  // New Markowitz optimization data
  optimization?: {
    maxSharpe: OptimizedPortfolio;
    minVolatility: OptimizedPortfolio;
    targetReturn?: OptimizedPortfolio;
    efficientFrontier: EfficientFrontierData;
    randomPortfolios: RandomPortfoliosData;
    invalidTickers: string[];
  };
  
  // VaR data
  varData?: VaRResult[];
  
  // Stress test data
  stressTest?: {
    hypothetical: StressScenario[];
    historical: StressScenario[];
  };
}

// Export data for Excel/CSV
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
