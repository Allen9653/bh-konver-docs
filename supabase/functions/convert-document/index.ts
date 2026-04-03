import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Declare EdgeRuntime for Supabase Edge Functions
declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const CLOUDMERSIVE_API_KEY = Deno.env.get('CLOUDMERSIVE_API_KEY');

// Conversion map for all supported formats
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
  mkv: {
    mp4: 'https://api.cloudmersive.com/video/convert/to/mp4',
    mp3: 'https://api.cloudmersive.com/video/convert/to/mp3',
  },
  flv: {
    mp4: 'https://api.cloudmersive.com/video/convert/to/mp4',
    mp3: 'https://api.cloudmersive.com/video/convert/to/mp3',
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
  aac: {
    mp3: 'https://api.cloudmersive.com/audio/convert/to/mp3',
  },
  flac: {
    mp3: 'https://api.cloudmersive.com/audio/convert/to/mp3',
  },
  // Images
  webp: {
    png: 'https://api.cloudmersive.com/image/convert/to/png',
    jpg: 'https://api.cloudmersive.com/image/convert/to/jpg',
  },
  jfif: {
    png: 'https://api.cloudmersive.com/image/convert/to/png',
    jpg: 'https://api.cloudmersive.com/image/convert/to/jpg',
  },
  heic: {
    jpg: 'https://api.cloudmersive.com/image/convert/to/jpg',
    png: 'https://api.cloudmersive.com/image/convert/to/png',
    pdf: 'https://api.cloudmersive.com/convert/image/heic/to/pdf',
  },
  png: {
    jpg: 'https://api.cloudmersive.com/image/convert/to/jpg',
    pdf: 'https://api.cloudmersive.com/convert/image/png/to/pdf',
    webp: 'https://api.cloudmersive.com/image/convert/to/webp',
  },
  jpg: {
    png: 'https://api.cloudmersive.com/image/convert/to/png',
    pdf: 'https://api.cloudmersive.com/convert/image/jpg/to/pdf',
    webp: 'https://api.cloudmersive.com/image/convert/to/webp',
  },
  jpeg: {
    png: 'https://api.cloudmersive.com/image/convert/to/png',
    pdf: 'https://api.cloudmersive.com/convert/image/jpeg/to/pdf',
    webp: 'https://api.cloudmersive.com/image/convert/to/webp',
  },
  svg: {
    png: 'https://api.cloudmersive.com/convert/image/svg/to/png',
    jpg: 'https://api.cloudmersive.com/convert/image/svg/to/jpg',
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

// MIME types for converted files
const mimeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  txt: 'text/plain',
  epub: 'application/epub+zip',
  svg: 'image/svg+xml',
  apng: 'image/apng',
};

// Check if conversion is heavy (video/audio/gif) and needs async processing
function isHeavyConversion(fileExtension: string, targetFormat: string): boolean {
  const heavySourceFormats = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'gif', 'apng'];
  const heavyTargetFormats = ['gif', 'mp4', 'webm', 'mp3', 'ogg', 'wav', 'apng'];
  return heavySourceFormats.includes(fileExtension) || heavyTargetFormats.includes(targetFormat);
}

type UpstreamConversionError = {
  httpStatus: number;
  userMessage: string;
  code: string;
};

function mapUpstreamConversionError(status: number): UpstreamConversionError {
  if (status === 401 || status === 403) {
    return {
      httpStatus: 503,
      userMessage: 'Servis za kompleksne konverzije je trenutno nedostupan. Molimo pokušajte kasnije.',
      code: 'UPSTREAM_AUTH_FAILED',
    };
  }

  if (status === 413) {
    return {
      httpStatus: 413,
      userMessage: 'Fajl je prevelik. Maksimalna veličina je 50MB.',
      code: 'FILE_TOO_LARGE',
    };
  }

  if (status === 429) {
    return {
      httpStatus: 429,
      userMessage: 'Previše zahtjeva. Molimo sačekajte par sekundi.',
      code: 'RATE_LIMITED',
    };
  }

  if (status >= 500) {
    return {
      httpStatus: 502,
      userMessage: 'Servis za konverziju trenutno ne odgovara. Molimo pokušajte kasnije.',
      code: 'UPSTREAM_UNAVAILABLE',
    };
  }

  return {
    httpStatus: 502,
    userMessage: 'Konverzija nije uspjela. Molimo pokušajte ponovo.',
    code: 'UPSTREAM_CONVERSION_FAILED',
  };
}

