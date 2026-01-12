// Shared CORS configuration for BH KONVER edge functions
// Restricts origins to prevent CSRF attacks and unauthorized API usage

const ALLOWED_ORIGINS = [
  "https://bh-konver.lovable.app",
  "https://kvuiqexsovexuyfgztwk.supabase.co",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
];

export function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  
  // Default to production origin if no match
  return ALLOWED_ORIGINS[0];
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(req);
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

// For webhooks that need wildcard CORS (PayPal, Stripe)
export const webhookCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo, stripe-signature",
};
