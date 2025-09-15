import React from 'react';
import { Star, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCedearFavorites } from '@/hooks/useCedearFavorites';

interface CEDEARFavoritesProps {
  sectors: Record<string, { sector: string; company_name?: string }>;
  onSymbolClick?: (symbol: string) => void;
  className?: string;
}

export const CEDEARFavorites: React.FC<CEDEARFavoritesProps> = ({
  sectors,
  onSymbolClick,
  className
}) => {
  const { favorites, removeFavorite, clearFavorites } = useCedearFavorites();

  if (favorites.length === 0) {
    return (
      <Alert className={className}>
        <Heart className="h-4 w-4" />
        <AlertDescription>
          No tienes CEDEARs favoritos aún. Haz clic en la ⭐ junto a cualquier CEDEAR para agregarlo a favoritos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            Mis Favoritos
            <Badge variant="secondary">{favorites.length}</Badge>
          </CardTitle>
          {favorites.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFavorites}
              className="text-muted-foreground hover:text-destructive"
            >
              Limpiar todo
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {favorites.map((symbol, index) => {
            const sectorInfo = sectors[symbol];
            
            return (
              <div key={symbol}>
                <div className="flex items-center justify-between group">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onSymbolClick?.(symbol)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {symbol}
                      </Badge>
                      <div className="flex flex-col min-w-0 flex-1">
                        {sectorInfo?.company_name && (
                          <span className="text-sm font-medium truncate">
                            {sectorInfo.company_name}
                          </span>
                        )}
                        {sectorInfo?.sector && (
                          <span className="text-xs text-muted-foreground">
                            {sectorInfo.sector}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(symbol)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {index < favorites.length - 1 && <Separator className="mt-3" />}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Tus favoritos se guardan localmente en tu navegador.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};