import { useState, useMemo } from 'react';

export interface FilterState {
  sector: string;
  minPrice: number;
  maxPrice: number;
  minVolume: number;
  changeFilter: 'all' | 'positive' | 'negative' | 'unchanged';
  showOnlyPopular: boolean;
  searchTerm: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

const DEFAULT_FILTERS: FilterState = {
  sector: 'all',
  minPrice: 0,
  maxPrice: 1000000,
  minVolume: 0,
  changeFilter: 'all',
  showOnlyPopular: false,
  searchTerm: ''
};

export function useCedearFilters() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.sector !== 'all' ||
      filters.minPrice > 0 ||
      filters.maxPrice < 1000000 ||
      filters.minVolume > 0 ||
      filters.changeFilter !== 'all' ||
      filters.showOnlyPopular ||
      filters.searchTerm.trim() !== ''
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters
  };
}

export function filterCedearPrices(prices: any[], filters: FilterState, sectorMap: Record<string, string>, popularSymbols: string[]) {
  return prices.filter(price => {
    // Search filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSymbol = price.symbol.toLowerCase().includes(searchLower);
      // Add company name search when available
      if (!matchesSymbol) {
        return false;
      }
    }

    // Sector filter
    if (filters.sector !== 'all') {
      const priceSector = sectorMap[price.symbol];
      if (priceSector !== filters.sector) {
        return false;
      }
    }

    // Popular filter
    if (filters.showOnlyPopular && !popularSymbols.includes(price.symbol)) {
      return false;
    }

    // Price range filter
    if (price.px_close < filters.minPrice || price.px_close > filters.maxPrice) {
      return false;
    }

    // Volume filter
    if (price.volume < filters.minVolume) {
      return false;
    }

    // Change filter
    if (filters.changeFilter !== 'all') {
      switch (filters.changeFilter) {
        case 'positive':
          if (price.pct_change <= 0) return false;
          break;
        case 'negative':
          if (price.pct_change >= 0) return false;
          break;
        case 'unchanged':
          if (price.pct_change !== 0) return false;
          break;
      }
    }

    return true;
  });
}