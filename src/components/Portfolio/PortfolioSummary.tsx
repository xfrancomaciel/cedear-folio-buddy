import { PortfolioSummary } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/portfolioCalculations';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface PortfolioSummaryProps {
  summary: PortfolioSummary;
}

export const PortfolioSummaryCard = ({ summary }: PortfolioSummaryProps) => {
  const totalGainARS = summary.ganancia_total_no_realizada_ars + summary.ganancia_total_realizada_ars;
  const totalGainUSD = summary.ganancia_total_no_realizada_usd + summary.ganancia_total_realizada_usd;
  const totalGainPercentageARS = summary.valor_total_ars > 0 ? (totalGainARS / (summary.valor_total_ars - totalGainARS)) * 100 : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Value */}
      <Card className="card-financial">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gradient">
            {formatCurrency(summary.valor_total_ars, 'ARS')}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(summary.valor_total_usd, 'USD')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            USD: ${summary.usd_rate_actual.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Total Gains */}
      <Card className="card-financial">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
          {totalGainARS >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalGainARS >= 0 ? 'gain-positive' : 'gain-negative'}`}>
            {formatCurrency(totalGainARS, 'ARS')}
          </div>
          <p className={`text-xs ${totalGainARS >= 0 ? 'gain-positive' : 'gain-negative'}`}>
            {formatCurrency(totalGainUSD, 'USD')}
          </p>
          <p className={`text-xs font-medium ${totalGainARS >= 0 ? 'gain-positive' : 'gain-negative'}`}>
            {formatPercentage(totalGainPercentageARS)}
          </p>
        </CardContent>
      </Card>

      {/* Unrealized Gains */}
      <Card className="card-financial">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia No Realizada</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.ganancia_total_no_realizada_ars >= 0 ? 'gain-positive' : 'gain-negative'}`}>
            {formatCurrency(summary.ganancia_total_no_realizada_ars, 'ARS')}
          </div>
          <p className={`text-xs ${summary.ganancia_total_no_realizada_ars >= 0 ? 'gain-positive' : 'gain-negative'}`}>
            {formatCurrency(summary.ganancia_total_no_realizada_usd, 'USD')}
          </p>
        </CardContent>
      </Card>

      {/* Realized Gains */}
      <Card className="card-financial">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia Realizada</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.ganancia_total_realizada_ars >= 0 ? 'gain-positive' : 'gain-negative'}`}>
            {formatCurrency(summary.ganancia_total_realizada_ars, 'ARS')}
          </div>
          <p className={`text-xs ${summary.ganancia_total_realizada_ars >= 0 ? 'gain-positive' : 'gain-negative'}`}>
            {formatCurrency(summary.ganancia_total_realizada_usd, 'USD')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};