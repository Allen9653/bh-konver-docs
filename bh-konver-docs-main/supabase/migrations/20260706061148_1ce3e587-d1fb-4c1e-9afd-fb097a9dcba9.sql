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
  -- Allow trusted backend contexts, including the auth service role that fires
  -- the new-user trigger during registration. Browser/client roles remain blocked.
  IF session_user_name IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role')
     OR current_role_name IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  RAISE EXCEPTION 'user_roles can only be modified by trusted server-side code'
    USING ERRCODE = '42501';
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;