-- Fix the security definer view warning by explicitly setting SECURITY INVOKER
-- The view relies on RLS of the underlying transactions table
DROP VIEW IF EXISTS public.transactions_secure_view;

CREATE VIEW public.transactions_secure_view 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  plan_id,
  amount,
  currency,
  status,
  expires_at,
  created_at,
  updated_at,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN user_email
    WHEN user_id = auth.uid() THEN user_email
    ELSE mask_email(user_email)
  END AS user_email,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN paypal_order_id
    WHEN user_id = auth.uid() THEN paypal_order_id
    ELSE mask_paypal_id(paypal_order_id)
  END AS paypal_order_id,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN paypal_payer_id
    WHEN user_id = auth.uid() THEN paypal_payer_id
    ELSE mask_paypal_id(paypal_payer_id)
  END AS paypal_payer_id
FROM public.transactions;

-- Re-grant access
GRANT SELECT ON public.transactions_secure_view TO authenticated;

COMMENT ON VIEW public.transactions_secure_view IS 
  'Secure view for transactions with SECURITY INVOKER. Masks sensitive fields for non-owners while admins see full data. Enforces RLS of the underlying transactions table.';