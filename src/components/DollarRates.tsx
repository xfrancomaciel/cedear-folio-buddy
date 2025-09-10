import { DollarSign, RefreshCw } from 'lucide-react';
import { useDollarRates } from '@/hooks/useDollarRates';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

export const DollarRates = () => {
  const { data: rates, isLoading, error, refetch } = useDollarRates();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dollarRates'] });
    refetch();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-sidebar-foreground/70">Cotización USD</span>
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !rates) {
    return (
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-sidebar-foreground/70">Cotización USD</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-4 w-4 p-0 hover:bg-sidebar-accent"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-destructive">Error al cargar</p>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-sidebar-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-sidebar-foreground/70">Cotización USD</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="h-4 w-4 p-0 hover:bg-sidebar-accent"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-1.5">
        {/* Dólar Blue */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-sidebar-foreground">Blue</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-sidebar-foreground/70" />
            <span className="text-xs font-medium text-sidebar-foreground">
              {formatPrice(rates.blue)}
            </span>
          </div>
        </div>
        
        {/* Dólar Oficial */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
            <span className="text-xs text-sidebar-foreground">Oficial</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-sidebar-foreground/70" />
            <span className="text-xs font-medium text-sidebar-foreground">
              {formatPrice(rates.official)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};