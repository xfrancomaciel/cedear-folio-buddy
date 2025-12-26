import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OptimizedPortfolio } from "@/types/optimizer";
import { Star, Circle, Target } from "lucide-react";

interface PortfolioWeightsChartProps {
  maxSharpe: OptimizedPortfolio;
  minVolatility: OptimizedPortfolio;
  targetReturn?: OptimizedPortfolio;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 70%, 50%)',
  'hsl(340, 70%, 50%)',
  'hsl(60, 70%, 50%)',
  'hsl(180, 70%, 50%)',
];

const PortfolioWeightsCard = ({ 
  portfolio, 
  title, 
  icon: Icon,
  iconColor 
}: { 
  portfolio: OptimizedPortfolio;
  title: string;
  icon: React.ElementType;
  iconColor: string;
}) => {
  const chartData = portfolio.weights
    .filter(w => w.weight > 0.01)
    .map(w => ({
      asset: w.asset,
      weight: w.weight * 100,
    }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <Card className="card-financial">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {title}
        </CardTitle>
        <div className="text-sm text-muted-foreground space-x-4">
          <span>Ret: <span className="text-green-500 font-mono">{(portfolio.returns * 100).toFixed(2)}%</span></span>
          <span>Vol: <span className="font-mono">{(portfolio.volatility * 100).toFixed(2)}%</span></span>
          <span>Sharpe: <span className="text-primary font-mono font-bold">{portfolio.sharpe.toFixed(3)}</span></span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                type="category" 
                dataKey="asset" 
                tick={{ fill: 'hsl(var(--foreground))' }}
                width={50}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Peso']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Peso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((item, i) => (
              <TableRow key={item.asset}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    {item.asset}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{item.weight.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const PortfolioWeightsChart = ({ maxSharpe, minVolatility, targetReturn }: PortfolioWeightsChartProps) => {
  return (
    <div className={`grid gap-6 ${targetReturn ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
      <PortfolioWeightsCard 
        portfolio={maxSharpe} 
        title="Max Sharpe" 
        icon={Star}
        iconColor="text-chart-1"
      />
      <PortfolioWeightsCard 
        portfolio={minVolatility} 
        title="Min Volatilidad" 
        icon={Circle}
        iconColor="text-chart-2"
      />
      {targetReturn && (
        <PortfolioWeightsCard 
          portfolio={targetReturn} 
          title={targetReturn.name} 
          icon={Target}
          iconColor="text-chart-3"
        />
      )}
    </div>
  );
};
