import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Upload, 
  History, 
  CreditCard, 
  HelpCircle,
  ArrowRight,
  User
} from "lucide-react";

interface QuickActionsProps {
  isLoggedIn: boolean;
  onUploadClick: () => void;
}

export const QuickActions = ({ isLoggedIn, onUploadClick }: QuickActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t('quickActions.guestTitle')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t('quickActions.guestDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/auth")} size="lg">
              <User className="w-4 h-4 mr-2" />
              {t('quickActions.register')}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
              {t('quickActions.login')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Button
        variant="outline"
        className="h-auto flex-col gap-2 p-4 hover:bg-primary/10"
        onClick={onUploadClick}
      >
        <Upload className="w-6 h-6 text-primary" />
        <span className="text-sm font-medium">{t('quickActions.upload')}</span>
      </Button>

      <Button
        variant="outline"
        className="h-auto flex-col gap-2 p-4 hover:bg-primary/10"
        onClick={() => navigate("/history")}
      >
        <History className="w-6 h-6 text-primary" />
        <span className="text-sm font-medium">{t('quickActions.history')}</span>
      </Button>

      <Button
        variant="outline"
        className="h-auto flex-col gap-2 p-4 hover:bg-primary/10"
        onClick={() => {
          const pricingSection = document.getElementById("pricing");
          pricingSection?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <CreditCard className="w-6 h-6 text-primary" />
        <span className="text-sm font-medium">{t('quickActions.pricing')}</span>
      </Button>

      <Button
        variant="outline"
        className="h-auto flex-col gap-2 p-4 hover:bg-primary/10"
        onClick={() => navigate("/support")}
      >
        <HelpCircle className="w-6 h-6 text-primary" />
        <span className="text-sm font-medium">{t('quickActions.support')}</span>
      </Button>
    </div>
  );
};
