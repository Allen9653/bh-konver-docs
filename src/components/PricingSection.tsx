import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, Calendar } from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: any;
}

export interface PricingSectionProps {
  onSelectPlan: (tier: PricingTier) => void;
}

export type { PricingTier };

export const PricingSection = ({ onSelectPlan }: PricingSectionProps) => {
  const { t } = useTranslation();

  const PRICING_TIERS: PricingTier[] = [
    {
      id: "24h",
      name: t('pricing.day.title'),
      price: "2.00 BAM",
      duration: "24h",
      description: t('pricing.day.description'),
      features: [
        t('pricing.day.feature1'),
        t('pricing.day.feature2'),
        t('pricing.day.feature3'),
      ],
      icon: Clock,
    },
    {
      id: "48h",
      name: t('pricing.twoDay.title'),
      price: "10.00 BAM",
      duration: "48h",
      description: t('pricing.twoDay.description'),
      features: [
        t('pricing.twoDay.feature1'),
        t('pricing.twoDay.feature2'),
        t('pricing.twoDay.feature3'),
        t('pricing.twoDay.feature4'),
      ],
      popular: true,
      icon: Clock,
    },
    {
      id: "monthly",
      name: t('pricing.monthly.title'),
      price: "50.00 BAM",
      duration: t('pricing.monthly.duration'),
      description: t('pricing.monthly.description'),
      features: [
        t('pricing.monthly.feature1'),
        t('pricing.monthly.feature2'),
        t('pricing.monthly.feature3'),
        t('pricing.monthly.feature4'),
        t('pricing.monthly.feature5'),
      ],
      icon: Calendar,
    },
  ];

  return (
    <div className="py-12 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">{t('pricing.title')}</h2>
        <p className="text-muted-foreground">{t('pricing.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_TIERS.map((tier) => {
          const IconComponent = tier.icon;
          return (
            <Card
              key={tier.id}
              className={`p-6 relative hover:shadow-xl transition-all duration-300 ${
                tier.popular ? "border-primary border-2 shadow-lg scale-105" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <IconComponent className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-primary mb-1">{tier.price}</div>
                <div className="text-sm text-muted-foreground font-semibold mb-2">{tier.duration}</div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.popular ? "default" : "outline"}
                onClick={() => onSelectPlan(tier)}
              >
                {t('pricing.selectButton')}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
