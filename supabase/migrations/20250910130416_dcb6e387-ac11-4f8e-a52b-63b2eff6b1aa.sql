-- Create report categories table
CREATE TABLE public.report_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  pdf_url TEXT,
  category_id UUID REFERENCES public.report_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.report_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies for report_categories (public read, admin manage)
CREATE POLICY "Anyone can view categories"
ON public.report_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.report_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for reports (published reports public, all for admins)
CREATE POLICY "Anyone can view published reports"
ON public.reports
FOR SELECT
TO authenticated
USING (status = 'published');

CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage reports"
ON public.reports
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets for reports
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('report-pdfs', 'report-pdfs', false),
  ('report-images', 'report-images', true);

-- Storage policies for report PDFs (authenticated users can read published, admins can manage)
CREATE POLICY "Authenticated users can view published report PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-pdfs' AND
  EXISTS (
    SELECT 1 FROM public.reports 
    WHERE pdf_url = CONCAT('https://tquuloafjtxbopnpzmxw.supabase.co/storage/v1/object/public/report-pdfs/', name)
    AND status = 'published'
  )
);

CREATE POLICY "Admins can manage report PDFs"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'report-pdfs' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'report-pdfs' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for report images (public read, admin manage)
CREATE POLICY "Anyone can view report images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'report-images');

CREATE POLICY "Admins can manage report images"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'report-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'report-images' AND public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.report_categories (name, description) VALUES
  ('Trimestral', 'Reportes trimestrales de análisis de mercado'),
  ('Bonos', 'Análisis de bonos y renta fija'),
  ('CEDEARs', 'Reportes sobre CEDEARs y acciones'),
  ('Semanal', 'Reportes semanales de mercado'),
  ('Especial', 'Reportes especiales y análisis puntuales');

-- Add updated_at trigger for both tables
CREATE TRIGGER update_report_categories_updated_at
BEFORE UPDATE ON public.report_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();