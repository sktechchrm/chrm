// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS LAYER — Data Use Cases
// src/business/DataUseCases.ts
//
// Every data operation in the app goes through here.
// Components never import from services/googleSheets.ts directly.
// The DB layer (adapter) is resolved per-factory automatically.
//
// This replaces scattered:
//   loadRecords('settlements', factory.id, 200)   ← old
//   saveRecord('employees', record, factory.id)   ← old
//
// With:
//   DataUseCases.load('settlements', factoryId)   ← new
//   DataUseCases.save('employees', record, factoryId, user) ← new
// ─────────────────────────────────────────────────────────────────────────────

import { getDbForFactory }   from '../database/DatabaseFactory';
import type { DbModule, DbRecord, LoadResult, SaveResult, DeleteResult, UpdateResult }
  from '../database/DatabaseFactory';

export type { DbModule, DbRecord };

export class DataUseCases {

  /**
   * Load records for a module from the factory's configured database.
   * Automatically routes to Google Sheets, MySQL, or any future adapter.
   */
  static async load(
    module:    DbModule,
    factoryId: string,
    limit      = 200,
  ): Promise<LoadResult> {
    const adapter = getDbForFactory(factoryId);
    if (!adapter.isConfigured()) {
      return { ok: false, records: [], error: `${adapter.name} is not configured for factory "${factoryId}"` };
    }
    return adapter.load(module, factoryId, limit);
  }

  /**
   * Save a new record to the factory's configured database.
   */
  static async save(
    module:    DbModule,
    record:    Record<string, unknown>,
    factoryId: string,
    savedBy:   string,
  ): Promise<SaveResult> {
    const adapter = getDbForFactory(factoryId);
    if (!adapter.isConfigured()) {
      return { ok: false, error: `${adapter.name} is not configured for factory "${factoryId}"` };
    }
    return adapter.save(module, record, factoryId, savedBy);
  }

  /**
   * Update an existing record in-place.
   */
  static async update(
    module:    DbModule,
    id:        string,
    record:    Record<string, unknown>,
    factoryId: string,
    savedBy:   string,
  ): Promise<UpdateResult> {
    const adapter = getDbForFactory(factoryId);
    if (!adapter.isConfigured()) {
      return { ok: false, error: `${adapter.name} is not configured for factory "${factoryId}"` };
    }
    return adapter.update(module, id, record, factoryId, savedBy);
  }

  /**
   * Delete a record by ID.
   */
  static async delete(
    module:    DbModule,
    id:        string,
    factoryId: string,
  ): Promise<DeleteResult> {
    const adapter = getDbForFactory(factoryId);
    if (!adapter.isConfigured()) {
      return { ok: false, error: `${adapter.name} is not configured` };
    }
    return adapter.delete(module, id, factoryId);
  }

  /**
   * Check if the database for a factory is configured and reachable.
   */
  static isConfigured(factoryId: string): boolean {
    return getDbForFactory(factoryId).isConfigured();
  }

  /**
   * Get the adapter name for display ("Google Sheets", "MySQL REST API", etc.)
   */
  static adapterName(factoryId: string): string {
    return getDbForFactory(factoryId).name;
  }
}
