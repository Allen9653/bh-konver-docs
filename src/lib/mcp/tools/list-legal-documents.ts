import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const CATEGORIES = {
  standard: {
    label: "Standardne izjave",
    documents: [
      "Izjava o poklonu",
      "Izjava o prebivalištu",
      "Izjava o identitetu",
      "Izjava o dostavi",
      "Izjava o vlasništvu",
      "Izjava o smrti",
    ],
  },
  business: {
    label: "Poslovne i radne",
    documents: ["Poslovna izjava", "Radni odnos"],
  },
  personal: {
    label: "Lične i finansijske",
    documents: ["Porodica", "Finansije"],
  },
  commercial: {
    label: "Komercijalne",
    documents: ["Kupoprodaja"],
  },
};

export default defineTool({
  name: "list_legal_documents",
  title: "List available legal documents",
  description:
    "Returns the BiH-compliant legal statement templates available in the 'Pravni dokumenti' section, grouped by category. All PDFs are generated client-side (privacy-first).",
  inputSchema: {
    category: z
      .enum(["standard", "business", "personal", "commercial"])
      .optional()
      .describe("Optional. Restrict to a single category."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category }) => {
    const payload = category ? { [category]: CATEGORIES[category] } : CATEGORIES;
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: { categories: payload },
    };
  },
});
