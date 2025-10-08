-- Crear enum para tipos de planes
CREATE TYPE plan_type AS ENUM ('cliente', 'premium', 'enterprise');

-- Crear tabla de planes de usuario
CREATE TABLE public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan plan_type NOT NULL DEFAULT 'cliente',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo admins pueden ver planes
CREATE POLICY "Admins can view all plans"
  ON public.user_plans FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS: Solo admins pueden gestionar planes
CREATE POLICY "Admins can manage plans"
  ON public.user_plans FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índice para optimizar consultas por user_id
CREATE INDEX idx_user_plans_user_id ON public.user_plans(user_id);

-- Crear índice para optimizar consultas por estado activo
CREATE INDEX idx_user_plans_is_active ON public.user_plans(is_active);

-- Insertar planes por defecto para usuarios existentes
INSERT INTO public.user_plans (user_id, plan, is_active)
SELECT id, 'cliente'::plan_type, true
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;