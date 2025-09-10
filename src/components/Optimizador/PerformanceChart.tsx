import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import type { OptimizerResult } from "@/types/optimizer";

interface PerformanceChartProps {
  result: OptimizerResult;
}

export const PerformanceChart = ({ result }: PerformanceChartProps) => {
  const data = result.performanceData.dates.map((date, index) => ({
    date,
    portfolio: result.performanceData.portfolioValues[index],
    benchmark: result.performanceData.benchmarkValues[index],
    formattedDate: format(parseISO(date), "MM/dd/yy"),
  }));

  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{format(parseISO(data.date), "MMM dd, yyyy")}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm">Cartera:</span>
              </div>
              <span className="font-medium">{data.portfolio.toFixed(2)}x</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                <span className="text-sm">{result.benchmark}:</span>
              </div>
              <span className="font-medium">{data.benchmark.toFixed(2)}x</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between space-x-4">
                <span className="text-sm">Diferencia:</span>
                <span className={`font-medium ${
                  data.portfolio > data.benchmark ? 'text-success' : 'text-destructive'
                }`}>
                  {((data.portfolio - data.benchmark) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: 'Multiplicador', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="portfolio"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Cartera"
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name={result.benchmark}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Rendimiento Total</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">Cartera:</span>
              <span className="font-medium">
                {((data[data.length - 1]?.portfolio || 1) * 100 - 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{result.benchmark}:</span>
              <span className="font-medium">
                {((data[data.length - 1]?.benchmark || 1) * 100 - 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Multiplicador Final</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">Cartera:</span>
              <span className="font-medium">
                {(data[data.length - 1]?.portfolio || 1).toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{result.benchmark}:</span>
              <span className="font-medium">
                {(data[data.length - 1]?.benchmark || 1).toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Alfa (Exceso de Retorno)</h4>
          <div className="text-center">
            <span className={`text-lg font-bold ${
              (data[data.length - 1]?.portfolio || 1) > (data[data.length - 1]?.benchmark || 1)
                ? 'text-success' 
                : 'text-destructive'
            }`}>
              {(((data[data.length - 1]?.portfolio || 1) - (data[data.length - 1]?.benchmark || 1)) * 100).toFixed(1)}%
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              vs {result.benchmark}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};