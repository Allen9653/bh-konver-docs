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

const slides = [
  { src: sarajevo.url, city: "Sarajevo" },
  { src: banjaLuka.url, city: "Banja Luka" },
  { src: tuzla.url, city: "Tuzla" },
  { src: zenica.url, city: "Zenica" },
  { src: bihac, city: "Bihać" },
  { src: bijeljina.url, city: "Bijeljina" },
  { src: brcko.url, city: "Brčko" },
  { src: trebinje.url, city: "Trebinje" },
  { src: olovo.url, city: "Olovo" },
];

export const HeroCarousel = ({ className = "" }: { className?: string }) => {
  return (
    <Swiper
      modules={[Autoplay, EffectFade, Pagination]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop
      pagination={{ clickable: true }}
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
          <div className="absolute bottom-4 right-4 z-10 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
            {s.city}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
