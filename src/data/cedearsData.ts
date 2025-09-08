import { CEDEARInfo } from '@/types/portfolio';

export const CEDEAR_RATIOS: Record<string, CEDEARInfo> = {
  'AAPL': {
    ticker: 'AAPL',
    nombre: 'Apple Inc.',
    ratio: 20,
    sector: 'Technology'
  },
  'NVDA': {
    ticker: 'NVDA', 
    nombre: 'NVIDIA Corporation',
    ratio: 24,
    sector: 'Technology'
  },
  'TSLA': {
    ticker: 'TSLA',
    nombre: 'Tesla, Inc.',
    ratio: 10,
    sector: 'Consumer Discretionary'
  },
  'GOOGL': {
    ticker: 'GOOGL',
    nombre: 'Alphabet Inc.',
    ratio: 40,
    sector: 'Technology'
  },
  'MSFT': {
    ticker: 'MSFT',
    nombre: 'Microsoft Corporation',
    ratio: 8,
    sector: 'Technology'
  },
  'AMZN': {
    ticker: 'AMZN',
    nombre: 'Amazon.com, Inc.',
    ratio: 40,
    sector: 'Consumer Discretionary'
  },
  'META': {
    ticker: 'META',
    nombre: 'Meta Platforms, Inc.',
    ratio: 8,
    sector: 'Technology'
  },
  'NFLX': {
    ticker: 'NFLX',
    nombre: 'Netflix, Inc.',
    ratio: 4,
    sector: 'Communication Services'
  },
  'KO': {
    ticker: 'KO',
    nombre: 'The Coca-Cola Company',
    ratio: 4,
    sector: 'Consumer Staples'
  },
  'DIS': {
    ticker: 'DIS',
    nombre: 'The Walt Disney Company',
    ratio: 4,
    sector: 'Communication Services'
  },
  'JPM': {
    ticker: 'JPM',
    nombre: 'JPMorgan Chase & Co.',
    ratio: 2,
    sector: 'Financials'
  },
  'V': {
    ticker: 'V',
    nombre: 'Visa Inc.',
    ratio: 8,
    sector: 'Financials'
  },
  'BA': {
    ticker: 'BA',
    nombre: 'The Boeing Company',
    ratio: 1,
    sector: 'Industrials'
  },
  'XOM': {
    ticker: 'XOM',
    nombre: 'Exxon Mobil Corporation',
    ratio: 2,
    sector: 'Energy'
  },
  'PFE': {
    ticker: 'PFE',
    nombre: 'Pfizer Inc.',
    ratio: 1,
    sector: 'Healthcare'
  }
};

export const getCEDEARInfo = (ticker: string): CEDEARInfo | null => {
  return CEDEAR_RATIOS[ticker.toUpperCase()] || null;
};

export const getAllTickers = (): string[] => {
  return Object.keys(CEDEAR_RATIOS);
};

export const isValidTicker = (ticker: string): boolean => {
  return ticker.toUpperCase() in CEDEAR_RATIOS;
};