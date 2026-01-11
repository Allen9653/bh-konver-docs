import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, plan, amount, duration } = await req.json();

    console.log("Processing PayPal payment for:", { email, plan, amount });

    // PayPal API credentials - Alen Jusufovic: alenjusufovic@yahoo.com
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
    const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Use api-m.paypal.com for production

    // Supabase client for tracking
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
        application_context: {
          brand_name: "BH KONVER",
          return_url: `${req.headers.get("origin")}/payment-success?email=${encodeURIComponent(email)}&plan=${plan}&token={TOKEN}`,
          cancel_url: `${req.headers.get("origin")}/payment-canceled`,
        },
      }),
    });

    const orderData = await orderResponse.json();
    
    if (orderData.id) {
      const approvalUrl = orderData.links.find((link: any) => link.rel === "approve")?.href;
      
      // Look up user_id from profiles by email
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      
      // Save transaction to database for tracking
      const { error: insertError } = await supabase.from("transactions").insert({
        user_email: email,
        user_id: profileData?.id || null, // Include user_id if user exists
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
