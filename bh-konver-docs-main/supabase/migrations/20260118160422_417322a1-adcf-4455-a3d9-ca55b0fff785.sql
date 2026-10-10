-- Fix conversions SELECT policy to require explicit authentication check
-- Drop the existing policy and recreate with proper auth check
DROP POLICY IF EXISTS "Users can view own conversions" ON public.conversions;

CREATE POLICY "Users can view own conversions"
ON public.conversions
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND user_email = (auth.jwt() ->> 'email'::text)
);