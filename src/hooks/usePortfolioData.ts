import { useState, useEffect } from 'react';
import { Transaction, CurrentPrice, PortfolioSummary } from '@/types/portfolio';
import { calculatePortfolioSummary, enhanceTransaction } from '@/utils/portfolioCalculations';

const STORAGE_KEYS = {
  TRANSACTIONS: 'cedear-transactions',
  CURRENT_PRICES: 'cedear-current-prices'
};

export const usePortfolioData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, CurrentPrice>>({});
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const savedPrices = localStorage.getItem(STORAGE_KEYS.CURRENT_PRICES);

    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }

    if (savedPrices) {
      try {
        setCurrentPrices(JSON.parse(savedPrices));
      } catch (error) {
        console.error('Error loading prices:', error);
      }
    }
  }, []);

  // Recalculate portfolio summary when data changes
  useEffect(() => {
    if (transactions.length > 0) {
      const summary = calculatePortfolioSummary(transactions, currentPrices);
      setPortfolioSummary(summary);
    } else {
      setPortfolioSummary(null);
    }
  }, [transactions, currentPrices]);

  const addTransaction = (transaction: {
    fecha: string;
    tipo: 'compra' | 'venta';
    ticker: string;
    precio_ars: number;
    cantidad: number;
    usd_rate_historico: number;
  }) => {
    const total_ars = transaction.precio_ars * transaction.cantidad;
    const total_usd = total_ars / transaction.usd_rate_historico;
    
    const enhancedTransaction = enhanceTransaction({
      ...transaction,
      total_ars,
      total_usd
    });

    const newTransaction: Transaction = {
      ...enhancedTransaction,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  };

  const updateCurrentPrice = (ticker: string, precio_ars: number, usd_rate: number) => {
    const updatedPrices = {
      ...currentPrices,
      [ticker]: {
        ticker,
        precio_ars,
        usd_rate,
        updated_at: new Date().toISOString()
      }
    };

    setCurrentPrices(updatedPrices);
    localStorage.setItem(STORAGE_KEYS.CURRENT_PRICES, JSON.stringify(updatedPrices));
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  };

  const clearAllData = () => {
    setTransactions([]);
    setCurrentPrices({});
    setPortfolioSummary(null);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PRICES);
  };

  return {
    transactions,
    currentPrices,
    portfolioSummary,
    addTransaction,
    updateCurrentPrice,
    deleteTransaction,
    clearAllData
  };
};