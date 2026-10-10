import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AppInitializer from "@/components/AppInitializer";
import AnalyticsRouteTracker from "@/components/AnalyticsRouteTracker";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FreemiumPaywallModal } from "@/components/free-tools/FreemiumPaywallModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Crown, LockKeyhole, LogIn } from "lucide-react";
import { ToolInfoGuide } from "@/components/ToolInfoGuide";
import { RouteFallback } from "@/components/RouteFallback";
import { getToolGuide, guideIdForPath } from "@/lib/toolGuides";
import { SEO } from "@/components/SEO";
import Index from "./pages/Index";


const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const History = lazy(() => import("./pages/History"));
const Success = lazy(() => import("./pages/Success"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Support = lazy(() => import("./pages/Support"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Alati = lazy(() => import("./pages/Alati"));
const SlikaPdf = lazy(() => import("./pages/SlikaPdf"));
const SlikaPdfHistory = lazy(() => import("./pages/SlikaPdfHistory"));
const Connect = lazy(() => import("./pages/Connect"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const ModulePage = lazy(() => import("./pages/ModulePage"));
const GorivoKalkulator = lazy(() => import("@/components/calculators/GorivoKalkulator"));
const PdvKalkulator = lazy(() => import("@/components/calculators/PdvKalkulator"));
const StazKalkulator = lazy(() => import("@/components/calculators/StazKalkulator"));
const StrujaKalkulator = lazy(() => import("@/components/calculators/StrujaKalkulator"));
const TestoviHub = lazy(() => import("@/components/testers/TestoviHub"));
const OpsteZnanjeKviz = lazy(() => import("@/components/testers/OpsteZnanjeKviz"));
const IqLogickiTest = lazy(() => import("@/components/testers/IqLogickiTest"));
const SaobracajniTest = lazy(() => import("@/components/testers/SaobracajniTest"));
const TestLicnosti = lazy(() => import("@/components/testers/TestLicnosti"));
const GeneratorsHub = lazy(() => import("@/components/generators/GeneratorsHub"));
const ConvertersHub = lazy(() => import("@/components/converters/ConvertersHub"));

const queryClient = new QueryClient();

const CATEGORY_PATHS: Record<string, string> = {
  Home: "/",
  GENERATORI: "/category/generatori",
  KONVERTORI: "/category/konvertori",
  KALKULATORI: "/category/kalkulatori",
  TESTOVI: "/category/testovi",
  "Privacy Policy": "/privacy",
  Terms: "/terms",
  Security: "/privacy#security",
  Cookies: "/privacy#cookies",
  Legal: "/terms#legal-notice",
  Contact: "/support",
};

const CATEGORY_SLUGS: Record<string, string> = {
  generatori: "GENERATORI",
  konvertori: "KONVERTORI",
  kalkulatori: "KALKULATORI",
  testovi: "TESTOVI",
};

const CALCULATORS = {
  gorivo: GorivoKalkulator,
  pdv: PdvKalkulator,
  staz: StazKalkulator,
  struja: StrujaKalkulator,
};

const PREMIUM_PAGE_SEO: Record<string, { title: string; description: string }> = {
  "/category/generatori": { title: "Premium generatori online | BH KONVER", description: "UUID v4, QR kod, SEO slug i CODE128/EAN barcode generatori za aktivne Premium korisnike BH KONVER-a." },
  "/category/generatori?tab=uuid": { title: "UUID v4 generator | BH KONVER Premium", description: "Generišite više UUID v4 identifikatora, izaberite velika ili mala slova i kopirajte rezultat." },
  "/category/generatori?tab=qr": { title: "QR Code generator | BH KONVER Premium", description: "Kreirajte QR kodove za tekst, URL, e-mail i WiFi te ih preuzmite kao PNG." },
  "/category/generatori?tab=slug": { title: "SEO slug generator | BH KONVER Premium", description: "Pretvorite naslov u čitljiv SEO URL slug uz podršku za bosanska slova." },
  "/category/generatori?tab=barcode": { title: "CODE128 i EAN barcode generator | BH KONVER Premium", description: "Napravite CODE128, EAN-13 i EAN-8 barkodove i izvezite ih kao SVG." },
  "/category/kalkulatori": { title: "Premium kalkulatori: gorivo, PDV, staž i struja | BH KONVER", description: "Kalkulator goriva, PDV-a, radnog staža i potrošnje električne energije za aktivne Premium korisnike." },
  "/category/testovi": { title: "Premium testovi i kvizovi | BH KONVER", description: "Interaktivni kviz opšteg znanja, IQ i logički zadaci, saobraćajni test i samoprocjena ličnosti." },
  "/testovi": { title: "Premium testovi i kvizovi | BH KONVER", description: "Interaktivni kviz opšteg znanja, IQ i logički zadaci, saobraćajni test i samoprocjena ličnosti." },
  "/kalkulatori/gorivo": { title: "Kalkulator goriva i putnih troškova | BH KONVER", description: "Izračunajte kilometražu, potrošnju goriva i procijenjeni trošak putovanja u KM." },
  "/kalkulatori/pdv": { title: "PDV kalkulator BiH 17% | BH KONVER", description: "Dodajte PDV na osnovicu ili izdvojite PDV iz ukupnog iznosa uz standardnu stopu od 17%." },
  "/kalkulatori/staz": { title: "Kalkulator radnog staža | BH KONVER", description: "Izračunajte kalendarsko trajanje radnog staža u godinama, mjesecima i danima." },
  "/kalkulatori/struja": { title: "Kalkulator potrošnje struje | BH KONVER", description: "Procijenite dnevnu i mjesečnu potrošnju električne energije i trošak aparata u KM." },
  "/testovi/opste-znanje": { title: "Kviz opšteg znanja o BiH | BH KONVER", description: "Provjerite znanje o geografiji, historiji i kulturi Bosne i Hercegovine kroz bodovani online kviz." },
  "/testovi/logika": { title: "IQ i logički test | BH KONVER", description: "Riješite nizove i kratke zadatke logičkog zaključivanja uz prikaz rezultata." },
  "/testovi/saobracajni": { title: "Saobraćajni test i pravila vožnje | BH KONVER", description: "Provjerite znanje saobraćajnih znakova, prednosti prolaza i sigurnog ponašanja u saobraćaju." },
  "/testovi/licnost": { title: "Informativni test ličnosti | BH KONVER", description: "Istražite lične preferencije kroz kratku samoprocjenu s prikazom informativnog profila." },
};

const PremiumAccessGate = ({
  category,
  redirectPath,
  children,
}: {
  category: string;
  redirectPath: string;
  children: ReactNode;
}) => {
  const { user, loading: authLoading } = useAdminAuth();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription(user?.id);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const loading = authLoading || subscriptionLoading;
  const hasPaidAccess = Boolean(user && hasActiveSubscription);

  if (loading) {
    return <RouteFallback label="Provjera Premium pristupa" />;
  }

  if (hasPaidAccess) return children;

  const label = category.replace(/^./, (letter) => letter.toLocaleUpperCase());
  // Tabovi generatora imaju vlastiti canonical; podrazumijevani tab (uuid) i ostalo ide na osnovnu rutu
  const canonicalPath = redirectPath === "/category/generatori?tab=uuid"
    ? "/category/generatori"
    : PREMIUM_PAGE_SEO[redirectPath] ? redirectPath : redirectPath.split("?")[0];
  const metadata = PREMIUM_PAGE_SEO[redirectPath] ?? PREMIUM_PAGE_SEO[canonicalPath] ?? {
    title: `${label} uz Premium | BH KONVER`,
    description: `Pregledajte ${label.toLocaleLowerCase("bs")} alate BH KONVER-a. Za korištenje je potrebna aktivna plaćena Premium pretplata.`,
  };

  const guideId = guideIdForPath(redirectPath);
  const guide = getToolGuide(guideId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title={metadata.title} description={metadata.description} path={canonicalPath} />
      <Navbar activeCategory={category} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <section className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-5 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary"><LockKeyhole className="h-6 w-6" aria-hidden="true" /></span>
          <p className="mt-5 text-xs font-semibold uppercase text-primary">BH KONVER · {label} · Premium</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">{guide?.name ?? "Dostupno uz Premium"}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-foreground">{metadata.description}</p>
          {guide?.preview && (
            <div className="mx-auto mt-6 max-w-lg rounded-md border border-dashed border-border bg-muted/40 p-4 text-left">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{guide.preview.title}</p>
              <dl className="mt-3 divide-y divide-border text-sm">
                {guide.preview.rows.map((row) => (
                  <div key={row.label} className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between sm:gap-4">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="break-words font-semibold text-foreground sm:text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">Ovo je statični primjer. Uz Premium računate vlastite vrijednosti.</p>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => setPaywallOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Crown className="h-4 w-4" aria-hidden="true" />Pogledaj Premium ponudu
            </button>
            {!user && (
              <Link to="/auth" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <LogIn className="h-4 w-4" aria-hidden="true" />Prijavi se
              </Link>
            )}
          </div>
          <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-muted-foreground">
            Generatori, kalkulatori i testovi dostupni su korisnicima s aktivnom plaćenom Premium pretplatom.
          </p>
        </section>
        <ToolInfoGuide toolId={guideId} />
      </main>
      <Footer activeCategory={category} />
      <FreemiumPaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        title="Premium pristup"
        description="Nadogradite račun na Premium da biste koristili generatore, kalkulatore i testove."
        redirectPath={redirectPath}
      />
    </div>
  );
};

const CATEGORY_PAGES = {
  GENERATORI: {
    title: "Generatori",
    description: "Brzi alati za kreiranje jedinstvenih identifikatora, kodova i tekstualnih oznaka.",
    items: [
      { label: "UUID Generator", description: "Kreiranje jedinstvenih UUID identifikatora.", to: "/category/generatori?tab=uuid" },
      { label: "QR Code Generator", description: "Priprema sadržaja za QR kodove.", to: "/category/generatori?tab=qr" },
      { label: "Slug Generator", description: "Pretvaranje naslova u URL-friendly slug.", to: "/category/generatori?tab=slug" },
      { label: "Barcode Generator", description: "Alati za rad s barkodovima.", to: "/category/generatori?tab=barcode" },
    ],
  },
  KONVERTORI: {
    title: "Konvertori",
    description: "Pretvarajte jedinice, tekst, slike, dokumente i multimedijalne datoteke.",
    items: [
      { label: "Jedinice i valute", description: "Konverzija mjernih jedinica i valuta.", to: "/modul/jedinice" },
      { label: "Ćirilica / Latinica", description: "Konverzija pisma između ćirilice i latinice.", to: "/alati/pismo" },
      { label: "Audio", description: "Alati za audio konverziju.", to: "/modul/audio" },
      { label: "Video", description: "Alati za video konverziju.", to: "/modul/video" },
      { label: "Slika u PDF", description: "Pretvorite slike u PDF dokument.", to: "/slika-pdf" },
      { label: "PDF alati", description: "Otvorite PDF i dokument konvertore.", to: "/alati" },
    ],
  },
  KALKULATORI: {
    title: "Kalkulatori",
    description: "Praktični kalkulatori za svakodnevne i finansijske proračune.",
    items: [
      { label: "Gorivo", description: "Alati za proračun troškova goriva.", to: "/kalkulatori/gorivo" },
      { label: "PDV", description: "Proračun iznosa PDV-a.", to: "/kalkulatori/pdv" },
      { label: "Radni staž", description: "Informativni proračun radnog staža.", to: "/kalkulatori/staz" },
      { label: "Struja", description: "Procjena potrošnje i troškova električne energije.", to: "/kalkulatori/struja" },
    ],
  },
  TESTOVI: {
    title: "Testovi",
    description: "Interaktivni testovi znanja i provjere za različite oblasti.",
    items: [
      { label: "Historija i kultura BiH", description: "Provjerite znanje o Bosni i Hercegovini.", to: "/testovi/opste-znanje" },
      { label: "Saobraćajni test", description: "Vježbajte pitanja iz saobraćajnih propisa.", to: "/testovi/saobracajni" },
      { label: "IQ test", description: "Zadaci za logičko zaključivanje.", to: "/testovi/logika" },
      { label: "Test ličnosti", description: "Istražite obrasce i osobine ličnosti.", to: "/testovi/licnost" },
    ],
  },
};

const getCategoryFromLocation = (pathname: string, hash: string) => {
  const categorySlug = pathname.match(/^\/category\/([^/]+)/)?.[1];
  if (categorySlug && CATEGORY_SLUGS[categorySlug]) return CATEGORY_SLUGS[categorySlug];
  if (pathname === "/privacy") {
    if (hash === "#security") return "Security";
    if (hash === "#cookies") return "Cookies";
    return "Privacy Policy";
  }
  if (pathname === "/terms") return hash === "#legal-notice" ? "Legal" : "Terms";
  if (pathname === "/support") return "Contact";
  if (pathname.startsWith("/testovi")) return "TESTOVI";
  if (pathname.startsWith("/kalkulatori")) return "KALKULATORI";
  if (pathname.startsWith("/alati") || pathname.startsWith("/modul/") || pathname.startsWith("/slika-pdf")) {
    return "KONVERTORI";
  }
  return "Home";
};

const CalculatorPage = () => {
  const { calculatorId = "" } = useParams();
  const Calculator = CALCULATORS[calculatorId as keyof typeof CALCULATORS];

  if (!Calculator) return <NotFound />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={PREMIUM_PAGE_SEO[`/kalkulatori/${calculatorId}`]?.title ?? "Premium kalkulator | BH KONVER"}
        description={PREMIUM_PAGE_SEO[`/kalkulatori/${calculatorId}`]?.description ?? "Informativni online kalkulator BH KONVER-a."}
        path={`/kalkulatori/${calculatorId}`}
      />
      <Navbar activeCategory="KALKULATORI" />
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-start justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="w-full">
          <Calculator />
          <ToolInfoGuide toolId={`calculator-${calculatorId}`} />
        </div>
      </main>
      <Footer activeCategory="KALKULATORI" />
    </div>
  );
};

const CategoryLanding = ({
  activeCategory,
  onNavigate,
}: {
  activeCategory: string;
  onNavigate: (category: string) => void;
}) => {
  const page = CATEGORY_PAGES[activeCategory as keyof typeof CATEGORY_PAGES] ?? CATEGORY_PAGES.GENERATORI;

  const content = (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title={`${page.title} online | BH KONVER`} description={`${page.description} Pregledajte dostupne BH KONVER alate i njihove mogućnosti.`} path={`/category/${activeCategory.toLocaleLowerCase("bs")}`} />
      <Navbar activeCategory={activeCategory} onCategoryChange={onNavigate} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="mb-8 border-b border-border pb-7">
          <p className="text-xs font-semibold uppercase text-primary">BH KONVER · {activeCategory}</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">{page.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{page.description}</p>
        </header>
        <section aria-label={`${page.title} alati`} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.items.map((item) => (
            <Link key={item.label} to={item.to} className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <h2 className="font-semibold text-foreground transition-colors group-hover:text-primary">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </section>
        <ToolInfoGuide toolId={`category-${activeCategory.toLocaleLowerCase("bs")}`} />
      </main>
      <Footer activeCategory={activeCategory} onNavigate={onNavigate} />
    </div>
  );

  if (activeCategory === "KALKULATORI" || activeCategory === "TESTOVI") {
    return <PremiumAccessGate category={activeCategory} redirectPath={CATEGORY_PATHS[activeCategory]}>{content}</PremiumAccessGate>;
  }
  return content;
};

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(() => getCategoryFromLocation(location.pathname, location.hash));

  useEffect(() => {
    setActiveCategory(getCategoryFromLocation(location.pathname, location.hash));
  }, [location.pathname, location.hash]);

  const navigateToCategory = (category: string) => {
    setActiveCategory(category);
    navigate(CATEGORY_PATHS[category] ?? "/");
  };

  return (
    <>
      <AnalyticsRouteTracker />
      <AppInitializer>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/category/generatori" element={<PremiumAccessGate category="GENERATORI" redirectPath={`${location.pathname}${location.search}`}><GeneratorsHub /></PremiumAccessGate>} />
            <Route path="/category/konvertori" element={<ConvertersHub />} />
            <Route path="/category/:category" element={<CategoryLanding activeCategory={activeCategory} onNavigate={navigateToCategory} />} />
            <Route path="/kalkulatori/:calculatorId" element={<PremiumAccessGate category="KALKULATORI" redirectPath={`${location.pathname}${location.search}`}><CalculatorPage /></PremiumAccessGate>} />
            <Route path="/testovi" element={<PremiumAccessGate category="TESTOVI" redirectPath="/testovi"><TestoviHub /></PremiumAccessGate>} />
            <Route path="/testovi/opste-znanje" element={<PremiumAccessGate category="TESTOVI" redirectPath="/testovi/opste-znanje"><OpsteZnanjeKviz /></PremiumAccessGate>} />
            <Route path="/testovi/logika" element={<PremiumAccessGate category="TESTOVI" redirectPath="/testovi/logika"><IqLogickiTest /></PremiumAccessGate>} />
            <Route path="/testovi/saobracajni" element={<PremiumAccessGate category="TESTOVI" redirectPath="/testovi/saobracajni"><SaobracajniTest /></PremiumAccessGate>} />
            <Route path="/testovi/licnost" element={<PremiumAccessGate category="TESTOVI" redirectPath="/testovi/licnost"><TestLicnosti /></PremiumAccessGate>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

            <Route path="/success" element={<Success />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />
            <Route path="/alati" element={<Alati />} />
            <Route path="/alati/:toolSlug" element={<Alati />} />
            <Route path="/modul/:moduleSlug" element={<ModulePage />} />
            <Route path="/slika-pdf" element={<SlikaPdf />} />
            <Route path="/slika-pdf/istorija" element={<SlikaPdfHistory />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppInitializer>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
