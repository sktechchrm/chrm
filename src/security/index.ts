// ─────────────────────────────────────────────────────────────────────────────
// src/security/index.ts — Public API of the security layer
//
// Components import from here — never from the individual files directly.
//
//   import { useSecurity, RouteGuard } from '../security';
// ─────────────────────────────────────────────────────────────────────────────

export { useSecurity }                       from './useSecurity';
export { SecurityGuard }                     from './SecurityGuard';
export { default as RouteGuard }             from './RouteGuard';
export {
  MODULE_MIN_ROLE,
  ACTION_MIN_ROLE,
  ADMIN_POLICIES,
  hasMinRole,
  canAccessFactory,
}                                            from './SecurityPolicy';
export type { ModuleId, ActionType }         from './SecurityPolicy';
export type { GuardResult }                  from './SecurityGuard';
export type { UseSecurityReturn }            from './useSecurity';
