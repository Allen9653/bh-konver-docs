
-- ============================================
-- 1. SECURE transactions_secure_view
-- ============================================

-- Revoke all access from anon and public
REVOKE ALL ON public.transactions_secure_view FROM anon;
REVOKE ALL ON public.transactions_secure_view FROM public;

-- Create SECURITY DEFINER function for safe filtered access
CREATE OR REPLACE FUNCTION public.get_my_transactions()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  amount numeric,
  currency text,
  plan_id text,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id, t.user_id, t.user_email, t.amount, t.currency, 
    t.plan_id, t.status, t.created_at
  FROM public.transactions t
  WHERE t.user_id = auth.uid();
$$;

-- Restrict execution to authenticated only
REVOKE EXECUTE ON FUNCTION public.get_my_transactions() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_transactions() FROM public;
GRANT EXECUTE ON FUNCTION public.get_my_transactions() TO authenticated;

-- ============================================
-- 2. PROFILES: standalone SELECT policy
-- ============================================

-- Drop existing combined policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Standalone user SELECT
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Admin SELECT (separate)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
