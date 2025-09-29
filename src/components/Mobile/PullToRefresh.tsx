import React from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 100,
  disabled = false
}) => {
  const {
    isPulling,
    pullDistance,
    isRefreshing,
    containerRef,
    shouldShowIndicator
  } = usePullToRefresh({ onRefresh, threshold, disabled });

  const progress = Math.min(pullDistance / threshold, 1);
  const indicatorOpacity = Math.min(pullDistance / 50, 1);

  return (
    <div ref={containerRef as any} className="relative h-full overflow-auto">
      {/* Pull indicator */}
      {shouldShowIndicator && (
        <div 
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-b border-border/50 transition-all duration-150"
          style={{
            height: `${Math.min(pullDistance, 80)}px`,
            opacity: indicatorOpacity
          }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            {isRefreshing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Actualizando...</span>
              </>
            ) : isPulling ? (
              <>
                <ArrowDown className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">¡Suelta para actualizar!</span>
              </>
            ) : (
              <>
                <ArrowDown 
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    `rotate-${Math.round(progress * 180)}deg`
                  )} 
                />
                <span className="text-sm font-medium">Desliza hacia abajo</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        className="transition-transform duration-150"
        style={{
          transform: shouldShowIndicator ? `translateY(${Math.min(pullDistance, 80)}px)` : 'translateY(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
};