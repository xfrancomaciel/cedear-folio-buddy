import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CedearSector {
  id: string;
  symbol: string;
  sector: string;
  industry: string;
  company_name: string;
  country: string;
  market_cap_category: string;
  is_popular: boolean;
}

export interface SectorGroup {
  sector: string;
  count: number;
  symbols: string[];
}

export function useCedearSectors() {
  const [sectors, setSectors] = useState<CedearSector[]>([]);
  const [sectorGroups, setSectorGroups] = useState<SectorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('cedear_sectors')
          .select('*')
          .order('sector, symbol');

        if (fetchError) {
          throw fetchError;
        }

        setSectors(data || []);

        // Group by sector
        const grouped = (data || []).reduce((acc, item) => {
          const existing = acc.find(g => g.sector === item.sector);
          if (existing) {
            existing.count++;
            existing.symbols.push(item.symbol);
          } else {
            acc.push({
              sector: item.sector,
              count: 1,
              symbols: [item.symbol]
            });
          }
          return acc;
        }, [] as SectorGroup[]);

        setSectorGroups(grouped.sort((a, b) => b.count - a.count));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching sectors';
        setError(errorMessage);
        console.error('Error fetching CEDEAR sectors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  const getSymbolsBySector = (sector: string): string[] => {
    return sectors.filter(s => s.sector === sector).map(s => s.symbol);
  };

  const getPopularSymbols = (): string[] => {
    return sectors.filter(s => s.is_popular).map(s => s.symbol);
  };

  const getSectorForSymbol = (symbol: string): string | null => {
    const sector = sectors.find(s => s.symbol === symbol);
    return sector?.sector || null;
  };

  return {
    sectors,
    sectorGroups,
    loading,
    error,
    getSymbolsBySector,
    getPopularSymbols,
    getSectorForSymbol
  };
}