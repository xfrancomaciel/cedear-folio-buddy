import React, { useEffect, useRef, memo } from 'react';

interface TradingViewTickerTapeProps {
  className?: string;
}

function TradingViewTickerTape({ className }: TradingViewTickerTapeProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: "FOREXCOM:SPXUSD",
          title: "S&P 500 Index"
        },
        {
          proName: "FOREXCOM:NSXUSD",
          title: "US 100 Cash CFD"
        },
        {
          proName: "FX_IDC:EURUSD",
          title: "EUR to USD"
        },
        {
          proName: "BITSTAMP:BTCUSD",
          title: "Bitcoin"
        },
        {
          proName: "BITSTAMP:ETHUSD",
          title: "Ethereum"
        },
        {
          proName: "IG:NASDAQ",
          title: "Nasdaq"
        },
        {
          proName: "OANDA:XAUUSD",
          title: "Gold"
        }
      ],
      colorTheme: "dark",
      locale: "en",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      displayMode: "adaptive"
    });
    
    container.current.appendChild(script);
    
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`tradingview-widget-container h-12 w-full ${className || ''}`} ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default memo(TradingViewTickerTape);