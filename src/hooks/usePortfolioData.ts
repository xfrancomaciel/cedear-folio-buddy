import { useState, useEffect } from 'react';
import { Transaction, CurrentPrice, PortfolioSummary, TransactionCategory } from '@/types/portfolio';
import { calculatePortfolioSummary, enhanceTransaction } from '@/utils/portfolioCalculations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCedearPrices } from './useCedearPrices';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEYS = {
  TRANSACTIONS: 'cedear-transactions',
  CURRENT_PRICES: 'cedear-current-prices'
};

export const usePortfolioData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, CurrentPrice>>({});
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get unique tickers from transactions for real-time price updates
  const tickers = [...new Set(transactions.map(tx => tx.ticker))];
  const { 
    prices: cedearPrices, 
    loading: pricesLoading, 
    error: pricesError,
    lastUpdated: pricesLastUpdated,
    refresh: refreshPrices
  } = useCedearPrices(tickers);

  // Migrate localStorage data to Supabase
  const migrateLocalStorageData = async () => {
    if (!user?.id) return;
    
    try {
      // Check if we have localStorage data to migrate
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedPrices = localStorage.getItem(STORAGE_KEYS.CURRENT_PRICES);

      if (savedTransactions) {
        const localTransactions = JSON.parse(savedTransactions);
        console.log('Migrating', localTransactions.length, 'transactions to Supabase...');
        
        // Insert each transaction into Supabase
        for (const tx of localTransactions) {
          const enhanced = enhanceTransaction({
            user_id: user.id,
            fecha: tx.fecha,
            tipo: tx.tipo,
            ticker: tx.ticker,
            precio_ars: tx.precio_ars,
            cantidad: tx.cantidad,
            usd_rate_historico: tx.usd_rate_historico,
            total_ars: tx.total_ars,
            total_usd: tx.total_usd
          });

          await supabase.from('transactions').insert({
            user_id: user.id,
            fecha: enhanced.fecha,
            tipo: enhanced.tipo,
            ticker: enhanced.ticker,
            precio_ars: enhanced.precio_ars,
            cantidad: enhanced.cantidad,
            usd_rate_historico: enhanced.usd_rate_historico,
            total_ars: enhanced.total_ars,
            total_usd: enhanced.total_usd,
            usd_por_cedear: enhanced.usd_por_cedear,
            cantidad_acciones_reales: enhanced.cantidad_acciones_reales,
            precio_accion_usd: enhanced.precio_accion_usd,
            dias_tenencia: enhanced.dias_tenencia
          });
        }
        
        // Clear localStorage after successful migration
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        console.log('Transactions migrated successfully');
      }

      if (savedPrices) {
        const localPrices = JSON.parse(savedPrices);
        const priceArray = Object.values(localPrices) as CurrentPrice[];
        
        if (priceArray.length > 0) {
          console.log('Migrating', priceArray.length, 'prices to Supabase...');
          
          for (const price of priceArray) {
            await supabase.from('current_prices').upsert({
              ticker: price.ticker,
              precio_ars: price.precio_ars,
              usd_rate: price.usd_rate
            });
          }
          
          localStorage.removeItem(STORAGE_KEYS.CURRENT_PRICES);
          console.log('Prices migrated successfully');
        }
      }
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
      toast({
        title: "Error de migración",
        description: "Error al migrar datos locales a Supabase",
        variant: "destructive"
      });
    }
  };

  // Load data from Supabase
  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Load transactions for current user only
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
        toast({
          title: "Error",
          description: "No se pudieron cargar las transacciones",
          variant: "destructive"
        });
      } else {
        // Type-safe mapping from Supabase data to our Transaction type
        const typedTransactions: Transaction[] = (transactionsData || []).map(tx => ({
          ...tx,
          tipo: tx.tipo as 'compra' | 'venta', // Type assertion for enum
          fecha: tx.fecha,
          precio_ars: Number(tx.precio_ars),
          cantidad: Number(tx.cantidad),
          usd_rate_historico: Number(tx.usd_rate_historico),
          total_ars: Number(tx.total_ars),
          total_usd: Number(tx.total_usd),
          usd_por_cedear: Number(tx.usd_por_cedear),
          cantidad_acciones_reales: Number(tx.cantidad_acciones_reales),
          precio_accion_usd: Number(tx.precio_accion_usd),
          dias_tenencia: Number(tx.dias_tenencia)
        }));
        setTransactions(typedTransactions);
      }

      // Load current prices
      const { data: pricesData, error: pricesError } = await supabase
        .from('current_prices')
        .select('*');

      if (pricesError) {
        console.error('Error loading prices:', pricesError);
      } else {
        const pricesRecord: Record<string, CurrentPrice> = {};
        pricesData?.forEach(price => {
          pricesRecord[price.ticker] = price;
        });
        setCurrentPrices(pricesRecord);
      }
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (user?.id) {
        // First try to migrate any existing localStorage data
        await migrateLocalStorageData();
        // Then load all data from Supabase
        await loadData();
      }
    };
    
    initializeData();
  }, [user?.id]);

  // Recalculate portfolio summary when data changes
  useEffect(() => {
    if (transactions.length > 0) {
      // Merge CEDEAR prices with current prices format
      const mergedPrices = { ...currentPrices };
      
      Object.entries(cedearPrices).forEach(([ticker, price]) => {
        mergedPrices[ticker] = {
          ticker,
          precio_ars: price.px_close,
          usd_rate: 1000, // Default rate for now
          updated_at: price.last_updated
        };
      });

      const summary = calculatePortfolioSummary(transactions, mergedPrices);
      setPortfolioSummary(summary);
    } else {
      setPortfolioSummary(null);
    }
  }, [transactions, currentPrices, cedearPrices]);

  const addTransaction = async (transaction: {
    fecha: string;
    tipo: 'compra' | 'venta';
    ticker: string;
    precio_ars: number;
    cantidad: number;
    usd_rate_historico: number;
    categoria?: TransactionCategory;
  }) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para agregar transacciones",
        variant: "destructive"
      });
      return;
    }

    try {
      const total_ars = transaction.precio_ars * transaction.cantidad;
      const total_usd = total_ars / transaction.usd_rate_historico;
      
      const enhancedTransaction = enhanceTransaction({
        user_id: user.id,
        ...transaction,
        total_ars,
        total_usd
      });

      const { data, error } = await supabase.from('transactions').insert({
        user_id: user.id,
        fecha: enhancedTransaction.fecha,
        tipo: enhancedTransaction.tipo,
        ticker: enhancedTransaction.ticker,
        precio_ars: enhancedTransaction.precio_ars,
        cantidad: enhancedTransaction.cantidad,
        usd_rate_historico: enhancedTransaction.usd_rate_historico,
        total_ars: enhancedTransaction.total_ars,
        total_usd: enhancedTransaction.total_usd,
        usd_por_cedear: enhancedTransaction.usd_por_cedear,
        cantidad_acciones_reales: enhancedTransaction.cantidad_acciones_reales,
        precio_accion_usd: enhancedTransaction.precio_accion_usd,
        dias_tenencia: enhancedTransaction.dias_tenencia,
        categoria: transaction.categoria || 'Inversión'
      }).select().single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la transacción",
          variant: "destructive"
        });
        return;
      }

      // Reload data after successful insert
      await loadData();
      
      toast({
        title: "Transacción guardada",
        description: `${transaction.tipo} de ${transaction.cantidad} ${transaction.ticker} guardada en Supabase`,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Error al guardar la transacción",
        variant: "destructive"
      });
    }
  };

  const updateCurrentPrice = async (ticker: string, precio_ars: number, usd_rate: number) => {
    try {
      const { error } = await supabase.from('current_prices').upsert({
        ticker,
        precio_ars,
        usd_rate
      });

      if (error) {
        console.error('Error updating price:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el precio",
          variant: "destructive"
        });
        return;
      }

      // Update local state
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
      
      toast({
        title: "Precio actualizado",
        description: `Precio de ${ticker} actualizado en Supabase`,
      });
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el precio",
        variant: "destructive"
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la transacción",
          variant: "destructive"
        });
        return;
      }

      // Reload data after successful delete
      await loadData();
      
      toast({
        title: "Transacción eliminada",
        description: "La transacción fue eliminada de Supabase",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la transacción",
        variant: "destructive"
      });
    }
  };

  const clearAllData = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar datos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Delete all user's transactions and prices
      const { error: txError } = await supabase.from('transactions').delete().eq('user_id', user.id);
      const { error: pricesError } = await supabase.from('current_prices').delete().neq('ticker', 'NONE');

      if (txError || pricesError) {
        console.error('Error clearing data:', txError || pricesError);
        toast({
          title: "Error",
          description: "No se pudieron limpiar todos los datos",
          variant: "destructive"
        });
        return;
      }

      // Clear local state
      setTransactions([]);
      setCurrentPrices({});
      setPortfolioSummary(null);
      
      toast({
        title: "Datos eliminados",
        description: "Todos los datos fueron eliminados de Supabase",
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Error al limpiar los datos",
        variant: "destructive"
      });
    }
  };

  return {
    transactions,
    currentPrices,
    portfolioSummary,
    isLoading,
    addTransaction,
    updateCurrentPrice,
    deleteTransaction,
    clearAllData,
    // CEDEAR prices data
    cedearPrices,
    pricesLoading,
    pricesError,
    pricesLastUpdated,
    refreshPrices
  };
};