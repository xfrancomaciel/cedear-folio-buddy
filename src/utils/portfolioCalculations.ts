import { Transaction, Position, PortfolioSummary, CurrentPrice } from '@/types/portfolio';
import { getCEDEARInfo } from '@/data/cedearsData';

export const calculatePortfolioSummary = (
  transactions: Transaction[],
  currentPrices: Record<string, CurrentPrice>
): PortfolioSummary => {
  const positions = calculatePositions(transactions, currentPrices);
  const realizedGains = calculateRealizedGains(transactions);
  
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
    ganancia_total_realizada_ars: realizedGains.ars,
    ganancia_total_realizada_usd: realizedGains.usd,
    posiciones: positions,
    usd_rate_actual
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
  }>();

  // Calculate net positions from transactions
  transactions.forEach(transaction => {
    const key = transaction.ticker;
    const existing = positionMap.get(key) || { cantidad: 0, costo_total_ars: 0, costo_total_usd: 0 };
    
    if (transaction.tipo === 'compra') {
      existing.cantidad += transaction.cantidad;
      existing.costo_total_ars += transaction.total_ars;
      existing.costo_total_usd += transaction.total_usd;
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
      
      if (currentPrice) {
        valor_actual_ars = currentPrice.precio_ars * data.cantidad;
        valor_actual_usd = valor_actual_ars / (currentPrice.usd_rate || 1000);
      }
      
      const ganancia_no_realizada_ars = valor_actual_ars - data.costo_total_ars;
      const ganancia_no_realizada_usd = valor_actual_usd - data.costo_total_usd;
      
      positions.push({
        ticker,
        cantidad: data.cantidad,
        precio_promedio_ars,
        precio_promedio_usd,
        valor_actual_ars,
        valor_actual_usd,
        ganancia_no_realizada_ars,
        ganancia_no_realizada_usd,
        porcentaje_cartera: totalValue > 0 ? (valor_actual_ars / totalValue) * 100 : 0
      });
    }
  });

  return positions.sort((a, b) => b.valor_actual_ars - a.valor_actual_ars);
};

export const calculateRealizedGains = (transactions: Transaction[]): { ars: number; usd: number } => {
  const tickerTransactions = new Map<string, Transaction[]>();
  
  // Group transactions by ticker
  transactions.forEach(transaction => {
    const ticker = transaction.ticker;
    if (!tickerTransactions.has(ticker)) {
      tickerTransactions.set(ticker, []);
    }
    tickerTransactions.get(ticker)!.push(transaction);
  });

  let totalRealizedARS = 0;
  let totalRealizedUSD = 0;

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
          
          totalRealizedARS += gainPerUnitARS * sellAmount;
          totalRealizedUSD += (transaction.total_usd / transaction.cantidad - oldestBuy.total_usd / oldestBuy.cantidad) * sellAmount;
          
          oldestBuy.cantidad -= sellAmount;
          remainingSell -= sellAmount;
          
          if (oldestBuy.cantidad === 0) {
            buyQueue.shift();
          }
        }
      }
    });
  });

  return { ars: totalRealizedARS, usd: totalRealizedUSD };
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