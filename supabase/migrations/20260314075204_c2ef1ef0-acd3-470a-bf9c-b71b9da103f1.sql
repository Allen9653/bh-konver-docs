
-- 1. Remove duplicate/weaker INSERT policy on transactions (allows any email)
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

-- 2. Fix conversion_logs admin policy: replace hardcoded email with role check
DROP POLICY IF EXISTS "Admin view logs" ON public.conversion_logs;
CREATE POLICY "Admin view logs"
  ON public.conversion_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Restrict has_role EXECUTE to authenticated only (prevent anon enumeration)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
