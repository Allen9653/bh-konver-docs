import { useTranslation } from "react-i18next";

/**
 * Animated PDF <-> JPEG conversion illustration used in the hero section.
 * Pure SVG, no external assets, uses semantic design tokens only.
 */
export const ConversionIllustration = ({ className = "" }: { className?: string }) => {
  const { t } = useTranslation();

  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      role="img"
      aria-label={t("visual.heroIllustrationAlt")}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bhDocGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--card))" />
          <stop offset="100%" stopColor="hsl(var(--muted))" />
        </linearGradient>
        <linearGradient id="bhImgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* PDF document */}
      <g>
        <rect x="18" y="24" width="96" height="128" rx="10" fill="url(#bhDocGrad)" stroke="hsl(var(--border))" strokeWidth="2" />
        <path d="M84 24v22h30" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
        <rect x="34" y="62" width="60" height="7" rx="3.5" fill="hsl(var(--muted-foreground))" opacity="0.35" />
        <rect x="34" y="78" width="46" height="7" rx="3.5" fill="hsl(var(--muted-foreground))" opacity="0.28" />
        <rect x="34" y="94" width="64" height="7" rx="3.5" fill="hsl(var(--muted-foreground))" opacity="0.22" />
        <rect x="34" y="110" width="38" height="7" rx="3.5" fill="hsl(var(--muted-foreground))" opacity="0.18" />
        <rect x="18" y="126" width="52" height="26" rx="8" fill="hsl(var(--primary))" />
        <text x="44" y="144" textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--primary-foreground))" fontFamily="Poppins, Inter, sans-serif">
          PDF
        </text>
      </g>

      {/* Flowing arrows */}
      <g className="animate-arrow-flow" stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M132 76h48l-10-10" />
        <path d="M188 104h-48l10 10" />
      </g>

      {/* JPEG image */}
      <g>
        <rect x="206" y="24" width="96" height="128" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
        <rect x="216" y="34" width="76" height="72" rx="6" fill="url(#bhImgGrad)" />
        <circle cx="238" cy="56" r="8" fill="hsl(var(--card))" opacity="0.85" />
        <path d="M218 96l20-24 16 18 10-10 26 26H218z" fill="hsl(var(--card))" opacity="0.55" />
        <rect x="206" y="126" width="60" height="26" rx="8" fill="hsl(var(--accent))" />
        <text x="236" y="144" textAnchor="middle" fontSize="13" fontWeight="700" fill="hsl(var(--accent-foreground))" fontFamily="Poppins, Inter, sans-serif">
          JPEG
        </text>
      </g>
    </svg>
  );
};
