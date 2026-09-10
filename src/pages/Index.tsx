import { lazy, Suspense, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HeroQuickUpload } from "@/components/HeroQuickUpload";
import { HomeModuleGrid } from "@/components/HomeModuleGrid";
import { ConversionShowcase } from "@/components/ConversionShowcase";
import { HomeLocalUseCases } from "@/components/HomeLocalUseCases";
import { SEO } from "@/components/SEO";
import { LazyRenderOnView } from "@/components/LazyRenderOnView";
import { FreemiumPaywallModal } from "@/components/free-tools/FreemiumPaywallModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useFreeQuota } from "@/hooks/useFreeQuota";
import type { ToolCatalogItem } from "@/lib/toolCatalog";
import { trackSubscriptionSelect, trackToolCardClick } from "@/lib/analytics";

const PricingSection = lazy(() => import("@/components/PricingSection").then((module) => ({ default: module.PricingSection })));
const SponsorBanners = lazy(() => import("@/components/SponsorBanners").then((module) => ({ default: module.SponsorBanners })));
const CurrencyConverter = lazy(() => import("@/components/CurrencyConverter").then((module) => ({ default: module.CurrencyConverter })));
const PayPalPaymentModal = lazy(() => import("@/components/PayPalPaymentModal").then((module) => ({ default: module.PayPalPaymentModal })));

const HERO_BENEFITS = [
  "UREDITE SVOJE .PDF",
  "PRETVORITE DOKUMENT U SLIKU",
  "PRETVORITE TEKST U HTML",
  "PRETVORITE AUDIO U VIDEO",
];

const routeForFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png"].includes(extension || "")) return "/slika-pdf";
  if (extension === "pdf") return "/alati/pdf-u-word";
  if (extension === "docx") return "/alati/word-u-pdf";
  if (["xlsx", "xls"].includes(extension || "")) return "/alati/excel-u-pdf";
  if (extension === "pptx") return "/alati/pptx-u-pdf";
  if (["html", "htm"].includes(extension || "")) return "/alati/html-u-word";
  return "/alati";
};

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const { exhausted } = useFreeQuota();
  const isPremium = isAdmin || hasActiveSubscription;
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("24h");
  const [heroTextTone, setHeroTextTone] = useState<"dark" | "yellow">("dark");
  const heroTextClass = heroTextTone === "yellow" ? "text-gold" : "text-foreground";
  const heroMutedTextClass = heroTextTone === "yellow" ? "text-gold/85" : "text-foreground/80";

  const openTool = useCallback((tool: ToolCatalogItem) => {
    const locked = !isPremium && (tool.access === "pro" || (tool.access === "quota" && exhausted));
    trackToolCardClick({ slug: tool.slug, access: tool.access, locked });
    if (locked) {
      setPaywallOpen(true);
      return;
    }
    navigate(tool.href);
  }, [exhausted, isPremium, navigate]);

  const openUploadedFile = useCallback((file: File) => {
    navigate(routeForFile(file), { state: { initialFile: file } });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title="BH Konver — Konverzija PDF, JPEG, dokumenata i medija"
        description="Brza i sigurna konverzija PDF u JPEG, dokumenata, slika, audia i videa. Lokalna obrada u pretraživaču bez slanja na server."
        path="/"
        jsonLd={{ "@type": "WebPage", name: "BH Konver", url: "https://bh-konver.lovable.app/", description: "Konverzija PDF, slika, dokumenata, audia i videa uz lokalnu obradu u pretraživaču." }}
      />
      <PremiumHeader user={user} isAdmin={isAdmin} isPremium={isPremium} expiresAt={expiresAt} onSignOut={signOut} loading={loading} />

      <main className="flex-1">
        <section className="relative min-h-[620px] overflow-hidden text-primary-foreground sm:min-h-[680px]">
          <HeroCarousel onToneChange={setHeroTextTone} />
          <div className={`absolute inset-0 z-[1] transition-colors duration-500 ${heroTextTone === "yellow" ? "bg-foreground/55" : "bg-card/50"}`} />
          <div className="relative z-[2] flex min-h-[620px] items-center px-4 py-14 sm:min-h-[680px] sm:py-16">
            <div className="container mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="animate-fade-up text-center lg:text-left">
                <p className={`mb-4 text-sm font-semibold uppercase ${heroTextClass}`}>BH KONVER · BiH</p>
                <h1 className={`font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl ${heroTextClass}`}>KONVERZIJA DOKUMENATA</h1>
                <p className={`mt-5 max-w-2xl text-xl font-bold uppercase leading-relaxed sm:text-2xl lg:mx-0 ${heroMutedTextClass}`}>BRZO - SIGURNO - JEFTINO - ANONIMNO</p>
                <ul className="mx-auto mt-7 grid max-w-xl gap-3 text-left text-base font-bold sm:grid-cols-2 sm:text-lg lg:mx-0">
                  {HERO_BENEFITS.map((benefit) => (
                    <li key={benefit} className={`flex items-center gap-2 ${heroTextClass}`}>
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" /> {benefit}
                    </li>
                  ))}
                </ul>
                <div className={`mt-7 flex flex-wrap justify-center gap-5 text-sm font-bold sm:text-base lg:justify-start ${heroMutedTextClass}`}>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-5 w-5 text-accent" /> ANONIMNO</span>
                  <span className="flex items-center gap-1.5"><Zap className="h-5 w-5 text-accent" /> BRZO</span>
                  <span className="flex items-center gap-1.5"><LockKeyhole className="h-5 w-5 text-accent" /> SIGURNO</span>
                </div>
              </div>
              <div className="animate-fade-up-delay-1"><HeroQuickUpload onFileSelected={openUploadedFile} textTone={heroTextTone} /></div>
            </div>
          </div>
        </section>

        <HomeModuleGrid isPremium={isPremium} quotaExhausted={exhausted} onOpen={openTool} />

        <section className="border-y border-border bg-muted/35 py-14">
          <div className="container mx-auto max-w-5xl px-4"><ConversionShowcase /></div>
        </section>

        <HomeLocalUseCases />

        <section id="pricing" className="container mx-auto max-w-5xl px-4 py-14">
          <LazyRenderOnView fallback={<div className="min-h-[28rem]" aria-hidden="true" />}>
            <Suspense fallback={<div className="min-h-[28rem]" aria-hidden="true" />}>
              <PricingSection onSelectPlan={(tier) => { setSelectedPlanId(tier.id); setPaymentModalOpen(true); }} />
            </Suspense>
          </LazyRenderOnView>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-12">
          <LazyRenderOnView fallback={<div className="min-h-[24rem]" aria-hidden="true" />}>
            <Suspense fallback={<div className="min-h-[24rem]" aria-hidden="true" />}>
              <SponsorBanners><CurrencyConverter /></SponsorBanners>
            </Suspense>
          </LazyRenderOnView>
        </section>
      </main>

      <FreemiumPaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
      {paymentModalOpen && <Suspense fallback={null}><PayPalPaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} initialPlanId={selectedPlanId} /></Suspense>}
      <PremiumFooter />
    </div>
  );
};

export default Index;