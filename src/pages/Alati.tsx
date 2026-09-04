import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { SEO } from "@/components/SEO";
import { FreeToolCard } from "@/components/FreeToolCard";
import { ToolRunner } from "@/components/free-tools/ToolRunner";
import { ScriptConverter } from "@/components/free-tools/ScriptConverter";
import { PptxConverter } from "@/components/free-tools/PptxConverter";
import { FreemiumPaywallModal } from "@/components/free-tools/FreemiumPaywallModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useFreeQuota } from "@/hooks/useFreeQuota";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText, FileImage, FileSpreadsheet, Presentation, Type,
  Combine, Scissors, Shield, Zap, LockOpen, ArrowRight, Crown, Ruler, DollarSign, Infinity as InfinityIcon,
  Code2, Globe, Image as ImageIcon, FileCode,
} from "lucide-react";
import {
  imagesToPdf, wordToPdf, pdfToWord, excelToPdf,
  mergePdfs, splitPdf,
} from "@/utils/freeTools";
import {
  htmlToPdf, htmlToDocx, htmlToJpg, htmlToPng, htmlToTxt,
  docxToHtml, pdfToHtml, textToHtml,
} from "@/utils/htmlTools";

type ToolId =
  | "img-to-pdf" | "word-to-pdf" | "pdf-to-word"
  | "excel-to-pdf" | "pptx-to-pdf"
  | "script" | "merge-pdf" | "split-pdf"
  // Group A — HTML as source
  | "html-to-docx" | "html-to-pdf" | "html-to-jpg" | "html-to-png" | "html-to-txt"
  // Group B — HTML as target
  | "docx-to-html" | "pdf-to-html" | "text-to-html";

const SLUG_TO_TOOL: Record<string, ToolId> = {
  "slike-u-pdf": "img-to-pdf",
  "word-u-pdf": "word-to-pdf",
  "pdf-u-word": "pdf-to-word",
  "excel-u-pdf": "excel-to-pdf",
  "pptx-u-pdf": "pptx-to-pdf",
  "pismo": "script",
  "spoji-pdf": "merge-pdf",
  "podijeli-pdf": "split-pdf",
  "html-u-word": "html-to-docx",
  "html-u-pdf": "html-to-pdf",
};

// Document conversion tools that count against the free quota
const DOC_TOOLS: ToolId[] = [
  "img-to-pdf", "word-to-pdf", "pdf-to-word",
  "excel-to-pdf", "pptx-to-pdf", "merge-pdf", "split-pdf",
  "html-to-docx",
];

// HTML tools reserved for active subscribers (server-grade fidelity output)
const PRO_HTML_TOOLS: ToolId[] = [
  "html-to-pdf", "html-to-jpg", "html-to-png", "html-to-txt",
  "docx-to-html", "pdf-to-html", "text-to-html",
];

