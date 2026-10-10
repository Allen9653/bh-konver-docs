
-- 1. Add user_id column to documents (nullable initially for backfill)
ALTER TABLE public.documents ADD COLUMN user_id uuid;

-- 2. Backfill user_id from profiles using user_email
UPDATE public.documents d
SET user_id = p.id
FROM public.profiles p
WHERE d.user_email = p.email;

-- 3. Make user_id NOT NULL after backfill
ALTER TABLE public.documents ALTER COLUMN user_id SET NOT NULL;

-- 4. Drop old email-based RLS policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
DROP POLICY IF EXISTS "Admin can view all documents" ON public.documents;

-- 5. Create new user_id-based RLS policies
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all documents"
  ON public.documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE TO authenticated
  USING (user_id = auth.uid());
