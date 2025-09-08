-- Create table for CEDEAR real-time prices
CREATE TABLE public.cedear_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  px_bid DECIMAL(10,4),
  px_ask DECIMAL(10,4),
  px_mid DECIMAL(10,4) GENERATED ALWAYS AS ((px_bid + px_ask) / 2) STORED,
  px_close DECIMAL(10,4),
  volume DECIMAL(15,2),
  pct_change DECIMAL(8,4),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_symbol_timestamp UNIQUE(symbol, last_updated)
);

-- Enable RLS
ALTER TABLE public.cedear_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view cedear prices" 
ON public.cedear_prices 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert cedear prices" 
ON public.cedear_prices 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update cedear prices" 
ON public.cedear_prices 
FOR UPDATE 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_cedear_prices_symbol ON public.cedear_prices(symbol);
CREATE INDEX idx_cedear_prices_updated ON public.cedear_prices(last_updated DESC);

-- Create view for latest prices per symbol
CREATE VIEW public.latest_cedear_prices AS
SELECT DISTINCT ON (symbol) *
FROM public.cedear_prices
ORDER BY symbol, last_updated DESC;

-- Add trigger for updated_at
CREATE TRIGGER update_cedear_prices_updated_at
BEFORE UPDATE ON public.cedear_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();