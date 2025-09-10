import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';
import { cn } from '@/lib/utils';

interface TouchOptimizedChartProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onFullscreen?: () => void;
  onReset?: () => void;
}

export const TouchOptimizedChart: React.FC<TouchOptimizedChartProps> = ({
  title,
  children,
  className,
  onFullscreen,
  onReset
}) => {
  const { isMobile, touchTargetSize } = useMobileOptimizations();
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    onReset?.();
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {isMobile && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className={cn(touchTargetSize)}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className={cn(touchTargetSize)}
                disabled={zoom >= 2}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className={cn(touchTargetSize)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              {onFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFullscreen}
                  className={cn(touchTargetSize)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div
          className="w-full overflow-auto"
          style={{
            transform: isMobile ? `scale(${zoom})` : undefined,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
};