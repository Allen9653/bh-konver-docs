import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calculator, CalendarDays, CaseSensitive, ClipboardCheck, Coins, Crown, Languages, Lock, MoveHorizontal, Ruler, Search, Sparkles, Thermometer, WholeWord } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TOOL_CATALOG, type ToolCatalogItem } from "@/lib/toolCatalog";

type Category = "SVE" | "GENERATORI" | "KONVERTORI" | "KALKULATORI" | "TESTOVI";
type HomeTool = {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, "SVE">;
  access: "freemium" | "premium";
  icon: typeof Search;
  href?: string;
  catalogTool?: ToolCatalogItem;
};

type Props = {
  isPremium: boolean;
  hasPaidSubscription: boolean;
  quotaExhausted: boolean;
  searchQuery: string;
  onOpen: (tool: ToolCatalogItem) => void;
  onOpenPremiumRoute: (path: string) => void;
};

const categories: Category[] = ["SVE", "GENERATORI", "KONVERTORI", "KALKULATORI", "TESTOVI"];

const freemiumConverters: HomeTool[] = [
  { id: "unit", title: "Konverter jedinica", description: "Dužina, masa, zapremina i površina.", category: "KONVERTORI", access: "freemium", icon: Ruler, href: "/category/konvertori?tab=unit" },
  { id: "currency", title: "Konverter valuta", description: "KM, EUR, USD, CHF i GBP.", category: "KONVERTORI", access: "freemium", icon: Coins, href: "/category/konvertori?tab=currency" },
  { id: "script", title: "Ćirilica / latinica", description: "Preslovljavanje teksta uz BH i RS slova.", category: "KONVERTORI", access: "freemium", icon: Languages, href: "/category/konvertori?tab=script" },
  { id: "case", title: "Text Case", description: "Velika/mala slova, Capitalize i Title Case.", category: "KONVERTORI", access: "freemium", icon: CaseSensitive, href: "/category/konvertori?tab=case" },
  { id: "hijri", title: "Hidžretski datum", description: "Umm al-Qura i gregorijanski kalendar.", category: "KONVERTORI", access: "freemium", icon: CalendarDays, href: "/category/konvertori?tab=hijri" },
  { id: "length", title: "Konverter dužina", description: "Metri, stope, inči, kilometri i milje.", category: "KONVERTORI", access: "freemium", icon: MoveHorizontal, href: "/category/konvertori?tab=length" },
  { id: "roman", title: "Rimski brojevi i datumi", description: "Pretvaranje brojeva i datuma u oba smjera.", category: "KONVERTORI", access: "freemium", icon: WholeWord, href: "/category/konvertori?tab=roman" },
  { id: "temperature", title: "Konverter temperature", description: "Celsius, Fahrenheit i Kelvin.", category: "KONVERTORI", access: "freemium", icon: Thermometer, href: "/category/konvertori?tab=temperature" },
];

const premiumTools: HomeTool[] = [
  { id: "uuid", title: "UUID Generator", description: "Generišite UUID v4 identifikatore.", category: "GENERATORI", access: "premium", icon: Sparkles, href: "/category/generatori?tab=uuid" },
  { id: "qr", title: "QR Code Generator", description: "QR kodovi za tekst, URL, e-mail i WiFi.", category: "GENERATORI", access: "premium", icon: Sparkles, href: "/category/generatori?tab=qr" },
  { id: "slug", title: "Slug Generator", description: "Naslov pretvorite u SEO URL slug.", category: "GENERATORI", access: "premium", icon: Sparkles, href: "/category/generatori?tab=slug" },
  { id: "barcode", title: "Barcode Generator", description: "CODE128 i EAN barkodovi.", category: "GENERATORI", access: "premium", icon: Sparkles, href: "/category/generatori?tab=barcode" },
  { id: "fuel", title: "Kalkulator goriva", description: "Izračunajte potrošnju i putne troškove.", category: "KALKULATORI", access: "premium", icon: Calculator, href: "/kalkulatori/gorivo" },
  { id: "vat", title: "PDV kalkulator", description: "Dodajte ili izdvojite PDV.", category: "KALKULATORI", access: "premium", icon: Calculator, href: "/kalkulatori/pdv" },
  { id: "tenure", title: "Kalkulator staža", description: "Izračunajte trajanje radnog staža.", category: "KALKULATORI", access: "premium", icon: Calculator, href: "/kalkulatori/staz" },
  { id: "electricity", title: "Kalkulator struje", description: "Procijenite dnevnu i mjesečnu potrošnju.", category: "KALKULATORI", access: "premium", icon: Calculator, href: "/kalkulatori/struja" },
  { id: "knowledge", title: "Opšte znanje o BiH", description: "Kviz iz geografije, historije i kulture.", category: "TESTOVI", access: "premium", icon: ClipboardCheck, href: "/testovi/opste-znanje" },
  { id: "logic", title: "IQ i logički test", description: "Nizovi i zadaci zaključivanja.", category: "TESTOVI", access: "premium", icon: ClipboardCheck, href: "/testovi/logika" },
  { id: "traffic", title: "Saobraćajni test", description: "Provjerite osnovna pravila saobraćaja.", category: "TESTOVI", access: "premium", icon: ClipboardCheck, href: "/testovi/saobracajni" },
  { id: "personality", title: "Test ličnosti", description: "Informativna samoprocjena preferencija.", category: "TESTOVI", access: "premium", icon: ClipboardCheck, href: "/testovi/licnost" },
];

