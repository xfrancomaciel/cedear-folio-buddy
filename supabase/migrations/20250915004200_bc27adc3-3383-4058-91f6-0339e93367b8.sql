-- Create cedear_sectors table for sector categorization
CREATE TABLE public.cedear_sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  sector TEXT NOT NULL,
  industry TEXT,
  company_name TEXT,
  country TEXT DEFAULT 'US',
  market_cap_category TEXT, -- 'large', 'mid', 'small'
  is_popular BOOLEAN DEFAULT false, -- for "Top CEDEARs" marking
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cedear_metadata table for additional information
CREATE TABLE public.cedear_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  exchange TEXT DEFAULT 'NASDAQ',
  currency TEXT DEFAULT 'USD',
  ratio NUMERIC DEFAULT 1.0, -- CEDEAR to underlying stock ratio
  min_volume_threshold INTEGER DEFAULT 1000,
  min_price_threshold NUMERIC DEFAULT 1.0,
  is_excluded BOOLEAN DEFAULT false, -- for duplicates/derivatives
  exclusion_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for both tables
ALTER TABLE public.cedear_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cedear_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for most users)
CREATE POLICY "Anyone can view cedear sectors" 
ON public.cedear_sectors 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view cedear metadata" 
ON public.cedear_metadata 
FOR SELECT 
USING (true);

-- Admins can manage the data
CREATE POLICY "Admins can manage cedear sectors" 
ON public.cedear_sectors 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage cedear metadata" 
ON public.cedear_metadata 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updating timestamps
CREATE TRIGGER update_cedear_sectors_updated_at
BEFORE UPDATE ON public.cedear_sectors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cedear_metadata_updated_at
BEFORE UPDATE ON public.cedear_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_cedear_sectors_symbol ON public.cedear_sectors(symbol);
CREATE INDEX idx_cedear_sectors_sector ON public.cedear_sectors(sector);
CREATE INDEX idx_cedear_sectors_popular ON public.cedear_sectors(is_popular);
CREATE INDEX idx_cedear_metadata_symbol ON public.cedear_metadata(symbol);
CREATE INDEX idx_cedear_metadata_excluded ON public.cedear_metadata(is_excluded);

-- Insert initial sector data for popular CEDEARs
INSERT INTO public.cedear_sectors (symbol, sector, industry, company_name, is_popular) VALUES
('AAPL', 'Technology', 'Consumer Electronics', 'Apple Inc.', true),
('NVDA', 'Technology', 'Semiconductors', 'NVIDIA Corporation', true),
('TSLA', 'Consumer Discretionary', 'Electric Vehicles', 'Tesla Inc.', true),
('GOOGL', 'Technology', 'Internet Services', 'Alphabet Inc.', true),
('MSFT', 'Technology', 'Software', 'Microsoft Corporation', true),
('AMZN', 'Consumer Discretionary', 'E-commerce', 'Amazon.com Inc.', true),
('META', 'Technology', 'Social Media', 'Meta Platforms Inc.', true),
('NFLX', 'Communication Services', 'Streaming', 'Netflix Inc.', true),
('DIS', 'Communication Services', 'Entertainment', 'The Walt Disney Company', true),
('BABA', 'Consumer Discretionary', 'E-commerce', 'Alibaba Group', true),
('GOLD', 'Materials', 'Gold Mining', 'Barrick Gold Corporation', true),
('KO', 'Consumer Staples', 'Beverages', 'The Coca-Cola Company', true),
('PFE', 'Healthcare', 'Pharmaceuticals', 'Pfizer Inc.', true),
('XOM', 'Energy', 'Oil & Gas', 'Exxon Mobil Corporation', true),
('JPM', 'Financial Services', 'Banking', 'JPMorgan Chase & Co.', true),
('V', 'Financial Services', 'Payment Systems', 'Visa Inc.', true),
('JNJ', 'Healthcare', 'Pharmaceuticals', 'Johnson & Johnson', true),
('WMT', 'Consumer Staples', 'Retail', 'Walmart Inc.', true),
('PG', 'Consumer Staples', 'Personal Care', 'Procter & Gamble', true),
('HD', 'Consumer Discretionary', 'Home Improvement', 'The Home Depot', true),
('UNH', 'Healthcare', 'Health Insurance', 'UnitedHealth Group', true),
('MA', 'Financial Services', 'Payment Systems', 'Mastercard Inc.', true),
('BAC', 'Financial Services', 'Banking', 'Bank of America Corp.', true),
('ABBV', 'Healthcare', 'Biotechnology', 'AbbVie Inc.', true),
('LLY', 'Healthcare', 'Pharmaceuticals', 'Eli Lilly and Company', true),
('AVGO', 'Technology', 'Semiconductors', 'Broadcom Inc.', true),
('COST', 'Consumer Staples', 'Retail', 'Costco Wholesale Corp.', true),
('ORCL', 'Technology', 'Software', 'Oracle Corporation', true),
('NKE', 'Consumer Discretionary', 'Apparel', 'Nike Inc.', true),
('MRK', 'Healthcare', 'Pharmaceuticals', 'Merck & Co. Inc.', true),
('TMO', 'Healthcare', 'Life Sciences', 'Thermo Fisher Scientific', true),
('ABT', 'Healthcare', 'Medical Devices', 'Abbott Laboratories', true),
('DHR', 'Healthcare', 'Life Sciences', 'Danaher Corporation', true),
('VZ', 'Communication Services', 'Telecommunications', 'Verizon Communications', true),
('ADBE', 'Technology', 'Software', 'Adobe Inc.', true),
('CVX', 'Energy', 'Oil & Gas', 'Chevron Corporation', true),
('ASML', 'Technology', 'Semiconductors', 'ASML Holding N.V.', true),
('TXN', 'Technology', 'Semiconductors', 'Texas Instruments Inc.', true),
('ACN', 'Technology', 'IT Services', 'Accenture plc', true),
('QCOM', 'Technology', 'Semiconductors', 'QUALCOMM Inc.', true),
('AMD', 'Technology', 'Semiconductors', 'Advanced Micro Devices', true),
('HON', 'Industrials', 'Aerospace & Defense', 'Honeywell International', true),
('CMCSA', 'Communication Services', 'Media', 'Comcast Corporation', true),
('NEE', 'Utilities', 'Electric Utilities', 'NextEra Energy Inc.', true);

-- Insert initial metadata for exclusion patterns (common duplicates/derivatives)
INSERT INTO public.cedear_metadata (symbol, company_name, is_excluded, exclusion_reason) VALUES
('AAPLC', 'Apple Inc. Class C', true, 'Duplicate class shares'),
('AAPLD', 'Apple Inc. Class D', true, 'Duplicate class shares'),
('GOOGC', 'Alphabet Inc. Class C', true, 'Duplicate class shares'),
('TSLA2', 'Tesla Inc. 2x', true, 'Leveraged derivative'),
('MSFT2', 'Microsoft 2x', true, 'Leveraged derivative');