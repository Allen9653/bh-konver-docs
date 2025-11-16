import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('footer.ownership')}
          </p>
          <p className="text-base font-semibold text-foreground">
            {t('footer.motto')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a 
              href="mailto:info@bh-assistant.ba" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              info@bh-assistant.ba
            </a>
            <span className="text-muted-foreground">|</span>
            <Link 
              to="/privacy" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link 
              to="/terms" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {t('footer.terms')}
            </Link>
            <span className="text-muted-foreground">|</span>
            <a 
              href="mailto:info@bh-assistant.ba" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {t('footer.support')}
            </a>
          </div>
          <a 
            href="https://www.bh-assistant.ba" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-primary hover:text-primary/80 transition-colors font-medium"
          >
            www.bh-assistant.ba
          </a>
        </div>
      </div>
    </footer>
  );
};
