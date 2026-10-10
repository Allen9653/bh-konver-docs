import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TARGET_WINDOW_MINUTES = 15;
const TARGET_MAX_ATTEMPTS = 3;
const REQUESTER_WINDOW_MINUTES = 15;
const REQUESTER_MAX_ATTEMPTS = 10;

function getRequestIp(req: Request) {
  return req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? null;
}

async function logCredentialAttempt(
  supabaseAdmin: ReturnType<typeof createClient>,
  payload: {
    requesterUserId?: string | null;
    targetEmail: string;
    plan?: string | null;
    orderId?: string | null;
    outcome: string;
    requestIp?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  },
) {
  const { error } = await supabaseAdmin.from("credential_send_audit").insert({
    requester_user_id: payload.requesterUserId ?? null,
    target_email: payload.targetEmail,
    plan: payload.plan ?? null,
    order_id: payload.orderId ?? null,
    outcome: payload.outcome,
    request_ip: payload.requestIp ?? null,
    user_agent: payload.userAgent ?? null,
    metadata: payload.metadata ?? null,
  });

  if (error) {
    console.error("Failed to write credential_send_audit row:", error);
  }
}

async function enforceAbuseProtection(
  supabaseAdmin: ReturnType<typeof createClient>,
  requesterUserId: string | null,
  targetEmail: string,
) {
  const now = Date.now();
  const targetWindowStart = new Date(now - TARGET_WINDOW_MINUTES * 60 * 1000).toISOString();
  const requesterWindowStart = new Date(now - REQUESTER_WINDOW_MINUTES * 60 * 1000).toISOString();

  const [{ count: targetCount, error: targetError }, requesterResult] = await Promise.all([
    supabaseAdmin
      .from("credential_send_audit")
      .select("id", { count: "exact", head: true })
      .eq("target_email", targetEmail)
      .gte("created_at", targetWindowStart),
    requesterUserId
      ? supabaseAdmin
          .from("credential_send_audit")
          .select("id", { count: "exact", head: true })
          .eq("requester_user_id", requesterUserId)
          .gte("created_at", requesterWindowStart)
      : Promise.resolve({ count: 0, error: null }),
  ]);

  if (targetError) throw targetError;
  if (requesterResult.error) throw requesterResult.error;

  if ((targetCount ?? 0) >= TARGET_MAX_ATTEMPTS) {
    return {
      allowed: false,
      reason: "target_email_limit",
      details: { windowMinutes: TARGET_WINDOW_MINUTES, maxAttempts: TARGET_MAX_ATTEMPTS },
    };
  }

  if ((requesterResult.count ?? 0) >= REQUESTER_MAX_ATTEMPTS) {
    return {
      allowed: false,
      reason: "requester_limit",
      details: { windowMinutes: REQUESTER_WINDOW_MINUTES, maxAttempts: REQUESTER_MAX_ATTEMPTS },
    };
  }

  return { allowed: true as const };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const requestIp = getRequestIp(req);
    const userAgent = req.headers.get("user-agent");

    // --- AUTH CHECK: Only authenticated users or service-role callers ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Allow service-role key (internal edge-function-to-edge-function calls)
    const isServiceRole = token === supabaseServiceKey;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    let requesterUserId: string | null = null;

    if (!isServiceRole) {
      // Validate as user JWT
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid authentication token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      requesterUserId = user.id;

      // Only admins can trigger credential sending for other users
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(
          JSON.stringify({ error: "Forbidden - admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { email, plan, orderId, expiresAt } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Unesite ispravnu email adresu." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const throttleResult = await enforceAbuseProtection(supabaseAdmin, requesterUserId, normalizedEmail);
    if (!throttleResult.allowed) {
      await logCredentialAttempt(supabaseAdmin, {
        requesterUserId,
        targetEmail: normalizedEmail,
        plan: typeof plan === "string" ? plan : null,
        orderId: typeof orderId === "string" ? orderId : null,
        outcome: "blocked",
        requestIp,
        userAgent,
        metadata: { reason: throttleResult.reason, ...throttleResult.details },
      });

      return new Response(
        JSON.stringify({ error: "Previše zahtjeva. Molimo pokušajte ponovo kasnije." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing magic link request for:", normalizedEmail);

    const appUrl = Deno.env.get("APP_URL") || "https://bh-konver.lovable.app";

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
       console.log("User already exists, generating magic link for:", normalizedEmail);
    } else {
      // Create new user account without password (passwordless)
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = userData.user.id;
      console.log("New user created:", normalizedEmail);
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: {
        redirectTo: `${appUrl}/success`
      }
    });

    if (linkError) throw linkError;

    const magicLink = linkData.properties?.action_link;

    // SECURITY: Send magic link ONLY via email — never return it in the response
    if (magicLink) {
      const sendEmailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          type: "magic_link",
          email: normalizedEmail,
          magicLink: magicLink,
          expiresAt: expiresAt || new Date().toISOString(),
        }),
      });

      if (!sendEmailResponse.ok) {
        console.error("Failed to send magic link email");
        await logCredentialAttempt(supabaseAdmin, {
          requesterUserId,
          targetEmail: normalizedEmail,
          plan: typeof plan === "string" ? plan : null,
          orderId: typeof orderId === "string" ? orderId : null,
          outcome: "email_failed",
          requestIp,
          userAgent,
          metadata: { userId },
        });
      } else {
        await logCredentialAttempt(supabaseAdmin, {
          requesterUserId,
          targetEmail: normalizedEmail,
          plan: typeof plan === "string" ? plan : null,
          orderId: typeof orderId === "string" ? orderId : null,
          outcome: existingUser ? "resent" : "created_and_sent",
          requestIp,
          userAgent,
          metadata: { userId },
        });
      }
    } else {
      await logCredentialAttempt(supabaseAdmin, {
        requesterUserId,
        targetEmail: normalizedEmail,
        plan: typeof plan === "string" ? plan : null,
        orderId: typeof orderId === "string" ? orderId : null,
        outcome: "link_generation_failed",
        requestIp,
        userAgent,
        metadata: { userId },
      });
    }

    console.log("Magic link sent via email for user:", { email: normalizedEmail, plan, orderId, userId });

    // SECURITY: Never return the magic link in the response
    return new Response(JSON.stringify({ 
      success: true,
      message: "Magic link sent via email",
      userId: userId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Send credentials error:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(JSON.stringify({ error: "Greška pri slanju pristupnih podataka." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
