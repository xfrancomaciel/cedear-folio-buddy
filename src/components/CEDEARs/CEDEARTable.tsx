import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Star, Eye, EyeOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/utils/portfolioCalculations';
import { useCedearFavorites } from '@/hooks/useCedearFavorites';

interface CEDEARTableProps {
  prices: any[];
  sectors: Record<string, { sector: string; company_name?: string }>;
  loading?: boolean;
  onToggleShowAll?: (show: boolean) => void;
  showingAll?: boolean;
  maxDisplayItems?: number;
}

export const CEDEARTable: React.FC<CEDEARTableProps> = ({
  prices,
  sectors,
  loading = false,
  onToggleShowAll,
  showingAll = false,
  maxDisplayItems = 80
}) => {
  const { isFavorite, toggleFavorite } = useCedearFavorites();

  const displayedPrices = useMemo(() => {
    if (showingAll) return prices;
    return prices.slice(0, maxDisplayItems);
  }, [prices, showingAll, maxDisplayItems]);

  const hiddenCount = prices.length - maxDisplayItems;

  const getTrendIcon = (pctChange: number) => {
    if (pctChange > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (pctChange < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (pctChange: number) => {
    if (pctChange > 0) return 'text-green-600';
    if (pctChange < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getVariantByChange = (pctChange: number) => {
    if (pctChange > 0) return 'default';
    if (pctChange < 0) return 'destructive';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground">Cargando precios...</p>
      </div>
    );
  }

  if (prices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
        <p className="text-muted-foreground">
          No se encontraron CEDEARs que coincidan con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle Show All Button */}
      {!showingAll && hiddenCount > 0 && onToggleShowAll && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => onToggleShowAll(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver todos los {prices.length} CEDEARs disponibles
            <Badge variant="secondary">{hiddenCount} más</Badge>
          </Button>
        </div>
      )}

      {showingAll && onToggleShowAll && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => onToggleShowAll(false)}
            className="flex items-center gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Mostrar solo Top {maxDisplayItems}
          </Button>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead> {/* Favorites */}
              <TableHead>Ticker</TableHead>
              <TableHead className="hidden md:table-cell">Empresa</TableHead>
              <TableHead className="hidden lg:table-cell">Sector</TableHead>
              <TableHead className="text-right">Compra</TableHead>
              <TableHead className="text-right">Venta</TableHead>
              <TableHead className="text-right">Medio</TableHead>
              <TableHead className="text-right">Cierre</TableHead>
              <TableHead className="text-right">Volumen</TableHead>
              <TableHead className="text-right">Variación %</TableHead>
              <TableHead className="text-right">Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedPrices
              .sort((a, b) => {
                // Sort favorites first, then by volume
                const aFav = isFavorite(a.symbol);
                const bFav = isFavorite(b.symbol);
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;
                return b.volume - a.volume;
              })
              .map((price) => {
                const sectorInfo = sectors[price.symbol];
                const isFav = isFavorite(price.symbol);
                
                return (
                  <TableRow 
                    key={price.id} 
                    className={`hover:bg-muted/50 ${isFav ? 'bg-accent/30' : ''}`}
                  >
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(price.symbol)}
                            className="h-8 w-8 p-0"
                          >
                            <Star 
                              className={`h-4 w-4 ${
                                isFav 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-muted-foreground hover:text-yellow-400'
                              }`} 
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {price.symbol}
                        </Badge>
                        {isFav && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-[200px] truncate">
                        {sectorInfo?.company_name || 'N/A'}
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden lg:table-cell">
                      {sectorInfo?.sector && (
                        <Badge variant="secondary" className="text-xs">
                          {sectorInfo.sector}
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right font-mono">
                      {formatCurrency(price.px_bid, 'ARS')}
                    </TableCell>
                    
                    <TableCell className="text-right font-mono">
                      {formatCurrency(price.px_ask, 'ARS')}
                    </TableCell>
                    
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(price.px_mid, 'ARS')}
                    </TableCell>
                    
                    <TableCell className="text-right font-mono">
                      {formatCurrency(price.px_close, 'ARS')}
                    </TableCell>
                    
                    <TableCell className="text-right font-mono text-sm">
                      {price.volume.toLocaleString()}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getTrendIcon(price.pct_change)}
                        <Badge 
                          variant={getVariantByChange(price.pct_change)}
                          className={`font-mono ${getTrendColor(price.pct_change)}`}
                        >
                          {price.pct_change > 0 ? '+' : ''}{price.pct_change.toFixed(2)}%
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(price.last_updated).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Show All Button at Bottom */}
      {!showingAll && hiddenCount > 0 && onToggleShowAll && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => onToggleShowAll(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver los {hiddenCount} CEDEARs restantes
          </Button>
        </div>
      )}
    </div>
  );
};