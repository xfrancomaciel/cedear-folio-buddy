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
    ratio: 15,
    sector: 'Consumer Discretionary'
  },
  'META': {
    ticker: 'META',
    nombre: 'Meta Platforms, Inc.',
    ratio: 12,
    sector: 'Technology'
  },
  'NFLX': {
    ticker: 'NFLX',
    nombre: 'Netflix, Inc.',
    ratio: 25,
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
    ratio: 6,
    sector: 'Communication Services'
  },
  'JPM': {
    ticker: 'JPM',
    nombre: 'JPMorgan Chase & Co.',
    ratio: 15,
    sector: 'Financials'
  },
  'V': {
    ticker: 'V',
    nombre: 'Visa Inc.',
    ratio: 44,
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
    ratio: 7,
    sector: 'Energy'
  },
  'PFE': {
    ticker: 'PFE',
    nombre: 'Pfizer Inc.',
    ratio: 5,
    sector: 'Healthcare'
  },
  'BABA': {
    ticker: 'BABA',
    nombre: 'Alibaba Group Holding Limited',
    ratio: 3,
    sector: 'Consumer Discretionary'
  },
  'GOLD': {
    ticker: 'GOLD',
    nombre: 'Barrick Gold Corporation',
    ratio: 2,
    sector: 'Materials'
  },
  'JNJ': {
    ticker: 'JNJ',
    nombre: 'Johnson & Johnson',
    ratio: 8,
    sector: 'Healthcare'
  },
  'WMT': {
    ticker: 'WMT',
    nombre: 'Walmart Inc.',
    ratio: 6,
    sector: 'Consumer Staples'
  },
  'PG': {
    ticker: 'PG',
    nombre: 'The Procter & Gamble Company',
    ratio: 12,
    sector: 'Consumer Staples'
  },
  'HD': {
    ticker: 'HD',
    nombre: 'The Home Depot, Inc.',
    ratio: 20,
    sector: 'Consumer Discretionary'
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

export const calculateUnderlyingShares = (ticker: string, cedearQuantity: number): number => {
  const cedearsInfo = getCEDEARInfo(ticker);
  if (!cedearsInfo) {
    throw new Error(`Ratio no encontrado para ticker: ${ticker}`);
  }
  return cedearQuantity / cedearsInfo.ratio;
};

export const validateTransaction = (transaction: {
  ticker?: string;
  precio_ars?: number;
  cantidad?: number;
  usd_rate_historico?: number;
  fecha?: string;
}): string[] => {
  const errors: string[] = [];
  
  if (!transaction.ticker || !isValidTicker(transaction.ticker)) {
    errors.push(`Ticker inválido: ${transaction.ticker}. Debe ser un CEDEAR válido.`);
  }
  
  if (!transaction.precio_ars || transaction.precio_ars <= 0) {
    errors.push("Precio en ARS debe ser mayor a 0");
  }
  
  if (!transaction.cantidad || transaction.cantidad <= 0 || !Number.isInteger(transaction.cantidad)) {
    errors.push("Cantidad debe ser un número entero positivo");
  }
  
  if (!transaction.usd_rate_historico || transaction.usd_rate_historico <= 0) {
    errors.push("Tipo de cambio USD debe ser mayor a 0");
  }
  
  if (!transaction.fecha || new Date(transaction.fecha) > new Date()) {
    errors.push("Fecha no puede ser futura");
  }
  
  return errors;
};