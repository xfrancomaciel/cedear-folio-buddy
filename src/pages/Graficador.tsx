import React from 'react';
import TradingViewWidget from '@/components/TradingView/TradingViewWidget';

const Graficador = () => {
  return (
    <div className="h-full w-full p-0 m-0">
      <div className="h-full w-full">
        <TradingViewWidget className="h-full w-full" />
      </div>
    </div>
  );
};

export default Graficador;