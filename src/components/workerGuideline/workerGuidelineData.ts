// ─────────────────────────────────────────────────────────────────────────────
// WORKER GUIDELINE DATA — helpers only (types + getActiveTopics)
//
// All factory HR data (salary, leave, working hours, notice periods,
// environment targets) now lives inside each factory file under the
// `workerGuidelineConfig` field. This file is kept for:
//
//   getActiveTopics(factory) — which of the 32 topics to show
//
// To get HR config in a component, use: factory.workerGuidelineConfig
// ─────────────────────────────────────────────────────────────────────────────

import type { FactoryConfig } from '../../factories/FactoryRegistry';

/**
 * Returns the set of active topic numbers (1–32) for a factory.
 * If the factory defines workerGuidelineTopics, only those are shown.
 * If undefined, all 32 topics are shown (default).
 */
export function getActiveTopics(factory: FactoryConfig): Set<number> {
  if (factory.workerGuidelineTopics) {
    return new Set(factory.workerGuidelineTopics);
  }
  return new Set(Array.from({ length: 32 }, (_, i) => i + 1));
}
