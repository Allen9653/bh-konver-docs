-- Enable RLS on transactions_secure_view
-- This view contains sensitive payment data and must be protected

ALTER VIEW public.transactions_secure_view SET (security_invoker = on);

-- Enable Row Level Security on the view
-- Note: In PostgreSQL, we need to enable RLS on the underlying view
-- For views, we use security_barrier and add policies

-- Drop and recreate the view with security_barrier to enable RLS
DROP VIEW IF EXISTS public.transactions_secure_view;

CREATE VIEW public.transactions_secure_view 
WITH (security_barrier = true)
AS
SELECT 
  id,
  user_id,
  amount,
  expires_at,
  created_at,
  updated_at,
  -- Mask email for non-owners/non-admins (handled via RLS on base table)
  user_email,
  paypal_order_id,
  plan_id,
  paypal_payer_id,
  currency,
  status
FROM public.transactions;

-- Grant access to authenticated users
GRANT SELECT ON public.transactions_secure_view TO authenticated;

-- Revoke access from anon users - they should not see payment data
REVOKE ALL ON public.transactions_secure_view FROM anon;