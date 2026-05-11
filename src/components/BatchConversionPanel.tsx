import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Image as ImageIcon, Video, Music,
  Download, Loader2, X, RotateCcw, Eye, EyeOff, CheckCircle2,
  Clock, AlertCircle, Archive, Play, Ban, StopCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  convertClientSide,
  canConvertClientSide,
  ClientConversionUnsupportedError,
  type ConversionProgress,
} from "@/utils/clientConverter";
import { convertAudioToVideo, canConvertAudioToVideo } from "@/utils/audioToVideo";
import { ConversionProgress as ProgressBar } from "@/components/ConversionProgress";
import { StepProgress, type ConversionStep } from "@/components/StepProgress";
import { FormatGrid } from "@/components/FormatGrid";
import { FormatDetectionBadge } from "@/components/FormatDetectionBadge";
import { PreviewPanel } from "@/components/PreviewPanel";
import { getAvailableFormats, type OutputFormat } from "@/types/formats";
import type { DetectedFormat } from "@/utils/formatDetector";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type BatchItemStatus = "queued" | "processing" | "done" | "error" | "cancelled";

interface BatchItem {
  id: string;
  file: File;
  detectedExt?: string;
  targetFormat: OutputFormat;
  status: BatchItemStatus;
  progress: number;
  stage: string;
  result?: Blob;
  error?: string;
  showPreview: boolean;
}

interface BatchConversionPanelProps {
  files: File[];
  onRemove: (index: number) => void;
  onConvertAnother: () => void;
  onConvert: (
    file: File,
    targetFormat: string,
    needsBackend: boolean,
    onProgress?: (p: ConversionProgress) => void
  ) => Promise<Blob>;
}

const MAX_PARALLEL = 2;

