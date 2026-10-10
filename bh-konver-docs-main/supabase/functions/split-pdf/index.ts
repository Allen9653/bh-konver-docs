// split-pdf — splits a multi-page PDF into single-page PDFs.
// Response format: { status, pages[], error }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from "npm:pdf-lib@1.17.1";
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
import { safeBaseName } from "../_shared/html.ts";

const MAX_PAGES = 200;

function parsePageSelection(raw: string | null, pageCount: number): number[] {
  if (!raw || !raw.trim()) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const selected = new Set<number>();
  for (const part of raw.split(",")) {
    const token = part.trim();
    if (!token) continue;
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(token);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end < start || end > pageCount) throw new Error("INVALID_PAGE_RANGE");
      for (let p = start; p <= end; p++) selected.add(p);
      continue;
    }
    const single = Number(token);
    if (!Number.isInteger(single) || single < 1 || single > pageCount) {
      throw new Error("INVALID_PAGE_RANGE");
    }
    selected.add(single);
  }

  if (selected.size === 0) throw new Error("INVALID_PAGE_RANGE");
  return [...selected].sort((a, b) => a - b);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Dozvoljena je samo POST metoda.", "METHOD_NOT_ALLOWED", 405, corsHeaders, { pages: [] });
  }

  try {
    const auth = await authorizeRequest(req, corsHeaders);
    if ("response" in auth) return auth.response;
    const { userId, serviceClient } = auth.context;

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return errorResponse("Očekivan je multipart/form-data zahtjev.", "INVALID_CONTENT_TYPE", 400, corsHeaders, { pages: [] });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error("split-pdf: form parse failed:", parseError);
      return errorResponse("Greška pri čitanju zahtjeva.", "INVALID_REQUEST_BODY", 400, corsHeaders, { pages: [] });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return errorResponse("Fajl nije priložen (polje 'file').", "MISSING_FILE", 400, corsHeaders, { pages: [] });
    }
    if (file.size === 0) {
      return errorResponse("Fajl je prazan.", "EMPTY_FILE", 400, corsHeaders, { pages: [] });
    }
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("Fajl je prevelik. Maksimalna veličina je 50MB.", "FILE_TOO_LARGE", 413, corsHeaders, { pages: [] });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const header = new TextDecoder().decode(bytes.slice(0, 5));
    if (!header.startsWith("%PDF")) {
      return errorResponse("Fajl nije validan PDF dokument.", "INVALID_PDF", 400, corsHeaders, { pages: [] });
    }

    let sourceDoc: PDFDocument;
    try {
      sourceDoc = await PDFDocument.load(bytes, { ignoreEncryption: false });
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "";
      const encrypted = /encrypt/i.test(message);
      console.warn(`split-pdf: load failed (${message})`);
      return errorResponse(
        encrypted
          ? "PDF je zaštićen lozinkom i ne može biti podijeljen."
          : "PDF je oštećen ili nečitljiv.",
        encrypted ? "ENCRYPTED_PDF" : "CORRUPT_PDF",
        400,
        corsHeaders,
        { pages: [] },
      );
    }

    const pageCount = sourceDoc.getPageCount();
    if (pageCount === 0) {
      return errorResponse("PDF nema nijednu stranicu.", "EMPTY_PDF", 400, corsHeaders, { pages: [] });
    }
    if (pageCount > MAX_PAGES) {
      return errorResponse(
        `PDF ima previše stranica (${pageCount}). Maksimum je ${MAX_PAGES}.`,
        "TOO_MANY_PAGES",
        413,
        corsHeaders,
        { pages: [] },
      );
    }

    let selectedPages: number[];
    try {
      selectedPages = parsePageSelection(formData.get("pages") as string | null, pageCount);
    } catch {
      return errorResponse(
        `Neispravan odabir stranica. Dokument ima ${pageCount} stranica.`,
        "INVALID_PAGE_RANGE",
        400,
        corsHeaders,
        { pages: [] },
      );
    }

    const baseName = safeBaseName(file.name, "dokument");
    const pages: Array<Record<string, unknown>> = [];

    for (const pageNumber of selectedPages) {
      const singleDoc = await PDFDocument.create();
      const [copied] = await singleDoc.copyPages(sourceDoc, [pageNumber - 1]);
      singleDoc.addPage(copied);
      const pdfBytes = await singleDoc.save();

      const filename = `${baseName}_stranica_${pageNumber}.pdf`;
      const { file_url, storage_path } = await storeResult(
        serviceClient,
        userId,
        filename,
        pdfBytes,
        "application/pdf",
      );

      pages.push({
        page: pageNumber,
        filename,
        file_url,
        storage_path,
        size_bytes: pdfBytes.byteLength,
        expires_in: SIGNED_URL_TTL_SECONDS,
      });
    }

    await flagForCleanup(serviceClient, userId);

    console.log(`split-pdf: user ${userId} split ${selectedPages.length}/${pageCount} pages`);

    return jsonResponse(
      {
        status: "success",
        pages,
        error: null,
        total_pages: pageCount,
        expires_in: SIGNED_URL_TTL_SECONDS,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("split-pdf: unexpected error:", message);
    if (message.startsWith("STORAGE_UPLOAD_FAILED") || message.startsWith("SIGNED_URL_FAILED")) {
      return errorResponse("Greška pri spremanju rezultata.", "STORAGE_ERROR", 500, corsHeaders, { pages: [] });
    }
    return errorResponse("Dijeljenje PDF-a nije uspjelo. Molimo pokušajte ponovo.", "INTERNAL_ERROR", 500, corsHeaders, { pages: [] });
  }
});
