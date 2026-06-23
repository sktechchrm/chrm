// ─────────────────────────────────────────────────────────────────────────────
// maternityBenefit.tsx
//
// Sidebar bill dropdown logic (per spec):
//
//  Saved state                                    → BN subItems       EN subItems
//  ─────────────────────────────────────────────────────────────────────────────
//  অধিকারী নয়                                    → no dropdown       no dropdown
//  installment1Status=paid, installment2Status=pending → [১ম কিস্তি]  [1st Inst.]
//  BOTH paid                                      → [১ম কিস্তি][২য়] [1st][2nd]
//  benefitInstallment='১ম+২য় কিস্তি'             → [১ম+২য় কিস্তি]  [1st+2nd Inst.]
//
// Calculate tab formDate editability (per spec):
//
//  Selected option   formDate             salary    others
//  ─────────────────────────────────────────────────────────
//  ১ম কিস্তি        Fixed on first save  Editable  Editable
//  দ্বিতীয় কিস্তি  Blank/editable       Hidden    Hidden
//  ১ম+২য় কিস্তি    Editable             Editable  Editable
//
// Total payable formula (per spec):
//  ১ম কিস্তি    → 60  × dailyGross + salary + others
//  দ্বিতীয়     → 60  × dailyGross only
//  ১ম+২য়       → 120 × dailyGross + salary + others
//  অধিকারী নয় → salary + others only
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { useFactory }            from '../../hooks/useFactory';
import { useAuth }               from '../../context/AuthContext';
import { useSheetsSync }         from '../../hooks/useSheetsSync';
import { MaternityFormula }      from './MaternityFormula';
import { toDateInput }           from '../../utils/dateUtils';
import {
  MaternityFormData,
  INITIAL_FORM_STATE,
  BLANK_EMPLOYEE_FIELDS,
  MATERNITY_CONSTANTS,
  InstallmentKey,
  InstallmentPatch,
} from './MaternityBenefitTypes';
import {
  EmployeeInfoTable,
  ServiceDurationTable,
  WageTable,
  BenefitCalculationTable,
} from './maternityBenefitTable';
import MaternityBenefitBill, { MaternityBillHandle } from './maternityBill';
import ModuleShell               from '../shell/ModuleShell';
import { DEFAULT_AUTHORIZATION } from '../common/AuthorizationBlock';
import type { AuthorizationState } from '../common/AuthorizationBlock';

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'employee',  label: 'কর্মীর তথ্য',           icon: 'ti-user-circle',    fieldCount: 5 },
  { id: 'service',   label: 'সেবার মেয়াদ ও যোগ্যতা', icon: 'ti-calendar-stats', fieldCount: 8 },
  { id: 'wage',      label: 'মজুরির বিবরণ',           icon: 'ti-cash',           fieldCount: 3 },
  { id: 'calculate', label: 'সুবিধার হিসাব',          icon: 'ti-calculator',     fieldCount: 5 },
];

// ── recordToFormData ──────────────────────────────────────────────────────────

