
-- ============================================
-- 1. MAKE files BUCKET PRIVATE
-- ============================================

UPDATE storage.buckets SET public = false WHERE id = 'files';

-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create owner-only SELECT policy for files bucket
CREATE POLICY "Owner reads own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'files' AND owner = auth.uid());

-- Fix the upload policy to be owner-scoped
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Owner uploads own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'files' AND owner = auth.uid());

-- ============================================
-- 2. REVOKE authenticated ACCESS TO transactions_secure_view
-- ============================================

REVOKE ALL ON public.transactions_secure_view FROM authenticated;

-- ============================================
-- 3. CONVERSIONS: enable RLS + add DELETE policy
-- ============================================

ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete own conversions"
ON public.conversions FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 4. USER_ROLES: block anon INSERT/UPDATE/DELETE
-- ============================================

-- Ensure anon role cannot insert
DROP POLICY IF EXISTS "Anon cannot insert user_roles" ON public.user_roles;
CREATE POLICY "Anon cannot insert user_roles"
ON public.user_roles FOR INSERT TO anon
WITH CHECK (false);

DROP POLICY IF EXISTS "Anon cannot update user_roles" ON public.user_roles;
CREATE POLICY "Anon cannot update user_roles"
ON public.user_roles FOR UPDATE TO anon
USING (false);

DROP POLICY IF EXISTS "Anon cannot delete user_roles" ON public.user_roles;
CREATE POLICY "Anon cannot delete user_roles"
ON public.user_roles FOR DELETE TO anon
USING (false);

DROP POLICY IF EXISTS "Anon cannot select user_roles" ON public.user_roles;
CREATE POLICY "Anon cannot select user_roles"
ON public.user_roles FOR SELECT TO anon
USING (false);
