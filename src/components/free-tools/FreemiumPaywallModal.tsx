import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Clock, CalendarDays, Crown, ShieldCheck, Zap, Sparkles, ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FreemiumPaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used?: number;
  limit?: number;
}

type PlanId = "24h" | "7d" | "monthly";

const TIERS: {
  id: PlanId;
  icon: typeof Clock;
  badgeKey: string | null;
  i18nKey: string;
}[] = [
  { id: "24h", icon: Clock, badgeKey: null, i18nKey: "tier24h" },
  { id: "7d", icon: CalendarDays, badgeKey: "paywall.popular", i18nKey: "tier7d" },
  { id: "monthly", icon: Crown, badgeKey: "paywall.bestValue", i18nKey: "tierMonthly" },
];

const TIER_PRICES: Record<PlanId, string> = {
  "24h": "2.00 BAM",
  "7d": "7.00 BAM",
  monthly: "20.00 BAM",
};

export function FreemiumPaywallModal({
  open,
  onOpenChange,
  used = 2,
  limit = 2,
}: FreemiumPaywallModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const handlePurchase = async (plan: PlanId, durationLabel: string) => {
    setLoadingPlan(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        toast.info(t("paywall.loginNotice"));
        onOpenChange(false);
        navigate("/auth?redirect=/alati");
        return;
      }

      const { data, error } = await supabase.functions.invoke("process-paypal-payment", {
        body: { email: session.user.email, plan, duration: durationLabel },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const approvalUrl: string | undefined = data?.approvalUrl;
      if (!approvalUrl) throw new Error("PayPal approval URL nije primljen.");

      // Redirect to PayPal in same tab so return_url brings us back signed in
      window.location.href = approvalUrl;
    } catch (e) {
      console.error("Paywall checkout error:", e);
      toast.error(t("paywall.checkoutError"));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <div className="gradient-hero text-white px-6 py-7 text-center relative">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-accent" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-display text-white">
              {t("paywall.title")}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm max-w-md mx-auto">
              {t("paywall.description", { used, limit })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs">
              <ShieldCheck className="w-3 h-3" /> {t("paywall.securePayment")}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs">
              <Zap className="w-3 h-3" /> {t("paywall.instantActivation")}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs">
              <Sparkles className="w-3 h-3" /> {t("paywall.topFormatting")}
            </span>
          </div>
        </div>

        <div className="p-6 bg-background">
          <div className="grid sm:grid-cols-3 gap-4">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const name = t(`paywall.${tier.i18nKey}.name`);
              const duration = t(`paywall.${tier.i18nKey}.duration`);
              const features = [1, 2, 3].map((n) => t(`paywall.${tier.i18nKey}.f${n}`));
              const price = TIER_PRICES[tier.id];
              const featured = tier.id === "7d";
              const isLoading = loadingPlan === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-xl border p-5 flex flex-col bg-card transition-all ${
                    featured
                      ? "border-primary border-2 shadow-lg sm:scale-[1.02]"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {tier.badgeKey && (
                    <Badge
                      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] ${
                        featured ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {t(tier.badgeKey as string)}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-sm">{name}</h4>
                  </div>

                  <div className="mb-3">
                    <div className="text-2xl font-bold text-primary leading-none">{price}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("paywall.for", { duration })}</div>
                  </div>

                  <ul className="space-y-2 mb-4 flex-1">
                    {features.map((f, i) => (
                      <li key={i} className="flex gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={featured ? "default" : "outline"}
                    className={`w-full ${featured ? "bg-primary hover:bg-primary/90" : ""}`}
                    disabled={isLoading || loadingPlan !== null}
                    onClick={() => handlePurchase(tier.id, duration)}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> {t("paywall.redirecting")}</>
                    ) : (
                      <>{t(`paywall.${tier.i18nKey}.cta`)} <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            {t("paywall.footnote")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
