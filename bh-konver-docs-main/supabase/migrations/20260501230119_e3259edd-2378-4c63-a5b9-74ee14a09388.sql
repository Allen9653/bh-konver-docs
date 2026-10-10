
-- 1) Lock down SECURITY DEFINER functions: revoke broad EXECUTE, grant only where needed

-- Trigger functions: should never be invoked directly via API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_auth_user_deleted_cleanup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_server_error_user_context() FROM PUBLIC, anon, authenticated;

-- Admin-only privileged operations
REVOKE EXECUTE ON FUNCTION public.manual_purge_all_logs() FROM PUBLIC, anon;
-- keep authenticated EXECUTE because the function self-checks has_role('admin')
GRANT EXECUTE ON FUNCTION public.manual_purge_all_logs() TO authenticated;

-- User-scoped helpers: signed-in users only
REVOKE EXECUTE ON FUNCTION public.get_my_transactions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_transactions() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;

-- check_user_role is for service role only (used by edge functions)
REVOKE EXECUTE ON FUNCTION public.check_user_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- 2) processing_jobs: scope policies to authenticated role (was 'public')
DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.processing_jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.processing_jobs;
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.processing_jobs;

CREATE POLICY "Users can insert their own jobs"
  ON public.processing_jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON public.processing_jobs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own jobs"
  ON public.processing_jobs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon cannot access processing_jobs"
  ON public.processing_jobs FOR SELECT TO anon
  USING (false);

-- 3) server_errors: enforce email match in addition to user_id
DROP POLICY IF EXISTS "Authenticated users can insert own errors" ON public.server_errors;

CREATE POLICY "Authenticated users can insert own errors"
  ON public.server_errors FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND (
      user_email IS NULL
      OR user_email = 'anonymous'
      OR user_email = (auth.jwt() ->> 'email')
    )
  );
