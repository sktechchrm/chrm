import { EmployeeFormData } from "./FinalSettlementDataTypes";
// SALARY_MONTH_DAYS, SALARY_MONTHLY_DAYS, calculateServiceDuration
// moved to shared utility — imported for local use AND re-exported for backward compatibility.
import { SALARY_MONTH_DAYS, SALARY_MONTHLY_DAYS, calculateServiceDuration } from "../../utils/sharedFormulas";
export { SALARY_MONTH_DAYS, SALARY_MONTHLY_DAYS, calculateServiceDuration } from "../../utils/sharedFormulas";

// ─────────────────────────────────────────────────────────────────────────
// Termination-type groupings (Bangladesh Labour Act 2006, as amended)
// Shared by calculateServiceCompensation() and getServiceCompensationDaysPerYear()
// so the two never drift out of sync.
//
// LEGAL NOTE: "বরখাস্ত (২৩)" — plain dismissal under section 23(1)/(2) for
// misconduct or criminal conviction — carries NO statutory day-rate
// compensation under the Act. The 15-days/year rate applies only to
// "অপসারন (২৩.৩)" — removal under extenuating circumstances in lieu of
// dismissal. Please confirm with legal/HR before relying on this for live
// payroll, since it changes the payable amount for "বরখাস্ত (২৩)" cases
// from 15 days/year to ৳0.
// ─────────────────────────────────────────────────────────────────────────

const RESIGNATION_TYPES = [
  "ইস্তফা (২৭)",
  "অনুপস্থিতির কারণে ইস্তফা (২৭)",
];

// LEGAL/CORRECTNESS NOTE: the two death types were previously listed here
// as well as having their own calculateDeathCompensation() — meaning a
// death case was paid BOTH the generic 30-days/year service compensation
// AND the 30/45-days/year death compensation simultaneously. That looked
// like an unintentional double payment, so death types have been removed
// from this list; death cases are now compensated solely via
// calculateDeathCompensation(). Please confirm this matches your intended
// payroll behaviour.
const THIRTY_DAYS_TYPES = [
  "অবসর (২৮)",
  "চাকুরী অবসান (২৬)",
  "ডিসচার্জ (২২)",
  "ছাঁটাই (২০)",
];

// Only removal under extenuating circumstances (s.23(3)) gets 15 days/year.
const FIFTEEN_DAYS_TYPES = [
  "অপসারন (২৩.৩)",
];

// Plain dismissal (s.23), severe-misconduct dismissal (s.23(4) খ/ছ — no
// notice, no compensation), and lay-off (s.16, calculated separately by
// calculateLayOffCompensation — not a per-service-year rate) all get ০.
const ZERO_DAYS_TYPES = [
  "বরখাস্ত (২৩)",
  "বরখাস্ত (২৩.৪: খ/ছ)",
  "লে-অফ (১৬)",
];

// ─────────────────────────────────────────────────────────────────────────
// Gratuity eligibility (Section 2(10))
//
// The Act's "compensation ... or gratuity, whichever is higher" comparison
// applies to retrenchment, discharge, termination by notice, retirement,
// removal under extenuating circumstances, death, and resignation — i.e.
// every separation type EXCEPT:
//   - বরখাস্ত (২৩.৪: খ/ছ) — explicit statutory exclusion (theft, fraud,
//     violence etc.) — no compensation and no gratuity at all.
//   - বরখাস্ত (২৩) — plain dismissal for misconduct/conviction. This is a
//     genuinely disputed area in practice — the Act doesn't explicitly
//     grant gratuity here the way it does for the other categories, so
//     this defaults to NOT eligible. Confirm with legal/HR if your
//     company's policy differs.
//   - লে-অফ (১৬) — uses its own per-lay-off-day formula (s.16(2)), not the
//     years-of-service gratuity model, so the comparison doesn't apply.
// ─────────────────────────────────────────────────────────────────────────
const GRATUITY_NOT_ELIGIBLE_TYPES = [
  "বরখাস্ত (২৩)",
  "বরখাস্ত (২৩.৪: খ/ছ)",
  "লে-অফ (১৬)",
  "",
];

export const isGratuityEligible = (terminationType: string): boolean => {
  return !GRATUITY_NOT_ELIGIBLE_TYPES.includes(terminationType);
};

/**
 * Gratuity rate per year of service (Section 2(10)) — exposed separately so
 * the UI/bill can display "X বছর × Y দিন × Z টাকা" the same way the other
 * compensation breakdowns are shown.
 */
export const getGratuityDaysPerYear = (benefitYears: number): number => {
  if (benefitYears < 1) return 0;
  return benefitYears > 10 ? 45 : 30;
};

/**
 * Calculate gratuity (Section 2(10)).
 * Not less than 30 days' wages (at the last-drawn rate) per completed year
 * of service, or 45 days' wages per year once service exceeds 10 years.
 */
