// ─────────────────────────────────────────────────────────────────────────────
// DATABASE FACTORY
//
// Two-level adapter resolution:
//
//  1. GLOBAL (fallback) — VITE_DB_ADAPTER in .env
//     Used when a factory has no db config or adapter:'auto'
//
//  2. PER-FACTORY — db field in each factory file (MgShirtex.ts, Mohammadi.ts…)
//     Each factory independently declares which backend it uses:
//
//     MgShirtex.ts:   db: { adapter: 'sheets', spreadsheetId: '...' }
//     Mohammadi.ts:   db: { adapter: 'mysql',  mysqlApiUrl: '...', mysqlApiKey: '...' }
//
// The hook useDatabase(module, factoryId, user) calls getDbForFactory(factoryId)
// which returns the correct adapter — no component changes ever needed.
//
// HOW TO SET A FACTORY'S DATABASE:
//   Open the factory file (e.g. src/factories/Mohammadi.ts) and set the db field.
//   See FactoryTypes.ts → FactoryDbConfig for all options.
//
// HOW TO ADD A NEW ADAPTER TYPE:
//   1. Create src/database/adapters/YourAdapter.ts implementing IDatabaseAdapter
//   2. Import + register it in FactoryAdapterResolver.ts
//   3. Add the key to FactoryDbConfig in FactoryTypes.ts
// ─────────────────────────────────────────────────────────────────────────────

import type { IDatabaseAdapter }  from './types/DatabaseInterface';
import { googleSheetsAdapter }    from './adapters/GoogleSheetsAdapter';
import { MySQLAdapter }           from './adapters/MySQLAdapter';
import { getAdapterForFactory, clearAdapterCache } from './FactoryAdapterResolver';

// ── Registry of all available adapter types (for admin panel listing) ─────────

const _globalMySQLAdapter = new MySQLAdapter(); // reads from env vars

const ADAPTER_MAP: Record<string, IDatabaseAdapter> = {
  sheets: googleSheetsAdapter,
  mysql:  _globalMySQLAdapter,
  // firebase:   firebaseAdapter,  ← register future adapters here
  // postgresql: pgAdapter,
};

// ── Global fallback — used when a factory has adapter:'auto' or no db config ──

function resolveGlobalAdapter(): IDatabaseAdapter {
  const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
  const key = (env.VITE_DB_ADAPTER || 'sheets').toLowerCase().trim();
  const adapter = ADAPTER_MAP[key];
  if (!adapter) {
    console.warn(
      `[RMS] Unknown VITE_DB_ADAPTER="${key}". ` +
      `Available: ${Object.keys(ADAPTER_MAP).join(', ')}. Falling back to sheets.`
    );
    return googleSheetsAdapter;
  }
  return adapter;
}

export const db: IDatabaseAdapter = resolveGlobalAdapter();

// ── Per-factory adapter resolution — the main entry point ─────────────────────

/**
 * Returns the correct IDatabaseAdapter for the given factoryId.
 *
 * Resolution order:
 *   1. Factory's own db config (MgShirtex → sheets, Mohammadi → mysql, …)
 *   2. Falls back to global adapter (VITE_DB_ADAPTER) if factory has no config
 *
 * Results are cached — no performance cost on repeated calls.
 */
export function getDbForFactory(factoryId: string): IDatabaseAdapter {
  return getAdapterForFactory(factoryId, db);
}

/** Clear the per-factory adapter cache (call after updating factory db config at runtime) */
export { clearAdapterCache };

// ── Admin utilities ───────────────────────────────────────────────────────────

export function getAllAdapters(): IDatabaseAdapter[] {
  return Object.values(ADAPTER_MAP);
}

export function getAdapterByKey(key: string): IDatabaseAdapter | undefined {
  return ADAPTER_MAP[key.toLowerCase()];
}

// ── Re-export types ───────────────────────────────────────────────────────────

export type {
  IDatabaseAdapter,
  DbModule,
  DbRecord,
  SaveResult,
  LoadResult,
  UpdateResult,
  DeleteResult,
  StatsResult,
  ConnectionStatus,
} from './types/DatabaseInterface';
