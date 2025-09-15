import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useCedearSectors } from '@/hooks/useCedearSectors';

interface CEDEARSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  allPrices: any[];
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  symbol: string;
  companyName?: string;
  sector?: string;
  type: 'exact' | 'company' | 'sector';
}

export const CEDEARSearch: React.FC<CEDEARSearchProps> = ({
  searchTerm,
  onSearchChange,
  allPrices,
  placeholder = "Buscar CEDEAR por símbolo o empresa...",
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const { sectors } = useCedearSectors();

  // Create search suggestions based on available data
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const searchLower = searchTerm.toLowerCase();
    const results: SearchSuggestion[] = [];
    const seen = new Set<string>();

    // 1. Exact symbol matches (highest priority)
    allPrices.forEach(price => {
      if (price.symbol.toLowerCase().includes(searchLower)) {
        const sector = sectors.find(s => s.symbol === price.symbol);
        if (!seen.has(price.symbol)) {
          results.push({
            symbol: price.symbol,
            companyName: sector?.company_name,
            sector: sector?.sector,
            type: 'exact'
          });
          seen.add(price.symbol);
        }
      }
    });

    // 2. Company name matches (medium priority)
    sectors.forEach(sector => {
      if (sector.company_name && 
          sector.company_name.toLowerCase().includes(searchLower) &&
          !seen.has(sector.symbol) &&
          allPrices.some(p => p.symbol === sector.symbol)) {
        results.push({
          symbol: sector.symbol,
          companyName: sector.company_name,
          sector: sector.sector,
          type: 'company'
        });
        seen.add(sector.symbol);
      }
    });

    // Limit results and prioritize
    return results
      .sort((a, b) => {
        // Prioritize exact matches, then by symbol alphabetically
        if (a.type !== b.type) {
          return a.type === 'exact' ? -1 : 1;
        }
        return a.symbol.localeCompare(b.symbol);
      })
      .slice(0, 8);
  }, [searchTerm, allPrices, sectors]);

  // Handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger any additional search effects here if needed
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    onSearchChange(suggestion.symbol);
    setIsOpen(false);
  };

  const clearSearch = () => {
    onSearchChange('');
    setIsOpen(false);
  };

  const shouldShowSuggestions = inputFocused && suggestions.length > 0 && searchTerm.length >= 2;

  return (
    <div className={`relative ${className}`}>
      <Popover open={shouldShowSuggestions && isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                setInputFocused(true);
                setIsOpen(true);
              }}
              onBlur={() => {
                // Delay to allow click on suggestions
                setTimeout(() => {
                  setInputFocused(false);
                  setIsOpen(false);
                }, 200);
              }}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0" 
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandList>
              <CommandEmpty>No se encontraron resultados</CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.symbol}
                    onSelect={() => handleSuggestionSelect(suggestion)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {suggestion.symbol}
                        </Badge>
                        <div className="flex flex-col">
                          {suggestion.companyName && (
                            <span className="text-sm font-medium">
                              {suggestion.companyName}
                            </span>
                          )}
                          {suggestion.sector && (
                            <span className="text-xs text-muted-foreground">
                              {suggestion.sector}
                            </span>
                          )}
                        </div>
                      </div>
                      {suggestion.type === 'exact' && (
                        <Badge variant="secondary" className="text-xs">
                          Coincidencia exacta
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};