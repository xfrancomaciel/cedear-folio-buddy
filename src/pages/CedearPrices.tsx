import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Settings, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PriceUpdateStatus } from '@/components/Portfolio/PriceUpdateStatus';
import { BottomNavigation } from '@/components/Mobile/BottomNavigation';
import { MobileHeader } from '@/components/Mobile/MobileHeader';
import { PullToRefresh } from '@/components/Mobile/PullToRefresh';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';
import { useEnhancedCedearPrices } from '@/hooks/useEnhancedCedearPrices';
import { useCedearSectors } from '@/hooks/useCedearSectors';
import { useCedearFavorites } from '@/hooks/useCedearFavorites';
import { CEDEARSectorTabs } from '@/components/CEDEARs/CEDEARSectorTabs';
import { CEDEARFilters } from '@/components/CEDEARs/CEDEARFilters';
import { CEDEARSearch } from '@/components/CEDEARs/CEDEARSearch';
import { CEDEARTable } from '@/components/CEDEARs/CEDEARTable';
import { CEDEARFavorites } from '@/components/CEDEARs/CEDEARFavorites';
import { cn } from '@/lib/utils';

const CedearPrices = () => {
  const { isMobile, touchTargetSize, cardSpacing, spacing, navigation } = useMobileOptimizations();
  const [showAllCedears, setShowAllCedears] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // Enhanced hooks
  const {
    allPrices,
    filteredPrices,
    sectors,
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
  } = useEnhancedCedearPrices();

  const { sectorGroups, getSymbolsBySector, getPopularSymbols } = useCedearSectors();
  const { favorites } = useCedearFavorites();

  // Handle sector tab changes
  const handleSectorChange = (sector: string) => {
    if (sector === 'all') {
      updateFilter('sector', 'all');
      updateFilter('showOnlyPopular', false);
    } else if (sector === 'popular') {
      updateFilter('sector', 'all');
      updateFilter('showOnlyPopular', true);
    } else {
      updateFilter('sector', sector);
      updateFilter('showOnlyPopular', false);
    }
  };

  // Get current active sector for tabs
  const getActiveSector = () => {
    if (filters.showOnlyPopular) return 'popular';
    return filters.sector;
  };

  // Handle search changes
  const handleSearchChange = (term: string) => {
    updateFilter('searchTerm', term);
    // If searching for specific symbol, clear sector filter
    if (term && term.length >= 2) {
      updateFilter('sector', 'all');
      updateFilter('showOnlyPopular', false);
    }
  };

  // Handle favorites symbol click
  const handleFavoriteSymbolClick = (symbol: string) => {
    updateFilter('searchTerm', symbol);
    updateFilter('sector', 'all');
    updateFilter('showOnlyPopular', false);
    setShowFavorites(false);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {isMobile && (
          <MobileHeader title="CEDEARs" showSidebarTrigger={false}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </MobileHeader>
        )}
        
        <PullToRefresh onRefresh={handleRefresh} disabled={loading}>
          <div className={`container mx-auto max-w-7xl ${spacing.mobile} ${navigation.bottomSpace}`}>
          {/* Header */}
          <div className={cn("mb-6", cardSpacing)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={cn("font-bold text-gradient", isMobile ? "text-2xl" : "text-3xl")}>
                  CEDEARs en Tiempo Real
                </h1>
                <p className={cn("text-muted-foreground mt-1", isMobile ? "text-base" : "text-sm")}>
                  Seguimiento en tiempo real de CEDEARs
                </p>
              </div>
              <div className="flex items-center gap-2">
                {favorites.length > 0 && (
                  <Button
                    variant={showFavorites ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="flex items-center gap-2"
                  >
                    <Star className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
                    Favoritos ({favorites.length})
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                  className={cn("flex items-center gap-2", touchTargetSize)}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  {isMobile ? '' : 'Actualizar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Price Update Status */}
          <PriceUpdateStatus
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            onRefresh={refresh}
          />

          {/* Market Summary */}
          <div className={cn(
            "grid gap-4 mb-6",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <p className="text-2xl font-bold mt-2">{marketStats.total}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">En Alza</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-green-600">
                  {marketStats.up}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">En Baja</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-red-600">
                  {marketStats.down}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Minus className="h-4 w-4" />
                  <span className="text-sm font-medium">Sin Cambio</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {marketStats.unchanged}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Favorites Panel */}
          {showFavorites && favorites.length > 0 && (
            <div className="mb-6">
              <CEDEARFavorites
                sectors={sectors}
                onSymbolClick={handleFavoriteSymbolClick}
              />
            </div>
          )}

          {/* Main Content */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Explorador de CEDEARs</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Sector Tabs */}
              <CEDEARSectorTabs
                sectorGroups={sectorGroups}
                activeSector={getActiveSector()}
                onSectorChange={handleSectorChange}
                loading={loading}
              />

              <Separator />

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <CEDEARSearch
                    searchTerm={filters.searchTerm}
                    onSearchChange={handleSearchChange}
                    allPrices={allPrices}
                    placeholder={isMobile ? "Buscar CEDEAR..." : "Buscar por símbolo o empresa (ej: AAPL, Apple, Tesla)..."}
                  />
                </div>
                <CEDEARFilters
                  filters={filters}
                  onFilterChange={updateFilter}
                  onResetFilters={resetFilters}
                  hasActiveFilters={hasActiveFilters}
                  priceRange={priceRange}
                  volumeRange={volumeRange}
                />
              </div>

              {/* Results Summary */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Mostrando {filteredPrices.length} de {allPrices.length} CEDEARs
                  </span>
                  {filters.searchTerm && (
                    <span>• Búsqueda: "{filters.searchTerm}"</span>
                  )}
                  {filters.sector !== 'all' && (
                    <span>• Sector: {filters.sector}</span>
                  )}
                  {filters.showOnlyPopular && (
                    <span>• Solo populares</span>
                  )}
                </div>
              )}

              {/* CEDEAR Table */}
              <CEDEARTable
                prices={filteredPrices}
                sectors={sectors}
                loading={loading}
                onToggleShowAll={setShowAllCedears}
                showingAll={showAllCedears}
                maxDisplayItems={80}
              />
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Precios actualizados cada 2 minutos • 
              Datos proporcionados por data912.com • 
              Sistema inteligente de filtrado con {allPrices.length}+ CEDEARs disponibles
            </p>
            </div>
          </div>
        </PullToRefresh>
        
        <BottomNavigation />
      </div>
    </TooltipProvider>
  );
};

export default CedearPrices;