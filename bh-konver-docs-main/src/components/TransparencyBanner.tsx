import { useTranslation } from "react-i18next";
import { Shield, Clock, Trash2, Lock } from "lucide-react";

export const TransparencyBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {t('transparency.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('transparency.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
          <Clock className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {t('transparency.autodelete.title')}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t('transparency.autodelete.description')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
          <Trash2 className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {t('transparency.noretention.title')}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t('transparency.noretention.description')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
          <Lock className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {t('transparency.nosharing.title')}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t('transparency.nosharing.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
