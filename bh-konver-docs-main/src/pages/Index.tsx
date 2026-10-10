import { lazy, Suspense, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleHelp, Search, X } from "lucide-react";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { HomeModuleGrid } from "@/components/HomeModuleGrid";
import { ConversionShowcase } from "@/components/ConversionShowcase";
import { HomeLocalUseCases } from "@/components/HomeLocalUseCases";
import { SEO, SITE_URL } from "@/components/SEO";
import { AdSenseSlot } from "@/components/AdSenseSlot";
import { LazyRenderOnView } from "@/components/LazyRenderOnView";
import { FreemiumPaywallModal } from "@/components/free-tools/FreemiumPaywallModal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useFreeQuota } from "@/hooks/useFreeQuota";
import type { ToolCatalogItem } from "@/lib/toolCatalog";
import { trackSubscriptionSelect, trackToolCardClick } from "@/lib/analytics";

const PricingSection = lazy(() => import("@/components/PricingSection").then((module) => ({ default: module.PricingSection })));
const CurrencyConverter = lazy(() => import("@/components/CurrencyConverter").then((module) => ({ default: module.CurrencyConverter })));
const PayPalPaymentModal = lazy(() => import("@/components/PayPalPaymentModal").then((module) => ({ default: module.PayPalPaymentModal })));

