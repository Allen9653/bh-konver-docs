import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Release Capacitor configuration.
 *
 * IMPORTANT — before the first Play Store / App Store release:
 *   Replace `appId` below with your permanent reverse-domain identifier
 *   (e.g. "ba.bhkonver.app"). It CANNOT be changed after publishing.
 *
 * The `server.url` / `cleartext` live-reload override has been intentionally
 * removed. Store builds must load the bundled `dist/` output, not a remote
 * Lovable preview URL. For local live-reload during development, create a
 * separate dev-only config (e.g. `capacitor.config.dev.ts`) — do NOT add it
 * to this file.
 */
const config: CapacitorConfig = {
  appId: 'app.lovable.2bb502b3f5414731a607bafa037ec71a', // TODO: replace with permanent reverse-domain appId before first store release
  appName: 'bh-konver',
  webDir: 'dist',
};

export default config;
