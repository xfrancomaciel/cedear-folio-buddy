export interface Transaction {
  id: string;
  fecha: string;
  tipo: 'compra' | 'venta';
  ticker: string;
  precio_ars: number;
  cantidad: number;
  usd_rate_historico: number;
  total_ars: number;
  total_usd: number;
  created_at: string;
}

export interface Position {
  ticker: string;
  cantidad: number;
  precio_promedio_ars: number;
  precio_promedio_usd: number;
  valor_actual_ars: number;
  valor_actual_usd: number;
  ganancia_no_realizada_ars: number;
  ganancia_no_realizada_usd: number;
  porcentaje_cartera: number;
}

export interface PortfolioSummary {
  valor_total_ars: number;
  valor_total_usd: number;
  ganancia_total_no_realizada_ars: number;
  ganancia_total_no_realizada_usd: number;
  ganancia_total_realizada_ars: number;
  ganancia_total_realizada_usd: number;
  posiciones: Position[];
  usd_rate_actual: number;
}

export interface CurrentPrice {
  ticker: string;
  precio_ars: number;
  usd_rate: number;
  updated_at: string;
}

export interface CEDEARInfo {
  ticker: string;
  nombre: string;
  ratio: number;
  sector: string;
}