export const calculateGratuity = (benefitYears: number, dailyBasic: number): number => {
  const rate = getGratuityDaysPerYear(benefitYears);
  if (rate === 0) return 0;
  return parseFloat((benefitYears * rate * dailyBasic).toFixed(2));
};

/**
 * Calculate lay-off compensation (Section 16).
 * Unlike other separation types, lay-off compensation is not a multiple of
 * "completed years of service" — it is paid per lay-off day. Per s.16(2),
 * the rate is half of basic wages (+ dearness allowance, not separately
 * tracked in this form) plus the FULL housing allowance, per day.
 */
export const calculateLayOffCompensation = (
  layOffDays: number,
  dailyBasic: number,
  monthlyHouseRent: number
): number => {
  const dailyHouseRent = monthlyHouseRent / 30;
  const perDayRate = (0.5 * dailyBasic) + dailyHouseRent;
  return parseFloat((layOffDays * perDayRate).toFixed(2));
};

/**
 * Calculate total days from months and days minus absent days
 */
export const calculateTotalDays = (months: number, days: number, absentDays: number): number => {
  const total = ((months * 30) + days) - absentDays;
  return Math.max(0, total);
};

/**
 * Calculate benefit years based on service years and total days
 */
export const calculateBenefitYears = (serviceYears: number, totalDays: number): number => {
  let benefit = serviceYears;
  
  if (totalDays >= 365) {
    benefit += 1;
  } else if (totalDays >= 182.5) {
    benefit += 0.5;
  }
  
  return benefit;
};

/**
 * Calculate wage components from total monthly wage
 */
export const calculateWageComponents = (
  totalMonthlyWage: number,
  foodAllowance: number,
  medicalAllowance: number,
  transportAllowance: number
) => {
  if (totalMonthlyWage <= 0) {
    return {
      basicWage: 0,
      houseRent: 0,
      dailyBasic: 0,
      dailyGross: 0,
      hourlyOvertimeRate: 0
    };
  }

  const basic = (totalMonthlyWage - (foodAllowance + medicalAllowance + transportAllowance)) / 1.5;
  const house = basic / 2;
  const dailyBasic = basic / 30;
  const dailyGross = totalMonthlyWage / 30;
  const hourlyOvertimeRate = (basic / 208) * 2;

  return {
    basicWage: parseFloat(basic.toFixed(2)),
    houseRent: parseFloat(house.toFixed(2)),
    dailyBasic: parseFloat(dailyBasic.toFixed(2)),
    dailyGross: parseFloat(dailyGross.toFixed(2)),
    hourlyOvertimeRate: parseFloat(hourlyOvertimeRate.toFixed(2))
  };
};

/**
 * Calculate service compensation based on termination type and benefit years
 * Uses dailyBasic for all calculations
 */
export const calculateServiceCompensation = (
  terminationType: string,
  benefitYears: number,
  dailyBasic: number
): number => {
  let compensation = 0;

  if (RESIGNATION_TYPES.includes(terminationType)) {
    if (benefitYears === 3) {
      compensation = benefitYears * 7 * dailyBasic;
    } else if (benefitYears > 3 && benefitYears < 10) {
      compensation = benefitYears * 15 * dailyBasic;
    } else if (benefitYears >= 10) {
      compensation = benefitYears * 30 * dailyBasic;
    }
  } else if (THIRTY_DAYS_TYPES.includes(terminationType) && benefitYears >= 1) {
    compensation = benefitYears * 30 * dailyBasic;
  } else if (FIFTEEN_DAYS_TYPES.includes(terminationType) && benefitYears >= 1) {
    compensation = benefitYears * 15 * dailyBasic;
  } else if (ZERO_DAYS_TYPES.includes(terminationType)) {
    compensation = 0;
  }

  return parseFloat(compensation.toFixed(2));
};

/**
 * Calculate death compensation based on termination type and benefit years
 * Uses dailyBasic for all calculations
 */
export const calculateDeathCompensation = (
  terminationType: string,
  benefitYears: number,
  dailyBasic: number
): number => {
  let compensation = 0;

  if (terminationType === "চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)" && benefitYears > 1) {
    compensation = benefitYears * 30 * dailyBasic;
  } else if (terminationType === "কর্মরত অবস্থায়/কর্মকালীন দূর্ঘটনার কারণে মৃত্যু (১৯)" && benefitYears > 1) {
    compensation = benefitYears * 45 * dailyBasic;
  }

  return parseFloat(compensation.toFixed(2));
};

/**
 * Calculate earned leave amount
 */
export const calculateEarnedLeave = (elQty: number, dailyGross: number): number => {
  return parseFloat((elQty * dailyGross).toFixed(2));
};

/**
 * Calculate notice pay amount
 */
export const calculateNoticePay = (noticePayDay: number, dailyBasic: number): number => {
  return parseFloat((noticePayDay * dailyBasic).toFixed(2));
};

