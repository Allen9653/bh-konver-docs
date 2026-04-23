CREATE TABLE IF NOT EXISTS public.credential_send_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid,
  target_email text NOT NULL,
  plan text,
  order_id text,
  outcome text NOT NULL,
  source text NOT NULL DEFAULT 'send-login-credentials',
  request_ip text,
  user_agent text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.credential_send_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view credential send audit" ON public.credential_send_audit;
DROP POLICY IF EXISTS "No client access to credential_send_audit" ON public.credential_send_audit;

CREATE POLICY "Admins can view credential send audit"
ON public.credential_send_audit
FOR SELECT
TO authenticated
USING (public.has_role('admin'));

CREATE POLICY "No client access to credential_send_audit"
ON public.credential_send_audit
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_credential_send_audit_requester_user_id
  ON public.credential_send_audit (requester_user_id);

CREATE INDEX IF NOT EXISTS idx_credential_send_audit_target_email
  ON public.credential_send_audit (target_email);

CREATE INDEX IF NOT EXISTS idx_credential_send_audit_created_at
  ON public.credential_send_audit (created_at DESC);

CREATE OR REPLACE FUNCTION public.assign_server_error_user_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  jwt_email := auth.jwt() ->> 'email';

  NEW.user_id := auth.uid();
  NEW.user_email := COALESCE(jwt_email, NEW.user_email, 'anonymous');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_server_error_user_context ON public.server_errors;
CREATE TRIGGER set_server_error_user_context
BEFORE INSERT ON public.server_errors
FOR EACH ROW
EXECUTE FUNCTION public.assign_server_error_user_context();

DROP POLICY IF EXISTS "Users can view own server errors" ON public.server_errors;
DROP POLICY IF EXISTS "Authenticated users can insert own errors" ON public.server_errors;
DROP POLICY IF EXISTS "Anon cannot access server_errors" ON public.server_errors;

CREATE POLICY "Users can view own server errors"
ON public.server_errors
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own errors"
ON public.server_errors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Anon cannot access server_errors"
ON public.server_errors
FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS "Anon cannot insert conversions" ON public.conversions;
DROP POLICY IF EXISTS "Anon cannot delete conversions" ON public.conversions;

CREATE POLICY "Anon cannot insert conversions"
ON public.conversions
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Anon cannot delete conversions"
ON public.conversions
FOR DELETE
TO anon
USING (false);