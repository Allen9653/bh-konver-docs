-- Add missing UPDATE policy for 'files' storage bucket
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'files' AND owner = auth.uid())
WITH CHECK (bucket_id = 'files' AND owner = auth.uid());
