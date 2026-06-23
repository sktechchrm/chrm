// ─────────────────────────────────────────────────────────────────────────────
// SECURITY GUARD
// src/security/SecurityGuard.ts
//
// The enforcer. Every permission check in the app must go through here.
// Never check user.role directly in a component — call a guard function.
//
// USAGE:
//   import { SecurityGuard } from '../security/SecurityGuard';
//
//   // In a component:
//   const guard = SecurityGuard.from(user);
//   if (!guard.canAccessModule('settlement')) return <AccessDenied />;
//   if (!guard.canDelete()) return null; // hide delete button
//
// RESULT object always has: { allowed: boolean, reason?: string }
// This lets you show meaningful error messages, not just blank screens.
// ─────────────────────────────────────────────────────────────────────────────

import type { AppUser, UserRole } from '../auth/users';
import {
  MODULE_MIN_ROLE,
  ACTION_MIN_ROLE,
  ADMIN_POLICIES,
  canAccessFactory,
  hasMinRole,
  type ModuleId,
  type ActionType,
} from './SecurityPolicy';

// ── Result type ───────────────────────────────────────────────────────────────

export interface GuardResult {
  allowed: boolean;
  reason?: string;
}

const ALLOW: GuardResult = { allowed: true };
const deny  = (reason: string): GuardResult => ({ allowed: false, reason });

// ── Safe user type (password excluded) ───────────────────────────────────────

type SafeUser = Omit<AppUser, 'password'>;

// ── SecurityGuard class ───────────────────────────────────────────────────────

export class SecurityGuard {
  private readonly user: SafeUser;

  private constructor(user: SafeUser) {
    this.user = user;
  }

  /** Create a guard for the currently authenticated user */
  static from(user: SafeUser | null): SecurityGuard {
    if (!user) {
      // Return a guard that denies everything — unauthenticated
      return new SecurityGuard({
        id: '', email: '', name: '', role: 'viewer',
        factoryId: '', factoryName: '', designation: '',
        allowedModules: [], accessibleFactoryIds: [],
        sessionDuration: 60,
      });
    }
    return new SecurityGuard(user);
  }

  /** The user's role */
  get role(): UserRole { return this.user.role; }

  /** The user's home factory */
  get factoryId(): string { return this.user.factoryId; }

  // ── Module access ─────────────────────────────────────────────────────────

  /**
   * Can the user access this module?
   * Checks BOTH the role minimum AND the user's allowedModules list.
   */
  canAccessModule(moduleId: ModuleId | string): GuardResult {
    if (!this.user.id) return deny('Not authenticated');

    // Check role minimum for this module
    const minRole = MODULE_MIN_ROLE[moduleId as ModuleId];
    if (minRole && !hasMinRole(this.user.role, minRole)) {
      return deny(`Requires ${minRole} role or above`);
    }

    // Check allowedModules list on the user
    if (this.user.allowedModules !== '*') {
      if (!(this.user.allowedModules as string[]).includes(moduleId)) {
        return deny(`Module "${moduleId}" not in your allowed modules list`);
      }
    }

    return ALLOW;
  }

  // ── Action permissions ────────────────────────────────────────────────────

  /** Can the user perform this action (save, update, delete, export)? */
  canPerformAction(action: ActionType): GuardResult {
    if (!this.user.id) return deny('Not authenticated');
    const minRole = ACTION_MIN_ROLE[action];
    if (!hasMinRole(this.user.role, minRole)) {
      return deny(`"${action}" requires ${minRole} role or above. You are ${this.user.role}.`);
    }
    return ALLOW;
  }

  /** Shorthand: can the user save records? */
  canSave():   GuardResult { return this.canPerformAction('save');   }
  /** Shorthand: can the user update records? */
  canUpdate(): GuardResult { return this.canPerformAction('update'); }
  /** Shorthand: can the user delete records? */
  canDelete(): GuardResult { return this.canPerformAction('delete'); }
  /** Shorthand: can the user export data? */
  canExport(): GuardResult { return this.canPerformAction('export'); }

  // ── Admin checks ──────────────────────────────────────────────────────────

  /** Can the user view the Database Admin panel? */
  canViewDatabaseAdmin(): GuardResult {
    if (!ADMIN_POLICIES.canViewDatabaseAdmin(this.user.role)) {
      return deny('Database admin requires admin role or above');
    }
    return ALLOW;
  }

  /** Can the user edit factory database config? */
  canEditFactoryConfig(): GuardResult {
    if (!ADMIN_POLICIES.canEditFactoryConfig(this.user.role)) {
      return deny('Factory config editing requires superadmin role');
    }
    return ALLOW;
  }

  /** Can the user view all factories' data? */
  canViewAllFactories(): GuardResult {
    if (!ADMIN_POLICIES.canViewAllFactories(this.user.role)) {
      return deny('Viewing all factories requires admin role or above');
    }
    return ALLOW;
  }

  // ── Factory access ────────────────────────────────────────────────────────

  /** Can the user access data from the given factory? */
  canAccessFactory(targetFactoryId: string): GuardResult {
    const allowed = canAccessFactory(
      this.user.role,
      this.user.factoryId,
      this.user.accessibleFactoryIds,
      targetFactoryId,
    );
    if (!allowed) return deny(`You do not have access to factory "${targetFactoryId}"`);
    return ALLOW;
  }

  // ── Convenience boolean checks (for JSX conditions) ───────────────────────

  /** Boolean: is the user at least the given role? */
  isAtLeast(role: UserRole): boolean {
    return hasMinRole(this.user.role, role);
  }

  isSuperAdmin(): boolean { return this.user.role === 'superadmin'; }
  isAdmin():      boolean { return this.isAtLeast('admin'); }
  isManager():    boolean { return this.isAtLeast('manager'); }
}
