// Shared request-body reader for HTML conversion endpoints.
// Accepts multipart/form-data (file or html field) and application/json ({ html, filename }).
import { MAX_HTML_BYTES } from "./html.ts";

export type HtmlInput =
  | { html: string; filename: string }
  | { error: { message: string; code: string; status: number } };

export async function readHtmlInput(req: Request): Promise<HtmlInput> {
  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const html = typeof body?.html === "string" ? body.html : "";
      if (!html.trim()) {
        return { error: { message: "Polje 'html' je obavezno.", code: "MISSING_HTML", status: 400 } };
      }
      return { html, filename: typeof body?.filename === "string" ? body.filename : "" };
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (file instanceof File) {
        if (file.size === 0) {
          return { error: { message: "Fajl je prazan.", code: "EMPTY_HTML", status: 400 } };
        }
        if (file.size > MAX_HTML_BYTES) {
          return { error: { message: "HTML sadržaj je prevelik. Maksimum je 5MB.", code: "HTML_TOO_LARGE", status: 413 } };
        }
        return { html: await file.text(), filename: file.name || "" };
      }

      const inline = formData.get("html");
      if (typeof inline === "string" && inline.trim()) {
        const name = formData.get("filename");
        return { html: inline, filename: typeof name === "string" && name ? name : "" };
      }

      return { error: { message: "Priložite HTML fajl (polje 'file') ili 'html' tekst.", code: "MISSING_HTML", status: 400 } };
    }

    if (contentType.includes("text/html") || contentType.includes("text/plain")) {
      const html = await req.text();
      if (!html.trim()) {
        return { error: { message: "Tijelo zahtjeva je prazno.", code: "MISSING_HTML", status: 400 } };
      }
      return { html, filename: "" };
    }

    return {
      error: {
        message: "Nepodržan format zahtjeva. Koristite multipart/form-data, application/json ili text/html.",
        code: "INVALID_CONTENT_TYPE",
        status: 400,
      },
    };
  } catch (error) {
    console.error("readHtmlInput failed:", error);
    return { error: { message: "Greška pri čitanju zahtjeva.", code: "INVALID_REQUEST_BODY", status: 400 } };
  }
}
