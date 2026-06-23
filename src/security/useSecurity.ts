// ─────────────────────────────────────────────────────────────────────────────
// useSecurity — React hook for the security layer
// src/security/useSecurity.ts
//
// The only security import components need.
// Replaces all scattered: user.role ===, canAccess(user,...), isSuperAdmin etc.
//
// USAGE in any component:
//   const security = useSecurity();
//
//   // Module guard (redirect)
//   if (!security.module('settlement').allowed) return <AccessDenied />;
//
//   // Action guard (show/hide button)
//   {security.canDelete && <DeleteButton />}
//
//   // Role check
//   {security.isAdmin && <AdminPanel />}
//
//   // Reason string for error messages
//   const result = security.module('database');
//   if (!result.allowed) console.warn(result.reason);
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useAuth }         from '../context/AuthContext';
import { SecurityGuard }   from './SecurityGuard';
import type { ModuleId, ActionType } from './SecurityPolicy';

export interface UseSecurityReturn {
  /** Check module access — returns { allowed, reason? } */
  module:   (id: ModuleId | string) => ReturnType<SecurityGuard['canAccessModule']>;
  /** Check action permission — returns { allowed, reason? } */
  action:   (type: ActionType) => ReturnType<SecurityGuard['canPerformAction']>;
  /** Check factory access — returns { allowed, reason? } */
  factory:  (factoryId: string) => ReturnType<SecurityGuard['canAccessFactory']>;

  // Shorthand booleans for common JSX conditions
  canSave:               boolean;
  canUpdate:             boolean;
  canDelete:             boolean;
  canExport:             boolean;
  canViewDatabaseAdmin:  boolean;
  canEditFactoryConfig:  boolean;
  isAdmin:               boolean;
  isSuperAdmin:          boolean;
  isManager:             boolean;

  /** The full guard instance — for advanced / non-standard checks */
  guard: SecurityGuard;
}

export function useSecurity(): UseSecurityReturn {
  const { user } = useAuth();
  const guard = useMemo(() => SecurityGuard.from(user), [user]);

  return useMemo(() => ({
    module:  (id: ModuleId | string) => guard.canAccessModule(id),
    action:  (type: ActionType)      => guard.canPerformAction(type),
    factory: (factoryId: string)     => guard.canAccessFactory(factoryId),

    canSave:               guard.canSave().allowed,
    canUpdate:             guard.canUpdate().allowed,
    canDelete:             guard.canDelete().allowed,
    canExport:             guard.canExport().allowed,
    canViewDatabaseAdmin:  guard.canViewDatabaseAdmin().allowed,
    canEditFactoryConfig:  guard.canEditFactoryConfig().allowed,
    isAdmin:               guard.isAdmin(),
    isSuperAdmin:          guard.isSuperAdmin(),
    isManager:             guard.isManager(),

    guard,
  }), [guard]);
}
