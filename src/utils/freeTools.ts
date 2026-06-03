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
  return new Blob([out], { type: "application/pdf" });
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

  const container = document.createElement("div");
  container.style.width = "595px"; // A4 width in pt
  container.style.padding = "40px";
  container.style.fontFamily = "Helvetica, Arial, sans-serif";
  container.style.fontSize = "12px";
  container.style.lineHeight = "1.5";
  container.style.color = "#000";
  container.innerHTML = html;
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
// 3) PDF → Word (.docx)  (text extraction, paragraph-preserving)
// ────────────────────────────────────────────────────────────
export async function pdfToWord(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje PDF dokumenta...", 10);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const allParagraphs: InstanceType<typeof Paragraph>[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Obrada stranice ${i}/${pdf.numPages}`, 20 + Math.round((i / pdf.numPages) * 60));
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Group items into lines using y-coordinate
    const lines = new Map<number, string[]>();
    for (const item of textContent.items as Array<{ str: string; transform: number[] }>) {
      const y = Math.round(item.transform[5]);
      if (!lines.has(y)) lines.set(y, []);
      lines.get(y)!.push(item.str);
    }
    const sortedY = [...lines.keys()].sort((a, b) => b - a);

    if (i > 1) allParagraphs.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));
    allParagraphs.push(new Paragraph({
      heading: HeadingLevel.HEADING_3,
      children: [new TextRun({ text: `— Stranica ${i} —`, bold: true })],
    }));

    for (const y of sortedY) {
      const text = lines.get(y)!.join(" ").trim();
      if (text) allParagraphs.push(new Paragraph({ children: [new TextRun(text)] }));
    }
  }

  onProgress?.("Generišem DOCX...", 90);
  const doc = new Document({ sections: [{ children: allParagraphs }] });
  const buf = await Packer.toBlob(doc);
  onProgress?.("Završeno!", 100);
  return buf;
}

// ────────────────────────────────────────────────────────────
// 4) Excel (.xlsx/.xls) → PDF  (SheetJS → HTML table → jsPDF)
// ────────────────────────────────────────────────────────────
export async function excelToPdf(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje Excel datoteke...", 10);
  const XLSX = await import("xlsx");
  const data = new Uint8Array(await file.arrayBuffer());
  const workbook = XLSX.read(data, { type: "array" });

  onProgress?.("Generišem PDF stranice...", 40);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });

  const sheetNames = workbook.SheetNames;
  for (let s = 0; s < sheetNames.length; s++) {
    const name = sheetNames[s];
    const sheet = workbook.Sheets[name];
    const html = XLSX.utils.sheet_to_html(sheet, { editable: false });

    const container = document.createElement("div");
    container.style.width = "800px";
    container.style.padding = "20px";
    container.style.fontFamily = "Helvetica, Arial, sans-serif";
    container.style.fontSize = "10px";
    container.style.color = "#000";
    container.innerHTML = `<h3 style="font-size:14px;margin:0 0 10px 0">${name}</h3>${html}`;
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
// 5) Latinica ↔ Ćirilica  (Bosnian/Serbian/Croatian)
// ────────────────────────────────────────────────────────────
const LAT_TO_CYR: Array<[string, string]> = [
  ["Lj", "Љ"], ["LJ", "Љ"], ["lj", "љ"],
  ["Nj", "Њ"], ["NJ", "Њ"], ["nj", "њ"],
  ["Dž", "Џ"], ["DŽ", "Џ"], ["dž", "џ"],
  ["A", "А"], ["B", "Б"], ["V", "В"], ["G", "Г"], ["D", "Д"], ["Đ", "Ђ"], ["E", "Е"],
  ["Ž", "Ж"], ["Z", "З"], ["I", "И"], ["J", "Ј"], ["K", "К"], ["L", "Л"], ["M", "М"],
  ["N", "Н"], ["O", "О"], ["P", "П"], ["R", "Р"], ["S", "С"], ["T", "Т"], ["Ć", "Ћ"],
  ["U", "У"], ["F", "Ф"], ["H", "Х"], ["C", "Ц"], ["Č", "Ч"], ["Š", "Ш"],
  ["a", "а"], ["b", "б"], ["v", "в"], ["g", "г"], ["d", "д"], ["đ", "ђ"], ["e", "е"],
  ["ž", "ж"], ["z", "з"], ["i", "и"], ["j", "ј"], ["k", "к"], ["l", "л"], ["m", "м"],
  ["n", "н"], ["o", "о"], ["p", "п"], ["r", "р"], ["s", "с"], ["t", "т"], ["ć", "ћ"],
  ["u", "у"], ["f", "ф"], ["h", "х"], ["c", "ц"], ["č", "ч"], ["š", "ш"],
];

const CYR_TO_LAT: Array<[string, string]> = [
  ["Љ", "Lj"], ["љ", "lj"],
  ["Њ", "Nj"], ["њ", "nj"],
  ["Џ", "Dž"], ["џ", "dž"],
  ["А", "A"], ["Б", "B"], ["В", "V"], ["Г", "G"], ["Д", "D"], ["Ђ", "Đ"], ["Е", "E"],
  ["Ж", "Ž"], ["З", "Z"], ["И", "I"], ["Ј", "J"], ["К", "K"], ["Л", "L"], ["М", "M"],
  ["Н", "N"], ["О", "O"], ["П", "P"], ["Р", "R"], ["С", "S"], ["Т", "T"], ["Ћ", "Ć"],
  ["У", "U"], ["Ф", "F"], ["Х", "H"], ["Ц", "C"], ["Ч", "Č"], ["Ш", "Š"],
  ["а", "a"], ["б", "b"], ["в", "v"], ["г", "g"], ["д", "d"], ["ђ", "đ"], ["е", "e"],
  ["ж", "ž"], ["з", "z"], ["и", "i"], ["ј", "j"], ["к", "k"], ["л", "l"], ["м", "m"],
  ["н", "n"], ["о", "o"], ["п", "p"], ["р", "r"], ["с", "s"], ["т", "t"], ["ћ", "ć"],
  ["у", "u"], ["ф", "f"], ["х", "h"], ["ц", "c"], ["ч", "č"], ["ш", "š"],
];

export function latinToCyrillic(text: string): string {
  let out = text;
  for (const [a, b] of LAT_TO_CYR) out = out.split(a).join(b);
  return out;
}

export function cyrillicToLatin(text: string): string {
  let out = text;
  for (const [a, b] of CYR_TO_LAT) out = out.split(a).join(b);
  return out;
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
  return new Blob([out], { type: "application/pdf" });
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
