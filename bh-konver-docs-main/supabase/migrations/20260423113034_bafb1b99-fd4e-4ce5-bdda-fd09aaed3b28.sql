ALTER TABLE public.server_errors
ADD COLUMN IF NOT EXISTS user_id uuid;

UPDATE public.server_errors se
SET user_id = p.id
FROM public.profiles p
WHERE se.user_id IS NULL
  AND se.user_email IS NOT NULL
  AND p.email = se.user_email;

CREATE INDEX IF NOT EXISTS idx_server_errors_user_id
  ON public.server_errors(user_id);

DROP POLICY IF EXISTS "Users can view own server errors" ON public.server_errors;
DROP POLICY IF EXISTS "Authenticated users can insert own errors" ON public.server_errors;
DROP POLICY IF EXISTS "Authenticated users can insert errors" ON public.server_errors;

CREATE POLICY "Users can view own server errors"
ON public.server_errors
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own errors"
ON public.server_errors
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
);