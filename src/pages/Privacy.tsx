import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shield, Lock, Server, Eye, Database, RefreshCw, Globe, Cloud } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function Privacy() {
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
          <h1 className="text-4xl font-bold text-foreground mb-8">{t('privacy.title')}</h1>
          
          <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.businessPolicy.title')}</h2>
            <p className="text-muted-foreground">{t('privacy.businessPolicy.description')}</p>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6 mt-12">{t('privacy.technology')}</h2>

          {[
            { icon: Lock, key: 'ssl' },
            { icon: Server, key: 'dataCenters' },
            { icon: Eye, key: 'monitoring' },
            { icon: Globe, key: 'api' },
            { icon: Shield, key: 'idps' },
            { icon: Database, key: 'backup' },
            { icon: Lock, key: 'vpn' },
            { icon: RefreshCw, key: 'uptime' },
            { icon: Cloud, key: 'isolation' },
          ].map(({ icon: Icon, key }) => (
            <section key={key} className="mb-8">
              <div className="flex items-start gap-3 mb-3">
                <Icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{t(`privacy.${key}.title`)}</h3>
                  <p className="text-muted-foreground">{t(`privacy.${key}.description`)}</p>
                </div>
              </div>
            </section>
          ))}

          <h2 className="text-3xl font-bold text-foreground mb-6 mt-12">{t('privacy.practices')}</h2>

          {['compliance', 'accessControl', 'privacyPolicy', 'training', 'sdlc', 'incident'].map((key) => (
            <section key={key} className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-2">{t(`privacy.${key}.title`)}</h3>
              <p className="text-muted-foreground">{t(`privacy.${key}.description`)}</p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
