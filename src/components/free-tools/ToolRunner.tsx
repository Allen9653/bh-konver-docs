import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2, Upload, X, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { downloadBlob, type ToolProgress } from "@/utils/freeTools";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

type RunnerProps = {
  title: string;
  description: string;
  acceptedExtensions: string[]; // e.g. ["pdf"], ["jpg", "png"]
  multiple?: boolean;
  outputFilename: (input: File | File[]) => string;
  run: (files: File[], onProgress: ToolProgress) => Promise<Blob>;
  onBack: () => void;
  note?: string; // optional fidelity disclaimer
  minFiles?: number;
};

export const ToolRunner = ({
  title,
  description,
  acceptedExtensions,
  multiple = false,
  outputFilename,
  run,
  onBack,
  note,
  minFiles = 1,
}: RunnerProps) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [percent, setPercent] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("");

  const accept = acceptedExtensions.map((e) => `.${e}`).join(",");

  const handleFiles = useCallback((picked: FileList | null) => {
    if (!picked) return;
    const arr = Array.from(picked).filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ext ? acceptedExtensions.includes(ext) : false;
    });
    if (arr.length === 0) {
      toast.error(t("freeTools.unsupportedFormat", { formats: acceptedExtensions.join(", ") }));
      return;
    }
    const oversized = arr.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      const sizeMb = (oversized[0].size / 1024 / 1024).toFixed(1);
      const limitMb = (MAX_FILE_SIZE / 1024 / 1024).toString();
      toast.error(t("freeTools.fileTooLarge", { size: sizeMb, limit: limitMb }));
      return;
    }
    setFiles((prev) => (multiple ? [...prev, ...arr] : arr));
    setResult(null);
  }, [acceptedExtensions, multiple, t]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRun = async () => {
    if (files.length < minFiles) {
      toast.error(`Potrebno najmanje ${minFiles} fajl(ova)`);
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const blob = await run(files, (s, p) => {
        setStage(s);
        setPercent(p);
      });
      setResult(blob);
      setResultName(outputFilename(multiple ? files : files[0]));
      toast.success("Konverzija završena!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Greška pri obradi");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setPercent(0);
    setStage("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Nazad
          </Button>
          <Badge className="bg-accent text-accent-foreground">
            <Sparkles className="w-3 h-3 mr-1" /> Besplatno
          </Badge>
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {note && (
          <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-muted-foreground">
            ℹ️ {note}
          </div>
        )}

        {!result && (
          <>
            <label
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Prevucite fajl ovdje ili kliknite</p>
              <p className="text-xs text-muted-foreground mt-1">
                Dozvoljeno: {acceptedExtensions.join(", ").toUpperCase()}
              </p>
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={busy}
              />
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({(f.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    {!busy && (
                      <button
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Ukloni"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {busy && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{stage}</span>
                  <span>{percent}%</span>
                </div>
                <Progress value={percent} />
              </div>
            )}

            <Button
              onClick={handleRun}
              disabled={busy || files.length < minFiles}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {busy ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Obrada...</>
              ) : (
                "Pokreni konverziju"
              )}
            </Button>
          </>
        )}

        {result && (
          <div className="space-y-3 text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent">
              <Download className="w-8 h-8" />
            </div>
            <p className="text-sm">Vaš fajl je spreman za preuzimanje</p>
            <p className="text-xs text-muted-foreground truncate">{resultName}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => downloadBlob(result, resultName)} className="bg-primary hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" /> Preuzmi
              </Button>
              <Button variant="outline" onClick={reset}>
                Novi fajl
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
