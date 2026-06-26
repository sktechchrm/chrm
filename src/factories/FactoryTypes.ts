// ─────────────────────────────────────────────────────────────────────────────
// FACTORY TYPES — Shared interfaces used by every factory file and the registry.
//
// Committee, CommitteeMember, Gender, and Authority are imported from
// MeetingMinutesTypes so there is only one definition across the whole project.
// ─────────────────────────────────────────────────────────────────────────────

// ── ALL imports first ─────────────────────────────────────────────────────────
import type {
  Committee,
  CommitteeMember,
  Gender,
  Authority,
} from '../components/meeting/MeetingMinutesTypes';

// ── Re-export meeting types so factory files only need to import from here ────
export type { Committee, CommitteeMember, Gender, Authority };

// Authority is also exported as MeetingAuthority — keeps factory files readable
export type MeetingAuthority = Authority;

// ── Worker guideline supporting types ────────────────────────────────────────

export interface WelfareOfficer {
  name:        string;
  designation: string;
}

export interface HotLine {
  label:  string;
  number: string;
}

/**
 * Factory profile data used by the Worker Guideline page (section 1 — কারখানা পরিচিতি).
 * Lives here so that welfareOfficers and hotlines have a single source of truth
 * (the factory file), exactly like authorities and committees.
 *
 * NOTE: totalFloors, totalWorkers, totalShifts, totalSewingLines, totalBathrooms,
 * dailyProduction, monthlyProduction, yearlyProduction are kept as `number` so
 * that WorkerGuidelinePage and WorkerGuidelineViewer can call .toLocaleString()
 * on them without changes. The Bengali string representations (e.g. '১,১৯৭')
 * live in the factory file's workerProfile values as formatted numbers.
 */
export interface WorkerProfile {
  establishedYear:   string;
  totalFloors:       number;
  totalWorkers:      number;
  totalShifts:       number;
  totalSewingLines:  number;
  totalBathrooms:    number;
  dailyProduction:   number;
  monthlyProduction: number;
  yearlyProduction:  number;
  welfareOfficers:   WelfareOfficer[];
  hotlines:          HotLine[];
  buyers:            string[];
  productTypes:      string[];
  sections:          string[];
}

// ── HR document authorities (English + Bengali) ───────────────────────────────

/**
 * Authority person shape — used for every role in FactoryAuthorities.
 * email and phone are optional so existing factory files without them still
 * compile. Fill them in per-factory as needed.
 */
export interface AuthorityPerson {
  name:          string;
  nameEn:        string;
  designation:   string;
  designationEn: string;
  email?:        string;
  phone?:        string;
}

export interface FactoryAuthorities {
  /** NEW — Group chairman (required by new file; optional here for backward compat) */
  honorableChairman?: AuthorityPerson;
  /** NEW — Managing director (required by new file; optional here for backward compat) */
  honorableMD?:       AuthorityPerson;
  factoryHead:        AuthorityPerson;
  hrManager:          AuthorityPerson;
  hoHrHead:           AuthorityPerson;
  headOfOperations:   AuthorityPerson;
}

// ── Worker Guideline HR policy data ──────────────────────────────────────────

export interface SalaryBreakdown {
  basicSalary:      number;
  houseRent:        number;
  medicalAllowance: number;
  transport:        number;
  foodAllowance:    number;
  total:            number;
}

export interface LeaveInfo {
  casualLeave:    number;
  sickLeave:      number;
  annualLeave:    number;
  festivalLeave:  number;
  maternityLeave: number;
  hajjLeave:      number;
}

/**
 * NEW interface — replaces WorkerGuidelineConfig.
 * Key differences from the old interface:
 *   • workingHoursPerDay / maxOvertimeHours / salaryPaymentDays are now string
 *     (allows Bengali numerals like '৮', '২', '৭' directly from the factory file)
 *   • probationMonths split into probationMonthsSkill + probationMonthsUnSkill
 *   • noticePeriodDays split into noticePeriodDaysOwner + noticePeriodDaysWorker
 *   • lunchBreakStart / lunchBreakEnd replaced by lunchScheduleOne + lunchScheduleTwo
 *     (supports two lunch shifts)
 */
export interface WorkerGuideline {
  salary:                SalaryBreakdown;
  workingHoursPerDay:    string;
  maxOvertimeHours:      string;
  overtimeFormula:       string;
  probationMonthsSkill:  string;
  probationMonthsUnSkill:string;
  noticePeriodDaysOwner: {
    permanent: number;
    temporary: number;
    other:     number;
  };
  noticePeriodDaysWorker: {
    permanent: number;
    temporary: number;
  };
  leave:              LeaveInfo;
  environmentTargets: {
    ghgReductionPct:   number;
    waterReductionPct: number;
    wasteReductionPct: number;
    targetYear:        number;
  };
  salaryPaymentDays:  string;
  lunchScheduleOne:   string;
  lunchScheduleTwo:   string;
}

/**
 * DEPRECATED — kept so existing factory files (MgFashion, MgApparels, Mohammadi)
 * and consumer components (WorkerGuidelinePage, WorkerGuidelineViewer,
 * WorkerGuidelinePopup) continue to compile without changes.
 *
 * Migration path:
 *   1. Update each factory file to replace `workerGuidelineConfig: WorkerGuidelineConfig`
 *      with `workerGuideline: WorkerGuideline` (new shape).
 *   2. Update WorkerGuidelinePage, WorkerGuidelineViewer, WorkerGuidelinePopup
 *      to read from `factory.workerGuideline` instead of `factory.workerGuidelineConfig`.
 *   3. Once all factory files and components are migrated, remove this interface
 *      and the `workerGuidelineConfig` field from FactoryConfig below.
 */
