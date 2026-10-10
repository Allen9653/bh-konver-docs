import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle2, FileText, Image as ImageIcon } from "lucide-react";
import { UploadDocIcon, DownloadDocIcon, PreviewDocIcon, ConvertArrowsIcon } from "@/components/icons/ConversionIcons";

/**
 * "Before / after" preview cards with micro-animations.
 * Purely presentational — demonstrates the conversion flow visually.
 */
export const ConversionShowcase = () => {
  const { t } = useTranslation();
  const [converting, setConverting] = useState(true);

  useEffect(() => {
    const loop = setInterval(() => setConverting((c) => !c), 3200);
    return () => clearInterval(loop);
  }, []);

  return (
    <section className="w-full">
      <div className="text-center mb-8 animate-fade-up">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground">{t("visual.showcaseTitle")}</h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">{t("visual.showcaseSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
        {/* BEFORE */}
        <article className="animate-fade-up hover-lift rounded-2xl border border-border bg-card p-5 shadow-sm">
          <header className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("visual.before")}
            </span>
            <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">PDF</span>
          </header>

          <div className="relative flex h-44 items-center gap-4 overflow-hidden rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-md border border-primary/25 bg-card text-primary shadow-sm">
              <FileText className="h-8 w-8" aria-hidden="true" />
              <span className="mt-1 text-[10px] font-bold">PDF</span>
            </div>
            <div className="min-w-0 flex-1 space-y-2.5" aria-hidden="true">
              <div className="h-3 w-3/4 rounded bg-muted-foreground/30" />
              <div className="h-3 w-2/3 rounded bg-muted-foreground/25" />
              <div className="h-3 w-5/6 rounded bg-muted-foreground/20" />
              <div className="h-3 w-1/2 rounded bg-muted-foreground/15" />
              <div className="h-3 w-4/6 rounded bg-muted-foreground/15" />
            </div>
            {converting && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-accent/25 to-transparent animate-scan" />
            )}
          </div>

          <footer className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("visual.source")}</span>
            <span className="inline-flex items-center gap-1.5 text-primary">
              <UploadDocIcon size={18} className="icon-tilt" /> {t("visual.upload")}
            </span>
          </footer>
        </article>

        {/* MIDDLE STATUS */}
        <div className="flex md:flex-col items-center justify-center gap-3 py-2">
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" aria-hidden="true" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
              {converting ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
            </span>
          </div>
          <ConvertArrowsIcon size={30} className="text-primary md:rotate-90 animate-arrow-flow" />
          <span aria-live="polite" className="text-xs font-medium text-muted-foreground text-center">
            {converting ? t("visual.converting") : t("visual.done")}
          </span>
        </div>

        {/* AFTER */}
        <article className="animate-fade-up-delay-2 hover-lift rounded-2xl border border-accent/40 bg-card p-5 shadow-sm">
          <header className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("visual.after")}
            </span>
            <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">JPEG</span>
          </header>

          <div className="relative h-44 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/80 to-accent/80">
            <div className="absolute left-4 top-4 h-7 w-7 rounded-full bg-card/85" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-card/25 [clip-path:polygon(0%_60%,25%_20%,45%_50%,60%_35%,100%_75%,100%_100%,0%_100%)]" />
            <div className="absolute bottom-3 left-3 flex h-14 w-14 flex-col items-center justify-center rounded-md bg-card/90 text-accent shadow-sm">
              <ImageIcon className="h-6 w-6" aria-hidden="true" />
              <span className="mt-0.5 text-[9px] font-bold">JPEG</span>
            </div>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-[10px] font-semibold text-foreground">
              <PreviewDocIcon size={12} /> {t("visual.previewLabel")}
            </span>
          </div>

          <footer className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("visual.result")}</span>
            <span className="inline-flex items-center gap-1.5 text-accent">
              <DownloadDocIcon size={18} className="icon-tilt" /> {t("visual.download")}
            </span>
          </footer>
        </article>
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        {[t("visual.pages"), t("visual.quality"), t("visual.localProcessing")].map((label) => (
          <li key={label} className="rounded-full border border-border bg-card px-3 py-1.5">
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
};
