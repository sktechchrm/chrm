// ─────────────────────────────────────────────────────────────────────────────
// MaternityBenefitTypes.ts
// Global types file — kept at src/types/MaternityBenefitTypes.ts
// DO NOT move or rename: imported by MaternityFormula.ts and legacy code.
//
// Changes:
//  - Added maternityLeavenoticedDate field
//  - MATERNITY_LEAVE_DAYS updated to 120 (law: ধারা ৪৭(৩))
//  - MATERNITY_LEAVE_DAYS_OFFSET: 119 added (date arithmetic offset)
// ─────────────────────────────────────────────────────────────────────────────

import { FACTORY_ADDRESS_EN, FACTORY_ADDRESS_BN, COMPANY_OPTIONS } from '../../config/factory';

export interface MaternityFormData {
  formDate:                    string;
  companyName:                 string;
  companyAddress:              string;
  companyNameEn?:               string;
  companyAddressEn?:            string;
  employeeName:                string;
  cardNo:                      string;
  designation:                 string;
  section:                     string;
  aliveChildren:               string;
  joiningDate:                 string;
  maternitySymptomDate:        string;
  possibleDeliveryDate:        string;
  maternityLeavenoticedDate:   string;   // ← added: ধারা ৪৭(১) notice date
  maternityLeaveStartDate:     string;
  maternityLeaveEndDate:       string;
  serviceYears:                string;
  serviceMonths:               string;
  serviceDays:                 string;
  eligibilityStatus:           string;
  currentMonth:                string;
  currentYear:                 string;
  latestMonth:                 string;
  latestYear:                  string;
  totalMonthlyWage:            string;
  dailyGross:                  string;
  benefitInstallment:          string;
  benifitDays:                 string;
  benefitAmount:               string;
  earnedLeaveDays:             string;
  otherBenefits:               string;
  otherBenefitsType:           string;
  otherBenefitsValue:          string;
  // ── Installment tracking ────────────────────────────────────────────────────
  installment1Date:            string;   // bill date when 1st payment made
  installment1Status:          string;   // 'pending' | 'paid'
  installment1Amount:          string;   // snapshot: benefit amount at time of 1st payment
  installment1Salary:          string;   // snapshot: salary at time of 1st payment
  installment1Others:          string;   // snapshot: others at time of 1st payment
  installment1OthersLabel:     string;   // snapshot: others label
  installment2Date:            string;   // bill date when 2nd payment made
  installment2Status:          string;   // 'pending' | 'paid'
  installment2Amount:          string;   // snapshot: benefit amount at time of 2nd payment
  installment2Salary:          string;   // snapshot: salary (always 0 for 2nd)
  installment2Others:          string;   // snapshot: others (always 0 for 2nd)
  installment2OthersLabel:     string;
  activeInstallment:           string;   // 'প্রথম কিস্তি' | 'দ্বিতীয় কিস্তি'
}

