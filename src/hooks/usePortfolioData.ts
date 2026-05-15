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

  // Modo invitado: sin sesión usamos localStorage como almacenamiento principal
  const isGuest = !user?.id;

  const tickers = [...new Set(transactions.map(tx => tx.ticker))];
  const {
    prices: cedearPrices,
    loading: pricesLoading,
    error: pricesError,
    lastUpdated: pricesLastUpdated,
    refresh: refreshPrices
  } = useCedearPrices(tickers);

  // ----- Helpers de localStorage (modo invitado) -----
  const loadFromLocalStorage = () => {
    try {
      const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedPrices = localStorage.getItem(STORAGE_KEYS.CURRENT_PRICES);
      setTransactions(savedTx ? JSON.parse(savedTx) : []);
      setCurrentPrices(savedPrices ? JSON.parse(savedPrices) : {});
    } catch (e) {
      console.error('Error leyendo localStorage:', e);
      setTransactions([]);
      setCurrentPrices({});
    } finally {
      setIsLoading(false);
    }
  };

  const persistTransactions = (txs: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  };
  const persistPrices = (prices: Record<string, CurrentPrice>) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PRICES, JSON.stringify(prices));
  };

  // Migración localStorage -> Supabase cuando hay login
  const migrateLocalStorageData = async () => {
    if (!user?.id) return;
    try {
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedPrices = localStorage.getItem(STORAGE_KEYS.CURRENT_PRICES);

      if (savedTransactions) {
        const localTransactions = JSON.parse(savedTransactions);
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
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      }

      if (savedPrices) {
        const localPrices = JSON.parse(savedPrices);
        const priceArray = Object.values(localPrices) as CurrentPrice[];
        for (const price of priceArray) {
          await supabase.from('current_prices').upsert({
            ticker: price.ticker,
            precio_ars: price.precio_ars,
            usd_rate: price.usd_rate
          });
        }
        localStorage.removeItem(STORAGE_KEYS.CURRENT_PRICES);
      }
    } catch (error) {
      console.error('Error migrando localStorage:', error);
    }
  };

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });

      if (transactionsError) {
        toast({ title: 'Error', description: 'No se pudieron cargar las transacciones', variant: 'destructive' });
      } else {
        const typedTransactions: Transaction[] = (transactionsData || []).map(tx => ({
          ...tx,
          tipo: tx.tipo as 'compra' | 'venta',
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

      const { data: pricesData, error: pErr } = await supabase.from('current_prices').select('*');
      if (!pErr) {
        const pricesRecord: Record<string, CurrentPrice> = {};
        pricesData?.forEach(price => { pricesRecord[price.ticker] = price; });
        setCurrentPrices(pricesRecord);
      }
    } catch (error) {
      console.error('Error cargando data Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isGuest) {
      loadFromLocalStorage();
    } else {
      (async () => {
        await migrateLocalStorageData();
        await loadData();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (transactions.length > 0) {
      const mergedPrices = { ...currentPrices };
      Object.entries(cedearPrices).forEach(([ticker, price]) => {
        mergedPrices[ticker] = {
          ticker,
          precio_ars: price.px_close,
          usd_rate: 1000,
          updated_at: price.last_updated
        };
      });
      setPortfolioSummary(calculatePortfolioSummary(transactions, mergedPrices));
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
    const total_ars = transaction.precio_ars * transaction.cantidad;
    const total_usd = total_ars / transaction.usd_rate_historico;

    if (isGuest) {
      const enhanced = enhanceTransaction({
        user_id: 'guest',
        ...transaction,
        total_ars,
        total_usd
      });
      const newTx: Transaction = {
        id: crypto.randomUUID(),
        user_id: 'guest',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categoria: transaction.categoria || 'Inversión',
        ...enhanced
      } as unknown as Transaction;
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      persistTransactions(updated);
      toast({
        title: 'Transacción guardada (local)',
        description: `${transaction.tipo} de ${transaction.cantidad} ${transaction.ticker} guardada en este navegador`
      });
      return;
    }

    try {
      const enhancedTransaction = enhanceTransaction({
        user_id: user!.id,
        ...transaction,
        total_ars,
        total_usd
      });
      const { error } = await supabase.from('transactions').insert({
        user_id: user!.id,
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
      });
      if (error) {
        toast({ title: 'Error', description: 'No se pudo guardar la transacción', variant: 'destructive' });
        return;
      }
      await loadData();
      toast({ title: 'Transacción guardada', description: `${transaction.tipo} de ${transaction.cantidad} ${transaction.ticker}` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Error al guardar la transacción', variant: 'destructive' });
    }
  };

  const updateCurrentPrice = async (ticker: string, precio_ars: number, usd_rate: number) => {
    if (isGuest) {
      const updated = {
        ...currentPrices,
        [ticker]: { ticker, precio_ars, usd_rate, updated_at: new Date().toISOString() }
      };
      setCurrentPrices(updated);
      persistPrices(updated);
      toast({ title: 'Precio actualizado (local)', description: `Precio de ${ticker} guardado en el navegador` });
      return;
    }
    try {
      const { error } = await supabase.from('current_prices').upsert({ ticker, precio_ars, usd_rate });
      if (error) {
        toast({ title: 'Error', description: 'No se pudo actualizar el precio', variant: 'destructive' });
        return;
      }
      setCurrentPrices({
        ...currentPrices,
        [ticker]: { ticker, precio_ars, usd_rate, updated_at: new Date().toISOString() }
      });
      toast({ title: 'Precio actualizado', description: `Precio de ${ticker} actualizado` });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (isGuest) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      persistTransactions(updated);
      toast({ title: 'Transacción eliminada', description: 'Eliminada de este navegador' });
      return;
    }
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) {
        toast({ title: 'Error', description: 'No se pudo eliminar la transacción', variant: 'destructive' });
        return;
      }
      await loadData();
      toast({ title: 'Transacción eliminada', description: 'Eliminada correctamente' });
    } catch (error) {
      console.error(error);
    }
  };

  const clearAllData = async () => {
    if (isGuest) {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PRICES);
      setTransactions([]);
      setCurrentPrices({});
      setPortfolioSummary(null);
      toast({ title: 'Datos eliminados', description: 'Se borraron los datos locales del navegador' });
      return;
    }
    try {
      const { error: txError } = await supabase.from('transactions').delete().eq('user_id', user!.id);
      const { error: pErr } = await supabase.from('current_prices').delete().neq('ticker', 'NONE');
      if (txError || pErr) {
        toast({ title: 'Error', description: 'No se pudieron limpiar todos los datos', variant: 'destructive' });
        return;
      }
      setTransactions([]);
      setCurrentPrices({});
      setPortfolioSummary(null);
      toast({ title: 'Datos eliminados', description: 'Todos los datos fueron eliminados' });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    transactions,
    currentPrices,
    portfolioSummary,
    isLoading,
    isGuest,
    addTransaction,
    updateCurrentPrice,
    deleteTransaction,
    clearAllData,
    cedearPrices,
    pricesLoading,
    pricesError,
    pricesLastUpdated,
    refreshPrices
  };
};
