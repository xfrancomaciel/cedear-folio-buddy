-- Fix critical security issue: Restrict access to sensitive customer data

-- ============================================================================
-- Fix game_results table RLS policies
-- ============================================================================

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view game results" ON public.game_results;

-- Create secure policies for game_results
-- Users can view their own game results (by email match)
CREATE POLICY "Users can view their own game results" 
ON public.game_results 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  email = (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Admins can view all game results
CREATE POLICY "Admins can view all game results" 
ON public.game_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep the insert policy for game functionality (anonymous users can submit results)
-- This policy already exists: "Anyone can insert game results"

-- ============================================================================
-- Fix leads table RLS policies  
-- ============================================================================

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;

-- Create secure policies for leads
-- Only admins can view leads (contains sensitive customer info)
CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage leads (update/delete)
CREATE POLICY "Admins can manage leads" 
ON public.leads 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Keep the insert policy for lead generation forms (anonymous users can submit leads)
-- This policy already exists: "Anyone can insert leads"

-- Keep the email status update policy but restrict it to admins only
DROP POLICY IF EXISTS "Allow email status updates" ON public.leads;
CREATE POLICY "Admins can update email status" 
ON public.leads 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));