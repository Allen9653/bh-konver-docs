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
    const { email, plan } = await req.json();

    console.log("Capturing PayPal payment for:", { email, plan });

    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
    const PAYPAL_API = "https://api-m.sandbox.paypal.com";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the pending transaction order ID
    const { data: pendingTx } = await supabase
      .from("transactions")
      .select("paypal_order_id")
      .eq("user_email", email)
      .eq("plan_id", plan)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const orderId = pendingTx?.paypal_order_id;
    if (!orderId) {
      throw new Error("No pending transaction found");
    }

    console.log("Found order ID:", orderId);

    // Supabase client already created above

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
    console.log("Capture response:", captureData);

    if (captureData.status === "COMPLETED") {
      const payerId = captureData.payer?.payer_id;

      // Check for existing user first
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      let userId = existingProfile?.id;

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

      if (!existingProfile) {
        // Create new auth user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: tempPassword,
          email_confirm: true,
        });

        if (createError) {
          console.error("Error creating user:", createError);
        } else {
          console.log("User created successfully:", newUser.user?.id);
          userId = newUser.user?.id;
        }
      }

      // Update transaction status with user_id
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ 
          status: "completed",
          paypal_payer_id: payerId,
          user_id: userId || null, // Link transaction to user
          updated_at: new Date().toISOString()
        })
        .eq("paypal_order_id", orderId);

      // Send login credentials via email using edge function
      const sendEmailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          type: "login_credentials",
          to: email,
          username: email,
          password: tempPassword,
          plan: plan,
        }),
      });

      if (!sendEmailResponse.ok) {
        console.error("Failed to send credentials email");
      }

      // Notify admin about the payment
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
          message: `Nova uplata primljena!\n\nEmail korisnika: ${email}\nPaket: ${plan}\nPayPal Order ID: ${orderId}\nDatum: ${new Date().toLocaleString("bs-BA")}`,
        }),
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Payment captured and credentials sent" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error(`Payment capture failed: ${captureData.status}`);
    }

  } catch (error) {
    console.error("Capture payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
