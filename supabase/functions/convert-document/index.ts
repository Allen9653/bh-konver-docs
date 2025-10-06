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

    // Cloudmersive API endpoint mapping - modularno proširivo
    const conversionMap: Record<string, Record<string, string>> = {
      docx: {
        pdf: 'https://api.cloudmersive.com/convert/docx/to/pdf',
        jpeg: 'https://api.cloudmersive.com/convert/docx/to/jpg',
        png: 'https://api.cloudmersive.com/convert/docx/to/png',
        html: 'https://api.cloudmersive.com/convert/docx/to/html',
        txt: 'https://api.cloudmersive.com/convert/docx/to/txt',
      },
      doc: {
        pdf: 'https://api.cloudmersive.com/convert/doc/to/pdf',
        jpeg: 'https://api.cloudmersive.com/convert/doc/to/jpg',
        png: 'https://api.cloudmersive.com/convert/doc/to/png',
        html: 'https://api.cloudmersive.com/convert/doc/to/html',
        txt: 'https://api.cloudmersive.com/convert/doc/to/txt',
      },
      pptx: {
        pdf: 'https://api.cloudmersive.com/convert/pptx/to/pdf',
        jpeg: 'https://api.cloudmersive.com/convert/pptx/to/jpg',
        png: 'https://api.cloudmersive.com/convert/pptx/to/png',
        html: 'https://api.cloudmersive.com/convert/pptx/to/html',
      },
      xlsx: {
        pdf: 'https://api.cloudmersive.com/convert/xlsx/to/pdf',
        csv: 'https://api.cloudmersive.com/convert/xlsx/to/csv',
        html: 'https://api.cloudmersive.com/convert/xlsx/to/html',
      },
      xls: {
        pdf: 'https://api.cloudmersive.com/convert/xls/to/pdf',
        csv: 'https://api.cloudmersive.com/convert/xls/to/csv',
        html: 'https://api.cloudmersive.com/convert/xls/to/html',
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
