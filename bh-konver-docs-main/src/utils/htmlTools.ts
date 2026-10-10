// HTML conversion utilities — 100% client-side.
// Group A: HTML → PDF / DOCX / JPG / PNG / TXT
// Group B: DOCX / PDF / TXT / MD → HTML
import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerURL from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { ToolProgress } from "@/utils/freeTools";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL;

const A4_WIDTH_PX = 794; // ~210mm at 96dpi

async function readText(file: File): Promise<string> {
  return await file.text();
}

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

/** Renders sanitized HTML in a detached, off-screen container. */
async function withRenderedHtml<T>(html: string, fn: (el: HTMLElement) => Promise<T>): Promise<T> {
  const host = document.createElement("div");
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    `width:${A4_WIDTH_PX}px`,
    "background:#ffffff",
    "color:#111111",
    "padding:32px",
    "font-family:Arial, Helvetica, sans-serif",
    "font-size:14px",
    "line-height:1.6",
    "z-index:-1",
  ].join(";");
  host.innerHTML = sanitize(html);
  document.body.appendChild(host);
  try {
    return await fn(host);
  } finally {
    host.remove();
  }
}

function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(sanitize(html), "text/html");
  doc.querySelectorAll("script,style").forEach((n) => n.remove());
  return (doc.body.textContent || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, arr) => l.length > 0 || arr[i - 1]?.length)
    .join("\n")
    .trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapHtmlDocument(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="bs">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111; }
  h1,h2,h3 { line-height: 1.25; }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; }
  td, th { border: 1px solid #ddd; padding: 6px 10px; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

/* ============================ GROUP A: HTML → X ============================ */

export async function htmlToPdf(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje HTML-a", 10);
  const html = await readText(file);

  onProgress?.("Renderiranje stranice", 40);
  const canvas = await withRenderedHtml(html, (el) =>
    html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false }),
  );

  onProgress?.("Kreiranje PDF-a", 75);
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height * pageW) / canvas.width;

  let remaining = imgH;
  let offset = 0;
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  while (remaining > 0) {
    pdf.addImage(dataUrl, "JPEG", 0, -offset, pageW, imgH, undefined, "FAST");
    remaining -= pageH;
    offset += pageH;
    if (remaining > 0) pdf.addPage();
  }

  onProgress?.("Završeno", 100);
  return pdf.output("blob");
}

export async function htmlToDocx(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje HTML-a", 15);
  const html = await readText(file);
  const doc = new DOMParser().parseFromString(sanitize(html), "text/html");
  doc.querySelectorAll("script,style").forEach((n) => n.remove());

  onProgress?.("Izdvajanje sadržaja", 50);
  const blocks = Array.from(
    doc.body.querySelectorAll("h1,h2,h3,h4,p,li,blockquote,pre,td"),
  ).filter((el) => (el.textContent || "").trim().length > 0);

  const paragraphs: Paragraph[] =
    blocks.length > 0
      ? blocks.map((el) => {
          const text = (el.textContent || "").trim();
          const tag = el.tagName.toLowerCase();
          if (tag === "h1") return new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
          if (tag === "h2") return new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
          if (tag === "h3" || tag === "h4") return new Paragraph({ text, heading: HeadingLevel.HEADING_3 });
          if (tag === "li") return new Paragraph({ text, bullet: { level: 0 } });
          return new Paragraph({ children: [new TextRun(text)] });
        })
      : htmlToPlainText(html)
          .split("\n")
          .map((line) => new Paragraph({ children: [new TextRun(line)] }));

  onProgress?.("Generisanje DOCX-a", 85);
  const docx = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  const blob = await Packer.toBlob(docx);
  onProgress?.("Završeno", 100);
  return blob;
}

async function htmlToImage(file: File, type: "image/jpeg" | "image/png", onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje HTML-a", 15);
  const html = await readText(file);
  onProgress?.("Renderiranje stranice", 55);
  const canvas = await withRenderedHtml(html, (el) =>
    html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false }),
  );
  onProgress?.("Kreiranje slike", 85);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Rendering failed"))), type, 0.92),
  );
  onProgress?.("Završeno", 100);
  return blob;
}

export const htmlToJpg = (file: File, p?: ToolProgress) => htmlToImage(file, "image/jpeg", p);
export const htmlToPng = (file: File, p?: ToolProgress) => htmlToImage(file, "image/png", p);

export async function htmlToTxt(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje HTML-a", 25);
  const text = htmlToPlainText(await readText(file));
  onProgress?.("Završeno", 100);
  return new Blob([text], { type: "text/plain;charset=utf-8" });
}

/* ============================ GROUP B: X → HTML ============================ */

export async function docxToHtml(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje dokumenta", 20);
  const buffer = await file.arrayBuffer();
  onProgress?.("Konverzija u HTML", 60);
  const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const html = wrapHtmlDocument(file.name.replace(/\.docx$/i, ""), sanitize(value));
  onProgress?.("Završeno", 100);
  return new Blob([html], { type: "text/html;charset=utf-8" });
}

export async function pdfToHtml(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje PDF-a", 10);
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const sections: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it) => ("str" in it ? (it as { str: string }).str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const paragraphs = text
      .split(/(?<=[.!?])\s{2,}|\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `  <p>${escapeHtml(p)}</p>`)
      .join("\n");
    sections.push(`<section id="stranica-${i}">\n  <h2>Stranica ${i}</h2>\n${paragraphs}\n</section>`);
    onProgress?.(`Stranica ${i}/${pdf.numPages}`, Math.round((i / pdf.numPages) * 90));
  }

  const html = wrapHtmlDocument(file.name.replace(/\.pdf$/i, ""), sections.join("\n"));
  onProgress?.("Završeno", 100);
  return new Blob([html], { type: "text/html;charset=utf-8" });
}

/** Minimal, safe Markdown/TXT → HTML (headings, bold, italic, links, lists). */
function markdownToHtmlBody(src: string): string {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inList = false;

  const inline = (s: string) =>
    escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    const listMatch = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (listMatch) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`  <li>${inline(listMatch[1])}</li>`);
      continue;
    }
    if (inList) { out.push("</ul>"); inList = false; }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (line.trim() === "") {
      // paragraph break
    } else {
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

export async function textToHtml(file: File, onProgress?: ToolProgress): Promise<Blob> {
  onProgress?.("Učitavanje teksta", 30);
  const src = await readText(file);
  onProgress?.("Konverzija u HTML", 70);
  const html = wrapHtmlDocument(file.name.replace(/\.(txt|md|markdown)$/i, ""), markdownToHtmlBody(src));
  onProgress?.("Završeno", 100);
  return new Blob([html], { type: "text/html;charset=utf-8" });
}
