-- 1) Replace permissive user UPDATE policy on processing_jobs with a trigger-enforced safe-column policy
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.processing_jobs;

-- Trigger to prevent users from manipulating outcome fields. Admins/service role bypass.
CREATE OR REPLACE FUNCTION public.guard_processing_jobs_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_user_name text := session_user;
  current_role_name text := current_setting('role', true);
BEGIN
  -- Allow privileged server-side roles full control
  IF session_user_name IN ('postgres', 'supabase_admin', 'service_role')
     OR current_role_name IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  -- Allow admins to update anything
  IF auth.uid() IS NOT NULL AND public.has_role('admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- For regular users: block changes to outcome/integrity columns
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Users cannot modify status of processing jobs' USING ERRCODE = '42501';
  END IF;
  IF NEW.result_url IS DISTINCT FROM OLD.result_url THEN
    RAISE EXCEPTION 'Users cannot modify result_url of processing jobs' USING ERRCODE = '42501';
  END IF;
  IF NEW.error IS DISTINCT FROM OLD.error THEN
    RAISE EXCEPTION 'Users cannot modify error of processing jobs' USING ERRCODE = '42501';
  END IF;
  IF NEW.progress IS DISTINCT FROM OLD.progress THEN
    RAISE EXCEPTION 'Users cannot modify progress of processing jobs' USING ERRCODE = '42501';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Users cannot reassign processing jobs' USING ERRCODE = '42501';
  END IF;
  IF NEW.original_filename IS DISTINCT FROM OLD.original_filename
     OR NEW.target_format IS DISTINCT FROM OLD.target_format THEN
    RAISE EXCEPTION 'Users cannot modify immutable job fields' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_processing_jobs_user_update_trg ON public.processing_jobs;
CREATE TRIGGER guard_processing_jobs_user_update_trg
BEFORE UPDATE ON public.processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.guard_processing_jobs_user_update();

-- Re-create user UPDATE policy (trigger enforces column-level safety)
CREATE POLICY "Users can update their own jobs"
ON public.processing_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2) Storage: explicit admin INSERT policy on 'files' bucket
DROP POLICY IF EXISTS "Admins can upload to files bucket" ON storage.objects;
CREATE POLICY "Admins can upload to files bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'files' AND public.has_role('admin'::app_role)
);
