-- Webhook audit log za PayPal sigurnosnu reviziju
CREATE TABLE public.webhook_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT,
    transmission_id TEXT,
    status TEXT NOT NULL,
    request_payload JSONB,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    client_ip TEXT,
    notes TEXT
);

-- Indeksi za brže pretrage
CREATE INDEX idx_webhook_audit_transmission_id ON public.webhook_audit_log(transmission_id);
CREATE INDEX idx_webhook_audit_status ON public.webhook_audit_log(status);
CREATE INDEX idx_webhook_audit_received_at ON public.webhook_audit_log(received_at DESC);

-- Omogući RLS
ALTER TABLE public.webhook_audit_log ENABLE ROW LEVEL SECURITY;

-- Samo admin može vidjeti audit logove
CREATE POLICY "Admin can view webhook audit logs"
ON public.webhook_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Niko ne može direktno upisivati/brisati (samo backend)
CREATE POLICY "No direct insert from clients"
ON public.webhook_audit_log
FOR INSERT
WITH CHECK (false);

CREATE POLICY "No delete allowed"
ON public.webhook_audit_log
FOR DELETE
USING (false);

-- Komentar za dokumentaciju
COMMENT ON TABLE public.webhook_audit_log IS 'Audit log za PayPal webhook događaje - sigurnosna revizija';