import { lazy, Suspense, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Crown, Lock } from "lucide-react";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { PremiumDropzone } from "@/components/PremiumDropzone";
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

const MODULES: Record<string, { titleKey: string; descriptionKey: string; formats: string[]; pdfOperation?: PDFOperation }> = {
  audio: { titleKey: "modules.audio.name", descriptionKey: "modules.audio.description", formats: ["mp3", "ogg", "wav", "m4a", "aac", "flac"] },
  video: { titleKey: "modules.video.name", descriptionKey: "modules.video.description", formats: ["mp4", "mov", "avi", "webm", "mkv", "flv"] },
  "kompresuj-pdf": { titleKey: "homeTools.items.compressPdf.title", descriptionKey: "homeTools.items.compressPdf.description", formats: ["pdf"], pdfOperation: "compress-pdf" },
  "vodeni-zig": { titleKey: "homeTools.items.watermark.title", descriptionKey: "homeTools.items.watermark.description", formats: ["pdf"], pdfOperation: "add-watermark" },
};

const ModulePage = () => {
  const { moduleSlug = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const config = MODULES[moduleSlug];
  const { user, isAdmin, signOut, loading } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const isPremium = isAdmin || hasActiveSubscription;
  const [files, setFiles] = useState<File[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(!isPremium);
  const convert = useConversionEngine({ canConvert: isPremium, onAccessDenied: () => setPaywallOpen(true) });
  const title = useMemo(() => config ? t(config.titleKey) : t("modulePage.notFound"), [config, t]);

  if (!config) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title={`${title} | BH Konver`} description={t(config.descriptionKey)} path={`/modul/${moduleSlug}`} />
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

        <div className="container mx-auto max-w-5xl px-4 py-10">
          {!isPremium ? (
            <Card className="mx-auto max-w-xl border-primary/25 p-8 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><Lock className="h-6 w-6" /></span>
              <h2 className="font-display text-xl font-semibold">{t("modulePage.proLockedTitle")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("modulePage.proLockedText")}</p>
              <Button className="mt-5" onClick={() => setPaywallOpen(true)}><Crown className="mr-2 h-4 w-4" /> {t("homeTools.unlock")}</Button>
            </Card>
          ) : config.pdfOperation ? (
            <Suspense fallback={<div className="min-h-80 animate-pulse rounded-lg bg-muted" />}>
              <PDFToolsInterface operation={config.pdfOperation} onBack={() => navigate("/")} />
            </Suspense>
          ) : files.length === 0 ? (
            <PremiumDropzone onFilesSelected={setFiles} acceptedFormats={config.formats} />
          ) : (
            <Suspense fallback={<div className="min-h-80 animate-pulse rounded-lg bg-muted" />}>
              <BatchConversionPanel files={files} onConvert={convert} onRemove={(index) => setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))} onConvertAnother={() => setFiles([])} />
            </Suspense>
          )}
        </div>
      </main>
      <FreemiumPaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
      <PremiumFooter />
    </div>
  );
};

export default ModulePage;