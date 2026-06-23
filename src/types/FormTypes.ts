// ─────────────────────────────────────────────────────────────────────────────
// DEPRECATED — DO NOT USE FOR NEW CODE
//
// This file contains an older version of the Final Settlement FormData interface
// (missing benefitYears, dailyBasic, dailyGross, lastMonth fields, etc.).
//
// The ACTIVE interface is:
//   src/types/FinalSettlementDataTypes.ts  →  FormData
//
// This file is kept only for any legacy components still referencing it.
// New code must import from FinalSettlementDataTypes instead.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

export interface LegacySettlementFormData {
  employeeName: string;
  cardNo: string;
  designation: string;
  joiningDate: string;
  lastAttendance: string;
  settlementDate: string;
  terminationType: string;
  serviceYears: string;
  totalDays: string;
  absentDays: string;
  basicWage: string;
  houseRent: string;
  foodAllowance: string;
  medicalAllowance: string;
  transportAllowance: string;
  totalDailyWage: string;
  earnedLeave: string;
  serviceCompensation: string;
  deathCompensation: string;
  noticePay: string;
  others: string;
  advanceDeduction: string;
  totalDeductions: string;
  companyName: string;
  companyAddress: string;
  section: string;
}

export interface FormProps {
  formData: LegacySettlementFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CalculationProps {
  formData: LegacySettlementFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  calculateTotal: () => string;
}

export interface SignatureProps {
  formData: LegacySettlementFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}