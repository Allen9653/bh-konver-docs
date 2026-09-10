import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Trash2, 
  Clock, 
  ArrowLeft, 
  AlertTriangle,
  RefreshCw,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { DocumentPreviewEnhanced } from "@/components/DocumentPreviewEnhanced";
import { trackHistoryDownload } from "@/lib/analytics";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
}

interface Conversion {
  id: string;
  original_filename: string;
  original_format: string;
  target_format: string;
  status: string;
  converted_url: string | null;
  created_at: string;
}

const History = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch documents by user_id (UUID)
      const { data: docs, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docs || []);

      // Fetch conversions
      const { data: convs, error: convsError } = await supabase
        .from("conversions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (convsError) throw convsError;
      setConversions(convs || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: t("history.loadErrorTitle"),
        description: t("history.loadErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast({
        title: t("history.deletedTitle"),
        description: t("history.deletedDesc"),
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: t("history.loadErrorTitle"),
        description: t("history.deleteErrorDesc"),
        variant: "destructive",
      });
    }
  };

  /**
   * Signed storage links expire, so we always mint a fresh one from the stored
   * object path before downloading. Works for raw paths and for previously
   * stored signed/public URLs.
   */
  const resolveDownloadUrl = async (rawUrl: string): Promise<string | null> => {
    let bucket = "user-documents";
    let objectPath = rawUrl;

    if (/^https?:\/\//i.test(rawUrl)) {
      try {
        const parsed = new URL(rawUrl);
        const match = parsed.pathname.match(/\/object\/(?:sign|public|authenticated)\/([^/]+)\/(.+)$/);
        if (!match) return rawUrl;
        bucket = match[1];
        objectPath = decodeURIComponent(match[2]);
      } catch {
        return rawUrl;
      }
    }

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectPath, 900);
    if (error || !data?.signedUrl) return /^https?:\/\//i.test(rawUrl) ? rawUrl : null;
    return data.signedUrl;
  };

  const handleDownload = async (
    rawUrl: string,
    filename: string,
    source: "document" | "conversion" = "document",
  ) => {
    const url = await resolveDownloadUrl(rawUrl);
    if (!url) {
      toast({
        title: t("history.loadErrorTitle"),
        description: t("history.downloadExpired", {
          defaultValue: "Fajl više nije dostupan (automatski je obrisan).",
        }),
        variant: "destructive",
      });
      return;
    }
    trackHistoryDownload({ source, format: filename.split(".").pop()?.toLowerCase() });
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bs-BA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate time until 10:00 deletion
  const getTimeUntilDeletion = () => {
    const now = new Date();
    const deletion = new Date();
    deletion.setHours(10, 0, 0, 0);
    
    if (now.getHours() >= 10) {
      deletion.setDate(deletion.getDate() + 1);
    }
    
    const diff = deletion.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} aria-label={t("history.back")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{t("history.title")}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUserData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("history.refresh")}
          </Button>
        </div>

        {/* Transparency Notice */}
        <Card className="p-4 mb-8 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                {t("history.transparencyTitle")}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t("history.transparencyNotice")} {t("history.timeUntilDeletion")}:{" "}
                <strong>{getTimeUntilDeletion()}</strong>
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                {t("history.transparencyExtra")}
              </p>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Documents Section */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("history.documents")} ({documents.length})
              </h2>
              
              {documents.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{t("history.noDocuments")}</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{doc.filename}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatFileSize(doc.file_size_bytes)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(doc.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{doc.file_type}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("history.previewDoc", { name: doc.filename })}
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {doc.storage_path && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t("history.downloadConversion", { name: doc.filename })}
                              onClick={() => handleDownload(doc.storage_path!, doc.filename)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={t("history.deleteDoc", { name: doc.filename })}
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Conversions Section */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                {t("history.conversions")} ({conversions.length})
              </h2>
              
              {conversions.length === 0 ? (
                <Card className="p-8 text-center">
                  <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{t("history.noConversions")}</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {conversions.map((conv) => (
                    <Card key={conv.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{conv.original_filename}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="uppercase">{conv.original_format}</span>
                            <span>→</span>
                            <span className="uppercase">{conv.target_format}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(conv.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={conv.status === "completed" ? "default" : "secondary"}
                          >
                            {conv.status === "completed" ? t("history.completed") : conv.status}
                          </Badge>
                          {conv.converted_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t("history.downloadConversion", { name: conv.original_filename })}
                              onClick={() => handleDownload(conv.converted_url!, `${conv.original_filename.replace(/\.[^.]+$/, "")}.${conv.target_format}`)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewEnhanced
          file={null}
          fileUrl={previewDoc.storage_path || undefined}
          fileName={previewDoc.filename}
          open={!!previewDoc}
          onOpenChange={() => setPreviewDoc(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default History;
