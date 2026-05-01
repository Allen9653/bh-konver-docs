CREATE POLICY "Admins can view files bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'files' AND public.has_role('admin'::app_role));