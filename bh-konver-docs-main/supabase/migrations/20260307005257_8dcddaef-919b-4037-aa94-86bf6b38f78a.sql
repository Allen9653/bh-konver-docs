
-- Allow authenticated users to insert into conversion_logs
CREATE POLICY "Authenticated users can insert logs"
ON public.conversion_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create ads_management table
CREATE TABLE public.ads_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  target_url text NOT NULL,
  position text NOT NULL DEFAULT 'left' CHECK (position IN ('left', 'right')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ads_management ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on ads
CREATE POLICY "Admin can manage ads" ON public.ads_management
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can read active ads (for homepage display)
CREATE POLICY "Public can view active ads" ON public.ads_management
FOR SELECT TO anon, authenticated
USING (is_active = true);

-- Create purge function
CREATE OR REPLACE FUNCTION public.manual_purge_all_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM public.conversion_logs;
END;
$$;
