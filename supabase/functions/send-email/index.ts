import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface MagicLinkRequest {
  type: "magic_link";
  email: string;
  magicLink: string;
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

interface WelcomeEmailRequest {
  type: "welcome";
  email: string;
}

type EmailRequest = MagicLinkRequest | DocumentShareRequest | CustomEmailRequest | WelcomeEmailRequest;

// HTML-escape user-supplied values before interpolating into email templates
function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Validate URL is http(s) before embedding in href to avoid javascript: schemes
function safeUrl(url: string | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "";
    return escapeHtml(u.toString());
  } catch {
    return "";
  }
}

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
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify authentication
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    console.error("Email request without authentication");
    return new Response(
      JSON.stringify({ error: "Unauthorized - authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
  
  if (authError || !user) {
    console.error("Auth error for email request:", authError);
    return new Response(
      JSON.stringify({ error: "Invalid authentication token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if caller is service role (internal call) — bypasses user-level restrictions
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const isServiceRole = !!serviceKey && token === serviceKey;

  // Check admin role for restricted email types
  const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: isAdminData } = await supabaseAdmin.rpc("check_user_role", {
    _user_id: user.id,
    _role: "admin",
  });
  const isAdmin = isAdminData === true;

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
      case "magic_link": {
        // Restrict magic_link sending to service-role or admin callers
        if (!isServiceRole && !isAdmin) {
          console.error(`Forbidden 'magic_link' email attempt by user ${user.id} (${user.email})`);
          return new Response(
            JSON.stringify({ error: "Forbidden - admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { email, magicLink, expiresAt } = body;

        // Validate magicLink is a safe http(s) URL pointing at our Supabase project
        const safeMagicLink = safeUrl(magicLink);
        if (!safeMagicLink) {
          return new Response(
            JSON.stringify({ error: "Invalid magicLink URL" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        try {
          const u = new URL(magicLink);
          const expectedHost = new URL(supabaseUrl).host;
          if (u.host !== expectedHost) {
            return new Response(
              JSON.stringify({ error: "magicLink must point to the project's auth host" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid magicLink URL" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const safeEmail = escapeHtml(email);
        const safeExpiresAt = escapeHtml(expiresAt);

        // SECURITY: Magic link is never logged - only non-sensitive metadata
        console.log(`Sending magic link to user (email: ${email}, expiresAt: ${expiresAt})`);

        emailResponse = await sendEmail(
          [email],
          "Vaš link za pristup BH Konver",
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e3a8a;">BH Konver</h1>
                <p style="color: #64748b;">Vaš digitalni alat za konverziju</p>
              </div>
              
              <h2 style="color: #1e3a8a;">Dobrodošli!</h2>
              <p>Hvala vam na kupovini. Kliknite na dugme ispod da se prijavite:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${safeMagicLink}" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Prijavite se
                </a>
              </div>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Važi do:</strong> ${safeExpiresAt}</p>
              </div>
              
              <p style="color: #ef4444; font-weight: bold;">Važno: Ovaj link je validan samo 1 sat i može se koristiti samo jednom!</p>
              <p style="color: #64748b; font-size: 14px;">Ako niste zatražili ovaj email, možete ga ignorisati.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 12px;">
                  © 2025 BH Konver | Razvijeno u Bosni i Hercegovini, Zenica 72 000<br>
                  Vlasništvo B&H Assistant | Spajamo Kulture Stvaramo Šanse
                </p>
              </div>
            </div>
          `
        );

        // Notify admin about new payment (no sensitive links in admin notification)
        await sendEmail(
          ["info@bh-assistant.ba"],
          `Nova uplata - ${email}`,
          `
            <h2>Nova uplata primljena</h2>
            <p><strong>Korisnik:</strong> ${safeEmail}</p>
            <p><strong>Važi do:</strong> ${safeExpiresAt}</p>
            <p>Magic link za pristup je poslan korisniku.</p>
          `
        );

        console.log("Magic link email sent successfully (link securely delivered)");
        break;
      }

      case "document_share": {
        const { recipientEmail, senderName, documentName, documentUrl } = body;

        // Validate that documentUrl (when present) is a Supabase Storage signed URL on this project
        let safeDocUrl = "";
        if (documentUrl) {
          try {
            const u = new URL(documentUrl);
            const expectedHost = new URL(supabaseUrl).host;
            const isSupabaseHost = u.host === expectedHost;
            const isSigned = u.pathname.includes("/storage/v1/object/sign/") &&
              u.searchParams.has("token");
            if (!isSupabaseHost || !isSigned) {
              return new Response(
                JSON.stringify({ error: "documentUrl must be a signed Supabase Storage URL" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            safeDocUrl = u.toString();
          } catch {
            return new Response(
              JSON.stringify({ error: "Invalid documentUrl" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        const safeSender = escapeHtml(senderName);
        const safeDocName = escapeHtml(documentName);
        const safeRecipient = escapeHtml(recipientEmail);
        const escapedHref = escapeHtml(safeDocUrl);

        console.log(`Sharing document from user ${user.id} to ${recipientEmail}`);

        emailResponse = await sendEmail(
          [recipientEmail],
          `${senderName} vam je poslao dokument: ${documentName}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e3a8a;">BH Konver</h1>
              </div>
              
              <h2>Novi dokument za vas!</h2>
              <p><strong>${safeSender}</strong> vam je poslao konvertirani dokument:</p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Naziv dokumenta:</strong> ${safeDocName}</p>
                ${safeDocUrl ? `<a href="${escapedHref}" style="display: inline-block; background: #1e3a8a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Preuzmi dokument</a>` : ''}
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
            <p><strong>Od:</strong> ${safeSender}</p>
            <p><strong>Prima:</strong> ${safeRecipient}</p>
            <p><strong>Dokument:</strong> ${safeDocName}</p>
          `
        );

        console.log("Document share email sent successfully");
        break;
      }

      case "custom": {
        // Restrict custom email sending to admins or internal service-role calls only
        if (!isServiceRole && !isAdmin) {
          console.error(`Forbidden 'custom' email attempt by user ${user.id} (${user.email})`);
          return new Response(
            JSON.stringify({ error: "Forbidden - admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { to, subject, html, from, replyTo } = body;

        console.log(`Sending custom email to ${to} (subject: ${subject}) by ${isServiceRole ? 'service-role' : `admin ${user.id}`}`);

        emailResponse = await sendEmail([to], subject, html, from, replyTo);

        console.log("Custom email sent successfully");
        break;
      }

      case "welcome": {
        // Restrict welcome email sending to service-role or admin callers (prevents branded email relay abuse)
        if (!isServiceRole && !isAdmin) {
          console.error(`Forbidden 'welcome' email attempt by user ${user.id} (${user.email})`);
          return new Response(
            JSON.stringify({ error: "Forbidden - admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { email } = body;
        const safeEmail = escapeHtml(email);

        console.log(`Sending welcome email to ${email}`);
        
        emailResponse = await sendEmail(
          [email],
          "Dobrodošli u BH Konver! 🎉",
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 12px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">BH Konver</h1>
                <p style="color: #e0e7ff; margin: 10px 0 0 0;">E-Alat za konverziju dokumenata</p>
              </div>
              
              <h2 style="color: #1e3a8a; text-align: center;">Dobrodošli! 🎉</h2>
              <p style="color: #374151; text-align: center; font-size: 16px;">Hvala vam na registraciji u BH Konver - vaš pouzdani partner za konverziju dokumenata.</p>
              
              <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin: 25px 0;">
                <h3 style="color: #1e3a8a; margin-top: 0;">📋 Naši paketi pretplate:</h3>
                <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <strong style="color: #1e3a8a;">24 sata</strong> - <span style="color: #059669; font-weight: bold;">2.00 BAM</span>
                  <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Idealno za brze konverzije</p>
                </div>
                <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <strong style="color: #1e3a8a;">48 sati</strong> - <span style="color: #059669; font-weight: bold;">10.00 BAM</span>
                  <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">POPULARNO</span>
                  <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Najbolja vrijednost za novac</p>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                  <strong style="color: #1e3a8a;">Mjesečna pretplata</strong> - <span style="color: #059669; font-weight: bold;">50.00 BAM</span>
                  <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Za profesionalne korisnike</p>
                </div>
              </div>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h3 style="color: #059669; margin-top: 0;">✨ Šta dobijate:</h3>
                <ul style="color: #374151; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Neograničene konverzije dokumenata</li>
                  <li style="margin-bottom: 8px;">Podrška za Word, Excel, PowerPoint, PDF</li>
                  <li style="margin-bottom: 8px;">Audio i video konverzije</li>
                  <li style="margin-bottom: 8px;">GIF kreiranje</li>
                  <li style="margin-bottom: 8px;">PDF alati (spajanje, dijeljenje, vodeni žig)</li>
                  <li>Slanje konvertiranih fajlova na email</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://bh-konver.lovable.app/#pricing" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Odaberite paket
                </a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>🎁 Besplatno:</strong> Konverter jedinica i valuta uvijek besplatni bez pretplate!
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 12px; margin-bottom: 5px;">
                  © 2025 BH Konver | Razvijeno u Bosni i Hercegovini, Zenica 72 000
                </p>
                <p style="color: #64748b; font-size: 12px; margin: 0;">
                  Vlasništvo B&H Assistant | <em>Spajamo Kulture Stvaramo Šanse</em>
                </p>
                <p style="color: #94a3b8; font-size: 11px; margin-top: 10px;">
                  📧 info@bh-assistant.ba
                </p>
              </div>
            </div>
          `
        );

        // Notify admin about new registration
        await sendEmail(
          ["info@bh-assistant.ba"],
          `Nova registracija - ${email}`,
          `
            <h2>Novi korisnik registrovan</h2>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Vrijeme:</strong> ${escapeHtml(new Date().toLocaleString('bs-BA'))}</p>
          `
        );

        console.log("Welcome email sent successfully");
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
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Greška pri slanju emaila. Molimo pokušajte ponovo." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
