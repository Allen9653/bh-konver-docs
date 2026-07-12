import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-primary text-primary-foreground border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-4">
          <p className="text-sm">
            {t('footer.copyright')}
          </p>
          <p className="text-sm">
            {t('footer.developed')}
          </p>
          <p className="text-sm">
            {t('footer.ownership')}
          </p>
          <p className="text-base font-semibold">
            {t('footer.motto')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a 
              href="mailto:info@bh-assistant.ba" 
              className="hover:opacity-80 transition-opacity"
            >
              info@bh-assistant.ba
            </a>
            <span className="opacity-60">|</span>
            <Link 
              to="/privacy" 
              className="hover:opacity-80 transition-opacity"
            >
              {t('footer.privacy')}
            </Link>
            <span className="opacity-60">|</span>
            <Link 
              to="/terms" 
              className="hover:opacity-80 transition-opacity"
            >
              {t('footer.terms')}
            </Link>
            <span className="opacity-60">|</span>
            <Link 
              to="/support" 
              className="hover:opacity-80 transition-opacity"
            >
              {t('footer.support')}
            </Link>
            <span className="opacity-60">|</span>
            <Link 
              to="/connect" 
              className="hover:opacity-80 transition-opacity"
            >
              Poveži AI
            </Link>
          </div>
          <a 
            href="https://www.bh-assistant.ba" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity font-medium"
          >
            www.bh-assistant.ba
          </a>
        </div>
      </div>
    </footer>
  );
};
