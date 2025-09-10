import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { OptimizerResult } from "@/types/optimizer";

interface MetricsTableProps {
  result: OptimizerResult;
}

export const MetricsTable = ({ result }: MetricsTableProps) => {
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toFixed(2);
  };

  const getBadgeVariant = (portfolioValue: number, benchmarkValue: number) => {
    if (portfolioValue > benchmarkValue) return "default";
    if (portfolioValue < benchmarkValue) return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Métrica</TableHead>
            <TableHead>Cartera</TableHead>
            <TableHead>{result.benchmark}</TableHead>
            <TableHead>Diferencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Beta</TableCell>
            <TableCell>{formatNumber(result.portfolioMetrics.beta)}</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">Volatilidad Anualizada</TableCell>
            <TableCell>{formatPercentage(result.portfolioMetrics.volatility)}</TableCell>
            <TableCell>{formatPercentage(result.benchmarkMetrics.volatility)}</TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(result.benchmarkMetrics.volatility, result.portfolioMetrics.volatility)}>
                {formatPercentage(result.portfolioMetrics.volatility - result.benchmarkMetrics.volatility)}
              </Badge>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">CAGR</TableCell>
            <TableCell>{formatPercentage(result.portfolioMetrics.cagr)}</TableCell>
            <TableCell>{formatPercentage(result.benchmarkMetrics.cagr)}</TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(result.portfolioMetrics.cagr, result.benchmarkMetrics.cagr)}>
                {formatPercentage(result.portfolioMetrics.cagr - result.benchmarkMetrics.cagr)}
              </Badge>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Rendimiento 12M</TableCell>
            <TableCell>{formatPercentage(result.portfolioMetrics.return12m)}</TableCell>
            <TableCell>{formatPercentage(result.benchmarkMetrics.return12m)}</TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(result.portfolioMetrics.return12m, result.benchmarkMetrics.return12m)}>
                {formatPercentage(result.portfolioMetrics.return12m - result.benchmarkMetrics.return12m)}
              </Badge>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Correlación con Benchmark</TableCell>
            <TableCell>{formatNumber(result.portfolioMetrics.correlation)}</TableCell>
            <TableCell>1.00</TableCell>
            <TableCell>-</TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Sharpe Ratio</TableCell>
            <TableCell>{formatNumber(result.portfolioMetrics.sharpeRatio)}</TableCell>
            <TableCell>{formatNumber(result.benchmarkMetrics.sharpeRatio)}</TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(result.portfolioMetrics.sharpeRatio, result.benchmarkMetrics.sharpeRatio)}>
                {formatNumber(result.portfolioMetrics.sharpeRatio - result.benchmarkMetrics.sharpeRatio)}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Correlation Alerts */}
      {result.correlationData.highCorrelationPairs.length > 0 && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <h4 className="font-medium text-destructive mb-2">
            ⚠️ ALERTA: Activos con alta correlación (&gt;0.85)
          </h4>
          <ul className="space-y-1">
            {result.correlationData.highCorrelationPairs.map((pair, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {pair.ticker1} y {pair.ticker2}: correlación = {pair.correlation.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.correlationData.highCorrelationPairs.length === 0 && (
        <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-sm text-success">
          ✅ No se detectan pares de activos con correlación mayor a 0.85
          </p>
        </div>
      )}
    </div>
  );
};