const FAQ_ITEMS = [
  {
    question: "Šta je BH KONVER i kome je namijenjen?",
    answer: "BH KONVER je digitalna platforma s alatima, konverterima, generatorima i kalkulatorima na jednom mjestu. Namijenjena je svima koji rade s tekstom, valutama i mjernim jedinicama, kao i korisnicima kojima trebaju brzi digitalni alati i izračuni.",
  },
  {
    question: "Koje opcije su potpuno besplatne (Freemium)?",
    answer: "Osnovni konverteri dostupni su odmah, bez registracije: konverter jedinica, konverter valuta (KM, EUR, USD, CHF, GBP), ćirilica/latinica, Text Case, hidžretski datum, dužina, rimski brojevi i datumi te temperatura.",
  },
  {
    question: "Šta obuhvataju Premium opcije?",
    answer: "Generatori (UUID, QR kod, Slug i Barcode), kalkulatori (PDV, radni staž, potrošnja struje i gorivo) i testovi (opšte znanje, IQ/logika, saobraćaj i ličnost) dostupni su korisnicima s aktivnom plaćenom pretplatom.",
  },
  {
    question: "Kako funkcioniše naplata i pristup Premium alatima?",
    answer: "Pristup se provjerava prema aktivnim i evidentiranim transakcijama u Supabaseu. Nakon potvrde uplate i aktivne pretplate Premium alati se otključavaju. Pokušaj pristupa bez aktivne pretplate prikazuje prozor s ponudama za nadogradnju.",
  },
  {
    question: "Da li se moji podaci i konverzije čuvaju na serveru?",
    answer: "Većina tekstualnih, jediničnih i drugih osnovnih konverzija izvršava se lokalno u pregledniku. Pojedine cloud funkcije zahtijevaju serversku obradu; privremeni fajlovi iz tih obrada označavaju se za automatsko čišćenje u dnevnom ciklusu. Detalji su u Politici privatnosti.",
  },
  {
    question: "Gdje mogu pronaći pravne informacije i kontakt podatke?",
    answer: "Uslovi korištenja, Politika privatnosti, sigurnost, kolačići, pravne napomene i kontakt dostupni su u Footeru. Ti linkovi se otvaraju u novom tabu kako biste mogli nastaviti rad na platformi.",
  },
];

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const { exhausted } = useFreeQuota();
  const isPremium = isAdmin || hasActiveSubscription;
  const hasPaidSubscription = Boolean(user && hasActiveSubscription);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [premiumPaywallOpen, setPremiumPaywallOpen] = useState(false);
  const [premiumRedirectPath, setPremiumRedirectPath] = useState("/alati");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("24h");
  const [searchQuery, setSearchQuery] = useState("");

  const openTool = useCallback((tool: ToolCatalogItem) => {
    const locked = !isPremium && (tool.access === "pro" || (tool.access === "quota" && exhausted));
    trackToolCardClick({ slug: tool.slug, access: tool.access, locked });
    if (locked) {
      setPremiumPaywallOpen(false);
      setPremiumRedirectPath("/alati");
      setPaywallOpen(true);
      return;
    }
    navigate(tool.href);
  }, [exhausted, isPremium, navigate]);

  const openPremiumCategory = useCallback((route: string) => {
    const path = route.startsWith("/") ? route : `/category/${route}`;
    if (!hasPaidSubscription) {
      setPremiumRedirectPath(path);
      setPremiumPaywallOpen(true);
      setPaywallOpen(true);
      return;
    }
    navigate(path);
  }, [hasPaidSubscription, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title="BH KONVER | Besplatni online konverteri i Premium alati"
          description="Besplatni konverteri jedinica, valuta, teksta i datuma dostupni bez prijave. BH KONVER nudi i Premium generatore, kalkulatore i kvizove."
        path="/"
        jsonLd={[
          { "@type": "WebPage", name: "BH KONVER", url: `${SITE_URL}/`, description: "Besplatni konverteri jedinica, valuta, teksta i datuma te Premium generatori, kalkulatori i testovi za BiH." },
          { "@type": "FAQPage", mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
        ]}
      />
      <PremiumHeader user={user} isAdmin={isAdmin} isPremium={isPremium} expiresAt={expiresAt} onSignOut={signOut} loading={loading} />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/25 px-4 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase text-primary">BH KONVER · BOSNA I HERCEGOVINA</p>
            <h1 className="mx-auto mt-4 max-w-4xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Svi digitalni alati na jednom mjestu – <span className="text-primary">BH KONVER</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Brza i sigurna obrada konverzija, generatora, kalkulatora i testova
            </p>
            <form role="search" onSubmit={(event) => event.preventDefault()} className="mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-lg border border-border bg-background px-4 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Pretražite alate, npr. QR, PDV, Valute, Staž..."
                aria-label="Pretraži sve alate"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
              />
              {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label="Očisti pretragu" className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button>}
            </form>
          </div>
        </section>

        <HomeModuleGrid isPremium={isPremium} hasPaidSubscription={hasPaidSubscription} quotaExhausted={exhausted} searchQuery={searchQuery} onOpen={openTool} onOpenPremiumRoute={openPremiumCategory} />

        <div className="container mx-auto max-w-6xl px-4 py-4"><AdSenseSlot slotId="home-after-tools" /></div>

        <section className="border-y border-border bg-muted/35 py-14">
          <div className="container mx-auto max-w-5xl px-4"><ConversionShowcase /></div>
        </section>

        <HomeLocalUseCases />

        <div className="container mx-auto max-w-6xl px-4 py-4"><AdSenseSlot slotId="home-before-faq" /></div>

        <section className="border-y border-border bg-muted/20 py-12 sm:py-16" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><CircleHelp className="h-5 w-5" aria-hidden="true" /></span>
              <div><p className="text-xs font-semibold uppercase text-primary">POMOĆ I INFORMACIJE</p><h2 id="faq-heading" className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Česta pitanja</h2></div>
            </div>
            <Accordion type="single" collapsible className="rounded-lg border border-border bg-card px-4 sm:px-6">
              {FAQ_ITEMS.map(({ question, answer }, index) => (
                <AccordionItem key={question} value={`faq-${index + 1}`}>
                  <AccordionTrigger className="gap-4 text-left text-sm font-semibold text-foreground hover:no-underline sm:text-base">{question}</AccordionTrigger>
                  <AccordionContent className="max-w-3xl text-sm leading-6 text-muted-foreground">{answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="pricing" className="container mx-auto max-w-5xl px-4 py-14">
          <LazyRenderOnView fallback={<div className="min-h-[28rem]" aria-hidden="true" />}>
            <Suspense fallback={<div className="min-h-[28rem]" aria-hidden="true" />}>
              <PricingSection onSelectPlan={(tier) => { trackSubscriptionSelect({ planId: tier.id, price: parseFloat(tier.price) }); setSelectedPlanId(tier.id); setPaymentModalOpen(true); }} />
            </Suspense>
          </LazyRenderOnView>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-12">
          <LazyRenderOnView fallback={<div className="min-h-[24rem]" aria-hidden="true" />}>
            <Suspense fallback={<div className="min-h-[24rem]" aria-hidden="true" />}>
                <div className="mx-auto max-w-md"><CurrencyConverter /></div>
            </Suspense>
          </LazyRenderOnView>
        </section>
      </main>

      <FreemiumPaywallModal
        open={paywallOpen}
        onOpenChange={(open) => { setPaywallOpen(open); if (!open) setPremiumPaywallOpen(false); }}
        title={premiumPaywallOpen ? "Premium pristup" : undefined}
        description={premiumPaywallOpen ? "Generatori, kalkulatori i testovi dostupni su uz aktivnu plaćenu Premium pretplatu." : undefined}
        redirectPath={premiumRedirectPath}
      />
      {paymentModalOpen && <Suspense fallback={null}><PayPalPaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} initialPlanId={selectedPlanId} /></Suspense>}
      <PremiumFooter />
    </div>
  );
};

export default Index;