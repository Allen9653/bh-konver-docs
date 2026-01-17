import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify user authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Payment capture attempted without authentication");
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error during payment capture:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, plan } = await req.json();

    // Validate that the authenticated user matches the payment email
    if (user.email !== email) {
      console.error(`Email mismatch: authenticated=${user.email}, requested=${email}`);
      return new Response(
        JSON.stringify({ error: "Payment email must match authenticated user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Capturing PayPal payment for:", { email, plan, userId: user.id });

    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
    const PAYPAL_API = "https://api-m.sandbox.paypal.com";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the pending transaction order ID
    const { data: pendingTx } = await supabase
      .from("transactions")
      .select("paypal_order_id, expires_at")
      .eq("user_email", email)
      .eq("user_id", user.id) // Ensure transaction belongs to authenticated user
      .eq("plan_id", plan)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const orderId = pendingTx?.paypal_order_id;
    if (!orderId) {
      throw new Error("No pending transaction found for this user");
    }

    console.log("Found order ID:", orderId);

    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Capture the order
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const captureData = await captureResponse.json();
    console.log("Capture response status:", captureData.status);

    if (captureData.status === "COMPLETED") {
      const payerId = captureData.payer?.payer_id;

      // Update transaction status
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ 
          status: "completed",
          paypal_payer_id: payerId,
          updated_at: new Date().toISOString()
        })
        .eq("paypal_order_id", orderId)
        .eq("user_id", user.id); // Ensure we only update user's own transaction

      if (updateError) {
        console.error("Error updating transaction:", updateError);
      }

      // Send confirmation email to user (using service role for internal call)
      const sendEmailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          type: "login_credentials",
          email: email,
          username: email,
          password: "Koristite postojeću lozinku", // User already has account
          expiresAt: pendingTx?.expires_at || new Date().toISOString(),
        }),
      });

      if (!sendEmailResponse.ok) {
        console.error("Failed to send confirmation email");
      }

      // Notify admin about the payment (no sensitive data)
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          type: "custom",
          to: "info@bh-assistant.ba",
          subject: `Nova uplata - ${plan}`,
          html: `
            <h2>Nova uplata primljena!</h2>
            <p><strong>Korisnik:</strong> ${email}</p>
            <p><strong>Paket:</strong> ${plan}</p>
            <p><strong>PayPal Order ID:</strong> ${orderId}</p>
            <p><strong>Datum:</strong> ${new Date().toLocaleString("bs-BA")}</p>
          `,
        }),
      });

      console.log(`Payment captured successfully for user: ${email}`);

      return new Response(JSON.stringify({
        success: true,
        message: "Payment captured successfully" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error(`Payment capture failed: ${captureData.status}`);
    }

  } catch (error) {
    console.error("Capture payment error:", error);
    const corsHeaders = getCorsHeaders(req);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
