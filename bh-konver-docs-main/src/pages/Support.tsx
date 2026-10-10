import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, MessageCircle, Clock, Globe, Phone } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Support() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Podrška — BH Konver"
        description="Korisnička podrška za BH Konver. Kontakt e-mail, radno vrijeme i odgovori na česta pitanja."
        path="/support"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">{t('support.title')}</h1>
          
          <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-lg mb-8">
            <p className="text-lg text-foreground">Imate pitanje, prijedlog za novi konverter ili kalkulator, ili vam je potrebna tehnička podrška? Naš tim vam stoji na raspolaganju.</p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Načini kontakta</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="mailto:podrska@bh-assistant.ba" className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <span className="flex items-center gap-2 font-semibold text-foreground"><Mail className="h-4 w-4 text-primary" /> Tehnička podrška i prijava grešaka</span>
                <span className="mt-2 block text-sm text-primary">podrska@bh-assistant.ba</span>
              </a>
              <a href="mailto:info@bh-assistant.ba" className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <span className="flex items-center gap-2 font-semibold text-foreground"><Mail className="h-4 w-4 text-primary" /> Poslovne saradnje i upiti</span>
                <span className="mt-2 block text-sm text-primary">info@bh-assistant.ba</span>
              </a>
              <a href="mailto:alen.jusufovic@proton.me" className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <span className="flex items-center gap-2 font-semibold text-foreground"><Mail className="h-4 w-4 text-primary" /> Direktni e-mail osnivača</span>
                <span className="mt-2 block text-sm text-primary">alen.jusufovic@proton.me</span>
              </a>
              <a href="tel:+38762580207" className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <span className="flex items-center gap-2 font-semibold text-foreground"><Phone className="h-4 w-4 text-primary" /> Telefon / Viber</span>
                <span className="mt-2 block text-sm text-primary">+387 62 580 207</span>
              </a>
              <a href="https://www.bh-assistant.ba" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <span className="flex items-center gap-2 font-semibold text-foreground"><Globe className="h-4 w-4 text-primary" /> Službeni web portal</span>
                <span className="mt-2 block text-sm text-primary">www.bh-assistant.ba</span>
              </a>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <MessageCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('support.report.title')}</h3>
                <p className="text-muted-foreground">{t('support.report.description')}</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Clock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('support.response.title')}</h3>
                <p className="text-muted-foreground">Radno vrijeme tima za podršku: ponedjeljak–petak od 08:00 do 17:00 sati. {t('support.response.description')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
