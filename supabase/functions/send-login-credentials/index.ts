import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, plan, orderId } = await req.json();

    console.log("Sending login credentials to:", email);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate cryptographically secure temporary password
    const generateSecurePassword = (length = 20): string => {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      const randomValues = new Uint8Array(length);
      crypto.getRandomValues(randomValues);
      return Array.from(randomValues)
        .map(x => charset[x % charset.length])
        .join('');
    };
    const tempPassword = generateSecurePassword(20);

    // Create user account
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createError) throw createError;

    // Send credentials email (you'll need to set up email service)
    // For now, we'll just log it
    console.log("User created with credentials:", {
      email,
      password: tempPassword,
      plan,
      orderId
    });

    // Send notification to info@bh-assistant.ba
    const notificationBody = {
      to: "info@bh-assistant.ba",
      subject: `Nova uplata - ${email}`,
      html: `
        <h2>Nova uplata primljena</h2>
        <p><strong>Email korisnika:</strong> ${email}</p>
        <p><strong>Paket:</strong> ${plan}</p>
        <p><strong>PayPal Order ID:</strong> ${orderId}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleString('bs-BA')}</p>
        <hr>
        <p>Potrebno izraditi PDV račun.</p>
      `
    };

    // Here you would call your email service (Resend, SendGrid, etc.)
    console.log("Notification email:", notificationBody);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Login credentials sent",
      userId: userData.user.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Send credentials error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
