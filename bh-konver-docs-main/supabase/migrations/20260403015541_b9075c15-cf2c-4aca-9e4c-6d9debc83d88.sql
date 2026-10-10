
-- ============================================
-- STEP 1: DROP ALL POLICIES that depend on old has_role(uuid, app_role)
-- ============================================

DROP POLICY IF EXISTS "Admin can manage ads" ON public.ads_management;
DROP POLICY IF EXISTS "Admin view logs" ON public.conversion_logs;
DROP POLICY IF EXISTS "Admins can view all conversions" ON public.conversions;
DROP POLICY IF EXISTS "Admin can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view server errors" ON public.server_errors;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can view webhook audit logs" ON public.webhook_audit_log;
DROP POLICY IF EXISTS "Admins can delete all user documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update all user documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all user documents" ON storage.objects;

-- ============================================
-- STEP 2: DROP old has_role function
-- ============================================

DROP FUNCTION public.has_role(uuid, app_role);

-- ============================================
-- STEP 3: CREATE new has_role (single param, uses auth.uid())
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;

-- ============================================
-- STEP 4: RECREATE ALL POLICIES with new signature
-- ============================================

CREATE POLICY "Admin can manage ads"
ON public.ads_management FOR ALL TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admin view logs"
ON public.conversion_logs FOR SELECT TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can view all conversions"
ON public.conversions FOR SELECT TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admin can view all documents"
ON public.documents FOR SELECT TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admin can view server errors"
ON public.server_errors FOR SELECT TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admin can view webhook audit logs"
ON public.webhook_audit_log FOR SELECT TO authenticated
USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can delete all user documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-documents' AND public.has_role('admin'::app_role));

CREATE POLICY "Admins can update all user documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-documents' AND public.has_role('admin'::app_role))
WITH CHECK (bucket_id = 'user-documents' AND public.has_role('admin'::app_role));

CREATE POLICY "Admins can view all user documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-documents' AND public.has_role('admin'::app_role));

-- ============================================
-- STEP 5: transactions.user_id NOT NULL
-- ============================================

ALTER TABLE public.transactions ALTER COLUMN user_id SET NOT NULL;

-- ============================================
-- STEP 6: UPDATE manual_purge_all_logs
-- ============================================

CREATE OR REPLACE FUNCTION public.manual_purge_all_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM public.conversion_logs;
END;
$$;

-- ============================================
-- STEP 7: SERVICE-ONLY function for edge functions
-- ============================================

CREATE OR REPLACE FUNCTION public.check_user_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.check_user_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_user_role(uuid, app_role) FROM public;
REVOKE EXECUTE ON FUNCTION public.check_user_role(uuid, app_role) FROM authenticated;
