import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const operation = formData.get("operation") as string;
    const apiKey = Deno.env.get("CLOUDMERSIVE_API_KEY");

    if (!apiKey) {
      throw new Error("CLOUDMERSIVE_API_KEY is not configured");
    }

    const operationEndpoints: Record<string, string> = {
      "remove-watermark": "https://api.cloudmersive.com/convert/edit/pdf/watermark/remove",
      "compress-pdf": "https://api.cloudmersive.com/convert/pdf/optimize",
      "compress-jpeg": "https://api.cloudmersive.com/image/resize/resize-simple",
      "split-pdf": "https://api.cloudmersive.com/convert/pdf/split",
      "rotate": "https://api.cloudmersive.com/convert/edit/pdf/pages/rotate",
    };

    if (operation === "add-watermark") {
      const file = formData.get("file0") as File;
      const watermarkText = formData.get("watermarkText") as string;

      const watermarkFormData = new FormData();
      watermarkFormData.append("imageFile", file);
      watermarkFormData.append("watermarkText", watermarkText);
      watermarkFormData.append("fontSize", "24");
      watermarkFormData.append("fontColor", "#000000");
      watermarkFormData.append("fontTransparency", "50");

      const response = await fetch(
        "https://api.cloudmersive.com/convert/edit/pdf/watermark/add-text",
        {
          method: "POST",
          headers: {
            "Apikey": apiKey,
          },
          body: watermarkFormData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudmersive API error:", errorText);
        throw new Error(`Conversion failed: ${response.status}`);
      }

      const resultBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(resultBuffer)));

      return new Response(
        JSON.stringify({
          file: base64,
          contentType: response.headers.get("content-type") || "application/pdf",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (operation === "merge-pdf") {
      const file1 = formData.get("file0") as File;
      const file2 = formData.get("file1") as File;

      const mergeFormData = new FormData();
      mergeFormData.append("file1", file1);
      mergeFormData.append("file2", file2);

      const response = await fetch(
        "https://api.cloudmersive.com/convert/pdf/merge",
        {
          method: "POST",
          headers: {
            "Apikey": apiKey,
          },
          body: mergeFormData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudmersive API error:", errorText);
        throw new Error(`Merge failed: ${response.status}`);
      }

      const resultBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(resultBuffer)));

      return new Response(
        JSON.stringify({
          file: base64,
          contentType: "application/pdf",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const endpoint = operationEndpoints[operation];
    if (!endpoint) {
      throw new Error(`Unsupported operation: ${operation}`);
    }

    const file = formData.get("file0") as File;
    if (!file) {
      throw new Error("No file provided");
    }

    const fileBuffer = await file.arrayBuffer();
    const operationFormData = new FormData();
    operationFormData.append("imageFile", new Blob([fileBuffer]));

    if (operation === "rotate") {
      const angle = formData.get("angle") || "90";
      operationFormData.append("rotationAngle", angle);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Apikey": apiKey,
      },
      body: operationFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudmersive API error:", errorText);
      throw new Error(`Operation failed: ${response.status}`);
    }

    const resultBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(resultBuffer)));

    return new Response(
      JSON.stringify({
        file: base64,
        contentType: response.headers.get("content-type") || "application/pdf",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in pdf-operations:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});