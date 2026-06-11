import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/FileUpload";
import { PremiumUpsellModal } from "./PremiumUpsellModal";
import { ArrowLeft, Download, Loader2, Presentation } from "lucide-react";
import { downloadBlob } from "@/utils/freeTools";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/convert-pptx-public`;

interface PptxConverterProps {
  onBack: () => void;
}

export function PptxConverter({ onBack }: PptxConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | undefined>();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setStatus("idle");
    setResultBlob(null);
    setError(null);
  };

  const run = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress(20);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      // Public endpoint — pass anon key as authorization for Supabase routing.
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      setProgress(50);
      const res = await fetch(FUNCTION_URL, { method: "POST", body: fd, headers });
      setProgress(85);

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setRetryAfter(data.retry_after_seconds);
        setUpsellOpen(true);
        setStatus("idle");
        setProgress(0);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Nepoznata greška." }));
        throw new Error(data.error || `Greška ${res.status}`);
      }

      const blob = await res.blob();
      setResultBlob(blob);
      setProgress(100);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Konverzija nije uspjela.");
      setStatus("error");
      setProgress(0);
    }
  };

  const download = () => {
    if (!resultBlob || !file) return;
    downloadBlob(resultBlob, file.name.replace(/\.pptx$/i, ".pdf"));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Nazad
      </Button>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Presentation className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold">PPTX → PDF</h3>
            <p className="text-xs text-muted-foreground">
              Besplatno do 3 konverzije po satu. Datoteke se ne čuvaju.
            </p>
          </div>
        </div>

        {status === "idle" && !file && (
          <FileUpload onFilesSelected={handleFiles} acceptedFormats={["pptx"]} />
        )}

        {file && status !== "done" && (
          <div className="text-sm">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {status === "uploading" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Konverzija u toku...
            </div>
            <Progress value={progress} />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === "idle" && file && (
          <Button onClick={run} className="w-full bg-primary hover:bg-primary/90">
            Pokreni konverziju
          </Button>
        )}

        {status === "done" && (
          <div className="space-y-3">
            <Alert>
              <AlertDescription>Konverzija završena.</AlertDescription>
            </Alert>
            <Button onClick={download} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="w-4 h-4 mr-2" /> Preuzmi PDF
            </Button>
            <Button variant="outline" onClick={() => { setFile(null); setStatus("idle"); setResultBlob(null); }} className="w-full">
              Konvertuj novu datoteku
            </Button>
          </div>
        )}
      </div>

      <PremiumUpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        retryAfterSeconds={retryAfter}
      />
    </div>
  );
}
