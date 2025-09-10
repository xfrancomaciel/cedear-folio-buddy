import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useBondsData, useBondSearch } from "@/hooks/useBondsData";
import { BondPrice } from "@/types/bonds";

export default function BondsAnalytics() {
  const { bondPrices, marketMetrics, isLoading, triggerDataRefresh } = useBondsData();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredBonds = useBondSearch(bondPrices, searchTerm);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(0)}K`;
    }
    return volume.toString();
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getStatusBadge = (status: BondPrice['status']) => {
    return status === 'Live' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        En Vivo
      </Badge>
    ) : (
      <Badge variant="secondary">
        Sin Precio
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análisis de Bonos</h1>
          <p className="text-muted-foreground">
            Precios y métricas en tiempo real de bonos argentinos
          </p>
        </div>
        <Button
          onClick={triggerDataRefresh}
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Market Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Instrumentos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bondPrices.filter(b => b.status === 'Live').length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {bondPrices.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spread Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketMetrics ? `${(marketMetrics.average_spread_bps / 100).toFixed(0)} bps` : "0 bps"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duración Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketMetrics ? `${marketMetrics.average_duration_years.toFixed(1)} años` : "0.0 años"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Beta vs USD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketMetrics ? marketMetrics.beta_vs_usd.toFixed(2) : "1.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Panel de Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bonds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Instrumentos de Renta Fija</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Bid</TableHead>
                  <TableHead className="text-right">Ask</TableHead>
                  <TableHead className="text-right">Precio Mid</TableHead>
                  <TableHead className="text-right">Volumen</TableHead>
                  <TableHead className="text-right">Cambio %</TableHead>
                  <TableHead className="text-right">TIR</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBonds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No se encontraron bonos con ese criterio de búsqueda" : "No hay datos de bonos disponibles"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBonds.map((bond) => (
                    <TableRow key={bond.symbol} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {bond.symbol}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(bond.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {bond.px_bid ? formatCurrency(bond.px_bid) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {bond.px_ask ? formatCurrency(bond.px_ask) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {bond.px_mid ? formatCurrency(bond.px_mid) : 
                         bond.px_close ? formatCurrency(bond.px_close) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatVolume(bond.volume)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getPriceChangeColor(bond.pct_change)}`}>
                        <div className="flex items-center justify-end gap-1">
                          {bond.pct_change > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : bond.pct_change < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : null}
                          {bond.pct_change > 0 ? '+' : ''}{bond.pct_change.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {bond.yield ? `${bond.yield.toFixed(1)}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {bond.duration ? `${bond.duration.toFixed(1)}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}