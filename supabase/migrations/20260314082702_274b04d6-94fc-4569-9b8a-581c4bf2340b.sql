
-- 1. Revoke anon access to transactions_secure_view (defense in depth)
REVOKE ALL ON public.transactions_secure_view FROM anon;
REVOKE ALL ON public.transactions_secure_view FROM public;

-- 2. Fix conversion_logs INSERT policy to enforce email ownership
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.conversion_logs;
CREATE POLICY "Authenticated users can insert logs"
  ON public.conversion_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (user_email = (auth.jwt() ->> 'email') OR user_email = 'anonymous')
  );
