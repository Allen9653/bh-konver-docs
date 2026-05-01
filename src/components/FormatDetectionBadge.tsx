import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { detectFormat, hasExtensionMismatch, type DetectedFormat } from "@/utils/formatDetector";

interface FormatDetectionBadgeProps {
  file: File;
  onDetected?: (detected: DetectedFormat, mismatch: boolean) => void;
}

export const FormatDetectionBadge = ({ file, onDetected }: FormatDetectionBadgeProps) => {
  const { t } = useTranslation();
  const [detected, setDetected] = useState<DetectedFormat | null>(null);
  const [mismatch, setMismatch] = useState(false);

  useEffect(() => {
    let cancelled = false;
    detectFormat(file).then((d) => {
      if (cancelled) return;
      const mm = hasExtensionMismatch(file, d);
      setDetected(d);
      setMismatch(mm);
      onDetected?.(d, mm);
    });
    return () => {
      cancelled = true;
    };
  }, [file, onDetected]);

  if (!detected) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>{t("formatDetection.detecting", "Detecting format...")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
          mismatch
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        }`}
        aria-live="polite"
      >
        {mismatch ? (
          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
        ) : (
          <ShieldCheck className="w-3 h-3" aria-hidden="true" />
        )}
        <span>
          {t("formatDetection.detected", "Detected")}: {detected.label}
        </span>
      </div>
      {mismatch && (
        <p className="text-[11px] text-destructive">
          {t(
            "formatDetection.mismatchWarning",
            "File extension does not match detected content. Conversion will use detected format."
          )}
        </p>
      )}
    </div>
  );
};
