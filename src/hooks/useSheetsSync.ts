// ─────────────────────────────────────────────────────────────────────────────
// useSheetsSync — BACKWARD COMPATIBILITY WRAPPER
//
// All existing modules import useSheetsSync. This file keeps those imports
// working without any changes to existing components, while internally
// delegating to the new useDatabase hook (which is adapter-agnostic).
//
// New code should import useDatabase directly from '../hooks/useDatabase'.
// ─────────────────────────────────────────────────────────────────────────────

export { useDatabase as useSheetsSync } from './useDatabase';
export type { UseDatabase as UseSheetsSync } from './useDatabase';
