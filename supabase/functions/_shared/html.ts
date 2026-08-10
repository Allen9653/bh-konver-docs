// Server-side HTML parsing shared by html-to-pdf and html-to-docx.
// Mirrors the browser pipeline (sanitize → extract blocks) without a DOM.

export type HtmlBlock = {
  type: "h1" | "h2" | "h3" | "p" | "li" | "quote" | "pre";
  text: string;
};

export const MAX_HTML_BYTES = 5 * 1024 * 1024; // 5MB of HTML source

/** Strips scripts, styles, comments and event handlers — no untrusted markup survives. */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<(iframe|object|embed|svg|link|meta)\b[\s\S]*?(<\/\1\s*>|>)/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»",
  };
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => named[String(name).toLowerCase()] ?? m);
}

function clean(text: string): string {
  return decodeEntities(text.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Throws when the input cannot plausibly be HTML/text content. */
export function assertParsableHtml(html: string): void {
  if (!html || !html.trim()) {
    throw new Error("EMPTY_HTML");
  }
  // Binary sniffing — reject files that are clearly not text.
  if (/[\u0000-\u0008\u000E-\u001F]/.test(html.slice(0, 4096))) {
    throw new Error("MALFORMED_HTML");
  }
}

/** Extracts an ordered list of text blocks from HTML. Falls back to plain text. */
export function extractBlocks(rawHtml: string): HtmlBlock[] {
  assertParsableHtml(rawHtml);
  const html = sanitizeHtml(rawHtml);
  const body = /<body[^>]*>([\s\S]*)<\/body\s*>/i.exec(html)?.[1] ?? html;

  const blocks: HtmlBlock[] = [];
  const pattern = /<(h1|h2|h3|h4|p|li|blockquote|pre|td)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body)) !== null) {
    const text = clean(match[2]);
    if (!text) continue;
    const tag = match[1].toLowerCase();
    const type: HtmlBlock["type"] =
      tag === "h1" ? "h1"
      : tag === "h2" ? "h2"
      : tag === "h3" || tag === "h4" ? "h3"
      : tag === "li" ? "li"
      : tag === "blockquote" ? "quote"
      : tag === "pre" ? "pre"
      : "p";
    blocks.push({ type, text });
  }

  if (blocks.length === 0) {
    const plain = clean(body);
    if (!plain) throw new Error("NO_CONTENT");
    for (const line of plain.split(/\n+/)) {
      const t = line.trim();
      if (t) blocks.push({ type: "p", text: t });
    }
  }

  return blocks;
}

export function extractTitle(rawHtml: string, fallback: string): string {
  const title = /<title[^>]*>([\s\S]*?)<\/title\s*>/i.exec(rawHtml)?.[1];
  return title ? clean(title) || fallback : fallback;
}

export function safeBaseName(name: string | null | undefined, fallback: string): string {
  const base = (name ?? fallback).replace(/\.[^/.]+$/, "");
  const cleaned = base.replace(/[^\w\-. ]+/g, "_").trim().slice(0, 80);
  return cleaned || fallback;
}
