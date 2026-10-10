/**
 * BH KONVER — Cross-Origin Isolation Service Worker
 *
 * Problem: ffmpeg.wasm (video/GIF konverzija) zahtijeva SharedArrayBuffer,
 * a to zahtijeva da stranica bude "cross-origin isolated" — što znači da
 * server mora slati Cross-Origin-Opener-Policy i Cross-Origin-Embedder-Policy
 * HTTP zaglavlja. Statični hosting servisi (Lovable, GitHub Pages, mnogi
 * cPanel shared hosting paketi) često ne dozvoljavaju podešavanje proizvoljnih
 * zaglavlja za sve fajlove.
 *
 * Rješenje: Service worker presreće SVAKI mrežni zahtjev i "dodaje" ova
 * zaglavlja na odgovor prije nego što stigne do browsera — bez potrebe za
 * bilo kakvom podrškom na strani servera. Ovo je standardna, poznata tehnika
 * (koristi je npr. StackBlitz WebContainers, mnogi ffmpeg.wasm projekti).
 */

if (typeof window === "undefined") {
  // Izvršava se unutar samog service workera (sw kontekst)
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("fetch", (event) => {
    const request = event.request;
    // Ne diraj non-GET zahtjeve niti cross-origin navigacije koje mogu pući
    if (request.cache === "only-if-cached" && request.mode !== "same-origin") {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }
          const newHeaders = new Headers(response.headers);
          newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
          newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((err) => {
          console.error("[coi-serviceworker] fetch failed:", err);
          throw err;
        })
    );
  });
} else {
  // Izvršava se u glavnom prozoru — registruje service worker iznad
  (() => {
    // Ako je stranica već izolovana, ništa ne radi
    if (window.crossOriginIsolated) return;

    // Ako browser ne podržava service workere, tiho odustani
    if (!("serviceWorker" in navigator)) {
      console.warn("[coi-serviceworker] Service workeri nisu podržani u ovom browseru.");
      return;
    }

    navigator.serviceWorker
      .register(window.document.currentScript.src)
      .then((registration) => {
        console.log("[coi-serviceworker] Registrovan, scope:", registration.scope);
        // Ako je SW aktivan ali još ne kontroliše stranicu, reload jednom
        if (registration.active && !navigator.serviceWorker.controller) {
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error("[coi-serviceworker] Registracija neuspješna:", err);
      });
  })();
}
