// Shared CORS configuration for BH KONVER edge functions
// Strict origin allowlist — exact match or strict hostname suffix only.

const ALLOWED_ORIGINS = new Set<string>([
  "https://bh-konver.lovable.app",
  "https://bhkonver.ba",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
]);

const ALLOWED_HOST_SUFFIXES = [
  ".lovableproject.com",
  ".lovable.app",
  ".lovable.dev",
  ".supabase.co",
];

const DEFAULT_ORIGIN = "https://bh-konver.lovable.app";

export function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  if (!origin) return DEFAULT_ORIGIN;

  if (ALLOWED_ORIGINS.has(origin)) return origin;

  try {
    const url = new URL(origin);
    const host = url.hostname;
    const isHttps = url.protocol === "https:";
    const isLocal = host === "localhost" || host === "127.0.0.1";

    if (!isHttps && !isLocal) return DEFAULT_ORIGIN;

    if (ALLOWED_HOST_SUFFIXES.some((s) => host === s.slice(1) || host.endsWith(s))) {
      return origin;
    }
  } catch {
    // fall through
  }

  return DEFAULT_ORIGIN;
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(req);

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

// For webhooks that need wildcard CORS (PayPal, Stripe)
export const webhookCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};
