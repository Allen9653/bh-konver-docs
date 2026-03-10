import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

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

      // Only admins can trigger credential sending for other users
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
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

    console.log("Processing magic link request for:", email);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const appUrl = Deno.env.get("APP_URL") || "https://bh-konver.lovable.app";

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log("User already exists, generating magic link for:", email);
    } else {
      // Create new user account without password (passwordless)
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = userData.user.id;
      console.log("New user created:", email);
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
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
          email: email,
          magicLink: magicLink,
          expiresAt: expiresAt || new Date().toISOString(),
        }),
      });

      if (!sendEmailResponse.ok) {
        console.error("Failed to send magic link email");
      }
    }

    console.log("Magic link sent via email for user:", { email, plan, orderId, userId });

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
