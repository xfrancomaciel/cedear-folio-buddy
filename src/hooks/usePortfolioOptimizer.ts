import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OptimizerInput, OptimizerResult } from "@/types/optimizer";

export const usePortfolioOptimizer = () => {
  const [result, setResult] = useState<OptimizerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyze = async (input: OptimizerInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'portfolio-optimizer',
        {
          body: input,
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Error analyzing portfolio');
      }

      setResult(data);
      toast({
        title: "Análisis Completado",
        description: "Tu cartera ha sido analizada exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    result,
    isLoading,
    error,
    analyze,
  };
};