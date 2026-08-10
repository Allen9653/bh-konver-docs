// html-to-docx — server-side mirror of the browser HTML → DOCX conversion.
// Response format: { status, file_url, error }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "npm:docx@8.5.0";
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

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

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
      const empty = code === "NO_CONTENT" || code === "EMPTY_HTML";
      return errorResponse(
        empty ? "HTML dokument ne sadrži tekstualni sadržaj." : "HTML dokument je neispravan ili nečitljiv.",
        empty ? "EMPTY_HTML" : "MALFORMED_HTML",
        400,
        corsHeaders,
        { file_url: null },
      );
    }

    const paragraphs = blocks.map((block) => {
      switch (block.type) {
        case "h1":
          return new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_1 });
        case "h2":
          return new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_2 });
        case "h3":
          return new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_3 });
        case "li":
          return new Paragraph({ text: block.text, bullet: { level: 0 } });
        case "quote":
          return new Paragraph({ children: [new TextRun({ text: block.text, italics: true })], indent: { left: 400 } });
        case "pre":
          return new Paragraph({ children: [new TextRun({ text: block.text, font: "Courier New" })] });
        default:
          return new Paragraph({ children: [new TextRun(block.text)] });
      }
    });

    const docx = new Document({ sections: [{ properties: {}, children: paragraphs }] });
    const docxBytes = await Packer.toBuffer(docx);

    const baseName = safeBaseName(filename, extractTitle(html, "dokument"));
    const outName = `${baseName}.docx`;

    const { file_url, storage_path } = await storeResult(
      serviceClient,
      userId,
      outName,
      new Uint8Array(docxBytes),
      DOCX_MIME,
    );

    await flagForCleanup(serviceClient, userId);
    console.log(`html-to-docx: user ${userId} produced ${paragraphs.length} paragraphs`);

    return jsonResponse(
      {
        status: "success",
        file_url,
        error: null,
        filename: outName,
        storage_path,
        paragraphs: paragraphs.length,
        size_bytes: docxBytes.byteLength,
        expires_in: SIGNED_URL_TTL_SECONDS,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("html-to-docx: unexpected error:", message);
    if (message.startsWith("STORAGE_UPLOAD_FAILED") || message.startsWith("SIGNED_URL_FAILED")) {
      return errorResponse("Greška pri spremanju rezultata.", "STORAGE_ERROR", 500, corsHeaders, { file_url: null });
    }
    return errorResponse("Konverzija HTML → DOCX nije uspjela.", "INTERNAL_ERROR", 500, corsHeaders, { file_url: null });
  }
});
