import { Transaction, Position, PortfolioSummary, CurrentPrice, OperacionCerrada } from '@/types/portfolio';
import { getCEDEARInfo, calculateUnderlyingShares } from '@/data/cedearsData';

export const enhanceTransaction = (transaction: Omit<Transaction, 'id' | 'created_at' | 'usd_por_cedear' | 'cantidad_acciones_reales' | 'precio_accion_usd'>): Omit<Transaction, 'id' | 'created_at'> => {
  const cedearsInfo = getCEDEARInfo(transaction.ticker);
  
  // Calculate USD per CEDEAR
  const usd_por_cedear = transaction.total_usd / transaction.cantidad;
  
  // Calculate underlying shares
  const cantidad_acciones_reales = calculateUnderlyingShares(transaction.ticker, transaction.cantidad);
  
  // Calculate USD price per underlying share
  const precio_accion_usd = cedearsInfo ? usd_por_cedear * cedearsInfo.ratio : 0;
  
  return {
    ...transaction,
    usd_por_cedear,
    cantidad_acciones_reales,
    precio_accion_usd
  };
};

export const calculateHoldingDays = (fechaCompra: string, fechaActual: Date = new Date()): number => {
  const diffTime = Math.abs(fechaActual.getTime() - new Date(fechaCompra).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateVariations = (
  precioCompra: number, 
  precioActual: number, 
  usdHistorico: number, 
  usdActual: number
) => {
  // ARS variation
  const variacionARS = ((precioActual - precioCompra) / precioCompra) * 100;
  
  // USD variation considering exchange rate
  const valorCompraUSD = precioCompra / usdHistorico;
  const valorActualUSD = precioActual / usdActual;
  const variacionUSD = ((valorActualUSD - valorCompraUSD) / valorCompraUSD) * 100;
  
  return {
    variacionARS: parseFloat(variacionARS.toFixed(2)),
    variacionUSD: parseFloat(variacionUSD.toFixed(2))
  };
};

export const calculatePortfolioSummary = (
  transactions: Transaction[],
  currentPrices: Record<string, CurrentPrice>
): PortfolioSummary => {
  const positions = calculatePositions(transactions, currentPrices);
  const realizedGains = calculateRealizedGains(transactions);
  const operaciones_cerradas = realizedGains.operacionesCerradas;
  
  const valor_total_ars = positions.reduce((sum, pos) => sum + pos.valor_actual_ars, 0);
  const valor_total_usd = positions.reduce((sum, pos) => sum + pos.valor_actual_usd, 0);
  const ganancia_total_no_realizada_ars = positions.reduce((sum, pos) => sum + pos.ganancia_no_realizada_ars, 0);
  const ganancia_total_no_realizada_usd = positions.reduce((sum, pos) => sum + pos.ganancia_no_realizada_usd, 0);

  // Get current USD rate from any available current price, defaulting to 1000
  const usd_rate_actual = Object.values(currentPrices)[0]?.usd_rate || 1000;

  return {
    valor_total_ars,
    valor_total_usd,
    ganancia_total_no_realizada_ars,
    ganancia_total_no_realizada_usd,
    ganancia_total_realizada_ars: realizedGains.gananciaTotalARS,
    ganancia_total_realizada_usd: realizedGains.gananciaTotalUSD,
    posiciones: positions,
    usd_rate_actual,
    operaciones_cerradas
  };
};

export const calculatePositions = (
  transactions: Transaction[],
  currentPrices: Record<string, CurrentPrice>
): Position[] => {
  const positionMap = new Map<string, {
    cantidad: number;
    costo_total_ars: number;
    costo_total_usd: number;
    fecha_promedio_compra: Date;
    usd_historico_promedio: number;
  }>();

  // Calculate net positions from transactions
  transactions.forEach(transaction => {
    const key = transaction.ticker;
    const existing = positionMap.get(key) || { 
      cantidad: 0, 
      costo_total_ars: 0, 
      costo_total_usd: 0,
      fecha_promedio_compra: new Date(transaction.fecha),
      usd_historico_promedio: transaction.usd_rate_historico
    };
    
    if (transaction.tipo === 'compra') {
      existing.cantidad += transaction.cantidad;
      existing.costo_total_ars += transaction.total_ars;
      existing.costo_total_usd += transaction.total_usd;
      // Calculate weighted average purchase date and USD rate
      const totalCantidad = existing.cantidad;
      const fechaWeight = transaction.cantidad / totalCantidad;
      existing.fecha_promedio_compra = new Date(
        existing.fecha_promedio_compra.getTime() * (1 - fechaWeight) + 
        new Date(transaction.fecha).getTime() * fechaWeight
      );
      existing.usd_historico_promedio = 
        (existing.usd_historico_promedio * (totalCantidad - transaction.cantidad) + 
         transaction.usd_rate_historico * transaction.cantidad) / totalCantidad;
    } else {
      existing.cantidad -= transaction.cantidad;
      existing.costo_total_ars -= transaction.total_ars;
      existing.costo_total_usd -= transaction.total_usd;
    }
    
    positionMap.set(key, existing);
  });

  // Convert to Position objects and calculate current values
  const positions: Position[] = [];
  const totalValue = Array.from(positionMap.entries())
    .filter(([_, data]) => data.cantidad > 0)
    .reduce((sum, [ticker, data]) => {
      const currentPrice = currentPrices[ticker];
      if (currentPrice) {
        return sum + (currentPrice.precio_ars * data.cantidad);
      }
      return sum;
    }, 0);

  positionMap.forEach((data, ticker) => {
    if (data.cantidad > 0) {
      const currentPrice = currentPrices[ticker];
      const precio_promedio_ars = data.costo_total_ars / data.cantidad;
      const precio_promedio_usd = data.costo_total_usd / data.cantidad;
      
      let valor_actual_ars = 0;
      let valor_actual_usd = 0;
      let variacion_ars = 0;
      let variacion_usd = 0;
      
      if (currentPrice) {
        valor_actual_ars = currentPrice.precio_ars * data.cantidad;
        valor_actual_usd = valor_actual_ars / (currentPrice.usd_rate || 1000);
        
        const variations = calculateVariations(
          precio_promedio_ars,
          currentPrice.precio_ars,
          data.usd_historico_promedio,
          currentPrice.usd_rate
        );
        variacion_ars = variations.variacionARS;
        variacion_usd = variations.variacionUSD;
      }
      
      const ganancia_no_realizada_ars = valor_actual_ars - data.costo_total_ars;
      const ganancia_no_realizada_usd = valor_actual_usd - data.costo_total_usd;
      const cantidad_acciones_reales = calculateUnderlyingShares(ticker, data.cantidad);
      const dias_tenencia_promedio = calculateHoldingDays(data.fecha_promedio_compra.toISOString());
      
      positions.push({
        ticker,
        cantidad: data.cantidad,
        cantidad_acciones_reales,
        precio_promedio_ars,
        precio_promedio_usd,
        valor_actual_ars,
        valor_actual_usd,
        ganancia_no_realizada_ars,
        ganancia_no_realizada_usd,
        porcentaje_cartera: totalValue > 0 ? (valor_actual_ars / totalValue) * 100 : 0,
        dias_tenencia_promedio,
        variacion_ars,
        variacion_usd
      });
    }
  });

  return positions.sort((a, b) => b.valor_actual_ars - a.valor_actual_ars);
};

export const calculateRealizedGains = (transactions: Transaction[]): { 
  gananciaTotalARS: number; 
  gananciaTotalUSD: number;
  operacionesCerradas: OperacionCerrada[];
} => {
  const tickerTransactions = new Map<string, Transaction[]>();
  
  // Group transactions by ticker
  transactions.forEach(transaction => {
    const ticker = transaction.ticker;
    if (!tickerTransactions.has(ticker)) {
      tickerTransactions.set(ticker, []);
    }
    tickerTransactions.get(ticker)!.push(transaction);
  });

  let gananciaTotalARS = 0;
  let gananciaTotalUSD = 0;
  const operacionesCerradas: OperacionCerrada[] = [];

  // Calculate realized gains for each ticker using FIFO method
  tickerTransactions.forEach((tickerTxns, ticker) => {
    const sortedTxns = tickerTxns.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const buyQueue: Transaction[] = [];
    
    sortedTxns.forEach(transaction => {
      if (transaction.tipo === 'compra') {
        buyQueue.push({ ...transaction });
      } else {
        // Process sell transaction
        let remainingSell = transaction.cantidad;
        
        while (remainingSell > 0 && buyQueue.length > 0) {
          const oldestBuy = buyQueue[0];
          const sellAmount = Math.min(remainingSell, oldestBuy.cantidad);
          
          // Calculate gains for this portion
          const sellPricePerUnit = transaction.precio_ars;
          const buyPricePerUnit = oldestBuy.precio_ars;
          const gainPerUnitARS = sellPricePerUnit - buyPricePerUnit;
          
          const gainARS = gainPerUnitARS * sellAmount;
          const gainUSD = (transaction.total_usd / transaction.cantidad - oldestBuy.total_usd / oldestBuy.cantidad) * sellAmount;
          
          gananciaTotalARS += gainARS;
          gananciaTotalUSD += gainUSD;
          
          // Record closed operation
          const diasTenencia = calculateHoldingDays(oldestBuy.fecha, new Date(transaction.fecha));
          operacionesCerradas.push({
            ticker,
            fecha_compra: oldestBuy.fecha,
            fecha_venta: transaction.fecha,
            cantidad: sellAmount,
            ganancia_ars: gainARS,
            ganancia_usd: gainUSD,
            dias_tenencia: diasTenencia
          });
          
          oldestBuy.cantidad -= sellAmount;
          remainingSell -= sellAmount;
          
          if (oldestBuy.cantidad === 0) {
            buyQueue.shift();
          }
        }
      }
    });
  });

  return { gananciaTotalARS, gananciaTotalUSD, operacionesCerradas };
};

export const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  const symbol = currency === 'ARS' ? '$' : 'US$';
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));
  
  return `${amount >= 0 ? '' : '-'}${symbol}${formatted}`;
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};