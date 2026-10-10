import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Terms() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Uvjeti korištenja — BH KONVER"
        description="Pravila i uvjeti korištenja BH KONVER platforme, uključujući opseg usluga, odgovornost i intelektualno vlasništvo."
        path="/terms"
      />
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8 sm:py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        <header className="mb-8 border-b border-border pb-8 sm:mb-10 sm:pb-10">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Posljednja izmjena: Oktobar 2026.</p>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Uvjeti korištenja – BH KONVER</h1>
          <p className="mt-3 text-base font-medium text-primary">Pravila i uvjeti korištenja platforme</p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Pristupanjem i korištenjem internetske stranice <strong className="font-semibold text-foreground">www.bh-konver.ba</strong> prihvaćate ove Uvjete korištenja u cijelosti. Molimo vas da ih pažljivo pročitate prije korištenja naših besplatnih i premium alata.
          </p>
        </header>

        <div className="space-y-5">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <p className="mb-2 text-xs font-bold uppercase text-primary">01 · Usluge</p>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Opseg usluga</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              BH KONVER pruža širok spektar online alata: pretvarače jedinica i valuta, audio/video i PDF konvertere, generatore kodova, finansijske kalkulatore (PDV, gorivo, struja, staž) te interaktivne testove znanja.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <p className="mb-2 text-xs font-bold uppercase text-primary">02 · Odgovornost</p>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Točnost izračuna i odricanje odgovornosti</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Svi kalkulatori i konverteri na platformi dizajnirani su s ciljem visoke preciznosti. Ipak, BH KONVER ne preuzima pravnu ni finansijsku odgovornost za eventualna odstupanja, tiskarske pogreške ili odluke donesene na temelju rezultata izračuna. Za službene finansijske i pravne postupke preporučujemo provjeru kod nadležnih institucija.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <p className="mb-2 text-xs font-bold uppercase text-primary">03 · Autorska prava</p>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Intelektualno vlasništvo</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Sav sadržaj, dizajn sučelja, logotipi, izvorni kod i baze podataka na domeni www.bh-konver.ba vlasništvo su platforme i zaštićeni su zakonima o autorskim pravima. Neovlašteno kopiranje ili preuzimanje sadržaja je strogo zabranjeno.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Dodatni uslovi korištenja</h2>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground">{t('terms.eligibility.title')}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('terms.eligibility.description')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('terms.commercial.title')}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('terms.commercial.description1')} {t('terms.commercial.description2')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('terms.dataSecurity.title')}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('terms.dataSecurity.description')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('terms.restrictions.title')}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('terms.restrictions.intro')}</p>
                <ul className="mt-2 list-inside list-disc space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>{t('terms.restrictions.item1')}</li>
                  <li>{t('terms.restrictions.item2')}</li>
                  <li>{t('terms.restrictions.item3')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('terms.payments.title')}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('terms.payments.description')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('terms.changes.title')}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('terms.changes.description')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('terms.contact.title')}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t('terms.contact.description')} {" "}
                  <a href="mailto:info@bh-assistant.ba" className="font-medium text-primary hover:underline">info@bh-assistant.ba</a>
                </p>
              </div>
            </div>
          </section>

          <section id="legal-notice" className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <p className="mb-2 text-xs font-bold uppercase text-primary">Pravne obavijesti</p>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Podaci o pružatelju usluge</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Naziv platforme</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">BH KONVER</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Službena domena</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">www.bh-konver.ba</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Operater</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">B&amp;H Assistant d.o.o.</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Sjedište</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">Zenica, Bosna i Hercegovina</dd>
              </div>
            </dl>
            <h3 className="mt-6 font-semibold text-foreground">Kontakt za pravne upite</h3>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-muted-foreground">
              <a href="https://www.bh-assistant.ba" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.bh-assistant.ba</a>
              <a href="mailto:info@bh-assistant.ba" className="text-primary hover:underline">info@bh-assistant.ba</a>
              <a href="mailto:alen.jusufovic@proton.me" className="text-primary hover:underline">alen.jusufovic@proton.me</a>
              <a href="tel:+38762580207" className="text-primary hover:underline">+387 62 580 207</a>
            </div>
            <p className="mt-6 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
              Sva prava pridržana. Korištenjem ove stranice podliježete važećim zakonima i propisima.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
