import { lazy, Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PremiumHeader } from "@/components/PremiumHeader";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { PremiumFooter } from "@/components/PremiumFooter";
import { PremiumDropzone } from "@/components/PremiumDropzone";
import { ModuleTabs } from "@/components/ModuleTabs";
import { LazyRenderOnView } from "@/components/LazyRenderOnView";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn, Sparkles, Shield, Zap, LockOpen, ArrowRight, ScrollText, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import type { ConversionModule } from "@/types/formats";
import type { PDFOperation } from "@/types/pdfOperations";
import type { ConversionProgress } from "@/utils/clientConverter";

const BatchConversionPanel = lazy(() => import("@/components/BatchConversionPanel").then((module) => ({ default: module.BatchConversionPanel })));
const UnitConverter = lazy(() => import("@/components/UnitConverter").then((module) => ({ default: module.UnitConverter })));
const PDFToolsSelector = lazy(() => import("@/components/PDFToolsSelector").then((module) => ({ default: module.PDFToolsSelector })));
const PDFToolsInterface = lazy(() => import("@/components/PDFToolsInterface").then((module) => ({ default: module.PDFToolsInterface })));
const PricingSection = lazy(() => import("@/components/PricingSection").then((module) => ({ default: module.PricingSection })));
const SponsorBanners = lazy(() => import("@/components/SponsorBanners").then((module) => ({ default: module.SponsorBanners })));
const CurrencyConverter = lazy(() => import("@/components/CurrencyConverter").then((module) => ({ default: module.CurrencyConverter })));
const PayPalPaymentModal = lazy(() => import("@/components/PayPalPaymentModal").then((module) => ({ default: module.PayPalPaymentModal })));

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [selectedModule, setSelectedModule] = useState<ConversionModule>("image");
  const [selectedPDFTool, setSelectedPDFTool] = useState<PDFOperation | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("24h");
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const welcomeShown = useRef(false);

  // Show welcome toast when user logs in
  useEffect(() => {
    if (user && !welcomeShown.current) {
      welcomeShown.current = true;
      const name = user.email?.split("@")[0] || "";
      toast({
        title: `👋 ${t('dashboard.welcome', { name })}`,
        description: t('dashboard.welcomeDescription'),
      });
    }
    if (!user) {
      welcomeShown.current = false;
    }
  }, [user, t, toast]);

  const canAccessModules = !!user;
  const isPremiumUser = isAdmin || hasActiveSubscription;

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const pollForJobCompletion = async (
    jobId: string,
    onProgress?: (p: ConversionProgress) => void
  ): Promise<Blob> => {
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // 60 × 2s = 2 minutes
    while (attempts < MAX_ATTEMPTS) {
      const { data: job, error } = await supabase
        .from("processing_jobs")
        .select("status, progress, result_url, error")
        .eq("id", jobId)
        .single();
      if (error) throw new Error("Error checking conversion status");
      if (typeof job.progress === "number") {
        onProgress?.({
          stage: "Konvertovanje na serveru...",
          percent: Math.min(95, 50 + Math.round(job.progress * 0.45)),
        });
      }
      if (job.status === "completed" && job.result_url) {
        onProgress?.({ stage: "Preuzimanje rezultata...", percent: 98 });
        const response = await fetch(job.result_url);
        if (!response.ok) throw new Error("Link za preuzimanje je istekao. Pokušajte ponovo.");
        return await response.blob();
      }
      if (job.status === "failed") throw new Error(job.error || "Konverzija nije uspjela na serveru.");
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
    }
    throw new Error(
      "Konverzija je istekla nakon 2 minute. Fajl je možda prevelik ili je server preopterećen — pokušajte ponovo ili sa manjim fajlom."
    );
  };

  const handleConvert = async (
    file: File,
    targetFormat: string,
    needsBackend: boolean,
    onProgress?: (p: ConversionProgress) => void
  ): Promise<Blob> => {
    // Paywall: only premium users (admin or active subscription) can convert
    if (!isPremiumUser) {
      setPaymentModalOpen(true);
      throw new Error("Potrebna je aktivna pretplata za konverziju fajlova.");
    }

    const [{ canConvertClientSide, convertClientSide }, { convertFile }] = await Promise.all([
      import("@/utils/clientConverter"),
      import("@/utils/pdfConverter"),
    ]);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (canConvertClientSide(ext, targetFormat)) {
      return await convertClientSide(file, targetFormat, onProgress);
    }
    if (needsBackend) {
      onProgress?.({ stage: "Uploading na server...", percent: 10 });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetFormat", targetFormat);

      // Provjeri sesiju SA obradom greške I vremenskim ograničenjem —
      // ako je sesija istekla, provjera ne uspije, ili se zaglavi
      // (nikad ne razriješi), korisnik dobija jasnu poruku umjesto da
      // se aplikacija zaglavi zauvijek na "Uploading na server...".
      let session;
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("TIMEOUT_SESSION_CHECK")), 10000)
          ),
        ]);
        if (sessionResult.error) throw sessionResult.error;
        session = sessionResult.data.session;
      } catch (sessionErr) {
        console.error("Greška pri provjeri sesije:", sessionErr);
        throw new Error("Sesija je istekla. Molimo odjavite se i ponovo prijavite, pa pokušajte opet.");
      }
      if (!session?.access_token) {
        throw new Error("Morate biti prijavljeni za konverziju fajlova. Molimo prijavite se ponovo.");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      onProgress?.({ stage: "Konvertovanje na serveru...", percent: 30 });

      // Use AbortController with 120s timeout for large file uploads
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      let response: Response;
      try {
        response = await fetch(`${supabaseUrl}/functions/v1/convert-document`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, apikey: apikey },
          body: formData,
          signal: controller.signal,
        });
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
          throw new Error("Upload je istekao. Fajl je možda prevelik za serversku obradu. Pokušajte sa manjim fajlom.");
        }
        throw new Error("Greška pri povezivanju sa serverom. Provjerite internet konekciju.");
      }
      clearTimeout(timeoutId);

      if (response.status === 202) {
        const asyncData = await response.json();
        onProgress?.({ stage: "Čekanje rezultata...", percent: 50 });
        if (asyncData.job_id) return await pollForJobCompletion(asyncData.job_id, onProgress);
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Konverzija na serveru nije uspjela.");
      }
      onProgress?.({ stage: "Završeno!", percent: 100 });
      return await response.blob();
    }
    return await convertFile(file, targetFormat);
  };

  const getAcceptedFormats = () => {
    switch (selectedModule) {
      case "video": return ["mp4", "mov", "avi", "webm", "mkv", "flv"];
      case "audio": return ["mp3", "ogg", "wav", "m4a", "aac", "flac"];
      case "image": return ["webp", "heic", "png", "jpg", "jpeg", "jfif", "svg"];
      case "document": return ["pdf", "docx", "doc", "epub", "txt", "pptx", "ppt", "xlsx", "xls"];
      case "gif": return ["gif", "apng", "mp4", "mov", "webm"];
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="BH Konver — Konverzija PDF, JPEG, dokumenata i medija"
        description="Brza i sigurna konverzija PDF u JPEG, dokumenata, slika, audia i videa. Lokalna obrada u pretraživaču bez slanja na server."
        path="/"
      />
      <PremiumHeader
        user={user}
        isAdmin={isAdmin}
        isPremium={isPremiumUser}
        expiresAt={expiresAt}
        onSignOut={signOut}
      />

      <main className="flex-1">
        {/* Hero Section with City Carousel */}
        <section className="relative w-full overflow-hidden text-white" style={{ minHeight: "min(80vh, 640px)" }}>
          <HeroCarousel />
          {/* Dark overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-[1]" />
          <div className="relative z-[2] py-20 px-4 min-h-[inherit] flex items-center" style={{ minHeight: "min(80vh, 640px)" }}>
            <div className="container mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-base mb-6">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>{t('hero.version')}</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight mb-3 drop-shadow-lg">
                BH <span className="text-accent">KONVER</span>
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-white max-w-2xl mx-auto mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground rounded-full px-4 py-2 text-sm font-semibold">
                  <Sparkles className="w-4 h-4" /> 100% Besplatno
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <LockOpen className="w-4 h-4" /> Bez registracije
                </span>
              </div>
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8 py-3 h-auto mb-6">
                <Link to="/alati">Otvori besplatne alate <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <div className="flex flex-wrap justify-center gap-6 text-base text-white/90">
                <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-accent" /> {t('transparency.nosharing.title')}</div>
                <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent" /> {t('pricing.day.feature3')}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-3xl py-10">
          {/* Module Tabs */}
          <ModuleTabs
            selected={selectedModule}
            onSelect={(module) => {
              if (module === "unit" || canAccessModules) {
                setSelectedModule(module);
                setFiles([]);
                setSelectedPDFTool(null);
              } else {
                navigate("/auth");
              }
            }}
            locked={!canAccessModules}
          />

          {/* Content */}
          {selectedModule === "unit" ? (
            <Suspense fallback={<div className="min-h-[16rem]" aria-hidden="true" />}>
              <UnitConverter />
            </Suspense>
          ) : !canAccessModules ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-sm text-muted-foreground">{t('quickActions.guestDescription')}</p>
              <Button onClick={() => navigate("/auth")} className="h-10 bg-primary hover:bg-primary/90">
                <LogIn className="mr-2 h-4 w-4" /> {t('quickActions.login')}
              </Button>
            </div>
          ) : selectedPDFTool ? (
            <Suspense fallback={<div className="min-h-[20rem]" aria-hidden="true" />}>
              <PDFToolsInterface operation={selectedPDFTool} onBack={() => setSelectedPDFTool(null)} />
            </Suspense>
          ) : selectedModule === "pdf-tools" ? (
            <Suspense fallback={<div className="min-h-[20rem]" aria-hidden="true" />}>
              <PDFToolsSelector onSelectTool={(tool) => setSelectedPDFTool(tool)} />
            </Suspense>
          ) : (
            <div className="space-y-6">
              {files.length === 0 ? (
                <PremiumDropzone onFilesSelected={handleFilesSelected} acceptedFormats={getAcceptedFormats()} />
              ) : (
                <Suspense fallback={<div className="min-h-[20rem]" aria-hidden="true" />}>
                  <BatchConversionPanel
                    files={files}
                    onConvert={handleConvert}
                    onRemove={handleRemove}
                    onConvertAnother={() => setFiles([])}
                  />
                </Suspense>
              )}
            </div>
          )}

          {/* Legal documents section card */}
          <div className="mt-12">
            <Link
              to="/pravni-dokumenti"
              className="group block rounded-xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/5 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <ScrollText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold font-display">Pravni dokumenti i ovjerene izjave</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-semibold">
                      <Crown className="w-3 h-3" /> NOVO
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generišite izjave date pod materijalnom i kaznenom odgovornošću, usklađene sa propisima BiH (FBiH, RS, Brčko Distrikt). Privatno, u vašem pretraživaču.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:gap-2 transition-all">
                    Otvori pravne dokumente <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>


          {/* Pricing */}
          <div className="mt-16" id="pricing">
            <LazyRenderOnView fallback={<div className="min-h-[28rem]" aria-hidden="true" />}>
              <Suspense fallback={<div className="min-h-[28rem]" aria-hidden="true" />}>
                <PricingSection onSelectPlan={(tier) => {
                  setSelectedPlanId(tier.id);
                  setPaymentModalOpen(true);
                }} />
              </Suspense>
            </LazyRenderOnView>
          </div>

          {paymentModalOpen ? (
            <Suspense fallback={null}>
              <PayPalPaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} initialPlanId={selectedPlanId} />
            </Suspense>
          ) : null}
        </div>

        {/* Currency Converter with Sponsor Banners - wider container */}
        <div className="mt-12 max-w-6xl mx-auto px-4 pb-10">
          <LazyRenderOnView fallback={<div className="min-h-[24rem]" aria-hidden="true" />}>
            <Suspense fallback={<div className="min-h-[24rem]" aria-hidden="true" />}>
              <SponsorBanners>
                <CurrencyConverter />
              </SponsorBanners>
            </Suspense>
          </LazyRenderOnView>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default Index;