const categoryPath = {
  GENERATORI: "/category/generatori",
  KONVERTORI: "/category/konvertori",
  KALKULATORI: "/category/kalkulatori",
  TESTOVI: "/category/testovi",
};

export const HomeModuleGrid = ({ isPremium, hasPaidSubscription, quotaExhausted, searchQuery = "", onOpen, onOpenPremiumRoute }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("SVE");
  const catalogTools: HomeTool[] = TOOL_CATALOG
    .filter((tool) => !["jedinice", "pismo"].includes(tool.slug))
    .map((tool) => ({
      id: `catalog-${tool.slug}`,
      title: t(tool.titleKey),
      description: t(tool.descriptionKey),
      category: "KONVERTORI",
      access: tool.access === "pro" ? "premium" : "freemium",
      icon: tool.icon,
      href: tool.href,
      catalogTool: tool,
    }));
  const tools = [...freemiumConverters, ...catalogTools, ...premiumTools];
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("bs");
  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeCategory === "SVE" || activeCategory === tool.category;
    const matchesQuery = !normalizedQuery || `${tool.title} ${tool.description} ${tool.category}`.toLocaleLowerCase("bs").includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const openTool = (tool: HomeTool) => {
    if (tool.catalogTool) {
      onOpen(tool.catalogTool);
      return;
    }
    if (tool.access === "premium") {
      onOpenPremiumRoute(tool.href ?? categoryPath[tool.category]);
      return;
    }
    navigate(tool.href ?? categoryPath[tool.category]);
  };

  return (
    <section className="py-10 sm:py-14" aria-labelledby="tools-heading">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-primary">ALATI ZA SVAKI DAN</p>
            <h2 id="tools-heading" className="font-display text-2xl font-bold text-foreground sm:text-3xl">Istražite dostupne alate</h2>
            <p className="mt-2 text-sm text-muted-foreground">Freemium alati rade odmah. Premium alati traže aktivnu pretplatu.</p>
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">{filteredTools.length} alata</p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtriraj alate po kategoriji">
          {categories.map((category) => (
            <button key={category} type="button" role="tab" aria-selected={activeCategory === category} onClick={() => setActiveCategory(category)} className={`min-h-10 rounded-md border px-4 text-xs font-semibold transition-colors sm:text-sm ${activeCategory === category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              {category === "SVE" ? "Svi Alati" : category.charAt(0) + category.slice(1).toLocaleLowerCase("bs")}
            </button>
          ))}
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isLocked = tool.access === "premium" ? !hasPaidSubscription : tool.catalogTool ? !isPremium && (tool.catalogTool.access === "pro" || (tool.catalogTool.access === "quota" && quotaExhausted)) : false;
              const badgeClass = tool.access === "freemium" ? "border-emerald-600/25 bg-emerald-600/10 text-emerald-700" : "border-gold/40 bg-gold/15 text-gold-foreground";
              return (
                <article key={tool.id} className="group flex min-h-44 flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-primary/[0.02]">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-md ${tool.access === "freemium" ? "bg-emerald-600/10 text-emerald-700" : "bg-gold/15 text-gold-foreground"}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <Badge variant="outline" className={`text-[10px] ${badgeClass}`}>{tool.access === "freemium" ? "FREEMIUM" : <><Crown className="mr-1 h-3 w-3" />PREMIUM</>}</Badge>
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{tool.title}</h3>
                  <p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">{tool.description}</p>
                  <Button variant="ghost" className="mt-3 h-9 justify-start px-0 text-xs text-primary hover:bg-transparent" onClick={() => openTool(tool)}>
                    {isLocked ? <><Lock className="mr-1 h-3 w-3" />Pogledaj Premium ponudu</> : "Otvori alat"}<ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">Nema alata koji odgovaraju pretrazi.</div>
        )}
      </div>
    </section>
  );
};
