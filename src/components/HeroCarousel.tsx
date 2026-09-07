import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import bijeljina from "@/assets/cities/bijeljina.png.asset.json";
import brcko from "@/assets/cities/brcko.png.asset.json";
import olovo from "@/assets/cities/olovo.png.asset.json";
import sarajevo from "@/assets/cities/sarajevo.png.asset.json";
import trebinje from "@/assets/cities/trebinje.png.asset.json";
import tuzla from "@/assets/cities/tuzla.png.asset.json";
import zenica from "@/assets/cities/zenica.png.asset.json";
import banjaLuka from "@/assets/cities/banja-luka.png.asset.json";
import bihac from "@/assets/cities/bihac.jpg";

type CityLabelTone = "dark" | "yellow";

type CitySlide = {
  src: string;
  city: string;
  labelTone: CityLabelTone;
};

const slides = [
  { src: sarajevo.url, city: "Sarajevo", labelTone: "dark" },
  { src: banjaLuka.url, city: "Banja Luka", labelTone: "yellow" },
  { src: tuzla.url, city: "Tuzla", labelTone: "dark" },
  { src: zenica.url, city: "Zenica", labelTone: "dark" },
  { src: bihac, city: "Bihać", labelTone: "dark" },
  { src: bijeljina.url, city: "Bijeljina", labelTone: "dark" },
  { src: brcko.url, city: "Brčko", labelTone: "dark" },
  { src: trebinje.url, city: "Trebinje", labelTone: "dark" },
  { src: olovo.url, city: "Olovo", labelTone: "dark" },
] satisfies CitySlide[];

type HeroCarouselProps = {
  className?: string;
  onToneChange?: (tone: CityLabelTone) => void;
};

export const HeroCarousel = ({ className = "", onToneChange }: HeroCarouselProps) => {
  return (
    <Swiper
      modules={[Autoplay, EffectFade, Pagination]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop
      pagination={{ clickable: true }}
      onSwiper={(swiper) => onToneChange?.(slides[swiper.realIndex]?.labelTone || "dark")}
      onSlideChange={(swiper) => onToneChange?.(slides[swiper.realIndex]?.labelTone || "dark")}
      className={`absolute inset-0 w-full h-full ${className}`}
    >
      {slides.map((s) => (
        <SwiperSlide key={s.city}>
          <img
            src={s.src}
            alt={`${s.city}, Bosna i Hercegovina`}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div
            className={`absolute bottom-4 right-4 z-10 rounded-full px-4 py-1.5 text-sm font-bold shadow-md backdrop-blur-md ${
              s.labelTone === "yellow" ? "bg-foreground/90 text-gold" : "bg-card/90 text-foreground"
            }`}
          >
            {s.city}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
