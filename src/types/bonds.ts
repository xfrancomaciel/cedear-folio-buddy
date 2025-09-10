export interface BondInstrument {
  ticker: string;
  issuer: string;
  instrument_type: string;
  currency: string;
  maturity_date: string;
  coupon_rate?: number;
  face_value: number;
  rating?: string;
}

export interface BondPrice {
  id: string;
  symbol: string;
  px_bid: number;
  px_ask: number;
  px_mid: number;
  px_close: number;
  volume: number;
  pct_change: number;
  yield?: number;
  duration?: number;
  convexity?: number;
  spread_bps?: number;
  is_stale: boolean;
  last_updated: string;
  created_at: string;
  // Calculated fields
  status: 'Live' | 'No Price';
}

export interface MarketMetrics {
  average_spread_bps: number;
  average_duration_years: number;
  average_convexity: number;
  beta_vs_usd: number;
  last_updated: string;
}

export interface KPICard {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}