function recordToFormData(
  rec: Record<string, unknown>,
  prev: MaternityFormData,
): MaternityFormData {
  return {
    ...prev,
    employeeName:              String(rec.employeeName              || ''),
    cardNo:                    String(rec.cardNo                    || ''),
    designation:               String(rec.designation               || ''),
    section:                   String(rec.department                || rec.section || ''),
    aliveChildren:             String(rec.aliveChildren             || ''),
    joiningDate:               toDateInput(rec.joiningDate),
    maternitySymptomDate:      toDateInput(rec.maternitySymptomDate),
    possibleDeliveryDate:      toDateInput(rec.deliveryDate         || rec.possibleDeliveryDate),
    maternityLeavenoticedDate: toDateInput(rec.maternityLeavenoticedDate),
    maternityLeaveStartDate:   toDateInput(rec.leaveStartDate       || rec.maternityLeaveStartDate),
    maternityLeaveEndDate:     toDateInput(rec.leaveEndDate         || rec.maternityLeaveEndDate),
    serviceYears:              String(rec.serviceYears              || '0'),
    serviceMonths:             String(rec.serviceMonths             || '0'),
    serviceDays:               String(rec.serviceDays              || '0'),
    eligibilityStatus:         String(rec.eligibilityStatus         || ''),
    totalMonthlyWage:          String(rec.monthlyWage               || rec.totalMonthlyWage || ''),
    dailyGross:                String(rec.dailyGross               || '0'),
    benefitInstallment:        String(rec.benefitInstallment        || 'প্রথম কিস্তি'),
    benifitDays:               String(rec.benifitDays              || '60'),
    benefitAmount:             String(rec.benefitAmount            || '0.00'),
    earnedLeaveDays:           String(rec.earnedLeaveDays          || ''),
    currentMonth:              String(rec.currentMonth             || ''),
    currentYear:               String(rec.currentYear              || ''),
    latestMonth:               String(rec.latestMonth              || ''),
    latestYear:                String(rec.latestYear               || ''),
    otherBenefits:             String(rec.otherBenefits            || ''),
    otherBenefitsType:         String(rec.otherBenefitsType        || 'দিন'),
    otherBenefitsValue:        String(rec.otherBenefitsValue       || ''),
    installment1Date:          toDateInput(rec.installment1Date)         || '',
    installment1Status:        String(rec.installment1Status       || 'pending'),
    installment1Amount:        String(rec.installment1Amount       || ''),
    installment1Salary:        String(rec.installment1Salary       || ''),
    installment1Others:        String(rec.installment1Others       || ''),
    installment1OthersLabel:   String(rec.installment1OthersLabel  || ''),
    installment2Date:          toDateInput(rec.installment2Date)         || '',
    installment2Status:        String(rec.installment2Status       || 'pending'),
    installment2Amount:        String(rec.installment2Amount       || ''),
    installment2Salary:        String(rec.installment2Salary       || ''),
    installment2Others:        String(rec.installment2Others       || ''),
    installment2OthersLabel:   String(rec.installment2OthersLabel  || ''),
    activeInstallment:         String(rec.activeInstallment        || 'প্রথম কিস্তি'),
    // formDate: restored from saved record only if installment1Status is paid
    // (first save locks it; subsequent edit keeps the original)
    formDate: toDateInput(rec.formDate) || prev.formDate || new Date().toISOString().split('T')[0],
  };
}

// ── Sidebar bill items builder ────────────────────────────────────────────────
// Spec table:
//
//  Saved state                                     BN subItems          EN subItems
//  ──────────────────────────────────────────────────────────────────────────────
//  অধিকারী নয়                                     (no dropdown)        (no dropdown)
//  inst1=paid AND inst2=pending                    [১ম কিস্তি]         [1st Inst.]
//  inst1=paid AND inst2=paid                       [১ম কিস্তি][২য়]    [1st][2nd]
//  benefitInstallment = '১ম+২য় কিস্তি'            [১ম+২য় কিস্তি]     [1st+2nd Inst.]

