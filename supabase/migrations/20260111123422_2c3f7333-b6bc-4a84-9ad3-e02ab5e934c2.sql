
-- ============================================
-- SECURITY FIX: Transactions & Profiles RLS
-- ============================================

-- PART 1: Add user_id column to transactions
-- ============================================

-- Add user_id column (nullable initially for migration)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Populate user_id from profiles table based on email match
UPDATE public.transactions t
SET user_id = p.id
FROM public.profiles p
WHERE t.user_email = p.email AND t.user_id IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- PART 2: Update Transactions RLS Policies
-- ============================================

-- Drop old email-based policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert own transactions" ON public.transactions;

-- Create new user_id-based policies
CREATE POLICY "Users can view own transactions" 
ON public.transactions 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can insert own transactions" 
ON public.transactions 
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
);

-- PART 3: Add Admin SELECT policy to Profiles
-- ============================================

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role)
);

-- Drop old SELECT policy and recreate with admin access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

