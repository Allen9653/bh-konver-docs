import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo",
};

// Only mark transactions as completed AFTER payment is actually captured.
// CHECKOUT.ORDER.APPROVED fires before capture and must NOT activate subscriptions.
const SUPPORTED_EVENTS = [
  "PAYMENT.SALE.COMPLETED",
  "PAYMENT.CAPTURE.COMPLETED",
];

// Replay protection - in-memory cache (per instance)
const processedTransmissions = new Set<string>();
const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Create Supabase client with service role for audit logging
const getSupabaseClient = (): SupabaseClient => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Sanitize payload to remove sensitive data before logging
function sanitizePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const sensitiveFields = [
    'credit_card', 'card_number', 'cvv', 'cvc', 'ssn', 'social_security',
    'password', 'secret', 'api_key', 'access_token', 'refresh_token',
    'account_number', 'routing_number', 'bank_account', 'iban', 'swift',
    'tax_id', 'national_id', 'passport', 'driver_license'
  ];

  const sanitized = JSON.parse(JSON.stringify(payload));
  
  function redactSensitive(obj: Record<string, unknown>, path = ''): void {
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
      
      if (isSensitive) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redactSensitive(obj[key] as Record<string, unknown>, `${path}.${key}`);
      }
    }
  }

  redactSensitive(sanitized);
  return sanitized;
}

// Log webhook event to audit table with sanitized payload
async function logAuditEvent(
  supabase: SupabaseClient,
  eventType: string | null,
  transmissionId: string | null,
  status: string,
  payload: unknown,
  clientIp: string | null,
  notes: string | null
): Promise<void> {
  try {
    // Sanitize payload before storing to remove sensitive data
    const sanitizedPayload = sanitizePayload(payload);
    
    await supabase.from("webhook_audit_log").insert({
      event_type: eventType,
      transmission_id: transmissionId,
      status,
      request_payload: sanitizedPayload,
      client_ip: clientIp,
      notes
    });
  } catch (err) {
    console.error("Failed to log audit event:", err);
  }
}

// Verify PayPal webhook signature
async function verifyWebhookSignature(
  webhookId: string,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  authAlgo: string,
  transmissionSig: string,
  webhookEventBody: string
): Promise<boolean> {
  try {
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = Deno.env.get("PAYPAL_SECRET");
    
    if (!paypalClientId || !paypalSecret) {
      console.error("PayPal credentials not configured");
      return false;
    }

    // Get access token
    const authResponse = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${paypalClientId}:${paypalSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!authResponse.ok) {
      console.error("Failed to get PayPal access token");
      return false;
    }

    const { access_token } = await authResponse.json();

    // Verify signature with PayPal
    const verifyResponse = await fetch("https://api-m.paypal.com/v1/notifications/verify-webhook-signature", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        webhook_id: webhookId,
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_event: JSON.parse(webhookEventBody)
      })
    });

    if (!verifyResponse.ok) {
      console.error("PayPal verification request failed");
      return false;
    }

    const verifyResult = await verifyResponse.json();
    return verifyResult.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabaseClient();
  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

  try {
    const body = await req.text();
    const payload = JSON.parse(body);
    const eventType = payload.event_type || null;
    
    // Extract PayPal headers
    const transmissionId = req.headers.get("paypal-transmission-id");
    const transmissionTime = req.headers.get("paypal-transmission-time");
    const transmissionSig = req.headers.get("paypal-transmission-sig");
    const certUrl = req.headers.get("paypal-cert-url");
    const authAlgo = req.headers.get("paypal-auth-algo");
    
    const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");

    // Check for missing headers
    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
      await logAuditEvent(supabase, eventType, transmissionId, "Invalid Request", payload, clientIp, "Missing required PayPal headers");
      return new Response(JSON.stringify({ error: "Missing PayPal headers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Replay protection
    if (processedTransmissions.has(transmissionId)) {
      await logAuditEvent(supabase, eventType, transmissionId, "Replay", payload, clientIp, "Duplicate transmission ID detected");
      return new Response(JSON.stringify({ error: "Replay detected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check webhook ID configuration
    if (!webhookId) {
      await logAuditEvent(supabase, eventType, transmissionId, "Config Error", payload, clientIp, "PAYPAL_WEBHOOK_ID not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify signature
    const isValid = await verifyWebhookSignature(
      webhookId,
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      body
    );

    if (!isValid) {
      await logAuditEvent(supabase, eventType, transmissionId, "Invalid Signature", payload, clientIp, "Signature verification failed");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if event is supported
    if (!SUPPORTED_EVENTS.includes(eventType)) {
      await logAuditEvent(supabase, eventType, transmissionId, "Ignored", payload, clientIp, `Unsupported event type: ${eventType}`);
      return new Response(JSON.stringify({ message: "Event ignored" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Mark as processed (replay protection)
    processedTransmissions.add(transmissionId);
    setTimeout(() => processedTransmissions.delete(transmissionId), REPLAY_WINDOW_MS);

    // Extract payment details
    const resource = payload.resource || {};
    const orderID = resource.id || payload.id;
    const payerEmail = resource.payer?.email_address || resource.payer?.payer_info?.email;
    const amount = resource.amount?.total || resource.amount?.value;
    const currency = resource.amount?.currency || resource.amount?.currency_code;

    console.log("Processing payment:", { orderID, payerEmail, amount, currency, eventType });

    // Update transaction if exists
    if (orderID) {
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("paypal_order_id", orderID);
      
      if (updateError) {
        console.error("Failed to update transaction:", updateError);
      }
    }

    // Log successful event
    await logAuditEvent(supabase, eventType, transmissionId, "Accepted", payload, clientIp, `Payment processed: ${orderID}`);

    return new Response(JSON.stringify({ success: true, orderID }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook processing error:", error);
    await logAuditEvent(supabase, null, null, "Error", null, clientIp, `Processing error: ${errorMessage}`);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
