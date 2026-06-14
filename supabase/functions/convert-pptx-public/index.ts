// Public PPTX → PDF conversion via Cloudmersive with IP rate limiting.
// No auth required. Limit: 3 conversions per IP per rolling hour.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const CLOUDMERSIVE_API_KEY = Deno.env.get("CLOUDMERSIVE_API_KEY");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const RATE_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours (per day)
const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

// In-memory IP -> timestamps[] (per-instance; acceptable for soft public limit).
const ipHits = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - hits[0])) / 1000);
    ipHits.set(ip, hits);
    return { allowed: false, retryAfter, remaining: 0 };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  // periodic prune
  if (ipHits.size > 5000) {
    for (const [k, v] of ipHits) {
      const fresh = v.filter((t) => now - t < WINDOW_MS);
      if (fresh.length === 0) ipHits.delete(k);
      else ipHits.set(k, fresh);
    }
  }
  return { allowed: true, retryAfter: 0, remaining: RATE_LIMIT - hits.length };
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    if (!CLOUDMERSIVE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Konverzijski servis nije konfigurisan." }),
        { status: 503, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const ip = getClientIp(req);
    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({
          error: "rate_limited",
          message:
            "Dostigli ste besplatni limit od 3 PPTX konverzije dnevno. Nadogradite na Premium za neograničenu obradu.",
          retry_after_seconds: rl.retryAfter,
          limit: RATE_LIMIT,
          window_seconds: WINDOW_MS / 1000,
        }),
        {
          status: 429,
          headers: {
            ...cors,
            "Content-Type": "application/json",
            "Retry-After": String(rl.retryAfter),
            "X-RateLimit-Limit": String(RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Nedostaje 'file' polje." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (file.size === 0) {
      return new Response(JSON.stringify({ error: "Prazna datoteka." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `Datoteka je veća od dozvoljenih ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
        }),
        { status: 413, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pptx") {
      return new Response(
        JSON.stringify({ error: "Samo .pptx datoteke su podržane." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }
    if (file.type && file.type !== PPTX_MIME) {
      return new Response(
        JSON.stringify({ error: "Nevažeći MIME tip datoteke." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const upstream = new FormData();
    upstream.append("inputFile", file, file.name);

    const cmRes = await fetch(
      "https://api.cloudmersive.com/convert/pptx/to/pdf",
      {
        method: "POST",
        headers: { Apikey: CLOUDMERSIVE_API_KEY },
        body: upstream,
      },
    );

    if (!cmRes.ok) {
      const text = await cmRes.text().catch(() => "");
      console.error("[convert-pptx-public] Cloudmersive error", cmRes.status, text);
      return new Response(
        JSON.stringify({
          error: "Konverzija nije uspjela. Pokušajte ponovo ili kontaktirajte podršku.",
        }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const pdfBytes = new Uint8Array(await cmRes.arrayBuffer());
    const outName = file.name.replace(/\.pptx$/i, ".pdf");

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outName}"`,
        "X-RateLimit-Limit": String(RATE_LIMIT),
        "X-RateLimit-Remaining": String(rl.remaining),
      },
    });
  } catch (err) {
    console.error("[convert-pptx-public] Unexpected error", err);
    return new Response(
      JSON.stringify({ error: "Neočekivana greška na serveru." }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
