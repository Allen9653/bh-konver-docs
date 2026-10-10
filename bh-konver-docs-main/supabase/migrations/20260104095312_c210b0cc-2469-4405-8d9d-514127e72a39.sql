-- Remove dangerous anonymous insert policy
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;

-- Create secure insert policy requiring authentication
CREATE POLICY "Authenticated users can insert own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_email = (auth.jwt() ->> 'email')::text
);

-- Add explicit DELETE deny policy for audit compliance
CREATE POLICY "No one can delete transactions" 
ON public.transactions 
FOR DELETE 
USING (false);

-- Ensure conversions also require auth for insert
DROP POLICY IF EXISTS "Anyone can insert conversions" ON public.conversions;

CREATE POLICY "Authenticated users can insert conversions" 
ON public.conversions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_email = (auth.jwt() ->> 'email')::text
);