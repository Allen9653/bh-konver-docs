/**
 * BH KONVER — Free Launch Tools (100% client-side)
 * 
 * Pure-browser conversions, no auth, no server, no API costs.
 * Used by /alati page.
 */

import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerURL from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import JSZip from "jszip";
export { cyrillicToLatin, latinToCyrillic } from "@/utils/scriptText";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL;

export type ToolProgress = (stage: string, percent: number) => void;

// ────────────────────────────────────────────────────────────
// 1) Images (JPG/PNG) → PDF
// ────────────────────────────────────────────────────────────
export async function imagesToPdf(files: File[], onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Priprema slika...", 5);
  const pdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase();
    const img = ext === "png"
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    onProgress?.(`Dodajem sliku ${i + 1}/${files.length}`, 10 + Math.round((i / files.length) * 80));
  }

  onProgress?.("Generišem PDF...", 95);
  const out = await pdf.save();
  onProgress?.("Završeno!", 100);
  return new Blob([out as BlobPart], { type: "application/pdf" });
}

// ────────────────────────────────────────────────────────────
// 2) Word (.docx) → PDF  (via mammoth → HTML → jsPDF.html)
// ────────────────────────────────────────────────────────────
export async function wordToPdf(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje Word dokumenta...", 10);
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.("Ekstrakcija sadržaja...", 30);
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

  onProgress?.("Rendering u PDF...", 60);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });

  // Sanitize HTML from untrusted Word document to prevent XSS
  const DOMPurify = (await import("dompurify")).default;
  const safeHtml = DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
  });

  const container = document.createElement("div");
  container.style.width = "595px"; // A4 width in pt
  container.style.padding = "40px";
  container.style.fontFamily = "Helvetica, Arial, sans-serif";
  container.style.fontSize = "12px";
  container.style.lineHeight = "1.5";
  container.style.color = "#000";
  container.innerHTML = safeHtml;
  document.body.appendChild(container);

  try {
    await pdf.html(container, {
      callback: () => {},
      autoPaging: "text",
      margin: [40, 40, 40, 40],
      width: 515,
      windowWidth: 595,
    });
  } finally {
    document.body.removeChild(container);
  }

  onProgress?.("Završeno!", 100);
  return pdf.output("blob");
}

// ────────────────────────────────────────────────────────────
// 3) PDF → Word (.docx) — visually faithful, fully private image-per-page mode
// ────────────────────────────────────────────────────────────
const PDF_RENDER_SCALE = 2;
const PAGE_MARGIN_POINTS = 9;

async function renderPdfPageAsPng(page: any): Promise<{ data: Uint8Array; pageWidth: number; pageHeight: number }> {
  const sourceViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport } as any).promise;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("PDF stranica se ne može prikazati.")), "image/png");
  });
  const data = new Uint8Array(await blob.arrayBuffer());
  canvas.width = 0;
  canvas.height = 0;
  return { data, pageWidth: sourceViewport.width, pageHeight: sourceViewport.height };
}

