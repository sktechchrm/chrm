// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE SHEETS ADAPTER
// Path: src/database/adapters/GoogleSheetsAdapter.ts
//
// FIX: now supports per-factory Apps Script URL and key.
// Resolution order for URL/key:
//   1. Constructor args (sheetsUrl, sheetsKey) — per-factory override
//   2. .env vars (VITE_SHEETS_URL, VITE_SHEETS_KEY) — global fallback
//
// FactoryAdapterResolver builds a dedicated instance per factory when
// FactoryDbConfig.sheetsUrl is set. Otherwise the shared singleton is used.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IDatabaseAdapter, DbModule, DbRecord,
  SaveResult, LoadResult, UpdateResult,
  DeleteResult, StatsResult, ConnectionStatus,
} from '../types/DatabaseInterface';
import { getFactorySpreadsheetId } from '../../config/factory';

interface SheetsAdapterConfig {
  url: string;
  key: string;
}

function getEnvConfig(): SheetsAdapterConfig {
  const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
  return {
    url: env.VITE_SHEETS_URL || '',
    key: env.VITE_SHEETS_KEY || '',
  };
}

async function sheetsPost(
  config: SheetsAdapterConfig,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(config.url, {
    method: 'POST', redirect: 'follow',
    body: JSON.stringify({ ...body, key: config.key }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.json();
}

async function sheetsGet(
  config: SheetsAdapterConfig,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams({ ...params, key: config.key }).toString();
  const response = await fetch(`${config.url}?${qs}`, { method: 'GET', redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.json();
}

export class GoogleSheetsAdapter implements IDatabaseAdapter {
  readonly name = 'Google Sheets';
  readonly key  = 'sheets';

  // Per-factory overrides (optional — if not set, falls back to .env)
  private readonly _sheetsUrl?: string;
  private readonly _sheetsKey?: string;

  /**
   * @param sheetsUrl  Optional per-factory Apps Script Web App URL.
   *                   Falls back to VITE_SHEETS_URL if omitted.
   * @param sheetsKey  Optional per-factory Apps Script secret key.
   *                   Falls back to VITE_SHEETS_KEY if omitted.
   */
  constructor(sheetsUrl?: string, sheetsKey?: string) {
    this._sheetsUrl = sheetsUrl;
    this._sheetsKey = sheetsKey;
  }

  private getConfig(): SheetsAdapterConfig {
    const env = getEnvConfig();
    return {
      url: this._sheetsUrl || env.url,
      key: this._sheetsKey || env.key,
    };
  }

  isConfigured(): boolean {
    const { url, key } = this.getConfig();
    return Boolean(url && key);
  }

  async ping(): Promise<ConnectionStatus> {
    const start  = Date.now();
    const config = this.getConfig();
    if (!this.isConfigured()) {
      return {
        connected: false, adapterName: this.name, adapterKey: this.key,
        error: 'VITE_SHEETS_URL or VITE_SHEETS_KEY not set in .env',
      };
    }
    try {
      const result = await sheetsGet(config, { action: 'ping' });
      return {
        connected: (result as { ok?: boolean }).ok === true,
        adapterName: this.name, adapterKey: this.key,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      return {
        connected: false, adapterName: this.name, adapterKey: this.key,
        latencyMs: Date.now() - start, error: (err as Error).message,
      };
    }
  }

  async save(module: DbModule, record: Record<string, unknown>, factoryId: string, savedBy: string): Promise<SaveResult> {
    const config = this.getConfig();
    if (!this.isConfigured()) return { ok: false, error: 'Google Sheets not configured.' };
    try {
      const spreadsheetId = getFactorySpreadsheetId(factoryId);
      const result = await sheetsPost(config, { action: 'save', module, record, factoryId, spreadsheetId, savedBy });
      return result as unknown as SaveResult;
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  async load(module: DbModule, factoryId: string, limit = 50): Promise<LoadResult> {
    const config = this.getConfig();
    if (!this.isConfigured()) return { ok: false, records: [], error: 'Google Sheets not configured.' };
    try {
      const spreadsheetId = getFactorySpreadsheetId(factoryId);
      const result = await sheetsGet(config, { action: 'load', module, factoryId, spreadsheetId, limit: String(limit) });
      return result as unknown as LoadResult;
    } catch (err) {
      return { ok: false, records: [], error: (err as Error).message };
    }
  }

  async update(module: DbModule, id: string, record: Record<string, unknown>, factoryId: string, savedBy: string): Promise<UpdateResult> {
    const config = this.getConfig();
    if (!this.isConfigured()) return { ok: false, error: 'Google Sheets not configured.' };
    try {
      const spreadsheetId = getFactorySpreadsheetId(factoryId);
      const result = await sheetsPost(config, { action: 'update', module, id, record, factoryId, spreadsheetId, savedBy });
      return result as unknown as UpdateResult;
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  async delete(module: DbModule, id: string, factoryId: string): Promise<DeleteResult> {
    const config = this.getConfig();
    if (!this.isConfigured()) return { ok: false, error: 'Google Sheets not configured.' };
    try {
      const spreadsheetId = getFactorySpreadsheetId(factoryId);
      const result = await sheetsPost(config, { action: 'delete', module, id, factoryId, spreadsheetId });
      return result as unknown as DeleteResult;
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  async stats(factoryId: string): Promise<StatsResult> {
    const config = this.getConfig();
    if (!this.isConfigured()) {
      return { ok: false, stats: {} as Record<DbModule, number>, error: 'Google Sheets not configured.' };
    }
    try {
      const spreadsheetId = getFactorySpreadsheetId(factoryId);
      const result = await sheetsGet(config, { action: 'stats', factoryId, spreadsheetId });
      return result as unknown as StatsResult;
    } catch (err) {
      return { ok: false, stats: {} as Record<DbModule, number>, error: (err as Error).message };
    }
  }
}

// Shared singleton — used by factories with no sheetsUrl override
export const googleSheetsAdapter = new GoogleSheetsAdapter();
export type { DbRecord };