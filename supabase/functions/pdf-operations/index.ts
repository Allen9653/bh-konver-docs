import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const CLOUDMERSIVE_API_KEY = Deno.env.get("CLOUDMERSIVE_API_KEY");

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Verify user authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Neautorizovan pristup - potrebna prijava" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Neispravna autentifikacija" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`PDF operation requested by user: ${user.id}`);

    // --- PAYWALL CHECK: Admins bypass; otherwise require active subscription ---
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdminData } = await supabaseService.rpc('check_user_role', {
      _user_id: user.id,
      _role: 'admin',
    });
    if (isAdminData !== true) {
      const now = new Date().toISOString();
      const { data: activeSub } = await supabaseService
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('expires_at', now)
        .limit(1)
        .maybeSingle();

      if (!activeSub) {
        console.warn(`Paywall blocked: user ${user.id} has no active subscription`);
        return new Response(
          JSON.stringify({ error: 'Potrebna je aktivna pretplata za korištenje PDF alata. Nadogradite svoj plan.' }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log(`Admin bypass: user ${user.id}`);
    }

    if (!CLOUDMERSIVE_API_KEY) {
      console.error("CLOUDMERSIVE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Servis trenutno nije dostupan." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse form data
    let formData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error("Error parsing form data:", parseError);
      return new Response(
        JSON.stringify({ error: "Greška pri čitanju zahtjeva." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const operation = formData.get("operation") as string;
    console.log(`PDF operation: ${operation}`);

    // Enforce 50MB per-file size limit on every uploaded file before processing
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > MAX_FILE_SIZE) {
        console.warn(`PDF op ${operation}: file ${key} too large (${value.size} bytes)`);
        return new Response(
          JSON.stringify({ error: "Fajl je prevelik. Maksimalna veličina je 50MB." }),
          { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const operationEndpoints: Record<string, string> = {
      "remove-watermark": "https://api.cloudmersive.com/convert/edit/pdf/watermark/remove/all-watermarks",
      "compress-pdf": "https://api.cloudmersive.com/convert/edit/pdf/optimize/reduce-file-size",
      "compress-jpeg": "https://api.cloudmersive.com/image/resize/preserveAspectRatio",
      "split-pdf": "https://api.cloudmersive.com/convert/split/pdf",
      "rotate": "https://api.cloudmersive.com/convert/edit/pdf/pages/rotate/all",
    };

    // Handle add-watermark operation
    if (operation === "add-watermark") {
      const file = formData.get("file0") as File;
      const watermarkText = formData.get("watermarkText") as string;

      if (!file) {
        return new Response(
          JSON.stringify({ error: "Fajl nije priložen" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!watermarkText) {
        return new Response(
          JSON.stringify({ error: "Tekst watermark-a je obavezan" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fileBuffer = await file.arrayBuffer();

      // Build URL with query parameters for watermark settings
      const watermarkUrl = new URL("https://api.cloudmersive.com/convert/edit/pdf/watermark/insert/text");
      watermarkUrl.searchParams.set("watermarkText", watermarkText);
      watermarkUrl.searchParams.set("fontName", "Arial");
      watermarkUrl.searchParams.set("fontSize", "48");
      watermarkUrl.searchParams.set("fontColor", "#808080");
      watermarkUrl.searchParams.set("fontTransparency", "0.5");

      const response = await fetch(watermarkUrl.toString(), {
        method: "POST",
        headers: {
          "Apikey": CLOUDMERSIVE_API_KEY,
          "Content-Type": "application/pdf",
        },
        body: fileBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudmersive API error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Dodavanje watermark-a nije uspjelo." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const resultBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(resultBuffer);

      return new Response(
        JSON.stringify({
          file: base64,
          contentType: "application/pdf",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle merge-pdf operation
    if (operation === "merge-pdf") {
      const file1 = formData.get("file0") as File;
      const file2 = formData.get("file1") as File;

      if (!file1 || !file2) {
        return new Response(
          JSON.stringify({ error: "Potrebna su najmanje 2 fajla za spajanje" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const file1Buffer = await file1.arrayBuffer();
      const file2Buffer = await file2.arrayBuffer();

      // First, merge two PDFs
      const mergeFormData = new FormData();
      mergeFormData.append("inputFile1", new Blob([file1Buffer], { type: "application/pdf" }), file1.name);
      mergeFormData.append("inputFile2", new Blob([file2Buffer], { type: "application/pdf" }), file2.name);

      const response = await fetch("https://api.cloudmersive.com/convert/merge/pdf/multi", {
        method: "POST",
        headers: {
          "Apikey": CLOUDMERSIVE_API_KEY,
        },
        body: mergeFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudmersive API error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Spajanje PDF-ova nije uspjelo." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const resultBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(resultBuffer);

      return new Response(
        JSON.stringify({
          file: base64,
          contentType: "application/pdf",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle other operations
    const endpoint = operationEndpoints[operation];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: `Nepodržana operacija: ${operation}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const file = formData.get("file0") as File;
    if (!file) {
      return new Response(
        JSON.stringify({ error: "Fajl nije priložen" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    let response;

    if (operation === "rotate") {
      const angle = formData.get("angle") || "90";
      const rotateUrl = new URL(endpoint);
      rotateUrl.searchParams.set("rotationAngle", angle.toString());

      response = await fetch(rotateUrl.toString(), {
        method: "POST",
        headers: {
          "Apikey": CLOUDMERSIVE_API_KEY,
          "Content-Type": "application/pdf",
        },
        body: fileBuffer,
      });
    } else if (operation === "compress-jpeg") {
      // For JPEG compression, use different endpoint
      const compressUrl = new URL("https://api.cloudmersive.com/image/resize/preserveAspectRatio");
      compressUrl.searchParams.set("maxWidth", "1920");
      compressUrl.searchParams.set("maxHeight", "1080");

      response = await fetch(compressUrl.toString(), {
        method: "POST",
        headers: {
          "Apikey": CLOUDMERSIVE_API_KEY,
          "Content-Type": file.type || "image/jpeg",
        },
        body: fileBuffer,
      });
    } else {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Apikey": CLOUDMERSIVE_API_KEY,
          "Content-Type": "application/pdf",
        },
        body: fileBuffer,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudmersive API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Operacija nije uspjela. Molimo pokušajte ponovo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resultBuffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(resultBuffer);
    const contentType = operation === "compress-jpeg" ? "image/jpeg" : "application/pdf";

    return new Response(
      JSON.stringify({
        file: base64,
        contentType,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Error in pdf-operations:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Operacija nije uspjela. Molimo pokušajte ponovo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to convert ArrayBuffer to base64 in chunks (avoid stack overflow)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = "";
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  
  return btoa(binary);
}
