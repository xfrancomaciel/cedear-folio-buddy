import React, { useState } from 'react';
import { ChevronDown, Filter, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FilterState } from '@/hooks/useCedearFilters';

interface CEDEARFiltersProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  priceRange?: { min: number; max: number };
  volumeRange?: { min: number; max: number };
}

export const CEDEARFilters: React.FC<CEDEARFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  priceRange = { min: 0, max: 100000 },
  volumeRange = { min: 0, max: 1000000 }
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          <ChevronDown className="h-4 w-4 ml-2" />
          {hasActiveFilters && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Filtros Avanzados</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onResetFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          <Separator />

          {/* Popular Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="popular-toggle" className="text-sm font-medium">
              Solo CEDEARs Populares
            </Label>
            <Switch
              id="popular-toggle"
              checked={filters.showOnlyPopular}
              onCheckedChange={(checked) => onFilterChange('showOnlyPopular', checked)}
            />
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rango de Precios (ARS)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                  Mínimo
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => onFilterChange('minPrice', Number(e.target.value) || 0)}
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
              <div>
                <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                  Máximo
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="∞"
                  value={filters.maxPrice === 1000000 ? '' : filters.maxPrice}
                  onChange={(e) => onFilterChange('maxPrice', Number(e.target.value) || 1000000)}
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(filters.minPrice)} - {filters.maxPrice === 1000000 ? '∞' : formatCurrency(filters.maxPrice)}
            </div>
          </div>

          {/* Volume Filter */}
          <div className="space-y-2">
            <Label htmlFor="min-volume" className="text-sm font-medium">
              Volumen Mínimo
            </Label>
            <Input
              id="min-volume"
              type="number"
              placeholder="0"
              value={filters.minVolume || ''}
              onChange={(e) => onFilterChange('minVolume', Number(e.target.value) || 0)}
              min={volumeRange.min}
              max={volumeRange.max}
            />
            <div className="text-xs text-muted-foreground">
              Mín: {formatVolume(filters.minVolume)}
            </div>
          </div>

          {/* Change Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Variación del Día</Label>
            <Select
              value={filters.changeFilter}
              onValueChange={(value: FilterState['changeFilter']) => onFilterChange('changeFilter', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Todas las variaciones</span>
                  </div>
                </SelectItem>
                <SelectItem value="positive">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Solo en alza (+)</span>
                  </div>
                </SelectItem>
                <SelectItem value="negative">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span>Solo en baja (-)</span>
                  </div>
                </SelectItem>
                <SelectItem value="unchanged">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-muted-foreground" />
                    <span>Sin cambio (0%)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filtros Activos</Label>
                <div className="flex flex-wrap gap-1">
                  {filters.showOnlyPopular && (
                    <Badge variant="secondary" className="text-xs">
                      Populares
                    </Badge>
                  )}
                  {(filters.minPrice > 0 || filters.maxPrice < 1000000) && (
                    <Badge variant="secondary" className="text-xs">
                      Precio: {formatCurrency(filters.minPrice)} - {filters.maxPrice === 1000000 ? '∞' : formatCurrency(filters.maxPrice)}
                    </Badge>
                  )}
                  {filters.minVolume > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Vol: +{formatVolume(filters.minVolume)}
                    </Badge>
                  )}
                  {filters.changeFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.changeFilter === 'positive' ? 'En Alza' : 
                       filters.changeFilter === 'negative' ? 'En Baja' : 'Sin Cambio'}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};