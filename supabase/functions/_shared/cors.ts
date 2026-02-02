// Shared CORS configuration for BH KONVER edge functions
// Supports Lovable preview & published domains for both development and production

export function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  
  // Allow all Lovable-related domains (preview, published, dev)
  // Pattern examples:
  //   https://id-preview--<uuid>.lovableproject.com (preview)
  //   https://<uuid>.lovableproject.com (preview fallback)
  //   https://bh-konver.lovable.app (published)
  //   https://*.lovable.app, https://*.lovable.dev (Lovable infra)
  if (
    origin.includes('.lovableproject.com') ||
    origin.includes('.lovable.app') || 
    origin.includes('.lovable.dev') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('supabase.co')
  ) {
    return origin;
  }
  
  // Default to production origin if no match
  return "https://bh-konver.lovable.app";
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(req);
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
}

// For webhooks that need wildcard CORS (PayPal, Stripe)
export const webhookCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};
