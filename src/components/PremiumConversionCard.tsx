import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Video, Music, Download, Loader2, Zap, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { convertClientSide, canConvertClientSide, ClientConversionUnsupportedError, type ConversionProgress } from "@/utils/clientConverter";
import { convertAudioToVideo, canConvertAudioToVideo } from "@/utils/audioToVideo";
import { ConversionProgress as ProgressBar } from "@/components/ConversionProgress";
import { StepProgress, type ConversionStep } from "@/components/StepProgress";
import { FormatGrid } from "@/components/FormatGrid";
import { VideoEffectsPanel, defaultVideoEffects, type VideoEffectOptions } from "@/components/VideoEffectsPanel";
import { getAvailableFormats } from "@/types/formats";
import { supabase } from "@/integrations/supabase/client";

interface PremiumConversionCardProps {
  file: File;
  onRemove: () => void;
  onConvertAnother: () => void;
  onConvert?: (file: File, targetFormat: string, needsBackend: boolean, onProgress?: (p: ConversionProgress) => void) => Promise<Blob>;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("video")) return Video;
  if (type.startsWith("audio")) return Music;
  if (type.startsWith("image")) return Image;
  return FileText;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const PremiumConversionCard = ({ file, onRemove, onConvertAnother, onConvert }: PremiumConversionCardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const availableFormats = useMemo(() => getAvailableFormats(ext), [ext]);
  const [format, setFormat] = useState(availableFormats[0] || "pdf");
  const [isConverting, setIsConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [step, setStep] = useState<ConversionStep>("upload");

  const isClientSide = canConvertClientSide(ext, format);
  const Icon = getFileIcon(file.type);

  const handleConversion = async () => {
    setIsConverting(true);
    setStep("processing");
    setProgress(null);
    let conversionSucceeded = false;
    try {
      let blob: Blob;
      if (isClientSide) {
        try {
          blob = await convertClientSide(file, format, setProgress);
        } catch (clientErr) {
          // If client-side is unsupported (e.g. no SharedArrayBuffer), fall back to backend
          if (clientErr instanceof ClientConversionUnsupportedError && onConvert) {
            console.warn("[BH KONVER] Client-side fallback:", clientErr.message);
            blob = await onConvert(file, format, true, setProgress);
          } else {
            throw clientErr;
          }
        }
      } else if (onConvert) {
        blob = await onConvert(file, format, true, setProgress);
      } else {
        throw new Error("No conversion handler available");
      }
      setResultUrl(URL.createObjectURL(blob));
      setStep("download");
      conversionSucceeded = true;
      toast({ title: t('conversion.success'), description: `${file.name} → .${format}` });
    } catch (error) {
      console.error("[BH KONVER] Conversion failed:", error);
      setStep("upload");
      toast({ variant: "destructive", title: t('conversion.error'), description: String(error) });

      // Log failure to server_errors (fire-and-forget)
      supabase.auth.getSession().then(({ data: { session } }) => {
        supabase.from("server_errors" as any).insert({
          error_message: String(error),
          error_code: "CLIENT_CONVERSION_FAILED",
          file_name: file.name,
          from_format: ext,
          to_format: format,
          file_size_kb: Math.round(file.size / 1024),
          user_email: session?.user?.email || "anonymous",
        }).then(({ error: dbErr }) => {
          if (dbErr) console.warn("[BH KONVER] Failed to log error:", dbErr.message);
        });
      });
    } finally {
      setIsConverting(false);
      setProgress(null);
    }

    // ONLY log to conversion_logs on SUCCESS
    if (conversionSucceeded) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        supabase.from("conversion_logs").insert({
          from_format: ext,
          to_format: format,
          file_size_kb: Math.round(file.size / 1024),
          user_email: session?.user?.email || "anonymous",
        }).then(({ error }) => {
          if (error) console.warn("[BH KONVER] Failed to log conversion:", error.message);
        });
      });
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setStep("upload");
    onConvertAnother();
  };

  return (
    <Card className="p-6 border border-border bg-card">
      <StepProgress currentStep={step} />

      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatSize(file.size)}</span>
              {isClientSide && (
                <span className="inline-flex items-center gap-0.5 bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded text-[10px] font-medium">
                  <Zap className="w-2.5 h-2.5 text-accent" /> Local
                </span>
              )}
            </div>
          </div>
        </div>
        {!resultUrl && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onRemove}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {progress && <ProgressBar stage={progress.stage} percent={progress.percent} />}

      {!resultUrl ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{t('conversion.selectFormat')}</p>
            <FormatGrid formats={availableFormats} selected={format} onSelect={(f) => setFormat(f as typeof format)} />
          </div>
          <Button
            onClick={handleConversion}
            disabled={isConverting || availableFormats.length === 0}
            className="w-full h-11 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isConverting ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
            {isConverting ? t('conversion.converting') : `${t('conversion.convert')} → ${format.toUpperCase()}`}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Button asChild className="w-full h-11 text-sm font-medium gradient-gold text-accent-foreground hover:opacity-90">
            <a href={resultUrl} download={`${file.name.replace(/\.[^/.]+$/, "")}.${format}`}>
              <Download className="mr-2 w-4 h-4" /> {t('conversion.download')}
            </a>
          </Button>
          <Button variant="outline" className="w-full h-11 text-sm" onClick={handleReset}>
            <RotateCcw className="mr-2 w-4 h-4" /> {t('conversion.convert')}
          </Button>
        </div>
      )}
    </Card>
  );
};
