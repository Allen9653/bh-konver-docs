import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/FileUpload";
import { PremiumUpsellModal } from "./PremiumUpsellModal";
import { ArrowLeft, Download, Loader2, Presentation } from "lucide-react";
import { downloadBlob } from "@/utils/freeTools";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

interface PptxConverterProps {
  onBack: () => void;
  onBeforeRun?: () => boolean;
  onAfterSuccess?: () => void;
}

export function PptxConverter({ onBack, onBeforeRun, onAfterSuccess }: PptxConverterProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | undefined>();

  const validateFile = (f: File): boolean => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pptx") {
      toast.warning(t("freeTools.unsupportedFormat", { formats: ".pptx" }));
      return false;
    }
    if (f.type && f.type !== PPTX_MIME) {
      toast.warning(t("freeTools.unsupportedFormat", { formats: ".pptx" }));
      return false;
    }
    if (f.size > MAX_FILE_SIZE) {
      const sizeMb = (f.size / 1024 / 1024).toFixed(1);
      const limitMb = (MAX_FILE_SIZE / 1024 / 1024).toString();
      toast.error(t("freeTools.fileTooLarge", { size: sizeMb, limit: limitMb }));
      return false;
    }
    return true;
  };

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (!validateFile(f)) return;
    setFile(f);
    setStatus("idle");
    setResultBlob(null);
  };

  const run = async () => {
    if (!file) return;

    if (!validateFile(file)) {
      setFile(null);
      return;
    }

    if (onBeforeRun && onBeforeRun() === false) return;

    setStatus("uploading");
    setProgress(20);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/convert-pptx-public`;

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
        const data = await res.json().catch(() => ({ error: "" }));
        const serverMessage = data.error || "";

        if (res.status >= 500 || res.status === 502 || res.status === 503) {
          toast.error(t("freeTools.serverBusy"));
        } else if (res.status === 413) {
          const limitMb = (MAX_FILE_SIZE / 1024 / 1024).toString();
          const sizeMb = (file.size / 1024 / 1024).toFixed(1);
          toast.error(t("freeTools.fileTooLarge", { size: sizeMb, limit: limitMb }));
        } else {
          toast.error(serverMessage || t("conversion.error"));
        }
        setStatus("error");
        setProgress(0);
        return;
      }

      const blob = await res.blob();
      setResultBlob(blob);
      setProgress(100);
      setStatus("done");
      toast.success(t("conversion.success"));
      onAfterSuccess?.();
    } catch (e) {
      if (e instanceof TypeError && !navigator.onLine) {
        toast.error(t("freeTools.serverBusy"));
      } else {
        toast.error(t("freeTools.serverBusy"));
      }
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
        <ArrowLeft className="w-4 h-4 mr-2" /> {t("common.back")}
      </Button>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Presentation className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold">PPTX → PDF</h3>
            <p className="text-xs text-muted-foreground">
              Beta · Besplatno do 3 konverzije dnevno. Datoteke se ne čuvaju.
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

        {status === "idle" && file && (
          <Button onClick={run} className="w-full bg-primary hover:bg-primary/90">
            Pokreni konverziju
          </Button>
        )}

        {status === "done" && (
          <div className="space-y-3">
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
