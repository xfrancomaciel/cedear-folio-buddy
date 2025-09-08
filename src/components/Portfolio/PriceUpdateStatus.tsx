import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PriceUpdateStatusProps {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function PriceUpdateStatus({ 
  loading, 
  error, 
  lastUpdated, 
  onRefresh 
}: PriceUpdateStatusProps) {
  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (error) return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusText = () => {
    if (loading) return "Actualizando precios...";
    if (error) return `Error: ${error}`;
    if (lastUpdated) {
      return `Actualizado: ${lastUpdated.toLocaleTimeString()}`;
    }
    return "Sin datos";
  };

  const getStatusVariant = () => {
    if (loading) return "secondary";
    if (error) return "destructive";
    return "default";
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">Precios CEDEAR</span>
      </div>
      
      <Badge variant={getStatusVariant()}>
        {getStatusText()}
      </Badge>

      {lastUpdated && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {Math.round((Date.now() - lastUpdated.getTime()) / 60000)} min ago
          </span>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
        className="ml-auto"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Actualizar
      </Button>
    </div>
  );
}