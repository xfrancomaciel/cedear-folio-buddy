-- Create user_invitations table
CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  plan plan_type NOT NULL DEFAULT 'cliente',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique constraint (one pending invitation per email)
CREATE UNIQUE INDEX unique_pending_invitation ON public.user_invitations (email, status) 
WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view invitations
CREATE POLICY "Admins can view invitations"
  ON public.user_invitations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Policy: Only admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON public.user_invitations
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy: Only admins can update invitations
CREATE POLICY "Admins can update invitations"
  ON public.user_invitations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Policy: Only admins can delete invitations
CREATE POLICY "Admins can delete invitations"
  ON public.user_invitations
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();