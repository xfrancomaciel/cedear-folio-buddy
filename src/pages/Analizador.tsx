import React from 'react';
import { SymbolProvider } from '@/contexts/SymbolContext';
import { SymbolSearch } from '@/components/SymbolSelector/SymbolSearch';
import TradingViewFinancials from '@/components/TradingView/TradingViewFinancials';
import TradingViewSymbolInfo from '@/components/TradingView/TradingViewSymbolInfo';
import TradingViewTechnicalAnalysis from '@/components/TradingView/TradingViewTechnicalAnalysis';
import TradingViewSymbolProfile from '@/components/TradingView/TradingViewSymbolProfile';

const Analizador = () => {
  return (
    <SymbolProvider>
      <div className="h-full w-full p-4 space-y-4">
        {/* Symbol Selector */}
        <div className="w-full">
          <SymbolSearch />
        </div>

        {/* Widgets Grid */}
        <div className="h-[calc(100%-200px)] grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Left - Symbol Info */}
          <div className="bg-card rounded-lg border p-4 min-h-[300px]">
            <h3 className="text-sm font-medium text-foreground mb-3">Información del Símbolo</h3>
            <div className="h-[calc(100%-2rem)]">
              <TradingViewSymbolInfo className="h-full w-full" />
            </div>
          </div>

          {/* Top Right - Financials */}
          <div className="bg-card rounded-lg border p-4 min-h-[300px]">
            <h3 className="text-sm font-medium text-foreground mb-3">Datos Financieros</h3>
            <div className="h-[calc(100%-2rem)]">
              <TradingViewFinancials className="h-full w-full" />
            </div>
          </div>

          {/* Bottom Left - Technical Analysis */}
          <div className="bg-card rounded-lg border p-4 min-h-[300px]">
            <h3 className="text-sm font-medium text-foreground mb-3">Análisis Técnico</h3>
            <div className="h-[calc(100%-2rem)]">
              <TradingViewTechnicalAnalysis className="h-full w-full" />
            </div>
          </div>

          {/* Bottom Right - Symbol Profile */}
          <div className="bg-card rounded-lg border p-4 min-h-[300px]">
            <h3 className="text-sm font-medium text-foreground mb-3">Perfil de la Empresa</h3>
            <div className="h-[calc(100%-2rem)]">
              <TradingViewSymbolProfile className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </SymbolProvider>
  );
};

export default Analizador;