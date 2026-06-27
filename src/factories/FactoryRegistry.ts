// ─────────────────────────────────────────────────────────────────────────────
// FACTORY REGISTRY — Central hub that assembles all individual factory files.
//
// HOW TO ADD A NEW FACTORY:
//   1. Create src/factories/YourFactory.ts following the same structure as
//      MgShirtex.ts (copy it, update all values, set active: true)
//   2. Import and add it to FACTORY_REGISTRY below — that's it.
//      Every module in the app picks it up automatically.
//   3. Add users for that factory in src/auth/users.ts
//
// SECURITY: getFactoryById() always returns a valid factory — it falls back
// to PRIMARY_FACTORY if the id is unknown, preventing data leakage.
// ─────────────────────────────────────────────────────────────────────────────

export type { FactoryConfig, FactoryAuthorities, WorkerProfile, WelfareOfficer, HotLine, Committee, CommitteeMember, MeetingAuthority, WorkerGuideline, WorkerGuidelineConfig, SalaryBreakdown, LeaveInfo } from './FactoryTypes';

// ── Import every factory file ─────────────────────────────────────────────────
import { MG_SHIRTEX  } from './MgShirtex';
import { MOHAMMADI   } from './Mohammadi';
import { MG_FASHION  } from './MgFashion';
import { MG_APPARELS } from './MgApparels';

import type { FactoryConfig } from './FactoryTypes';

// ── Master registry ───────────────────────────────────────────────────────────

/**
 * All factories — active and inactive.
 * Order matters: the first active factory becomes PRIMARY_FACTORY.
 */
export const FACTORY_REGISTRY: FactoryConfig[] = [
  MG_SHIRTEX,    // active: true
  MOHAMMADI,     // active: false
  MG_FASHION,    // active: false
  MG_APPARELS,   // active: true
];

// ── Derived lookups ───────────────────────────────────────────────────────────

/** First active factory — used as the application default */
export const PRIMARY_FACTORY: FactoryConfig =
  FACTORY_REGISTRY.find(f => f.active) ?? FACTORY_REGISTRY[0];

/**
 * Resolves a factory by its id.
 * Falls back to PRIMARY_FACTORY if id is not found — never throws,
 * never leaks another factory's data.
 */
export function getFactoryById(id: string): FactoryConfig {
  return FACTORY_REGISTRY.find(f => f.id === id) ?? PRIMARY_FACTORY;
}

export function getFactorySpreadsheetId(
  factoryId: string
): string {

  return getFactoryById(factoryId).spreadsheetId;
}

/**
 * Returns all active factories a user can access based on their home factoryId.
 *
 * Rules:
 *   • If the user's factory has no parentFactoryId (i.e. it IS a parent),
 *     they get that factory PLUS all active sub-factories that list it as parent.
 *   • If the user's factory has a parentFactoryId (i.e. it is a sub-factory),
 *     they get ONLY their own factory — no cross-access.
 *
 * This means: parent users can switch between sub-factories in every module.
 * Sub-factory users see only their own data.
 */
export function getAccessibleFactories(factoryId: string): FactoryConfig[] {
  const home = getFactoryById(factoryId);

  // If this is a sub-factory — access is limited to itself only
  if (home.parentFactoryId) return [home];

  // This is a parent — collect itself + all active sub-factories
  const subs = FACTORY_REGISTRY.filter(
    f => f.active && f.parentFactoryId === home.id
  );
  return [home, ...subs];
}

/** Returns the ids of all factories accessible to the given home factory */
export function getAccessibleFactoryIds(factoryId: string): string[] {
  return getAccessibleFactories(factoryId).map(f => f.id);
}

// ── Meeting module: ALL_FACTORIES ─────────────────────────────────────────────
// Replaces meeting/Index.ts and meeting/Mg.ts entirely.
// The meeting module imports ALL_FACTORIES from here.

import type { Factory } from '../components/meeting/MeetingMinutesTypes';

/** All factories shaped for the meeting minutes module (uses Bengali name/address) */
export const ALL_FACTORIES: Factory[] = FACTORY_REGISTRY.map(f => ({
  id:          f.id,
  name:        f.nameBn,
  address:     f.addressBn,
  authorities: f.meetingAuthorities,
  committees:  f.committees,
}));

// ── Convenience re-exports (backward-compatible, used across the app) ─────────

export const FACTORY          = PRIMARY_FACTORY;
export const FACTORY_ID       = PRIMARY_FACTORY.id;
export const FACTORY_NAME_EN  = PRIMARY_FACTORY.nameEn;
export const FACTORY_NAME_BN  = PRIMARY_FACTORY.nameBn;
export const FACTORY_ADDRESS_EN = PRIMARY_FACTORY.addressEn;
export const FACTORY_ADDRESS_BN = PRIMARY_FACTORY.addressBn;

// ── Login dropdown (active factories only) ────────────────────────────────────

export interface FactoryOption {
  id:        string;
  name:      string;
  nameBn?:   string;
  address:   string;
  addressBn?: string;
  active:    boolean;
}

export const FACTORY_OPTIONS: FactoryOption[] = FACTORY_REGISTRY.map(f => ({
  id:        f.id,
  name:      f.nameEn,
  nameBn:    f.nameBn,
  address:   f.addressEn,
  addressBn: f.addressBn,
  active:    f.active,
}));

export const ACTIVE_FACTORY_OPTIONS = FACTORY_OPTIONS.filter(f => f.active);

// ── Company/address dropdowns (used by module type files' STATIC_DATA) ────────

export const COMPANY_OPTIONS: { label: string; active: boolean }[] = [
  ...FACTORY_REGISTRY.map(f => ({ label: f.nameEn, active: f.active })),
  ...FACTORY_REGISTRY.filter(f => f.active).map(f => ({ label: f.nameBn, active: true })),
];

export const ADDRESS_OPTIONS: string[] = FACTORY_REGISTRY
  .filter(f => f.active)
  .flatMap(f => [f.addressEn, f.addressBn]);

// ── AUTHORITIES removed — use useFactoryAuthorities() hook instead ─────────────
// The old static AUTHORITIES export was computed from PRIMARY_FACTORY at load
// time, so sub-factory users would see the wrong authority names in their
// increment bills. useFactoryAuthorities() in hooks/useFactory.ts returns the
// correct authorities for whichever factory is currently active in the session.
//
// MIGRATION: any file importing AUTHORITIES from here should switch to:
//   import { useFactoryAuthorities } from '../hooks/useFactory';
//   const authorities = useFactoryAuthorities();  // reactive, per-factory