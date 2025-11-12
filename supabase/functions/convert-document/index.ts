import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLOUDMERSIVE_API_KEY = Deno.env.get('CLOUDMERSIVE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
