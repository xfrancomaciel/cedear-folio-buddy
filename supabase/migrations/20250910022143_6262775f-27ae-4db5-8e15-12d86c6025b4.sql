-- Add user_id column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Set user_id for existing transactions (assign to first user or create system user if needed)
UPDATE public.transactions 
SET user_id = (
  SELECT id FROM auth.users ORDER BY created_at LIMIT 1
) 
WHERE user_id IS NULL;

-- Make user_id not nullable after setting values
ALTER TABLE public.transactions 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing RLS policies for transactions
DROP POLICY IF EXISTS "Anyone can delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can view transactions" ON public.transactions;

-- Create user-specific RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (auth.uid() = user_id);