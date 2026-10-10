// html-to-pdf — server-side mirror of the browser HTML → PDF conversion.
// Response format: { status, file_url, error }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, type PDFFont, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  MAX_FILE_SIZE,
  SIGNED_URL_TTL_SECONDS,
  authorizeRequest,
  errorResponse,
  flagForCleanup,
  jsonResponse,
  storeResult,
} from "../_shared/authz.ts";
import { MAX_HTML_BYTES, extractBlocks, extractTitle, safeBaseName } from "../_shared/html.ts";
import { readHtmlInput } from "../_shared/htmlInput.ts";

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const LINE_GAP = 4;

const SIZES: Record<string, number> = { h1: 22, h2: 18, h3: 15, p: 11, li: 11, quote: 11, pre: 10 };

/** pdf-lib standard fonts are WinAnsi — transliterate unsupported glyphs. */
function toWinAnsi(text: string): string {
  const map: Record<string, string> = {
    "č": "c", "ć": "c", "đ": "d", "š": "s", "ž": "z",
    "Č": "C", "Ć": "C", "Đ": "D", "Š": "S", "Ž": "Z",
    "–": "-", "—": "-", "…": "...", "\u00a0": " ", "•": "\u2022", "„": '"', "“": '"', "”": '"', "‘": "'", "’": "'",
  };
  return text.replace(/[^\x20-\x7E\u2022]/g, (ch) => map[ch] ?? (/[\u0400-\u04FF]/.test(ch) ? "?" : " "));
}

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // Hard-break words that are longer than a full line
      let chunk = word;
      while (font.widthOfTextAtSize(chunk, size) > maxWidth && chunk.length > 1) {
        let cut = chunk.length;
        while (cut > 1 && font.widthOfTextAtSize(chunk.slice(0, cut), size) > maxWidth) cut--;
        lines.push(chunk.slice(0, cut));
        chunk = chunk.slice(cut);
      }
      current = chunk;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Dozvoljena je samo POST metoda.", "METHOD_NOT_ALLOWED", 405, corsHeaders, { file_url: null });
  }

  try {
    const auth = await authorizeRequest(req, corsHeaders);
    if ("response" in auth) return auth.response;
    const { userId, serviceClient } = auth.context;

    const input = await readHtmlInput(req);
    if ("error" in input) {
      return errorResponse(input.error.message, input.error.code, input.error.status, corsHeaders, { file_url: null });
    }
    const { html, filename } = input;

    if (new Blob([html]).size > Math.min(MAX_HTML_BYTES, MAX_FILE_SIZE)) {
      return errorResponse("HTML sadržaj je prevelik. Maksimum je 5MB.", "HTML_TOO_LARGE", 413, corsHeaders, { file_url: null });
    }

    let blocks;
    try {
      blocks = extractBlocks(html);
    } catch (parseError) {
      const code = parseError instanceof Error ? parseError.message : "MALFORMED_HTML";
      return errorResponse(
        code === "NO_CONTENT" || code === "EMPTY_HTML"
          ? "HTML dokument ne sadrži tekstualni sadržaj."
          : "HTML dokument je neispravan ili nečitljiv.",
        code === "NO_CONTENT" || code === "EMPTY_HTML" ? "EMPTY_HTML" : "MALFORMED_HTML",
        400,
        corsHeaders,
        { file_url: null },
      );
    }

    const pdf = await PDFDocument.create();
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const maxWidth = PAGE_WIDTH - MARGIN * 2;

    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let cursorY = PAGE_HEIGHT - MARGIN;

    const newPage = () => {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = PAGE_HEIGHT - MARGIN;
    };

    for (const block of blocks) {
      const size = SIZES[block.type] ?? 11;
      const font = block.type.startsWith("h") ? bold : regular;
      const indent = block.type === "li" || block.type === "quote" ? 18 : 0;
      const prefix = block.type === "li" ? "• " : "";
      const text = toWinAnsi(prefix + block.text);
      const lines = wrapLine(text, font, size, maxWidth - indent);
      const lineHeight = size + LINE_GAP;

      cursorY -= block.type.startsWith("h") ? 10 : 4;

      for (const line of lines) {
        if (cursorY - lineHeight < MARGIN) newPage();
        page.drawText(line, {
          x: MARGIN + indent,
          y: cursorY - size,
          size,
          font,
          color: block.type === "quote" ? rgb(0.35, 0.4, 0.45) : rgb(0.07, 0.07, 0.07),
        });
        cursorY -= lineHeight;
      }
      cursorY -= 4;
    }

    const pdfBytes = await pdf.save();
    const baseName = safeBaseName(filename, extractTitle(html, "dokument"));
    const outName = `${baseName}.pdf`;

    const { file_url, storage_path } = await storeResult(
      serviceClient,
      userId,
      outName,
      pdfBytes,
      "application/pdf",
    );

    await flagForCleanup(serviceClient, userId);
    console.log(`html-to-pdf: user ${userId} produced ${pdf.getPageCount()} pages`);

    return jsonResponse(
      {
        status: "success",
        file_url,
        error: null,
        filename: outName,
        storage_path,
        pages: pdf.getPageCount(),
        size_bytes: pdfBytes.byteLength,
        expires_in: SIGNED_URL_TTL_SECONDS,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("html-to-pdf: unexpected error:", message);
    if (message.startsWith("STORAGE_UPLOAD_FAILED") || message.startsWith("SIGNED_URL_FAILED")) {
      return errorResponse("Greška pri spremanju rezultata.", "STORAGE_ERROR", 500, corsHeaders, { file_url: null });
    }
    return errorResponse("Konverzija HTML → PDF nije uspjela.", "INTERNAL_ERROR", 500, corsHeaders, { file_url: null });
  }
});
