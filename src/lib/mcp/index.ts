import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSupportedFormatsTool from "./tools/list-supported-formats";
import getPricingPlansTool from "./tools/get-pricing-plans";
import listLegalDocumentsTool from "./tools/list-legal-documents";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "bh-konver-mcp",
  title: "BH KONVER MCP",
  version: "0.1.0",
  instructions:
    "Authenticated tools for BH KONVER, a Bosnia & Herzegovina file-conversion and legal-document platform. Sign in with your BH KONVER account to use them. Use `list_supported_formats` to discover which file types can be converted, `get_pricing_plans` for premium plan pricing in BAM, and `list_legal_documents` for available BiH-compliant legal statement templates.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listSupportedFormatsTool, getPricingPlansTool, listLegalDocumentsTool],
});
