import { useState } from "react";
import { Link } from "react-router-dom";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { SEO } from "@/components/SEO";
import { FreeToolCard } from "@/components/FreeToolCard";
import { ToolRunner } from "@/components/free-tools/ToolRunner";
import { ScriptConverter } from "@/components/free-tools/ScriptConverter";
import { PptxConverter } from "@/components/free-tools/PptxConverter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, FileImage, FileSpreadsheet, Presentation, Type,
  Combine, Scissors, Shield, Zap, LockOpen, ArrowRight,
} from "lucide-react";
import {
  imagesToPdf, wordToPdf, pdfToWord, excelToPdf,
  mergePdfs, splitPdf,
} from "@/utils/freeTools";

type ToolId =
  | "img-to-pdf" | "word-to-pdf" | "pdf-to-word"
  | "excel-to-pdf" | "pptx-to-pdf"
  | "script" | "merge-pdf" | "split-pdf";

const Alati = () => {
  const [active, setActive] = useState<ToolId | null>(null);
  const { user, isAdmin, signOut } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);

  const back = () => setActive(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Besplatni Alati — PDF, Word, Excel, Ćirilica | BH Konver"
        description="100% besplatni online alati: PDF u Word, Word u PDF, slike u PDF, Excel u PDF, Latinica u Ćirilicu, spajanje i razdvajanje PDF-a. Bez registracije, bez slanja na server."
        path="/alati"
      />
      <PremiumHeader user={user} isAdmin={isAdmin} isPremium={isAdmin || hasActiveSubscription} expiresAt={expiresAt} onSignOut={signOut} />

      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-hero text-white py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-accent text-accent-foreground">100% Besplatno</Badge>
              <Badge variant="outline" className="border-white/30 text-white"><LockOpen className="w-3 h-3 mr-1" /> Bez registracije</Badge>
              <Badge variant="outline" className="border-white/30 text-white"><Shield className="w-3 h-3 mr-1" /> Privatno (u pretraživaču)</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3">
              Besplatni <span className="text-accent">Alati</span>
            </h1>
            <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base">
              Konverzija dokumenata i pisma direktno u vašem pretraživaču. Vaši fajlovi ne napuštaju vaš uređaj.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-5xl py-10">
          {active === null && (
            <div className="space-y-10">
              <Section title="🔄 Konverzija formata">
                <FreeToolCard icon={FileText} title="PDF → Word" description="Pretvorite PDF u uređivačku Word datoteku (.docx)."
                  badge="Tekstualno" onClick={() => setActive("pdf-to-word")} />
                <FreeToolCard icon={FileText} title="Word → PDF" description="Pretvorite Word (.docx) dokument u PDF."
                  onClick={() => setActive("word-to-pdf")} />
                <FreeToolCard icon={FileImage} title="Slike → PDF" description="Spojite JPG, JPEG i PNG slike u jedan PDF."
                  onClick={() => setActive("img-to-pdf")} />
                <FreeToolCard icon={FileSpreadsheet} title="Excel → PDF" description="Pretvorite Excel (.xlsx, .xls) u PDF tabelu."
                  onClick={() => setActive("excel-to-pdf")} />
                <FreeToolCard icon={Presentation} title="PPTX → PDF" description="Pretvorite PowerPoint prezentaciju u PDF."
                  badge="Beta · 3/h" onClick={() => setActive("pptx-to-pdf")} />
              </Section>

              <Section title="🔤 Konverzija pisma">
                <FreeToolCard icon={Type} title="Latinica ↔ Ćirilica"
                  description="Trenutna konverzija teksta. Podržava bosanski, srpski i hrvatski."
                  badge="Real-time" onClick={() => setActive("script")} />
              </Section>

              <Section title="🛠️ Dodatni alati">
                <FreeToolCard icon={Combine} title="Spoji PDF (Merge)"
                  description="Spojite više PDF dokumenata u jedan fajl."
                  onClick={() => setActive("merge-pdf")} />
                <FreeToolCard icon={Scissors} title="Razdvoji PDF (Split)"
                  description="Razdvojite PDF na pojedinačne stranice (ZIP)."
                  onClick={() => setActive("split-pdf")} />
              </Section>

              {/* Trust strip */}
              <div className="border-t pt-8 grid sm:grid-cols-3 gap-4 text-sm">
                <Trust icon={Shield} title="Privatno" text="Obrada u pretraživaču — fajl ne ide na server." />
                <Trust icon={Zap} title="Brzo" text="Bez čekanja, bez upload-a, bez registracije." />
                <Trust icon={LockOpen} title="Besplatno" text="Svi alati gore su 100% besplatni i bez limita." />
              </div>

              {/* Upsell to premium tools */}
              <div className="rounded-xl border bg-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div>
                  <h3 className="font-semibold">Trebate batch obradu ili audio/video konverziju?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Naprednije konverzije i bulk obrada su dostupne uz pretplatu.
                  </p>
                </div>
                <Button asChild variant="default" className="bg-primary hover:bg-primary/90 shrink-0">
                  <Link to="/">Pogledaj premium <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            </div>
          )}

          {active === "img-to-pdf" && (
            <ToolRunner
              title="Slike → PDF"
              description="Odaberite jednu ili više slika (.jpg, .jpeg, .png) — svaka postaje stranica."
              acceptedExtensions={["jpg", "jpeg", "png"]}
              multiple
              outputFilename={() => `slike_${Date.now()}.pdf`}
              run={imagesToPdf}
              onBack={back}
            />
          )}
          {active === "word-to-pdf" && (
            <ToolRunner
              title="Word → PDF"
              description="Pretvorite .docx dokument u PDF (čuva tekst, naslove, italik, bold, liste)."
              acceptedExtensions={["docx"]}
              outputFilename={(f) => (f as File).name.replace(/\.docx$/i, ".pdf")}
              run={(files, p) => wordToPdf(files[0], p)}
              onBack={back}
              note="Kompleksno formatiranje (kolone, embed-ovani objekti) može biti pojednostavljeno."
            />
          )}
          {active === "pdf-to-word" && (
            <ToolRunner
              title="PDF → Word"
              description="Ekstrakcija teksta iz PDF-a u uređivački .docx fajl."
              acceptedExtensions={["pdf"]}
              outputFilename={(f) => (f as File).name.replace(/\.pdf$/i, ".docx")}
              run={(files, p) => pdfToWord(files[0], p)}
              onBack={back}
              note="Tekstualna konverzija — kompleksni layouti, slike i tabele mogu biti pojednostavljene. Skenirani PDF (slike) neće biti prepoznat."
            />
          )}
          {active === "excel-to-pdf" && (
            <ToolRunner
              title="Excel → PDF"
              description="Pretvorite .xlsx ili .xls u PDF — svaki sheet postaje stranica."
              acceptedExtensions={["xlsx", "xls"]}
              outputFilename={(f) => (f as File).name.replace(/\.xlsx?$/i, ".pdf")}
              run={(files, p) => excelToPdf(files[0], p)}
              onBack={back}
              note="Vrijednosti ćelija i osnovno formatiranje. Grafikoni i složeni stilovi nisu uključeni."
            />
          )}
          {active === "pptx-to-pdf" && <PptxConverter onBack={back} />}
          {active === "script" && <ScriptConverter onBack={back} />}
          {active === "merge-pdf" && (
            <ToolRunner
              title="Spoji PDF (Merge)"
              description="Odaberite 2 ili više PDF datoteka — bit će spojeni u jedan PDF."
              acceptedExtensions={["pdf"]}
              multiple
              minFiles={2}
              outputFilename={() => `spojeni_${Date.now()}.pdf`}
              run={mergePdfs}
              onBack={back}
            />
          )}
          {active === "split-pdf" && (
            <ToolRunner
              title="Razdvoji PDF (Split)"
              description="PDF će biti razdvojen u pojedinačne stranice i pakovan u ZIP arhivu."
              acceptedExtensions={["pdf"]}
              outputFilename={(f) => (f as File).name.replace(/\.pdf$/i, "_stranice.zip")}
              run={(files, p) => splitPdf(files[0], p)}
              onBack={back}
            />
          )}
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="text-lg sm:text-xl font-semibold mb-4 font-display">{title}</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  </section>
);

const Trust = ({ icon: Icon, title, text }: { icon: typeof Shield; title: string; text: string }) => (
  <div className="flex gap-3">
    <div className="shrink-0 w-9 h-9 rounded-md bg-accent/10 text-accent flex items-center justify-center">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  </div>
);

// Local minimal Card for the PPTX coming-soon block (avoids extra import noise)
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col ${className}`}>{children}</div>
);

export default Alati;
