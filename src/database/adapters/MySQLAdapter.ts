// ─────────────────────────────────────────────────────────────────────────────
// MYSQL REST ADAPTER
//
// Implements IDatabaseAdapter by calling a REST API that wraps MySQL.
// Browsers cannot connect to MySQL directly, so this adapter talks to
// a thin REST backend (Express/Laravel/Django/etc.) that you deploy.
//
// Required env vars:
//   VITE_MYSQL_API_URL   — your REST API base URL (e.g. https://api.yourapp.com)
//   VITE_MYSQL_API_KEY   — your API secret key / Bearer token
//
// Expected REST API contract (implement on your server):
//   POST   /api/rms/records          → save
//   GET    /api/rms/records          → load  (?module=&factoryId=&limit=)
//   PUT    /api/rms/records/:id      → update
//   DELETE /api/rms/records/:id      → delete (?module=&factoryId=)
//   GET    /api/rms/stats            → stats  (?factoryId=)
//   GET    /api/rms/ping             → ping
//
// SQL Schema (per module):
//   CREATE TABLE rms_settlements (
//     id          VARCHAR(64) PRIMARY KEY,
//     saved_at    DATETIME NOT NULL,
//     saved_by    VARCHAR(128) NOT NULL,
//     factory_id  VARCHAR(64) NOT NULL,
//     data        JSON NOT NULL,
//     INDEX idx_factory (factory_id),
//     INDEX idx_saved_at (saved_at)
//   );
//   -- Repeat for each module (maternity, leftnotice, employees, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IDatabaseAdapter,
  DbModule,
  SaveResult,
  LoadResult,
  UpdateResult,
  DeleteResult,
  StatsResult,
  ConnectionStatus,
} from '../types/DatabaseInterface';

// ── Config ────────────────────────────────────────────────────────────────────

interface MySQLAdapterConfig {
  apiUrl: string;
  apiKey: string;
}

function getMySQLConfig(): MySQLAdapterConfig {
  const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
  return {
    apiUrl: env.VITE_MYSQL_API_URL || '',
    apiKey: env.VITE_MYSQL_API_KEY || '',
  };
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function apiRequest(
  config:  MySQLAdapterConfig,
  method:  'GET' | 'POST' | 'PUT' | 'DELETE',
  path:    string,
  body?:   Record<string, unknown>,
  params?: Record<string, string>,
): Promise<Record<string, unknown>> {
  let url = `${config.apiUrl}${path}`;
  if (params) {
    url += '?' + new URLSearchParams(params).toString();
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'X-RMS-Version': '1',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }

  return response.json();
}

// ── Adapter implementation ────────────────────────────────────────────────────

export class MySQLAdapter implements IDatabaseAdapter {
  readonly name = 'MySQL REST API';
  readonly key  = 'mysql';

  // Per-factory overrides (set via constructor for factory-specific instances)
  private readonly _apiUrl?: string;
  private readonly _apiKey?: string;

  /**
   * @param apiUrl  Optional: per-factory REST API URL.
   *                If omitted, reads VITE_MYSQL_API_URL from env.
   * @param apiKey  Optional: per-factory API key.
   *                If omitted, reads VITE_MYSQL_API_KEY from env.
   */
  constructor(apiUrl?: string, apiKey?: string) {
    this._apiUrl = apiUrl;
    this._apiKey = apiKey;
  }

  private getConfig(): MySQLAdapterConfig {
    const envConfig = getMySQLConfig();
    return {
      apiUrl: this._apiUrl || envConfig.apiUrl,
      apiKey: this._apiKey || envConfig.apiKey,
    };
  }

  isConfigured(): boolean {
    const { apiUrl, apiKey } = this.getConfig();
    return Boolean(apiUrl && apiKey);
  }

  async ping(): Promise<ConnectionStatus> {
    const start  = Date.now();
    const config = this.getConfig();

    if (!this.isConfigured()) {
      return {
        connected:   false,
        adapterName: this.name,
        adapterKey:  this.key,
        error: 'VITE_MYSQL_API_URL or VITE_MYSQL_API_KEY not set in .env',
      };
    }

    try {
      await apiRequest(config, 'GET', '/api/rms/ping');
      return {
        connected:   true,
        adapterName: this.name,
        adapterKey:  this.key,
        latencyMs:   Date.now() - start,
      };
    } catch (err) {
      return {
        connected:   false,
        adapterName: this.name,
        adapterKey:  this.key,
        latencyMs:   Date.now() - start,
        error: (err as Error).message,
      };
    }
  }

  async save(
    module:    DbModule,
    record:    Record<string, unknown>,
    factoryId: string,
    savedBy:   string,
  ): Promise<SaveResult> {
    if (!this.isConfigured()) return { ok: false, error: 'MySQL API not configured.' };
    try {
      const config = this.getConfig();
      const result = await apiRequest(config, 'POST', '/api/rms/records', {
        module, record, factoryId, savedBy,
      });
      return result as unknown as SaveResult;
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  async load(
    module:    DbModule,
    factoryId: string,
    limit      = 50,
  ): Promise<LoadResult> {
    if (!this.isConfigured()) return { ok: false, records: [], error: 'MySQL API not configured.' };
    try {
      const config = this.getConfig();
      const result = await apiRequest(config, 'GET', '/api/rms/records', undefined, {
        module, factoryId, limit: String(limit),
      });
      return result as unknown as LoadResult;
    } catch (err) {
      return { ok: false, records: [], error: (err as Error).message };
    }
  }

  async update(
    module:    DbModule,
    id:        string,
    record:    Record<string, unknown>,
    factoryId: string,
    savedBy:   string,
  ): Promise<UpdateResult> {
    if (!this.isConfigured()) return { ok: false, error: 'MySQL API not configured.' };
    try {
      const config = this.getConfig();
      const result = await apiRequest(config, 'PUT', `/api/rms/records/${id}`, {
        module, record, factoryId, savedBy,
      });
      return result as unknown as UpdateResult;
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  async delete(
    module:    DbModule,
    id:        string,
    factoryId: string,
  ): Promise<DeleteResult> {
    if (!this.isConfigured()) return { ok: false, error: 'MySQL API not configured.' };
    try {
      const config = this.getConfig();
      const result = await apiRequest(config, 'DELETE', `/api/rms/records/${id}`, undefined, {
        module, factoryId,
      });
      return result as unknown as DeleteResult;
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  async stats(factoryId: string): Promise<StatsResult> {
    if (!this.isConfigured()) {
      return { ok: false, stats: {} as Record<DbModule, number>, error: 'MySQL API not configured.' };
    }
    try {
      const config = this.getConfig();
      const result = await apiRequest(config, 'GET', '/api/rms/stats', undefined, { factoryId });
      return result as unknown as StatsResult;
    } catch (err) {
      return { ok: false, stats: {} as Record<DbModule, number>, error: (err as Error).message };
    }
  }
}

// Export a singleton
export const mySQLAdapter = new MySQLAdapter();
