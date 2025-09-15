import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRetirementCalculator } from '@/hooks/useRetirementCalculator';
import { useCedearPrice } from '@/hooks/useCedearPrices';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CalculadoraRetiro = () => {
  const { inputs, results, chartData, updateInput } = useRetirementCalculator();
  const { price: spyPrice, loading: spyLoading } = useCedearPrice('SPY');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Calculadora de Retiro</h1>
        <p className="text-muted-foreground">
          Calcula cuánto puedes ahorrar para tu jubilación invirtiendo en el SPY
        </p>
      </div>

      {/* SPY Information */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            ¿Qué es el SPY?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            El SPDR S&P 500 ETF Trust (SPY) es un fondo que replica el rendimiento del índice S&P 500, 
            incluyendo las 500 empresas más grandes de Estados Unidos. Históricamente ha ofrecido 
            un retorno promedio anual del ~10% en los últimos 30 años.
          </p>
          {spyPrice && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-medium">SPY CEDEAR actual: ${spyPrice.px_close?.toFixed(2) || 'N/A'}</span>
              {spyPrice.pct_change !== undefined && (
                <span className={`flex items-center gap-1 ${spyPrice.pct_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {spyPrice.pct_change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {spyPrice.pct_change > 0 ? '+' : ''}{spyPrice.pct_change.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de Inversión</CardTitle>
          <CardDescription>Ajusta estos valores para personalizar tu cálculo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="initialAmount">Monto inicial (USD)</Label>
              <Input
                id="initialAmount"
                type="number"
                value={inputs.initialAmount}
                onChange={(e) => updateInput('initialAmount', Number(e.target.value) || 0)}
                min="0"
                step="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">Aporte mensual (USD)</Label>
              <Input
                id="monthlyContribution"
                type="number"
                value={inputs.monthlyContribution}
                onChange={(e) => updateInput('monthlyContribution', Number(e.target.value) || 0)}
                min="0"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Años de inversión</Label>
              <Input
                id="years"
                type="number"
                value={inputs.years}
                onChange={(e) => updateInput('years', Number(e.target.value) || 1)}
                min="1"
                max="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualReturn">Rendimiento anual (%)</Label>
              <Input
                id="annualReturn"
                type="number"
                value={inputs.annualReturn}
                onChange={(e) => updateInput('annualReturn', Number(e.target.value) || 0)}
                min="0"
                max="30"
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-500/30 bg-red-500/10 dark:border-red-500/50 dark:bg-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-800 dark:text-red-100">
              <TrendingDown className="h-5 w-5" />
              Solo Ahorrando
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-200 font-medium">
              Sin inversión, solo acumulando dinero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-100">
              {formatCurrency(results.savingsWithoutInterest)}
            </div>
            <p className="text-sm text-red-700 dark:text-red-200 mt-1 font-medium">
              Capital + aportes mensuales
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/10 dark:border-green-500/50 dark:bg-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-100">
              <TrendingUp className="h-5 w-5" />
              Invirtiendo en SPY
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-200 font-medium">
              Con interés compuesto al {formatPercentage(inputs.annualReturn)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-100">
              {formatCurrency(results.savingsWithInvestment)}
            </div>
            <p className="text-sm text-green-700 dark:text-green-200 mt-1 font-medium">
              Capital + interés compuesto
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/10 dark:border-blue-500/50 dark:bg-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-100">
              <DollarSign className="h-5 w-5" />
              Diferencia
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-200 font-medium">
              Ganancia por invertir vs solo ahorrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-100">
              {formatCurrency(results.difference)}
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1 font-medium">
              {((results.difference / results.savingsWithoutInterest) * 100).toFixed(1)}% más dinero
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución del Patrimonio</CardTitle>
          <CardDescription>Comparación entre ahorrar e invertir a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Años', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Patrimonio (USD)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number, name) => [
                    formatCurrency(value), 
                    name === 'savings' ? 'Solo Ahorrando' : 'Invirtiendo en SPY'
                  ]}
                  labelFormatter={(year) => `Año ${year}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="investment" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Los rendimientos históricos no garantizan rendimientos futuros. 
          El SPY ha tenido un retorno promedio del ~10% anual en los últimos 30 años, pero puede variar 
          significativamente año a año. Esta calculadora es solo para fines educativos e ilustrativos.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CalculadoraRetiro;