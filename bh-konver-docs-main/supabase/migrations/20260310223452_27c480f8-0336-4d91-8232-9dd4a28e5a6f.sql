
-- Fix remaining WITH CHECK (true) on conversion_logs INSERT
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.conversion_logs;
CREATE POLICY "Authenticated users can insert logs"
  ON public.conversion_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix server_errors INSERT policy (WITH CHECK that just checks auth.uid() IS NOT NULL is fine but let's be explicit)
-- Already has: WITH CHECK (auth.uid() IS NOT NULL) — that's acceptable

-- cleanup_jobs has RLS enabled but no policies — add appropriate policies
-- Only service role should manage these, so deny all client access
CREATE POLICY "No client access to cleanup_jobs"
  ON public.cleanup_jobs FOR ALL
  TO authenticated, anon
  USING (false);
