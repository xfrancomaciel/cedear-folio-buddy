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
  created_at?: string;
}

export function useEnhancedCedearPrices() {
  const [allPrices, setAllPrices] = useState<EnhancedCedearPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { sectors, getPopularSymbols } = useCedearSectors();
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useCedearFilters();

  const mapRow = (item: any): EnhancedCedearPrice => ({
    id: item.id || `${item.symbol}-${item.created_at || item.last_updated || Date.now()}`,
    symbol: (item.symbol || '').toUpperCase(),
    px_bid: Number(item.px_bid || 0),
    px_ask: Number(item.px_ask || 0),
    px_mid: Number(item.px_mid ?? ((item.px_bid && item.px_ask) ? (Number(item.px_bid) + Number(item.px_ask)) / 2 : (item.px_close || 0))),
    px_close: Number(item.px_close || item.close_price || 0),
    volume: Number(item.volume || item.v || 0),
    pct_change: Number(item.pct_change || 0),
    last_updated: item.last_updated || item.timestamp || item.created_at || new Date().toISOString(),
    created_at: item.created_at
  });

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);

      // Fetch latest rows from raw table to avoid view limitations
      const { data, error: fetchError } = await supabase
        .from('cedear_prices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (fetchError) throw fetchError;

      // Deduplicate by symbol keeping the most recent
      const dedupedMap: Record<string, EnhancedCedearPrice> = {};
      (data || []).forEach((row: any) => {
        const mapped = mapRow(row);
        if (!dedupedMap[mapped.symbol]) {
          dedupedMap[mapped.symbol] = mapped;
        }
      });

      const deduped = Object.values(dedupedMap);

      setAllPrices(deduped.sort((a, b) => b.volume - a.volume));
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching prices';
      setError(errorMessage);
      console.error('Error fetching enhanced CEDEAR prices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerEdgeUpdate = useCallback(async () => {
    try {
      await supabase.functions.invoke('update-cedear-prices');
    } catch (e) {
      console.warn('Edge update invocation failed:', e);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await triggerEdgeUpdate();
    await fetchPrices();
  }, [fetchPrices, triggerEdgeUpdate]);

  // Create sector mapping for filtering
  const sectorMap = useMemo(() => {
    const map: Record<string, string> = {};
    sectors.forEach(s => { map[s.symbol] = s.sector; });
    return map;
  }, [sectors]);

  // Create company name mapping
  const companyMap = useMemo(() => {
    const map: Record<string, { sector: string; company_name?: string }> = {};
    sectors.forEach(s => { map[s.symbol] = { sector: s.sector, company_name: s.company_name }; });
    return map;
  }, [sectors]);

  // Get popular symbols for filtering
  const popularSymbols = useMemo(() => getPopularSymbols(), [getPopularSymbols]);

  // Apply filters to prices
  const filteredPrices = useMemo(() => {
    return filterCedearPrices(allPrices, filters, sectorMap, popularSymbols);
  }, [allPrices, filters, sectorMap, popularSymbols]);

  // Calculate ranges for filter UI
  const priceRange = useMemo(() => {
    if (allPrices.length === 0) return { min: 0, max: 100000 };
    const prices = allPrices.map(p => p.px_close).filter(p => p > 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allPrices]);

  const volumeRange = useMemo(() => {
    if (allPrices.length === 0) return { min: 0, max: 1000000 };
    const volumes = allPrices.map(p => p.volume).filter(v => v > 0);
    return { min: Math.min(...volumes), max: Math.max(...volumes) };
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
    // Kick off an update in the background and fetch
    (async () => {
      try { await triggerEdgeUpdate(); } catch {}
      await fetchPrices();
    })();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('enhanced_cedear_prices_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cedear_prices' }, () => {
        fetchPrices();
      })
      .subscribe();

    // Fallback periodic refresh
    const refreshInterval = setInterval(fetchPrices, 120000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [fetchPrices, triggerEdgeUpdate]);

  return {
    allPrices,
    filteredPrices,
    sectors: companyMap,
    marketStats,
    loading,
    error,
    lastUpdated,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    priceRange,
    volumeRange,
    refresh
  };
}