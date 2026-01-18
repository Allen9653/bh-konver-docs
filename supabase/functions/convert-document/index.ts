import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const CLOUDMERSIVE_API_KEY = Deno.env.get('CLOUDMERSIVE_API_KEY');

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Verify user authentication - conversions require login
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Conversion attempted without authentication");
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required for conversions" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error during conversion:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Conversion initiated by user: ${user.email}`);
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;
    
    if (!file || !targetFormat) {
      return new Response(
        JSON.stringify({ error: 'File and targetFormat are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    console.log(`Converting ${fileExtension} to ${targetFormat}`);

    // BH Konver - Kompletan mapping svih konverzija
    const conversionMap: Record<string, Record<string, string>> = {
      // Video & Audio
      mp4: {
        mp3: 'https://api.cloudmersive.com/video/convert/to/mp3',
        gif: 'https://api.cloudmersive.com/video/convert/to/gif',
        webm: 'https://api.cloudmersive.com/video/convert/to/webm',
      },
      mov: {
        mp4: 'https://api.cloudmersive.com/video/convert/to/mp4',
        mp3: 'https://api.cloudmersive.com/video/convert/to/mp3',
        gif: 'https://api.cloudmersive.com/video/convert/to/gif',
      },
      avi: {
        mp4: 'https://api.cloudmersive.com/video/convert/to/mp4',
        mp3: 'https://api.cloudmersive.com/video/convert/to/mp3',
        gif: 'https://api.cloudmersive.com/video/convert/to/gif',
      },
      webm: {
        mp4: 'https://api.cloudmersive.com/video/convert/to/mp4',
        mp3: 'https://api.cloudmersive.com/video/convert/to/mp3',
        gif: 'https://api.cloudmersive.com/video/convert/to/gif',
      },
      // Audio
      mp3: {
        ogg: 'https://api.cloudmersive.com/audio/convert/to/ogg',
        wav: 'https://api.cloudmersive.com/audio/convert/to/wav',
      },
      ogg: {
        mp3: 'https://api.cloudmersive.com/audio/convert/to/mp3',
        wav: 'https://api.cloudmersive.com/audio/convert/to/wav',
      },
      wav: {
        mp3: 'https://api.cloudmersive.com/audio/convert/to/mp3',
        ogg: 'https://api.cloudmersive.com/audio/convert/to/ogg',
      },
      m4a: {
        mp3: 'https://api.cloudmersive.com/audio/convert/to/mp3',
      },
      // Images
      webp: {
        png: 'https://api.cloudmersive.com/convert/image/to/png',
        jpg: 'https://api.cloudmersive.com/convert/image/to/jpg',
      },
      jfif: {
        png: 'https://api.cloudmersive.com/convert/image/to/png',
        jpg: 'https://api.cloudmersive.com/convert/image/to/jpg',
      },
      heic: {
        jpg: 'https://api.cloudmersive.com/convert/image/to/jpg',
        png: 'https://api.cloudmersive.com/convert/image/to/png',
        pdf: 'https://api.cloudmersive.com/convert/image/to/pdf',
      },
      png: {
        jpg: 'https://api.cloudmersive.com/convert/image/to/jpg',
        svg: 'https://api.cloudmersive.com/convert/image/to/svg',
        pdf: 'https://api.cloudmersive.com/convert/image/to/pdf',
        webp: 'https://api.cloudmersive.com/convert/image/to/webp',
      },
      jpg: {
        png: 'https://api.cloudmersive.com/convert/image/to/png',
        pdf: 'https://api.cloudmersive.com/convert/image/to/pdf',
        webp: 'https://api.cloudmersive.com/convert/image/to/webp',
      },
      jpeg: {
        png: 'https://api.cloudmersive.com/convert/image/to/png',
        pdf: 'https://api.cloudmersive.com/convert/image/to/pdf',
        webp: 'https://api.cloudmersive.com/convert/image/to/webp',
      },
      svg: {
        png: 'https://api.cloudmersive.com/convert/image/to/png',
        jpg: 'https://api.cloudmersive.com/convert/image/to/jpg',
      },
      // PDF & Documents
      pdf: {
        docx: 'https://api.cloudmersive.com/convert/pdf/to/docx',
        jpg: 'https://api.cloudmersive.com/convert/pdf/to/jpg',
        png: 'https://api.cloudmersive.com/convert/pdf/to/png',
        epub: 'https://api.cloudmersive.com/convert/pdf/to/epub',
        txt: 'https://api.cloudmersive.com/convert/pdf/to/txt',
      },
      docx: {
        pdf: 'https://api.cloudmersive.com/convert/docx/to/pdf',
        jpg: 'https://api.cloudmersive.com/convert/docx/to/jpg',
        png: 'https://api.cloudmersive.com/convert/docx/to/png',
        txt: 'https://api.cloudmersive.com/convert/docx/to/txt',
      },
      doc: {
        pdf: 'https://api.cloudmersive.com/convert/doc/to/pdf',
        docx: 'https://api.cloudmersive.com/convert/doc/to/docx',
        jpg: 'https://api.cloudmersive.com/convert/doc/to/jpg',
        txt: 'https://api.cloudmersive.com/convert/doc/to/txt',
      },
      epub: {
        pdf: 'https://api.cloudmersive.com/convert/epub/to/pdf',
        txt: 'https://api.cloudmersive.com/convert/epub/to/txt',
      },
      txt: {
        pdf: 'https://api.cloudmersive.com/convert/txt/to/pdf',
      },
      pptx: {
        pdf: 'https://api.cloudmersive.com/convert/pptx/to/pdf',
      },
      ppt: {
        pdf: 'https://api.cloudmersive.com/convert/ppt/to/pdf',
      },
      xlsx: {
        pdf: 'https://api.cloudmersive.com/convert/xlsx/to/pdf',
      },
      xls: {
        pdf: 'https://api.cloudmersive.com/convert/xls/to/pdf',
      },
      // GIF
      gif: {
        mp4: 'https://api.cloudmersive.com/video/convert/to/mp4',
        webm: 'https://api.cloudmersive.com/video/convert/to/webm',
        apng: 'https://api.cloudmersive.com/video/convert/to/apng',
      },
      apng: {
        gif: 'https://api.cloudmersive.com/video/convert/to/gif',
        mp4: 'https://api.cloudmersive.com/video/convert/to/mp4',
      },
    };

    const apiEndpoint = conversionMap[fileExtension || '']?.[targetFormat];

    if (!apiEndpoint) {
      return new Response(
        JSON.stringify({ error: `Unsupported conversion: ${fileExtension} to ${targetFormat}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to ArrayBuffer for Cloudmersive
    const fileBuffer = await file.arrayBuffer();
    
    // Call Cloudmersive API
    const cloudmersiveResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Apikey': CLOUDMERSIVE_API_KEY!,
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (!cloudmersiveResponse.ok) {
      const errorText = await cloudmersiveResponse.text();
      console.error('Cloudmersive API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Conversion failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return converted file
    const convertedData = await cloudmersiveResponse.arrayBuffer();
    const contentType = cloudmersiveResponse.headers.get('content-type') || 'application/octet-stream';
    
    return new Response(convertedData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
      },
    });

  } catch (error) {
    console.error('Error in convert-document function:', error);
    const corsHeaders = getCorsHeaders(req);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});