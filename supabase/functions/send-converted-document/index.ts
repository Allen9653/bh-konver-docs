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
    const { recipientEmail, documentUrl, fileName } = await req.json();

    console.log("Sending document to:", recipientEmail);

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll just log it
    const emailBody = {
      to: recipientEmail,
      subject: `BH KONVER - Konvertirani dokument: ${fileName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">Vaš konvertirani dokument je spreman</h2>
          <p>Pozdrav,</p>
          <p>Vaš dokument <strong>${fileName}</strong> je uspješno konvertiran i spreman za preuzimanje.</p>
          <p style="margin: 30px 0;">
            <a href="${documentUrl}" 
               style="background-color: #0066cc; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Preuzmi dokument
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Hvala što koristite BH KONVER - Vaš digitalni alat za konverziju.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            BH KONVER | info@bh-assistant.ba
          </p>
        </div>
      `
    };

    console.log("Email to send:", emailBody);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Document email sent"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Send document error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
