import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginCredentialsRequest {
  type: "login_credentials";
  email: string;
  username: string;
  password: string;
  expiresAt: string;
}

interface DocumentShareRequest {
  type: "document_share";
  recipientEmail: string;
  senderName: string;
  documentName: string;
  documentUrl?: string;
}

interface CustomEmailRequest {
  type: "custom";
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

type EmailRequest = LoginCredentialsRequest | DocumentShareRequest | CustomEmailRequest;

async function sendEmail(to: string[], subject: string, html: string, from?: string, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: from || "BH Konver <onboarding@resend.dev>",
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Resend API error:", errorText);
    throw new Error(`Failed to send email: ${errorText}`);
  }

  return res.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const body: EmailRequest = await req.json();
    let emailResponse;

    switch (body.type) {
      case "login_credentials": {
        const { email, username, password, expiresAt } = body;
        
        console.log(`Sending login credentials to ${email}`);
        
        emailResponse = await sendEmail(
          [email],
          "Vaši login podaci za BH Konver",
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e3a8a;">BH Konver</h1>
                <p style="color: #64748b;">Vaš digitalni alat za konverziju</p>
              </div>
              
              <h2 style="color: #1e3a8a;">Dobrodošli!</h2>
              <p>Hvala vam na kupovini. Evo vaših pristupnih podataka:</p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Email:</strong> ${username}</p>
                <p><strong>Lozinka:</strong> ${password}</p>
                <p><strong>Važi do:</strong> ${expiresAt}</p>
              </div>
              
              <p style="color: #ef4444; font-weight: bold;">Važno: Sačuvajte ove podatke na sigurnom mjestu!</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 12px;">
                  © 2025 BH Konver | Razvijeno u Bosni i Hercegovini, Zenica 72 000<br>
                  Vlasništvo B&H Assistant | Spajamo Kulture Stvaramo Šanse
                </p>
              </div>
            </div>
          `
        );

        // Notify admin about new payment
        await sendEmail(
          ["info@bh-assistant.ba"],
          `Nova uplata - ${email}`,
          `
            <h2>Nova uplata primljena</h2>
            <p><strong>Korisnik:</strong> ${email}</p>
            <p><strong>Važi do:</strong> ${expiresAt}</p>
            <p>Login kredencijali su poslani korisniku.</p>
          `
        );

        console.log("Login credentials and admin notification sent successfully");
        break;
      }

      case "document_share": {
        const { recipientEmail, senderName, documentName, documentUrl } = body;
        
        console.log(`Sharing document ${documentName} with ${recipientEmail}`);
        
        emailResponse = await sendEmail(
          [recipientEmail],
          `${senderName} vam je poslao dokument: ${documentName}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e3a8a;">BH Konver</h1>
              </div>
              
              <h2>Novi dokument za vas!</h2>
              <p><strong>${senderName}</strong> vam je poslao konvertirani dokument:</p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Naziv dokumenta:</strong> ${documentName}</p>
                ${documentUrl ? `<a href="${documentUrl}" style="display: inline-block; background: #1e3a8a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Preuzmi dokument</a>` : ''}
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 12px;">
                  © 2025 BH Konver | Razvijeno u Bosni i Hercegovini, Zenica 72 000<br>
                  Vlasništvo B&H Assistant | Spajamo Kulture Stvaramo Šanse
                </p>
              </div>
            </div>
          `
        );

        // Notify admin about document share
        await sendEmail(
          ["info@bh-assistant.ba"],
          `Dokument podijeljen - ${documentName}`,
          `
            <h2>Dokument podijeljen</h2>
            <p><strong>Od:</strong> ${senderName}</p>
            <p><strong>Prima:</strong> ${recipientEmail}</p>
            <p><strong>Dokument:</strong> ${documentName}</p>
          `
        );

        console.log("Document share email sent successfully");
        break;
      }

      case "custom": {
        const { to, subject, html, from, replyTo } = body;
        
        console.log(`Sending custom email to ${to}`);
        
        emailResponse = await sendEmail([to], subject, html, from, replyTo);

        console.log("Custom email sent successfully");
        break;
      }

      default:
        throw new Error(`Unknown email type`);
    }

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
