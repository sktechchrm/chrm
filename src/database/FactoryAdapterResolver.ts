// ─────────────────────────────────────────────────────────────────────────────
// FactoryAdapterResolver.ts
// Path: src/database/FactoryAdapterResolver.ts
//
// FIX: now supports per-factory sheetsUrl / sheetsKey in FactoryDbConfig.
// When a factory sets db.sheetsUrl, a dedicated GoogleSheetsAdapter instance
// is created with that URL/key — completely independent from the global .env.
// ─────────────────────────────────────────────────────────────────────────────

import type { IDatabaseAdapter }   from './types/DatabaseInterface';
import type { FactoryDbConfig }    from '../factories/FactoryTypes';
import { googleSheetsAdapter }     from './adapters/GoogleSheetsAdapter';
import { GoogleSheetsAdapter }     from './adapters/GoogleSheetsAdapter';
import { MySQLAdapter }            from './adapters/MySQLAdapter';
import { getFactoryById }          from '../config/factory';

const adapterCache = new Map<string, IDatabaseAdapter>();

export function getAdapterForFactory(
  factoryId: string,
  globalFallback: IDatabaseAdapter,
): IDatabaseAdapter {
  if (adapterCache.has(factoryId)) return adapterCache.get(factoryId)!;

  let adapter: IDatabaseAdapter;

  try {
    const factory = getFactoryById(factoryId);
    const cfg: FactoryDbConfig | undefined = factory.db;

    if (!cfg || cfg.adapter === 'auto') {
      adapter = globalFallback;

    } else if (cfg.adapter === 'sheets') {
      if (cfg.sheetsUrl || cfg.sheetsKey) {
        // FIX: per-factory Apps Script URL/key — build a dedicated instance
        // This factory uses a completely different Apps Script deployment
        adapter = new GoogleSheetsAdapter(cfg.sheetsUrl, cfg.sheetsKey);
        console.info(
          `[RMS] Factory "${factoryId}" using dedicated Sheets URL: ${cfg.sheetsUrl?.slice(0, 50)}...`
        );
      } else {
        // No override → use shared singleton (reads from .env)
        adapter = googleSheetsAdapter;
      }

    } else if (cfg.adapter === 'mysql') {
      if (cfg.mysqlApiUrl && cfg.mysqlApiKey) {
        adapter = new MySQLAdapter(cfg.mysqlApiUrl, cfg.mysqlApiKey);
      } else {
        console.warn(
          `[RMS] Factory "${factoryId}" mysql adapter missing URL/key. Falling back.`
        );
        adapter = globalFallback;
      }

    } else {
      adapter = globalFallback;
    }

  } catch {
    adapter = globalFallback;
  }

  adapterCache.set(factoryId, adapter);
  return adapter;
}

export function clearAdapterCache(): void {
  adapterCache.clear();
}