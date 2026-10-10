
-- 1. Recreate transactions_secure_view with security_invoker
DROP VIEW IF EXISTS public.transactions_secure_view;
CREATE VIEW public.transactions_secure_view
WITH (security_invoker = true, security_barrier = true) AS
SELECT
  id,
  user_id,
  amount,
  expires_at,
  created_at,
  updated_at,
  status,
  public.mask_email(user_email) AS user_email,
  public.mask_paypal_id(paypal_order_id) AS paypal_order_id,
  plan_id,
  public.mask_paypal_id(paypal_payer_id) AS paypal_payer_id,
  currency
FROM public.transactions;

-- 2. Fix transactions INSERT policy: remove overly permissive WITH CHECK (true)
-- First drop the problematic policies if they exist
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;

-- The existing policies from the schema are RESTRICTIVE. 
-- We need to add a PERMISSIVE SELECT policy so authenticated users can actually access data.
-- Current RESTRICTIVE policies block by default unless at least one PERMISSIVE exists.

-- Add PERMISSIVE policies for transactions
CREATE POLICY "Authenticated users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert own transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admin can update transactions permissive"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix function search paths for functions missing it
CREATE OR REPLACE FUNCTION public.on_auth_user_deleted_cleanup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.cleanup_jobs (user_id)
    VALUES (old.id);
    RETURN old;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
