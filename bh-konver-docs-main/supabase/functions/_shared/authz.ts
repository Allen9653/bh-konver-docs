// Shared authentication + paywall + storage helpers for BH KONVER conversion endpoints.
// Keeps split-pdf, html-to-pdf and html-to-docx behaviour consistent.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const SIGNED_URL_TTL_SECONDS = 900; // 15 minutes (privacy policy)
export const STORAGE_BUCKET = "user-documents";

export type ApiError = { status: "error"; error: string; code: string };

export function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(
  message: string,
  code: string,
  status: number,
  corsHeaders: Record<string, string>,
  extra: Record<string, unknown> = {},
): Response {
  return jsonResponse({ status: "error", error: message, code, ...extra }, status, corsHeaders);
}

export type AuthorizedContext = {
  userId: string;
  serviceClient: SupabaseClient;
};

/**
 * Verifies the JWT and enforces the subscription paywall (admins bypass).
 * Returns either an authorized context or a ready-to-send error Response.
 */
export async function authorizeRequest(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<{ context: AuthorizedContext } | { response: Response }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return {
      response: errorResponse(
        "Morate biti prijavljeni za korištenje ove konverzije.",
        "UNAUTHENTICATED",
        401,
        corsHeaders,
      ),
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

  if (authError || !user) {
    console.error("Auth failed:", authError?.message);
    return {
      response: errorResponse(
        "Neispravna prijava. Molimo prijavite se ponovo.",
        "INVALID_SESSION",
        401,
        corsHeaders,
      ),
    };
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  const { data: isAdmin } = await serviceClient.rpc("check_user_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (isAdmin !== true) {
    const now = new Date().toISOString();
    const { data: activeSub } = await serviceClient
      .from("transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("expires_at", now)
      .limit(1)
      .maybeSingle();

    if (!activeSub) {
      return {
        response: errorResponse(
          "Potrebna je aktivna pretplata za korištenje ove konverzije. Nadogradite svoj plan.",
          "SUBSCRIPTION_REQUIRED",
          402,
          corsHeaders,
        ),
      };
    }
  }

  return { context: { userId: user.id, serviceClient } };
}

/** Uploads a generated artifact to the private bucket and returns a short-lived signed URL. */
export async function storeResult(
  client: SupabaseClient,
  userId: string,
  filename: string,
  data: Uint8Array | ArrayBuffer,
  contentType: string,
): Promise<{ file_url: string; storage_path: string }> {
  const storagePath = `${userId}/converted/${crypto.randomUUID()}_${filename}`;

  const { error: uploadError } = await client.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, data, { contentType, upsert: true });

  if (uploadError) {
    throw new Error(`STORAGE_UPLOAD_FAILED: ${uploadError.message}`);
  }

  const { data: signed, error: signError } = await client.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (signError || !signed?.signedUrl) {
    throw new Error(`SIGNED_URL_FAILED: ${signError?.message ?? "unknown"}`);
  }

  return { file_url: signed.signedUrl, storage_path: storagePath };
}

/** Registers the produced artifact for the daily cleanup purge. */
export async function flagForCleanup(client: SupabaseClient, userId: string): Promise<void> {
  try {
    await client.from("cleanup_jobs").insert({ user_id: userId });
  } catch (error) {
    console.warn("Cleanup flag failed (non-fatal):", error);
  }
}