export interface TableProps {
  formData:     MaternityFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export interface CalculationTableProps extends TableProps {
  calculateTotalPayable:  () => string;
  /** Called when user confirms edit of a paid installment row. key = 'installment1'|'installment2'|'combined' */
  onInstallmentUpdate:    (key: InstallmentKey, patch: InstallmentPatch) => Promise<void>;
  /** Called when user confirms delete of a paid installment row */
  onInstallmentDelete:    (key: InstallmentKey) => Promise<void>;
}

export type InstallmentKey = 'installment1' | 'installment2' | 'combined';

export interface InstallmentPatch {
  date:        string;
  amount:      string;
  salary:      string;
  others:      string;
  othersLabel: string;
}

export const MATERNITY_CONSTANTS = {
  MATERNITY_LEAVE_DAYS:        120,   // law: 120 days total (ধারা ৪৭(৩))
  MATERNITY_LEAVE_DAYS_OFFSET: 119,   // date arithmetic offset: start + 119 = 120 days inclusive
  MONTHLY_WORKING_DAYS:        26,
  PRE_DELIVERY_DAYS:           60,
  TOTAL_MONTHLY_DAYS:          30,
  ELIGIBILITY_MONTHS:          6,
  ELIGIBILITY_ALIVE_CHILDREN:  1,
};

export const BLANK_EMPLOYEE_FIELDS: Partial<MaternityFormData> = {
  employeeName:              '',
  cardNo:                    '',
  designation:               '',
  section:                   '',
  aliveChildren:             '',
  joiningDate:               '',
  maternitySymptomDate:      '',
  possibleDeliveryDate:      '',
  maternityLeavenoticedDate: '',
  maternityLeaveStartDate:   '',
  maternityLeaveEndDate:     '',
  serviceYears:              '0',
  serviceMonths:             '0',
  serviceDays:               '0',
  eligibilityStatus:         '',
  currentMonth:              '',
  currentYear:               '',
  latestMonth:               '',
  latestYear:                '',
  totalMonthlyWage:          '',
  dailyGross:                '0',
  benefitInstallment:        'প্রথম কিস্তি',
  benifitDays:               '60',
  benefitAmount:             '0.00',
  earnedLeaveDays:           '',
  otherBenefits:             '',
  otherBenefitsType:         'দিন',
  otherBenefitsValue:        '',
  installment1Date:          '',
  installment1Status:        'pending',
  installment1Amount:        '',
  installment1Salary:        '',
  installment1Others:        '',
  installment1OthersLabel:   '',
  installment2Date:          '',
  installment2Status:        'pending',
  installment2Amount:        '',
  installment2Salary:        '',
  installment2Others:        '',
  installment2OthersLabel:   '',
  activeInstallment:         'প্রথম কিস্তি',
};

export const INITIAL_FORM_STATE: MaternityFormData = {
  formDate:                  '',
  companyName:               '',
  companyAddress:            '',
  companyNameEn:             '',
  companyAddressEn:          '',
  employeeName:              '',
  cardNo:                    '',
  designation:               '',
  section:                   '',
  aliveChildren:             '',
  joiningDate:               '',
  maternitySymptomDate:      '',
  possibleDeliveryDate:      '',
  maternityLeavenoticedDate: '',
  maternityLeaveStartDate:   '',
  maternityLeaveEndDate:     '',
  serviceYears:              '0',
  serviceMonths:             '0',
  serviceDays:               '0',
  eligibilityStatus:         '',
  currentMonth:              '',
  currentYear:               '',
  latestMonth:               '',
  latestYear:                '',
  totalMonthlyWage:          '',
  dailyGross:                '0',
  benefitInstallment:        'প্রথম কিস্তি',
  benifitDays:               '60',
  benefitAmount:             '0.00',
  earnedLeaveDays:           '',
  otherBenefits:             '',
  otherBenefitsType:         'দিন',
  otherBenefitsValue:        '',
  installment1Date:          '',
  installment1Status:        'pending',
  installment1Amount:        '',
  installment1Salary:        '',
  installment1Others:        '',
  installment1OthersLabel:   '',
  installment2Date:          '',
  installment2Status:        'pending',
  installment2Amount:        '',
  installment2Salary:        '',
  installment2Others:        '',
  installment2OthersLabel:   '',
  activeInstallment:         'প্রথম কিস্তি',
};

export const STATIC_DATA = {
  companyOptions: COMPANY_OPTIONS.filter(c => c.active).map(c => c.label),
  addressOptions: [FACTORY_ADDRESS_EN, FACTORY_ADDRESS_BN],
  bengaliMonths: [
    'জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
    'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর',
  ],
  benefitInstallments: [
    { value: 'প্রথম কিস্তি',    label: 'প্রথম কিস্তি (প্রসব পূর্ববর্তী ৬০ দিন)'  },
    { value: 'দ্বিতীয় কিস্তি', label: 'দ্বিতীয় কিস্তি (প্রসব পরবর্তী ৬০ দিন)' },
    { value: '১ম+২য় কিস্তি',   label: '১ম+২য় কিস্তি (একসাথে ১২০ দিন)'          },
  ],
  benefitTypes: [
    { value: 'দিন',  label: 'দিন'  },
    { value: 'টাকা', label: 'টাকা' },
  ],
};