function buildBillItems(
  formData: MaternityFormData,
  activeInstallment: string,
  setActiveInstallment: (v: string) => void,
  setBillLang: (l: 'bn' | 'en') => void,
  setActiveStep: (s: string) => void,
) {
  const isEligible   = formData.eligibilityStatus === 'অধিকারী';
  const inst1Paid    = formData.installment1Status === 'paid';
  const inst2Paid    = formData.installment2Status === 'paid';
  const isCombined   = formData.benefitInstallment === '১ম+২য় কিস্তি';

  // অধিকারী নয় — direct click, no dropdown
  if (!isEligible) {
    return [
      {
        label:   'বাংলা বিল',
        onClick: () => { setBillLang('bn'); setActiveStep('bill-bn'); },
      },
      {
        label:   'English Bill',
        onClick: () => { setBillLang('en'); setActiveStep('bill-en'); },
      },
    ];
  }

  // Combined bill — one sub-item each
  if (isCombined) {
    return [
      {
        label:   'বাংলা বিল',
        onClick: () => { setBillLang('bn'); setActiveStep('bill-bn'); },
        subItems: [
          {
            label:   '১ম+২য় কিস্তি',
            active:  activeInstallment === '১ম+২য় কিস্তি',
            onClick: () => setActiveInstallment('১ম+২য় কিস্তি'),
          },
        ],
      },
      {
        label:   'English Bill',
        onClick: () => { setBillLang('en'); setActiveStep('bill-en'); },
        subItems: [
          {
            label:   '1st+2nd Inst.',
            active:  activeInstallment === '১ম+২য় কিস্তি',
            onClick: () => setActiveInstallment('১ম+২য় কিস্তি'),
          },
        ],
      },
    ];
  }

  // inst1 paid + inst2 pending → show only 1st installment sub-item
  if (inst1Paid && !inst2Paid) {
    return [
      {
        label:   'বাংলা বিল',
        onClick: () => { setBillLang('bn'); setActiveStep('bill-bn'); },
        subItems: [
          {
            label:   '১ম কিস্তি',
            active:  activeInstallment === 'প্রথম কিস্তি',
            onClick: () => setActiveInstallment('প্রথম কিস্তি'),
          },
        ],
      },
      {
        label:   'English Bill',
        onClick: () => { setBillLang('en'); setActiveStep('bill-en'); },
        subItems: [
          {
            label:   '1st Inst.',
            active:  activeInstallment === 'প্রথম কিস্তি',
            onClick: () => setActiveInstallment('প্রথম কিস্তি'),
          },
        ],
      },
    ];
  }

  // Both paid → show both sub-items
  if (inst1Paid && inst2Paid) {
    return [
      {
        label:   'বাংলা বিল',
        onClick: () => { setBillLang('bn'); setActiveStep('bill-bn'); },
        subItems: [
          {
            label:   '১ম কিস্তি',
            active:  activeInstallment === 'প্রথম কিস্তি',
            onClick: () => setActiveInstallment('প্রথম কিস্তি'),
          },
          {
            label:   '২য় কিস্তি',
            active:  activeInstallment === 'দ্বিতীয় কিস্তি',
            onClick: () => setActiveInstallment('দ্বিতীয় কিস্তি'),
          },
        ],
      },
      {
        label:   'English Bill',
        onClick: () => { setBillLang('en'); setActiveStep('bill-en'); },
        subItems: [
          {
            label:   '1st Inst.',
            active:  activeInstallment === 'প্রথম কিস্তি',
            onClick: () => setActiveInstallment('প্রথম কিস্তি'),
          },
          {
            label:   '2nd Inst.',
            active:  activeInstallment === 'দ্বিতীয় কিস্তি',
            onClick: () => setActiveInstallment('দ্বিতীয় কিস্তি'),
          },
        ],
      },
    ];
  }

  // Default (nothing paid yet) — both sub-items
  return [
    {
      label:   'বাংলা বিল',
      onClick: () => { setBillLang('bn'); setActiveStep('bill-bn'); },
      subItems: [
        {
          label:   '১ম কিস্তি',
          active:  activeInstallment === 'প্রথম কিস্তি',
          onClick: () => setActiveInstallment('প্রথম কিস্তি'),
        },
        {
          label:   '২য় কিস্তি',
          active:  activeInstallment === 'দ্বিতীয় কিস্তি',
          onClick: () => setActiveInstallment('দ্বিতীয় কিস্তি'),
        },
      ],
    },
    {
      label:   'English Bill',
      onClick: () => { setBillLang('en'); setActiveStep('bill-en'); },
      subItems: [
        {
          label:   '1st Inst.',
          active:  activeInstallment === 'প্রথম কিস্তি',
          onClick: () => setActiveInstallment('প্রথম কিস্তি'),
        },
        {
          label:   '2nd Inst.',
          active:  activeInstallment === 'দ্বিতীয় কিস্তি',
          onClick: () => setActiveInstallment('দ্বিতীয় কিস্তি'),
        },
      ],
    },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

const DisplayMaternityBenefit: React.FC = () => {
  const factory  = useFactory();
  const { user } = useAuth();

  const sheets  = useSheetsSync('maternity', factory.id, user?.name ?? 'unknown');
  const billRef = useRef<MaternityBillHandle>(null);

  const [auth,              setAuth]              = useState<AuthorizationState>(DEFAULT_AUTHORIZATION);
  const [activeStep,        setActiveStep]        = useState('employee');
  const [billLang,          setBillLang]          = useState<'bn' | 'en'>('bn');
  const [activeInstallment, setActiveInstallment] = useState<string>('প্রথম কিস্তি');

  const [formData, setFormData] = useState<MaternityFormData>({
    ...INITIAL_FORM_STATE,
    formDate: new Date().toISOString().split('T')[0],
  });

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFormData(p => ({
      ...INITIAL_FORM_STATE,
      ...BLANK_EMPLOYEE_FIELDS,
      companyName:      p.companyName,
      companyAddress:   p.companyAddress,
      companyNameEn:    p.companyNameEn,
      companyAddressEn: p.companyAddressEn,
      formDate:       new Date().toISOString().split('T')[0],
    }));
    setActiveStep('employee');
    setActiveInstallment('প্রথম কিস্তি');
    sheets.setEditingId(null);
  };

  // ── Auto-fill factory ─────────────────────────────────────────────────────
  useEffect(() => {
    setFormData(p => ({
      ...p,
      companyName:      factory.nameBn,
      companyAddress:   factory.addressBn,
      companyNameEn:    factory.nameEn,
      companyAddressEn: factory.addressEn,
      formDate:       p.formDate || new Date().toISOString().split('T')[0],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory.id]);

  // ── benefitInstallment → benifitDays + activeInstallment sync ─────────────
  useEffect(() => {
    const inst = formData.benefitInstallment;
    const days = inst === '১ম+২য় কিস্তি' ? '120' : '60';
    setFormData(p => ({ ...p, benifitDays: days }));
    if (inst === 'দ্বিতীয় কিস্তি') setActiveInstallment('দ্বিতীয় কিস্তি');
    else if (inst === '১ম+২য় কিস্তি') setActiveInstallment('১ম+২য় কিস্তি');
    else setActiveInstallment('প্রথম কিস্তি');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.benefitInstallment]);

  // ── Auto-calculations ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!formData.possibleDeliveryDate) return;
    const delivery = new Date(formData.possibleDeliveryDate);
    if (isNaN(delivery.getTime())) return;

    const start = new Date(delivery);
    start.setDate(start.getDate() - (MATERNITY_CONSTANTS.PRE_DELIVERY_DAYS - 1));
    const startStr = start.toISOString().split('T')[0];

    const end = new Date(start);
    end.setDate(end.getDate() + MATERNITY_CONSTANTS.MATERNITY_LEAVE_DAYS_OFFSET);
    const endStr = end.toISOString().split('T')[0];

    setFormData(p => ({
      ...p,
      maternityLeaveStartDate: startStr,
      maternityLeaveEndDate:   endStr,
    }));
  }, [formData.possibleDeliveryDate]);

  useEffect(() => {
    if (formData.joiningDate && formData.possibleDeliveryDate) {
      const { years, months, days } = MaternityFormula.calculateServiceDuration(
        formData.joiningDate, formData.possibleDeliveryDate,
      );
      setFormData(p => ({
        ...p,
        serviceYears:      String(years),
        serviceMonths:     String(months),
        serviceDays:       String(days),
        eligibilityStatus: MaternityFormula.checkCombinedEligibility(
          years, months, parseInt(formData.aliveChildren) || 0
        ),
      }));
    }
  }, [formData.joiningDate, formData.possibleDeliveryDate, formData.aliveChildren]);

  useEffect(() => {
    setFormData(p => ({ ...p, dailyGross: MaternityFormula.calculateDailyGross(p.totalMonthlyWage) }));
  }, [formData.totalMonthlyWage]);

  // benefitAmount = benifitDays × dailyGross (used in calc table display)
  useEffect(() => {
    setFormData(p => ({ ...p, benefitAmount: MaternityFormula.calculateBenefitAmount(p.benifitDays, p.dailyGross) }));
  }, [formData.benifitDays, formData.dailyGross]);

  // ── Derived total ─────────────────────────────────────────────────────────
  const totalPayable = () => MaternityFormula.calculateTotalPayable(formData);

  // ── Build DB record ───────────────────────────────────────────────────────
  const buildRecord = () => ({
    employeeName:              formData.employeeName,
    cardNo:                    formData.cardNo,
    designation:               formData.designation,
    department:                formData.section,
    joiningDate:               formData.joiningDate,
    deliveryDate:              formData.possibleDeliveryDate,
    leaveStartDate:            formData.maternityLeaveStartDate,
    leaveEndDate:              formData.maternityLeaveEndDate,
    maternitySymptomDate:      formData.maternitySymptomDate,
    maternityLeavenoticedDate: formData.maternityLeavenoticedDate,
    aliveChildren:             formData.aliveChildren,
    serviceYears:              formData.serviceYears,
    serviceMonths:             formData.serviceMonths,
    serviceDays:               formData.serviceDays,
    eligibilityStatus:         formData.eligibilityStatus,
    monthlyWage:               formData.totalMonthlyWage,
    dailyGross:                formData.dailyGross,
    benefitInstallment:        formData.benefitInstallment,
    benifitDays:               formData.benifitDays,
    benefitAmount:             formData.benefitAmount,
    earnedLeaveDays:           formData.earnedLeaveDays,
    currentMonth:              formData.currentMonth,
    currentYear:               formData.currentYear,
    latestMonth:               formData.latestMonth,
    latestYear:                formData.latestYear,
    otherBenefits:             formData.otherBenefits,
    otherBenefitsType:         formData.otherBenefitsType,
    otherBenefitsValue:        formData.otherBenefitsValue,
    installment1Date:          formData.installment1Date,
    installment1Status:        formData.installment1Status,
    installment1Amount:        formData.installment1Amount,
    installment1Salary:        formData.installment1Salary,
    installment1Others:        formData.installment1Others,
    installment1OthersLabel:   formData.installment1OthersLabel,
    installment2Date:          formData.installment2Date,
    installment2Status:        formData.installment2Status,
    installment2Amount:        formData.installment2Amount,
    installment2Salary:        formData.installment2Salary,
    installment2Others:        formData.installment2Others,
    installment2OthersLabel:   formData.installment2OthersLabel,
    activeInstallment:         activeInstallment,
    totalPayable:              totalPayable(),
    formDate:                  formData.formDate,
  });

  const isBill = activeStep.startsWith('bill');

  // ── Installment update handler ────────────────────────────────────────────
  // Inline-edit a paid installment row → partial update to the same DB record
  // ── Shared helper: after any installment edit or delete ──────────────────
  // Full reset — clears editingId, goes to কর্মীর তথ্য, hides সম্পাদনা মোড banner.
  const resetAfterInstallmentAction = (
    _restoredId: string,
    _merged: MaternityFormData,
  ) => {
    handleReset();
  };

  const handleInstallmentUpdate = async (
    key: InstallmentKey,
    patch: InstallmentPatch,
  ) => {
    if (!sheets.editingId) return;
    const updates: Partial<Record<string, string>> = {};
    if (key === 'installment1' || key === 'combined') {
      updates.installment1Date         = patch.date;
      updates.installment1Amount       = patch.amount;
      updates.installment1Salary       = patch.salary;
      updates.installment1Others       = patch.others;
      updates.installment1OthersLabel  = patch.othersLabel;
    }
    if (key === 'installment2') {
      updates.installment2Date         = patch.date;
      updates.installment2Amount       = patch.amount;
      updates.installment2Salary       = patch.salary;
      updates.installment2Others       = patch.others;
      updates.installment2OthersLabel  = patch.othersLabel;
    }
    const ok = await sheets.update(sheets.editingId, { ...buildRecord(), ...updates });
    if (ok) {
      const restoredId = sheets.editingId;
      const merged     = { ...formData, ...updates } as MaternityFormData;
      resetAfterInstallmentAction(restoredId, merged);
    }
  };

  // ── Installment delete handler ────────────────────────────────────────────
  // Reset that installment to pending → reappears in dropdown
  const handleInstallmentDelete = async (
    key: InstallmentKey,
  ) => {
    if (!sheets.editingId) return;
    const updates: Partial<Record<string, string>> = {};
    if (key === 'installment1' || key === 'combined') {
      updates.installment1Status       = 'pending';
      updates.installment1Date         = '';
      updates.installment1Amount       = '';
      updates.installment1Salary       = '';
      updates.installment1Others       = '';
      updates.installment1OthersLabel  = '';
    }
    if (key === 'installment2' || key === 'combined') {
      updates.installment2Status       = 'pending';
      updates.installment2Date         = '';
      updates.installment2Amount       = '';
      updates.installment2Salary       = '';
      updates.installment2Others       = '';
      updates.installment2OthersLabel  = '';
    }
    const ok = await sheets.update(sheets.editingId, { ...buildRecord(), ...updates });
    if (ok) {
      const restoredId = sheets.editingId;
      const merged     = { ...formData, ...updates } as MaternityFormData;
      resetAfterInstallmentAction(restoredId, merged);
    }
  };

  // ── Sidebar bill items ────────────────────────────────────────────────────
  const billItems = buildBillItems(
    formData, activeInstallment, setActiveInstallment, setBillLang, setActiveStep
  );

  // ── calcRows — live calc panel on the right ───────────────────────────────
  const calcRows = (() => {
    const currentInst = formData.benefitInstallment;
    const dailyG   = Number(formData.dailyGross || 0);
    const days     = currentInst === '১ম+২য় কিস্তি' ? 120 : 60;
    const benefit  = (days * dailyG).toFixed(2);
    const isElig   = formData.eligibilityStatus === 'অধিকারী';

    const rows = [
      { label: 'মাসিক মজুরি', value: formData.totalMonthlyWage ? `৳ ${formData.totalMonthlyWage}` : '—' },
      { label: 'দৈনিক মজুরি', value: dailyG ? `৳ ${formData.dailyGross}` : '—' },
      { label: 'সুবিধার দিন', value: `${days} দিন` },
    ];
    if (isElig) {
      rows.push({ label: currentInst === '১ম+২য় কিস্তি' ? '১২০ দিনের সুবিধা' : '৬০ দিনের সুবিধা', value: `৳ ${benefit}` });
    }
    if (currentInst !== 'দ্বিতীয় কিস্তি' && formData.earnedLeaveDays) {
      rows.push({ label: 'অর্জিত ছুটি', value: `${formData.earnedLeaveDays} দিন` });
    }
    return rows;
  })();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ModuleShell
      moduleName="মাতৃত্বকালীন সুবিধা"
      moduleNameEn="Maternity Benefit"
      date={formData.formDate}
      onDateChange={d => setFormData(p => ({ ...p, formDate: d }))}
      steps={STEPS}
      activeStep={activeStep}
      onStepChange={id => setActiveStep(id)}
      billItems={billItems}
      isBillActive={isBill}

      onSave={async () => {
        const record = buildRecord();
        const inst   = formData.benefitInstallment;
        let   isFirstInstallmentSave = false;

        // On 1st installment save, mark as paid and snapshot values
        if (inst === 'প্রথম কিস্তি' && formData.installment1Status !== 'paid') {
          isFirstInstallmentSave = true;
          const dailyG = Number(formData.dailyGross || 0);
          record.installment1Status      = 'paid';
          record.installment1Date        = formData.formDate;
          record.installment1Amount      = (60 * dailyG).toFixed(0);
          record.installment1Salary      = MaternityFormula.calculateEarnedWage(formData.earnedLeaveDays, formData.dailyGross, formData.currentMonth, formData.currentYear).toFixed(0);
          record.installment1Others      = MaternityFormula.calculateOtherBenefits(formData.otherBenefitsValue, formData.otherBenefitsType, formData.totalMonthlyWage).toFixed(0);
          record.installment1OthersLabel = formData.otherBenefits;
          setFormData(p => ({ ...p,
            installment1Status: 'paid', installment1Date: p.formDate,
            installment1Amount: record.installment1Amount as string,
            installment1Salary: record.installment1Salary as string,
            installment1Others: record.installment1Others as string,
            installment1OthersLabel: record.installment1OthersLabel as string,
          }));
        }
        // On 2nd installment save, snapshot values
        if (inst === 'দ্বিতীয় কিস্তি' && formData.installment2Status !== 'paid') {
          const dailyG = Number(formData.dailyGross || 0);
          record.installment2Status      = 'paid';
          record.installment2Date        = formData.formDate;
          record.installment2Amount      = (60 * dailyG).toFixed(0);
          record.installment2Salary      = MaternityFormula.calculateEarnedWage(formData.earnedLeaveDays, formData.dailyGross, formData.currentMonth, formData.currentYear).toFixed(0);
          record.installment2Others      = MaternityFormula.calculateOtherBenefits(formData.otherBenefitsValue, formData.otherBenefitsType, formData.totalMonthlyWage).toFixed(0);
          record.installment2OthersLabel = formData.otherBenefits;
          setFormData(p => ({ ...p,
            installment2Status: 'paid', installment2Date: p.formDate,
            installment2Amount: record.installment2Amount as string,
            installment2Salary: record.installment2Salary as string,
            installment2Others: record.installment2Others as string,
            installment2OthersLabel: record.installment2OthersLabel as string,
          }));
        }
        // On combined save, snapshot both
        if (inst === '১ম+২য় কিস্তি' && formData.installment1Status !== 'paid') {
          const dailyG = Number(formData.dailyGross || 0);
          record.installment1Status      = 'paid';
          record.installment2Status      = 'paid';
          record.installment1Date        = formData.formDate;
          record.installment2Date        = formData.formDate;   // ← set both dates
          record.installment1Amount      = (120 * dailyG).toFixed(0);
          record.installment1Salary      = MaternityFormula.calculateEarnedWage(formData.earnedLeaveDays, formData.dailyGross, formData.currentMonth, formData.currentYear).toFixed(0);
          record.installment1Others      = MaternityFormula.calculateOtherBenefits(formData.otherBenefitsValue, formData.otherBenefitsType, formData.totalMonthlyWage).toFixed(0);
          record.installment1OthersLabel = formData.otherBenefits;
          setFormData(p => ({ ...p,
            installment1Status: 'paid', installment2Status: 'paid',
            installment1Date: p.formDate, installment2Date: p.formDate,
            installment1Amount: record.installment1Amount,
            installment1Salary: record.installment1Salary,
            installment1Others: record.installment1Others,
            installment1OthersLabel: record.installment1OthersLabel,
          }));
        }

        // Capture everything needed BEFORE any async call or state mutation.
        const existingId  = sheets.editingId;
        const snap1Date   = record.installment1Date        as string;
        const snap1Amount = record.installment1Amount      as string;
        const snap1Salary = record.installment1Salary      as string;
        const snap1Others = record.installment1Others      as string;
        const snap1Label  = record.installment1OthersLabel as string;
        const savedCompany = formData.companyName;
        const savedAddrBn  = formData.companyAddress;
        const savedNameEn  = formData.companyNameEn;
        const savedAddrEn  = formData.companyAddressEn;

        // save() now returns the new record ID (string) or null on failure.
        // update() still returns boolean.
        let restoredId: string | null = existingId;
        let ok: boolean;

        if (existingId) {
          ok = await sheets.update(existingId, record);
        } else {
          const newId = await sheets.save(record);   // ← returns ID directly now
          ok = !!newId;
          if (newId) restoredId = newId;             // ← captured synchronously!
        }

        if (ok) {
          if (isFirstInstallmentSave) {
            // Blank the form so the user can enter 2nd installment data fresh,
            // but keep editingId pointing to THIS record so the next save
            // calls update() — not save() creating a new duplicate record.
            handleReset();

            // Restore editingId with the ID we captured synchronously above.
            if (restoredId) sheets.setEditingId(restoredId);

            // Restore company info + installment1 snapshot so
            // কিস্তি ব্যবস্থাপনা correctly shows the paid 1st installment row.
            setFormData(p => ({
              ...p,
              companyName:     savedCompany,
              companyAddress:  savedAddrBn,
              companyNameEn:   savedNameEn,
              companyAddressEn: savedAddrEn,
              installment1Status:      'paid',
              installment1Date:        toDateInput(snap1Date) || snap1Date,
              installment1Amount:      snap1Amount,
              installment1Salary:      snap1Salary,
              installment1Others:      snap1Others,
              installment1OthersLabel: snap1Label,
            }));

            // Land on the সুবিধার হিসাব step with a blank form ready for 2nd entry.
            setActiveStep('calculate');
          } else {
            handleReset();
          }
        }
        return ok;
      }}
      isSaving={sheets.isSaving}
      saveDisabled={!formData.employeeName}
      configured={sheets.configured}
      adapterName={sheets.adapterName}
      editingId={sheets.editingId}
      onCancelEdit={handleReset}
      onReset={handleReset}

      onUpdate={rec => {
        sheets.setEditingId(String(rec.id ?? ''));
        setFormData(p => recordToFormData(rec, p));
        setActiveStep('employee');
      }}
      updateModule="maternity"
      updateLabel="মাতৃত্ব রেকর্ড খুঁজুন"

      calcRows={calcRows}
      totalRow={{ label: 'মোট প্রদেয়', value: `৳ ${totalPayable()}` }}

      records={sheets.records}
      isLoading={sheets.isLoading}

      onLoadRecord={rec => {
        sheets.setEditingId(String(rec.id ?? ''));
        setFormData(p => recordToFormData(rec as Record<string, unknown>, p));
        setActiveStep('employee');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onDeleteRecord={sheets.remove}
      onReload={sheets.reload}

      auth={auth}
      onAuthChange={setAuth}
      onPrint={() => billRef.current?.print()}
      onPDF={() => billRef.current?.exportPDF() ?? Promise.resolve()}
      onExcel={async () => {
        const { exportToExcel } = await import('../../utils/excelExport');
        exportToExcel({
          filename:  `MaternityBenefit_${formData.employeeName || 'export'}`,
          sheetName: 'Maternity Benefit',
          headerInfo: [
            { label: 'Employee', value: formData.employeeName },
            { label: 'Card No',  value: formData.cardNo       },
            { label: 'Date',     value: formData.formDate     },
            { label: 'Payable',  value: totalPayable()        },
          ],
          sections: [{ title: 'Maternity Benefit', columns: [], rows: [] }],
        });
      }}
      lang="bn"
    >
      {activeStep === 'employee'  && <EmployeeInfoTable      formData={formData} handleChange={set} />}
      {activeStep === 'service'   && <ServiceDurationTable   formData={formData} handleChange={set} />}
      {activeStep === 'wage'      && <WageTable              formData={formData} handleChange={set} />}
      {activeStep === 'calculate' && (
        <BenefitCalculationTable
          formData={formData}
          handleChange={set}
          calculateTotalPayable={totalPayable}
          onInstallmentUpdate={handleInstallmentUpdate}
          onInstallmentDelete={handleInstallmentDelete}
        />
      )}
      {isBill && (
        <MaternityBenefitBill
          ref={billRef}
          formData={{ ...formData, activeInstallment }}
          totalPayable={totalPayable()}
          lang={billLang}
          authorization={auth}
        />
      )}
    </ModuleShell>
  );
};

export default DisplayMaternityBenefit;