import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Clock, CalendarDays, Crown, ShieldCheck, Zap, Sparkles, ArrowRight, Check } from "lucide-react";

interface FreemiumPaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used?: number;
  limit?: number;
}

const TIERS = [
  {
    id: "24h",
    name: "24-satni pristup",
    price: "2.00 BAM",
    duration: "24 sata",
    icon: Clock,
    badge: null as string | null,
    features: ["Neograničene konverzije", "Vrhunsko očuvanje formata", "Bez reklama"],
    cta: "Otključaj na 24h",
  },
  {
    id: "weekly",
    name: "7-dnevni pristup",
    price: "7.00 BAM",
    duration: "7 dana",
    icon: CalendarDays,
    badge: "Najpopularnije",
    features: ["Sve iz 24h paketa", "Batch obrada (više fajlova)", "Idealno za studente i projekte"],
    cta: "Otključaj na 7 dana",
  },
  {
    id: "monthly",
    name: "Mjesečna pretplata",
    price: "20.00 BAM",
    duration: "30 dana",
    icon: Crown,
    badge: "Najbolja vrijednost",
    features: ["Sve iz nedjeljnog paketa", "Prioritetna obrada i podrška", "Audio / video alati"],
    cta: "Pretplati se mjesečno",
  },
];

export function FreemiumPaywallModal({
  open,
  onOpenChange,
  used = 2,
  limit = 2,
}: FreemiumPaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        {/* Header */}
        <div className="gradient-hero text-white px-6 py-7 text-center relative">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-accent" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-display text-white">
              Iskoristili ste sve besplatne konverzije
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm max-w-md mx-auto">
              ({used}/{limit}) — odaberite paket ispod i nastavite s neograničenom konverzijom dokumenata visokog kvaliteta.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs">
              <ShieldCheck className="w-3 h-3" /> Sigurno plaćanje
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs">
              <Zap className="w-3 h-3" /> Trenutna aktivacija
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs">
              <Sparkles className="w-3 h-3" /> Vrhunsko formatiranje
            </span>
          </div>
        </div>

        {/* Tiers */}
        <div className="p-6 bg-background">
          <div className="grid sm:grid-cols-3 gap-4">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const featured = tier.id === "weekly";
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-xl border p-5 flex flex-col bg-card transition-all ${
                    featured
                      ? "border-primary border-2 shadow-lg sm:scale-[1.02]"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {tier.badge && (
                    <Badge
                      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] ${
                        featured ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {tier.badge}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-sm">{tier.name}</h4>
                  </div>

                  <div className="mb-3">
                    <div className="text-2xl font-bold text-primary leading-none">{tier.price}</div>
                    <div className="text-xs text-muted-foreground mt-1">za {tier.duration}</div>
                  </div>

                  <ul className="space-y-2 mb-4 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={featured ? "default" : "outline"}
                    className={`w-full ${featured ? "bg-primary hover:bg-primary/90" : ""}`}
                    onClick={() => onOpenChange(false)}
                  >
                    <Link to={`/#pricing`}>
                      {tier.cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Besplatni alati za <strong>jedinice</strong> i <strong>valute</strong> ostaju neograničeni.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
