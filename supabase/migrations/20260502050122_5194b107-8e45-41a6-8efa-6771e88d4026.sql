-- 1. processing_jobs: admin oversight + user delete
CREATE POLICY "Admins can view all processing jobs"
ON public.processing_jobs FOR SELECT
TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can update any processing job"
ON public.processing_jobs FOR UPDATE
TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can delete any processing job"
ON public.processing_jobs FOR DELETE
TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Users can delete their own jobs"
ON public.processing_jobs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. user_roles: defense-in-depth trigger blocking writes from non-service contexts.
-- Only the service_role (edge functions/admin server code) and the SECURITY DEFINER
-- handle_new_user() trigger (which runs as postgres) may write to user_roles.
CREATE OR REPLACE FUNCTION public.guard_user_roles_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role_name text := current_setting('role', true);
  session_user_name text := session_user;
BEGIN
  -- Allow when executed by the service role or the postgres superuser
  -- (handle_new_user runs as the table owner via SECURITY DEFINER from the auth trigger).
  IF session_user_name IN ('postgres', 'supabase_admin', 'service_role')
     OR current_role_name IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  RAISE EXCEPTION 'user_roles can only be modified by trusted server-side code'
    USING ERRCODE = '42501';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_user_roles_writes() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_user_roles_writes_trg ON public.user_roles;
CREATE TRIGGER guard_user_roles_writes_trg
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.guard_user_roles_writes();