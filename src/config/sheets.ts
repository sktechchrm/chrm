// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE SHEETS CONFIGURATION
//
// After completing the setup in google-apps-script/SETUP.md:
//   1. Paste your Web App URL into `url` below
//   2. Paste your SECRET_KEY into `key` below
//   3. Save — all modules will immediately have working save buttons
//
// For higher security, use environment variables instead:
//   url: import.meta.env.VITE_SHEETS_URL || '',
//   key: import.meta.env.VITE_SHEETS_KEY || '',
// And add these to your .env file (do not commit .env to GitHub).
// ─────────────────────────────────────────────────────────────────────────────

interface ImportMetaEnv {
  readonly VITE_SHEETS_URL?: string;
  readonly VITE_SHEETS_KEY?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export const SHEETS_CONFIG = {

  url: import.meta.env.VITE_SHEETS_URL || '',

  key: import.meta.env.VITE_SHEETS_KEY || '',

} as const;

/** Returns true once both url and key are configured */
export const isSheetsConfigured = (): boolean =>
  Boolean(SHEETS_CONFIG.url && SHEETS_CONFIG.key);
