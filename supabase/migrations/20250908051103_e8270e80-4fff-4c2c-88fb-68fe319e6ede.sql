-- Create transactions table for CEDEAR portfolio tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('compra', 'venta')),
  ticker TEXT NOT NULL,
  precio_ars DECIMAL(15,4) NOT NULL,
  cantidad INTEGER NOT NULL,
  usd_rate_historico DECIMAL(10,4) NOT NULL,
  total_ars DECIMAL(15,4) NOT NULL,
  total_usd DECIMAL(15,4) NOT NULL,
  usd_por_cedear DECIMAL(15,8) NOT NULL,
  cantidad_acciones_reales DECIMAL(15,8) NOT NULL,
  precio_accion_usd DECIMAL(15,4) NOT NULL,
  dias_tenencia INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create current prices table for price tracking
CREATE TABLE public.current_prices (
  ticker TEXT NOT NULL PRIMARY KEY,
  precio_ars DECIMAL(15,4) NOT NULL,
  usd_rate DECIMAL(10,4) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth yet)
CREATE POLICY "Anyone can view transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update transactions" 
ON public.transactions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete transactions" 
ON public.transactions 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view current prices" 
ON public.current_prices 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert current prices" 
ON public.current_prices 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update current prices" 
ON public.current_prices 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete current prices" 
ON public.current_prices 
FOR DELETE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_current_prices_updated_at
BEFORE UPDATE ON public.current_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();