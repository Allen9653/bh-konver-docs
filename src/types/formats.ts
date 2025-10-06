// BH Konver MVP - Modularni formati

export type ConversionModule = "image" | "pdf" | "unit";

export type InputFormat = 
  | "pdf" 
  | "docx" 
  | "jpeg" 
  | "jpg" 
  | "png"
  | "webp"
  | "heic";

export type OutputFormat = 
  | "pdf"
  | "docx"
  | "jpeg"
  | "jpg"
  | "png"
  | "svg";

export interface FormatConversion {
  from: InputFormat;
  to: OutputFormat[];
  requiresBackend: boolean;
  module: ConversionModule;
}

// MVP - Tri osnovna modula
export const FORMAT_CONVERSIONS: Record<InputFormat, OutputFormat[]> = {
  // Image Converter Module
  webp: ["png"],
  heic: ["jpg"],
  png: ["svg", "pdf"],
  
  // PDF Converter Module
  pdf: ["docx", "jpg"],
  jpeg: ["pdf"],
  jpg: ["pdf"],
  
  // Word (dodatno)
  docx: ["pdf"],
};

// Koje konverzije zahtijevaju backend
export const BACKEND_REQUIRED_INPUTS: InputFormat[] = [
  "docx", "webp", "heic"
];

// Lokalne konverzije (browser-side)
export const LOCAL_CONVERSIONS: Record<string, OutputFormat[]> = {
  pdf: ["jpg"],
  jpeg: ["pdf"],
  jpg: ["pdf"],
  png: ["pdf"],
};

// Modul mapiranje
export const FORMAT_TO_MODULE: Record<InputFormat, ConversionModule> = {
  webp: "image",
  heic: "image",
  png: "image",
  jpeg: "image",
  jpg: "image",
  pdf: "pdf",
  docx: "pdf",
};

export const getAvailableFormats = (inputFormat: string | undefined): OutputFormat[] => {
  if (!inputFormat) return [];
  return FORMAT_CONVERSIONS[inputFormat as InputFormat] || [];
};

export const requiresBackend = (inputFormat: string | undefined): boolean => {
  if (!inputFormat) return false;
  return BACKEND_REQUIRED_INPUTS.includes(inputFormat as InputFormat);
};

export const formatDisplayName: Record<OutputFormat, string> = {
  pdf: "PDF",
  docx: "Word (DOCX)",
  jpeg: "JPEG",
  jpg: "JPG",
  png: "PNG",
  svg: "SVG",
};
