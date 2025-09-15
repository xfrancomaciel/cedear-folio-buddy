import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCedearSectors } from './useCedearSectors';
import { useCedearFilters, filterCedearPrices } from './useCedearFilters';

interface EnhancedCedearPrice {
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

export function useEnhancedCedearPrices() {
  const [allPrices, setAllPrices] = useState<EnhancedCedearPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { sectors, getPopularSymbols, getSectorForSymbol } = useCedearSectors();
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useCedearFilters();

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('latest_cedear_prices')
        .select('*')
        .order('volume', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const prices: EnhancedCedearPrice[] = (data || []).map(item => ({
        id: item.id || '',
        symbol: item.symbol || '',
        px_bid: item.px_bid || 0,
        px_ask: item.px_ask || 0,
        px_mid: item.px_mid || 0,
        px_close: item.px_close || 0,
        volume: item.volume || 0,
        pct_change: item.pct_change || 0,
        last_updated: item.last_updated || new Date().toISOString()
      }));

      setAllPrices(prices);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching prices';
      setError(errorMessage);
      console.error('Error fetching enhanced CEDEAR prices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchPrices();
  }, [fetchPrices]);

  // Create sector mapping for filtering
  const sectorMap = useMemo(() => {
    const map: Record<string, string> = {};
    sectors.forEach(s => {
      map[s.symbol] = s.sector;
    });
    return map;
  }, [sectors]);

  // Create company name mapping
  const companyMap = useMemo(() => {
    const map: Record<string, { sector: string; company_name?: string }> = {};
    sectors.forEach(s => {
      map[s.symbol] = {
        sector: s.sector,
        company_name: s.company_name
      };
    });
    return map;
  }, [sectors]);

  // Get popular symbols for filtering
  const popularSymbols = useMemo(() => getPopularSymbols(), [getPopularSymbols]);

  // Apply filters to prices
  const filteredPrices = useMemo(() => {
    return filterCedearPrices(allPrices, filters, sectorMap, popularSymbols);
  }, [allPrices, filters, sectorMap, popularSymbols]);

  // Calculate price and volume ranges for filter UI
  const priceRange = useMemo(() => {
    if (allPrices.length === 0) return { min: 0, max: 100000 };
    const prices = allPrices.map(p => p.px_close).filter(p => p > 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [allPrices]);

  const volumeRange = useMemo(() => {
    if (allPrices.length === 0) return { min: 0, max: 1000000 };
    const volumes = allPrices.map(p => p.volume).filter(v => v > 0);
    return {
      min: Math.min(...volumes),
      max: Math.max(...volumes)
    };
  }, [allPrices]);

  // Market summary stats
  const marketStats = useMemo(() => {
    const total = filteredPrices.length;
    const up = filteredPrices.filter(p => p.pct_change > 0).length;
    const down = filteredPrices.filter(p => p.pct_change < 0).length;
    const unchanged = filteredPrices.filter(p => p.pct_change === 0).length;

    return { total, up, down, unchanged };
  }, [filteredPrices]);

  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('enhanced_cedear_prices_channel')
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
    // Data
    allPrices,
    filteredPrices,
    sectors: companyMap,
    marketStats,
    
    // State
    loading,
    error,
    lastUpdated,
    
    // Filters
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    
    // Ranges for filter UI
    priceRange,
    volumeRange,
    
    // Actions
    refresh,
    
    // Helpers
    getSectorForSymbol
  };
}