import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogIn, LogOut, History, Shield, Crown } from "lucide-react";
import logo from "@/assets/bh-konver-logo.png";

interface PremiumHeaderProps {
  user: { email?: string } | null;
  isAdmin: boolean;
  isPremium: boolean;
  expiresAt: Date | null;
  onSignOut: () => void;
}

export const PremiumHeader = ({ user, isAdmin, isPremium, expiresAt, onSignOut }: PremiumHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <img src={logo} alt="BH Konver" width={32} height={32} className="h-8 w-8 object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold font-display tracking-tight text-foreground leading-none">
              BH <span className="text-primary">KONVER</span>
            </h1>
            <p className="text-[11px] text-muted-foreground tracking-wide">Premium File Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/pravni-dokumenti")} className="h-8 px-2 text-xs hidden sm:inline-flex">
            Pravni dokumenti
          </Button>
          <LanguageSwitcher />
          {user ? (
            <>
              <span className="text-xs text-muted-foreground hidden md:inline">{user.email}</span>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="h-8 px-2" aria-label="Otvori admin panel">
                  <Shield className="h-3.5 w-3.5" />
                </Button>
              )}
              {isPremium && !isAdmin && (
                <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                  <Crown className="w-3 h-3" /> PRO
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="h-8 px-2" aria-label="Otvori historiju dokumenata">
                <History className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onSignOut} className="h-8 px-2" aria-label="Odjavi se">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")} className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
              <LogIn className="mr-1 h-3.5 w-3.5" />
              {t('quickActions.login')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