export async function pdfToWordVisual(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje PDF dokumenta...", 5);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const { AlignmentType, Document, ImageRun, Packer, Paragraph } = await import("docx");
  const sections = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Čuvanje izgleda stranice ${i}/${pdf.numPages}`, 10 + Math.round(((i - 1) / pdf.numPages) * 80));
    const page = await pdf.getPage(i);
    const rendered = await renderPdfPageAsPng(page);
    const contentWidth = Math.max(1, rendered.pageWidth - PAGE_MARGIN_POINTS * 2);
    const contentHeight = Math.max(1, rendered.pageHeight - PAGE_MARGIN_POINTS * 2);
    sections.push({
      properties: {
        page: {
          size: { width: Math.round(rendered.pageWidth * 20), height: Math.round(rendered.pageHeight * 20) },
          margin: {
            top: PAGE_MARGIN_POINTS * 20,
            right: PAGE_MARGIN_POINTS * 20,
            bottom: PAGE_MARGIN_POINTS * 20,
            left: PAGE_MARGIN_POINTS * 20,
          },
        },
      },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0, line: 1 },
        children: [new ImageRun({
          type: "png",
          data: rendered.data,
          transformation: { width: Math.round(contentWidth * 96 / 72), height: Math.round(contentHeight * 96 / 72) },
          altText: { title: `PDF page ${i}`, description: `Original PDF page ${i}`, name: `page-${i}` },
        })],
      })],
    });
  }

  onProgress?.("Generišem DOCX...", 95);
  const doc = new Document({ sections });
  const buf = await Packer.toBlob(doc);
  onProgress?.("Završeno!", 100);
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

// ────────────────────────────────────────────────────────────
// 4) Excel (.xlsx/.xls) → PDF  (SheetJS → HTML table → jsPDF)
// ────────────────────────────────────────────────────────────
export async function excelToPdf(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje Excel datoteke...", 10);
  const XLSX = await import("xlsx");
  const DOMPurify = (await import("dompurify")).default;
  const data = new Uint8Array(await file.arrayBuffer());
  const workbook = XLSX.read(data, { type: "array" });

  onProgress?.("Generišem PDF stranice...", 40);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });

  const sheetNames = workbook.SheetNames;
  for (let s = 0; s < sheetNames.length; s++) {
    const name = sheetNames[s];
    const sheet = workbook.Sheets[name];
    const rawHtml = XLSX.utils.sheet_to_html(sheet, { editable: false });
    // Sanitize HTML from untrusted Excel file to prevent XSS
    const safeHtml = DOMPurify.sanitize(rawHtml, { FORBID_TAGS: ["script", "style", "iframe", "object", "embed"], FORBID_ATTR: ["onerror", "onload", "onclick"] });

    const container = document.createElement("div");
    container.style.width = "800px";
    container.style.padding = "20px";
    container.style.fontFamily = "Helvetica, Arial, sans-serif";
    container.style.fontSize = "10px";
    container.style.color = "#000";
    // Safely set heading using textContent (escapes any HTML in sheet name)
    const heading = document.createElement("h3");
    heading.style.fontSize = "14px";
    heading.style.margin = "0 0 10px 0";
    heading.textContent = name;
    container.appendChild(heading);
    const htmlWrapper = document.createElement("div");
    htmlWrapper.innerHTML = safeHtml;
    container.appendChild(htmlWrapper);

    // Style tables
    container.querySelectorAll("table").forEach((t) => {
      (t as HTMLElement).style.borderCollapse = "collapse";
      (t as HTMLElement).style.width = "100%";
    });
    container.querySelectorAll("td, th").forEach((c) => {
      (c as HTMLElement).style.border = "1px solid #999";
      (c as HTMLElement).style.padding = "4px";
    });
    document.body.appendChild(container);

    try {
      if (s > 0) pdf.addPage("a4", "landscape");
      await pdf.html(container, {
        callback: () => {},
        autoPaging: "text",
        margin: [30, 30, 30, 30],
        width: 780,
        windowWidth: 800,
        x: 0,
        y: 0,
      });
    } finally {
      document.body.removeChild(container);
    }
    onProgress?.(`Sheet ${s + 1}/${sheetNames.length}`, 50 + Math.round((s / sheetNames.length) * 40));
  }

  onProgress?.("Završeno!", 100);
  return pdf.output("blob");
}

// ────────────────────────────────────────────────────────────
// 6) Merge PDF  (pdf-lib copyPages)
// ────────────────────────────────────────────────────────────
export async function mergePdfs(files: File[], onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje PDF datoteka...", 10);
  const merged = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const bytes = new Uint8Array(await files[i].arrayBuffer());
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
    onProgress?.(`Spajam ${i + 1}/${files.length}`, 15 + Math.round((i / files.length) * 75));
  }
  const out = await merged.save();
  onProgress?.("Završeno!", 100);
  return new Blob([out as BlobPart], { type: "application/pdf" });
}

// ────────────────────────────────────────────────────────────
// 7) Split PDF  (every page → separate PDF, packed in ZIP)
// ────────────────────────────────────────────────────────────
export async function splitPdf(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje PDF dokumenta...", 10);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = src.getPageCount();
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, "");

  for (let i = 0; i < total; i++) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(src, [i]);
    doc.addPage(page);
    const out = await doc.save();
    zip.file(`${baseName}_strana_${i + 1}.pdf`, out);
    onProgress?.(`Razdvajam stranicu ${i + 1}/${total}`, 15 + Math.round((i / total) * 75));
  }

  onProgress?.("Pakujem ZIP...", 95);
  const blob = await zip.generateAsync({ type: "blob" });
  onProgress?.("Završeno!", 100);
  return blob;
}

// ────────────────────────────────────────────────────────────
// Download helper
// ────────────────────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
