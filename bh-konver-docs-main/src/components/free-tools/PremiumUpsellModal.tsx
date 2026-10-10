import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Infinity as InfinityIcon, ShieldCheck, ArrowRight } from "lucide-react";

interface PremiumUpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  retryAfterSeconds?: number;
}

function formatRetry(seconds?: number): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.ceil(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.ceil(m / 60);
  return `${h} h`;
}

export function PremiumUpsellModal({
  open,
  onOpenChange,
  title,
  message,
  retryAfterSeconds,
}: PremiumUpsellModalProps) {
  const { t } = useTranslation();
  const retry = formatRetry(retryAfterSeconds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="mx-auto -mt-2 mb-2 w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-accent" />
        </div>
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-display">{title ?? t("premiumUpsell.title")}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {message ?? t("premiumUpsell.message")}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 my-2 text-sm">
          <li className="flex gap-3">
            <InfinityIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span><strong>{t("premiumUpsell.b1")}</strong> {t("premiumUpsell.b1text")}</span>
          </li>
          <li className="flex gap-3">
            <Zap className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span><strong>{t("premiumUpsell.b2")}</strong> {t("premiumUpsell.b2text")}</span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span><strong>{t("premiumUpsell.b3")}</strong> {t("premiumUpsell.b3text")}</span>
          </li>
        </ul>

        {retry && (
          <p className="text-xs text-center text-muted-foreground">
            {t("premiumUpsell.retry", { time: retry })}
          </p>
        )}

        <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link to="/#pricing" onClick={() => onOpenChange(false)}>
              {t("premiumUpsell.viewPackages")} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            {t("premiumUpsell.later")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
