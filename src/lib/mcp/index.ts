import { defineMcp } from "@lovable.dev/mcp-js";
import listSupportedFormatsTool from "./tools/list-supported-formats";
import getPricingPlansTool from "./tools/get-pricing-plans";
import listLegalDocumentsTool from "./tools/list-legal-documents";

export default defineMcp({
  name: "bh-konver-mcp",
  title: "BH KONVER MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for BH KONVER, a Bosnia & Herzegovina file-conversion and legal-document platform. Use `list_supported_formats` to discover which file types can be converted, `get_pricing_plans` for premium plan pricing in BAM, and `list_legal_documents` for available BiH-compliant legal statement templates.",
  tools: [listSupportedFormatsTool, getPricingPlansTool, listLegalDocumentsTool],
});
