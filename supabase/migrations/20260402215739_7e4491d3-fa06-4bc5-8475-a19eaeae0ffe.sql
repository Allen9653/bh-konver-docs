
-- ============================================
-- 1. FIX TRANSACTIONS: public → authenticated
-- ============================================

-- Drop all public-role policies
DROP POLICY IF EXISTS "Admin can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admin can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "No one can delete transactions" ON public.transactions;

-- Drop redundant authenticated policies (will recreate clean)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admin can update transactions permissive" ON public.transactions;

-- Recreate clean policies on authenticated only
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "No one can delete transactions"
ON public.transactions FOR DELETE TO authenticated
USING (false);

-- Keep existing INSERT policy (already authenticated + user_id = auth.uid())

-- ============================================
-- 2. FIX USER_ROLES: explicit deny policies
-- ============================================

DROP POLICY IF EXISTS "No direct insert into user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "No direct update of user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "No direct delete of user_roles" ON public.user_roles;

CREATE POLICY "No direct insert into user_roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct update of user_roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "No direct delete of user_roles"
ON public.user_roles FOR DELETE TO authenticated
USING (false);

-- ============================================
-- 3. FIX PROFILES: add WITH CHECK to UPDATE
-- ============================================

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
