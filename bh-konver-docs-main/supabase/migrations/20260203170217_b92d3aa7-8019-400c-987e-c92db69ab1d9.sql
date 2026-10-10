-- Fix overly permissive UPDATE policy - restrict to service role only
DROP POLICY "Service role can update jobs" ON public.processing_jobs;

-- Create a more restrictive policy that only allows the row owner to update
-- Background processing will use service role key which bypasses RLS
CREATE POLICY "Users can update their own jobs"
ON public.processing_jobs
FOR UPDATE
USING (auth.uid() = user_id);