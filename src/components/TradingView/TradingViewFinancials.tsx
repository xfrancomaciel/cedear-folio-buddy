import React, { useEffect, useRef, memo } from 'react';
import { useSymbol } from '@/contexts/SymbolContext';

interface TradingViewFinancialsProps {
  className?: string;
}

function TradingViewFinancials({ className }: TradingViewFinancialsProps) {
  const container = useRef<HTMLDivElement>(null);
  const { symbol } = useSymbol();

  useEffect(() => {
    if (!container.current) return;
    
    // Clear previous widget
    container.current.innerHTML = '';
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      colorTheme: "dark",
      displayMode: "regular",
      isTransparent: true,
      locale: "en",
      width: "100%",
      height: "100%"
    });
    
    container.current.appendChild(script);
    
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className={`tradingview-widget-container h-full w-full ${className || ''}`} ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default memo(TradingViewFinancials);