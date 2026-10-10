import { lazy, Suspense, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Crown, Download, FileUp, Lock, Settings2 } from "lucide-react";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { PremiumDropzone } from "@/components/PremiumDropzone";
import { PreviewPanel } from "@/components/PreviewPanel";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreemiumPaywallModal } from "@/components/free-tools/FreemiumPaywallModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useConversionEngine } from "@/hooks/useConversionEngine";
import type { PDFOperation } from "@/types/pdfOperations";

const BatchConversionPanel = lazy(() => import("@/components/BatchConversionPanel").then((module) => ({ default: module.BatchConversionPanel })));
const PDFToolsInterface = lazy(() => import("@/components/PDFToolsInterface").then((module) => ({ default: module.PDFToolsInterface })));
const UnitConverter = lazy(() => import("@/components/UnitConverter").then((module) => ({ default: module.UnitConverter })));
const CurrencyConverter = lazy(() => import("@/components/CurrencyConverter").then((module) => ({ default: module.CurrencyConverter })));

type ModuleConfig = {
  titleKey: string;
  descriptionKey: string;
  formats: string[];
  access: "free" | "pro";
  pdfOperation?: PDFOperation;
  kind?: "converters";
};

const MODULES: Record<string, ModuleConfig> = {
  audio: { titleKey: "modules.audio.name", descriptionKey: "modules.audio.description", formats: ["mp3", "ogg", "wav", "m4a", "aac", "flac"], access: "pro" },
  video: { titleKey: "modules.video.name", descriptionKey: "modules.video.description", formats: ["mp4", "mov", "avi", "webm", "mkv", "flv"], access: "pro" },
  "kompresuj-pdf": { titleKey: "homeTools.items.compressPdf.title", descriptionKey: "homeTools.items.compressPdf.description", formats: ["pdf"], access: "pro", pdfOperation: "compress-pdf" },
  "vodeni-zig": { titleKey: "homeTools.items.watermark.title", descriptionKey: "homeTools.items.watermark.description", formats: ["pdf"], access: "pro", pdfOperation: "add-watermark" },
  jedinice: { titleKey: "homeTools.items.units.title", descriptionKey: "homeTools.items.units.description", formats: [], access: "free", kind: "converters" },
};

const ModulePage = () => {
  const { moduleSlug = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const config = MODULES[moduleSlug];
  const { user, isAdmin, signOut, loading } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const isPremium = isAdmin || hasActiveSubscription;
  const requiresPro = config?.access === "pro" && !isPremium;
  const [files, setFiles] = useState<File[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const convert = useConversionEngine({ canConvert: !requiresPro, onAccessDenied: () => setPaywallOpen(true) });
  const title = useMemo(() => (config ? t(config.titleKey) : t("modulePage.notFound")), [config, t]);

  if (!config) {
    navigate("/", { replace: true });
    return null;
  }

  const steps = [
    { icon: FileUp, label: t("modulePage.steps.upload") },
    { icon: Settings2, label: t("modulePage.steps.format") },
    { icon: Download, label: t("modulePage.steps.download") },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={t(`toolSeo.${moduleSlug}.title`, { defaultValue: `${title} | BH Konver` })}
        description={t(`toolSeo.${moduleSlug}.description`, { defaultValue: t(config.descriptionKey) })}
        path={`/modul/${moduleSlug}`}
      />
      <PremiumHeader user={user} isAdmin={isAdmin} isPremium={isPremium} expiresAt={expiresAt} onSignOut={signOut} loading={loading} />
      <main className="flex-1">
        <section className="border-b border-border bg-primary py-10 text-primary-foreground">
          <div className="container mx-auto max-w-5xl px-4">
            <Button variant="ghost" className="mb-5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("common.back")}
            </Button>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-primary-foreground/80">{t(config.descriptionKey)}</p>
          </div>
        </section>

        {config.kind !== "converters" && (
          <section className="border-b border-border bg-muted/30 py-6">
            <div className="container mx-auto grid max-w-5xl gap-3 px-4 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{index + 1}. {step.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="container mx-auto max-w-5xl px-4 py-10">
          {requiresPro ? (
            <Card className="mx-auto max-w-xl border-primary/25 p-8 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><Lock className="h-6 w-6" /></span>
              <h2 className="font-display text-xl font-semibold">{t("modulePage.proLockedTitle")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("modulePage.proLockedText")}</p>
              <Button className="mt-5" onClick={() => setPaywallOpen(true)}><Crown className="mr-2 h-4 w-4" /> {t("homeTools.unlock")}</Button>
            </Card>
          ) : config.kind === "converters" ? (
            <Suspense fallback={<div className="min-h-80 animate-pulse rounded-lg bg-muted" />}>
              <div className="grid gap-6 lg:grid-cols-2">
                <UnitConverter />
                <CurrencyConverter />
              </div>
            </Suspense>
          ) : config.pdfOperation ? (
            <Suspense fallback={<div className="min-h-80 animate-pulse rounded-lg bg-muted" />}>
              <PDFToolsInterface operation={config.pdfOperation} onBack={() => navigate("/")} />
            </Suspense>
          ) : files.length === 0 ? (
            <PremiumDropzone onFilesSelected={setFiles} acceptedFormats={config.formats} />
          ) : (
            <div className="space-y-6">
              <PreviewPanel inputFile={files[0]} />
              <Suspense fallback={<div className="min-h-80 animate-pulse rounded-lg bg-muted" />}>
                <BatchConversionPanel files={files} onConvert={convert} onRemove={(index) => setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))} onConvertAnother={() => setFiles([])} />
              </Suspense>
            </div>
          )}
        </div>
      </main>
      <FreemiumPaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
      <PremiumFooter />
    </div>
  );
};

export default ModulePage;
