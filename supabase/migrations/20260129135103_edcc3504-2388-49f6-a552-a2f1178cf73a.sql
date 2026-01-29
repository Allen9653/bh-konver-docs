-- Drop the existing insert policy
DROP POLICY IF EXISTS "Authenticated users can insert conversions" ON public.conversions;

-- Create a new insert policy that validates transaction_id belongs to the user
CREATE POLICY "Authenticated users can insert conversions"
ON public.conversions
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be authenticated and email must match
  (auth.uid() IS NOT NULL) 
  AND (user_email = (auth.jwt() ->> 'email'::text))
  -- If transaction_id is provided, it must belong to the user
  AND (
    transaction_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = transaction_id 
      AND (t.user_id = auth.uid() OR t.user_email = (auth.jwt() ->> 'email'::text))
    )
  )
);