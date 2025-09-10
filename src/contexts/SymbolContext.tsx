import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SymbolContextType {
  symbol: string;
  setSymbol: (symbol: string) => void;
}

const SymbolContext = createContext<SymbolContextType | undefined>(undefined);

interface SymbolProviderProps {
  children: ReactNode;
}

export const SymbolProvider: React.FC<SymbolProviderProps> = ({ children }) => {
  const [symbol, setSymbol] = useState<string>('NASDAQ:AAPL');

  return (
    <SymbolContext.Provider value={{ symbol, setSymbol }}>
      {children}
    </SymbolContext.Provider>
  );
};

export const useSymbol = () => {
  const context = useContext(SymbolContext);
  if (context === undefined) {
    throw new Error('useSymbol must be used within a SymbolProvider');
  }
  return context;
};