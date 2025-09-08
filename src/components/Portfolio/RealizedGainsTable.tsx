import { OperacionCerrada } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage, calculateHoldingDays } from '@/utils/portfolioCalculations';
import { TrendingUp } from 'lucide-react';

interface RealizedGainsTableProps {
  operacionesCerradas: OperacionCerrada[];
}

export const RealizedGainsTable = ({ operacionesCerradas }: RealizedGainsTableProps) => {
  if (operacionesCerradas.length === 0) {
    return (
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ganancias Realizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay operaciones cerradas para mostrar
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalGainARS = operacionesCerradas.reduce((sum, op) => sum + op.ganancia_ars, 0);
  const totalGainUSD = operacionesCerradas.reduce((sum, op) => sum + op.ganancia_usd, 0);

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ganancias Realizadas ({operacionesCerradas.length} operaciones)
        </CardTitle>
        <div className="text-sm text-muted-foreground mt-2">
          <div className="flex justify-between">
            <span>Total ARS: </span>
            <span className={`font-semibold ${totalGainARS >= 0 ? 'gain-positive' : 'gain-negative'}`}>
              {formatCurrency(totalGainARS, 'ARS')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total USD: </span>
            <span className={`font-semibold ${totalGainUSD >= 0 ? 'gain-positive' : 'gain-negative'}`}>
              {formatCurrency(totalGainUSD, 'USD')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">TICKER</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">CANTIDAD</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">COMPRA</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">VENTA</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">DÍAS</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">GANANCIA</th>
              </tr>
            </thead>
            <tbody>
              {operacionesCerradas.map((operacion, index) => (
                <tr key={index} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex flex-col">
                      <span className="font-semibold">{operacion.ticker}</span>
                      <Badge variant="outline" className="text-xs w-fit">
                        Cerrada
                      </Badge>
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <span className="font-semibold">{operacion.cantidad.toLocaleString()}</span>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {new Date(operacion.fecha_compra).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {new Date(operacion.fecha_venta).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="flex flex-col">
                      <span className="font-semibold">{operacion.dias_tenencia}</span>
                      <span className="text-xs text-muted-foreground">días</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${operacion.ganancia_ars >= 0 ? 'gain-positive' : 'gain-negative'}`}>
                        {formatCurrency(operacion.ganancia_ars, 'ARS')}
                      </span>
                      <span className={`text-xs ${operacion.ganancia_usd >= 0 ? 'gain-positive' : 'gain-negative'}`}>
                        {formatCurrency(operacion.ganancia_usd, 'USD')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};