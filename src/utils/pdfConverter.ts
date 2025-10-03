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
  let image;
  
  if (fileExtension === "png") {
    image = await pdfDoc.embedPng(arrayBuffer);
  } else {
    image = await pdfDoc.embedJpg(arrayBuffer);
  }
  
  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
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
