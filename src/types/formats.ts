// Definicija svih podržanih formata i njihovih konverzija

export type InputFormat = 
  | "pdf" 
  | "docx" 
  | "doc" 
  | "pptx" 
  | "xlsx" 
  | "xls" 
  | "jpeg" 
  | "jpg" 
  | "png"
  | "txt"
  | "html";

export type OutputFormat = 
  | "pdf"
  | "docx"
  | "txt"
  | "jpeg"
  | "jpg"
  | "png"
  | "html"
  | "xlsx"
  | "csv"
  | "epub";

export interface FormatConversion {
  from: InputFormat;
  to: OutputFormat[];
  requiresBackend: boolean;
}

// Kompletna mapa konverzija - lako proširiva
export const FORMAT_CONVERSIONS: Record<InputFormat, OutputFormat[]> = {
  // PDF konverzije
  pdf: ["jpeg", "png", "txt", "docx", "html"],
  
  // Word dokumenti
  docx: ["pdf", "txt", "html", "jpeg", "png", "epub"],
  doc: ["pdf", "txt", "html", "jpeg", "png", "epub"],
  
  // PowerPoint
  pptx: ["pdf", "jpeg", "png", "html"],
  
  // Excel
  xlsx: ["pdf", "csv", "html"],
  xls: ["pdf", "csv", "html"],
  
  // Slike
  jpeg: ["pdf", "png"],
  jpg: ["pdf", "png"],
  png: ["pdf", "jpeg"],
  
  // Tekst formati
  txt: ["pdf", "docx", "html"],
  html: ["pdf", "docx", "txt"],
};

// Koje konverzije zahtijevaju backend (Cloudmersive)
export const BACKEND_REQUIRED_INPUTS: InputFormat[] = [
  "docx", "doc", "pptx", "xlsx", "xls"
];

// Formati koji se mogu procesirati lokalno u browser-u
export const LOCAL_CONVERSIONS: Record<string, OutputFormat[]> = {
  pdf: ["jpeg", "png"],
  jpeg: ["pdf"],
  jpg: ["pdf"],
  png: ["pdf"],
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
  txt: "Tekst (TXT)",
  jpeg: "JPEG slika",
  jpg: "JPG slika",
  png: "PNG slika",
  html: "HTML",
  xlsx: "Excel (XLSX)",
  csv: "CSV",
  epub: "E-knjiga (EPUB)",
};
