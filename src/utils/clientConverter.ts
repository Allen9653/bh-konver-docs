/**
 * BH KONVER - Client-Side Conversion Engine
 * 
 * Handles conversions directly in the browser using:
 * - Canvas API for image format conversions
 * - pdf-lib for PDF creation, merge, rotate, watermark
 * - pdfjs-dist for PDF rendering to image (local worker)
 * - @ffmpeg/ffmpeg (WASM) for video/audio conversions (local core)
 * - docx library for DOCX generation
 */

import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
// Local worker – bundled by Vite, no CDN
import pdfjsWorkerURL from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL;

export type ConversionProgress = {
  stage: string;
  percent: number;
};

type ProgressCallback = (progress: ConversionProgress) => void;

// ─── Custom error for fallback signaling ───
export class ClientConversionUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientConversionUnsupportedError";
  }
}

// ─── Which conversions can run client-side ───
const CLIENT_SIDE_MAP: Record<string, string[]> = {
  // Image conversions via Canvas
  png: ["jpg", "jpeg", "webp", "pdf"],
  jpg: ["png", "webp", "pdf"],
  jpeg: ["png", "webp", "pdf"],
  webp: ["png", "jpg"],
  jfif: ["png", "jpg"],
  // PDF to image via pdfjs
  pdf: ["jpg", "jpeg", "png", "txt"],
  // Video/GIF via ffmpeg WASM (only if SharedArrayBuffer available)
  ...(typeof SharedArrayBuffer !== "undefined"
    ? {
        mp4: ["gif"], webm: ["gif"], mov: ["gif"], avi: ["gif"],
        gif: ["mp4", "webm"],
      }
    : {}),
};

export const canConvertClientSide = (inputExt: string, outputFormat: string): boolean => {
  const formats = CLIENT_SIDE_MAP[inputExt?.toLowerCase()];
  return formats?.includes(outputFormat?.toLowerCase()) ?? false;
};

// ─── Strict MIME mapping ───
const STRICT_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  txt: "text/plain",
};

// ─── Main entry point ───
export const convertClientSide = async (
  file: File,
  targetFormat: string,
  onProgress?: ProgressCallback
): Promise<Blob> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const target = targetFormat.toLowerCase();

  onProgress?.({ stage: "Priprema fajla...", percent: 10 });

  // Image → Image (Canvas)
  if (isImageExt(ext) && isImageExt(target)) {
    return convertImageToImage(file, target, onProgress);
  }

  // Image → PDF (pdf-lib)
  if (isImageExt(ext) && target === "pdf") {
    return convertImageToPDF(file, onProgress);
  }

  // PDF → Image (pdfjs)
  if (ext === "pdf" && isImageExt(target)) {
    return convertPDFToImage(file, target as "jpg" | "jpeg" | "png", onProgress);
  }

  // PDF → TXT (pdfjs text extraction with progress)
  if (ext === "pdf" && target === "txt") {
    const text = await extractPDFText(file, onProgress);
    return new Blob([text], { type: "text/plain" });
  }

  // Video → GIF (ffmpeg WASM)
  if (isVideoExt(ext) && target === "gif") {
    return convertVideoToGif(file, onProgress);
  }

  throw new Error(`Client-side konverzija ${ext} → ${target} nije podržana`);
};

// ─── Helpers ───
const isImageExt = (ext: string) => ["png", "jpg", "jpeg", "webp", "jfif"].includes(ext);
const isVideoExt = (ext: string) => ["mp4", "webm", "mov", "avi"].includes(ext);

