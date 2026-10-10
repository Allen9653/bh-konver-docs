import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SocialLinks } from "@/components/layout/Footer";

export const PremiumFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border mt-24 py-8 bg-card/50">
      <div className="container mx-auto px-4 max-w-5xl text-center space-y-3">
        <p className="text-xs text-muted-foreground tracking-wide uppercase">
          {t('footer.copyright')} · Secure & Private File Conversion
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <Link to="/category/generatori" className="inline-flex min-h-8 items-center hover:text-primary transition-colors">Generatori</Link>
          <span className="text-border">·</span>
          <Link to="/category/konvertori" className="inline-flex min-h-8 items-center hover:text-primary transition-colors">Konvertori</Link>
          <span className="text-border">·</span>
          <Link to="/category/kalkulatori" className="inline-flex min-h-8 items-center hover:text-primary transition-colors">Kalkulatori</Link>
          <span className="text-border">·</span>
          <Link to="/category/testovi" className="inline-flex min-h-8 items-center hover:text-primary transition-colors">Testovi</Link>
          <span className="text-border">·</span>
          <Link to="/alati" className="inline-flex min-h-8 items-center hover:text-primary transition-colors">PDF alati</Link>
          <span className="text-border">·</span>
          <Link to="/terms#legal-notice" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Pravne napomene</Link>
          <span className="text-border">·</span>
          <Link to="/privacy#security" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Sigurnost</Link>
          <span className="text-border">·</span>
          <Link to="/privacy#cookies" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Kolačići</Link>
          <span className="text-border">·</span>
          <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
          <span className="text-border">·</span>
          <Link to="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
          <span className="text-border">·</span>
          <Link to="/support" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t('footer.support')}</Link>
          <span className="text-border">·</span>
          <Link to="/support" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Kontakt</Link>
        </div>
        <SocialLinks className="flex items-center justify-center gap-2" />
        <p className="text-[11px] text-muted-foreground/60">
          {t('footer.developed')} · {t('footer.motto')}
        </p>
      </div>
    </footer>
  );
};
