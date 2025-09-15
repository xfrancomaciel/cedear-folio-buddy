-- Create feature flags table for global feature management
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage feature flags" 
ON public.feature_flags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view feature flags" 
ON public.feature_flags 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default feature flags for all sidebar menu items
INSERT INTO public.feature_flags (feature_key, feature_name, description) VALUES
('dashboard', 'Dashboard', 'Página principal del dashboard'),
('bonos', 'Bonos', 'Análisis de bonos y mercado de renta fija'),
('cedeears', 'CEDEARs', 'Precios y análisis de CEDEARs'),
('formaciones', 'Formaciones', 'Cursos y contenido educativo'),
('reportes', 'Reportes', 'Reportes y análisis de mercado'),
('portfolio', 'Portfolio', 'Gestión de portfolio personal'),
('graficador', 'Graficador', 'Herramienta de gráficos TradingView'),
('mapa', 'Mapa de Calor', 'Visualización del mercado'),
('screener', 'Screener', 'Filtrado y análisis de activos'),
('analizador', 'Analizador', 'Análisis técnico y fundamental'),
('optimizador', 'Optimizador', 'Optimización de carteras');