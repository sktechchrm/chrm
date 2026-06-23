// ─────────────────────────────────────────────────────────────────────────────
// DATABASE INTERFACE — The universal contract.
//
// Every database adapter (Google Sheets, MySQL, PostgreSQL, Firebase, etc.)
// MUST implement this interface. React components and hooks only ever talk
// to this interface — never to a concrete adapter directly.
//
// To add a new database backend:
//   1. Create src/database/adapters/YourAdapter.ts
//   2. Implement IDatabaseAdapter
//   3. Register it in src/database/DatabaseFactory.ts
//   4. Set VITE_DB_ADAPTER=your_key in .env
//   That's it. Zero changes to any component or hook.
// ─────────────────────────────────────────────────────────────────────────────

// ── Module names (sheet tabs / SQL tables / collection names) ─────────────────

export type DbModule =
  | 'settlements'
  | 'maternity'
  | 'leftnotice'
  | 'employees'
  | 'requisitions'
  | 'increments'
  | 'meetings';

// ── Shared record shape ───────────────────────────────────────────────────────

export interface DbRecord {
  id:        string;
  savedAt:   string;
  savedBy:   string;
  factoryId: string;
  [key: string]: string | number | boolean;
}

// ── Operation result types ────────────────────────────────────────────────────

export interface SaveResult {
  ok:       boolean;
  id?:      string;
  savedAt?: string;
  error?:   string;
}

export interface LoadResult {
  ok:      boolean;
  records: DbRecord[];
  count?:  number;
  error?:  string;
}

export interface DeleteResult {
  ok:     boolean;
  error?: string;
}

export interface UpdateResult {
  ok:       boolean;
  id?:      string;
  savedAt?: string;
  error?:   string;
}

export interface StatsResult {
  ok:     boolean;
  stats:  Record<DbModule, number>;
  error?: string;
}

export interface ConnectionStatus {
  connected:   boolean;
  adapterName: string;
  adapterKey:  string;
  latencyMs?:  number;
  error?:      string;
}

// ── The interface every adapter must implement ────────────────────────────────

export interface IDatabaseAdapter {
  /**
   * Human-readable name shown in the admin panel.
   * e.g. "Google Sheets", "MySQL REST API"
   */
  readonly name: string;

  /**
   * Short key used in VITE_DB_ADAPTER env var.
   * e.g. "sheets", "mysql", "firebase"
   */
  readonly key: string;

  /**
   * Returns true when this adapter has all required config to function.
   * Used to show warnings in the admin panel.
   */
  isConfigured(): boolean;

  /**
   * Ping the backend and return connection health.
   * Called by the DatabaseAdmin panel.
   */
  ping(): Promise<ConnectionStatus>;

  /**
   * Save a new record to the given module.
   */
  save(
    module:    DbModule,
    record:    Record<string, unknown>,
    factoryId: string,
    savedBy:   string,
  ): Promise<SaveResult>;

  /**
   * Load records for a module, optionally filtered by factory.
   * Pass factoryId='all' to skip filtering.
   */
  load(
    module:    DbModule,
    factoryId: string,
    limit?:    number,
  ): Promise<LoadResult>;

  /**
   * Update an existing record in-place by its ID.
   * Adapters that don't support in-place update may fall back to delete+save.
   */
  update(
    module:    DbModule,
    id:        string,
    record:    Record<string, unknown>,
    factoryId: string,
    savedBy:   string,
  ): Promise<UpdateResult>;

  /**
   * Delete a record by ID.
   */
  delete(
    module:    DbModule,
    id:        string,
    factoryId: string,
  ): Promise<DeleteResult>;

  /**
   * Get record counts per module for a given factory.
   * Used by the Dashboard stats panel.
   */
  stats(factoryId: string): Promise<StatsResult>;
}
