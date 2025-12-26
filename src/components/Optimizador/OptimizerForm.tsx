import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Play, Loader2, Target, Zap } from "lucide-react";
import type { OptimizerInput } from "@/types/optimizer";

interface OptimizerFormProps {
  onAnalyze: (input: OptimizerInput) => void;
  initialInput: OptimizerInput;
}

export const OptimizerForm = ({ onAnalyze, initialInput }: OptimizerFormProps) => {
  const [tickersStr, setTickersStr] = useState(initialInput.tickers.join(", "));
  const [weightsStr, setWeightsStr] = useState(initialInput.weights.join(", "));
  const [benchmark, setBenchmark] = useState(initialInput.benchmark);
  const [years, setYears] = useState(initialInput.years);
  const [riskFreeRate, setRiskFreeRate] = useState(2);
  const [minWeight, setMinWeight] = useState(0);
  const [useTargetReturn, setUseTargetReturn] = useState(false);
  const [targetReturn, setTargetReturn] = useState(10);
  const [optimizeMode, setOptimizeMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse tickers
    const tickers = tickersStr
      .split(",")
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0);

    if (tickers.length === 0) {
      alert("Debe ingresar al menos 1 ticker.");
      return;
    }

    if (optimizeMode && tickers.length < 2) {
      alert("Para optimizar se necesitan al menos 2 tickers.");
      return;
    }

    // Parse weights
    let weights: number[];
    if (weightsStr.trim()) {
      try {
        weights = weightsStr.split(",").map(w => parseFloat(w.trim()));
        if (weights.length !== tickers.length) {
          alert("La cantidad de pesos debe coincidir con los tickers.");
          return;
        }
        if (weights.some(w => isNaN(w) || w < 0)) {
          alert("Los pesos deben ser números positivos.");
          return;
        }
      } catch {
        alert("Error al parsear los pesos. Use números separados por comas.");
        return;
      }
    } else {
      weights = new Array(tickers.length).fill(100 / tickers.length);
    }

    // Normalize weights
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    weights = weights.map(w => w / totalWeight);

    setIsAnalyzing(true);
    
    const input: OptimizerInput = {
      tickers,
      weights,
      benchmark,
      years,
      riskFreeRate: riskFreeRate / 100,
      minWeight: minWeight / 100,
      targetReturn: useTargetReturn ? targetReturn / 100 : undefined,
      mode: optimizeMode ? 'optimize' : 'analyze',
    };

    try {
      await onAnalyze(input);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tickers" className="text-sm font-medium">
              Tickers (separados por coma)
            </Label>
            <Input
              id="tickers"
              value={tickersStr}
              onChange={(e) => setTickersStr(e.target.value)}
              placeholder="JPM, GOLD, V, MRK, FXI, EWZ, KO"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hasta 50 tickers separados por coma
            </p>
          </div>

          <div>
            <Label htmlFor="weights" className="text-sm font-medium">
              Pesos (separados por coma)
            </Label>
            <Input
              id="weights"
              value={weightsStr}
              onChange={(e) => setWeightsStr(e.target.value)}
              placeholder="10, 20, 20, 10, 10, 10, 20"
              className="mt-1"
              disabled={optimizeMode}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {optimizeMode ? "Modo optimización: los pesos se calcularán automáticamente" : "Opcional. Si no se especifica, se usarán pesos iguales"}
            </p>
          </div>

          <div>
            <Label htmlFor="benchmark" className="text-sm font-medium">
              Benchmark
            </Label>
            <Select value={benchmark} onValueChange={setBenchmark}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPY">SPY (S&P 500)</SelectItem>
                <SelectItem value="QQQ">QQQ (NASDAQ-100)</SelectItem>
                <SelectItem value="DIA">DIA (Dow Jones)</SelectItem>
                <SelectItem value="VTI">VTI (Total Stock Market)</SelectItem>
                <SelectItem value="IWM">IWM (Russell 2000)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="years" className="text-sm font-medium">
              Años de Historia
            </Label>
            <Input
              id="years"
              type="number"
              min="1"
              max="20"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Entre 1 y 20 años
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Tasa Libre de Riesgo: {riskFreeRate}%
            </Label>
            <Slider
              value={[riskFreeRate]}
              onValueChange={(v) => setRiskFreeRate(v[0])}
              min={0}
              max={10}
              step={0.5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usado para calcular Sharpe Ratio
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <Label htmlFor="optimize-mode" className="text-sm font-medium cursor-pointer">
                Modo Optimización (Markowitz)
              </Label>
            </div>
            <Switch
              id="optimize-mode"
              checked={optimizeMode}
              onCheckedChange={setOptimizeMode}
            />
          </div>

          {optimizeMode && (
            <>
              <div>
                <Label className="text-sm font-medium">
                  Peso Mínimo por Activo: {minWeight}%
                </Label>
                <Slider
                  value={[minWeight]}
                  onValueChange={(v) => setMinWeight(v[0])}
                  min={0}
                  max={20}
                  step={1}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Restricción mínima de peso para cada activo
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <Label htmlFor="use-target" className="text-sm font-medium cursor-pointer">
                    Retorno Objetivo
                  </Label>
                </div>
                <Switch
                  id="use-target"
                  checked={useTargetReturn}
                  onCheckedChange={setUseTargetReturn}
                />
              </div>

              {useTargetReturn && (
                <div>
                  <Label className="text-sm font-medium">
                    Retorno Objetivo: {targetReturn}%
                  </Label>
                  <Slider
                    value={[targetReturn]}
                    onValueChange={(v) => setTargetReturn(v[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Buscar portfolio con mínima volatilidad para este retorno
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button 
            type="submit" 
            disabled={isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {optimizeMode ? "Optimizando..." : "Analizando..."}
              </>
            ) : (
              <>
                {optimizeMode ? <Zap className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {optimizeMode ? "Optimizar Cartera (Monte Carlo)" : "Analizar Cartera"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
