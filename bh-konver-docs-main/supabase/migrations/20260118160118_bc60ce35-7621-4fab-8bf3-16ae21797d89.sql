-- Add a restrictive DELETE policy to profiles table to prevent any deletions
-- This is a security measure to protect user profile data
CREATE POLICY "No one can delete profiles"
ON public.profiles
FOR DELETE
USING (false);