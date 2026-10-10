import { useSearchParams } from "react-router-dom";
import { Barcode, Dices, Link2, QrCode } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { ToolInfoGuide } from "@/components/ToolInfoGuide";
import UuidGenerator from "@/components/generators/UuidGenerator";
import QrGenerator from "@/components/generators/QrGenerator";
import SlugGenerator from "@/components/generators/SlugGenerator";
import BarcodeGenerator from "@/components/generators/BarcodeGenerator";

const generators = [
  { id: "uuid", label: "UUID", icon: Dices, Component: UuidGenerator, title: "UUID v4 generator online | BH KONVER", description: "Generišite sigurne nasumične UUID v4 identifikatore. Kreirajte od 1 do 50 nizova i kopirajte ih jednim klikom." },
  { id: "qr", label: "QR Code", icon: QrCode, Component: QrGenerator, title: "QR Code generator za tekst, URL, e-mail i WiFi | BH KONVER", description: "Napravite QR kod za tekst, web adresu, e-mail ili WiFi mrežu i preuzmite ga kao PNG sliku." },
  { id: "slug", label: "Slug", icon: Link2, Component: SlugGenerator, title: "SEO URL slug generator za bosanski tekst | BH KONVER", description: "Pretvorite naslov u čist URL slug uz ispravnu konverziju č, ć, đ, š i ž znakova te kopirajte rezultat." },
  { id: "barcode", label: "Barcode", icon: Barcode, Component: BarcodeGenerator, title: "Barcode generator CODE128 i EAN | BH KONVER", description: "Kreirajte linijske CODE128, EAN-13 i EAN-8 barkodove te preuzmite vektorsku SVG datoteku." },
];

export default function GeneratorsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const active = generators.find((generator) => generator.id === requestedTab) ?? generators[0];
  const ActiveGenerator = active.Component;

  const selectTab = (tab) => {
    setSearchParams(tab === "uuid" ? {} : { tab }, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title={active.title} description={active.description} path={active.id === "uuid" ? "/category/generatori" : `/category/generatori?tab=${active.id}`} jsonLd={{ "@type": "SoftwareApplication", name: active.title, applicationCategory: "UtilitiesApplication", operatingSystem: "Any" }} />
      <Navbar activeCategory="GENERATORI" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-7 border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase text-primary">BH KONVER · GENERATORI</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Generatori online</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Kreirajte UUID identifikatore, QR kodove, SEO slugove i barkodove.</p>
        </header>
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-2 sm:grid-cols-4" role="tablist" aria-label="Izaberite generator">
          {generators.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" id={`generator-tab-${id}`} aria-selected={active.id === id} aria-controls="generator-panel" onClick={() => selectTab(id)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active.id === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="h-4 w-4" aria-hidden="true" /><span>{label}</span></button>)}
        </div>
        <div id="generator-panel" role="tabpanel" aria-labelledby={`generator-tab-${active.id}`}>
          <ActiveGenerator />
        </div>
        <ToolInfoGuide toolId={`generator-${active.id}`} />
      </main>
      <Footer activeCategory="GENERATORI" />
    </div>
  );
}