const Alati = () => {
  // `t` is bound to the active language and re-renders on language change
  const { t } = useTranslation();
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const routedTool = toolSlug ? SLUG_TO_TOOL[toolSlug] : undefined;
  const initialFile = (location.state as { initialFile?: File } | null)?.initialFile;
  const [active, setActive] = useState<ToolId | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { user, isAdmin, signOut, loading: authLoading } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const isPremium = isAdmin || hasActiveSubscription;
  const { used, remaining, exhausted, limit, consume } = useFreeQuota();

  const back = () => toolSlug ? navigate("/") : setActive(null);

  useEffect(() => {
    if (!routedTool) return;
    if (PRO_HTML_TOOLS.includes(routedTool) && !isPremium) {
      setPaywallOpen(true);
      return;
    }
    if (DOC_TOOLS.includes(routedTool) && !isPremium && exhausted) {
      setPaywallOpen(true);
      return;
    }
    setActive(routedTool);
  }, [routedTool, isPremium, exhausted]);

  // Try to open a doc tool — gate by quota for non-premium users
  const openDocTool = useCallback((id: ToolId) => {
    if (!isPremium && exhausted) {
      setPaywallOpen(true);
      return;
    }
    setActive(id);
  }, [isPremium, exhausted]);

  // PRO-only tools — require an active subscription (or admin)
  const openProTool = useCallback((id: ToolId) => {
    if (!isPremium) {
      setPaywallOpen(true);
      return;
    }
    setActive(id);
  }, [isPremium]);

  // Hook into ToolRunner / PptxConverter
  const onBeforeRun = useCallback((): boolean => {
    if (isPremium) return true;
    if (exhausted) {
      setPaywallOpen(true);
      return false;
    }
    return true;
  }, [isPremium, exhausted]);

  const onBeforeRunPro = useCallback((): boolean => {
    if (isPremium) return true;
    setPaywallOpen(true);
    return false;
  }, [isPremium]);

  const onAfterSuccess = useCallback(() => {
    if (!isPremium) consume();
    // Flag any server-side artifacts for daily purge (no-op for unauth users)
    if (user?.id) {
      supabase.functions
        .invoke("flag-cleanup", { body: {} })
        .catch((e) => console.warn("flag-cleanup failed", e));
    }
  }, [isPremium, consume, user?.id]);

  // Quota badge text for individual doc tool cards
  const quotaBadge = isPremium
    ? t("alati.quotaPremium")
    : remaining > 0
      ? t("alati.quotaFree", { remaining, limit })
      : t("alati.quotaLocked");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={t("alati.seoTitle")}
        description={t("alati.seoDescription")}
        path="/alati"
        jsonLd={{
          "@type": "SoftwareApplication",
          name: "BH Konver Alati",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          url: "https://bh-konver.lovable.app/alati",
          description: t("alati.seoDescription"),
          offers: { "@type": "Offer", price: "0", priceCurrency: "BAM" },
        }}
      />

      <PremiumHeader user={user} isAdmin={isAdmin} isPremium={isPremium} expiresAt={expiresAt} onSignOut={signOut} loading={authLoading} />

      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-hero text-white py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-accent text-accent-foreground">{t("alati.badgeFreemium")}</Badge>
              <Badge variant="outline" className="border-white/30 text-white"><LockOpen className="w-3 h-3 mr-1" /> {t("alati.badgeNoRegistration")}</Badge>
              <Badge variant="outline" className="border-white/30 text-white"><Shield className="w-3 h-3 mr-1" /> {t("alati.badgePrivate")}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3">
              {t("alati.heroTitlePrefix")} <span className="text-accent">{t("alati.heroTitleAccent")}</span>
            </h1>
            <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base">
              {t("alati.heroSubtitle")}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-5xl py-10">
          {active === null && (
            <div className="space-y-12">
              {/* ====================== ALWAYS-FREE TIER ====================== */}
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-accent/15 text-accent border-accent/30" variant="outline">
                    <InfinityIcon className="w-3 h-3 mr-1" /> {t("alati.alwaysFree")}
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-1 font-display">{t("alati.dailyToolsTitle")}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("alati.dailyToolsSubtitle")}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FreeToolCard
                    icon={Ruler}
                    title={t("alati.tools.units.title")}
                    description={t("alati.tools.units.description")}
                    badge={t("alati.freeBadge")}
                    onClick={() => { window.location.href = "/#"; }}
                  />
                  <FreeToolCard
                    icon={DollarSign}
                    title={t("alati.tools.currency.title")}
                    description={t("alati.tools.currency.description")}
                    badge={t("alati.freeBadge")}
                    onClick={() => { window.location.href = "/#"; }}
                  />
                  <FreeToolCard
                    icon={Type}
                    title={t("alati.tools.script.title")}
                    description={t("alati.tools.script.description")}
                    badge={t("alati.freeBadge")}
                    onClick={() => setActive("script")}
                  />
                </div>
              </section>

              {/* ====================== LIMITED DOCUMENT TIER ====================== */}
              <section className="relative">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">
                      <Crown className="w-3 h-3 mr-1" /> {t("alati.premiumQuality")}
                    </Badge>
                    {!isPremium && (
                      <Badge
                        className={`${exhausted ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-accent/15 text-accent border-accent/30"}`}
                        variant="outline"
                      >
                        {t("alati.remainingFree", { remaining, limit })}
                      </Badge>
                    )}
                    {isPremium && (
                      <Badge className="bg-accent text-accent-foreground">
                        <InfinityIcon className="w-3 h-3 mr-1" /> {t("alati.unlimited")}
                      </Badge>
                    )}
                  </div>
                  {!isPremium && (
                    <Button size="sm" variant="outline" onClick={() => setPaywallOpen(true)}>
                      {t("alati.viewPackages")} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-1 font-display">{t("alati.docSectionTitle")}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("alati.docSectionSubtitle", { limit })}
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FreeToolCard icon={FileText} title={t("alati.tools.pdfToWord.title")}
                    description={t("alati.tools.pdfToWord.description")}
                    badge={quotaBadge} onClick={() => openDocTool("pdf-to-word")} />
                  <FreeToolCard icon={FileText} title={t("alati.tools.wordToPdf.title")}
                    description={t("alati.tools.wordToPdf.description")}
                    badge={quotaBadge} onClick={() => openDocTool("word-to-pdf")} />
                  <FreeToolCard icon={FileImage} title={t("alati.tools.imgToPdf.title")}
                    description={t("alati.tools.imgToPdf.description")}
                    badge={quotaBadge} onClick={() => openDocTool("img-to-pdf")} />
                  <FreeToolCard icon={FileSpreadsheet} title={t("alati.tools.excelToPdf.title")}
                    description={t("alati.tools.excelToPdf.description")}
                    badge={quotaBadge} onClick={() => openDocTool("excel-to-pdf")} />
                  <FreeToolCard icon={Presentation} title={t("alati.tools.pptxToPdf.title")}
                    description={t("alati.tools.pptxToPdf.description")}
                    badge="Beta" onClick={() => openDocTool("pptx-to-pdf")} />
                  <FreeToolCard icon={Combine} title={t("alati.tools.mergePdf.title")}
                    description={t("alati.tools.mergePdf.description")}
                    badge={quotaBadge} onClick={() => openDocTool("merge-pdf")} />
                  <FreeToolCard icon={Scissors} title={t("alati.tools.splitPdf.title")}
                    description={t("alati.tools.splitPdf.description")}
                    badge={quotaBadge} onClick={() => openDocTool("split-pdf")} />
                </div>
              </section>

              {/* ====================== HTML CONVERSIONS ====================== */}
              <section>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">
                    <Code2 className="w-3 h-3 mr-1" /> HTML
                  </Badge>
                  {!isPremium && (
                    <Badge className="bg-accent/15 text-accent border-accent/30" variant="outline">
                      <Crown className="w-3 h-3 mr-1" /> {t("alati.html.proBadge")}
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-1 font-display">{t("alati.html.sectionTitle")}</h2>
                <p className="text-sm text-muted-foreground mb-5">{t("alati.html.sectionSubtitle")}</p>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  {t("alati.html.groupATitle")}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <FreeToolCard icon={FileText} title={t("alati.html.htmlToDocx.title")}
                    description={t("alati.html.htmlToDocx.description")}
                    badge={quotaBadge} onClick={() => openDocTool("html-to-docx")} />
                  <FreeToolCard icon={FileCode} title={t("alati.html.htmlToPdf.title")}
                    description={t("alati.html.htmlToPdf.description")}
                    badge={t("alati.html.proBadge")} onClick={() => openProTool("html-to-pdf")} />
                  <FreeToolCard icon={ImageIcon} title={t("alati.html.htmlToJpg.title")}
                    description={t("alati.html.htmlToJpg.description")}
                    badge={t("alati.html.proBadge")} onClick={() => openProTool("html-to-jpg")} />
                  <FreeToolCard icon={ImageIcon} title={t("alati.html.htmlToPng.title")}
                    description={t("alati.html.htmlToPng.description")}
                    badge={t("alati.html.proBadge")} onClick={() => openProTool("html-to-png")} />
                  <FreeToolCard icon={Type} title={t("alati.html.htmlToTxt.title")}
                    description={t("alati.html.htmlToTxt.description")}
                    badge={t("alati.html.proBadge")} onClick={() => openProTool("html-to-txt")} />
                </div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  {t("alati.html.groupBTitle")}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FreeToolCard icon={Globe} title={t("alati.html.docxToHtml.title")}
                    description={t("alati.html.docxToHtml.description")}
                    badge={t("alati.html.proBadge")} onClick={() => openProTool("docx-to-html")} />
                  <FreeToolCard icon={Globe} title={t("alati.html.pdfToHtml.title")}
                    description={t("alati.html.pdfToHtml.description")}
                    badge={t("alati.html.proBadge")} onClick={() => openProTool("pdf-to-html")} />
                  <FreeToolCard icon={Globe} title={t("alati.html.textToHtml.title")}
                    description={t("alati.html.textToHtml.description")}
                    badge={t("alati.html.proBadge")} onClick={() => openProTool("text-to-html")} />
                </div>
              </section>

              {/* Trust strip */}
              <div className="border-t pt-8 grid sm:grid-cols-3 gap-4 text-sm">
                <Trust icon={Shield} title={t("alati.trust.privateTitle")} text={t("alati.trust.privateText")} />
                <Trust icon={Zap} title={t("alati.trust.fastTitle")} text={t("alati.trust.fastText")} />
                <Trust icon={LockOpen} title={t("alati.trust.noRegTitle")} text={t("alati.trust.noRegText")} />
              </div>

              {/* Upsell strip */}
              {!isPremium && (
                <div className="rounded-xl border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Crown className="w-4 h-4 text-accent" /> {t("alati.upsell.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("alati.upsell.text")}
                    </p>
                  </div>
                  <Button onClick={() => setPaywallOpen(true)} className="bg-primary hover:bg-primary/90 shrink-0">
                    {t("alati.viewPackages")} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {active === "img-to-pdf" && (
            <ToolRunner
              title={t("alati.tools.imgToPdf.title")}
              description={t("alati.tools.imgToPdf.runnerDescription")}
              acceptedExtensions={["jpg", "jpeg", "png"]}
              multiple
              outputFilename={() => `slike_${Date.now()}.pdf`}
              run={imagesToPdf}
              onBack={back}
              onBeforeRun={onBeforeRun}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "word-to-pdf" && (
            <ToolRunner
              title={t("alati.tools.wordToPdf.title")}
              description={t("alati.tools.wordToPdf.runnerDescription")}
              acceptedExtensions={["docx"]}
              outputFilename={(f) => (f as File).name.replace(/\.docx$/i, ".pdf")}
              run={(files, p) => wordToPdf(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRun}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "pdf-to-word" && (
            <ToolRunner
              title={t("alati.tools.pdfToWord.title")}
              description={t("alati.tools.pdfToWord.runnerDescription")}
              acceptedExtensions={["pdf"]}
              outputFilename={(f) => (f as File).name.replace(/\.pdf$/i, ".docx")}
              run={(files, p) => pdfToWord(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRun}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "excel-to-pdf" && (
            <ToolRunner
              title={t("alati.tools.excelToPdf.title")}
              description={t("alati.tools.excelToPdf.runnerDescription")}
              acceptedExtensions={["xlsx", "xls"]}
              outputFilename={(f) => (f as File).name.replace(/\.xlsx?$/i, ".pdf")}
              run={(files, p) => excelToPdf(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRun}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "pptx-to-pdf" && (
            <PptxConverter onBack={back} onBeforeRun={onBeforeRun} onAfterSuccess={onAfterSuccess} />
          )}
          {active === "script" && <ScriptConverter onBack={back} />}
          {active === "merge-pdf" && (
            <ToolRunner
              title={t("alati.tools.mergePdf.title")}
              description={t("alati.tools.mergePdf.runnerDescription")}
              acceptedExtensions={["pdf"]}
              multiple
              minFiles={2}
              outputFilename={() => `spojeni_${Date.now()}.pdf`}
              run={mergePdfs}
              onBack={back}
              onBeforeRun={onBeforeRun}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "split-pdf" && (
            <ToolRunner
              title={t("alati.tools.splitPdf.title")}
              description={t("alati.tools.splitPdf.runnerDescription")}
              acceptedExtensions={["pdf"]}
              outputFilename={(f) => (f as File).name.replace(/\.pdf$/i, "_stranice.zip")}
              run={(files, p) => splitPdf(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRun}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "html-to-docx" && (
            <ToolRunner
              title={t("alati.html.htmlToDocx.title")}
              description={t("alati.html.htmlToDocx.runnerDescription")}
              acceptedExtensions={["html", "htm"]}
              outputFilename={(f) => (f as File).name.replace(/\.html?$/i, ".docx")}
              run={(files, p) => htmlToDocx(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRun}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "html-to-pdf" && (
            <ToolRunner
              title={t("alati.html.htmlToPdf.title")}
              description={t("alati.html.htmlToPdf.runnerDescription")}
              acceptedExtensions={["html", "htm"]}
              outputFilename={(f) => (f as File).name.replace(/\.html?$/i, ".pdf")}
              run={(files, p) => htmlToPdf(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRunPro}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "html-to-jpg" && (
            <ToolRunner
              title={t("alati.html.htmlToJpg.title")}
              description={t("alati.html.htmlToJpg.runnerDescription")}
              acceptedExtensions={["html", "htm"]}
              outputFilename={(f) => (f as File).name.replace(/\.html?$/i, ".jpg")}
              run={(files, p) => htmlToJpg(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRunPro}
              onAfterSuccess={onAfterSuccess}
              initialFiles={initialFile ? [initialFile] : []}
            />
          )}
          {active === "html-to-png" && (
            <ToolRunner
              title={t("alati.html.htmlToPng.title")}
              description={t("alati.html.htmlToPng.runnerDescription")}
              acceptedExtensions={["html", "htm"]}
              outputFilename={(f) => (f as File).name.replace(/\.html?$/i, ".png")}
              run={(files, p) => htmlToPng(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRunPro}
              onAfterSuccess={onAfterSuccess}
            />
          )}
          {active === "html-to-txt" && (
            <ToolRunner
              title={t("alati.html.htmlToTxt.title")}
              description={t("alati.html.htmlToTxt.runnerDescription")}
              acceptedExtensions={["html", "htm"]}
              outputFilename={(f) => (f as File).name.replace(/\.html?$/i, ".txt")}
              run={(files, p) => htmlToTxt(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRunPro}
              onAfterSuccess={onAfterSuccess}
            />
          )}
          {active === "docx-to-html" && (
            <ToolRunner
              title={t("alati.html.docxToHtml.title")}
              description={t("alati.html.docxToHtml.runnerDescription")}
              acceptedExtensions={["docx"]}
              outputFilename={(f) => (f as File).name.replace(/\.docx$/i, ".html")}
              run={(files, p) => docxToHtml(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRunPro}
              onAfterSuccess={onAfterSuccess}
            />
          )}
          {active === "pdf-to-html" && (
            <ToolRunner
              title={t("alati.html.pdfToHtml.title")}
              description={t("alati.html.pdfToHtml.runnerDescription")}
              acceptedExtensions={["pdf"]}
              outputFilename={(f) => (f as File).name.replace(/\.pdf$/i, ".html")}
              run={(files, p) => pdfToHtml(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRunPro}
              onAfterSuccess={onAfterSuccess}
            />
          )}
          {active === "text-to-html" && (
            <ToolRunner
              title={t("alati.html.textToHtml.title")}
              description={t("alati.html.textToHtml.runnerDescription")}
              acceptedExtensions={["txt", "md", "markdown"]}
              outputFilename={(f) => (f as File).name.replace(/\.(txt|md|markdown)$/i, ".html")}
              run={(files, p) => textToHtml(files[0], p)}
              onBack={back}
              onBeforeRun={onBeforeRunPro}
              onAfterSuccess={onAfterSuccess}
            />
          )}
        </div>
      </main>

      <FreemiumPaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        used={used}
        limit={limit}
      />

      <PremiumFooter />
    </div>
  );
};

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

export default Alati;
