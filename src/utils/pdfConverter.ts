import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const convertPDFToImage = async (file: File, format: "jpeg" | "png"): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  // Convert first page only for now
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });
  
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  
  if (!context) {
    throw new Error("Could not get canvas context");
  }
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  await page.render(renderContext as any).promise;
  
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const quality = format === "jpeg" ? 0.95 : undefined;
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create blob"));
      }
    }, mimeType, quality);
  });
};

export const convertImageToPDF = async (file: File): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  const arrayBuffer = await file.arrayBuffer();

  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  const image =
    fileExtension === "png"
      ? await pdfDoc.embedPng(arrayBuffer)
      : await pdfDoc.embedJpg(arrayBuffer);

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
};

/** Combine multiple images (JPEG/PNG) into a single multi-page PDF. */
export const convertImagesToSinglePDF = async (files: File[]): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const ext = file.name.split(".").pop()?.toLowerCase();
    const image =
      ext === "png"
        ? await pdfDoc.embedPng(arrayBuffer)
        : await pdfDoc.embedJpg(arrayBuffer);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
};

/** Convert every PDF page to a JPEG/PNG blob. Reports progress per page. */
export const convertPDFToImages = async (
  file: File,
  format: "jpeg" | "png",
  onPageProgress?: (done: number, total: number) => void,
): Promise<Blob[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const quality = format === "jpeg" ? 0.95 : undefined;
  const results: Blob[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get canvas context");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport } as any).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
        mimeType,
        quality,
      );
    });
    results.push(blob);
    onPageProgress?.(i, pdf.numPages);
  }
  return results;
};

export const convertFile = async (file: File, targetFormat: string): Promise<Blob> => {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  if (fileExtension === "pdf" && (targetFormat === "jpeg" || targetFormat === "png")) {
    return convertPDFToImage(file, targetFormat as "jpeg" | "png");
  } else if ((fileExtension === "jpeg" || fileExtension === "jpg" || fileExtension === "png") && targetFormat === "pdf") {
    return convertImageToPDF(file);
  }

  throw new Error("Unsupported conversion");
};

