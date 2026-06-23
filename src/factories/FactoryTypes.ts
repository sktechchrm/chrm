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
export interface FactoryAuthorities {
  factoryHead: {
    name: string; nameEn: string;
    designation: string; designationEn: string;
  };
  hrManager: {
    name: string; nameEn: string;
    designation: string; designationEn: string;
  };
  hoHrHead: {
    name: string; nameEn: string;
    designation: string; designationEn: string;
  };
  headOfOperations: {
    name: string; nameEn: string;
    designation: string; designationEn: string;
  };
}

// ── Full factory definition ───────────────────────────────────────────────────

/**
 * Complete, self-contained factory definition.
 * Each factory file exports exactly one object of this type.
 */

// ── Worker Guideline HR config types ──────────────────────────────────────────

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
   * Use when different factories are served by different Apps Script deployments
   * (e.g. different Google accounts, separate GCP projects, isolated scripts).
   * Example: 'https://script.google.com/macros/s/FACTORY_SPECIFIC_ID/exec'
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

export interface FactoryConfig {
  /** Unique key — must match factoryId in users.ts */
  id:        string;
  nameEn:    string;
  nameBn:    string;
  addressEn: string;
  addressBn: string;
  /** true = live factory; false = future / placeholder */
  active:    boolean;
  /** Google Spreadsheet ID for this factory (kept for backward compat) */
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
   * Sub-factory users can only access their own factory's data.
   *
   * Example:
   *   MG_SHIRTEX   → parentFactoryId: undefined  (top-level parent)
   *   MG_FASHION   → parentFactoryId: 'mg_shirtex'  (sub-factory of MG SHIRTEX)
   *   MG_APPARELS  → parentFactoryId: 'mg_shirtex'  (sub-factory of MG SHIRTEX)
   */
  parentFactoryId?: string;
  /** Authorities for HR documents (increment bills, settlements, etc.) */
  authorities:        FactoryAuthorities;
  /** Bengali authorities for meeting minutes signature blocks */
  meetingAuthorities: MeetingAuthority[];
  /** Committees for the meeting minutes module */
  committees:         Committee[];
  /**
   * Factory profile for the Worker Guideline page (section 1 — কারখানা পরিচিতি).
   * Also the single source for welfareOfficers and hotlines shown in section 17 & footer.
   */
  workerProfile: WorkerProfile;
  /**
   * Which of the 32 induction topics this factory uses.
   * undefined  → all 32 topics shown (default — MG Shirtex style)
   * number[]   → only the listed topic numbers shown (e.g. [1,2,4,...] for 23 topics)
   */
  /**
   * HR config for the Worker Guideline page:
   * salary structure, leave entitlements, working hours, overtime formula, etc.
   */
  workerGuidelineConfig: WorkerGuidelineConfig;
  /**
   * Which of the 32 induction topics this factory uses.
   * undefined  → all 32 topics shown (default — MG Shirtex style)
   * number[]   → only the listed topic numbers shown (e.g. [1,2,4,...] for 23 topics)
   */
  workerGuidelineTopics?: number[];
}