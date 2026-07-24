/**
 * WalletConnect (bundled inside RainbowKit's rainbowWallet) touches
 * `indexedDB` at module init, which throws during Next.js SSR and shows
 * up as an unhandledRejection in dev / noisy prerender errors in build.
 *
 * Stub it server-side so WalletConnect's storage init simply stays
 * pending instead of crashing. On the client this file is a no-op
 * because the real indexedDB already exists.
 *
 * Import this file BEFORE any @rainbow-me/rainbowkit / wagmi imports.
 */
if (typeof window === "undefined") {
  const g = globalThis as Record<string, unknown>;
  if (typeof g.indexedDB === "undefined") {
    g.indexedDB = {
      open: () => new Promise(() => {}),
      deleteDatabase: () => new Promise(() => {}),
    };
  }
}

export {};
