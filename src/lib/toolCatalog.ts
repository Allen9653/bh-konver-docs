import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Code2,
  Combine,
  FileImage,
  FileSpreadsheet,
  FileText,
  Film,
  Image,
  Minimize2,
  Presentation,
  Scissors,
  ScrollText,
  Stamp,
  Type,
} from "lucide-react";

export type ToolAccess = "free" | "quota" | "pro" | "mixed";
export type ToolCategory = "convert" | "pdf" | "special";

export type ToolCatalogItem = {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  href: string;
  access: ToolAccess;
  category: ToolCategory;
  icon: LucideIcon;
  tone: "primary" | "accent" | "gold" | "muted";
  beta?: boolean;
};

export const TOOL_CATALOG: ToolCatalogItem[] = [
  { slug: "slike-i-pdf", titleKey: "homeTools.items.imagePdf.title", descriptionKey: "homeTools.items.imagePdf.description", href: "/slika-pdf", access: "quota", category: "convert", icon: Image, tone: "accent" },
  { slug: "pdf-u-word", titleKey: "alati.tools.pdfToWord.title", descriptionKey: "alati.tools.pdfToWord.description", href: "/alati/pdf-u-word", access: "quota", category: "convert", icon: FileText, tone: "primary" },
  { slug: "word-u-pdf", titleKey: "alati.tools.wordToPdf.title", descriptionKey: "alati.tools.wordToPdf.description", href: "/alati/word-u-pdf", access: "quota", category: "convert", icon: FileText, tone: "primary" },
  { slug: "excel-u-pdf", titleKey: "alati.tools.excelToPdf.title", descriptionKey: "alati.tools.excelToPdf.description", href: "/alati/excel-u-pdf", access: "quota", category: "convert", icon: FileSpreadsheet, tone: "accent" },
  { slug: "pptx-u-pdf", titleKey: "alati.tools.pptxToPdf.title", descriptionKey: "alati.tools.pptxToPdf.description", href: "/alati/pptx-u-pdf", access: "quota", category: "convert", icon: Presentation, tone: "gold", beta: true },
  { slug: "audio", titleKey: "modules.audio.name", descriptionKey: "modules.audio.description", href: "/modul/audio", access: "pro", category: "convert", icon: AudioLines, tone: "gold" },
  { slug: "video", titleKey: "modules.video.name", descriptionKey: "modules.video.description", href: "/modul/video", access: "pro", category: "convert", icon: Film, tone: "gold" },
  { slug: "spoji-pdf", titleKey: "alati.tools.mergePdf.title", descriptionKey: "alati.tools.mergePdf.description", href: "/alati/spoji-pdf", access: "quota", category: "pdf", icon: Combine, tone: "primary" },
  { slug: "podijeli-pdf", titleKey: "alati.tools.splitPdf.title", descriptionKey: "alati.tools.splitPdf.description", href: "/alati/podijeli-pdf", access: "quota", category: "pdf", icon: Scissors, tone: "accent" },
  { slug: "kompresuj-pdf", titleKey: "homeTools.items.compressPdf.title", descriptionKey: "homeTools.items.compressPdf.description", href: "/modul/kompresuj-pdf", access: "pro", category: "pdf", icon: Minimize2, tone: "gold" },
  { slug: "vodeni-zig", titleKey: "homeTools.items.watermark.title", descriptionKey: "homeTools.items.watermark.description", href: "/modul/vodeni-zig", access: "pro", category: "pdf", icon: Stamp, tone: "gold" },
  { slug: "html-u-word", titleKey: "alati.html.htmlToDocx.title", descriptionKey: "alati.html.htmlToDocx.description", href: "/alati/html-u-word", access: "quota", category: "special", icon: Code2, tone: "primary" },
  { slug: "html-u-pdf", titleKey: "alati.html.htmlToPdf.title", descriptionKey: "alati.html.htmlToPdf.description", href: "/alati/html-u-pdf", access: "pro", category: "special", icon: FileImage, tone: "gold" },
  { slug: "pismo", titleKey: "alati.tools.script.title", descriptionKey: "alati.tools.script.description", href: "/alati/pismo", access: "free", category: "special", icon: Type, tone: "accent" },
  { slug: "pravni-dokumenti", titleKey: "homeTools.items.legal.title", descriptionKey: "homeTools.items.legal.description", href: "/pravni-dokumenti", access: "mixed", category: "special", icon: ScrollText, tone: "primary" },
];

export const findToolBySlug = (slug?: string) => TOOL_CATALOG.find((tool) => tool.slug === slug);