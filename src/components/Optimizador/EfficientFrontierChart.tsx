import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { OptimizerResult } from "@/types/optimizer";
import { Star, Circle, Target } from "lucide-react";

interface EfficientFrontierChartProps {
  result: OptimizerResult;
}

export const EfficientFrontierChart = ({ result }: EfficientFrontierChartProps) => {
  if (!result.optimization) return null;

  const { maxSharpe, minVolatility, targetReturn, efficientFrontier, randomPortfolios } = result.optimization;

  // Prepare random portfolios data (sample for performance)
  const randomData = randomPortfolios.returns.slice(0, 1500).map((ret, i) => ({
    volatility: randomPortfolios.volatility[i] * 100,
    returns: ret * 100,
    sharpe: randomPortfolios.sharpe[i],
  }));

  // Prepare efficient frontier data
  const frontierData = efficientFrontier.returns.map((ret, i) => ({
    volatility: efficientFrontier.volatility[i] * 100,
    returns: ret * 100,
  }));

  // Optimal points
  const optimalPoints = [
    {
      volatility: maxSharpe.volatility * 100,
      returns: maxSharpe.returns * 100,
      name: "Max Sharpe",
      sharpe: maxSharpe.sharpe,
    },
    {
      volatility: minVolatility.volatility * 100,
      returns: minVolatility.returns * 100,
      name: "Min Vol",
      sharpe: minVolatility.sharpe,
    },
  ];

  if (targetReturn) {
    optimalPoints.push({
      volatility: targetReturn.volatility * 100,
      returns: targetReturn.returns * 100,
      name: targetReturn.name,
      sharpe: targetReturn.sharpe,
    });
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">Retorno: {data.returns?.toFixed(2)}%</p>
          <p className="text-sm">Volatilidad: {data.volatility?.toFixed(2)}%</p>
          {data.sharpe !== undefined && (
            <p className="text-sm text-primary">Sharpe: {data.sharpe?.toFixed(3)}</p>
          )}
          {data.name && (
            <p className="text-sm font-bold text-primary mt-1">{data.name}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="card-financial">
        <CardHeader>
          <CardTitle>Espacio de Portfolios (Monte Carlo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="volatility" 
                  name="Volatilidad" 
                  unit="%" 
                  domain={['auto', 'auto']}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Volatilidad (%)', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="returns" 
                  name="Retorno" 
                  unit="%" 
                  domain={['auto', 'auto']}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Retorno (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Random portfolios cloud */}
                <Scatter 
                  name="Portfolios" 
                  data={randomData} 
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.3}
                />
                
                {/* Efficient frontier line */}
                <Scatter 
                  name="Frontera Eficiente" 
                  data={frontierData} 
                  fill="hsl(var(--primary))"
                  line={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                
                {/* Optimal points */}
                <Scatter 
                  name="Óptimos" 
                  data={optimalPoints} 
                  fill="hsl(var(--chart-1))"
                  shape="star"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground opacity-50"></div>
              <span>Portfolios Aleatorios</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Frontera Eficiente</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-chart-1" fill="hsl(var(--chart-1))" />
              <span>Portfolios Óptimos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimal Portfolios Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-financial border-chart-1/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4 text-chart-1" />
              Max Sharpe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retorno:</span>
              <span className="font-mono font-medium text-green-500">
                {(maxSharpe.returns * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volatilidad:</span>
              <span className="font-mono">{(maxSharpe.volatility * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sharpe:</span>
              <span className="font-mono font-bold text-primary">{maxSharpe.sharpe.toFixed(3)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-financial border-chart-2/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Circle className="h-4 w-4 text-chart-2" />
              Min Volatilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retorno:</span>
              <span className="font-mono font-medium text-green-500">
                {(minVolatility.returns * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volatilidad:</span>
              <span className="font-mono">{(minVolatility.volatility * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sharpe:</span>
              <span className="font-mono font-bold text-primary">{minVolatility.sharpe.toFixed(3)}</span>
            </div>
          </CardContent>
        </Card>

        {targetReturn && (
          <Card className="card-financial border-chart-3/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-chart-3" />
                {targetReturn.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retorno:</span>
                <span className="font-mono font-medium text-green-500">
                  {(targetReturn.returns * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volatilidad:</span>
                <span className="font-mono">{(targetReturn.volatility * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sharpe:</span>
                <span className="font-mono font-bold text-primary">{targetReturn.sharpe.toFixed(3)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
