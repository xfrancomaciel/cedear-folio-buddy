import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  showSidebarTrigger?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showSidebarTrigger = true,
  children,
  className
}) => {
  const { isMobile, touchTargetSize } = useMobileOptimizations();

  if (!isMobile) return children;

  return (
    <header className={cn(
      'sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50',
      'h-14 flex items-center justify-between px-4',
      className
    )}>
      {/* Left side */}
      <div className="flex items-center gap-3">
        {showSidebarTrigger && (
          <SidebarTrigger className={cn(touchTargetSize, 'flex-shrink-0')} />
        )}
        {title && (
          <h1 className="font-semibold text-lg text-foreground truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right side - custom content */}
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
};