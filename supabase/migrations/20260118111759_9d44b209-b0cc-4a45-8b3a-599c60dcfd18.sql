-- Fix the security definer view issue by using security_invoker = true
-- This ensures the view uses the permissions of the querying user, not the view creator

DROP VIEW IF EXISTS public.transactions_secure_view;

CREATE VIEW public.transactions_secure_view 
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
  id,
  user_id,
  amount,
  expires_at,
  created_at,
  updated_at,
  user_email,
  paypal_order_id,
  plan_id,
  paypal_payer_id,
  currency,
  status
FROM public.transactions;

-- Grant access to authenticated users only
GRANT SELECT ON public.transactions_secure_view TO authenticated;

-- Ensure anon users cannot access
REVOKE ALL ON public.transactions_secure_view FROM anon;