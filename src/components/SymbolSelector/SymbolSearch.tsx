import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSymbol } from '@/contexts/SymbolContext';

const popularSymbols = [
  { symbol: 'NASDAQ:AAPL', name: 'Apple Inc.' },
  { symbol: 'NASDAQ:TSLA', name: 'Tesla Inc.' },
  { symbol: 'NASDAQ:MSFT', name: 'Microsoft Corp.' },
  { symbol: 'NASDAQ:GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'NASDAQ:AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NASDAQ:META', name: 'Meta Platforms Inc.' },
  { symbol: 'NASDAQ:NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'NYSE:JPM', name: 'JPMorgan Chase & Co.' },
];

export const SymbolSearch: React.FC = () => {
  const { symbol: currentSymbol, setSymbol } = useSymbol();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add exchange prefix if not present
      const formattedSymbol = inputValue.includes(':') 
        ? inputValue.toUpperCase() 
        : `NASDAQ:${inputValue.toUpperCase()}`;
      setSymbol(formattedSymbol);
      setInputValue('');
    }
  };

  const handlePopularSymbolClick = (symbolValue: string) => {
    setSymbol(symbolValue);
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">
          Símbolo Actual: <span className="text-primary">{currentSymbol}</span>
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar símbolo (ej: AAPL, TSLA)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" size="default">
          Buscar
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Símbolos populares:</p>
        <div className="flex flex-wrap gap-2">
          {popularSymbols.map((item) => (
            <Badge
              key={item.symbol}
              variant={currentSymbol === item.symbol ? "default" : "secondary"}
              className="cursor-pointer hover:bg-accent"
              onClick={() => handlePopularSymbolClick(item.symbol)}
            >
              {item.symbol.split(':')[1]} - {item.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};