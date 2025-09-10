import React from 'react';
import { Card } from '@/components/ui/card';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { cn } from '@/lib/utils';

interface SwipeableCardProps extends React.ComponentProps<typeof Card> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  children: React.ReactNode;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  className,
  children,
  ...props
}) => {
  const swipeRef = useSwipeGestures({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold: swipeThreshold
  });

  return (
    <Card
      ref={swipeRef as any}
      className={cn(
        'transition-transform duration-200 active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};