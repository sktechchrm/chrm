import { FACTORY_ADDRESS_EN, FACTORY_ADDRESS_BN, COMPANY_OPTIONS } from '../../config/factory';

export interface EmployeeFormData {
  employeeName: string;
  cardNo: string;
  designation: string;
  joiningDate: string;
  lastAttendance: string;
  settlementDate: string;
  terminationType: string;
  serviceYears: string;
  benefitYears: string;
  serviceMonths: string;
  serviceDays: string;
  totalDays: string;
  absentDays: string;
  basicWage: string;
  houseRent: string;
  foodAllowance: string;
  medicalAllowance: string;
  transportAllowance: string;
  totalMonthlyWage: string;
  dailyBasic: string;
  dailyGross: string;
  elQty: string;
  noticePayDay: string;
  noticeDeductionDay: string;
  earnedLeave: string;
  serviceCompensation: string;
  deathCompensation: string;
  layOffDays?: string;
  layOffCompensation?: string;
  gratuityAmount?: string;
  gratuityDaysPerYear?: string;
  paymentMethod?: string; // "compensation" | "gratuity" — manual HR choice, only offered where the Act allows it
  noticePay: string;
  others: string;
  advanceDeduction: string;
  noticeDeduction: string;
  otherDeduction: string;
  totalDeductions: string;
  companyName: string;
  companyAddress: string;
  companyNameEn?: string;
  companyAddressEn?: string;
  section: string;
  payableDay: string;
  payableHours: string;

  lastMonthName: string; 
  lastMonthYear: string;  
  lastMonthSalary?: string;
  lastMonthOvertime?: string;
  hourlyOvertimeRate?: string;
  serviceCompDaysPerYear?: string;
  DeathCompensationDaysPerYear?: string;
  otherBenefits?: string;
  deductionForAdvance?: string;
  deductionParticularsB?: string;
}

export const STATIC_DATA = {
  companyOptions: COMPANY_OPTIONS.filter(c => c.active).map(c => c.label),
  addressOptions: [FACTORY_ADDRESS_EN, FACTORY_ADDRESS_BN],
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