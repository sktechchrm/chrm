/* =========================================================
   MaternityFormula.ts
   Path: src/components/maternityBenefit/MaternityFormula.ts

   All calculation logic and business rules for Maternity Benefit.
   Imports from the global types file (src/types/MaternityBenefitTypes.ts)
   which all other modules already reference.
========================================================= */
import { MaternityFormData, MATERNITY_CONSTANTS } from './MaternityBenefitTypes';
import { SALARY_MONTHLY_DAYS, calculateServiceDuration as sharedServiceDuration } from '../../utils/sharedFormulas';

export class MaternityFormula {

  /** Service duration between joining date and expected delivery date. */
  static calculateServiceDuration(joiningDate: string, deliveryDate: string) {
    return sharedServiceDuration(joiningDate, deliveryDate);
  }

  /** Eligibility by service duration only (>= 6 months). */
  static checkEligibility(years: number, months: number): string {
    const totalMonths = (years * 12) + months;
    return totalMonths >= MATERNITY_CONSTANTS.ELIGIBILITY_MONTHS ? 'অধিকারী' : 'অধিকারী নয়';
  }

  /** Eligibility by alive children count only (<= 1 existing child). */
  static checkAliveChildrenEligibility(aliveChildren: number): string {
    return aliveChildren <= MATERNITY_CONSTANTS.ELIGIBILITY_ALIVE_CHILDREN
      ? 'অধিকারী'
      : 'অধিকারী নয়';
  }

  /**
   * Combined eligibility: service >= 6 months AND alive children <= 1.
   * Both must be true for full maternity benefit (ধারা ৪৬).
   */
  static checkCombinedEligibility(years: number, months: number, aliveChildren: number): string {
    const totalMonths = (years * 12) + months;
    const serviceOk   = totalMonths   >= MATERNITY_CONSTANTS.ELIGIBILITY_MONTHS;
    const childrenOk  = aliveChildren <= MATERNITY_CONSTANTS.ELIGIBILITY_ALIVE_CHILDREN;
    return (serviceOk && childrenOk) ? 'অধিকারী' : 'অধিকারী নয়';
  }

  /**
   * Leave end date = start + MATERNITY_LEAVE_DAYS_OFFSET (119).
   * Result is 120 days inclusive (ধারা ৪৭(৩)).
   */
  static calculateLeaveEndDate(startDate: string): string {
    if (!startDate) return '';
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return '';
    start.setDate(start.getDate() + MATERNITY_CONSTANTS.MATERNITY_LEAVE_DAYS_OFFSET);
    return start.toISOString().split('T')[0];
  }

  /** Daily gross = monthly wage ÷ 26 working days. */
  static calculateDailyGross(monthlyWage: string): string {
    const wage = Number(monthlyWage);
    if (!wage) return '0';
    return (wage / MATERNITY_CONSTANTS.MONTHLY_WORKING_DAYS).toFixed(2);
  }

  /** Pre/post delivery benefit = days × daily gross. */
  static calculateBenefitAmount(days: string, dailyGross: string): string {
    return (Number(days) * Number(dailyGross)).toFixed(2);
  }

  /**
   * Earned wage for current month.
   * Uses actual calendar days for the month via SALARY_MONTHLY_DAYS.
   */
  static calculateEarnedWage(
    days: string,
    dailyGross: string,
    month: string,
    year: string,
  ): number {
    const earnedDays     = Number(days      || 0);
    const dailyWage      = Number(dailyGross || 0);
    const yearNum        = parseInt(year)   || new Date().getFullYear();
    const totalMonthDays = SALARY_MONTHLY_DAYS(month, yearNum);
    return earnedDays * ((dailyWage * MATERNITY_CONSTANTS.MONTHLY_WORKING_DAYS) / totalMonthDays);
  }

  /**
   * Other benefits.
   * Type 'টাকা' → flat amount.
   * Type 'দিন'  → days × (monthly wage ÷ 30).
   */
  static calculateOtherBenefits(value: string, type: string, monthlyWage: string): number {
    const numValue  = Number(value || 0);
    if (type === 'টাকা') return numValue;
    const dailyWage = Number(monthlyWage || 0) / MATERNITY_CONSTANTS.TOTAL_MONTHLY_DAYS;
    return numValue * dailyWage;
  }

  /**
   * Total payable — per spec:
   *
   *  benefitInstallment / eligibility  → formula
   *  ──────────────────────────────────────────────────────────────────
   *  'প্রথম কিস্তি'    (অধিকারী)     → 60  × dailyGross + salary + others
   *  'দ্বিতীয় কিস্তি' (অধিকারী)     → 60  × dailyGross only
   *  '১ম+২য় কিস্তি'   (অধিকারী)     → 120 × dailyGross + salary + others
   *  অধিকারী নয়                       → salary + others only
   */
  static calculateTotalPayable(formData: MaternityFormData): string {
    const aliveChildren = parseInt(formData.aliveChildren) || 0;
    const serviceYears  = parseInt(formData.serviceYears)  || 0;
    const serviceMonths = parseInt(formData.serviceMonths) || 0;
    const dailyGross    = Number(formData.dailyGross || 0);

    const isEligible = this.checkCombinedEligibility(serviceYears, serviceMonths, aliveChildren) === 'অধিকারী';

    const salary = this.calculateEarnedWage(formData.earnedLeaveDays, formData.dailyGross, formData.currentMonth, formData.currentYear);
    const others  = this.calculateOtherBenefits(formData.otherBenefitsValue, formData.otherBenefitsType, formData.totalMonthlyWage);

    if (!isEligible) {
      // অধিকারী নয় — salary + others only
      return (salary + others).toFixed(0);
    }

    const inst = formData.benefitInstallment;

    if (inst === 'দ্বিতীয় কিস্তি') {
      // 2nd installment only — 60 × dailyGross
      return (60 * dailyGross).toFixed(2);
    }

    if (inst === '১ম+২য় কিস্তি') {
      // Combined bill — 120 × dailyGross + salary + others
      return (120 * dailyGross + salary + others).toFixed(0);
    }

    // Default: 'প্রথম কিস্তি' — 60 × dailyGross + salary + others
    return (60 * dailyGross + salary + others).toFixed(0);
  }

  /** Year options for dropdowns (current year going back 5). */
  static getYearOptions(count = 5): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: count }, (_, i) => currentYear - i);
  }
}