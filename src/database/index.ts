// ─────────────────────────────────────────────────────────────────────────────
// src/database/index.ts — Public API of the database layer
//
// Import everything you need from here:
//   import { db, useDatabase } from '../database';
//
// Never import adapters directly in components or hooks.
// ─────────────────────────────────────────────────────────────────────────────

// The active adapter singleton (resolved from VITE_DB_ADAPTER env var)
export { db, getAllAdapters, getAdapterByKey, getDbForFactory, clearAdapterCache } from './DatabaseFactory';

// All types
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
} from './DatabaseFactory';

// The universal hook — use this in all components
export { useDatabase } from '../hooks/useDatabase';
