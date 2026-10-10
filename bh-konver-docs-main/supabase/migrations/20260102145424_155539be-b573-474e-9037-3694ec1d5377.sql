-- Drop existing problematic RLS policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view own conversions" ON public.conversions;

-- Create corrected RLS policies using auth.jwt() instead of auth.users subquery
-- For transactions table
CREATE POLICY "Users can view own transactions" 
ON public.transactions 
FOR SELECT 
USING (
  user_email = (auth.jwt() ->> 'email')::text
);

-- For documents table
CREATE POLICY "Users can view own documents" 
ON public.documents 
FOR SELECT 
USING (
  user_email = (auth.jwt() ->> 'email')::text
);

CREATE POLICY "Users can insert own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  user_email = (auth.jwt() ->> 'email')::text
);

CREATE POLICY "Users can delete own documents" 
ON public.documents 
FOR DELETE 
USING (
  user_email = (auth.jwt() ->> 'email')::text
);

-- For conversions table
CREATE POLICY "Users can view own conversions" 
ON public.conversions 
FOR SELECT 
USING (
  user_email = (auth.jwt() ->> 'email')::text
);