import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // PayPal API credentials
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
    const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Use api-m.paypal.com for production

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
        }],
        application_context: {
          brand_name: "BH KONVER",
          return_url: `${req.headers.get("origin")}/payment-success?email=${encodeURIComponent(email)}&plan=${plan}`,
          cancel_url: `${req.headers.get("origin")}/payment-canceled`,
        },
      }),
    });

    const orderData = await orderResponse.json();
    
    if (orderData.id) {
      const approvalUrl = orderData.links.find((link: any) => link.rel === "approve")?.href;
      
      return new Response(JSON.stringify({ 
        orderId: orderData.id,
        approvalUrl 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
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
