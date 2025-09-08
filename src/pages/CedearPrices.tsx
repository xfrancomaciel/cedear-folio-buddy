import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PriceUpdateStatus } from '@/components/Portfolio/PriceUpdateStatus';
import { useCedearPrices } from '@/hooks/useCedearPrices';
import { formatCurrency } from '@/utils/portfolioCalculations';
import { useNavigate } from 'react-router-dom';

const CedearPrices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Get all tracked CEDEARs
  const TRACKED_CEDEARS = [
    'AAPL', 'NVDA', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NFLX',
    'DIS', 'BABA', 'GOLD', 'KO', 'PFE', 'XOM', 'JPM', 'V', 'JNJ',
    'WMT', 'PG', 'HD', 'UNH', 'MA', 'BAC', 'ABBV', 'LLY', 'AVGO',
    'COST', 'ORCL', 'NKE', 'MRK', 'TMO', 'ABT', 'DHR', 'VZ', 'ADBE',
    'CVX', 'ASML', 'TXN', 'ACN', 'QCOM', 'AMD', 'HON', 'CMCSA', 'NEE'
  ];

  const { prices, loading, error, lastUpdated, refresh } = useCedearPrices(TRACKED_CEDEARS);

  // Filter prices based on search term
  const filteredPrices = Object.values(prices).filter(price =>
    price.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrendIcon = (pctChange: number) => {
    if (pctChange > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (pctChange < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (pctChange: number) => {
    if (pctChange > 0) return 'text-green-600';
    if (pctChange < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getVariantByChange = (pctChange: number) => {
    if (pctChange > 0) return 'default';
    if (pctChange < 0) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Portfolio
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gradient">
                  Precios CEDEAR en Tiempo Real
                </h1>
                <p className="text-muted-foreground mt-1">
                  Precios actualizados automáticamente desde data912.com
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredPrices.length} de {TRACKED_CEDEARS.length} CEDEARs
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Price Update Status */}
        <PriceUpdateStatus
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />

        {/* Search and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Precios CEDEAR</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ticker (ej: AAPL, TSLA, GOOGL)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Prices Table */}
            {loading && Object.keys(prices).length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Cargando precios...</p>
              </div>
            ) : filteredPrices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay precios disponibles'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead className="text-right">Precio Compra</TableHead>
                      <TableHead className="text-right">Precio Venta</TableHead>
                      <TableHead className="text-right">Precio Medio</TableHead>
                      <TableHead className="text-right">Último Cierre</TableHead>
                      <TableHead className="text-right">Volumen</TableHead>
                      <TableHead className="text-right">Variación %</TableHead>
                      <TableHead className="text-right">Actualizado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrices
                      .sort((a, b) => a.symbol.localeCompare(b.symbol))
                      .map((price) => (
                        <TableRow key={price.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="font-mono">
                              {price.symbol}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(price.px_bid, 'ARS')}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(price.px_ask, 'ARS')}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(price.px_mid, 'ARS')}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(price.px_close, 'ARS')}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {price.volume.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {getTrendIcon(price.pct_change)}
                              <Badge 
                                variant={getVariantByChange(price.pct_change)}
                                className={`font-mono ${getTrendColor(price.pct_change)}`}
                              >
                                {price.pct_change > 0 ? '+' : ''}{price.pct_change.toFixed(2)}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {new Date(price.last_updated).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {filteredPrices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">En Alza</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {filteredPrices.filter(p => p.pct_change > 0).length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">En Baja</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {filteredPrices.filter(p => p.pct_change < 0).length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Minus className="h-4 w-4" />
                  <span className="text-sm font-medium">Sin Cambio</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {filteredPrices.filter(p => p.pct_change === 0).length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default CedearPrices;