const getFileIcon = (type: string, name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (type.startsWith("video") || ["mp4", "mov", "avi", "webm", "mkv", "flv"].includes(ext)) return Video;
  if (type.startsWith("audio") || ["mp3", "ogg", "wav", "m4a", "aac", "flac"].includes(ext)) return Music;
  if (type.startsWith("image") || ["png", "jpg", "jpeg", "webp", "gif", "svg", "heic"].includes(ext)) return ImageIcon;
  return FileText;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const StatusBadge = ({ status, t }: { status: BatchItemStatus; t: any }) => {
  const map = {
    queued: { label: t("batch.queued", "Queued"), Icon: Clock, cls: "bg-muted text-muted-foreground" },
    processing: { label: t("batch.processing", "Processing"), Icon: Loader2, cls: "bg-primary/10 text-primary", spin: true },
    done: { label: t("batch.done", "Done"), Icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    error: { label: t("batch.failed", "Failed"), Icon: AlertCircle, cls: "bg-destructive/10 text-destructive" },
    cancelled: { label: t("batch.cancelled", "Cancelled"), Icon: Ban, cls: "bg-muted text-muted-foreground" },
  } as const;
  const cfg = map[status];
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${cfg.cls}`}>
      <Icon className={`w-3 h-3 ${"spin" in cfg && cfg.spin ? "animate-spin" : ""}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
};

export const BatchConversionPanel = ({
  files,
  onRemove,
  onConvertAnother,
  onConvert,
}: BatchConversionPanelProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Build initial items from incoming files. Used only as a seed and for
  // detecting when the set of files actually changes (by stable ids).
  const buildItems = (srcFiles: File[]): BatchItem[] =>
    srcFiles.map((file, idx) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const formats = getAvailableFormats(ext);
      return {
        id: `${file.name}-${file.size}-${idx}`,
        file,
        targetFormat: formats[0] || ("pdf" as OutputFormat),
        status: "queued",
        progress: 0,
        stage: "",
        showPreview: false,
      };
    });

  // Lazy initializer so we don't rebuild items on every parent re-render.
  const [items, setItems] = useState<BatchItem[]>(() => buildItems(files));
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  const cancelRequestedRef = useRef(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Track the file-id signature to detect a *real* file-set change
  // (different files were added/removed), as opposed to the parent simply
  // re-rendering with a new array reference. This prevents resetting an
  // in-flight batch.
  const filesSignature = useMemo(
    () => files.map((f) => `${f.name}-${f.size}-${f.lastModified}`).join("|"),
    [files]
  );
  const lastSignatureRef = useRef(filesSignature);

  useEffect(() => {
    if (lastSignatureRef.current === filesSignature) return;
    // Never wipe an active batch — wait until it finishes.
    if (isRunningRef.current) return;
    lastSignatureRef.current = filesSignature;
    setItems(buildItems(files));
    setIsRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesSignature]);

  const overallStep: ConversionStep = useMemo(() => {
    if (items.every((i) => i.status === "done" || i.status === "error") && items.some((i) => i.status === "done")) return "download";
    if (items.some((i) => i.status === "processing")) return "processing";
    return "upload";
  }, [items]);

  const updateItem = useCallback((id: string, patch: Partial<BatchItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const handleSetFormat = (id: string, fmt: OutputFormat) => {
    updateItem(id, { targetFormat: fmt });
  };

  const handleTogglePreview = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, showPreview: !it.showPreview } : it)));
  };

  const handleDetected = useCallback(
    (id: string, detected: DetectedFormat) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          const ext = detected.confidence === "low" ? it.file.name.split(".").pop()?.toLowerCase() || "" : detected.ext;
          const formats = getAvailableFormats(ext);
          const target = (formats as string[]).includes(it.targetFormat) ? it.targetFormat : (formats[0] || it.targetFormat);
          return { ...it, detectedExt: ext, targetFormat: target as OutputFormat };
        })
      );
    },
    []
  );

  const logConversion = async (file: File, ext: string, format: string) => {
    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        console.warn("[BH KONVER] getSession failed for logConversion:", sessionErr.message);
        return;
      }
      if (!session?.user?.id) return;
      const { error } = await supabase.from("conversion_logs").insert({
        from_format: ext,
        to_format: format,
        file_size_kb: Math.round(file.size / 1024),
        user_email: session.user.email || "anonymous",
        user_id: session.user.id,
      } as any);
      if (error) console.warn("[BH KONVER] Failed to log conversion:", error.message);
    } catch (e) {
      console.warn("[BH KONVER] logConversion threw:", e);
    }
  };

  const logError = async (file: File, ext: string, format: string, err: string) => {
    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        console.warn("[BH KONVER] getSession failed for logError:", sessionErr.message);
        return;
      }
      if (!session?.user?.id || !session.user.email) return;
      const { error: dbErr } = await supabase.from("server_errors" as any).insert({
        error_message: err,
        error_code: "BATCH_CONVERSION_FAILED",
        file_name: file.name,
        from_format: ext,
        to_format: format,
        file_size_kb: Math.round(file.size / 1024),
        user_email: session.user.email,
        user_id: session.user.id,
      });
      if (dbErr) console.warn("[BH KONVER] Failed to log error:", dbErr.message);
    } catch (e) {
      console.warn("[BH KONVER] logError threw:", e);
    }
  };
  const processOne = async (item: BatchItem): Promise<void> => {
    const ext = item.detectedExt || item.file.name.split(".").pop()?.toLowerCase() || "";
    const format = item.targetFormat;
    const isAudioToVideo = ["mp3", "ogg", "wav", "m4a", "aac", "flac"].includes(ext) && format === "mp4";
    const isClientSide = isAudioToVideo ? canConvertAudioToVideo() : canConvertClientSide(ext, format);

    updateItem(item.id, { status: "processing", progress: 0, stage: t("batch.starting", "Starting...") });
    const onProgress = (p: ConversionProgress) =>
      updateItem(item.id, { progress: p.percent, stage: p.stage });

    try {
      let blob: Blob;
      if (isAudioToVideo) {
        try {
          const { defaultVideoEffects } = await import("@/components/VideoEffectsPanel");
          blob = await convertAudioToVideo(item.file, defaultVideoEffects, onProgress);
        } catch (e) {
          if (e instanceof ClientConversionUnsupportedError) {
            blob = await onConvert(item.file, format, true, onProgress);
          } else throw e;
        }
      } else if (isClientSide) {
        try {
          blob = await convertClientSide(item.file, format, onProgress);
        } catch (e) {
          if (e instanceof ClientConversionUnsupportedError) {
            blob = await onConvert(item.file, format, true, onProgress);
          } else throw e;
        }
      } else {
        blob = await onConvert(item.file, format, true, onProgress);
      }

      updateItem(item.id, { status: "done", progress: 100, stage: t("batch.done", "Done"), result: blob });
      logConversion(item.file, ext, format);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[BH KONVER] Batch item failed:", item.file.name, err);
      updateItem(item.id, { status: "error", error: msg, stage: t("batch.failed", "Failed") });
      toast({
        variant: "destructive",
        title: t("conversion.error", "Conversion failed"),
        description: `${item.file.name}: ${msg}`,
      });
      logError(item.file, ext, format, msg);
    }
  };

  const handleRunBatch = async () => {
    if (isRunning) return;
    cancelRequestedRef.current = false;
    setIsRunning(true);

    const queueIds = items.filter((it) => it.status === "queued" || it.status === "error" || it.status === "cancelled").map((it) => it.id);

    setItems((prev) => prev.map((it) =>
      (it.status === "error" || it.status === "cancelled")
        ? { ...it, status: "queued", error: undefined, progress: 0, stage: "" }
        : it
    ));

    let cursor = 0;
    const next = async (): Promise<void> => {
      while (cursor < queueIds.length) {
        if (cancelRequestedRef.current) return;
        const id = queueIds[cursor++];
        const current = await new Promise<BatchItem | undefined>((resolve) => {
          setItems((prev) => {
            resolve(prev.find((p) => p.id === id));
            return prev;
          });
        });
        if (!current) continue;
        if (cancelRequestedRef.current) return;
        await processOne(current);
      }
    };

    const workers = Array.from({ length: Math.min(MAX_PARALLEL, queueIds.length) }, () => next());
    await Promise.all(workers);

    const wasCancelled = cancelRequestedRef.current;
    cancelRequestedRef.current = false;
    setIsRunning(false);

    if (wasCancelled) {
      // Mark every still-queued or still-processing item as cancelled.
      setItems((prev) => prev.map((it) =>
        (it.status === "queued" || it.status === "processing")
          ? { ...it, status: "cancelled", stage: t("batch.cancelled", "Cancelled") }
          : it
      ));
      toast({
        variant: "destructive",
        title: t("batch.cancelled", "Cancelled"),
        description: t("batch.cancelledDesc", "Batch conversion was cancelled. You can resume by clicking Convert all again."),
      });
      return;
    }

    toast({
      title: t("batch.completed", "Batch completed"),
      description: t("batch.completedDesc", "All conversions finished. Download your files below."),
    });
  };

  const handleCancelBatch = () => {
    if (!isRunningRef.current) return;
    cancelRequestedRef.current = true;
  };
  const handleDownloadAll = async () => {
    const done = items.filter((i) => i.status === "done" && i.result);
    if (done.length === 0) return;

    if (done.length === 1) {
      const it = done[0];
      const url = URL.createObjectURL(it.result!);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${it.file.name.replace(/\.[^/.]+$/, "")}.${it.targetFormat}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    done.forEach((it) => {
      const baseName = it.file.name.replace(/\.[^/.]+$/, "");
      zip.file(`${baseName}.${it.targetFormat}`, it.result!);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bh-konver-batch-${Date.now()}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadOne = (item: BatchItem) => {
    if (!item.result) return;
    const url = URL.createObjectURL(item.result);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.file.name.replace(/\.[^/.]+$/, "")}.${item.targetFormat}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const allFinished = items.length > 0 && items.every((i) => i.status === "done" || i.status === "error");
  const hasResults = doneCount > 0;

  return (
    <Card className="p-6 border border-border bg-card">
      <StepProgress currentStep={overallStep} />

      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border gap-2 flex-wrap">
        <div>
          <p className="text-sm font-medium">
            {t("batch.title", "Batch conversion")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("batch.summary", "{{done}} of {{total}} done", { done: doneCount, total: items.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!allFinished && (
            <Button
              onClick={handleRunBatch}
              disabled={isRunning || items.length === 0}
              className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label={t("batch.runAll", "Convert all")}
            >
              {isRunning ? (
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
              ) : (
                <Play className="mr-2 w-4 h-4" />
              )}
              {isRunning
                ? t("batch.running", "Converting...")
                : t("batch.runAll", "Convert all")}
            </Button>
          )}
          {isRunning && (
            <Button
              onClick={() => setCancelDialogOpen(true)}
              variant="outline"
              className="h-9 border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={cancelRequestedRef.current}
              aria-label={t("batch.cancel", "Cancel batch")}
            >
              <StopCircle className="mr-2 w-4 h-4" />
              {t("batch.cancel", "Cancel")}
            </Button>
          )}
          {hasResults && (
            <Button
              onClick={handleDownloadAll}
              variant="outline"
              className="h-9 gradient-gold text-accent-foreground border-0 hover:opacity-90"
              aria-label={t("batch.downloadAll", "Download all")}
            >
              <Archive className="mr-2 w-4 h-4" />
              {t("batch.downloadAll", "Download all")}
            </Button>
          )}
          <Button
            variant="ghost"
            className="h-9"
            onClick={onConvertAnother}
            aria-label={t("batch.startOver", "Start over")}
          >
            <RotateCcw className="mr-2 w-4 h-4" />
            {t("batch.startOver", "Start over")}
          </Button>
        </div>
      </div>

      <ul className="space-y-4" aria-label={t("batch.itemsList", "Files in batch")}>
        {items.map((item, index) => {
          const Icon = getFileIcon(item.file.type, item.file.name);
          const ext = item.detectedExt || item.file.name.split(".").pop()?.toLowerCase() || "";
          const formats = getAvailableFormats(ext);
          const canRemove = item.status === "queued" || item.status === "error";

          return (
            <li key={item.id} className="border border-border rounded-lg p-4 bg-background/40">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-1">
                      <span>{formatSize(item.file.size)}</span>
                      <StatusBadge status={item.status} t={t} />
                    </div>
                    <div className="mt-2">
                      <FormatDetectionBadge
                        file={item.file}
                        onDetected={(d) => handleDetected(item.id, d)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleTogglePreview(item.id)}
                    aria-label={
                      item.showPreview
                        ? t("batch.hidePreview", "Hide preview")
                        : t("batch.showPreview", "Show preview")
                    }
                    aria-pressed={item.showPreview}
                  >
                    {item.showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemove(index)}
                      aria-label={t("batch.removeFile", "Remove file") + ` ${item.file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {item.status === "queued" && (
                <div className="mb-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                    {t("conversion.selectFormat")}
                  </p>
                  {formats.length > 0 ? (
                    <FormatGrid
                      formats={formats}
                      selected={item.targetFormat}
                      onSelect={(f) => handleSetFormat(item.id, f as OutputFormat)}
                    />
                  ) : (
                    <Badge variant="secondary" className="text-[11px]">
                      {t("batch.noFormats", "No conversion targets available for this format")}
                    </Badge>
                  )}
                </div>
              )}

              {item.status === "processing" && (
                <div className="mb-3">
                  <ProgressBar stage={item.stage} percent={item.progress} />
                </div>
              )}

              {item.status === "error" && item.error && (
                <p className="text-xs text-destructive mb-3" role="alert">
                  {item.error}
                </p>
              )}

              {item.status === "done" && (
                <div className="mb-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadOne(item)}
                    className="h-8 text-xs"
                    aria-label={t("batch.downloadOne", "Download this file")}
                  >
                    <Download className="mr-1.5 w-3 h-3" />
                    {item.file.name.replace(/\.[^/.]+$/, "")}.{item.targetFormat}
                  </Button>
                </div>
              )}

              {item.showPreview && (
                <PreviewPanel
                  inputFile={item.file}
                  outputBlob={item.status === "done" ? item.result : null}
                  outputName={
                    item.status === "done"
                      ? `${item.file.name.replace(/\.[^/.]+$/, "")}.${item.targetFormat}`
                      : undefined
                  }
                />
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
