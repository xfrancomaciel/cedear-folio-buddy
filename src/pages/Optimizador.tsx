import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizerForm } from "@/components/Optimizador/OptimizerForm";
import { PortfolioComposition } from "@/components/Optimizador/PortfolioComposition";
import { CorrelationMatrix } from "@/components/Optimizador/CorrelationMatrix";
import { PerformanceChart } from "@/components/Optimizador/PerformanceChart";
import { MetricsTable } from "@/components/Optimizador/MetricsTable";
import { CAGRChart } from "@/components/Optimizador/CAGRChart";
import { ExportButtons } from "@/components/Optimizador/ExportButtons";
import { EfficientFrontierChart } from "@/components/Optimizador/EfficientFrontierChart";
import { PortfolioWeightsChart } from "@/components/Optimizador/PortfolioWeightsChart";
import { VaRChart } from "@/components/Optimizador/VaRChart";
import { StressTestTable } from "@/components/Optimizador/StressTestTable";
import { usePortfolioOptimizer } from "@/hooks/usePortfolioOptimizer";
import { Target, TrendingUp, BarChart3, PieChart, Zap, AlertTriangle, Activity } from "lucide-react";
import type { OptimizerInput } from "@/types/optimizer";

const Optimizador = () => {
  const [input, setInput] = useState<OptimizerInput>({
    tickers: ["AAPL", "MSFT", "LLY", "AMZN", "V", "JPM", "GOLD", "HD", "KO", "PG"],
    weights: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    benchmark: "SPY",
    years: 10,
  });

  const { result, isLoading, error, analyze } = usePortfolioOptimizer();

  const handleAnalyze = (newInput: OptimizerInput) => {
    setInput(newInput);
    analyze(newInput);
  };

  const hasOptimization = result?.optimization;
  const hasVaR = result?.varData && result.varData.length > 0;
  const hasStressTest = result?.stressTest;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Optimizador de Cartera</h1>
          <p className="text-muted-foreground">
            Analiza y optimiza tu portfolio con Markowitz y Monte Carlo
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="card-financial">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Configuración del Análisis
            </CardTitle>
            <CardDescription>
              Define los activos, pesos y parámetros. Activa "Modo Optimización" para Markowitz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OptimizerForm onAnalyze={handleAnalyze} initialInput={input} />
          </CardContent>
        </Card>

        {isLoading && (
          <Card className="card-financial">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Analizando cartera...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="card-financial border-destructive">
            <CardContent className="p-6">
              <div className="text-destructive">
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {result && !isLoading && (
          <Tabs defaultValue={hasOptimization ? "frontier" : "metrics"} className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1">
              {hasOptimization && (
                <>
                  <TabsTrigger value="frontier" className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Frontera
                  </TabsTrigger>
                  <TabsTrigger value="weights">Pesos Óptimos</TabsTrigger>
                </>
              )}
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="composition">Composición</TabsTrigger>
              <TabsTrigger value="correlation">Correlación</TabsTrigger>
              <TabsTrigger value="performance">Rendimiento</TabsTrigger>
              <TabsTrigger value="cagr">CAGR</TabsTrigger>
              {hasVaR && (
                <TabsTrigger value="var" className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  VaR
                </TabsTrigger>
              )}
              {hasStressTest && (
                <TabsTrigger value="stress" className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Stress Test
                </TabsTrigger>
              )}
            </TabsList>

            {hasOptimization && (
              <>
                <TabsContent value="frontier">
                  <EfficientFrontierChart result={result} />
                </TabsContent>
                <TabsContent value="weights">
                  <PortfolioWeightsChart 
                    maxSharpe={result.optimization!.maxSharpe}
                    minVolatility={result.optimization!.minVolatility}
                    targetReturn={result.optimization!.targetReturn}
                  />
                </TabsContent>
              </>
            )}

            <TabsContent value="metrics" className="space-y-6">
              <Card className="card-financial">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Métricas Comparativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricsTable result={result} />
                </CardContent>
              </Card>
              <ExportButtons result={result} />
            </TabsContent>

            <TabsContent value="composition">
              <Card className="card-financial">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Composición de la Cartera
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PortfolioComposition result={result} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlation">
              <Card className="card-financial">
                <CardHeader>
                  <CardTitle>Matriz de Correlaciones</CardTitle>
                  <CardDescription>Correlación entre activos de la cartera</CardDescription>
                </CardHeader>
                <CardContent>
                  <CorrelationMatrix result={result} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card className="card-financial">
                <CardHeader>
                  <CardTitle>Evolución del Rendimiento</CardTitle>
                  <CardDescription>Comparación de rendimiento acumulado vs benchmark</CardDescription>
                </CardHeader>
                <CardContent>
                  <PerformanceChart result={result} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cagr">
              <Card className="card-financial">
                <CardHeader>
                  <CardTitle>CAGR por Activo</CardTitle>
                  <CardDescription>Rendimiento anualizado compuesto de cada activo</CardDescription>
                </CardHeader>
                <CardContent>
                  <CAGRChart result={result} />
                </CardContent>
              </Card>
            </TabsContent>

            {hasVaR && (
              <TabsContent value="var">
                <VaRChart varData={result.varData!} />
              </TabsContent>
            )}

            {hasStressTest && (
              <TabsContent value="stress">
                <StressTestTable 
                  hypothetical={result.stressTest!.hypothetical}
                  historical={result.stressTest!.historical}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Optimizador;
