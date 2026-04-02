
-- Add user_id column
ALTER TABLE public.conversions ADD COLUMN IF NOT EXISTS user_id uuid;

-- Backfill from profiles
UPDATE public.conversions c
SET user_id = p.id
FROM public.profiles p
WHERE c.user_email = p.email AND c.user_id IS NULL;

-- Drop old email-based policies
DROP POLICY IF EXISTS "Users can view own conversions" ON public.conversions;
DROP POLICY IF EXISTS "Admin can view all conversions" ON public.conversions;
DROP POLICY IF EXISTS "Authenticated users can insert conversions" ON public.conversions;

-- New UUID-based policies
CREATE POLICY "Users can view own conversions"
ON public.conversions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all conversions"
ON public.conversions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own conversions"
ON public.conversions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
