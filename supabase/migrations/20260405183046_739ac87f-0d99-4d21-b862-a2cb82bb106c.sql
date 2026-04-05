
-- 1. Add UPDATE policy for authenticated users on user-documents bucket
CREATE POLICY "Users can update own files in user-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user-documents' AND owner = auth.uid())
WITH CHECK (bucket_id = 'user-documents' AND owner = auth.uid());

-- 2. Fix server_errors INSERT policy to restrict user_email spoofing
DROP POLICY IF EXISTS "Authenticated users can insert errors" ON public.server_errors;

CREATE POLICY "Authenticated users can insert own errors"
ON public.server_errors
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    user_email = (auth.jwt() ->> 'email')
    OR user_email = 'anonymous'
  )
);
