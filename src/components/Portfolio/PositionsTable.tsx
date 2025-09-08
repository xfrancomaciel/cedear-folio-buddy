import { Position } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/utils/portfolioCalculations';
import { getCEDEARInfo } from '@/data/cedearsData';
import { Briefcase } from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
}

export const PositionsTable = ({ positions }: PositionsTableProps) => {
  if (positions.length === 0) {
    return (
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Posiciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay posiciones en el portfolio
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Posiciones ({positions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">TICKER</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">CANTIDAD</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">PRECIO PROM.</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">VALOR ACTUAL</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">GANANCIA</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">% CARTERA</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => {
                const cedearsInfo = getCEDEARInfo(position.ticker);
                const gainPercentage = position.precio_promedio_ars > 0 
                  ? ((position.valor_actual_ars / position.cantidad - position.precio_promedio_ars) / position.precio_promedio_ars) * 100 
                  : 0;

                return (
                  <tr key={position.ticker} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{position.ticker}</span>
                          <Badge variant="outline" className="text-xs">
                            {cedearsInfo?.sector || 'N/A'}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {cedearsInfo?.nombre || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">{position.cantidad.toLocaleString()}</span>
                        {cedearsInfo && (
                          <span className="text-xs text-muted-foreground">
                            {(position.cantidad / cedearsInfo.ratio).toFixed(2)} acc.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-4 px-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {formatCurrency(position.precio_promedio_ars, 'ARS')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(position.precio_promedio_usd, 'USD')}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {formatCurrency(position.valor_actual_ars, 'ARS')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(position.valor_actual_usd, 'USD')}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-2">
                      <div className="flex flex-col">
                        <span className={`font-semibold ${position.ganancia_no_realizada_ars >= 0 ? 'gain-positive' : 'gain-negative'}`}>
                          {formatCurrency(position.ganancia_no_realizada_ars, 'ARS')}
                        </span>
                        <span className={`text-xs ${gainPercentage >= 0 ? 'gain-positive' : 'gain-negative'}`}>
                          {formatPercentage(gainPercentage)}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-2">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">
                          {position.porcentaje_cartera.toFixed(1)}%
                        </span>
                        <div className="w-12 h-1 bg-muted rounded-full mt-1">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(position.porcentaje_cartera, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};