/**
 * Calculate notice deduction amount
 */
export const calculateNoticeDeduction = (noticeDeductionDay: number, dailyBasic: number): number => {
  return parseFloat((noticeDeductionDay * dailyBasic).toFixed(2));
};

/**
 * Calculate last month payable salary using calendar days
 * Formula: (totalMonthlyWage / calendarDays) * payableDay
 * @param totalMonthlyWage - Total monthly wage (accepts string or number)
 * @param payableDay - Number of payable days (accepts string or number)
 * @param month - Bengali month name
 * @param year - Year (for calendar days calculation)
 * @returns Last month salary amount
 */
export const calculateLastMonthSalary = (
  totalMonthlyWage: string | number,
  payableDay: string | number,
  month: string,
  year: string
): number => {
  const totalMonthlyWageNum = typeof totalMonthlyWage === 'string' ? parseFloat(totalMonthlyWage) || 0 : totalMonthlyWage;
  const payableDayNum = typeof payableDay === 'string' ? parseFloat(payableDay) || 0 : payableDay;
  const yearNum = parseInt(year) || new Date().getFullYear();

  const calendarDays = SALARY_MONTHLY_DAYS(month, yearNum);
  const perDayRate = totalMonthlyWageNum / calendarDays;

  return parseFloat((perDayRate * payableDayNum).toFixed(2));
};

/**
 * Calculate last month overtime
 * Formula: ((monthlyBasic / 208) * 2) * payableHours
 * Uses monthly basic wage, not daily
 * 208 = standard monthly working hours (26 days × 8 hours)
 * × 2 = double rate for overtime as per Bangladesh Labor Act
 */
export const calculateLastMonthOvertime = (monthlyBasic: number, payableHours: number): number => {
  const hourlyOvertimeRate = ((monthlyBasic / 208) * 2);
  return parseFloat((hourlyOvertimeRate * payableHours).toFixed(2));
};

/**
 * Calculate hourly overtime rate
 */
export const calculateHourlyOvertimeRate = (monthlyBasic: number): number => {
  return parseFloat(((monthlyBasic / 208) * 2).toFixed(2));
};

/**
 * Get service compensation days per year based on termination type and benefit years
 */
export const getServiceCompensationDaysPerYear = (
  terminationType: string,
  benefitYears: number
): number => {
  if (RESIGNATION_TYPES.includes(terminationType)) {
    if (benefitYears === 3) return 7;
    if (benefitYears > 3 && benefitYears < 10) return 15;
    if (benefitYears >= 10) return 30;
  }

  if (THIRTY_DAYS_TYPES.includes(terminationType) && benefitYears >= 1) {
    return 30;
  }

  if (FIFTEEN_DAYS_TYPES.includes(terminationType) && benefitYears >= 1) {
    return 15;
  }

  return 0;
};

/**
 * Get death compensation days per year based on termination type
 */
export const getDeathCompensationDaysPerYear = (terminationType: string): number => {
  if (terminationType === "চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)") {
    return 30;
  } else if (terminationType === "কর্মরত অবস্থায়/কর্মকালীন দূর্ঘটনার কারণে মৃত্যু (১৯)") {
    return 45;
  }

  return 0;
};

/**
 * Calculate total deductions
 */
export const calculateTotalDeductions = (
  advanceDeduction: number,
  noticeDeduction: number,
  otherDeduction: number
): number => {
  const total = advanceDeduction + noticeDeduction + otherDeduction;
  return parseFloat(total.toFixed(2));
};

/**
 * Calculate total receivable amount
 */
export const calculateTotalReceivable = (formData: EmployeeFormData): string => {
  const earned = parseFloat(formData.earnedLeave) || 0;
  const service = parseFloat(formData.serviceCompensation) || 0;
  const death = parseFloat(formData.deathCompensation) || 0;
  const layOff = parseFloat(formData.layOffCompensation || '0') || 0;

  const usesGratuity = formData.paymentMethod === 'gratuity' && isGratuityEligible(formData.terminationType || '');
  const gratuity = usesGratuity ? (parseFloat(formData.gratuityAmount || '0') || 0) : 0;

  const notice = parseFloat(formData.noticePay) || 0;
  const lastMonthSalary = parseFloat(formData.lastMonthSalary || '0') || 0;
  const lastMonthOvertime = parseFloat(formData.lastMonthOvertime || '0') || 0; 
  const others = parseFloat(formData.others) || 0;

  return (earned + service + death + gratuity + layOff + notice + lastMonthSalary + lastMonthOvertime + others).toFixed(2);
};

/**
 * Calculate final payable amount (receivable - deductions)
 */
export const calculateFinalTotal = (totalReceivable: string, totalDeductions: string): string => {
  const receivable = parseFloat(totalReceivable) || 0;
  const deductions = parseFloat(totalDeductions) || 0;
  return (receivable - deductions).toFixed(0);
};