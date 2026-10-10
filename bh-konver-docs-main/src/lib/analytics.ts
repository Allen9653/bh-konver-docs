/**
 * Google Analytics (GA4) helper — client-side only.
 * All UI copy stays out of this module; it only sends events.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const measurementId = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined;

let initialized = false;

export const gtag = (...args: unknown[]) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
};

export const initAnalytics = () => {
  if (initialized || typeof window === "undefined" || !measurementId) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: true });
};

export const trackPageView = (path: string) => {
  if (!measurementId) return;
  gtag("event", "page_view", { page_path: path, page_location: window.location.href, page_title: document.title });
};

export const trackEvent = (name: string, params: Record<string, unknown> = {}) => {
  if (!measurementId) return;
  gtag("event", name, params);
};

/** Klik na karticu alata na naslovnoj / u gridu. */
export const trackToolCardClick = (params: { slug: string; access: string; locked: boolean }) =>
  trackEvent("tool_card_click", { tool_slug: params.slug, tool_access: params.access, locked: params.locked });

/** Odabir pretplatničkog paketa (24h / 7d / mjesečno). */
export const trackSubscriptionSelect = (params: { planId: string; price?: number; currency?: string }) =>
  trackEvent("subscription_select", {
    plan_id: params.planId,
    value: params.price,
    currency: params.currency ?? "BAM",
  });

/** Preuzimanje fajla iz Historije. */
export const trackHistoryDownload = (params: { source: "document" | "conversion"; format?: string }) =>
  trackEvent("history_download", { source: params.source, file_format: params.format });
