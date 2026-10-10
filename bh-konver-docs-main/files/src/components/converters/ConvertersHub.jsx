import { useSearchParams } from "react-router-dom";
import { ArrowLeftRight, CalendarDays, CaseSensitive, Coins, Languages, MoveHorizontal, Ruler, Thermometer, WholeWord } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { ToolInfoGuide } from "@/components/ToolInfoGuide";
import UnitConverter from "@/components/converters/UnitConverter";
import CurrencyConverter from "@/components/converters/CurrencyConverter";
import CyrillicLatinConverter from "@/components/converters/CyrillicLatinConverter";
import TextCaseConverter from "@/components/converters/TextCaseConverter";
import HijriDateConverter from "@/components/converters/HijriDateConverter";
import LengthConverter from "@/components/converters/LengthConverter";
import RomanNumeralDateConverter from "@/components/converters/RomanNumeralDateConverter";
import TemperatureConverter from "@/components/converters/TemperatureConverter";

const converters = [
  { id: "unit", label: "Jedinice", icon: Ruler, Component: UnitConverter },
  { id: "currency", label: "Valute", icon: Coins, Component: CurrencyConverter },
  { id: "script", label: "Ćirilica / latinica", icon: Languages, Component: CyrillicLatinConverter },
  { id: "case", label: "Text Case", icon: CaseSensitive, Component: TextCaseConverter },
  { id: "hijri", label: "Hidžretski datum", icon: CalendarDays, Component: HijriDateConverter },
  { id: "length", label: "Dužina", icon: MoveHorizontal, Component: LengthConverter },
  { id: "roman", label: "Rimski brojevi", icon: WholeWord, Component: RomanNumeralDateConverter },
  { id: "temperature", label: "Temperatura", icon: Thermometer, Component: TemperatureConverter },
];

const converterSeo = {
  unit: { title: "Besplatni konverter jedinica: dužina, masa i površina | BH KONVER", description: "Pretvorite dužinu, masu, zapreminu i površinu u nekoliko sekundi. Besplatni konverter jedinica radi direktno u pregledniku, bez prijave." },
  currency: { title: "Konverter valuta KM, EUR, USD, CHF i GBP | BH KONVER", description: "Preračunajte konvertibilnu marku, euro, dolar, franak i funtu prema ažurnim kursevima. Besplatna konverzija valuta bez registracije." },
  script: { title: "Konverter ćirilice i latinice za bosanski tekst | BH KONVER", description: "Preslovite tekst između ćirilice i latinice uz podršku za č, ć, đ, š, ž, lj, nj i dž. Besplatno, odmah i bez prijave." },
  case: { title: "Besplatni Text Case converter: velika i mala slova | BH KONVER", description: "Promijenite format teksta u velika ili mala slova, Capitalize ili Title Case. Pregled rezultata uživo, bez registracije." },
  hijri: { title: "Konverter hidžretskog i gregorijanskog datuma | BH KONVER", description: "Pretvorite datume između gregorijanskog i Umm al-Qura hidžretskog kalendara. Besplatan dvosmjerni konverter datuma." },
  length: { title: "Konverter dužine: metri, stope, inči i milje | BH KONVER", description: "Brzo pretvorite metre, stope, inče, kilometre i milje. Tačan besplatni konverter dužine dostupan direktno u pregledniku." },
  roman: { title: "Konverter rimskih brojeva i datuma | BH KONVER", description: "Pretvorite brojeve i datume u rimske oznake i nazad. Provjera standardnog zapisa i datuma, besplatno i bez prijave." },
  temperature: { title: "Konverter temperature: Celsius, Fahrenheit, Kelvin | BH KONVER", description: "Pretvorite temperaturu između stepeni Celzijusa, Fahrenheita i Kelvina, uz provjeru apsolutne nule. Besplatno i bez registracije." },
};

export default function ConvertersHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const active = converters.find((converter) => converter.id === requestedTab) ?? converters[0];
  const ActiveConverter = active.Component;
  const metadata = converterSeo[active.id];

  const selectTab = (tab) => setSearchParams(tab === "unit" ? {} : { tab }, { replace: true });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title={metadata.title} description={metadata.description} path={active.id === "unit" ? "/category/konvertori" : `/category/konvertori?tab=${active.id}`} jsonLd={{ "@type": "SoftwareApplication", name: metadata.title, applicationCategory: "UtilitiesApplication", operatingSystem: "Any" }} />
      <Navbar activeCategory="KONVERTORI" />
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-7 border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase text-primary">BH KONVER · FREEMIUM</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Besplatni konvertori</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Svi konvertori na ovoj stranici dostupni su bez pretplate, za posjetioce i registrovane korisnike.</p>
        </header>
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-2 sm:grid-cols-4 xl:grid-cols-8" role="tablist" aria-label="Izaberite konverter">
          {converters.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" id={`converter-tab-${id}`} aria-selected={active.id === id} aria-controls="converter-panel" onClick={() => selectTab(id)} className={`flex min-h-12 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm ${active.id === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{label}</span></button>)}
        </div>
        <div id="converter-panel" role="tabpanel" aria-labelledby={`converter-tab-${active.id}`}><ActiveConverter /></div>
        <ToolInfoGuide toolId={`converter-${active.id}`} />
      </main>
      <Footer activeCategory="KONVERTORI" />
    </div>
  );
}
