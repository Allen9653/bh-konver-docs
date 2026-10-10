-- =====================================================
-- TRANSACTIONS TABLE SECURITY HARDENING
-- =====================================================

-- 1. Create function to mask email addresses
-- Shows first 2 chars + ***@domain
CREATE OR REPLACE FUNCTION public.mask_email(email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  at_pos INTEGER;
  local_part TEXT;
  domain_part TEXT;
BEGIN
  IF email IS NULL THEN
    RETURN NULL;
  END IF;
  
  at_pos := position('@' in email);
  IF at_pos = 0 THEN
    RETURN '***';
  END IF;
  
  local_part := substring(email from 1 for at_pos - 1);
  domain_part := substring(email from at_pos);
  
  IF length(local_part) <= 2 THEN
    RETURN local_part || '***' || domain_part;
  ELSE
    RETURN substring(local_part from 1 for 2) || '***' || domain_part;
  END IF;
END;
$$;

-- 2. Create function to mask PayPal IDs
-- Shows last 4 characters only
CREATE OR REPLACE FUNCTION public.mask_paypal_id(paypal_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF paypal_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF length(paypal_id) <= 4 THEN
    RETURN paypal_id;
  END IF;
  
  RETURN '***' || substring(paypal_id from length(paypal_id) - 3);
END;
$$;

-- 3. Create secure view for transactions
-- Admins see full data, regular users see masked sensitive fields
CREATE OR REPLACE VIEW public.transactions_secure_view AS
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
    WHEN user_id = auth.uid() THEN user_email  -- Users can see their own email
    ELSE mask_email(user_email)
  END AS user_email,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN paypal_order_id
    WHEN user_id = auth.uid() THEN paypal_order_id  -- Users can see their own PayPal order
    ELSE mask_paypal_id(paypal_order_id)
  END AS paypal_order_id,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN paypal_payer_id
    WHEN user_id = auth.uid() THEN paypal_payer_id  -- Users can see their own payer ID
    ELSE mask_paypal_id(paypal_payer_id)
  END AS paypal_payer_id
FROM public.transactions;

-- 4. Grant access to the secure view
GRANT SELECT ON public.transactions_secure_view TO authenticated;

-- 5. Add validation constraints to prevent data pollution
ALTER TABLE public.transactions 
  DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE public.transactions 
  ADD CONSTRAINT valid_status 
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

ALTER TABLE public.transactions 
  DROP CONSTRAINT IF EXISTS valid_amount;

ALTER TABLE public.transactions 
  ADD CONSTRAINT valid_amount 
  CHECK (amount > 0 AND amount < 100000);

ALTER TABLE public.transactions 
  DROP CONSTRAINT IF EXISTS valid_plan;

ALTER TABLE public.transactions 
  ADD CONSTRAINT valid_plan 
  CHECK (plan_id IN ('24h', '48h', 'monthly'));

-- 6. Add comment for documentation
COMMENT ON VIEW public.transactions_secure_view IS 
  'Secure view for transactions table. Masks sensitive fields (email, PayPal IDs) for non-admin users while allowing admins full access. Users can see their own unmasked data.';

COMMENT ON FUNCTION public.mask_email IS 
  'Masks email addresses for privacy. Shows first 2 characters of local part + *** + domain.';

COMMENT ON FUNCTION public.mask_paypal_id IS 
  'Masks PayPal IDs for privacy. Shows *** + last 4 characters only.';