import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CedearPrice {
  id: string;
  symbol: string;
  px_bid: number;
  px_ask: number;
  px_mid: number;
  px_close: number;
  volume: number;
  pct_change: number;
  last_updated: string;
}

interface UseCedearPricesReturn {
  prices: Record<string, CedearPrice>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useCedearPrices(symbols: string[]): UseCedearPricesReturn {
  const [prices, setPrices] = useState<Record<string, CedearPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('latest_cedear_prices')
        .select('*')
        .in('symbol', symbols.map(s => s.toUpperCase()));

      if (fetchError) {
        throw fetchError;
      }

      const pricesMap: Record<string, CedearPrice> = {};
      data?.forEach(item => {
        pricesMap[item.symbol] = {
          id: item.id,
          symbol: item.symbol,
          px_bid: item.px_bid,
          px_ask: item.px_ask,
          px_mid: item.px_mid,
          px_close: item.px_close,
          volume: item.volume,
          pct_change: item.pct_change,
          last_updated: item.last_updated
        };
      });

      setPrices(pricesMap);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching prices';
      setError(errorMessage);
      console.error('Error fetching CEDEAR prices:', err);
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('cedear_prices_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'cedear_prices' },
        () => {
          console.log('New CEDEAR price data available, refreshing...');
          fetchPrices();
        }
      )
      .subscribe();

    // Refresh every 2 minutes as fallback
    const refreshInterval = setInterval(fetchPrices, 120000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [fetchPrices]);

  return {
    prices,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

export function useCedearPrice(symbol: string) {
  const { prices, loading, error, lastUpdated, refresh } = useCedearPrices([symbol]);
  
  return {
    price: prices[symbol.toUpperCase()] || null,
    loading,
    error,
    lastUpdated,
    refresh
  };
}