export interface WorkerGuidelineConfig {
  salary:             SalaryBreakdown;
  workingHoursPerDay: number;
  maxOvertimeHours:   number;
  overtimeFormula:    string;
  probationMonths:    number;
  noticePeriodDays: {
    permanent: number;
    temporary: number;
    other:     number;
  };
  leave:             LeaveInfo;
  environmentTargets: {
    ghgReductionPct:   number;
    waterReductionPct: number;
    wasteReductionPct: number;
    targetYear:        number;
  };
  salaryPaymentDays: number;
  lunchBreakStart:   string;
  lunchBreakEnd:     string;
}

// ── Per-factory database config ───────────────────────────────────────────────

/**
 * Which database adapter this factory uses.
 * Each factory can independently point to a different backend.
 *
 * 'sheets'  → Google Sheets (default, uses spreadsheetId)
 * 'mysql'   → MySQL REST API (uses mysqlApiUrl + mysqlApiKey)
 * 'auto'    → falls back to the global VITE_DB_ADAPTER env var
 */
export type FactoryDbAdapter = 'sheets' | 'mysql' | 'auto';

export interface FactoryDbConfig {
  /** Which adapter to use for this factory */
  adapter: FactoryDbAdapter;

  // ── Google Sheets ──────────────────────────────────────────────────────────
  /** Google Sheets: target spreadsheet ID (required when adapter='sheets') */
  spreadsheetId?: string;
  /**
   * Google Sheets: Apps Script Web App URL for THIS factory.
   * Optional — if omitted, falls back to VITE_SHEETS_URL in .env
   */
  sheetsUrl?: string;
  /**
   * Google Sheets: Apps Script secret key for THIS factory.
   * Optional — if omitted, falls back to VITE_SHEETS_KEY in .env
   */
  sheetsKey?: string;

  // ── MySQL REST API ─────────────────────────────────────────────────────────
  /** MySQL: REST API base URL (e.g. https://api.yourserver.com) */
  mysqlApiUrl?: string;
  /** MySQL: API secret key / Bearer token */
  mysqlApiKey?: string;
}

// ── Full factory definition ───────────────────────────────────────────────────

/**
 * Complete, self-contained factory definition.
 * Each factory file exports exactly one object of this type.
 */
export interface FactoryConfig {
  /** Unique key — must match factoryId in users.ts */
  id:        string;
  nameEn:    string;
  nameBn:    string;
  addressEn: string;
  addressBn: string;
  /** true = live factory; false = future / placeholder */
  active:    boolean;

  /**
   * Google Spreadsheet ID for this factory.
   * Kept for backward compat (FactoryRegistry.getFactorySpreadsheetId reads it).
   * Always keep in sync with db.spreadsheetId.
   */
  spreadsheetId: string;

  /**
   * Per-factory database configuration.
   * If omitted, defaults to { adapter: 'sheets', spreadsheetId: this.spreadsheetId }
   *
   * Example — MG Shirtex uses Google Sheets:
   *   db: { adapter: 'sheets', spreadsheetId: '19vrtzi...' }
   *
   * Example — Mohammadi uses MySQL:
   *   db: { adapter: 'mysql', mysqlApiUrl: 'https://api.mohammadi.com', mysqlApiKey: 'sk_...' }
   */
  db?: FactoryDbConfig;

  /**
   * Optional: if set, this factory is a sub-factory of the given parent id.
   * Users whose factoryId matches the parent automatically get access to all
   * sub-factories and can switch between them in every module.
   *
   * Example:
   *   MG_SHIRTEX  → parentFactoryId: undefined    (top-level parent)
   *   MG_FASHION  → parentFactoryId: 'mg_shirtex' (sub-factory)
   *   MG_APPARELS → parentFactoryId: 'mg_shirtex' (sub-factory)
   */
  parentFactoryId?: string;

  /** Authorities for HR documents (increment bills, settlements, etc.) */
  authorities: FactoryAuthorities;

  /** Bengali authorities for meeting minutes signature blocks */
  meetingAuthorities: MeetingAuthority[];

  /** Committees for the meeting minutes module */
  committees: Committee[];

  /**
   * Factory profile for the Worker Guideline page (section 1 — কারখানা পরিচিতি).
   * Also the single source for welfareOfficers and hotlines shown in section 17 & footer.
   */
  workerProfile: WorkerProfile;

  /**
   * Which of the 32 induction topics this factory uses.
   * undefined  → all 32 topics shown (default — MG Shirtex style)
   * number[]   → only the listed topic numbers shown
   */
  workerGuidelineTopics?: number[];

  /**
   * NEW — HR policy data for the Worker Guideline page (salary, leave, overtime, etc.).
   * Use this field for MG Shirtex and any new factory going forward.
   * Read by getGuidelineConfig() in workerGuidelineData.ts.
   *
   * Replaces workerGuidelineConfig (deprecated below).
   */
  workerGuideline?: WorkerGuideline;

  /**
   * DEPRECATED — use workerGuideline instead.
   * Kept so MgFashion, MgApparels, and Mohammadi factory files continue to
   * compile, and so WorkerGuidelinePage / WorkerGuidelineViewer / WorkerGuidelinePopup
   * continue to work without changes.
   *
   * Migration: update each remaining factory file to the new WorkerGuideline shape,
   * then update the three consumer components, then remove this field.
   */
  workerGuidelineConfig?: WorkerGuidelineConfig;
}