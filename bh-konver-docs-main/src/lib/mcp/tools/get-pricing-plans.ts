import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const PLANS = [
  { id: "24h", label: "24 sata", price_bam: "2.00", duration: "1 dan" },
  { id: "48h", label: "48 sati", price_bam: "10.00", duration: "2 dana" },
  {
    id: "monthly",
    label: "Mjesečna pretplata",
    price_bam: "20.00",
    duration: "30 dana",
  },
];

export default defineTool({
  name: "get_pricing_plans",
  title: "Get BH KONVER pricing plans",
  description:
    "Returns available BH KONVER premium subscription plans with duration and price in BAM (billed in EUR via PayPal).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(PLANS, null, 2) }],
    structuredContent: { plans: PLANS, currency: "BAM", payment: "PayPal (EUR)" },
  }),
});
