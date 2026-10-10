/**
 * BH KONVER - Magic bytes format detection
 * Reads first bytes of a file to identify true format regardless of extension.
 */

export type DetectedFormat = {
  ext: string;          // canonical extension (e.g. "jpg", "pdf")
  mime: string;         // canonical mime type
  label: string;        // user-friendly label (e.g. "JPEG image")
  confidence: "high" | "medium" | "low";
};

const HEAD_BYTES = 64;

const readHead = async (file: File): Promise<Uint8Array> => {
  const slice = file.slice(0, HEAD_BYTES);
  const buf = await slice.arrayBuffer();
  return new Uint8Array(buf);
};

const startsWith = (head: Uint8Array, sig: number[], offset = 0): boolean => {
  if (head.length < offset + sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (head[offset + i] !== sig[i]) return false;
  }
  return true;
};

const asciiAt = (head: Uint8Array, offset: number, length: number): string => {
  let s = "";
  for (let i = 0; i < length && offset + i < head.length; i++) {
    s += String.fromCharCode(head[offset + i]);
  }
  return s;
};

/**
 * Detect a file format from its content.
 * Falls back to extension-based detection when signature is unrecognised.
 */
export const detectFormat = async (file: File): Promise<DetectedFormat> => {
  const head = await readHead(file);
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  // PDF: %PDF
  if (startsWith(head, [0x25, 0x50, 0x44, 0x46])) {
    return { ext: "pdf", mime: "application/pdf", label: "PDF document", confidence: "high" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { ext: "png", mime: "image/png", label: "PNG image", confidence: "high" };
  }

  // JPEG: FF D8 FF
  if (startsWith(head, [0xff, 0xd8, 0xff])) {
    return { ext: "jpg", mime: "image/jpeg", label: "JPEG image", confidence: "high" };
  }

  // GIF: GIF87a or GIF89a
  if (asciiAt(head, 0, 6) === "GIF87a" || asciiAt(head, 0, 6) === "GIF89a") {
    return { ext: "gif", mime: "image/gif", label: "GIF image", confidence: "high" };
  }

  // WEBP: RIFF....WEBP
  if (asciiAt(head, 0, 4) === "RIFF" && asciiAt(head, 8, 4) === "WEBP") {
    return { ext: "webp", mime: "image/webp", label: "WebP image", confidence: "high" };
  }

  // WAV: RIFF....WAVE
  if (asciiAt(head, 0, 4) === "RIFF" && asciiAt(head, 8, 4) === "WAVE") {
    return { ext: "wav", mime: "audio/wav", label: "WAV audio", confidence: "high" };
  }

  // AVI: RIFF....AVI
  if (asciiAt(head, 0, 4) === "RIFF" && asciiAt(head, 8, 3) === "AVI") {
    return { ext: "avi", mime: "video/x-msvideo", label: "AVI video", confidence: "high" };
  }

  // MP3: ID3 tag or MPEG frame sync (FF Fx)
  if (asciiAt(head, 0, 3) === "ID3") {
    return { ext: "mp3", mime: "audio/mpeg", label: "MP3 audio", confidence: "high" };
  }
  if (head[0] === 0xff && (head[1] & 0xe0) === 0xe0) {
    return { ext: "mp3", mime: "audio/mpeg", label: "MP3 audio", confidence: "medium" };
  }

  // FLAC: fLaC
  if (asciiAt(head, 0, 4) === "fLaC") {
    return { ext: "flac", mime: "audio/flac", label: "FLAC audio", confidence: "high" };
  }

  // OGG: OggS
  if (asciiAt(head, 0, 4) === "OggS") {
    return { ext: "ogg", mime: "audio/ogg", label: "OGG audio", confidence: "high" };
  }

  // MP4 / MOV / M4A / HEIC: ....ftyp{brand}
  if (asciiAt(head, 4, 4) === "ftyp") {
    const brand = asciiAt(head, 8, 4).trim().toLowerCase();
    if (brand === "qt" || brand.startsWith("qt")) {
      return { ext: "mov", mime: "video/quicktime", label: "QuickTime video", confidence: "high" };
    }
    if (brand === "heic" || brand === "heix" || brand === "hevc" || brand === "heim" || brand === "heis" || brand === "mif1") {
      return { ext: "heic", mime: "image/heic", label: "HEIC image", confidence: "high" };
    }
    if (brand === "m4a " || brand === "m4a") {
      return { ext: "m4a", mime: "audio/mp4", label: "M4A audio", confidence: "high" };
    }
    // Generic ISO base media → MP4 video
    return { ext: "mp4", mime: "video/mp4", label: "MP4 video", confidence: "high" };
  }

  // EBML (MKV / WebM): 1A 45 DF A3
  if (startsWith(head, [0x1a, 0x45, 0xdf, 0xa3])) {
    if (ext === "webm") {
      return { ext: "webm", mime: "video/webm", label: "WebM video", confidence: "high" };
    }
    return { ext: "mkv", mime: "video/x-matroska", label: "Matroska video", confidence: "high" };
  }

  // FLV: 'FLV'
  if (asciiAt(head, 0, 3) === "FLV") {
    return { ext: "flv", mime: "video/x-flv", label: "FLV video", confidence: "high" };
  }

  // ZIP-based: Office docs (DOCX/XLSX/PPTX), EPUB → "PK\x03\x04"
  if (startsWith(head, [0x50, 0x4b, 0x03, 0x04]) || startsWith(head, [0x50, 0x4b, 0x05, 0x06])) {
    // Discriminate by extension since the header alone isn't enough
    if (ext === "docx") return { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Word document", confidence: "high" };
    if (ext === "xlsx") return { ext: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", label: "Excel spreadsheet", confidence: "high" };
    if (ext === "pptx") return { ext: "pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", label: "PowerPoint presentation", confidence: "high" };
    if (ext === "epub") return { ext: "epub", mime: "application/epub+zip", label: "EPUB book", confidence: "high" };
    return { ext: "zip", mime: "application/zip", label: "ZIP archive", confidence: "medium" };
  }

  // SVG: text-based, look for "<svg" or "<?xml" with svg later
  const asText = asciiAt(head, 0, Math.min(64, head.length)).toLowerCase();
  if (asText.includes("<svg") || (asText.includes("<?xml") && file.name.toLowerCase().endsWith(".svg"))) {
    return { ext: "svg", mime: "image/svg+xml", label: "SVG image", confidence: "high" };
  }

  // Plain text fallback by extension (txt has no signature)
  if (ext === "txt") {
    return { ext: "txt", mime: "text/plain", label: "Text file", confidence: "medium" };
  }

  // Unknown — fall back to extension
  return {
    ext: ext || "unknown",
    mime: file.type || "application/octet-stream",
    label: ext ? `.${ext.toUpperCase()} file` : "Unknown file",
    confidence: "low",
  };
};

/**
 * Returns true when detected ext doesn't match the file's extension.
 * Treats jpg/jpeg as equivalent.
 */
export const hasExtensionMismatch = (file: File, detected: DetectedFormat): boolean => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ext) return false;
  if (detected.confidence === "low") return false;
  const norm = (e: string) => (e === "jpeg" ? "jpg" : e);
  return norm(ext) !== norm(detected.ext);
};
