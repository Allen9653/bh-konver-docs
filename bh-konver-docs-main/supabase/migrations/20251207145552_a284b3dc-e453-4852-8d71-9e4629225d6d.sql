-- Create table for tracking transactions/payments
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BAM',
  paypal_order_id TEXT,
  paypal_payer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking file conversions
CREATE TABLE public.conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  transaction_id UUID REFERENCES public.transactions(id),
  original_filename TEXT NOT NULL,
  original_format TEXT NOT NULL,
  target_format TEXT NOT NULL,
  file_size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'pending',
  converted_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for uploaded documents
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  storage_path TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for transactions (admin can view all, users can view their own by email)
CREATE POLICY "Admin can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own transactions" 
ON public.transactions 
FOR SELECT 
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update transactions" 
ON public.transactions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for conversions
CREATE POLICY "Admin can view all conversions" 
ON public.conversions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own conversions" 
ON public.conversions 
FOR SELECT 
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can insert conversions" 
ON public.conversions 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for documents
CREATE POLICY "Admin can view all documents" 
ON public.documents 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own documents" 
ON public.documents 
FOR SELECT 
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete own documents" 
ON public.documents 
FOR DELETE 
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', false);

-- Storage policies
CREATE POLICY "Users can upload own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();