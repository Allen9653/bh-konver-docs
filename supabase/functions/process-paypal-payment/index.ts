import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { PLAN_PRICES } from "../_shared/plans.ts";

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
      console.error("Payment processing attempted without authentication");
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error during payment processing:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Payment processing initiated by user: ${user.email}`);

    const { email, plan, duration } = await req.json();

    // SECURITY: Enforce server-side pricing — never trust client-supplied amount.
    // PLAN_PRICES is imported from _shared/plans.ts so process/capture stay in sync.
    const amount = PLAN_PRICES[plan as string];
    if (!amount) {
      console.error(`Invalid plan requested: ${plan}`);
      return new Response(
        JSON.stringify({ error: "Invalid plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate that the authenticated user matches the payment email
    if (user.email !== email) {
      console.error(`Email mismatch: authenticated=${user.email}, requested=${email}`);
      return new Response(
        JSON.stringify({ error: "Payment email must match authenticated user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing PayPal payment for:", { email, plan, amount });

    // PayPal API credentials
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
    const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "sandbox";
    const PAYPAL_API = PAYPAL_MODE === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // Supabase admin client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    if (!accessToken) {
      throw new Error("Failed to get PayPal access token");
    }

    // Calculate expiration date based on plan
    let expiresAt: Date;
    switch (plan) {
      case "24h":
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        break;
      case "7d":
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "48h":
        expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        break;
      case "monthly":
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "EUR", // PayPal doesn't support BAM, use EUR
            value: amount,
          },
          description: `BH KONVER - ${plan} paket (${duration})`,
          payee: {
            email_address: "alenjusufovic@yahoo.com", // Payment receiver
          },
        }],
        application_context: (() => {
          const ALLOWED_ORIGINS = [
            "https://bh-konver.lovable.app",
            "https://bhkonver.ba",
            "https://id-preview--2bb502b3-f541-4731-a607-bafa037ec71a.lovable.app",
          ];
          const reqOrigin = req.headers.get("origin") ?? "";
          const safeOrigin = ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : "https://bh-konver.lovable.app";
          return {
            brand_name: "BH KONVER",
            return_url: `${safeOrigin}/payment-success?email=${encodeURIComponent(email)}&plan=${plan}&token={TOKEN}`,
            cancel_url: `${safeOrigin}/payment-canceled`,
          };
        })(),
      }),
    });

    const orderData = await orderResponse.json();
    
    if (orderData.id) {
      const approvalUrl = orderData.links.find((link: any) => link.rel === "approve")?.href;
      
      // Save transaction to database for tracking (use authenticated user's ID)
      const { error: insertError } = await supabase.from("transactions").insert({
        user_email: email,
        user_id: user.id,
        plan_id: plan,
        amount: parseFloat(amount),
        currency: "BAM",
        paypal_order_id: orderData.id,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      });

      if (insertError) {
        console.error("Error saving transaction:", insertError);
      } else {
        console.log("Transaction saved successfully:", orderData.id);
      }
      
      return new Response(JSON.stringify({ 
        orderId: orderData.id,
        approvalUrl 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.error("PayPal order creation failed:", orderData);
      throw new Error("Failed to create PayPal order");
    }

  } catch (error) {
    console.error("PayPal payment error:", error);
    const corsHeaders = getCorsHeaders(req);
    // Sanitize error message - don't expose internal details
    return new Response(JSON.stringify({ error: "Greška pri obradi plaćanja. Molimo pokušajte ponovo." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
