import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BondPrice, MarketMetrics } from '@/types/bonds';

export function useBondsData() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch bond prices
  const { data: bondPrices = [], error: pricesError } = useQuery({
    queryKey: ['bond-prices'],
    queryFn: async (): Promise<BondPrice[]> => {
      const { data, error } = await supabase
        .from('latest_bond_prices')
        .select('*')
        .eq('is_stale', false)
        .order('symbol');

      if (error) throw error;

      return data?.map(price => ({
        ...price,
        status: price.px_bid && price.px_ask ? 'Live' : 'No Price' as const
      })) || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000
  });

  // Fetch market metrics
  const { data: marketMetrics } = useQuery({
    queryKey: ['bond-market-metrics'],
    queryFn: async (): Promise<MarketMetrics | null> => {
      const { data, error } = await supabase
        .from('bond_market_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching market metrics:', error);
        return null;
      }

      return data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Manual refresh function
  const triggerDataRefresh = async () => {
    setIsLoading(true);
    try {
      await queryClient.refetchQueries({ queryKey: ['bond-prices'] });
      await queryClient.refetchQueries({ queryKey: ['bond-market-metrics'] });
    } catch (error) {
      console.error('Error refreshing bond data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const pricesChannel = supabase
      .channel('bond-prices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prices'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bond-prices'] });
        }
      )
      .subscribe();

    const metricsChannel = supabase
      .channel('bond-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bond_market_metrics'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bond-market-metrics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pricesChannel);
      supabase.removeChannel(metricsChannel);
    };
  }, [queryClient]);

  return {
    bondPrices,
    marketMetrics,
    isLoading: isLoading,
    error: pricesError,
    triggerDataRefresh
  };
}

export function useBondSearch(bondPrices: BondPrice[], searchTerm: string) {
  const [filteredBonds, setFilteredBonds] = useState<BondPrice[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBonds(bondPrices);
      return;
    }

    const filtered = bondPrices.filter(bond =>
      bond.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBonds(filtered);
  }, [bondPrices, searchTerm]);

  return filteredBonds;
}