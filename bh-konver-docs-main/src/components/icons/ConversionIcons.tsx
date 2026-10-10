/**
 * Custom BH KONVER SVG icons.
 * All icons inherit `currentColor` so they follow the semantic design tokens.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const UploadDocIcon = ({ size = 40, ...props }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" focusable="false" {...props}>
    <path d="M10 30v6a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4v-6" />
    <path d="M24 30V8" />
    <path d="m15 17 9-9 9 9" />
    <path opacity="0.45" d="M18 34h12" />
  </svg>
);

export const DownloadDocIcon = ({ size = 40, ...props }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" focusable="false" {...props}>
    <path d="M10 30v6a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4v-6" />
    <path d="M24 8v22" />
    <path d="m15 21 9 9 9-9" />
    <path opacity="0.45" d="M18 34h12" />
  </svg>
);

export const PreviewDocIcon = ({ size = 40, ...props }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" focusable="false" {...props}>
    <path d="M28 6H14a4 4 0 0 0-4 4v28a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V16z" />
    <path d="M28 6v10h10" opacity="0.6" />
    <circle cx="23" cy="29" r="5" />
    <path d="m27 33 4 4" />
  </svg>
);

export const ConvertArrowsIcon = ({ size = 40, ...props }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" focusable="false" {...props}>
    <path d="M8 18h28l-7-7" />
    <path d="M40 30H12l7 7" />
  </svg>
);

export const ShieldLocalIcon = ({ size = 40, ...props }: IconProps) => (
  <svg {...base(size)} aria-hidden="true" focusable="false" {...props}>
    <path d="M24 5 8 11v12c0 10 7 16.5 16 20 9-3.5 16-10 16-20V11z" />
    <path d="m17 24 5 5 9-10" />
  </svg>
);
