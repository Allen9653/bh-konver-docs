-- 1. Harden handle_new_user: ensure it cannot be exploited for privilege escalation
-- Add explicit admin email check and default to 'user' role for everyone else
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);

  -- Only system-level trigger can assign admin; hardcoded to a single known email
  IF new.email = 'alenjusufovic@yahoo.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Always assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$;

-- 2. Add SELECT policy for authenticated users on conversion_logs scoped to their email
CREATE POLICY "Users can view own conversion logs"
ON public.conversion_logs
FOR SELECT
TO authenticated
USING (user_email = (auth.jwt() ->> 'email'));
