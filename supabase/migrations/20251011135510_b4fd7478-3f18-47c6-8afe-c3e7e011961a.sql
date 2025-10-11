-- Update handle_new_user to also set initial last_sign_in_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, last_sign_in_at)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.last_sign_in_at  -- Also set the initial last_sign_in_at
  );
  RETURN new;
END;
$function$;