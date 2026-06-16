import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Megaphone, CheckCircle2, ArrowUpRight } from "lucide-react";

interface Ad {
  id: string;
  name: string;
  image_url: string;
  target_url: string;
  position: string;
}

// ── High-converting "Advertise with Us" placeholder banner ──
const PlaceholderBanner = ({ position }: { position: "left" | "right" }) => {
  const { t } = useTranslation();
  return (
    <a
      href="mailto:alenjusufovic@yahoo.com?subject=Sponzorstvo%20BH%20KONVER"
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-[160px] h-[600px] max-lg:w-full max-lg:h-auto max-lg:min-h-[140px] rounded-xl border border-border/60 bg-gradient-to-br from-card via-background to-muted/30 flex-shrink-0 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-300"
    >
      {/* Desktop: vertical layout */}
      <div className="hidden lg:flex flex-col items-center justify-between h-full p-5 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Megaphone className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-foreground leading-tight">
              {t("adSpace.title")}
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {t("adSpace.description")}
            </p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <ul className="space-y-1.5 text-left">
            <li className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 shrink-0" />
              <span>{t("adSpace.benefit1")}</span>
            </li>
            <li className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 shrink-0" />
              <span>{t("adSpace.benefit2")}</span>
            </li>
            <li className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 shrink-0" />
              <span>{t("adSpace.benefit3")}</span>
            </li>
          </ul>

          <div className="inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold shadow-sm group-hover:bg-primary/90 transition-colors">
            <Megaphone className="w-3.5 h-3.5" />
            {t("adSpace.cta")}
            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
        </div>
      </div>

      {/* Mobile: horizontal layout */}
      <div className="flex lg:hidden items-center gap-4 p-4 h-full">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">
            {t("adSpace.title")}
          </p>
          <p className="text-xs text-muted-foreground leading-snug mt-0.5">
            {t("adSpace.description")}
          </p>
        </div>
        <div className="shrink-0 inline-flex items-center gap-1 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm group-hover:bg-primary/90 transition-colors">
          <Megaphone className="w-3 h-3" />
          {t("adSpace.cta")}
        </div>
      </div>
    </a>
  );
};

// ── Single ad banner ──
const AdBanner = ({ ad }: { ad: Ad }) => (
  <a
    href={ad.target_url}
    target="_blank"
    rel="noopener noreferrer"
    className="block w-[160px] h-[600px] max-lg:w-full max-lg:h-auto max-lg:min-h-[100px] rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow flex-shrink-0"
  >
    <img
      src={ad.image_url}
      alt={ad.name}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </a>
);

// ── Main wrapper for Currency Converter with side banners ──
export function SponsorBanners({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase
        .from("ads_management")
        .select("id, name, image_url, target_url, position")
        .eq("is_active", true);
      if (data) setAds(data);
    };
    fetchAds();
  }, []);

  const leftAds = ads.filter((a) => a.position === "left");
  const rightAds = ads.filter((a) => a.position === "right");

  if (isMobile) {
    return (
      <div className="space-y-6">
        {children}
        <div className="flex flex-col gap-4 items-center">
          {leftAds.length > 0
            ? leftAds.map((ad) => <AdBanner key={ad.id} ad={ad} />)
            : <PlaceholderBanner position="left" />}
          {rightAds.length > 0
            ? rightAds.map((ad) => <AdBanner key={ad.id} ad={ad} />)
            : <PlaceholderBanner position="right" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center gap-6">
      <div className="flex flex-col gap-4 flex-shrink-0">
        {leftAds.length > 0
          ? leftAds.map((ad) => <AdBanner key={ad.id} ad={ad} />)
          : <PlaceholderBanner position="left" />}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      <div className="flex flex-col gap-4 flex-shrink-0">
        {rightAds.length > 0
          ? rightAds.map((ad) => <AdBanner key={ad.id} ad={ad} />)
          : <PlaceholderBanner position="right" />}
      </div>
    </div>
  );
}
