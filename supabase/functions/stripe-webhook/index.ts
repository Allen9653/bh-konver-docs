import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  // @ts-ignore
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

// Create Supabase client with service role for transaction updates
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Calculate expiration based on plan
const calculateExpiration = (planId: string): Date => {
  const now = new Date();
  switch (planId) {
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response(
      JSON.stringify({ error: "Missing signature or webhook secret" }),
      { status: 400 }
    );
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    const supabase = getSupabaseClient();

    console.log("Webhook event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email || session.metadata?.email;
        const planId = session.metadata?.plan_id || "24h";
        const userId = session.metadata?.user_id;
        
        console.log("Payment completed:", { 
          sessionId: session.id, 
          email: email ? "***" : null, // Mask email in logs
          planId 
        });

        if (email) {
          // Check if there's a pending transaction to update
          const { data: existingTx, error: fetchError } = await supabase
            .from("transactions")
            .select("id")
            .eq("user_email", email)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) {
            console.error("Failed to fetch transaction:", fetchError.message);
          }

          if (existingTx) {
            // Update existing pending transaction
            const { error: updateError } = await supabase
              .from("transactions")
              .update({
                status: "completed",
                expires_at: calculateExpiration(planId).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("id", existingTx.id);

            if (updateError) {
              console.error("Failed to update transaction:", updateError.message);
            } else {
              console.log("Transaction updated successfully:", existingTx.id);
            }
          } else {
            // Create new transaction record
            const { error: insertError } = await supabase
              .from("transactions")
              .insert({
                user_email: email,
                user_id: userId || null,
                status: "completed",
                amount: (session.amount_total || 0) / 100,
                currency: session.currency?.toUpperCase() || "USD",
                plan_id: planId,
                expires_at: calculateExpiration(planId).toISOString()
              });

            if (insertError) {
              console.error("Failed to create transaction:", insertError.message);
            } else {
              console.log("Transaction created successfully for:", session.id);
            }
          }
        } else {
          console.warn("No email found in session, cannot update transaction");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        // Log failure without sensitive details
        console.error("Failure reason:", paymentIntent.last_payment_error?.code || "unknown");
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("Charge succeeded:", charge.id);
        // Amount logged without sensitive customer data
        console.log("Amount:", charge.amount / 100, charge.currency?.toUpperCase());
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
