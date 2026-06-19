// Client-side PDF generator for BiH legal statements (Ovjerene izjave).
// Privacy-first: nothing leaves the browser.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface LegalPdfInput {
  title: string;
  body: string;
  signerName: string;
  place: string; // mjesto izdavanja izjave
  date: string;  // ISO yyyy-mm-dd
}

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 60;
const LINE_HEIGHT = 14;
const FONT_SIZE = 11;

// Replace Bosnian diacritics so StandardFonts (WinAnsi) can render the text.
// pdf-lib's StandardFonts do not support full UTF-8; embedding custom fonts
// requires extra assets. This keeps the file lean for v1.
const sanitize = (s: string): string =>
  s
    .replace(/[čć]/g, "c").replace(/[ČĆ]/g, "C")
    .replace(/š/g, "s").replace(/Š/g, "S")
    .replace(/ž/g, "z").replace(/Ž/g, "Z")
    .replace(/đ/g, "dj").replace(/Đ/g, "Dj");

const wrapText = (text: string, font: any, size: number, maxWidth: number): string[] => {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) { lines.push(""); continue; }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const w of words) {
      const test = current ? `${current} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        if (current) lines.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
};

export async function generateLegalPdf(input: LegalPdfInput): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const maxWidth = PAGE_W - MARGIN * 2;

  const drawLine = (text: string, opts: { font?: any; size?: number; align?: "left" | "center" } = {}) => {
    const f = opts.font || font;
    const size = opts.size || FONT_SIZE;
    if (y < MARGIN + 80) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
    const safe = sanitize(text);
    const width = f.widthOfTextAtSize(safe, size);
    const x = opts.align === "center" ? (PAGE_W - width) / 2 : MARGIN;
    page.drawText(safe, { x, y, size, font: f, color: rgb(0, 0, 0) });
    y -= LINE_HEIGHT;
  };

  // Header
  drawLine("BOSNA I HERCEGOVINA", { font: fontBold, size: 10, align: "center" });
  drawLine(input.title.toUpperCase(), { font: fontBold, size: 14, align: "center" });
  y -= LINE_HEIGHT;

  // Body
  for (const line of wrapText(input.body, font, FONT_SIZE, maxWidth)) {
    drawLine(line);
  }

  // Spacer
  y -= LINE_HEIGHT * 2;

  // Mandatory BiH legal block
  drawLine(`Mjesto i datum: ${input.place || "_______________"}, ${input.date || "____.____.________"}`);
  y -= LINE_HEIGHT;
  drawLine("Izjavu dao/la pred nadleznim organom:", { font: fontBold });
  y -= LINE_HEIGHT;
  drawLine(`Davatelj izjave: ${input.signerName || "_______________"}`);
  y -= LINE_HEIGHT * 2;
  drawLine("_________________________________");
  drawLine("(svojerucni potpis davatelja izjave)", { font: fontItalic, size: 9 });

  // Certification block
  y -= LINE_HEIGHT * 2;
  drawLine("OVJERA NADLEZNOG ORGANA", { font: fontBold, align: "center" });
  y -= LINE_HEIGHT;
  drawLine("Potvrdjuje se da je gore imenovano lice vlastorucno potpisalo ovu izjavu");
  drawLine("pred sluzbenikom opcine / notarom / nadleznim organom u BiH.");
  y -= LINE_HEIGHT;
  drawLine("Broj ovjere: ______________________   Datum ovjere: ____.____.________");
  y -= LINE_HEIGHT * 2;
  drawLine("M.P.                                              Sluzbeno lice:");
  y -= LINE_HEIGHT;
  drawLine("(mjesto pecata)                                   _________________________");

  // Footer disclaimer
  y -= LINE_HEIGHT * 2;
  drawLine(
    "Ova izjava je sacinjena na teritoriji Bosne i Hercegovine i podlijeze",
    { font: fontItalic, size: 9 }
  );
  drawLine(
    "pozitivnim propisima FBiH / RS / Brcko Distrikta BiH.",
    { font: fontItalic, size: 9 }
  );

  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
