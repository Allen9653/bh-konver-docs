import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogIn, LogOut, History, Shield, Crown } from "lucide-react";
import logo from "@/assets/bh-konver-logo.png";

interface PremiumHeaderProps {
  user: { email?: string } | null;
  isAdmin: boolean;
  isPremium: boolean;
  expiresAt: Date | null;
  onSignOut: () => void | Promise<void>;
  /** True while the auth session is still being rehydrated. */
  loading?: boolean;
}

export const PremiumHeader = ({ user, isAdmin, isPremium, expiresAt, onSignOut, loading = false }: PremiumHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();


  const handleSignOut = async () => {
    try {
      await onSignOut();
      toast.success(t("auth.signedOut"));
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.success(t("auth.signedOut"));
    }
    // Return to the public homepage; the login option stays available there.
    navigate("/", { replace: true });
  };



  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <img src={logo} alt="BH Konver" width={32} height={32} className="h-8 w-8 object-contain" />
          <div className="hidden sm:block">
            <p className="text-sm font-bold font-display tracking-tight text-foreground leading-none">
              BH <span className="text-primary">KONVER</span>
            </p>
            <p className="text-[11px] text-muted-foreground tracking-wide">Premium File Suite</p>
          </div>
        </div>

        <nav className="order-3 flex w-full items-center justify-center gap-1 border-t border-border/60 pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0" aria-label="Glavna navigacija">
          {[
            { label: "GENERATORI", to: "/category/generatori" },
            { label: "KONVERTORI", to: "/category/konvertori" },
            { label: "KALKULATORI", to: "/category/kalkulatori" },
            { label: "TESTOVI", to: "/category/testovi" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="inline-flex min-h-10 items-center rounded-md px-2 py-2 text-[10px] font-bold text-foreground/70 transition-colors hover:bg-muted hover:text-primary sm:px-2.5 sm:text-xs">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <LanguageSwitcher />
          {loading ? (
            // Placeholder while the session rehydrates — prevents a flash of
            // either the signed-in or signed-out UI.
            <div className="h-8 w-24 rounded-md bg-muted animate-pulse" aria-hidden="true" />
          ) : user ? (

            <>
              <span className="text-xs text-muted-foreground hidden md:inline">{user.email}</span>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="h-10 w-10 px-2 sm:h-8 sm:w-auto" aria-label="Otvori admin panel">
                  <Shield className="h-3.5 w-3.5" />
                </Button>
              )}
              {isPremium && !isAdmin && (
                <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                  <Crown className="w-3 h-3" /> PRO
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="h-10 w-10 px-2 sm:h-8 sm:w-auto" aria-label="Otvori historiju dokumenata">
                <History className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="h-10 px-3 text-xs sm:h-8"
                aria-label={t("auth.signOut")}
              >
                <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{t("auth.signOut")}</span>
              </Button>

            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")} className="h-10 text-xs bg-primary hover:bg-primary/90 text-primary-foreground sm:h-8">
              <LogIn className="mr-1 h-3.5 w-3.5" />
              {t('quickActions.login')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
