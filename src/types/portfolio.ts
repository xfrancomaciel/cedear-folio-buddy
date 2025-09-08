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
  usd_por_cedear: number;
  cantidad_acciones_reales: number;
  precio_accion_usd: number;
  dias_tenencia?: number;
  created_at: string;
}

export interface Position {
  ticker: string;
  cantidad: number;
  cantidad_acciones_reales: number;
  precio_promedio_ars: number;
  precio_promedio_usd: number;
  valor_actual_ars: number;
  valor_actual_usd: number;
  ganancia_no_realizada_ars: number;
  ganancia_no_realizada_usd: number;
  porcentaje_cartera: number;
  dias_tenencia_promedio: number;
  variacion_ars: number;
  variacion_usd: number;
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
  operaciones_cerradas: OperacionCerrada[];
}

export interface OperacionCerrada {
  ticker: string;
  fecha_compra: string;
  fecha_venta: string;
  cantidad: number;
  ganancia_ars: number;
  ganancia_usd: number;
  dias_tenencia: number;
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