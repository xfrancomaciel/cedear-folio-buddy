import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { OptimizerResult, ExportData } from "@/types/optimizer";

interface ExportButtonsProps {
  result: OptimizerResult;
}

export const ExportButtons = ({ result }: ExportButtonsProps) => {
  const { toast } = useToast();

  const generateExportData = (): ExportData => {
    // Generate summary table data
    const summary = [
      {
        conjunto: "Cartera",
        beta: result.portfolioMetrics.beta.toFixed(2),
        volatilidad: `${(result.portfolioMetrics.volatility * 100).toFixed(2)}%`,
        cagr: `${(result.portfolioMetrics.cagr * 100).toFixed(2)}%`,
        rendimiento12m: `${(result.portfolioMetrics.return12m * 100).toFixed(2)}%`,
        correlacion: result.portfolioMetrics.correlation.toFixed(2),
        sharpeRatio: result.portfolioMetrics.sharpeRatio.toFixed(2),
      },
      {
        conjunto: result.benchmark,
        beta: "-",
        volatilidad: `${(result.benchmarkMetrics.volatility * 100).toFixed(2)}%`,
        cagr: `${(result.benchmarkMetrics.cagr * 100).toFixed(2)}%`,
        rendimiento12m: `${(result.benchmarkMetrics.return12m * 100).toFixed(2)}%`,
        correlacion: "1.00",
        sharpeRatio: result.benchmarkMetrics.sharpeRatio.toFixed(2),
      },
    ];

    // Generate correlation matrix data
    const correlationMatrix: Record<string, Record<string, number>> = {};
    result.correlationData.tickers.forEach((ticker1, i) => {
      correlationMatrix[ticker1] = {};
      result.correlationData.tickers.forEach((ticker2, j) => {
        correlationMatrix[ticker1][ticker2] = result.correlationData.matrix[i][j];
      });
    });

    // Generate evolution data
    const evolution = result.performanceData.dates.map((date, index) => ({
      fecha: date,
      cartera: result.performanceData.portfolioValues[index],
      benchmark: result.performanceData.benchmarkValues[index],
    }));

    return { summary, correlationMatrix, evolution };
  };

  const exportToCSV = () => {
    try {
      const data = generateExportData();
      
      // Export summary as CSV
      const summaryHeaders = Object.keys(data.summary[0]);
      const summaryCSV = [
        summaryHeaders.join(','),
        ...data.summary.map(row => summaryHeaders.map(header => row[header]).join(','))
      ].join('\\n');

      // Export correlation matrix as CSV
      const correlationHeaders = ['Ticker', ...result.correlationData.tickers];
      const correlationCSV = [
        correlationHeaders.join(','),
        ...result.correlationData.tickers.map((ticker, i) => 
          [ticker, ...result.correlationData.matrix[i]].join(',')
        )
      ].join('\\n');

      // Export evolution as CSV
      const evolutionHeaders = ['fecha', 'cartera', 'benchmark'];
      const evolutionCSV = [
        evolutionHeaders.join(','),
        ...data.evolution.map(row => 
          [row.fecha, row.cartera, row.benchmark].join(',')
        )
      ].join('\\n');

      // Create and download files
      downloadFile('resumen_cartera.csv', summaryCSV);
      downloadFile('correlacion_activos.csv', correlationCSV);
      downloadFile('evolucion_cartera.csv', evolutionCSV);

      toast({
        title: "CSV Exportado",
        description: "Archivos CSV descargados exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al exportar archivos CSV",
        variant: "destructive",
      });
    }
  };

  const exportToJSON = () => {
    try {
      const data = generateExportData();
      const jsonString = JSON.stringify(data, null, 2);
      downloadFile('resultados_cartera.json', jsonString);

      toast({
        title: "JSON Exportado",
        description: "Archivo JSON descargado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al exportar archivo JSON",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Resultados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={exportToCSV} variant="outline" className="flex-1">
            <Table className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={exportToJSON} variant="outline" className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            Exportar JSON
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Los archivos incluyen resumen de métricas, matriz de correlación y evolución de precios
        </p>
      </CardContent>
    </Card>
  );
};