// ─────────────────────────────────────────────────────────────────────────────
// src/types/domain.ts — Shared domain types
//
// Placed here to avoid circular imports between:
//   auth/users.ts ↔ security/SecurityPolicy.ts
//
// Both files import from here. Neither imports from the other for types.
// ─────────────────────────────────────────────────────────────────────────────

/** All user roles in the system — ordered from least to most privileged */
export type UserRole = 'viewer' | 'manager' | 'admin' | 'superadmin';

/** All module IDs in the app */
export type ModuleId =
  | 'dashboard'
  | 'maternity'
  | 'settlement'
  | 'leftnotice'
  | 'personalfile'
  | 'requisition'
  | 'increment'
  | 'meeting'
  | 'workerrights'
  | 'workerguideline'
  | 'reports'
  | 'authority'
  | 'database'
  | 'grievance';
