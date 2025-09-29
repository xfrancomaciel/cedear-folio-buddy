import { useRef, useEffect, useState } from 'react';
import { useMobileOptimizations } from './useMobileOptimizations';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
}

export const usePullToRefresh = (options: PullToRefreshOptions) => {
  const { onRefresh, threshold = 100, maxPullDistance = 150, disabled = false } = options;
  const { isMobile } = useMobileOptimizations();
  
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const touchStartY = useRef<number>(0);
  const scrollElement = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!isMobile || disabled) return;
    
    const element = scrollElement.current || document.documentElement;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (element.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || element.scrollTop > 0) return;
      
      const touchY = e.touches[0].clientY;
      const pullDist = touchY - touchStartY.current;
      
      if (pullDist > 0 && touchStartY.current > 0) {
        e.preventDefault();
        const limitedDistance = Math.min(pullDist, maxPullDistance);
        setPullDistance(limitedDistance);
        setIsPulling(limitedDistance > threshold);
      }
    };
    
    const handleTouchEnd = async () => {
      if (isPulling && !isRefreshing && pullDistance > threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setIsPulling(false);
      setPullDistance(0);
      touchStartY.current = 0;
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, disabled, isPulling, isRefreshing, pullDistance, threshold, maxPullDistance, onRefresh]);
  
  return {
    isPulling,
    pullDistance,
    isRefreshing,
    containerRef: scrollElement,
    shouldShowIndicator: pullDistance > 0 && isMobile
  };
};