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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Cleanup attempted without authentication");
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error during cleanup:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has admin role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData, error: roleError } = await supabaseAdmin
      .rpc("check_user_role", { _role: "admin", _user_id: user.id });

    if (roleError || !roleData) {
      console.error("Admin role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden - admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin cleanup initiated by: ${user.email}`);

    // Delete all documents from the documents table
    const { data: deletedDocs, error: docsError } = await supabaseAdmin
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

    const { data: deletedConvs, error: convsError } = await supabaseAdmin
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
    const { data: storageFiles, error: listError } = await supabaseAdmin
      .storage
      .from("user-documents")
      .list();

    if (!listError && storageFiles && storageFiles.length > 0) {
      const filePaths = storageFiles.map(file => file.name);
      
      const { error: deleteError } = await supabaseAdmin
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
      initiatedBy: user.email,
      deleted: {
        documents: deletedDocs?.length || 0,
        conversions: deletedConvs?.length || 0,
        storageFiles: storageFiles?.length || 0
      },
      message: "Admin cleanup completed successfully. All user documents have been deleted for security and privacy."
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
