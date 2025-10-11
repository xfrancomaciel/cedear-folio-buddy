-- Add last_sign_in_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Create a function to update last sign in timestamp
CREATE OR REPLACE FUNCTION public.update_last_sign_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;

-- Create trigger to sync last_sign_in_at from auth.users
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_sign_in();

-- Sync existing last_sign_in_at data
CREATE OR REPLACE FUNCTION public.sync_last_sign_in_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles p
  SET last_sign_in_at = au.last_sign_in_at
  FROM auth.users au
  WHERE p.id = au.id;
END;
$$;

-- Execute the sync
SELECT public.sync_last_sign_in_data();

-- Drop the temporary function
DROP FUNCTION public.sync_last_sign_in_data();