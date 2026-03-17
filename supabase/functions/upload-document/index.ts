import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/epub+zip",
  "text/plain",
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  // Audio
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/x-flv",
];

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for storage operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Verify user authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Neautorizovan pristup" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Nevažeća autentifikacija" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally log admin uploads (admins now allowed to upload)

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Fajl nije priložen" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Fajl je prevelik. Maksimalna veličina je 50MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: `Nepodržani tip fajla: ${file.type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate safe file path using user.id (UUID) to align with storage RLS policies
    // Storage policies expect: auth.uid()::text = (storage.foldername(name))[1]
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${timestamp}_${sanitizedFilename}`;

    // Read file content
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("user-documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Greška pri uploadu fajla. Molimo pokušajte ponovo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get file extension for document record
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "unknown";

    // Create document record in database
    const { data: documentRecord, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: user.id,
        user_email: user.email,
        filename: file.name,
        file_type: fileExtension,
        file_size_bytes: file.size,
        storage_path: uploadData.path,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Try to cleanup the uploaded file
      await supabaseAdmin.storage.from("user-documents").remove([storagePath]);
      return new Response(
        JSON.stringify({ error: "Greška pri čuvanju zapisa dokumenta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`File uploaded successfully: ${storagePath} by ${user.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Fajl uspješno uploadovan",
        document: {
          id: documentRecord.id,
          filename: documentRecord.filename,
          file_type: documentRecord.file_type,
          file_size_bytes: documentRecord.file_size_bytes,
          storage_path: documentRecord.storage_path,
          created_at: documentRecord.created_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upload function error:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Interna greška servera" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});