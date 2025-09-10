import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { OptimizerResult } from "@/types/optimizer";

interface CAGRChartProps {
  result: OptimizerResult;
}

export const CAGRChart = ({ result }: CAGRChartProps) => {
  const data = result.cagrData.map(item => ({
    ...item,
    cagrPercent: item.cagr * 100,
    color: item.isPortfolio 
      ? 'hsl(var(--warning))' 
      : item.isBenchmark 
        ? 'hsl(var(--muted-foreground))' 
        : 'hsl(var(--primary))',
  }));

  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.ticker}</p>
          <p className="text-primary">
            CAGR: {data.cagrPercent.toFixed(2)}%
          </p>
          {data.isPortfolio && <p className="text-xs text-muted-foreground">Tu Cartera</p>}
          {data.isBenchmark && <p className="text-xs text-muted-foreground">Benchmark</p>}
        </div>
      );
    }
    return null;
  };

  // Custom bar component to handle different colors
  const CustomBar = (props: any) => {
    const { payload } = props;
    return (
      <Bar 
        {...props} 
        fill={payload?.color || 'hsl(var(--primary))'}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="ticker"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: 'CAGR (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={renderTooltip} />
            <Bar dataKey="cagrPercent" fill="hsl(var(--primary))">
              {data.map((entry, index) => (
                <Bar key={`cell-${index}`} dataKey="cagrPercent" fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CAGR Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Mejor Rendimiento</h4>
          <div className="text-center">
            {(() => {
              const best = data.reduce((prev, current) => 
                prev.cagrPercent > current.cagrPercent ? prev : current
              );
              return (
                <>
                  <p className="font-bold text-success text-lg">{best.ticker}</p>
                  <p className="text-sm text-muted-foreground">
                    {best.cagrPercent.toFixed(2)}% CAGR
                  </p>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Peor Rendimiento</h4>
          <div className="text-center">
            {(() => {
              const worst = data.reduce((prev, current) => 
                prev.cagrPercent < current.cagrPercent ? prev : current
              );
              return (
                <>
                  <p className="font-bold text-destructive text-lg">{worst.ticker}</p>
                  <p className="text-sm text-muted-foreground">
                    {worst.cagrPercent.toFixed(2)}% CAGR
                  </p>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Promedio</h4>
          <div className="text-center">
            {(() => {
              const assetsCagr = data.filter(d => !d.isPortfolio && !d.isBenchmark);
              const average = assetsCagr.length > 0 
                ? assetsCagr.reduce((sum, d) => sum + d.cagrPercent, 0) / assetsCagr.length 
                : 0;
              return (
                <>
                  <p className="font-bold text-primary text-lg">
                    {average.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CAGR Promedio
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
          <span>Activos individuales</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
          <span>Tu Cartera</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
          <span>Benchmark</span>
        </div>
      </div>
    </div>
  );
};