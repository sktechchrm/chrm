// ─────────────────────────────────────────────────────────────────────────────
// TESTS: MaternityFormula.ts
// Covers every static method — eligibility rules, benefit calculations,
// leave dates, and total payable logic per Bangladesh Labour Act 2006 §45–50.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { MaternityFormula } from '../../components/maternityBenefit/MaternityFormula';
import type { MaternityFormData } from '../../components/maternityBenefit/MaternityBenefitTypes';

// ── Helper: build a minimal valid MaternityFormData object ───────────────────
function makeFormData(overrides: Partial<MaternityFormData> = {}): MaternityFormData {
  return {
    formDate: '2024-06-01',
    companyName: 'MG Shirtex',
    companyAddress: 'Dhaka',
    employeeName: 'Test Worker',
    cardNo: 'A-001',
    designation: 'Operator',
    section: 'Sewing',
    aliveChildren: '0',
    joiningDate: '2022-01-01',
    maternitySymptomDate: '2024-04-01',
    possibleDeliveryDate: '2024-07-01',
    maternityLeaveStartDate: '2024-05-01',
    maternityLeaveEndDate: '2024-08-28',
    serviceYears: '2',
    serviceMonths: '5',
    serviceDays: '0',
    eligibilityStatus: 'অধিকারী',
    currentMonth: 'জানুয়ারি',
    currentYear: '2024',
    latestMonth: 'জানুয়ারি',
    latestYear: '2024',
    totalMonthlyWage: '8500',
    dailyGross: '326.92',
    benefitInstallment: 'প্রথম কিস্তি',
    benifitDays: '60',
    benefitAmount: '19615.38',
    earnedLeaveDays: '0',
    otherBenefits: 'না',
    otherBenefitsType: 'দিন',
    otherBenefitsValue: '0',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// calculateServiceDuration  (delegates to sharedFormulas — smoke test only)
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.calculateServiceDuration', () => {
  it('returns correct duration for 2 years of service', () => {
    const r = MaternityFormula.calculateServiceDuration('2022-01-01', '2024-01-01');
    expect(r).toEqual({ years: 2, months: 0, days: 0 });
  });

  it('returns all zeros for empty dates', () => {
    expect(MaternityFormula.calculateServiceDuration('', '')).toEqual({ years: 0, months: 0, days: 0 });
  });

  it('returns all zeros for reversed dates', () => {
    expect(MaternityFormula.calculateServiceDuration('2025-01-01', '2020-01-01'))
      .toEqual({ years: 0, months: 0, days: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// checkEligibility  — service duration rule (≥ 6 months)
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.checkEligibility', () => {
  it('returns অধিকারী for exactly 6 months (boundary)', () => {
    expect(MaternityFormula.checkEligibility(0, 6)).toBe('অধিকারী');
  });

  it('returns অধিকারী for 1 year 0 months', () => {
    expect(MaternityFormula.checkEligibility(1, 0)).toBe('অধিকারী');
  });

  it('returns অধিকারী for 5 years', () => {
    expect(MaternityFormula.checkEligibility(5, 0)).toBe('অধিকারী');
  });

  it('returns অধিকারী নয় for 5 months (just under 6)', () => {
    expect(MaternityFormula.checkEligibility(0, 5)).toBe('অধিকারী নয়');
  });

  it('returns অধিকারী নয় for 0 years 0 months', () => {
    expect(MaternityFormula.checkEligibility(0, 0)).toBe('অধিকারী নয়');
  });

  it('returns অধিকারী for 0 years 7 months', () => {
    expect(MaternityFormula.checkEligibility(0, 7)).toBe('অধিকারী');
  });

  it('returns অধিকারী নয় for 0 years 5 months (1 month short)', () => {
    expect(MaternityFormula.checkEligibility(0, 5)).toBe('অধিকারী নয়');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// checkAliveChildrenEligibility  — children count rule (≤ 1)
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.checkAliveChildrenEligibility', () => {
  it('returns অধিকারী for 0 children', () => {
    expect(MaternityFormula.checkAliveChildrenEligibility(0)).toBe('অধিকারী');
  });

  it('returns অধিকারী for exactly 1 child (boundary)', () => {
    expect(MaternityFormula.checkAliveChildrenEligibility(1)).toBe('অধিকারী');
  });

  it('returns অধিকারী নয় for 2 children', () => {
    expect(MaternityFormula.checkAliveChildrenEligibility(2)).toBe('অধিকারী নয়');
  });

  it('returns অধিকারী নয় for 3 children', () => {
    expect(MaternityFormula.checkAliveChildrenEligibility(3)).toBe('অধিকারী নয়');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// checkCombinedEligibility  — BOTH conditions must be true
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.checkCombinedEligibility', () => {
  it('অধিকারী when service ≥ 6 months AND children ≤ 1', () => {
    expect(MaternityFormula.checkCombinedEligibility(1, 0, 0)).toBe('অধিকারী');
    expect(MaternityFormula.checkCombinedEligibility(0, 6, 1)).toBe('অধিকারী');
  });

  it('অধিকারী নয় when service < 6 months (even if children OK)', () => {
    expect(MaternityFormula.checkCombinedEligibility(0, 5, 0)).toBe('অধিকারী নয়');
  });

  it('অধিকারী নয় when children > 1 (even if service OK)', () => {
    expect(MaternityFormula.checkCombinedEligibility(2, 0, 2)).toBe('অধিকারী নয়');
  });

  it('অধিকারী নয় when both conditions fail', () => {
    expect(MaternityFormula.checkCombinedEligibility(0, 3, 2)).toBe('অধিকারী নয়');
  });

  it('অধিকারী at exact boundaries: 6 months and 1 child', () => {
    expect(MaternityFormula.checkCombinedEligibility(0, 6, 1)).toBe('অধিকারী');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateLeaveEndDate  — start + 119 days
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.calculateLeaveEndDate', () => {
  it('adds exactly 119 days to start date', () => {
    // 2024-01-01 + 119 days = 2024-04-29
    const result = MaternityFormula.calculateLeaveEndDate('2024-01-01');
    const start  = new Date('2024-01-01');
    start.setDate(start.getDate() + 119);
    expect(result).toBe(start.toISOString().split('T')[0]);
  });

  it('correctly crosses month boundaries', () => {
    const result = MaternityFormula.calculateLeaveEndDate('2024-05-01');
    const start  = new Date('2024-05-01');
    start.setDate(start.getDate() + 119);
    expect(result).toBe(start.toISOString().split('T')[0]);
  });

  it('correctly crosses year boundary', () => {
    const result = MaternityFormula.calculateLeaveEndDate('2023-10-01');
    const start  = new Date('2023-10-01');
    start.setDate(start.getDate() + 119);
    expect(result).toBe(start.toISOString().split('T')[0]);
  });

  it('returns empty string for empty input', () => {
    expect(MaternityFormula.calculateLeaveEndDate('')).toBe('');
  });

  it('returns empty string for partial date', () => {
    expect(MaternityFormula.calculateLeaveEndDate('2024-01-')).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(MaternityFormula.calculateLeaveEndDate('not-a-date')).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateDailyGross  — monthlyWage ÷ 26
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.calculateDailyGross', () => {
  it('divides monthly wage by 26 (working days)', () => {
    const expected = (8500 / 26).toFixed(2);
    expect(MaternityFormula.calculateDailyGross('8500')).toBe(expected);
  });

  it('returns "0" for zero wage', () => {
    expect(MaternityFormula.calculateDailyGross('0')).toBe('0');
  });

  it('returns "0" for empty string', () => {
    expect(MaternityFormula.calculateDailyGross('')).toBe('0');
  });

  it('returns "0" for non-numeric string', () => {
    expect(MaternityFormula.calculateDailyGross('abc')).toBe('0');
  });

  it('handles minimum wage scenario correctly', () => {
    // Minimum wage 12500 BDT (garments 2023)
    const expected = (12500 / 26).toFixed(2);
    expect(MaternityFormula.calculateDailyGross('12500')).toBe(expected);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateBenefitAmount  — days × dailyGross
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.calculateBenefitAmount', () => {
  it('calculates pre-delivery benefit: 60 × dailyGross', () => {
    const dailyGross = (8500 / 26).toFixed(2);
    const expected   = (60 * parseFloat(dailyGross)).toFixed(2);
    expect(MaternityFormula.calculateBenefitAmount('60', dailyGross)).toBe(expected);
  });

  it('calculates post-delivery benefit: 59 × dailyGross', () => {
    const dailyGross = (8500 / 26).toFixed(2);
    const expected   = (59 * parseFloat(dailyGross)).toFixed(2);
    expect(MaternityFormula.calculateBenefitAmount('59', dailyGross)).toBe(expected);
  });

  it('pre + post benefit = 119 × dailyGross (full leave)', () => {
    const dailyGross = (8500 / 26).toFixed(2);
    const pre  = parseFloat(MaternityFormula.calculateBenefitAmount('60', dailyGross));
    const post = parseFloat(MaternityFormula.calculateBenefitAmount('59', dailyGross));
    const full = parseFloat(MaternityFormula.calculateBenefitAmount('119', dailyGross));
    expect(pre + post).toBeCloseTo(full, 1);
  });

  it('returns "0.00" for 0 days', () => {
    expect(MaternityFormula.calculateBenefitAmount('0', '326.92')).toBe('0.00');
  });

  it('returns "0.00" for 0 dailyGross', () => {
    expect(MaternityFormula.calculateBenefitAmount('60', '0')).toBe('0.00');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateEarnedWage  — uses actual calendar days, not 26
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.calculateEarnedWage', () => {
  it('uses calendar days (31) for জানুয়ারি, not working days (26)', () => {
    // dailyGross = 8500/26 = 326.92
    // earned = 10 × (326.92 × 26 / 31)
    const dailyGross  = (8500 / 26).toFixed(2);
    const calendarDays = 31;
    const expected    = 10 * (parseFloat(dailyGross) * 26 / calendarDays);
    expect(MaternityFormula.calculateEarnedWage('10', dailyGross, 'জানুয়ারি', '2024'))
      .toBeCloseTo(expected, 1);
  });

  it('uses 29 calendar days for ফেব্রুয়ারি in leap year 2024', () => {
    const dailyGross = (8500 / 26).toFixed(2);
    const expected   = 5 * (parseFloat(dailyGross) * 26 / 29);
    expect(MaternityFormula.calculateEarnedWage('5', dailyGross, 'ফেব্রুয়ারি', '2024'))
      .toBeCloseTo(expected, 1);
  });

  it('uses 28 calendar days for ফেব্রুয়ারি in non-leap year 2023', () => {
    const dailyGross = (8500 / 26).toFixed(2);
    const expected   = 5 * (parseFloat(dailyGross) * 26 / 28);
    expect(MaternityFormula.calculateEarnedWage('5', dailyGross, 'ফেব্রুয়ারি', '2023'))
      .toBeCloseTo(expected, 1);
  });

  it('returns 0 for 0 earned leave days', () => {
    expect(MaternityFormula.calculateEarnedWage('0', '326.92', 'জানুয়ারি', '2024')).toBe(0);
  });

  it('returns 0 for 0 daily gross', () => {
    expect(MaternityFormula.calculateEarnedWage('10', '0', 'জানুয়ারি', '2024')).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateOtherBenefits  — দিন (days) vs টাকা (fixed amount)
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.calculateOtherBenefits', () => {
  it('returns the value directly when type is টাকা (fixed amount)', () => {
    expect(MaternityFormula.calculateOtherBenefits('500', 'টাকা', '8500')).toBe(500);
  });

  it('calculates days × dailyGross30 when type is দিন', () => {
    // dailyGross30 = 8500 / 30 = 283.33...
    const expected = 5 * (8500 / 30);
    expect(MaternityFormula.calculateOtherBenefits('5', 'দিন', '8500'))
      .toBeCloseTo(expected, 1);
  });

  it('returns 0 when value is 0 (type টাকা)', () => {
    expect(MaternityFormula.calculateOtherBenefits('0', 'টাকা', '8500')).toBe(0);
  });

  it('returns 0 when value is 0 (type দিন)', () => {
    expect(MaternityFormula.calculateOtherBenefits('0', 'দিন', '8500')).toBe(0);
  });

  it('returns 0 when monthly wage is 0 (type দিন)', () => {
    expect(MaternityFormula.calculateOtherBenefits('5', 'দিন', '0')).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getYearOptions
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.getYearOptions', () => {
  it('returns 5 years by default', () => {
    expect(MaternityFormula.getYearOptions()).toHaveLength(5);
  });

  it('first year is current year', () => {
    const currentYear = new Date().getFullYear();
    expect(MaternityFormula.getYearOptions()[0]).toBe(currentYear);
  });

  it('years are in descending order', () => {
    const years = MaternityFormula.getYearOptions(5);
    for (let i = 0; i < years.length - 1; i++) {
      expect(years[i]).toBeGreaterThan(years[i + 1]);
    }
  });

  it('returns requested count', () => {
    expect(MaternityFormula.getYearOptions(10)).toHaveLength(10);
    expect(MaternityFormula.getYearOptions(3)).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateTotalPayable — integration scenarios
// ─────────────────────────────────────────────────────────────────────────────
describe('MaternityFormula.calculateTotalPayable', () => {

  it('eligible worker (1st installment): returns benefit + earned leave + other benefits', () => {
    const formData = makeFormData({
      serviceYears: '2', serviceMonths: '0',
      aliveChildren: '0',
      benefitInstallment: 'প্রথম কিস্তি',
      benefitAmount: '19615.38',
      earnedLeaveDays: '0',
      otherBenefitsType: 'টাকা', otherBenefitsValue: '0',
    });
    const result = parseFloat(MaternityFormula.calculateTotalPayable(formData));
    // Eligible: benefit + 0 earned + 0 other = 19615.38
    expect(result).toBeCloseTo(19615.38, 0);
  });

  it('eligible worker (1st installment): adds earned leave correctly', () => {
    const dailyGross = (8500 / 26).toFixed(2);
    const formData   = makeFormData({
      serviceYears: '1', serviceMonths: '6',
      aliveChildren: '1',
      benefitInstallment: 'প্রথম কিস্তি',
      benefitAmount: '19615.38',
      earnedLeaveDays: '10',
      dailyGross,
      currentMonth: 'জানুয়ারি',
      currentYear: '2024',
      otherBenefitsType: 'টাকা', otherBenefitsValue: '0',
    });
    const result   = parseFloat(MaternityFormula.calculateTotalPayable(formData));
    const earnedWage = MaternityFormula.calculateEarnedWage('10', dailyGross, 'জানুয়ারি', '2024');
    expect(result).toBeCloseTo(19615.38 + earnedWage, 0);
  });

  it('2nd installment: returns only the benefit amount (no earned leave / other)', () => {
    const formData = makeFormData({
      serviceYears: '2', serviceMonths: '0',
      aliveChildren: '0',
      benefitInstallment: 'দ্বিতীয় কিস্তি',
      benefitAmount: '19230.34',
      earnedLeaveDays: '10',
      otherBenefitsType: 'টাকা', otherBenefitsValue: '500',
    });
    const result = parseFloat(MaternityFormula.calculateTotalPayable(formData));
    // 2nd installment ignores earned leave and other benefits
    expect(result).toBeCloseTo(19230.34, 1);
  });

  it('ineligible worker (service < 6 months): excludes maternity benefit, keeps earned leave', () => {
    const dailyGross = (8500 / 26).toFixed(2);
    const formData   = makeFormData({
      serviceYears: '0', serviceMonths: '3',
      aliveChildren: '0',
      benefitInstallment: 'প্রথম কিস্তি',
      benefitAmount: '19615.38',
      earnedLeaveDays: '5',
      dailyGross,
      currentMonth: 'জানুয়ারি',
      currentYear: '2024',
      otherBenefitsType: 'টাকা', otherBenefitsValue: '0',
    });
    const result     = parseFloat(MaternityFormula.calculateTotalPayable(formData));
    const earnedWage = MaternityFormula.calculateEarnedWage('5', dailyGross, 'জানুয়ারি', '2024');
    // Ineligible → only earned leave, no maternity benefit
    expect(result).toBeCloseTo(earnedWage, 0);
  });

  it('ineligible worker (2 children): excludes maternity benefit', () => {
    const formData = makeFormData({
      serviceYears: '3', serviceMonths: '0',
      aliveChildren: '2',           // disqualifying
      benefitInstallment: 'প্রথম কিস্তি',
      benefitAmount: '19615.38',
      earnedLeaveDays: '0',
      otherBenefitsType: 'টাকা', otherBenefitsValue: '0',
    });
    const result = parseFloat(MaternityFormula.calculateTotalPayable(formData));
    // No benefit, no earned leave, no other → 0
    expect(result).toBe(0);
  });

  it('eligible + other benefits (টাকা type): adds fixed amount', () => {
    const formData = makeFormData({
      serviceYears: '2', serviceMonths: '0',
      aliveChildren: '0',
      benefitInstallment: 'প্রথম কিস্তি',
      benefitAmount: '19615.38',
      earnedLeaveDays: '0',
      otherBenefitsType: 'টাকা', otherBenefitsValue: '500',
    });
    const result = parseFloat(MaternityFormula.calculateTotalPayable(formData));
    expect(result).toBeCloseTo(19615.38 + 500, 0);
  });
});