// ─── Image → Image via Canvas (strict MIME) ───
async function convertImageToImage(
  file: File,
  target: string,
  onProgress?: ProgressCallback
): Promise<Blob> {
  onProgress?.({ stage: "Učitavanje slike...", percent: 20 });

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);

  onProgress?.({ stage: "Konvertovanje formata...", percent: 60 });

  const mime = STRICT_MIME[target] || "image/png";
  const quality = target === "png" ? undefined : 0.92;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        onProgress?.({ stage: "Završeno!", percent: 100 });
        if (!blob) return reject(new Error("Canvas blob kreiranje neuspješno"));
        // Force correct MIME type via re-wrapping
        const strictBlob = new Blob([blob], { type: mime });
        resolve(strictBlob);
      },
      mime,
      quality
    );
  });
}

// ─── Image → PDF via pdf-lib ───
async function convertImageToPDF(
  file: File,
  onProgress?: ProgressCallback
): Promise<Blob> {
  onProgress?.({ stage: "Kreiranje PDF-a...", percent: 30 });

  const pdfDoc = await PDFDocument.create();
  const arrayBuffer = await file.arrayBuffer();
  const ext = file.name.split(".").pop()?.toLowerCase();

  // For webp/jfif, convert to PNG first via canvas
  let imageBytes: ArrayBuffer;
  let isPng = false;

  if (ext === "webp" || ext === "jfif") {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    const pngBlob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/png")
    );
    imageBytes = await pngBlob.arrayBuffer();
    isPng = true;
  } else {
    imageBytes = arrayBuffer;
    isPng = ext === "png";
  }

  onProgress?.({ stage: "Ugrađivanje slike...", percent: 60 });

  const image = isPng
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

  onProgress?.({ stage: "Spremanje PDF-a...", percent: 90 });
  const pdfBytes = await pdfDoc.save();
  onProgress?.({ stage: "Završeno!", percent: 100 });

  return new Blob([new Uint8Array(pdfBytes) as BlobPart], { type: "application/pdf" });
}

// ─── PDF → Image via pdfjs ───
async function convertPDFToImage(
  file: File,
  format: "jpg" | "jpeg" | "png",
  onProgress?: ProgressCallback
): Promise<Blob> {
  onProgress?.({ stage: "Učitavanje PDF-a...", percent: 20 });

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  onProgress?.({ stage: "Renderovanje stranice...", percent: 50 });

  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;

  await page.render({ canvasContext: ctx, viewport } as any).promise;

  onProgress?.({ stage: "Kreiranje slike...", percent: 80 });

  const mime = format === "png" ? "image/png" : "image/jpeg";
  const quality = format === "png" ? undefined : 0.95;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        onProgress?.({ stage: "Završeno!", percent: 100 });
        if (!blob) return reject(new Error("Greška pri kreiranju slike"));
        // Enforce strict MIME
        resolve(new Blob([blob], { type: mime }));
      },
      mime,
      quality
    );
  });
}

// ─── Video → GIF via @ffmpeg/ffmpeg WASM (locally bundled) ───
async function convertVideoToGif(
  file: File,
  onProgress?: ProgressCallback
): Promise<Blob> {
  // Guard: SharedArrayBuffer is required for FFmpeg WASM
  if (typeof SharedArrayBuffer === "undefined") {
    throw new ClientConversionUnsupportedError(
      "SharedArrayBuffer nije dostupan u ovom browseru. Video konverzija će biti obavljena na serveru."
    );
  }

  onProgress?.({ stage: "Učitavanje video procesora (WASM)...", percent: 10 });

  let FFmpeg: any;
  let toBlobURL: any;
  try {
    ({ FFmpeg } = await import("@ffmpeg/ffmpeg"));
    ({ toBlobURL } = await import("@ffmpeg/util"));
  } catch (e) {
    throw new ClientConversionUnsupportedError(
      "FFmpeg WASM biblioteka se ne može učitati. Prelazim na serversku konverziju."
    );
  }

  const ffmpeg = new FFmpeg();

  ffmpeg.on("progress", ({ progress }) => {
    const pct = Math.min(Math.round(progress * 80) + 15, 95);
    onProgress?.({ stage: "Konvertovanje u GIF...", percent: pct });
  });

  // Load ffmpeg core – use toBlobURL to fetch from CDN (avoids CORP/bundling issues)
  const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });
  } catch (e) {
    throw new ClientConversionUnsupportedError(
      "FFmpeg WASM engine se nije mogao inicijalizirati. Prelazim na serversku konverziju."
    );
  }

  onProgress?.({ stage: "Priprema videa...", percent: 15 });

  const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
  const { fetchFile } = await import("@ffmpeg/util");
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  onProgress?.({ stage: "Konvertovanje u GIF...", percent: 20 });

  // Convert with reasonable quality: 10fps, 480px width, max 10 seconds
  await ffmpeg.exec([
    "-i", inputName,
    "-t", "10",
    "-vf", "fps=10,scale=480:-1:flags=lanczos",
    "-f", "gif",
    "output.gif",
  ]);

  const data = await ffmpeg.readFile("output.gif");
  onProgress?.({ stage: "Završeno!", percent: 100 });

  return new Blob([data as BlobPart], { type: "image/gif" });
}

