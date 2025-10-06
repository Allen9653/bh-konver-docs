import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Single",
    price: "1.00 BAM",
    description: "1 dokument, max 3 A4 stranice",
    features: ["1 konverzija", "Svi formati", "Brzo procesiranje"],
  },
  {
    name: "Pack 10",
    price: "10.00 BAM",
    description: "10 konverzija bez ograničenja",
    features: ["10 konverzija", "Svi formati", "Bez ograničenja veličine", "Prioritetna podrška"],
    popular: true,
  },
  {
    name: "Premium",
    price: "50.00 BAM",
    description: "30 dana neograničene konverzije",
    features: [
      "Neograničene konverzije",
      "Svi formati",
      "Bez ograničenja veličine",
      "VIP podrška",
      "API pristup",
    ],
  },
];

interface PricingSectionProps {
  onSelectPlan: (tier: PricingTier) => void;
}

export const PricingSection = ({ onSelectPlan }: PricingSectionProps) => {
  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Izaberite plan</h2>
        <p className="text-muted-foreground">Platite samo za ono što vam treba</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_TIERS.map((tier) => (
          <Card
            key={tier.name}
            className={`p-6 relative ${
              tier.popular ? "border-primary border-2 shadow-lg" : ""
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  Najpopularnije
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold text-primary mb-2">{tier.price}</div>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={tier.popular ? "default" : "outline"}
              onClick={() => onSelectPlan(tier)}
            >
              Odaberi plan
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
