import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SwipeableCard } from '@/components/SwipeableCard';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

interface CEDEARCardProps {
  symbol: string;
  name: string;
  price: number;
  variation: number;
  sector?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onSelect?: () => void;
}

export const CEDEARCard: React.FC<CEDEARCardProps> = ({
  symbol,
  name,
  price,
  variation,
  sector,
  isFavorite = false,
  onToggleFavorite,
  onSelect
}) => {
  const { fontSize, touchTargetSize, cardSpacing } = useMobileOptimizations();

  const variationColor = variation > 0 ? 'text-success' : variation < 0 ? 'text-destructive' : 'text-muted-foreground';
  const VariationIcon = variation > 0 ? TrendingUp : variation < 0 ? TrendingDown : Minus;

  return (
    <SwipeableCard
      onSwipeLeft={onToggleFavorite}
      onSwipeRight={onSelect}
      className={cn('transition-all duration-200 hover:shadow-md', cardSpacing)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('font-bold text-foreground', fontSize.base)}>{symbol}</h3>
              {isFavorite && (
                <Star className="h-4 w-4 text-warning fill-current" />
              )}
            </div>
            <p className={cn('text-muted-foreground truncate', fontSize.sm)}>{name}</p>
            {sector && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {sector}
              </Badge>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <div className={cn('font-bold text-foreground', fontSize.lg)}>
              ${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <div className={cn('flex items-center gap-1 justify-end', variationColor, fontSize.sm)}>
              <VariationIcon className="h-3 w-3" />
              <span>{variation > 0 ? '+' : ''}{variation.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFavorite}
            className={cn(touchTargetSize, 'flex-1')}
          >
            <Star className={cn('h-4 w-4 mr-1', isFavorite && 'fill-current text-warning')} />
            {isFavorite ? 'Quitar' : 'Favorito'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSelect}
            className={cn(touchTargetSize, 'flex-1')}
          >
            Ver Detalle
          </Button>
        </div>
      </CardContent>
    </SwipeableCard>
  );
};

interface PortfolioCardProps {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  onSell?: () => void;
  onViewDetail?: () => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  symbol,
  quantity,
  avgPrice,
  currentPrice,
  totalValue,
  gainLoss,
  gainLossPercent,
  onSell,
  onViewDetail
}) => {
  const { fontSize, touchTargetSize, cardSpacing } = useMobileOptimizations();

  const gainLossColor = gainLoss > 0 ? 'text-success' : gainLoss < 0 ? 'text-destructive' : 'text-muted-foreground';
  const GainLossIcon = gainLoss > 0 ? TrendingUp : gainLoss < 0 ? TrendingDown : Minus;

  return (
    <SwipeableCard
      onSwipeLeft={onSell}
      onSwipeRight={onViewDetail}
      className={cn('transition-all duration-200 hover:shadow-md', cardSpacing)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn('font-bold text-foreground mb-1', fontSize.base)}>{symbol}</h3>
            <p className={cn('text-muted-foreground', fontSize.sm)}>
              {quantity} acciones @ ${avgPrice.toFixed(2)}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className={cn('font-bold text-foreground', fontSize.lg)}>
              ${totalValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <div className={cn('text-muted-foreground', fontSize.sm)}>
              ${currentPrice.toFixed(2)}/acción
            </div>
          </div>
        </div>

        <div className={cn('flex items-center gap-1 mb-3', gainLossColor)}>
          <GainLossIcon className="h-4 w-4" />
          <span className={cn('font-semibold', fontSize.base)}>
            ${gainLoss.toFixed(2)} ({gainLoss > 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSell}
            className={cn(touchTargetSize, 'flex-1')}
          >
            Vender
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onViewDetail}
            className={cn(touchTargetSize, 'flex-1')}
          >
            Detalle
          </Button>
        </div>
      </CardContent>
    </SwipeableCard>
  );
};