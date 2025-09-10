import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Loader2 } from "lucide-react";
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
      // Equal weights
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
            />
            <p className="text-xs text-muted-foreground mt-1">
              Opcional. Si no se especifica, se usarán pesos iguales
            </p>
          </div>
        </div>

        <div className="space-y-4">
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
                Analizando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Analizar Cartera
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};