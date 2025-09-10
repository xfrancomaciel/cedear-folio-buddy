import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { useBondsData } from "@/hooks/useBondsData";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const { bondPrices, marketMetrics, isLoading, triggerDataRefresh } = useBondsData();
  const { portfolioSummary, isLoading: portfolioLoading } = usePortfolioData();

  const handleRefresh = () => {
    triggerDataRefresh();
  };

  const formatCurrency = (value: number, currency: 'ARS' | 'USD' = 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const kpiCards = [
    {
      title: "Valor Portfolio",
      value: portfolioSummary ? formatCurrency(portfolioSummary.valor_total_usd) : "$0.00",
      change: portfolioSummary && portfolioSummary.ganancia_total_no_realizada_usd !== 0 
        ? `${portfolioSummary.ganancia_total_no_realizada_usd > 0 ? '+' : ''}${formatCurrency(portfolioSummary.ganancia_total_no_realizada_usd)}`
        : undefined,
      trend: portfolioSummary && portfolioSummary.ganancia_total_no_realizada_usd > 0 ? 'up' : 
             portfolioSummary && portfolioSummary.ganancia_total_no_realizada_usd < 0 ? 'down' : 'neutral',
      icon: PieChart
    },
    {
      title: "Bonos Activos",
      value: bondPrices.filter(b => b.status === 'Live').length.toString(),
      change: `${bondPrices.length} total`,
      trend: 'neutral' as const,
      icon: TrendingUp
    },
    {
      title: "Spread Promedio",
      value: marketMetrics ? `${(marketMetrics.average_spread_bps / 100).toFixed(0)} bps` : "0 bps",
      change: marketMetrics ? `β ${marketMetrics.beta_vs_usd.toFixed(2)}` : undefined,
      trend: 'neutral' as const,
      icon: BarChart3
    },
    {
      title: "Duración Promedio",
      value: marketMetrics ? `${marketMetrics.average_duration_years.toFixed(1)} años` : "0.0 años",
      change: marketMetrics ? `Convex ${marketMetrics.average_convexity.toFixed(2)}` : undefined,
      trend: 'neutral' as const,
      icon: TrendingDown
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen unificado de bonos y portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {format(new Date(), "PPp", { locale: es })}
          </Badge>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.change && (
                <p className={`text-xs flex items-center mt-1 ${
                  kpi.trend === 'up' ? 'text-green-600' : 
                  kpi.trend === 'down' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {kpi.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {kpi.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {kpi.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Operaciones frecuentes del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href="/bonos">Ver Bonos</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/acciones">Ver CEDEAR</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/portfolio">Gestionar Portfolio</a>
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bonos en Vivo</CardTitle>
            <CardDescription>
              Instrumentos con precios actualizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bondPrices.slice(0, 5).map((bond) => (
                <div key={bond.symbol} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant={bond.status === 'Live' ? 'default' : 'secondary'}>
                      {bond.symbol}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatCurrency(bond.px_mid || bond.px_close)}
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${
                    bond.pct_change > 0 ? 'text-green-600' : 
                    bond.pct_change < 0 ? 'text-red-600' : 
                    'text-muted-foreground'
                  }`}>
                    {bond.pct_change > 0 ? '+' : ''}{bond.pct_change.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Mercado</CardTitle>
            <CardDescription>
              Indicadores clave del mercado de bonos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {marketMetrics ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Spread Promedio</span>
                  <span className="font-medium">{(marketMetrics.average_spread_bps / 100).toFixed(0)} bps</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duración Promedio</span>
                  <span className="font-medium">{marketMetrics.average_duration_years.toFixed(1)} años</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Convexidad</span>
                  <span className="font-medium">{marketMetrics.average_convexity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Beta vs USD</span>
                  <span className="font-medium">{marketMetrics.beta_vs_usd.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Cargando métricas...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}