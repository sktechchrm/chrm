// SHARED FORMULA UTILITIES
// Single source of truth — replaces duplicates in FinalSettlementFormula.ts and MaternityBenefitTypes.ts
//
// INTENTIONAL DIVISOR DIFFERENCE (not a bug):
//   CALENDAR_MONTH_DAYS = 30  — Final Settlement (calendar days, BLA termination provisions)
//   WORKING_DAYS_PER_MONTH = 26 — Maternity Benefit (working days, BLA maternity provisions)
//
// The two modules intentionally use different legal bases for computing daily wage.

export const CALENDAR_MONTH_DAYS = 30;
export const WORKING_DAYS_PER_MONTH = 26;

export const SALARY_MONTH_DAYS: Record<string, number | ((year: number) => number)> = {
  "জানুয়ারি":  31,
  "ফেব্রুয়ারি": (year: number) =>
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
  "মার্চ":      31,
  "এপ্রিল":     30,
  "মে":         31,
  "জুন":        30,
  "জুলাই":      31,
  "আগস্ট":      31,
  "সেপ্টেম্বর": 30,
  "অক্টোবর":   31,
  "নভেম্বর":   30,
  "ডিসেম্বর":  31,
};

export function SALARY_MONTHLY_DAYS(month: string, year: number): number {
  const value = SALARY_MONTH_DAYS[month];
  if (!value) return 30;
  return typeof value === "function" ? value(year) : value;
}

/**
 * Calculates service duration between two ISO date strings.
 * Defensive: returns all-zero on partial, invalid, or reversed dates.
 * Replaces calculateServiceDuration() in FinalSettlementFormula.ts
 * and MaternityFormula.calculateServiceDuration() in MaternityFormula.ts
 *
 * @param startDate - Joining date (YYYY-MM-DD)
 * @param endDate   - Last attendance / delivery date (YYYY-MM-DD)
 */
export function calculateServiceDuration(
  startDate: string,
  endDate: string,
): { years: number; months: number; days: number } {
  if (!startDate || !endDate) return { years: 0, months: 0, days: 0 };
  const sp = startDate.split("-");
  const ep = endDate.split("-");
  if (sp.length !== 3 || sp.some(p => !p) || ep.length !== 3 || ep.some(p => !p)) {
    return { years: 0, months: 0, days: 0 };
  }
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { years: 0, months: 0, days: 0 };
  }
  let years  = end.getFullYear() - start.getFullYear();
  let months = end.getMonth()    - start.getMonth();
  let days   = end.getDate()     - start.getDate();
  if (days < 0) { months--; const p = new Date(end.getFullYear(), end.getMonth(), 0); days += p.getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

export const STATIC_DATAA = {

  bengaliMonths: [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ],
  en_years: Array.from(
    { length: 2026 - 2019 + 1 },
    (_, i) => String(2019+ i)
  ),
  // benefitInstallments: [
  //   { value: 'প্রথম কিস্তি', label: 'প্রথম কিস্তি' },
  //   { value: 'দ্বিতীয় কিস্তি', label: 'দ্বিতীয় কিস্তি' },
  // ],
  benefitTypes: [
    { value: 'দিন', label: 'দিন' },
    { value: 'টাকা', label: 'টাকা' },
  ],
};