
DROP VIEW IF EXISTS public.transactions_secure_view;

CREATE VIEW public.transactions_secure_view
WITH (security_invoker = true)
AS SELECT 
  id, user_id, user_email, amount, currency,
  paypal_order_id, paypal_payer_id, plan_id, status, created_at
FROM public.transactions;

-- Revoke from anon entirely
REVOKE ALL ON public.transactions_secure_view FROM anon;
REVOKE ALL ON public.transactions_secure_view FROM public;
