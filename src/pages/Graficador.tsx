import React, { useEffect, useRef } from 'react';

const Graficador = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "allow_symbol_change": true,
      "calendar": false,
      "details": true,
      "hide_side_toolbar": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "hide_volume": false,
      "hotlist": true,
      "interval": "D",
      "locale": "en",
      "save_image": true,
      "style": "1",
      "symbol": "NASDAQ:AAPL",
      "theme": "dark",
      "timezone": "Etc/UTC",
      "backgroundColor": "#0F0F0F",
      "gridColor": "rgba(242, 242, 242, 0.06)",
      "watchlist": [],
      "withdateranges": true,
      "compareSymbols": [],
      "studies": [
        "STD;24h%Volume",
        "STD;Linear_Regression",
        "STD;MA%1Cross",
        "STD;RSI"
      ],
      "autosize": true
    });

    if (containerRef.current) {
      const widgetContainer = containerRef.current.querySelector('.tradingview-widget-container__widget');
      if (widgetContainer) {
        widgetContainer.appendChild(script);
      }
    }

    return () => {
      // Cleanup script if component unmounts
      if (containerRef.current) {
        const existingScript = containerRef.current.querySelector('script');
        if (existingScript) {
          existingScript.remove();
        }
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container" 
      style={{ height: '100%', width: '100%' }}
    >
      <div 
        className="tradingview-widget-container__widget" 
        style={{ height: 'calc(100% - 32px)', width: '100%' }}
      ></div>
      <div className="tradingview-widget-copyright">
        <a 
          href="https://www.tradingview.com/symbols/NASDAQ-AAPL/?exchange=NASDAQ" 
          rel="noopener nofollow" 
          target="_blank"
        >
          <span className="text-blue-500">AAPL chart by TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default Graficador;