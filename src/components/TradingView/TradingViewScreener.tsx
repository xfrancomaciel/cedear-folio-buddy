import React, { useEffect, useRef, memo } from 'react';

interface TradingViewScreenerProps {
  className?: string;
}

function TradingViewScreener({ className }: TradingViewScreenerProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      market: "america",
      showToolbar: true,
      defaultColumn: "overview",
      defaultScreen: "most_capitalized",
      isTransparent: true,
      locale: "en",
      colorTheme: "dark",
      width: "100%",
      height: "100%"
    });
    
    container.current.appendChild(script);
    
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`tradingview-widget-container h-full w-full ${className || ''}`} ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default memo(TradingViewScreener);