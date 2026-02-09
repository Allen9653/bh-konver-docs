// BH Konver - Kompletan sistem konverzije

export type ConversionModule = "video" | "audio" | "image" | "document" | "gif" | "unit" | "pdf-tools";

export type InputFormat = 
  // Video formats
  | "mp4" | "mov" | "avi" | "webm" | "mkv" | "flv"
  // Audio formats
  | "mp3" | "ogg" | "wav" | "m4a" | "aac" | "flac"
  // Image formats
  | "webp" | "png" | "jpg" | "jpeg" | "heic" | "jfif" | "svg"
  // Document formats
  | "pdf" | "docx" | "doc" | "epub" | "txt" | "pptx" | "ppt" | "xlsx" | "xls"
  // GIF formats
  | "gif" | "apng";

export type OutputFormat = 
  // Video formats
  | "mp4" | "mov" | "avi" | "webm"
  // Audio formats
  | "mp3" | "ogg" | "wav"
  // Image formats
  | "webp" | "png" | "jpg" | "jpeg" | "svg"
  // Document formats
  | "pdf" | "docx" | "epub" | "txt"
  // GIF formats
  | "gif" | "apng";

export interface FormatConversion {
  from: InputFormat;
  to: OutputFormat[];
  requiresBackend: boolean;
  module: ConversionModule;
}

// Kompletne konverzije za sve module
export const FORMAT_CONVERSIONS: Record<InputFormat, OutputFormat[]> = {
  // VIDEO & AUDIO
  mp4: ["mp3", "gif", "webm"],
  mov: ["mp4", "gif", "mp3"],
  avi: ["mp4", "gif", "mp3"],
  webm: ["mp4", "gif", "mp3"],
  mkv: ["mp4", "mp3"],
  flv: ["mp4", "mp3"],
  
  // AUDIO
  mp3: ["ogg", "wav"],
  ogg: ["mp3", "wav"],
  wav: ["mp3", "ogg"],
  m4a: ["mp3"],
  aac: ["mp3"],
  flac: ["mp3"],
  
  // IMAGE
  webp: ["png", "jpg"],
  jfif: ["png", "jpg"],
  png: ["pdf", "webp", "jpg"],
  jpg: ["pdf", "png", "webp"],
  jpeg: ["pdf", "png", "webp"],
  heic: ["jpg", "png", "pdf"],
  svg: ["png", "jpg"],
  
  // PDF & DOCUMENTS
  pdf: ["docx", "jpg", "epub", "txt"],
  docx: ["pdf", "txt"],
  doc: ["pdf", "docx"],
  epub: ["pdf", "txt"],
  txt: ["pdf", "docx"],
  pptx: ["pdf"],
  ppt: ["pdf"],
  xlsx: ["pdf"],
  xls: ["pdf"],
  
  // GIF
  gif: ["mp4", "apng", "webm"],
  apng: ["gif", "mp4"],
};

// Koje konverzije zahtijevaju backend (sve osim unit converter)
export const BACKEND_REQUIRED_INPUTS: InputFormat[] = [
  "mp4", "mov", "avi", "webm", "mkv", "flv",
  "mp3", "ogg", "wav", "m4a", "aac", "flac",
  "webp", "jfif", "png", "jpg", "jpeg", "heic", "svg",
  "pdf", "docx", "doc", "epub", "txt", "pptx", "ppt", "xlsx", "xls",
  "gif", "apng"
];

// Modul mapiranje
export const FORMAT_TO_MODULE: Record<InputFormat, ConversionModule> = {
  // Video
  mp4: "video",
  mov: "video",
  avi: "video",
  webm: "video",
  mkv: "video",
  flv: "video",
  // Audio
  mp3: "audio",
  ogg: "audio",
  wav: "audio",
  m4a: "audio",
  aac: "audio",
  flac: "audio",
  // Image
  webp: "image",
  jfif: "image",
  png: "image",
  jpg: "image",
  jpeg: "image",
  heic: "image",
  svg: "image",
  // Documents
  pdf: "document",
  docx: "document",
  doc: "document",
  epub: "document",
  txt: "document",
  pptx: "document",
  ppt: "document",
  xlsx: "document",
  xls: "document",
  // GIF
  gif: "gif",
  apng: "gif",
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
  // Video
  mp4: "MP4",
  mov: "MOV",
  avi: "AVI",
  webm: "WEBM",
  // Audio
  mp3: "MP3",
  ogg: "OGG",
  wav: "WAV",
  // Image
  webp: "WEBP",
  png: "PNG",
  jpg: "JPG",
  jpeg: "JPEG",
  svg: "SVG",
  // Documents
  pdf: "PDF",
  docx: "Word (DOCX)",
  epub: "EPUB",
  txt: "TXT",
  // GIF
  gif: "GIF",
  apng: "APNG",
};
