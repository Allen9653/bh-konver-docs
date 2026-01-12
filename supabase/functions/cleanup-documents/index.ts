import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting daily document cleanup at 10:00...");

    // Delete all documents from the documents table
    const { data: deletedDocs, error: docsError } = await supabase
      .from("documents")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all (workaround)
      .select();

    if (docsError) {
      console.error("Error deleting documents:", docsError);
      throw docsError;
    }

    console.log(`Deleted ${deletedDocs?.length || 0} documents`);

    // Delete old conversions (older than 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: deletedConvs, error: convsError } = await supabase
      .from("conversions")
      .delete()
      .lt("created_at", oneDayAgo.toISOString())
      .select();

    if (convsError) {
      console.error("Error deleting old conversions:", convsError);
    } else {
      console.log(`Deleted ${deletedConvs?.length || 0} old conversions`);
    }

    // Delete files from storage bucket
    const { data: storageFiles, error: listError } = await supabase
      .storage
      .from("user-documents")
      .list();

    if (!listError && storageFiles && storageFiles.length > 0) {
      const filePaths = storageFiles.map(file => file.name);
      
      const { error: deleteError } = await supabase
        .storage
        .from("user-documents")
        .remove(filePaths);

      if (deleteError) {
        console.error("Error deleting storage files:", deleteError);
      } else {
        console.log(`Deleted ${filePaths.length} files from storage`);
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      deleted: {
        documents: deletedDocs?.length || 0,
        conversions: deletedConvs?.length || 0,
        storageFiles: storageFiles?.length || 0
      },
      message: "Daily cleanup completed successfully. All user documents have been deleted for security and privacy."
    };

    console.log("Cleanup completed:", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Cleanup error:", error);
    const corsHeaders = getCorsHeaders(req);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});