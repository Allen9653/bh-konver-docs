import { Link } from "react-router-dom";
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
  title = "Dostigli ste besplatni limit",
  message = "Iskoristili ste sve besplatne PPTX konverzije za ovaj sat. Nadogradite na Premium za neograničenu obradu, batch konverziju i napredne formate.",
  retryAfterSeconds,
}: PremiumUpsellModalProps) {
  const retry = formatRetry(retryAfterSeconds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="mx-auto -mt-2 mb-2 w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-accent" />
        </div>
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-display">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 my-2 text-sm">
          <li className="flex gap-3">
            <InfinityIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span><strong>Neograničene konverzije</strong> — bez limita po satu ili danu.</span>
          </li>
          <li className="flex gap-3">
            <Zap className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span><strong>Batch obrada</strong> — više fajlova istovremeno.</span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span><strong>Prioritetna podrška</strong> i napredni audio/video alati.</span>
          </li>
        </ul>

        {retry && (
          <p className="text-xs text-center text-muted-foreground">
            Ili sačekajte oko <strong>{retry}</strong> pa probajte ponovo besplatno.
          </p>
        )}

        <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link to="/#pricing" onClick={() => onOpenChange(false)}>
              Pogledaj Premium pakete <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Možda kasnije
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