// ─── PDF Tools (client-side) ───

export const rotatePDFClientSide = async (
  file: File,
  angle: number,
  onProgress?: ProgressCallback
): Promise<Blob> => {
  onProgress?.({ stage: "Rotiranje PDF-a...", percent: 30 });
  const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
  const pages = pdfDoc.getPages();
  pages.forEach((page) => page.setRotation(degrees(angle)));
  onProgress?.({ stage: "Spremanje...", percent: 80 });
  const bytes = await pdfDoc.save();
  onProgress?.({ stage: "Završeno!", percent: 100 });
  return new Blob([new Uint8Array(bytes) as BlobPart], { type: "application/pdf" });
};

export const mergePDFsClientSide = async (
  files: File[],
  onProgress?: ProgressCallback
): Promise<Blob> => {
  onProgress?.({ stage: "Spajanje PDF-ova...", percent: 20 });
  const mergedDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const pdfBytes = await files[i].arrayBuffer();
    const srcDoc = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach((page) => mergedDoc.addPage(page));
    onProgress?.({ stage: `Spajanje ${i + 1}/${files.length}...`, percent: 20 + (70 * (i + 1)) / files.length });
  }

  const bytes = await mergedDoc.save();
  onProgress?.({ stage: "Završeno!", percent: 100 });
  return new Blob([new Uint8Array(bytes) as BlobPart], { type: "application/pdf" });
};

export const addWatermarkClientSide = async (
  file: File,
  watermarkText: string,
  onProgress?: ProgressCallback
): Promise<Blob> => {
  onProgress?.({ stage: "Dodavanje vodenog žiga...", percent: 30 });
  const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) * 0.08;
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.75, 0.75, 0.75),
      rotate: degrees(45),
      opacity: 0.3,
    });
  });

  onProgress?.({ stage: "Spremanje...", percent: 80 });
  const bytes = await pdfDoc.save();
  onProgress?.({ stage: "Završeno!", percent: 100 });
  return new Blob([new Uint8Array(bytes) as BlobPart], { type: "application/pdf" });
};

export const extractPDFText = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<string> => {
  onProgress?.({ stage: "Čitanje PDF teksta...", percent: 10 });
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const pageTexts: string[] = new Array(totalPages);

  // Process pages in batches of 4 for speed
  const BATCH_SIZE = 4;
  for (let start = 0; start < totalPages; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, totalPages);
    const promises = [];
    for (let i = start; i < end; i++) {
      promises.push(
        pdf.getPage(i + 1).then(async (page) => {
          const content = await page.getTextContent();
          pageTexts[i] = content.items.map((item: any) => item.str).join(" ");
        })
      );
    }
    await Promise.all(promises);
    const pct = Math.round(10 + (85 * end) / totalPages);
    onProgress?.({ stage: `Stranica ${end}/${totalPages}...`, percent: pct });
  }

  onProgress?.({ stage: "Završeno!", percent: 100 });
  return pageTexts.join("\n\n");
};
