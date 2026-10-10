CREATE POLICY "Users can view own server errors"
ON public.server_errors
FOR SELECT
TO authenticated
USING (
  user_email = (auth.jwt() ->> 'email'::text)
);