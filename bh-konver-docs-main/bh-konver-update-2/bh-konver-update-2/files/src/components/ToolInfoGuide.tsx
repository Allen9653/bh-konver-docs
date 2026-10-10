import { useId, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Check, HelpCircle, Info, ListOrdered, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getToolGuide, type ToolGuide } from "@/lib/toolGuides";

type ToolInfoGuideProps = {
  /** ID iz TOOL_GUIDES, npr. "converter-unit" ili "calculator-pdv" */
  toolId?: string;
  className?: string;
  /**
   * Kompatibilnost sa ranijom verzijom komponente (commit 5a19a9f): ručno proslijeđeni sadržaj.
   * Ako je zadat uz `toolId`, ručno proslijeđena polja imaju prednost.
   */
  title?: string;
  description?: string;
  steps?: string[];
  benefits?: string[];
  faqs?: { question: string; answer: string }[];
};

/**
 * Edukativni vodič na dnu stranice alata: šta je alat, kako se koristi,
 * prednosti i česta pitanja. Sadržaj je na bosanskom (src/lib/toolGuides.ts), a svaki ID
 * se može prevesti u i18n fajlovima pod ključem `toolGuides.<id>`.
 */
export const ToolInfoGuide = ({ toolId, className = "", title, description, steps, benefits, faqs }: ToolInfoGuideProps) => {
  const { t, i18n } = useTranslation();
  const headingId = useId();
  const base = getToolGuide(toolId);
  const lang = i18n.resolvedLanguage || i18n.language;

  const guide = useMemo<ToolGuide | undefined>(() => {
    let merged: ToolGuide | undefined = base;
    if (base && toolId) {
      const override = i18n.getResource(lang, "translation", `toolGuides.${toolId}`) as Partial<ToolGuide> | undefined;
      if (override && typeof override === "object") merged = { ...base, ...override };
    }
    const hasManual = Boolean(title || description || steps?.length || benefits?.length || faqs?.length);
    if (!merged && !hasManual) return undefined;
    return {
      name: title ?? merged?.name ?? "",
      what: description ? [description] : merged?.what ?? [],
      steps: steps ?? merged?.steps ?? [],
      benefits: benefits ?? merged?.benefits ?? [],
      faq: faqs ? faqs.map(({ question, answer }) => ({ q: question, a: answer })) : merged?.faq ?? [],
      preview: merged?.preview,
    };
  }, [base, toolId, title, description, steps, benefits, faqs, i18n, lang]);

  if (!guide) return null;

  const faqJsonLd = guide.faq.length
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      })
    : null;

  const cardClass = "rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6";
  const cardTitleClass = "flex items-center gap-2.5 font-display text-lg font-bold text-foreground";
  const iconWrapClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary";

  return (
    <section aria-labelledby={headingId} className={`mx-auto mt-12 w-full max-w-5xl space-y-5 ${className}`}>
      {faqJsonLd && (
        <Helmet>
          <script type="application/ld+json">{faqJsonLd}</script>
        </Helmet>
      )}
      <h2 id={headingId} className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        {t("toolGuide.title", { name: guide.name, defaultValue: "O alatu: {{name}}" })}
      </h2>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className={cardClass}>
          <h3 className={cardTitleClass}>
            <span className={iconWrapClass}><Info className="h-4 w-4" aria-hidden="true" /></span>
            {t("toolGuide.what", { defaultValue: "Šta je ovaj alat?" })}
          </h3>
          <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
            {guide.what.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>

        <article className={cardClass}>
          <h3 className={cardTitleClass}>
            <span className={iconWrapClass}><ShieldCheck className="h-4 w-4" aria-hidden="true" /></span>
            {t("toolGuide.benefits", { defaultValue: "Prednosti i preporuke BH KONVER-a" })}
          </h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            {guide.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className={cardClass}>
        <h3 className={cardTitleClass}>
          <span className={iconWrapClass}><ListOrdered className="h-4 w-4" aria-hidden="true" /></span>
          {t("toolGuide.how", { defaultValue: "Kako se koristi?" })}
        </h3>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {guide.steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 rounded-md bg-muted/50 p-3 text-sm leading-6 text-foreground">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground" aria-hidden="true">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </article>

      {guide.faq.length > 0 && (
        <article className={cardClass}>
          <h3 className={cardTitleClass}>
            <span className={iconWrapClass}><HelpCircle className="h-4 w-4" aria-hidden="true" /></span>
            {t("toolGuide.faq", { defaultValue: "Česta pitanja" })}
          </h3>
          <Accordion type="single" collapsible className="mt-2">
            {guide.faq.map(({ q, a }, index) => (
              <AccordionItem key={q} value={`faq-${index}`}>
                <AccordionTrigger className="min-h-12 text-left text-sm font-semibold">{q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </article>
      )}
    </section>
  );
};

export default ToolInfoGuide;
