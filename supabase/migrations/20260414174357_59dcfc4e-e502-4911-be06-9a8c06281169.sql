CREATE POLICY "Admin can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'files' AND public.has_role('admin'::public.app_role));