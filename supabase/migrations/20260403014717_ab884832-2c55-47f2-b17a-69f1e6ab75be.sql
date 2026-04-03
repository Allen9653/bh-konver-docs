
-- Block anon from transactions
CREATE POLICY "Anon cannot access transactions"
ON public.transactions FOR SELECT TO anon
USING (false);

-- Block anon from conversion_logs
CREATE POLICY "Anon cannot read conversion_logs"
ON public.conversion_logs FOR SELECT TO anon
USING (false);

CREATE POLICY "Anon cannot insert conversion_logs"
ON public.conversion_logs FOR INSERT TO anon
WITH CHECK (false);

-- Fix server_errors INSERT: scope to authenticated
DROP POLICY IF EXISTS "Authenticated users can insert errors" ON public.server_errors;
CREATE POLICY "Authenticated users can insert errors"
ON public.server_errors FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Block anon from server_errors
CREATE POLICY "Anon cannot access server_errors"
ON public.server_errors FOR SELECT TO anon
USING (false);

-- Explicit deny UPDATE on webhook_audit_log
CREATE POLICY "No update on webhook_audit_log"
ON public.webhook_audit_log FOR UPDATE TO public
USING (false);
