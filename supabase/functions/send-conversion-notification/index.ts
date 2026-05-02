import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface NotificationRequest {
  userEmail: string;
  fileName: string;
  originalFormat: string;
  targetFormat: string;
  downloadUrl?: string;
  status: "completed" | "failed";
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "BH Konver <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Verify user authentication - sending notifications requires login
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Notification attempted without authentication");
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error during notification:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Notification initiated by user: ${user.email}`);
    const { 
      userEmail, 
      fileName, 
      originalFormat, 
      targetFormat, 
      downloadUrl, 
      status 
    }: NotificationRequest = await req.json();

    if (!userEmail || !fileName) {
      throw new Error("Missing required fields: userEmail and fileName");
    }

    // Validate that the authenticated user matches the notification email
    if (user.email !== userEmail) {
      console.error(`Email mismatch: authenticated=${user.email}, requested=${userEmail}`);
      return new Response(
        JSON.stringify({ error: "Notification email must match authenticated user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending conversion notification to ${userEmail}...`);

    const isSuccess = status === "completed";

    const escapeHtml = (s: unknown) =>
      String(s ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const safeFileName = escapeHtml(fileName);
    const safeOriginal = escapeHtml(originalFormat);
    const safeTarget = escapeHtml(targetFormat);
    const safeUserEmail = escapeHtml(userEmail);
    let safeDownloadHref = "";
    if (downloadUrl) {
      try {
        const u = new URL(downloadUrl);
        if (u.protocol === "https:" || u.protocol === "http:") {
          safeDownloadHref = escapeHtml(u.toString());
        }
      } catch { /* ignore invalid url */ }
    }
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .success { background: #dcfce7; color: #166534; }
          .failed { background: #fee2e2; color: #991b1b; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 BH Konver</h1>
            <p>Obavijest o konverziji</p>
          </div>
          <div class="content">
            <h2>${isSuccess ? "✅ Konverzija uspješna!" : "❌ Konverzija nije uspjela"}</h2>
            
            <span class="status-badge ${isSuccess ? 'success' : 'failed'}">
              ${isSuccess ? 'Završeno' : 'Greška'}
            </span>
            
            <div class="details">
              <p><strong>Fajl:</strong> ${safeFileName}</p>
              <p><strong>Konverzija:</strong> ${safeOriginal.toUpperCase()} → ${safeTarget.toUpperCase()}</p>
              <p><strong>Vrijeme:</strong> ${new Date().toLocaleString('bs-BA')}</p>
            </div>
            
            ${isSuccess && safeDownloadHref ? `
              <a href="${safeDownloadHref}" class="button">📥 Preuzmi konvertovani fajl</a>
            ` : ''}
            
            ${!isSuccess ? `
              <p>Molimo pokušajte ponovo ili kontaktirajte podršku ako problem potraje.</p>
            ` : ''}
            
            <div class="warning">
              <strong>⚠️ Važno:</strong> Svi dokumenti se automatski brišu svakog dana u 10:00h radi vaše sigurnosti i privatnosti. Preuzmite vaš fajl što prije!
            </div>
          </div>
          <div class="footer">
            <p>© 2025 BH Konver | Razvijeno u Bosni i Hercegovini, Zenica 72 000</p>
            <p>Vlasništvo B&H Assistant</p>
            <p><em>Spajamo Kulture Stvaramo Šanse</em></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await sendEmail(
      userEmail,
      isSuccess 
        ? `✅ Konverzija završena: ${fileName}` 
        : `❌ Konverzija nije uspjela: ${fileName}`,
      emailHtml
    );

    console.log("Email sent successfully:", emailResponse);

    // Also notify admin about all conversions
    await sendEmail(
      "info@bh-assistant.ba",
      `[BH Konver] Nova konverzija: ${fileName}`,
      `
        <h2>Nova konverzija</h2>
        <p><strong>Korisnik:</strong> ${userEmail}</p>
        <p><strong>Fajl:</strong> ${fileName}</p>
        <p><strong>Konverzija:</strong> ${originalFormat} → ${targetFormat}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Vrijeme:</strong> ${new Date().toISOString()}</p>
      `
    );

    console.log("Admin notification sent");

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Notification error:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Greška pri slanju notifikacije. Molimo pokušajte ponovo." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});