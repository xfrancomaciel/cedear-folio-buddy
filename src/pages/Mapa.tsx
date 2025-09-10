import React from 'react';
import TradingViewHeatmap from '@/components/TradingView/TradingViewHeatmap';

const Mapa = () => {
  return (
    <div className="h-full w-full p-0 m-0">
      <div className="h-full w-full">
        <TradingViewHeatmap className="h-full w-full" />
      </div>
    </div>
  );
};

export default Mapa;