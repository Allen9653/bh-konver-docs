import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, MessageCircle, Clock } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function Support() {
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
          <h1 className="text-4xl font-bold text-foreground mb-8">{t('support.title')}</h1>
          
          <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-lg mb-8">
            <p className="text-lg text-foreground">{t('support.description')}</p>
          </div>

          <section className="mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('support.contact.title')}</h3>
                <p className="text-muted-foreground mb-4">{t('support.contact.description')}</p>
                <a 
                  href="mailto:info@bh-assistant.ba" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-lg"
                >
                  <Mail className="w-5 h-5" />
                  info@bh-assistant.ba
                </a>
              </div>
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
                <p className="text-muted-foreground">{t('support.response.description')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
