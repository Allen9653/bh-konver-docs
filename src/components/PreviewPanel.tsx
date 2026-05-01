import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, FileText, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerURL from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL;

type PreviewKind = "image" | "pdf" | "none";

const previewKindFor = (file: File | Blob, name?: string): PreviewKind => {
  const type = file.type || "";
  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf") return "pdf";
  if (name) {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext && ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
  }
  return "none";
};

const renderPdfFirstPage = async (file: File | Blob): Promise<string> => {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport } as any).promise;
  return canvas.toDataURL("image/png");
};

const PreviewSlot = ({ file, name, label }: { file: File | Blob; name?: string; label: string }) => {
  const { t } = useTranslation();
  const [src, setSrc] = useState<string | null>(null);
  const [kind, setKind] = useState<PreviewKind>("none");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const k = previewKindFor(file, name);
    setKind(k);
    setLoading(true);
    setError(null);
    setSrc(null);

    if (k === "image") {
      objectUrl = URL.createObjectURL(file);
      setSrc(objectUrl);
      setLoading(false);
    } else if (k === "pdf") {
      renderPdfFirstPage(file)
        .then((dataUrl) => {
          if (!cancelled) {
            setSrc(dataUrl);
            setLoading(false);
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setError(String(e));
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, name]);

  const Icon = kind === "pdf" ? FileText : ImageIcon;

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="aspect-[4/3] rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden relative">
        {loading && (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground" aria-live="polite">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[11px]">{t("preview.loading", "Loading preview...")}</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground p-4 text-center">
            <Icon className="w-6 h-6" aria-hidden="true" />
            <span className="text-[11px]">{t("preview.unavailable", "Preview unavailable")}</span>
          </div>
        )}
        {!loading && !error && kind === "none" && (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground p-4 text-center">
            <Icon className="w-6 h-6" aria-hidden="true" />
            <span className="text-[11px]">{t("preview.noPreview", "No visual preview for this format")}</span>
          </div>
        )}
        {!loading && !error && src && (
          <img
            src={src}
            alt={label}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
};

interface PreviewPanelProps {
  inputFile: File;
  outputBlob?: Blob | null;
  outputName?: string;
}

export const PreviewPanel = ({ inputFile, outputBlob, outputName }: PreviewPanelProps) => {
  const { t } = useTranslation();
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <p className="text-xs font-medium text-foreground mb-3">
        {t("preview.title", "Visual preview")}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <PreviewSlot file={inputFile} name={inputFile.name} label={t("preview.before", "Before")} />
        {outputBlob ? (
          <PreviewSlot file={outputBlob} name={outputName} label={t("preview.after", "After")} />
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {t("preview.after", "After")}
            </p>
            <div className="aspect-[4/3] rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center">
              <span className="text-[11px] text-muted-foreground">
                {t("preview.pendingConversion", "Convert to see result")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
