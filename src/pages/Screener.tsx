import React from 'react';
import TradingViewScreener from '@/components/TradingView/TradingViewScreener';

const Screener = () => {
  return (
    <div className="h-full w-full p-0 m-0">
      <div className="h-full w-full">
        <TradingViewScreener className="h-full w-full" />
      </div>
    </div>
  );
};

export default Screener;