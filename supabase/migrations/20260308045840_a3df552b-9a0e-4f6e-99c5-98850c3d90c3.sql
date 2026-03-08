
-- Create server_errors table for logging failed conversions
CREATE TABLE public.server_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  error_code text,
  file_name text,
  from_format text,
  to_format text,
  file_size_kb numeric,
  user_email text DEFAULT 'anonymous',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE public.server_errors ENABLE ROW LEVEL SECURITY;

-- Only admins can view errors
CREATE POLICY "Admin can view server errors"
  ON public.server_errors FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can insert errors (for logging failures)
CREATE POLICY "Authenticated users can insert errors"
  ON public.server_errors FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- No delete/update from clients
CREATE POLICY "No delete server errors"
  ON public.server_errors FOR DELETE
  USING (false);

CREATE POLICY "No update server errors"
  ON public.server_errors FOR UPDATE
  USING (false);
