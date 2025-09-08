-- Fix security definer view issue by adding security_invoker=on
DROP VIEW IF EXISTS public.latest_cedear_prices;

-- Recreate view with security_invoker=on to respect RLS policies
CREATE VIEW public.latest_cedear_prices
WITH (security_invoker=on)
AS
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