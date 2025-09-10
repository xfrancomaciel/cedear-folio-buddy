import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

interface MobileOptimizations {
  isMobile: boolean;
  isTablet: boolean;
  touchTargetSize: string;
  cardSpacing: string;
  tableMode: 'table' | 'cards' | 'list';
  fontSize: {
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
}

export const useMobileOptimizations = (): MobileOptimizations => {
  const isMobile = useIsMobile();
  const isTablet = false; // Simplified for now
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return {
      isMobile: false,
      isTablet: false,
      touchTargetSize: 'min-h-[44px]',
      cardSpacing: 'space-y-4',
      tableMode: 'table',
      fontSize: {
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
      }
    };
  }

  return {
    isMobile,
    isTablet,
    touchTargetSize: isMobile ? 'min-h-[44px] min-w-[44px]' : 'min-h-[36px]',
    cardSpacing: isMobile ? 'space-y-3' : 'space-y-4',
    tableMode: isMobile ? 'cards' : isTablet ? 'list' : 'table',
    fontSize: {
      sm: isMobile ? 'text-base' : 'text-sm',
      base: isMobile ? 'text-lg' : 'text-base', 
      lg: isMobile ? 'text-xl' : 'text-lg',
      xl: isMobile ? 'text-2xl' : 'text-xl'
    }
  };
};