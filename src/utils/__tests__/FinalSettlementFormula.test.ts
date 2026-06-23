// ─────────────────────────────────────────────────────────────────────────────
// TESTS: FinalSettlementFormula.ts
// Covers every exported function — all termination types, edge cases,
// and boundary conditions per Bangladesh Labour Act 2006.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  calculateTotalDays,
  calculateBenefitYears,
  calculateWageComponents,
  calculateServiceCompensation,
  calculateDeathCompensation,
  calculateEarnedLeave,
  calculateNoticePay,
  calculateNoticeDeduction,
  calculateLastMonthSalary,
  calculateLastMonthOvertime,
  calculateHourlyOvertimeRate,
  getServiceCompensationDaysPerYear,
  getDeathCompensationDaysPerYear,
  calculateTotalDeductions,
  calculateFinalTotal,
} from '../../components/finalSettlement/FinalSettlementFormula';

// ─────────────────────────────────────────────────────────────────────────────
// calculateTotalDays
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateTotalDays', () => {
  it('converts months + days to total days correctly', () => {
    // 2 months 15 days, 0 absent → (2×30)+15 = 75
    expect(calculateTotalDays(2, 15, 0)).toBe(75);
  });

  it('subtracts absent days from total', () => {
    // 12 months 0 days, 5 absent → 360 - 5 = 355
    expect(calculateTotalDays(12, 0, 5)).toBe(355);
  });

  it('returns 0 when absent days exceed total (never negative)', () => {
    expect(calculateTotalDays(0, 10, 50)).toBe(0);
  });

  it('handles zero inputs', () => {
    expect(calculateTotalDays(0, 0, 0)).toBe(0);
  });

  it('calculates exactly 365 days (1 full year)', () => {
    // 12 months 5 days = 365 → 365 - 0 = 365
    expect(calculateTotalDays(12, 5, 0)).toBe(365);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateBenefitYears
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateBenefitYears', () => {
  it('adds 1 full year when remaining days >= 365', () => {
    // 5 full years + 365 remaining days → benefit = 6
    expect(calculateBenefitYears(5, 365)).toBe(6);
  });

  it('adds 0.5 year when remaining days >= 182.5', () => {
    expect(calculateBenefitYears(3, 183)).toBe(3.5);
  });

  it('adds nothing when remaining days < 182.5', () => {
    expect(calculateBenefitYears(3, 100)).toBe(3);
  });

  it('returns 0 benefit years for 0 service years and 0 days', () => {
    expect(calculateBenefitYears(0, 0)).toBe(0);
  });

  it('returns 1 benefit year for 1 full year + no extra days', () => {
    expect(calculateBenefitYears(1, 0)).toBe(1);
  });

  it('handles 10 years exactly', () => {
    expect(calculateBenefitYears(10, 0)).toBe(10);
  });

  it('adds 0.5 at exactly 182.5 remaining days', () => {
    expect(calculateBenefitYears(2, 182.5)).toBe(2.5);
  });

  it('adds nothing at 182 days (just below threshold)', () => {
    expect(calculateBenefitYears(2, 182)).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateWageComponents
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateWageComponents', () => {
  // Using standard example: total=8500, food=1200, medical=600, transport=400
  // Net = 8500 - 2200 = 6300 → basic = 6300/1.5 = 4200
  const result = calculateWageComponents(8500, 1200, 600, 400);

  it('calculates basic wage as (total - allowances) / 1.5', () => {
    expect(result.basicWage).toBe(4200);
  });

  it('calculates house rent as basic / 2', () => {
    expect(result.houseRent).toBe(2100);
  });

  it('calculates daily basic as basic / 30', () => {
    expect(result.dailyBasic).toBe(parseFloat((4200 / 30).toFixed(2)));
  });

  it('calculates daily gross as totalWage / 30', () => {
    expect(result.dailyGross).toBe(parseFloat((8500 / 30).toFixed(2)));
  });

  it('calculates hourly overtime rate as (basic / 208) * 2', () => {
    expect(result.hourlyOvertimeRate).toBe(parseFloat(((4200 / 208) * 2).toFixed(2)));
  });

  it('verifies basic + houseRent + allowances = total wage', () => {
    const recon = result.basicWage + result.houseRent + 1200 + 600 + 400;
    expect(recon).toBe(8500);
  });

  it('returns all zeros when totalMonthlyWage is 0', () => {
    const r = calculateWageComponents(0, 0, 0, 0);
    expect(r.basicWage).toBe(0);
    expect(r.houseRent).toBe(0);
    expect(r.dailyBasic).toBe(0);
    expect(r.dailyGross).toBe(0);
    expect(r.hourlyOvertimeRate).toBe(0);
  });

  it('returns all zeros when totalMonthlyWage is negative', () => {
    const r = calculateWageComponents(-1000, 0, 0, 0);
    expect(r.basicWage).toBe(0);
  });

  it('handles zero allowances correctly', () => {
    // total=6000, no allowances → basic = 6000/1.5 = 4000
    const r = calculateWageComponents(6000, 0, 0, 0);
    expect(r.basicWage).toBe(4000);
    expect(r.houseRent).toBe(2000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateServiceCompensation
// BLA 2006 termination type rules
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateServiceCompensation', () => {
  const dailyBasic = 140; // 4200 / 30

  // ── 30-days-per-year types ────────────────────────────────────────────────
  const thirtyDayTypes = [
    'অবসর (২৮)',
    'চাকুরী অবসান (২৬)',
    'চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)',
    'কর্মরত অবস্থায়/কর্মকালীন দূর্ঘটনার কারণে মৃত্যু (১৯)',
    'ডিসচার্জ (২২)',
    'ছাঁটাই (২০)',
  ];

  thirtyDayTypes.forEach(type => {
    it(`30 days/year for "${type}" with 5 benefit years`, () => {
      expect(calculateServiceCompensation(type, 5, dailyBasic))
        .toBe(parseFloat((5 * 30 * dailyBasic).toFixed(2)));
    });

    it(`"${type}" with < 1 benefit year returns 0`, () => {
      expect(calculateServiceCompensation(type, 0, dailyBasic)).toBe(0);
    });
  });

  // ── 15-days-per-year types ────────────────────────────────────────────────
  const fifteenDayTypes = ['অপসারন (২৩)', 'বরখাস্ত (২৩)'];

  fifteenDayTypes.forEach(type => {
    it(`15 days/year for "${type}" with 5 benefit years`, () => {
      expect(calculateServiceCompensation(type, 5, dailyBasic))
        .toBe(parseFloat((5 * 15 * dailyBasic).toFixed(2)));
    });

    it(`"${type}" with < 1 benefit year returns 0`, () => {
      expect(calculateServiceCompensation(type, 0, dailyBasic)).toBe(0);
    });
  });

  // ── Zero compensation type ────────────────────────────────────────────────
  it('বরখাস্ত (২৩.৪: খ/ছ) always returns 0 regardless of benefit years', () => {
    expect(calculateServiceCompensation('বরখাস্ত (২৩.৪: খ/ছ)', 10, dailyBasic)).toBe(0);
    expect(calculateServiceCompensation('বরখাস্ত (২৩.৪: খ/ছ)', 1, dailyBasic)).toBe(0);
  });

  // ── Resignation (ইস্তফা) — tiered rules ───────────────────────────────────
  const resignTypes = ['ইস্তফা (২৭)', 'অনুপস্থিতির কারণে ইস্তফা (২৭)'];

  resignTypes.forEach(type => {
    it(`"${type}" with < 3 benefit years returns 0`, () => {
      expect(calculateServiceCompensation(type, 2, dailyBasic)).toBe(0);
      expect(calculateServiceCompensation(type, 1, dailyBasic)).toBe(0);
    });

    it(`"${type}" with exactly 3 years → 7 days/year`, () => {
      expect(calculateServiceCompensation(type, 3, dailyBasic))
        .toBe(parseFloat((3 * 7 * dailyBasic).toFixed(2)));
    });

    it(`"${type}" with 5 years (3–10 range) → 15 days/year`, () => {
      expect(calculateServiceCompensation(type, 5, dailyBasic))
        .toBe(parseFloat((5 * 15 * dailyBasic).toFixed(2)));
    });

    it(`"${type}" with 9 years (still < 10) → 15 days/year`, () => {
      expect(calculateServiceCompensation(type, 9, dailyBasic))
        .toBe(parseFloat((9 * 15 * dailyBasic).toFixed(2)));
    });

    it(`"${type}" with exactly 10 years → 30 days/year`, () => {
      expect(calculateServiceCompensation(type, 10, dailyBasic))
        .toBe(parseFloat((10 * 30 * dailyBasic).toFixed(2)));
    });

    it(`"${type}" with 15 years → 30 days/year`, () => {
      expect(calculateServiceCompensation(type, 15, dailyBasic))
        .toBe(parseFloat((15 * 30 * dailyBasic).toFixed(2)));
    });
  });

  // ── Unknown termination type ─────────────────────────────────────────────
  it('unknown termination type returns 0', () => {
    expect(calculateServiceCompensation('অজানা ধরন', 5, dailyBasic)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateDeathCompensation
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateDeathCompensation', () => {
  const dailyBasic = 140;

  it('natural death (মৃত্যু ১৯) with > 1 year: 30 days/year', () => {
    expect(calculateDeathCompensation('চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)', 5, dailyBasic))
      .toBe(parseFloat((5 * 30 * dailyBasic).toFixed(2)));
  });

  it('natural death with exactly 1 year: returns 0 (rule: > 1 year required)', () => {
    expect(calculateDeathCompensation('চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)', 1, dailyBasic))
      .toBe(0);
  });

  it('workplace accident death (মৃত্যু ১৯ accident): 45 days/year', () => {
    expect(calculateDeathCompensation('কর্মরত অবস্থায়/কর্মকালীন দূর্ঘটনার কারণে মৃত্যু (১৯)', 5, dailyBasic))
      .toBe(parseFloat((5 * 45 * dailyBasic).toFixed(2)));
  });

  it('workplace accident death with 1 benefit year: returns 0', () => {
    expect(calculateDeathCompensation('কর্মরত অবস্থায়/কর্মকালীন দূর্ঘটনার কারণে মৃত্যু (১৯)', 1, dailyBasic))
      .toBe(0);
  });

  it('other termination types return 0 for death compensation', () => {
    expect(calculateDeathCompensation('চাকুরী অবসান (২৬)', 5, dailyBasic)).toBe(0);
    expect(calculateDeathCompensation('ইস্তফা (২৭)', 10, dailyBasic)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateEarnedLeave
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateEarnedLeave', () => {
  it('calculates earned leave: days × dailyGross', () => {
    expect(calculateEarnedLeave(18, 283.33)).toBe(parseFloat((18 * 283.33).toFixed(2)));
  });

  it('returns 0 for 0 days', () => {
    expect(calculateEarnedLeave(0, 283.33)).toBe(0);
  });

  it('returns 0 for 0 daily gross', () => {
    expect(calculateEarnedLeave(18, 0)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateNoticePay & calculateNoticeDeduction
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateNoticePay', () => {
  it('calculates notice pay: noticeDays × dailyBasic', () => {
    expect(calculateNoticePay(60, 140)).toBe(parseFloat((60 * 140).toFixed(2)));
  });

  it('returns 0 for 0 days', () => {
    expect(calculateNoticePay(0, 140)).toBe(0);
  });
});

describe('calculateNoticeDeduction', () => {
  it('calculates notice deduction: days × dailyBasic', () => {
    expect(calculateNoticeDeduction(30, 140)).toBe(parseFloat((30 * 140).toFixed(2)));
  });

  it('returns 0 for 0 days', () => {
    expect(calculateNoticeDeduction(0, 140)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateLastMonthSalary
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateLastMonthSalary', () => {
  it('uses correct calendar days for জানুয়ারি (31 days)', () => {
    // 8500 / 31 * 15 = 4112.90
    const expected = parseFloat((8500 / 31 * 15).toFixed(2));
    expect(calculateLastMonthSalary(8500, 15, 'জানুয়ারি', '2024')).toBe(expected);
  });

  it('uses 29 days for ফেব্রুয়ারি in leap year 2024', () => {
    const expected = parseFloat((8500 / 29 * 10).toFixed(2));
    expect(calculateLastMonthSalary(8500, 10, 'ফেব্রুয়ারি', '2024')).toBe(expected);
  });

  it('uses 28 days for ফেব্রুয়ারি in non-leap year 2023', () => {
    const expected = parseFloat((8500 / 28 * 10).toFixed(2));
    expect(calculateLastMonthSalary(8500, 10, 'ফেব্রুয়ারি', '2023')).toBe(expected);
  });

  it('returns 0 for 0 wage', () => {
    expect(calculateLastMonthSalary(0, 15, 'জানুয়ারি', '2024')).toBe(0);
  });

  it('returns 0 for 0 payable days', () => {
    expect(calculateLastMonthSalary(8500, 0, 'জানুয়ারি', '2024')).toBe(0);
  });

  it('accepts string inputs', () => {
    const expected = parseFloat((8500 / 31 * 15).toFixed(2));
    expect(calculateLastMonthSalary('8500', '15', 'জানুয়ারি', '2024')).toBe(expected);
  });

  it('falls back to 30 days for unknown month', () => {
    const expected = parseFloat((8500 / 30 * 15).toFixed(2));
    expect(calculateLastMonthSalary(8500, 15, 'UnknownMonth', '2024')).toBe(expected);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateLastMonthOvertime & calculateHourlyOvertimeRate
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateLastMonthOvertime', () => {
  it('calculates overtime: (basic/208)*2 * hours', () => {
    const basic = 4200;
    const hours = 10;
    const expected = parseFloat((((basic / 208) * 2) * hours).toFixed(2));
    expect(calculateLastMonthOvertime(basic, hours)).toBe(expected);
  });

  it('returns 0 for 0 hours', () => {
    expect(calculateLastMonthOvertime(4200, 0)).toBe(0);
  });

  it('returns 0 for 0 basic wage', () => {
    expect(calculateLastMonthOvertime(0, 10)).toBe(0);
  });
});

describe('calculateHourlyOvertimeRate', () => {
  it('calculates hourly OT rate: (basic/208)*2', () => {
    const basic = 4200;
    const expected = parseFloat(((basic / 208) * 2).toFixed(2));
    expect(calculateHourlyOvertimeRate(basic)).toBe(expected);
  });

  it('returns 0 for 0 basic wage', () => {
    expect(calculateHourlyOvertimeRate(0)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getServiceCompensationDaysPerYear
// ─────────────────────────────────────────────────────────────────────────────
describe('getServiceCompensationDaysPerYear', () => {
  it('returns 30 for চাকুরী অবসান (২৬)', () => {
    expect(getServiceCompensationDaysPerYear('চাকুরী অবসান (২৬)', 5)).toBe(30);
  });

  it('returns 30 for ছাঁটাই (২০)', () => {
    expect(getServiceCompensationDaysPerYear('ছাঁটাই (২০)', 2)).toBe(30);
  });

  it('returns 30 for অবসর (২৮)', () => {
    expect(getServiceCompensationDaysPerYear('অবসর (২৮)', 3)).toBe(30);
  });

  it('returns 30 for ডিসচার্জ (২২)', () => {
    expect(getServiceCompensationDaysPerYear('ডিসচার্জ (২২)', 5)).toBe(30);
  });

  it('returns 15 for অপসারন (২৩)', () => {
    expect(getServiceCompensationDaysPerYear('অপসারন (২৩)', 3)).toBe(15);
  });

  it('returns 15 for বরখাস্ত (২৩)', () => {
    expect(getServiceCompensationDaysPerYear('বরখাস্ত (২৩)', 3)).toBe(15);
  });

  it('returns 0 for any type when benefit years < 1', () => {
    expect(getServiceCompensationDaysPerYear('চাকুরী অবসান (২৬)', 0)).toBe(0);
    expect(getServiceCompensationDaysPerYear('ছাঁটাই (২০)', 0)).toBe(0);
  });

  it('returns 7 for ইস্তফা (২৭) at exactly 3 years', () => {
    expect(getServiceCompensationDaysPerYear('ইস্তফা (২৭)', 3)).toBe(7);
  });

  it('returns 15 for ইস্তফা (২৭) between 3 and 10 years', () => {
    expect(getServiceCompensationDaysPerYear('ইস্তফা (২৭)', 5)).toBe(15);
    expect(getServiceCompensationDaysPerYear('ইস্তফা (২৭)', 9)).toBe(15);
  });

  it('returns 30 for ইস্তফা (২৭) at 10+ years', () => {
    expect(getServiceCompensationDaysPerYear('ইস্তফা (২৭)', 10)).toBe(30);
    expect(getServiceCompensationDaysPerYear('ইস্তফা (২৭)', 20)).toBe(30);
  });

  it('returns 0 for ইস্তফা (২৭) with < 3 benefit years', () => {
    expect(getServiceCompensationDaysPerYear('ইস্তফা (২৭)', 2)).toBe(0);
    expect(getServiceCompensationDaysPerYear('ইস্তফা (২৭)', 0)).toBe(0);
  });

  it('returns 0 for unknown termination type', () => {
    expect(getServiceCompensationDaysPerYear('অজানা ধরন', 5)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getDeathCompensationDaysPerYear
// ─────────────────────────────────────────────────────────────────────────────
describe('getDeathCompensationDaysPerYear', () => {
  it('returns 30 for natural death in service', () => {
    expect(getDeathCompensationDaysPerYear('চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)')).toBe(30);
  });

  it('returns 45 for workplace accident death', () => {
    expect(getDeathCompensationDaysPerYear('কর্মরত অবস্থায়/কর্মকালীন দূর্ঘটনার কারণে মৃত্যু (১৯)')).toBe(45);
  });

  it('returns 0 for any other termination type', () => {
    expect(getDeathCompensationDaysPerYear('চাকুরী অবসান (২৬)')).toBe(0);
    expect(getDeathCompensationDaysPerYear('ইস্তফা (২৭)')).toBe(0);
    expect(getDeathCompensationDaysPerYear('')).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateTotalDeductions
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateTotalDeductions', () => {
  it('sums all three deduction types', () => {
    expect(calculateTotalDeductions(1000, 500, 200)).toBe(1700);
  });

  it('returns 0 when all deductions are 0', () => {
    expect(calculateTotalDeductions(0, 0, 0)).toBe(0);
  });

  it('handles single deduction', () => {
    expect(calculateTotalDeductions(5000, 0, 0)).toBe(5000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateFinalTotal
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateFinalTotal', () => {
  it('subtracts deductions from receivable', () => {
    expect(calculateFinalTotal('50000', '5000')).toBe('45000');
  });

  it('returns 0 when receivable equals deductions', () => {
    expect(calculateFinalTotal('10000', '10000')).toBe('0');
  });

  it('handles string inputs with decimals', () => {
    // 45000.75 - 5000.25 = 40000.5 → rounded to '40001'? No: toFixed(0) rounds
    const result = calculateFinalTotal('45000.75', '5000.25');
    expect(result).toBe(Math.round(45000.75 - 5000.25).toString());
  });

  it('handles 0 deductions', () => {
    expect(calculateFinalTotal('75000', '0')).toBe('75000');
  });

  it('handles invalid/empty strings as 0', () => {
    expect(calculateFinalTotal('', '')).toBe('0');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION: Full settlement scenario (real-world example)
// Worker: 5 years service, চাকুরী অবসান (২৬), 8500/month wage
// ─────────────────────────────────────────────────────────────────────────────
describe('Integration: Full settlement scenario', () => {
  it('calculates correct net payable for a typical terminated worker', () => {
    const totalWage   = 8500;
    const food        = 1200;
    const medical     = 600;
    const transport   = 400;
    const termType    = 'চাকুরী অবসান (২৬)';
    const benefitYrs  = 5;
    const earnedDays  = 18;
    const advance     = 2000;

    const { basicWage, dailyBasic, dailyGross } = calculateWageComponents(totalWage, food, medical, transport);

    // basic = 4200, dailyBasic = 140, dailyGross = 283.33
    expect(basicWage).toBe(4200);

    const serviceComp = calculateServiceCompensation(termType, benefitYrs, dailyBasic);
    // 5 × 30 × 140 = 21000
    expect(serviceComp).toBe(21000);

    const earned = calculateEarnedLeave(earnedDays, dailyBasic);
    // 18 × 140 = 2520
    expect(earned).toBe(2520);

    const totalReceivable = serviceComp + earned;
    // 21000 + 2520 = 23520
    expect(totalReceivable).toBe(23520);

    const finalPayable = calculateFinalTotal(totalReceivable.toString(), advance.toString());
    // 23520 - 2000 = 21520
    expect(finalPayable).toBe('21520');
  });
});
