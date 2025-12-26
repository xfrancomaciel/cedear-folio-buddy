import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizerInput {
  tickers: string[];
  weights: number[];
  benchmark: string;
  years: number;
  riskFreeRate?: number;
  minWeight?: number;
  targetReturn?: number;
  mode?: 'analyze' | 'optimize';
}

interface AssetData {
  ticker: string;
  prices: number[];
  returns: number[];
  dates: string[];
}

interface PortfolioWeight {
  asset: string;
  weight: number;
}

interface OptimizedPortfolio {
  name: string;
  returns: number;
  volatility: number;
  sharpe: number;
  weights: PortfolioWeight[];
}

// Historical stress test scenarios
const HISTORICAL_SCENARIOS = [
  { name: "Crisis 2008 (Lehman)", shockSpy: -0.09 },
  { name: "COVID-19 Crash (Mar 2020)", shockSpy: -0.12 },
  { name: "Flash Crash 2010", shockSpy: -0.06 },
  { name: "Crisis Deuda EUR 2011", shockSpy: -0.07 },
];

// Hypothetical shock scenarios
const HYPOTHETICAL_SHOCKS = [-0.05, -0.10, -0.20, -0.30];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: OptimizerInput = await req.json();
    console.log('Portfolio optimizer input:', JSON.stringify(input));

    const { 
      tickers, 
      weights, 
      benchmark, 
      years, 
      riskFreeRate = 0.02,
      minWeight = 0,
      targetReturn,
      mode = 'analyze'
    } = input;

    // Validate input
    if (!tickers || tickers.length === 0) {
      throw new Error('Debe ingresar al menos 1 ticker');
    }

    if (weights.length !== tickers.length) {
      throw new Error('La cantidad de pesos debe coincidir con los tickers');
    }

    // Get all symbols including benchmarks
    const allSymbols = [...tickers, benchmark, 'SPY', 'QQQ', 'DIA'].filter((v, i, a) => a.indexOf(v) === i);
    
    // Fetch historical data
    const assetData: Record<string, AssetData> = {};
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - years);

    console.log(`Fetching data for ${allSymbols.length} symbols over ${years} years`);

  for (const symbol of allSymbols) {
    try {
      const period1 = Math.floor(startDate.getTime() / 1000);
      const period2 = Math.floor(endDate.getTime() / 1000);
      
      // Use Yahoo Finance v8 chart API (no authentication required)
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d&includeAdjustedClose=true`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch ${symbol}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const result = data?.chart?.result?.[0];
      
      if (!result || !result.indicators?.adjclose?.[0]?.adjclose) {
        console.warn(`No data in response for ${symbol}`);
        continue;
      }

      const timestamps = result.timestamp || [];
      const adjClosePrices = result.indicators.adjclose[0].adjclose || [];

      const prices: number[] = [];
      const dates: string[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const price = adjClosePrices[i];
        const timestamp = timestamps[i];
        
        if (price !== null && !isNaN(price) && timestamp) {
          prices.push(price);
          // Convert timestamp to date string
          const date = new Date(timestamp * 1000).toISOString().split('T')[0];
          dates.push(date);
        }
      }

      if (prices.length < 2) {
        console.warn(`Insufficient data for ${symbol}: ${prices.length} points`);
        continue;
      }

      const returns: number[] = [];
      for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
      }

      assetData[symbol] = { ticker: symbol, prices, returns, dates };
      console.log(`Fetched ${prices.length} data points for ${symbol}`);
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    // Validate required data
    const validTickers = tickers.filter(t => assetData[t]);
    const invalidTickers = tickers.filter(t => !assetData[t]);
    
    if (validTickers.length === 0) {
      throw new Error(`No se pudieron obtener datos para ningún ticker`);
    }

    if (!assetData[benchmark]) {
      throw new Error(`No se pudieron obtener datos para el benchmark: ${benchmark}`);
    }

    // Find common date range
    const minLength = Math.min(
      ...validTickers.map(t => assetData[t].returns.length), 
      assetData[benchmark].returns.length
    );

    // Get valid weights for valid tickers
    const validWeights = tickers.map((t, i) => assetData[t] ? weights[i] : 0).filter((_, i) => assetData[tickers[i]]);
    const normalizedWeights = normalizeWeights(validWeights);

    // Calculate mean returns and covariance matrix for valid tickers
    const meanReturns = validTickers.map(t => {
      const returns = assetData[t].returns.slice(0, minLength);
      return mean(returns) * 252; // Annualized
    });

    const covMatrix = calculateCovarianceMatrix(
      validTickers.map(t => assetData[t].returns.slice(0, minLength))
    ).map(row => row.map(v => v * 252)); // Annualized

    // Calculate portfolio returns with normalized weights
    const portfolioReturns: number[] = [];
    for (let i = 0; i < minLength; i++) {
      let portfolioReturn = 0;
      for (let j = 0; j < validTickers.length; j++) {
        portfolioReturn += assetData[validTickers[j]].returns[i] * normalizedWeights[j];
      }
      portfolioReturns.push(portfolioReturn);
    }

    const benchmarkReturns = assetData[benchmark].returns.slice(0, minLength);
    
    // Calculate base metrics
    const portfolioVar = calculateVariance(portfolioReturns);
    const benchmarkVar = calculateVariance(benchmarkReturns);
    const covariance = calculateCovariance(portfolioReturns, benchmarkReturns);
    const beta = covariance / benchmarkVar;
    const portfolioVolatility = Math.sqrt(portfolioVar) * Math.sqrt(252);
    const benchmarkVolatility = Math.sqrt(benchmarkVar) * Math.sqrt(252);
    const correlation = covariance / (Math.sqrt(portfolioVar) * Math.sqrt(benchmarkVar));

    // CAGR
    const portfolioCumReturns = calculateCumulativeReturns(portfolioReturns);
    const benchmarkCumReturns = calculateCumulativeReturns(benchmarkReturns);
    const actualYears = minLength / 252;
    const portfolioCagr = portfolioCumReturns.length > 0 ? Math.pow(portfolioCumReturns[portfolioCumReturns.length - 1], 1 / actualYears) - 1 : 0;
    const benchmarkCagr = benchmarkCumReturns.length > 0 ? Math.pow(benchmarkCumReturns[benchmarkCumReturns.length - 1], 1 / actualYears) - 1 : 0;

    // 12-month return
    const days252 = Math.min(252, minLength);
    const portfolio12m = portfolioReturns.slice(-days252).reduce((acc, r) => acc * (1 + r), 1) - 1;
    const benchmark12m = benchmarkReturns.slice(-days252).reduce((acc, r) => acc * (1 + r), 1) - 1;

    // Sharpe ratio
    const portfolioMeanReturn = mean(portfolioReturns) * 252;
    const benchmarkMeanReturn = mean(benchmarkReturns) * 252;
    const portfolioSharpe = (portfolioMeanReturn - riskFreeRate) / portfolioVolatility;
    const benchmarkSharpe = (benchmarkMeanReturn - riskFreeRate) / benchmarkVolatility;

    // Correlation matrix
    const correlationMatrix: number[][] = [];
    const highCorrelationPairs: Array<{ticker1: string, ticker2: string, correlation: number}> = [];
    
    for (let i = 0; i < validTickers.length; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < validTickers.length; j++) {
        const corr = calculateCorrelation(
          assetData[validTickers[i]].returns.slice(0, minLength),
          assetData[validTickers[j]].returns.slice(0, minLength)
        );
        correlationMatrix[i][j] = corr;
        
        if (i < j && Math.abs(corr) > 0.85) {
          highCorrelationPairs.push({
            ticker1: validTickers[i],
            ticker2: validTickers[j],
            correlation: corr
          });
        }
      }
    }

    // Performance data
    const performanceDates = assetData[benchmark].dates.slice(0, minLength);
    
    // CAGR data
    const cagrData = [];
    for (const ticker of validTickers) {
      const assetCumReturns = calculateCumulativeReturns(assetData[ticker].returns.slice(0, minLength));
      const assetCagr = assetCumReturns.length > 0 ? Math.pow(assetCumReturns[assetCumReturns.length - 1], 1 / actualYears) - 1 : 0;
      cagrData.push({ ticker, cagr: assetCagr });
    }

    for (const benchmarkTicker of ['SPY', 'QQQ', 'DIA']) {
      if (assetData[benchmarkTicker]) {
        const benchCumReturns = calculateCumulativeReturns(assetData[benchmarkTicker].returns.slice(0, minLength));
        const benchCagr = benchCumReturns.length > 0 ? Math.pow(benchCumReturns[benchCumReturns.length - 1], 1 / actualYears) - 1 : 0;
        cagrData.push({ ticker: benchmarkTicker, cagr: benchCagr, isBenchmark: benchmarkTicker === benchmark });
      }
    }
    cagrData.push({ ticker: 'Cartera', cagr: portfolioCagr, isPortfolio: true });

    // Build base result
    const result: any = {
      portfolioMetrics: {
        beta,
        volatility: portfolioVolatility,
        cagr: portfolioCagr,
        return12m: portfolio12m,
        correlation,
        sharpeRatio: portfolioSharpe,
      },
      benchmarkMetrics: {
        volatility: benchmarkVolatility,
        cagr: benchmarkCagr,
        return12m: benchmark12m,
        sharpeRatio: benchmarkSharpe,
      },
      correlationData: {
        matrix: correlationMatrix,
        tickers: validTickers,
        highCorrelationPairs,
      },
      performanceData: {
        dates: performanceDates,
        portfolioValues: portfolioCumReturns,
        benchmarkValues: benchmarkCumReturns,
      },
      cagrData,
      weights: normalizedWeights,
      tickers: validTickers,
      benchmark,
    };

    // Monte Carlo Optimization (mode === 'optimize')
    if (mode === 'optimize' && validTickers.length >= 2) {
      console.log('Running Monte Carlo optimization...');
      
      const numPortfolios = 5000;
      const randomPortfolios = generateRandomPortfolios(
        numPortfolios, 
        meanReturns, 
        covMatrix, 
        validTickers,
        riskFreeRate,
        minWeight
      );

      // Find Max Sharpe portfolio
      let maxSharpeIdx = 0;
      for (let i = 1; i < randomPortfolios.sharpe.length; i++) {
        if (randomPortfolios.sharpe[i] > randomPortfolios.sharpe[maxSharpeIdx]) {
          maxSharpeIdx = i;
        }
      }

      // Find Min Volatility portfolio
      let minVolIdx = 0;
      for (let i = 1; i < randomPortfolios.volatility.length; i++) {
        if (randomPortfolios.volatility[i] < randomPortfolios.volatility[minVolIdx]) {
          minVolIdx = i;
        }
      }

      const maxSharpe: OptimizedPortfolio = {
        name: 'Max Sharpe',
        returns: randomPortfolios.returns[maxSharpeIdx],
        volatility: randomPortfolios.volatility[maxSharpeIdx],
        sharpe: randomPortfolios.sharpe[maxSharpeIdx],
        weights: validTickers.map((t, i) => ({ asset: t, weight: randomPortfolios.weights[maxSharpeIdx][i] }))
      };

      const minVolatility: OptimizedPortfolio = {
        name: 'Min Volatilidad',
        returns: randomPortfolios.returns[minVolIdx],
        volatility: randomPortfolios.volatility[minVolIdx],
        sharpe: randomPortfolios.sharpe[minVolIdx],
        weights: validTickers.map((t, i) => ({ asset: t, weight: randomPortfolios.weights[minVolIdx][i] }))
      };

      // Target return portfolio (if specified)
      let targetReturnPortfolio: OptimizedPortfolio | undefined;
      if (targetReturn !== undefined) {
        const targetIdx = findTargetReturnPortfolio(randomPortfolios, targetReturn);
        if (targetIdx >= 0) {
          targetReturnPortfolio = {
            name: `Target ${(targetReturn * 100).toFixed(1)}%`,
            returns: randomPortfolios.returns[targetIdx],
            volatility: randomPortfolios.volatility[targetIdx],
            sharpe: randomPortfolios.sharpe[targetIdx],
            weights: validTickers.map((t, i) => ({ asset: t, weight: randomPortfolios.weights[targetIdx][i] }))
          };
        }
      }

      // Calculate efficient frontier
      const efficientFrontier = calculateEfficientFrontier(randomPortfolios, 50);

      result.optimization = {
        maxSharpe,
        minVolatility,
        targetReturn: targetReturnPortfolio,
        efficientFrontier,
        randomPortfolios: {
          returns: randomPortfolios.returns.slice(0, 2000), // Limit for response size
          volatility: randomPortfolios.volatility.slice(0, 2000),
          sharpe: randomPortfolios.sharpe.slice(0, 2000),
        },
        invalidTickers,
      };
    }

    // Calculate VaR
    const varData = calculateVaR(portfolioReturns, benchmarkReturns, riskFreeRate);
    result.varData = varData;

    // Calculate Stress Test
    const spyReturns = assetData['SPY']?.returns.slice(0, minLength) || benchmarkReturns;
    const portfolioBeta = calculateBeta(portfolioReturns, spyReturns);
    
    const stressTest = calculateStressTest(portfolioBeta, benchmark, assetData['SPY'] ? 
      calculateBeta(benchmarkReturns, spyReturns) : 1);
    result.stressTest = stressTest;

    console.log('Portfolio optimization completed successfully');
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in portfolio optimizer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ============== Helper Functions ==============

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function normalizeWeights(weights: number[]): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / total);
}

function calculateVariance(returns: number[]): number {
  const m = mean(returns);
  return returns.reduce((acc, r) => acc + Math.pow(r - m, 2), 0) / returns.length;
}

function calculateCovariance(returns1: number[], returns2: number[]): number {
  const mean1 = mean(returns1);
  const mean2 = mean(returns2);
  let cov = 0;
  for (let i = 0; i < returns1.length; i++) {
    cov += (returns1[i] - mean1) * (returns2[i] - mean2);
  }
  return cov / returns1.length;
}

function calculateCorrelation(returns1: number[], returns2: number[]): number {
  const cov = calculateCovariance(returns1, returns2);
  const var1 = calculateVariance(returns1);
  const var2 = calculateVariance(returns2);
  return cov / (Math.sqrt(var1) * Math.sqrt(var2));
}

function calculateCumulativeReturns(returns: number[]): number[] {
  const cumReturns = [];
  let cumProduct = 1;
  for (const r of returns) {
    cumProduct *= (1 + r);
    cumReturns.push(cumProduct);
  }
  return cumReturns;
}

function calculateCovarianceMatrix(returnsArrays: number[][]): number[][] {
  const n = returnsArrays.length;
  const matrix: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = calculateCovariance(returnsArrays[i], returnsArrays[j]);
    }
  }
  return matrix;
}

function calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
  const cov = calculateCovariance(portfolioReturns, benchmarkReturns);
  const benchVar = calculateVariance(benchmarkReturns);
  return benchVar !== 0 ? cov / benchVar : 1;
}

// Monte Carlo portfolio generation
function generateRandomPortfolios(
  numPortfolios: number,
  meanReturns: number[],
  covMatrix: number[][],
  tickers: string[],
  riskFreeRate: number,
  minWeight: number
): { returns: number[], volatility: number[], sharpe: number[], weights: number[][] } {
  const numAssets = tickers.length;
  const results = {
    returns: [] as number[],
    volatility: [] as number[],
    sharpe: [] as number[],
    weights: [] as number[][]
  };

  for (let p = 0; p < numPortfolios * 2 && results.returns.length < numPortfolios; p++) {
    // Generate random weights using Dirichlet-like distribution
    const randomWeights = generateDirichletWeights(numAssets);
    
    // Check minimum weight constraint
    if (minWeight > 0 && randomWeights.some(w => w < minWeight)) {
      continue;
    }

    // Calculate portfolio return: w^T * mu
    let portfolioReturn = 0;
    for (let i = 0; i < numAssets; i++) {
      portfolioReturn += randomWeights[i] * meanReturns[i];
    }

    // Calculate portfolio volatility: sqrt(w^T * Sigma * w)
    let portfolioVariance = 0;
    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j < numAssets; j++) {
        portfolioVariance += randomWeights[i] * randomWeights[j] * covMatrix[i][j];
      }
    }
    const portfolioVol = Math.sqrt(portfolioVariance);

    // Calculate Sharpe ratio
    const sharpe = portfolioVol !== 0 ? (portfolioReturn - riskFreeRate) / portfolioVol : 0;

    results.returns.push(portfolioReturn);
    results.volatility.push(portfolioVol);
    results.sharpe.push(sharpe);
    results.weights.push(randomWeights);
  }

  return results;
}

function generateDirichletWeights(n: number): number[] {
  // Simple Dirichlet distribution approximation using gamma distribution
  const alpha = 1; // Uniform prior
  const weights: number[] = [];
  let sum = 0;
  
  for (let i = 0; i < n; i++) {
    // Approximate gamma(1) = exponential(1)
    const gamma = -Math.log(Math.random());
    weights.push(gamma);
    sum += gamma;
  }
  
  return weights.map(w => w / sum);
}

function findTargetReturnPortfolio(portfolios: { returns: number[], volatility: number[], sharpe: number[], weights: number[][] }, targetReturn: number): number {
  let bestIdx = -1;
  let bestVol = Infinity;
  const tolerance = 0.02; // 2% tolerance
  
  for (let i = 0; i < portfolios.returns.length; i++) {
    if (Math.abs(portfolios.returns[i] - targetReturn) < tolerance) {
      if (portfolios.volatility[i] < bestVol) {
        bestVol = portfolios.volatility[i];
        bestIdx = i;
      }
    }
  }
  
  return bestIdx;
}

function calculateEfficientFrontier(
  portfolios: { returns: number[], volatility: number[], sharpe: number[] },
  numPoints: number
): { returns: number[], volatility: number[] } {
  const minRet = Math.min(...portfolios.returns);
  const maxRet = Math.max(...portfolios.returns);
  const step = (maxRet - minRet) / numPoints;
  
  const frontierReturns: number[] = [];
  const frontierVol: number[] = [];
  
  for (let targetRet = minRet; targetRet <= maxRet; targetRet += step) {
    let minVol = Infinity;
    
    for (let i = 0; i < portfolios.returns.length; i++) {
      if (portfolios.returns[i] >= targetRet - 0.005 && portfolios.returns[i] <= targetRet + 0.005) {
        if (portfolios.volatility[i] < minVol) {
          minVol = portfolios.volatility[i];
        }
      }
    }
    
    if (minVol < Infinity) {
      frontierReturns.push(targetRet);
      frontierVol.push(minVol);
    }
  }
  
  return { returns: frontierReturns, volatility: frontierVol };
}

// VaR calculation (parametric, 95% confidence)
function calculateVaR(
  portfolioReturns: number[], 
  benchmarkReturns: number[],
  riskFreeRate: number
): Array<{ portfolio: string, var1d: number, var10d: number }> {
  const z95 = 1.645; // Z-score for 95% confidence
  
  const portfolioMean = mean(portfolioReturns);
  const portfolioStd = Math.sqrt(calculateVariance(portfolioReturns));
  const var1dPortfolio = -(portfolioMean - z95 * portfolioStd) * 100;
  const var10dPortfolio = var1dPortfolio * Math.sqrt(10);
  
  const benchmarkMean = mean(benchmarkReturns);
  const benchmarkStd = Math.sqrt(calculateVariance(benchmarkReturns));
  const var1dBenchmark = -(benchmarkMean - z95 * benchmarkStd) * 100;
  const var10dBenchmark = var1dBenchmark * Math.sqrt(10);
  
  return [
    { portfolio: 'Cartera', var1d: var1dPortfolio, var10d: var10dPortfolio },
    { portfolio: 'Benchmark', var1d: var1dBenchmark, var10d: var10dBenchmark },
  ];
}

// Stress test calculation
function calculateStressTest(
  portfolioBeta: number,
  benchmark: string,
  benchmarkBeta: number
): { hypothetical: Array<{ portfolio: string, scenarios: Record<string, number> }>, 
     historical: Array<{ portfolio: string, scenarios: Record<string, number> }> } {
  
  const hypothetical: Array<{ portfolio: string, scenarios: Record<string, number> }> = [];
  const historical: Array<{ portfolio: string, scenarios: Record<string, number> }> = [];
  
  // Portfolio stress scenarios
  const portfolioHypScenarios: Record<string, number> = {};
  const portfolioHistScenarios: Record<string, number> = {};
  
  for (const shock of HYPOTHETICAL_SHOCKS) {
    portfolioHypScenarios[`SPY ${(shock * 100).toFixed(0)}%`] = portfolioBeta * shock * 100;
  }
  
  for (const scenario of HISTORICAL_SCENARIOS) {
    portfolioHistScenarios[scenario.name] = portfolioBeta * scenario.shockSpy * 100;
  }
  
  hypothetical.push({ portfolio: 'Cartera', scenarios: portfolioHypScenarios });
  historical.push({ portfolio: 'Cartera', scenarios: portfolioHistScenarios });
  
  // Benchmark stress scenarios
  const benchmarkHypScenarios: Record<string, number> = {};
  const benchmarkHistScenarios: Record<string, number> = {};
  
  for (const shock of HYPOTHETICAL_SHOCKS) {
    benchmarkHypScenarios[`SPY ${(shock * 100).toFixed(0)}%`] = benchmarkBeta * shock * 100;
  }
  
  for (const scenario of HISTORICAL_SCENARIOS) {
    benchmarkHistScenarios[scenario.name] = benchmarkBeta * scenario.shockSpy * 100;
  }
  
  hypothetical.push({ portfolio: benchmark, scenarios: benchmarkHypScenarios });
  historical.push({ portfolio: benchmark, scenarios: benchmarkHistScenarios });
  
  // SPY reference (beta = 1)
  const spyHypScenarios: Record<string, number> = {};
  const spyHistScenarios: Record<string, number> = {};
  
  for (const shock of HYPOTHETICAL_SHOCKS) {
    spyHypScenarios[`SPY ${(shock * 100).toFixed(0)}%`] = shock * 100;
  }
  
  for (const scenario of HISTORICAL_SCENARIOS) {
    spyHistScenarios[scenario.name] = scenario.shockSpy * 100;
  }
  
  hypothetical.push({ portfolio: 'SPY', scenarios: spyHypScenarios });
  historical.push({ portfolio: 'SPY', scenarios: spyHistScenarios });
  
  return { hypothetical, historical };
}
