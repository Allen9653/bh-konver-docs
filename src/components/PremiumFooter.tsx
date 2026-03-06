import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const PremiumFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border mt-24 py-8 bg-card/50">
      <div className="container mx-auto px-4 max-w-5xl text-center space-y-3">
        <p className="text-xs text-muted-foreground tracking-wide uppercase">
          {t('footer.copyright')} · Secure & Private File Conversion
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
          <span className="text-border">·</span>
          <Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
          <span className="text-border">·</span>
          <Link to="/support" className="hover:text-primary transition-colors">{t('footer.support')}</Link>
          <span className="text-border">·</span>
          <a href="mailto:info@bh-assistant.ba" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          {t('footer.developed')} · {t('footer.motto')}
        </p>
      </div>
    </footer>
  );
};
