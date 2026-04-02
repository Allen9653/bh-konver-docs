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
        title: "Greška",
        description: "Nije moguće učitati podatke.",
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
        title: "Uspješno",
        description: "Dokument je obrisan.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Greška",
        description: "Nije moguće obrisati dokument.",
        variant: "destructive",
      });
    }
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
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Moji dokumenti</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUserData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Osvježi
          </Button>
        </div>

        {/* Transparency Notice */}
        <Card className="p-4 mb-8 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                Transparentnost podataka
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Svi dokumenti se automatski brišu svaki dan u <strong>10:00h</strong> radi 
                vaše sigurnosti i privatnosti. Vrijeme do sljedećeg brisanja:{" "}
                <strong>{getTimeUntilDeletion()}</strong>
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                BH Konver NE zadržava vaše dokumente. Nikada ne dijelimo vaše podatke sa trećim stranama.
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
                Uploadovani dokumenti ({documents.length})
              </h2>
              
              {documents.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nemate uploadovanih dokumenata</p>
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
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
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
                Historija konverzija ({conversions.length})
              </h2>
              
              {conversions.length === 0 ? (
                <Card className="p-8 text-center">
                  <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nemate konverzija</p>
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
                            {conv.status === "completed" ? "Završeno" : conv.status}
                          </Badge>
                          {conv.converted_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={conv.converted_url} download>
                                <Download className="w-4 h-4" />
                              </a>
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
