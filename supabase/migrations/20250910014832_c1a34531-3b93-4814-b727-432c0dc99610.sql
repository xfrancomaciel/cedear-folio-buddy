-- Enhance instruments table for bonds
ALTER TABLE public.instruments ADD COLUMN IF NOT EXISTS maturity_date date;
ALTER TABLE public.instruments ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE public.instruments ADD COLUMN IF NOT EXISTS face_value numeric DEFAULT 1000;

-- Create bond_market_metrics table
CREATE TABLE IF NOT EXISTS public.bond_market_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  average_spread_bps numeric DEFAULT 0,
  average_duration_years numeric DEFAULT 0,
  average_convexity numeric DEFAULT 0,
  beta_vs_usd numeric DEFAULT 1.0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for bond_market_metrics
ALTER TABLE public.bond_market_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for bond_market_metrics
CREATE POLICY "Anyone can view bond market metrics" 
ON public.bond_market_metrics 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert bond market metrics" 
ON public.bond_market_metrics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update bond market metrics" 
ON public.bond_market_metrics 
FOR UPDATE 
USING (true);

-- Enhance prices table for bonds
ALTER TABLE public.prices ADD COLUMN IF NOT EXISTS yield numeric;
ALTER TABLE public.prices ADD COLUMN IF NOT EXISTS duration numeric;
ALTER TABLE public.prices ADD COLUMN IF NOT EXISTS convexity numeric;
ALTER TABLE public.prices ADD COLUMN IF NOT EXISTS spread_bps numeric;

-- Create latest_bond_prices view
CREATE OR REPLACE VIEW public.latest_bond_prices AS
SELECT DISTINCT ON (symbol) 
  id,
  symbol,
  px_bid,
  px_ask,
  (px_bid + px_ask) / 2 as px_mid,
  close_price as px_close,
  volume,
  pct_change,
  yield,
  duration,
  convexity,
  spread_bps,
  is_stale,
  timestamp as last_updated,
  created_at
FROM public.prices 
WHERE symbol IN (SELECT ticker FROM public.instruments WHERE instrument_type = 'bond')
ORDER BY symbol, timestamp DESC;

-- Insert sample bond instruments
INSERT INTO public.instruments (ticker, ticker_mep, instrument_type, issuer, rating, currency, maturity_date, face_value) VALUES
('AL30', 'AL30D', 'bond', 'argentina', 'b', 'USD', '2030-07-09', 1000),
('GD30', 'GD30D', 'bond', 'argentina', 'b', 'USD', '2030-07-09', 1000),
('AL35', 'AL35D', 'bond', 'argentina', 'b', 'USD', '2035-07-09', 1000),
('GD35', 'GD35D', 'bond', 'argentina', 'b', 'USD', '2035-07-09', 1000),
('AE38', 'AE38D', 'bond', 'argentina', 'b', 'USD', '2038-01-09', 1000),
('GD38', 'GD38D', 'bond', 'argentina', 'b', 'USD', '2038-01-09', 1000),
('AL41', 'AL41D', 'bond', 'argentina', 'b', 'USD', '2041-07-09', 1000),
('GD41', 'GD41D', 'bond', 'argentina', 'b', 'USD', '2041-07-09', 1000)
ON CONFLICT (ticker) DO NOTHING;

-- Insert sample bond prices
INSERT INTO public.prices (symbol, px_bid, px_ask, close_price, volume, pct_change, yield, duration, spread_bps, is_stale) VALUES
('AL30', 32.50, 33.00, 32.75, 1250000, -1.2, 18.5, 4.2, 1850, false),
('GD30', 32.45, 32.95, 32.70, 980000, -0.8, 18.7, 4.1, 1870, false),
('AL35', 28.20, 28.70, 28.45, 750000, 0.5, 19.2, 5.8, 1920, false),
('GD35', 28.15, 28.65, 28.40, 650000, 0.3, 19.4, 5.7, 1940, false),
('AE38', 25.80, 26.30, 26.05, 420000, -0.2, 20.1, 6.5, 2010, false),
('GD38', 25.75, 26.25, 26.00, 380000, -0.1, 20.3, 6.4, 2030, false),
('AL41', 23.90, 24.40, 24.15, 320000, 1.1, 21.2, 7.8, 2120, false),
('GD41', 23.85, 24.35, 24.10, 290000, 1.0, 21.4, 7.7, 2140, false)
ON CONFLICT DO NOTHING;

-- Insert initial market metrics
INSERT INTO public.bond_market_metrics (average_spread_bps, average_duration_years, average_convexity, beta_vs_usd) VALUES
(1960, 5.8, 0.42, 1.15)
ON CONFLICT DO NOTHING;