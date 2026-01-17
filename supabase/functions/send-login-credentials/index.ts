import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, plan, orderId, expiresAt } = await req.json();

    console.log("Creating user account with magic link for:", email);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const appUrl = Deno.env.get("APP_URL") || "https://bh-konver.lovable.app";

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // User already exists - generate magic link for existing user
      console.log("User already exists, generating magic link");
      
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${appUrl}/success`
        }
      });

      if (linkError) throw linkError;

      const magicLink = linkData.properties?.action_link;
      
      // SECURITY: Never log magic links - only log non-sensitive metadata
      console.log("Magic link generated for existing user:", {
        email,
        plan,
        orderId,
        userId: existingUser.id,
        createdAt: new Date().toISOString()
      });

      return new Response(JSON.stringify({ 
        success: true,
        message: "Magic link generated for existing user",
        userId: existingUser.id,
        magicLink: magicLink,
        expiresAt: expiresAt
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create new user account without password (passwordless)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createError) throw createError;

    // Generate magic link for the new user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${appUrl}/success`
      }
    });

    if (linkError) {
      console.error("Error generating magic link:", linkError);
      throw linkError;
    }

    const magicLink = linkData.properties?.action_link;

    // SECURITY: Never log magic links - only log non-sensitive metadata
    console.log("User account created with magic link:", {
      email,
      plan,
      orderId,
      userId: userData.user.id,
      createdAt: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "User created with magic link",
      userId: userData.user.id,
      magicLink: magicLink,
      expiresAt: expiresAt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Send credentials error:", error);
    const corsHeaders = getCorsHeaders(req);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});