-- Fix security definer view issue by recreating the view properly
DROP VIEW IF EXISTS public.latest_cedear_prices;

-- Recreate view without security definer (uses invoker's permissions by default)
CREATE VIEW public.latest_cedear_prices AS
SELECT DISTINCT ON (symbol) 
  id,
  symbol,
  px_bid,
  px_ask,
  px_mid,
  px_close,
  volume,
  pct_change,
  last_updated,
  created_at
FROM public.cedear_prices
ORDER BY symbol, last_updated DESC;