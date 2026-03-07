import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface Ad {
  id: string;
  name: string;
  image_url: string;
  target_url: string;
  position: string;
}

// ── Placeholder banner when no ads are configured ──
const PlaceholderBanner = ({ position }: { position: "left" | "right" }) => {
  const { t } = useTranslation();
  return (
    <a
      href="mailto:alenjusufovic@yahoo.com?subject=Sponzorstvo%20BH%20KONVER"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-[160px] h-[600px] max-lg:w-full max-lg:h-auto max-lg:min-h-[100px] rounded-xl border-2 border-dashed border-accent/40 bg-gradient-to-b from-accent/5 to-background flex-shrink-0 overflow-hidden group hover:border-accent transition-colors"
    >
      <div className="flex flex-col items-center justify-center h-full p-4 text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-accent text-lg font-bold">AD</span>
        </div>
        <p className="text-xs font-semibold text-foreground leading-tight">
          {t("adSpace.title")}
        </p>
        <p className="text-[10px] text-muted-foreground leading-snug">
          {t("adSpace.contact")}
          <br />alenjusufovic@yahoo.com
        </p>
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
