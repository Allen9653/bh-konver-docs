// Shared plan pricing — single source of truth for both
// process-paypal-payment and capture-paypal-payment.
// Prices are in EUR (PayPal charge currency).
export const PLAN_PRICES: Record<string, string> = {
  "24h": "2.00",
  "7d": "7.00",
  "48h": "10.00",
  "monthly": "20.00",
};

export type PlanId = keyof typeof PLAN_PRICES;
