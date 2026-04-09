
-- ============================================
-- 1. Fix storage: drop {public}-scoped duplicate policies on user-documents
-- ============================================
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- Fix files bucket: drop {public} Owner Delete, recreate as {authenticated}
DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
CREATE POLICY "Owner Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'files' AND auth.uid() = owner);

-- ============================================
-- 2. Tighten server_errors INSERT — remove 'anonymous' fallback
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can insert own errors" ON public.server_errors;
CREATE POLICY "Authenticated users can insert own errors"
  ON public.server_errors FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_email = (auth.jwt() ->> 'email')
  );

-- ============================================
-- 3. Add user_id to conversion_logs and update policies
-- ============================================
ALTER TABLE public.conversion_logs
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Backfill user_id from profiles where emails match
UPDATE public.conversion_logs cl
SET user_id = p.id
FROM public.profiles p
WHERE cl.user_email = p.email AND cl.user_id IS NULL;

-- Drop old email-based policies
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.conversion_logs;
DROP POLICY IF EXISTS "Users can view own conversion logs" ON public.conversion_logs;

-- New user_id-based INSERT policy
CREATE POLICY "Authenticated users can insert logs"
  ON public.conversion_logs FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- New user_id-based SELECT policy for own logs
CREATE POLICY "Users can view own conversion logs"
  ON public.conversion_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());
