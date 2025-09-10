import { useMemo } from "react";
import type { OptimizerResult } from "@/types/optimizer";

interface CorrelationMatrixProps {
  result: OptimizerResult;
}

export const CorrelationMatrix = ({ result }: CorrelationMatrixProps) => {
  const { matrix, tickers } = result.correlationData;

  const heatmapData = useMemo(() => {
    return matrix.map((row, i) =>
      row.map((correlation, j) => ({
        x: j,
        y: i,
        correlation,
        tickerX: tickers[j],
        tickerY: tickers[i],
      }))
    ).flat();
  }, [matrix, tickers]);

  const getCorrelationColor = (correlation: number) => {
    // Create a blue to red gradient based on correlation (0 to 1)
    const intensity = Math.abs(correlation);
    const hue = correlation > 0.5 ? 0 : 200; // Red for high correlation, blue for low
    const saturation = 70;
    const lightness = 85 - (intensity * 30); // Darker for higher correlation
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const cellSize = Math.min(400 / tickers.length, 60);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div 
            className="grid gap-1 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${tickers.length}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${tickers.length}, ${cellSize}px)`,
              width: `${tickers.length * (cellSize + 4)}px`,
            }}
          >
            {heatmapData.map((cell, index) => (
              <div
                key={index}
                className="flex items-center justify-center text-xs font-medium rounded border border-border/20 relative group cursor-pointer"
                style={{
                  backgroundColor: getCorrelationColor(cell.correlation),
                  color: cell.correlation > 0.7 ? 'white' : 'black',
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
              >
                {cell.correlation.toFixed(2)}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-card border rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {cell.tickerY} vs {cell.tickerX}: {cell.correlation.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tickers labels */}
      <div className="flex justify-center">
        <div 
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${tickers.length}, ${cellSize}px)`,
            width: `${tickers.length * (cellSize + 4)}px`,
          }}
        >
          {tickers.map((ticker) => (
            <div key={ticker} className="text-center text-xs font-medium py-1">
              {ticker}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div 
          className="grid gap-1"
          style={{
            gridTemplateRows: `repeat(${tickers.length}, ${cellSize}px)`,
          }}
        >
          {tickers.map((ticker) => (
            <div key={ticker} className="flex items-center text-xs font-medium pr-2" style={{ height: `${cellSize}px` }}>
              {ticker}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getCorrelationColor(0) }}></div>
          <span>Baja correlación (0.0)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getCorrelationColor(0.5) }}></div>
          <span>Media correlación (0.5)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getCorrelationColor(1) }}></div>
          <span>Alta correlación (1.0)</span>
        </div>
      </div>
    </div>
  );
};