// ─────────────────────────────────────────────────────────────────────────────
// src/config/factory.ts — Re-export wrapper (backward compatibility)
//
// All real data and logic now lives in:
//   src/factories/FactoryRegistry.ts  ← the hub
//   src/factories/MgShirtex.ts        ← MG SHIRTEX LTD. data
//   src/factories/Mohammadi.ts        ← THE MOHAMMADI LIMITED (demo)
//   src/factories/MgFashion.ts        ← MG FASHION LIMITED (demo)
//   src/factories/MgApparels.ts       ← MG APPARELS LIMITED (demo)
//
// This file exists so all existing imports across the project
// (from '../config/factory') continue to work without changes.
// ─────────────────────────────────────────────────────────────────────────────

export type {
  FactoryConfig,
  FactoryAuthorities,
  Committee,
  CommitteeMember,
  MeetingAuthority,
  FactoryOption,
} from '../factories/FactoryRegistry';

export {
  FACTORY_REGISTRY,
  PRIMARY_FACTORY,
  FACTORY,
  getFactoryById,
  getFactorySpreadsheetId,
  ALL_FACTORIES,
  FACTORY_ID,
  FACTORY_NAME_EN,
  FACTORY_NAME_BN,
  FACTORY_ADDRESS_EN,
  FACTORY_ADDRESS_BN,
  FACTORY_OPTIONS,
  ACTIVE_FACTORY_OPTIONS,
  COMPANY_OPTIONS,
  ADDRESS_OPTIONS,
} from '../factories/FactoryRegistry';
