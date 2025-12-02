import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function Terms() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">{t('terms.title')}</h1>
          
          <p className="text-muted-foreground mb-6">{t('terms.intro')}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.eligibility.title')}</h2>
            <p className="text-muted-foreground">{t('terms.eligibility.description')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.ownership.title')}</h2>
            <p className="text-muted-foreground">{t('terms.ownership.description')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.commercial.title')}</h2>
            <p className="text-muted-foreground mb-4">{t('terms.commercial.description1')}</p>
            <p className="text-muted-foreground">{t('terms.commercial.description2')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.dataSecurity.title')}</h2>
            <p className="text-muted-foreground">{t('terms.dataSecurity.description')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.restrictions.title')}</h2>
            <p className="text-muted-foreground mb-3">{t('terms.restrictions.intro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('terms.restrictions.item1')}</li>
              <li>{t('terms.restrictions.item2')}</li>
              <li>{t('terms.restrictions.item3')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.payments.title')}</h2>
            <p className="text-muted-foreground">{t('terms.payments.description')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.liability.title')}</h2>
            <p className="text-muted-foreground">{t('terms.liability.description')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.changes.title')}</h2>
            <p className="text-muted-foreground">{t('terms.changes.description')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.contact.title')}</h2>
            <p className="text-muted-foreground">
              {t('terms.contact.description')}{" "}
              <a href="mailto:info@bh-assistant.ba" className="text-primary hover:underline">
                📧 info@bh-assistant.ba
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
