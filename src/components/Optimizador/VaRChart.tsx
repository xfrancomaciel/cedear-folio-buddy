import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { AlertTriangle, TrendingDown } from "lucide-react";
import type { VaRResult } from "@/types/optimizer";

interface VaRChartProps {
  varData: VaRResult[];
}

export const VaRChart = ({ varData }: VaRChartProps) => {
  const chartData = varData.map(v => ({
    portfolio: v.portfolio,
    var1d: v.var1d,
    var10d: v.var10d,
  }));

  return (
    <div className="space-y-6">
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Value at Risk (VaR)
          </CardTitle>
          <CardDescription>
            Pérdida máxima esperada con 95% de confianza (método paramétrico)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="portfolio" 
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  tickFormatter={(v) => `${v.toFixed(1)}%`}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Pérdida Máxima (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)}%`, 
                    name === 'var1d' ? 'VaR 1 Día' : 'VaR 10 Días'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="var1d" name="VaR 1 Día" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="var10d" name="VaR 10 Días" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Portfolio</TableHead>
                <TableHead className="text-right">VaR 1 Día</TableHead>
                <TableHead className="text-right">VaR 10 Días</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {varData.map((row) => (
                <TableRow key={row.portfolio}>
                  <TableCell className="font-medium">{row.portfolio}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${row.var1d > 2 ? 'text-red-500' : 'text-amber-500'}`}>
                      -{row.var1d.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${row.var10d > 5 ? 'text-red-500' : 'text-amber-500'}`}>
                      -{row.var10d.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Interpretación
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>VaR 1 Día:</strong> Con 95% de confianza, la pérdida diaria no superará este valor.</li>
              <li>• <strong>VaR 10 Días:</strong> Con 95% de confianza, la pérdida en 10 días no superará este valor.</li>
              <li>• Valores más bajos indican menor riesgo de pérdidas extremas.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
