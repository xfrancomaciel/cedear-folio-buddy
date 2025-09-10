-- Create the missing trigger to automatically create user profiles
-- This trigger will execute the handle_new_user() function when a new user signs up

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();