// Background conversion function
async function processConversionInBackground(
  jobId: string,
  fileBuffer: ArrayBuffer,
  apiEndpoint: string,
  targetFormat: string,
  originalFilename: string,
  userId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log(`Background: Starting conversion for job ${jobId}`);
    
    // Update progress to 25%
    await supabase.from('processing_jobs').update({ progress: 25 }).eq('id', jobId);
    
    // Call Cloudmersive API with longer timeout for background
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for background
    
    const cloudmersiveResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Apikey': CLOUDMERSIVE_API_KEY!,
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Update progress to 75%
    await supabase.from('processing_jobs').update({ progress: 75 }).eq('id', jobId);
    
    if (!cloudmersiveResponse.ok) {
      const status = cloudmersiveResponse.status;
      const mappedError = mapUpstreamConversionError(status);

      await supabase.from('processing_jobs').update({ 
        status: 'failed', 
        error: mappedError.userMessage,
        progress: 100 
      }).eq('id', jobId);
      
      console.error(`Background: Conversion failed for job ${jobId}: ${mappedError.code} (${status})`);
      return;
    }
    
    // Get converted data
    const convertedData = await cloudmersiveResponse.arrayBuffer();
    
    // Generate filename with proper extension
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    const fileName = `${userId}/converted/${jobId}_${baseName}.${targetFormat}`;
    
    // Store in Supabase storage
    const contentType = mimeTypes[targetFormat] || cloudmersiveResponse.headers.get('content-type') || 'application/octet-stream';
    
    const { error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(fileName, convertedData, {
        contentType,
        upsert: true,
      });
    
    if (uploadError) {
      console.error(`Background: Upload failed for job ${jobId}:`, uploadError);
      await supabase.from('processing_jobs').update({ 
        status: 'failed', 
        error: 'Greška pri spremanju fajla.',
        progress: 100 
      }).eq('id', jobId);
      return;
    }
    
    // Create signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('user-documents')
      .createSignedUrl(fileName, 3600);
    
    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error(`Background: Failed to create signed URL for job ${jobId}:`, signedUrlError);
      await supabase.from('processing_jobs').update({ 
        status: 'failed', 
        error: 'Greška pri kreiranju linka za preuzimanje.',
        progress: 100 
      }).eq('id', jobId);
      return;
    }
    
    // Mark as completed with signed URL
    await supabase.from('processing_jobs').update({ 
      status: 'completed', 
      result_url: signedUrlData.signedUrl,
      progress: 100 
    }).eq('id', jobId);
    
    console.log(`Background: Conversion completed for job ${jobId}`);
    
  } catch (error) {
    console.error(`Background: Error in job ${jobId}:`, error);
    
    const supabaseRetry = createClient(supabaseUrl, supabaseServiceKey);
    await supabaseRetry.from('processing_jobs').update({ 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'Nepoznata greška',
      progress: 100 
    }).eq('id', jobId);
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Convert-document function called');
    console.log('Cloudmersive key configured:', Boolean(CLOUDMERSIVE_API_KEY));
    
    // Check Cloudmersive API key
    if (!CLOUDMERSIVE_API_KEY) {
      console.error('CLOUDMERSIVE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Servis trenutno nije dostupan. Molimo pokušajte kasnije.' }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client for authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify user authentication - conversions require login
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Conversion attempted without authentication");
      return new Response(
        JSON.stringify({ error: "Morate biti prijavljeni za korištenje konverzija." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error during conversion:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Neispravna prijava. Molimo prijavite se ponovo." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Conversion initiated by user: ${user.id}`);

    // --- PAYWALL CHECK: Verify active subscription before consuming API credits ---
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
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
        JSON.stringify({ error: 'Potrebna je aktivna pretplata za korištenje konverzija. Nadogradite svoj plan.' }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse form data
    let formData;
    try {
      const contentType = req.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        console.error('Invalid content type:', contentType);
        return new Response(
          JSON.stringify({ error: 'Neispravan format zahtjeva. Očekivan multipart/form-data.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      formData = await req.formData();
    } catch (parseError) {
      console.error('Error parsing form data:', parseError);
      return new Response(
        JSON.stringify({ error: 'Greška pri čitanju fajla. Molimo pokušajte ponovo.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;
    
    if (!file || !targetFormat) {
      console.error('Missing file or targetFormat');
      return new Response(
        JSON.stringify({ error: 'Fajl i ciljni format su obavezni.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    console.log(`Converting ${file.name} (${fileExtension}) to ${targetFormat}, size: ${file.size} bytes`);

    const apiEndpoint = conversionMap[fileExtension]?.[targetFormat];

    if (!apiEndpoint) {
      console.error(`Unsupported conversion: ${fileExtension} to ${targetFormat}`);
      return new Response(
        JSON.stringify({ error: `Konverzija iz ${fileExtension?.toUpperCase()} u ${targetFormat.toUpperCase()} nije podržana.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Check if this is a heavy conversion that needs async processing
    // Heavy = video/audio/gif OR file > 5MB
    if (isHeavyConversion(fileExtension, targetFormat) || file.size > 5 * 1024 * 1024) {
      console.log(`Heavy conversion detected, using async processing for ${file.name}`);
      
      // Create job record with service role to bypass RLS
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      const { data: job, error: jobError } = await supabaseService
        .from('processing_jobs')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          target_format: targetFormat,
          status: 'processing',
          progress: 0,
        })
        .select()
        .single();
      
      if (jobError || !job) {
        console.error('Failed to create job:', jobError);
        return new Response(
          JSON.stringify({ error: 'Greška pri kreiranju zadatka.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Start background processing
      EdgeRuntime.waitUntil(
        processConversionInBackground(
          job.id,
          fileBuffer,
          apiEndpoint,
          targetFormat,
          file.name,
          user.id,
          supabaseUrl,
          supabaseServiceKey
        )
      );
      
      // Return immediately with job ID
      return new Response(
        JSON.stringify({ 
          async: true,
          job_id: job.id,
          message: 'Konverzija je pokrenuta u pozadini. Pratite status.' 
        }),
        { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Synchronous conversion for small/light files (images, documents < 5MB)
    console.log(`Light conversion, processing synchronously: ${apiEndpoint}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout for sync
    
    try {
      const cloudmersiveResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Apikey': CLOUDMERSIVE_API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: fileBuffer,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!cloudmersiveResponse.ok) {
        const status = cloudmersiveResponse.status;
        const errorBody = await cloudmersiveResponse.text().catch(() => 'no body');
        const mappedError = mapUpstreamConversionError(status);

        console.error(`Cloudmersive API error: ${mappedError.code} (${status}), body: ${errorBody}`);

        return new Response(
          JSON.stringify({ error: mappedError.userMessage, code: mappedError.code }),
          { status: mappedError.httpStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return converted file directly
      const convertedData = await cloudmersiveResponse.arrayBuffer();
      const contentType = mimeTypes[targetFormat] || cloudmersiveResponse.headers.get('content-type') || 'application/octet-stream';
      
      console.log(`Sync conversion successful, returning ${convertedData.byteLength} bytes`);
      
      return new Response(convertedData, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}"`,
        },
      });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Cloudmersive API timeout');
        return new Response(
          JSON.stringify({ error: 'Konverzija je trajala predugo. Pokušajte sa manjim fajlom ili koristite async opciju.', code: 'UPSTREAM_TIMEOUT' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Cloudmersive network error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Servis za konverziju trenutno nije dostupan. Molimo pokušajte kasnije.', code: 'UPSTREAM_NETWORK_ERROR' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in convert-document function:', error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: 'Došlo je do greške. Molimo pokušajte ponovo.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
