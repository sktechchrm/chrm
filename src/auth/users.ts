// ─────────────────────────────────────────────────────────────────────────────
// AUTH USERS REGISTRY
//
// SECURITY: Passwords are stored as SHA-256(SALT + password) hashes.
// Plaintext passwords are NEVER stored here.
//
// TO ADD A USER:
//   1. Generate the hash: open browser console → import { hashPassword } → await hashPassword('YourPassword')
//   2. Paste the hash in the password field below
//   3. Set the correct factoryId and allowedModules
//
// TO ADD USERS FOR A NEW FACTORY:
//   1. Create/update its factory file in src/factories/
//   2. Add user entries below with the matching factoryId
//
// PRODUCTION PATH:
//   Replace authenticateUser() with a fetch() call to your backend auth API.
//   The AppUser interface stays the same — only the verification method changes.
// ─────────────────────────────────────────────────────────────────────────────

import { getFactoryById, getAccessibleFactoryIds } from '../factories/FactoryRegistry';
import { verifyPassword } from '../utils/passwordUtils';
import type { UserRole, ModuleId } from '../types/domain';

export type { UserRole };

export interface AppUser {
  id:             string;
  email:          string;
  /** SHA-256(SALT + password) — never store plaintext here */
  password:       string;
  name:           string;
  role:           UserRole;
  factoryId:      string;
  factoryName:    string;
  designation:    string;
  /** '*' = all modules; array = explicit list of allowed ModuleId values */
  allowedModules: ModuleId[] | '*';
  accessibleFactoryIds: string[];
  /**
   * How long this user's login session lasts in MINUTES.
   *  0  = never expires (superadmin only — use with caution)
   *  >0 = auto-logout after this many minutes of wall-clock time
   *
   * Recommended values:
   *   superadmin → 480  (8 hours)
   *   admin      → 480  (8 hours)
   *   manager    → 240  (4 hours)
   *   viewer     →  60  (1 hour)
   */
  sessionDuration: number;
}

const factoryName  = (id: string) => getFactoryById(id).nameBn;
const accessibleIds = (id: string) => getAccessibleFactoryIds(id);

