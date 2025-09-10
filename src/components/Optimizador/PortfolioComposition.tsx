import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { OptimizerResult } from "@/types/optimizer";

interface PortfolioCompositionProps {
  result: OptimizerResult;
}

export const PortfolioComposition = ({ result }: PortfolioCompositionProps) => {
  const data = result.tickers.map((ticker, index) => ({
    name: ticker,
    value: result.weights[index] * 100,
    weight: result.weights[index],
  }));

  // Professional color palette
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(221 83% 63%)',
    'hsl(142 76% 46%)',
    'hsl(38 92% 60%)',
    'hsl(0 84% 70%)',
    'hsl(280 100% 70%)',
    'hsl(200 98% 39%)',
    'hsl(160 60% 45%)',
  ];

  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            {data.value.toFixed(1)}% ({(data.weight * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    return `${entry.name} (${entry.value.toFixed(1)}%)`;
  };

  return (
    <div className="space-y-6">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Composition Table */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.value.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};