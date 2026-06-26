// ─────────────────────────────────────────────────────────────────────────────
// WORKER GUIDELINE DATA — helpers only
//
// All HR policy data (salary, leave, overtime, environment targets) now lives
// in the factory files under `workerGuideline:`.
//
// getGuidelineConfig(id) reads factory.workerGuideline directly.
// One change in MgShirtex.ts (or any factory file) updates every page.
//
// Types re-exported from FactoryTypes so callers have a single import path.
// ─────────────────────────────────────────────────────────────────────────────

import type { FactoryConfig, WorkerGuideline, SalaryBreakdown, LeaveInfo } from '../../factories/FactoryTypes';
import { getFactoryById } from '../../factories/FactoryRegistry';

// Re-export types that page components import from this file
export type { WorkerGuideline, SalaryBreakdown, LeaveInfo };

// WorkerGuidelineConfig is now just WorkerGuideline — keep the alias so
// existing imports of WorkerGuidelineConfig from this file still compile.
export type WorkerGuidelineConfig = WorkerGuideline & { factoryId: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the HR guideline config for a factory.
 * Reads from factory.workerGuideline (new field).
 * Falls back to mg_shirtex if the factory id is unknown.
 *
 * The non-null assertion (!) is safe here: every factory file that uses
 * the Worker Guideline feature must define `workerGuideline`. TypeScript
 * types it as optional only so that older factory files that haven't been
 * migrated yet still compile.
 */
export function getGuidelineConfig(factoryId: string): WorkerGuidelineConfig {
  const factory = getFactoryById(factoryId);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { ...factory.workerGuideline!, factoryId: factory.id };
}

/**
 * Returns the set of active topic numbers (1–36) for a factory.
 *
 * If FactoryConfig has `workerGuidelineTopics` defined, only those numbers
 * are returned (e.g. Mohammadi's 23 topics).
 * If undefined, all 36 are returned (e.g. MG Shirtex).
 */
export function getActiveTopics(factory: FactoryConfig): Set<number> {
  if (factory.workerGuidelineTopics) {
    return new Set(factory.workerGuidelineTopics);
  }
  return new Set(Array.from({ length: 36 }, (_, i) => i + 1));
}