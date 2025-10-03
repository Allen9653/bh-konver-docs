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

    // Determine Cloudmersive API endpoint
    let apiEndpoint = '';
    
    if (fileExtension === 'docx' || fileExtension === 'doc') {
      if (targetFormat === 'pdf') apiEndpoint = 'https://api.cloudmersive.com/convert/docx/to/pdf';
      else if (targetFormat === 'jpeg') apiEndpoint = 'https://api.cloudmersive.com/convert/docx/to/jpg';
      else if (targetFormat === 'png') apiEndpoint = 'https://api.cloudmersive.com/convert/docx/to/png';
      else if (targetFormat === 'html') apiEndpoint = 'https://api.cloudmersive.com/convert/docx/to/html';
    } else if (fileExtension === 'pptx') {
      if (targetFormat === 'pdf') apiEndpoint = 'https://api.cloudmersive.com/convert/pptx/to/pdf';
      else if (targetFormat === 'jpeg') apiEndpoint = 'https://api.cloudmersive.com/convert/pptx/to/jpg';
      else if (targetFormat === 'png') apiEndpoint = 'https://api.cloudmersive.com/convert/pptx/to/png';
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      if (targetFormat === 'pdf') apiEndpoint = 'https://api.cloudmersive.com/convert/xlsx/to/pdf';
      else if (targetFormat === 'csv') apiEndpoint = 'https://api.cloudmersive.com/convert/xlsx/to/csv';
    }

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
