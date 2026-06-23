// ─────────────────────────────────────────────────────────────────────────────
// SECURITY POLICY
// src/security/SecurityPolicy.ts
//
// THE SINGLE SOURCE OF TRUTH for every permission decision in the app.
//
// Rules:
//   • No component, hook, or page imports from auth/users.ts for permission logic
//   • All permission checks go through this file
//   • Adding a new permission = add one entry here. Nothing else.
//
// Structure:
//   MODULE_PERMISSIONS  — which roles can access each module
//   ACTION_PERMISSIONS  — which roles can perform save / update / delete / export
//   ADMIN_PERMISSIONS   — which roles can access admin features
// ─────────────────────────────────────────────────────────────────────────────

import type { UserRole, ModuleId } from '../types/domain';

// Re-export so consumers can import from security layer
export type { UserRole, ModuleId };

// ── Action types ──────────────────────────────────────────────────────────────

export type ActionType = 'save' | 'update' | 'delete' | 'export' | 'print' | 'view';

// ── Role hierarchy (higher index = more permissions) ─────────────────────────

const ROLE_RANK: Record<UserRole, number> = {
  viewer:     1,
  manager:    2,
  admin:      3,
  superadmin: 4,
};

/** Returns true if the user's role meets or exceeds the required minimum role */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}

// ── Module access policy ──────────────────────────────────────────────────────
// Defines the MINIMUM role required to even see a module.
// allowedModules on the user further restricts this (both must pass).

export const MODULE_MIN_ROLE: Record<ModuleId, UserRole> = {
  dashboard:        'viewer',
  maternity:        'viewer',
  settlement:       'viewer',
  leftnotice:       'viewer',
  personalfile:     'viewer',
  requisition:      'viewer',
  increment:        'viewer',
  meeting:          'viewer',
  workerrights:     'viewer',
  workerguideline:  'viewer',
  reports:          'viewer',
  authority:        'manager',   // managers and above only
  database:         'admin',     // admins and above only
  grievance:        'viewer',    // all authenticated users can submit; management tab is self-gated
};

// ── Action permissions ────────────────────────────────────────────────────────
// Defines which roles can perform each action across ALL modules.
// Use canPerformAction() for module-specific overrides if needed.

export const ACTION_MIN_ROLE: Record<ActionType, UserRole> = {
  view:   'viewer',
  print:  'viewer',
  export: 'viewer',
  save:   'viewer',    // any role can save (module access controls who gets in)
  update: 'viewer',    // same — role + module access is the gate
  delete: 'manager',   // only managers and above can delete records
};

// ── Admin permissions ─────────────────────────────────────────────────────────

export const ADMIN_POLICIES = {
  /** Can see the Database Admin panel */
  canViewDatabaseAdmin:   (role: UserRole) => hasMinRole(role, 'admin'),
  /** Can modify factory db config */
  canEditFactoryConfig:   (role: UserRole) => hasMinRole(role, 'superadmin'),
  /** Can see all factories' data (not just their own) */
  canViewAllFactories:    (role: UserRole) => hasMinRole(role, 'admin'),
  /** Can manage user accounts (future) */
  canManageUsers:         (role: UserRole) => hasMinRole(role, 'superadmin'),
} as const;

// ── Cross-factory access ──────────────────────────────────────────────────────

/**
 * Returns true if the user is allowed to view data from factoryId.
 * - superadmin/admin can see all factories in their accessibleFactoryIds
 * - manager/viewer can only see their own factory
 */
export function canAccessFactory(
  userRole: UserRole,
  userFactoryId: string,
  accessibleFactoryIds: string[],
  targetFactoryId: string,
): boolean {
  if (!accessibleFactoryIds.includes(targetFactoryId)) return false;
  if (hasMinRole(userRole, 'admin')) return true;
  return userFactoryId === targetFactoryId;
}
