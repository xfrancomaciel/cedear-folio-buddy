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
}

interface AssetData {
  ticker: string;
  prices: number[];
  returns: number[];
  dates: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: OptimizerInput = await req.json();
    console.log('Portfolio optimizer input:', input);

    const { tickers, weights, benchmark, years } = input;

    // Validate input
    if (!tickers || tickers.length === 0) {
      throw new Error('Debe ingresar al menos 1 ticker');
    }

    if (weights.length !== tickers.length) {
      throw new Error('La cantidad de pesos debe coincidir con los tickers');
    }

    // Get all symbols including benchmarks
    const allSymbols = [...tickers, benchmark, 'SPY', 'QQQ', 'DIA'].filter((v, i, a) => a.indexOf(v) === i);
    
    // Fetch historical data from Yahoo Finance
    const assetData: Record<string, AssetData> = {};
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - years);

    console.log(`Fetching data for symbols: ${allSymbols.join(', ')}`);
    console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    for (const symbol of allSymbols) {
      try {
        const period1 = Math.floor(startDate.getTime() / 1000);
        const period2 = Math.floor(endDate.getTime() / 1000);
        
        const url = `https://query1.finance.yahoo.com/v7/finance/download/${symbol}?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`;
        
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch data for ${symbol}: ${response.status}`);
          continue;
        }

        const csvText = await response.text();
        const lines = csvText.trim().split('\\n');
        const header = lines[0].split(',');
        
        const adjCloseIndex = header.findIndex(h => h === 'Adj Close');
        if (adjCloseIndex === -1) {
          console.warn(`No Adj Close column found for ${symbol}`);
          continue;
        }

        const prices: number[] = [];
        const dates: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const price = parseFloat(values[adjCloseIndex]);
          const date = values[0];
          
          if (!isNaN(price) && date) {
            prices.push(price);
            dates.push(date);
          }
        }

        if (prices.length < 2) {
          console.warn(`Insufficient data for ${symbol}`);
          continue;
        }

        // Calculate returns
        const returns: number[] = [];
        for (let i = 1; i < prices.length; i++) {
          returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }

        assetData[symbol] = { ticker: symbol, prices, returns, dates };
        console.log(`Successfully fetched ${prices.length} data points for ${symbol}`);
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }

    // Ensure we have data for all required tickers and benchmark
    const missingTickers = tickers.filter(t => !assetData[t]);
    if (missingTickers.length > 0) {
      throw new Error(`No se pudieron obtener datos para: ${missingTickers.join(', ')}`);
    }

    if (!assetData[benchmark]) {
      throw new Error(`No se pudieron obtener datos para el benchmark: ${benchmark}`);
    }

    // Find common date range
    const minLength = Math.min(...tickers.map(t => assetData[t].returns.length), assetData[benchmark].returns.length);
    if (minLength < 252) {
      console.warn(`Limited data available: ${minLength} trading days`);
    }

    // Calculate portfolio returns
    const portfolioReturns: number[] = [];
    for (let i = 0; i < minLength; i++) {
      let portfolioReturn = 0;
      for (let j = 0; j < tickers.length; j++) {
        portfolioReturn += assetData[tickers[j]].returns[i] * weights[j];
      }
      portfolioReturns.push(portfolioReturn);
    }

    // Calculate portfolio metrics
    const benchmarkReturns = assetData[benchmark].returns.slice(0, minLength);
    
    // Beta
    const portfolioVar = calculateVariance(portfolioReturns);
    const benchmarkVar = calculateVariance(benchmarkReturns);
    const covariance = calculateCovariance(portfolioReturns, benchmarkReturns);
    const beta = covariance / benchmarkVar;

    // Volatility (annualized)
    const portfolioVolatility = Math.sqrt(portfolioVar) * Math.sqrt(252);
    const benchmarkVolatility = Math.sqrt(benchmarkVar) * Math.sqrt(252);

    // Correlation
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

    // Sharpe ratio (assuming 0% risk-free rate)
    const portfolioMeanReturn = portfolioReturns.reduce((acc, r) => acc + r, 0) / portfolioReturns.length * 252;
    const benchmarkMeanReturn = benchmarkReturns.reduce((acc, r) => acc + r, 0) / benchmarkReturns.length * 252;
    const portfolioSharpe = portfolioMeanReturn / portfolioVolatility;
    const benchmarkSharpe = benchmarkMeanReturn / benchmarkVolatility;

    // Correlation matrix
    const correlationMatrix: number[][] = [];
    const highCorrelationPairs: Array<{ticker1: string, ticker2: string, correlation: number}> = [];
    
    for (let i = 0; i < tickers.length; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < tickers.length; j++) {
        const corr = calculateCorrelation(
          assetData[tickers[i]].returns.slice(0, minLength),
          assetData[tickers[j]].returns.slice(0, minLength)
        );
        correlationMatrix[i][j] = corr;
        
        if (i < j && Math.abs(corr) > 0.85) {
          highCorrelationPairs.push({
            ticker1: tickers[i],
            ticker2: tickers[j],
            correlation: corr
          });
        }
      }
    }

    // Performance data for charts
    const performanceDates = assetData[benchmark].dates.slice(0, minLength);
    
    // CAGR data for individual assets
    const cagrData = [];
    
    // Add individual asset CAGRs
    for (const ticker of tickers) {
      const assetCumReturns = calculateCumulativeReturns(assetData[ticker].returns.slice(0, minLength));
      const assetCagr = assetCumReturns.length > 0 ? Math.pow(assetCumReturns[assetCumReturns.length - 1], 1 / actualYears) - 1 : 0;
      cagrData.push({ ticker, cagr: assetCagr });
    }

    // Add benchmark CAGRs
    for (const benchmarkTicker of ['SPY', 'QQQ', 'DIA']) {
      if (assetData[benchmarkTicker]) {
        const benchCumReturns = calculateCumulativeReturns(assetData[benchmarkTicker].returns.slice(0, minLength));
        const benchCagr = benchCumReturns.length > 0 ? Math.pow(benchCumReturns[benchCumReturns.length - 1], 1 / actualYears) - 1 : 0;
        cagrData.push({ 
          ticker: benchmarkTicker, 
          cagr: benchCagr, 
          isBenchmark: benchmarkTicker === benchmark 
        });
      }
    }

    // Add portfolio CAGR
    cagrData.push({ ticker: 'Cartera', cagr: portfolioCagr, isPortfolio: true });

    const result = {
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
        tickers,
        highCorrelationPairs,
      },
      performanceData: {
        dates: performanceDates,
        portfolioValues: portfolioCumReturns,
        benchmarkValues: benchmarkCumReturns,
      },
      cagrData,
      weights,
      tickers,
      benchmark,
    };

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

// Helper functions
function calculateVariance(returns: number[]): number {
  const mean = returns.reduce((acc, r) => acc + r, 0) / returns.length;
  return returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / returns.length;
}

function calculateCovariance(returns1: number[], returns2: number[]): number {
  const mean1 = returns1.reduce((acc, r) => acc + r, 0) / returns1.length;
  const mean2 = returns2.reduce((acc, r) => acc + r, 0) / returns2.length;
  
  let covariance = 0;
  for (let i = 0; i < returns1.length; i++) {
    covariance += (returns1[i] - mean1) * (returns2[i] - mean2);
  }
  return covariance / returns1.length;
}

function calculateCorrelation(returns1: number[], returns2: number[]): number {
  const covariance = calculateCovariance(returns1, returns2);
  const variance1 = calculateVariance(returns1);
  const variance2 = calculateVariance(returns2);
  return covariance / (Math.sqrt(variance1) * Math.sqrt(variance2));
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