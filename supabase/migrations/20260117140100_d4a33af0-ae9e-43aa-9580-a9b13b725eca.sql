-- Add admin override policies for storage bucket 'user-documents'
-- This allows admins to view and delete user files for support and moderation

-- Allow admins to view all documents in user-documents bucket
CREATE POLICY "Admins can view all user documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'user-documents' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete any document for moderation
CREATE POLICY "Admins can delete all user documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'user-documents' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to update any document metadata for moderation
CREATE POLICY "Admins can update all user documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'user-documents' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'user-documents' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);