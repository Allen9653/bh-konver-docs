-- Fix transactions_secure_view to properly inherit RLS from base table
-- The view must use security_invoker = true to run queries as the calling user

DROP VIEW IF EXISTS public.transactions_secure_view;

-- Recreate the view with proper security settings
-- security_barrier = true: prevents optimizer from pushing conditions through the view
-- security_invoker = true: runs the query as the calling user, inheriting their RLS permissions
CREATE VIEW public.transactions_secure_view 
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
  t.id,
  t.user_id,
  t.amount,
  t.expires_at,
  t.created_at,
  t.updated_at,
  -- Apply masking functions for sensitive data
  CASE 
    WHEN t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) 
    THEN t.user_email
    ELSE public.mask_email(t.user_email)
  END AS user_email,
  CASE 
    WHEN t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) 
    THEN t.paypal_order_id
    ELSE public.mask_paypal_id(t.paypal_order_id)
  END AS paypal_order_id,
  t.plan_id,
  CASE 
    WHEN t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) 
    THEN t.paypal_payer_id
    ELSE public.mask_paypal_id(t.paypal_payer_id)
  END AS paypal_payer_id,
  t.currency,
  t.status
FROM public.transactions t;

-- Revoke all access from public and anon - no unauthenticated access
REVOKE ALL ON public.transactions_secure_view FROM anon;
REVOKE ALL ON public.transactions_secure_view FROM public;

-- Only authenticated users can access the view
GRANT SELECT ON public.transactions_secure_view TO authenticated;

-- Add a comment explaining the security model
COMMENT ON VIEW public.transactions_secure_view IS 
'Secure view for transactions that inherits RLS from the base transactions table via security_invoker=true. 
Sensitive fields (email, PayPal IDs) are masked for users viewing other records. 
Only authenticated users can access; anon access is revoked.';