// ── User registry ─────────────────────────────────────────────────────────────
export const USERS: AppUser[] = [

  // ── MG SHIRTEX LTD. (parent) — gains access to all active sub-factories ────
  {
    id:                   'usr_001',
    email:                'saiful4job@gmail.com',
    password:             'da92785175dc0eb8b5ed792b9196c617acfc77a38d216d41e71729ebf262e34d',
    name:                 'Saiful Islam',
    role:                 'superadmin',
    factoryId:            'mg_shirtex',
    factoryName:          factoryName('mg_shirtex'),
    designation:          'Manager (HR, Admin & Compliance)',
    allowedModules:       '*',
    accessibleFactoryIds: accessibleIds('mg_shirtex'),
    sessionDuration:      0,  // 0     — superadmin: never expires
  },
  {
    id:                   'usr_002',
    email:                'admin@mgshirtex.com',
    password:             'b3d18bc0d9e73fcdd16ccbcfb2876e388c1065ea537e93e7b0e81d112e273f16',
    name:                 'Admin User',
    role:                 'admin',
    factoryId:            'mg_shirtex',
    factoryName:          factoryName('mg_shirtex'),
    designation:          'HR Administrator',
    allowedModules:       '*',
    accessibleFactoryIds: accessibleIds('mg_shirtex'),
    sessionDuration:      480,  // 480   — admin: 8 hours
  },
  {
    id:                   'usr_003',
    email:                'manager@mgshirtex.com',
    password:             '1b1b70252e6252ecee3ade18d0b47fa44d2a6e1dbd9154e2047e5c6a1c6c5d55',
    name:                 'HR Manager',
    role:                 'manager',
    factoryId:            'mg_shirtex',
    factoryName:          factoryName('mg_shirtex'),
    designation:          'HR Manager',
    allowedModules:       ['maternity', 'settlement', 'leftnotice', 'increment', 'meeting', 'reports'],
    accessibleFactoryIds: accessibleIds('mg_shirtex'),
    sessionDuration:      240,  // 240   — manager: 4 hours
  },
  {
    id:                   'usr_004',
    email:                'saiful@gmail.com',
    password:             'c2812fc7341f3210655abe0b8c9fca79730fd9a8a122ddaa67e673cf429e525a',
    name:                 'Viewer',
    role:                 'viewer',
    factoryId:            'mg_shirtex',
    factoryName:          factoryName('mg_shirtex'),
    designation:          'HR Executive',
    allowedModules:       ['requisition', 'maternity', 'settlement', 'leftnotice', 'increment', 'meeting', 'workerrights', 'workerguideline', 'reports', 'authority'],
    accessibleFactoryIds: accessibleIds('mg_shirtex'),
    sessionDuration:      60,  // 60    — viewer: 1 hour
  },

  // ── MG FASHION LIMITED (sub-factory) ─────────────────────────────────────
  {
    id:                   'usr_201',
    email:                'admin@mgfashion.com',
    password:             'da92785175dc0eb8b5ed792b9196c617acfc77a38d216d41e71729ebf262e34d',
    name:                 'Admin User',
    role:                 'admin',
    factoryId:            'mg_fashion',
    factoryName:          factoryName('mg_fashion'),
    designation:          'HR Administrator',
    allowedModules:       '*',
    accessibleFactoryIds: accessibleIds('mg_fashion'),
    sessionDuration:      480,  // 480   — admin: 8 hours
  },

  // ── MG APPARELS LIMITED (sub-factory) ────────────────────────────────────
  {
    id:                   'usr_301',
    email:                'admin@mgapparels.com',
    password:             'da92785175dc0eb8b5ed792b9196c617acfc77a38d216d41e71729ebf262e34d',
    name:                 'Admin User',
    role:                 'admin',
    factoryId:            'mg_apparels',
    factoryName:          factoryName('mg_apparels'),
    designation:          'HR Administrator',
    allowedModules:       '*',
    accessibleFactoryIds: accessibleIds('mg_apparels'),
    sessionDuration:      480,  // 480   — admin: 8 hours
  },

  // ── THE MOHAMMADI LIMITED ─────────────────────────────────────────────────
  {
    id:                   'usr_101',
    email:                'admin@mohammadi.com',
    password:             'da92785175dc0eb8b5ed792b9196c617acfc77a38d216d41e71729ebf262e34d',
    name:                 'Admin User',
    role:                 'admin',
    factoryId:            'mohammadi',
    factoryName:          factoryName('mohammadi'),
    designation:          'HR Administrator',
    allowedModules:       '*',
    accessibleFactoryIds: accessibleIds('mohammadi'),
    sessionDuration:      480,  // 480   — admin: 8 hours
  },
];

// ── Role display ──────────────────────────────────────────────────────────────
export const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  superadmin: { label: 'Super Admin', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  admin:      { label: 'Admin',       color: '#34d399', bg: 'rgba(52,211,153,0.15)'  },
  manager:    { label: 'Manager',     color: '#60a5fa', bg: 'rgba(96,165,250,0.15)'  },
  viewer:     { label: 'Viewer',      color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

/**
 * Async credential check — compares against SHA-256 hash.
 * Returns the matching AppUser or null.
 */
export async function authenticateUser(email: string, password: string): Promise<AppUser | null> {
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  const ok = await verifyPassword(password, user.password);
  return ok ? user : null;
}

/** @deprecated Use useSecurity().module(id) instead */
export function canAccess(user: Pick<AppUser, 'allowedModules'>, moduleId: string): boolean {
  if (user.allowedModules === '*') return true;
  return (user.allowedModules as string[]).includes(moduleId);
}