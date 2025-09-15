import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "market": "america",
          "showToolbar": true,
          "defaultColumn": "overview",
          "defaultScreen": "most_capitalized",
          "isTransparent": true,
          "locale": "es",
          "colorTheme": "dark",
          "width": "100%",
          "height": "100%"
        }`;
      if (container.current) {
        container.current.appendChild(script);
      }
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      <div className="tradingview-widget-copyright"><a href="https://es.tradingview.com/screener/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
    </div>
  );
}

export default memo(TradingViewWidget);