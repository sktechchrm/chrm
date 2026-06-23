import React, { useState, useEffect, useRef } from "react";
import { useFactory } from "../../hooks/useFactory";
import { useAuth } from "../../context/AuthContext";
import { useSheetsSync } from "../../hooks/useSheetsSync";
import { DataUseCases } from "../../business/DataUseCases";
import ModuleShell from "../shell/ModuleShell";
import { DEFAULT_AUTHORIZATION } from "../common/AuthorizationBlock";
import type { AuthorizationState } from "../common/AuthorizationBlock";
import { EmployeeFormData } from "./FinalSettlementDataTypes";
import PaymentBill, { PaymentBillHandle } from "./PaymentBill";
import { toDateInput } from '../../utils/dateUtils';
import {
  calculateServiceDuration,
  calculateTotalDays,
  calculateBenefitYears,
  calculateWageComponents,
  calculateServiceCompensation,
  calculateDeathCompensation,
  calculateEarnedLeave,
  calculateNoticePay,
  calculateNoticeDeduction,
  calculateTotalDeductions,
  calculateTotalReceivable,
  calculateFinalTotal,
  calculateLastMonthSalary,
  calculateHourlyOvertimeRate,
  getServiceCompensationDaysPerYear,
  getDeathCompensationDaysPerYear,
  calculateLayOffCompensation,
  calculateGratuity,
  getGratuityDaysPerYear,
  isGratuityEligible,
} from "./FinalSettlementFormula";
import {
  EmployeeInfoTable,
  ServiceDurationTable,
  WageTable,
  CalculationTable,
} from "./finalSettlementTables";

// ─────────────────────────────────────────────────────────────────────────────
// Blank employee fields — clears all employee data while keeping company info
// ─────────────────────────────────────────────────────────────────────────────
const BLANK_EMPLOYEE_FIELDS: Partial<EmployeeFormData> = {
  employeeName: "", cardNo: "", designation: "", section: "",
  joiningDate: "", lastAttendance: "", terminationType: "",
  serviceYears: "", benefitYears: "", serviceMonths: "", serviceDays: "",
  totalDays: "", absentDays: "",
  basicWage: "", houseRent: "", totalMonthlyWage: "", dailyBasic: "", dailyGross: "",
  elQty: "", noticePayDay: "", noticeDeductionDay: "",
  earnedLeave: "", serviceCompensation: "", deathCompensation: "",
  layOffDays: "", layOffCompensation: "",
  gratuityAmount: "", gratuityDaysPerYear: "", paymentMethod: "compensation",
  noticePay: "", others: "", advanceDeduction: "",
  noticeDeduction: "", otherDeduction: "", totalDeductions: "",
  payableDay: "", payableHours: "",
  serviceCompDaysPerYear: "", DeathCompensationDaysPerYear: "",
  lastMonthName: "", lastMonthYear: "", lastMonthSalary: "", lastMonthOvertime: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// recordToFormData — single helper used by onLoadRecord, onUpdate, handleSearch.
// Keeps all three callers in sync — previously each set different fields causing
// missing data on load and ৳ 0 live calc after update search.
// ─────────────────────────────────────────────────────────────────────────────
function recordToFormData(
  rec: Record<string, unknown>,
  prev: EmployeeFormData,
): EmployeeFormData {
  return {
    ...prev,
    // ── Employee info ──────────────────────────────────────────────────────
    employeeName:                String(rec.employeeName                || ''),
    cardNo:                      String(rec.cardNo                      || ''),
    designation:                 String(rec.designation                 || ''),
    section:                     String(rec.section                     || ''),
    // ── Dates ──────────────────────────────────────────────────────────────
    joiningDate:                 toDateInput(rec.joiningDate),
    lastAttendance:              toDateInput(rec.lastAttendance),
    settlementDate:              toDateInput(rec.settlementDate) || prev.settlementDate,
    terminationType:             String(rec.terminationType             || ''),
    // ── Service duration ───────────────────────────────────────────────────
    serviceYears:                String(rec.serviceYears                || ''),
    serviceMonths:               String(rec.serviceMonths               || ''),
    serviceDays:                 String(rec.serviceDays                 || ''),
    benefitYears:                String(rec.benefitYears                || ''),
    totalDays:                   String(rec.totalDays                   || ''),
    absentDays:                  String(rec.absentDays                  || ''),
    // ── Wage components ────────────────────────────────────────────────────
    totalMonthlyWage:            String(rec.totalWage                   || ''),  // saved as totalWage
    basicWage:                   String(rec.basicWage                   || ''),
    houseRent:                   String(rec.houseRent                   || ''),
    foodAllowance:               String(rec.foodAllowance               || prev.foodAllowance),
    medicalAllowance:            String(rec.medicalAllowance            || prev.medicalAllowance),
    transportAllowance:          String(rec.transportAllowance          || prev.transportAllowance),
    dailyBasic:                  String(rec.dailyBasic                  || ''),
    dailyGross:                  String(rec.dailyGross                  || ''),
    // ── Calculation inputs ──────────────────────────────────────────────────
    elQty:                       String(rec.elQty                       || ''),
    noticePayDay:                String(rec.noticePayDay                || ''),
    noticeDeductionDay:          String(rec.noticeDeductionDay          || ''),
    payableDay:                  String(rec.payableDay                  || ''),
    payableHours:                String(rec.payableHours                || ''),
    lastMonthName:               String(rec.lastMonthName               || ''),
    lastMonthYear:               String(rec.lastMonthYear               || ''),
    // ── Calculated earnings ────────────────────────────────────────────────
    earnedLeave:                 String(rec.earnedLeave                 || ''),
    serviceCompensation:         String(rec.serviceCompensation         || ''),
    deathCompensation:           String(rec.deathCompensation           || ''),
    layOffDays:                  String(rec.layOffDays                  || ''),
    layOffCompensation:          String(rec.layOffCompensation          || ''),
    gratuityAmount:              String(rec.gratuityAmount              || ''),
    gratuityDaysPerYear:         String(rec.gratuityDaysPerYear         || ''),
    paymentMethod:               String(rec.paymentMethod               || 'compensation'),
    noticePay:                   String(rec.noticePay                   || ''),
    lastMonthSalary:             String(rec.lastMonthSalary             || ''),
    lastMonthOvertime:           String(rec.lastMonthOvertime           || ''),
    others:                      String(rec.others                      || ''),
    serviceCompDaysPerYear:      String(rec.serviceCompDaysPerYear      || ''),
    DeathCompensationDaysPerYear:String(rec.DeathCompensationDaysPerYear|| ''),
    // ── Deductions ─────────────────────────────────────────────────────────
    advanceDeduction:            String(rec.advanceDeduction            || ''),
    noticeDeduction:             String(rec.noticeDeduction             || ''),
    otherDeduction:              String(rec.otherDeduction              || ''),
    totalDeductions:             String(rec.totalDeductions             || ''),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FinalSettlementForm() {
  const [activeTab,     setActiveTab]     = useState('কর্মী তথ্য');
  const [authorization, setAuthorization] = useState<AuthorizationState>(DEFAULT_AUTHORIZATION);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchStatus,  setSearchStatus]  = useState<'idle'|'found'|'notfound'>('idle');
  const [billView,      setBillView]      = useState<'bn'|'en'|null>(null);

  const factory  = useFactory();
  const { user } = useAuth();

  // FIX: editingIdRef removed — sheets.editingId (state) is single source of truth.
  // The ref caused desync: update went to save branch, edit mode banner never cleared.
  const sheets  = useSheetsSync('settlements', factory.id, user?.name ?? 'unknown');
  const billRef = useRef<PaymentBillHandle>(null);

  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeName: "", cardNo: "", designation: "", section: "",
    joiningDate: "", lastAttendance: "",
    settlementDate: new Date().toISOString().split("T")[0],
    terminationType: "", serviceYears: "", benefitYears: "",
    serviceMonths: "", serviceDays: "", totalDays: "", absentDays: "",
    basicWage: "", houseRent: "",
    foodAllowance: "1250", medicalAllowance: "750", transportAllowance: "450",
    totalMonthlyWage: "", dailyBasic: "", dailyGross: "",
    elQty: "", noticePayDay: "", noticeDeductionDay: "",
    earnedLeave: "", serviceCompensation: "", deathCompensation: "",
    layOffDays: "", layOffCompensation: "",
    gratuityAmount: "", gratuityDaysPerYear: "", paymentMethod: "compensation",
    noticePay: "", others: "", advanceDeduction: "",
    noticeDeduction: "", otherDeduction: "", totalDeductions: "",
    companyName: "", companyAddress: "", companyNameEn: "", companyAddressEn: "",
    payableDay: "", payableHours: "",
    serviceCompDaysPerYear: "", DeathCompensationDaysPerYear: "",
    lastMonthName: "", lastMonthYear: "", lastMonthSalary: "", lastMonthOvertime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Auto-fill factory name/address ────────────────────────────────────────
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      companyName:      factory.nameBn,
      companyAddress:   factory.addressBn,
      companyNameEn:    factory.nameEn,
      companyAddressEn: factory.addressEn,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory.id]);

  // ── Reset form ────────────────────────────────────────────────────────────
  const handleNewEmployee = () => {
    setFormData(prev => ({
      ...prev,
      ...BLANK_EMPLOYEE_FIELDS,
      companyName:      prev.companyName,
      companyAddress:   prev.companyAddress,
      companyNameEn:    prev.companyNameEn,
      companyAddressEn: prev.companyAddressEn,
      settlementDate: new Date().toISOString().split("T")[0],
    }));
    setSearchQuery('');
    setSearchStatus('idle');
    setBillView(null);
    sheets.setEditingId(null);   // FIX: single source of truth — no ref to clear
    setActiveTab('কর্মী তথ্য');
  };

  // ── Calculations ──────────────────────────────────────────────────────────

  useEffect(() => {
    setFormData(p => ({
      ...p,
      lastMonthSalary: calculateLastMonthSalary(
        parseFloat(formData.totalMonthlyWage) || 0,
        parseFloat(formData.payableDay)       || 0,
        formData.lastMonthName,
        formData.lastMonthYear
      ).toString(),
    }));
  }, [formData.totalMonthlyWage, formData.payableDay, formData.lastMonthName, formData.lastMonthYear]);

  useEffect(() => {
    const hourlyRate    = calculateHourlyOvertimeRate(parseFloat(formData.basicWage) || 0);
    const totalOvertime = parseFloat((hourlyRate * (parseFloat(formData.payableHours) || 0)).toFixed(2));
    setFormData(p => ({
      ...p,
      hourlyOvertimeRate: hourlyRate.toString(),
      lastMonthOvertime:  totalOvertime.toString(),
    }));
  }, [formData.basicWage, formData.payableHours]);

  useEffect(() => {
    const { years, months, days } = calculateServiceDuration(formData.joiningDate, formData.lastAttendance);
    setFormData(p => ({
      ...p,
      serviceYears:  years.toString(),
      serviceMonths: months.toString(),
      serviceDays:   days.toString(),
    }));
  }, [formData.joiningDate, formData.lastAttendance]);

  useEffect(() => {
    const total = calculateTotalDays(
      parseInt(formData.serviceMonths) || 0,
      parseInt(formData.serviceDays)   || 0,
      parseInt(formData.absentDays)    || 0
    );
    setFormData(p => ({ ...p, totalDays: total.toString() }));
  }, [formData.serviceMonths, formData.serviceDays, formData.absentDays]);

  useEffect(() => {
    const benefit = calculateBenefitYears(
      parseInt(formData.serviceYears) || 0,
      parseInt(formData.totalDays)    || 0
    );
    setFormData(p => ({ ...p, benefitYears: benefit.toString() }));
  }, [formData.serviceYears, formData.totalDays]);

  useEffect(() => {
    const result = calculateWageComponents(
      parseFloat(formData.totalMonthlyWage)   || 0,
      parseFloat(formData.foodAllowance)      || 0,
      parseFloat(formData.medicalAllowance)   || 0,
      parseFloat(formData.transportAllowance) || 0
    );
    setFormData(p => ({
      ...p,
      basicWage:  result.basicWage.toString(),
      houseRent:  result.houseRent.toString(),
      dailyBasic: result.dailyBasic.toString(),
      dailyGross: result.dailyGross.toString(),
    }));
  }, [formData.totalMonthlyWage, formData.foodAllowance, formData.medicalAllowance, formData.transportAllowance]);

  useEffect(() => {
    const sDays = getServiceCompensationDaysPerYear(formData.terminationType, Number(formData.benefitYears || 0));
    const dDays = getDeathCompensationDaysPerYear(formData.terminationType);
    const gDays = getGratuityDaysPerYear(Number(formData.benefitYears || 0));
    setFormData(p => ({
      ...p,
      serviceCompDaysPerYear:       sDays.toString(),
      DeathCompensationDaysPerYear: dDays.toString(),
      gratuityDaysPerYear:          gDays.toString(),
    }));
  }, [formData.terminationType, formData.benefitYears]);

  useEffect(() => {
    const usesGratuity = formData.paymentMethod === "gratuity" && isGratuityEligible(formData.terminationType);
    setFormData(p => ({
      ...p,
      // When গ্র্যাচুইটি is the chosen method, the statutory day-rate compensation
      // is NOT also paid — the Act gives "compensation or gratuity, whichever is
      // higher", not both. Suppressing these to ০ here keeps the calculation
      // table and the printed bill consistent without special-casing every place
      // that reads these two fields.
      serviceCompensation: usesGratuity ? "0" : calculateServiceCompensation(formData.terminationType, parseFloat(formData.benefitYears) || 0, parseFloat(formData.dailyBasic) || 0).toString(),
      deathCompensation:   usesGratuity ? "0" : calculateDeathCompensation(formData.terminationType,   parseFloat(formData.benefitYears) || 0, parseFloat(formData.dailyBasic) || 0).toString(),
    }));
  }, [formData.terminationType, formData.benefitYears, formData.dailyBasic, formData.paymentMethod]);

  // ── Gratuity (Section 2(10)) — always computed as a reference figure so
  // HR can compare it against statutory compensation before choosing ──
  useEffect(() => {
    setFormData(p => ({
      ...p,
      gratuityAmount: calculateGratuity(parseFloat(formData.benefitYears) || 0, parseFloat(formData.dailyBasic) || 0).toString(),
    }));
  }, [formData.benefitYears, formData.dailyBasic]);

  // ── Reset payment method to ক্ষতিপূরণ whenever the settlement type changes
  // to one the Act doesn't allow a gratuity comparison for (e.g. বরখাস্ত (২৩),
  // বরখাস্ত (২৩.৪: খ/ছ), লে-অফ (১৬)) — prevents a stale "gratuity" selection
  // from silently zeroing out compensation on an ineligible type ──
  useEffect(() => {
    if (!isGratuityEligible(formData.terminationType) && formData.paymentMethod === "gratuity") {
      setFormData(p => ({ ...p, paymentMethod: "compensation" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.terminationType]);

  // ── Lay-off compensation (Section 16) — only meaningful for লে-অফ (১৬) ──
  useEffect(() => {
    setFormData(p => ({
      ...p,
      layOffCompensation: calculateLayOffCompensation(
        parseFloat(formData.layOffDays || "0") || 0,
        parseFloat(formData.dailyBasic) || 0,
        parseFloat(formData.houseRent) || 0
      ).toString(),
    }));
  }, [formData.layOffDays, formData.dailyBasic, formData.houseRent]);

  useEffect(() => {
    setFormData(p => ({
      ...p,
      totalDeductions: calculateTotalDeductions(
        parseFloat(formData.advanceDeduction) || 0,
        parseFloat(formData.noticeDeduction)  || 0,
        parseFloat(formData.otherDeduction)   || 0
      ).toString(),
    }));
  }, [formData.advanceDeduction, formData.noticeDeduction, formData.otherDeduction]);

  useEffect(() => {
    setFormData(p => ({
      ...p,
      earnedLeave:     calculateEarnedLeave(parseFloat(formData.elQty) || 0,                        parseFloat(formData.dailyGross) || 0).toString(),
      noticePay:       calculateNoticePay(parseFloat(formData.noticePayDay) || 0,                   parseFloat(formData.dailyBasic) || 0).toString(),
      noticeDeduction: calculateNoticeDeduction(parseFloat(formData.noticeDeductionDay) || 0,       parseFloat(formData.dailyBasic) || 0).toString(),
    }));
  }, [formData.elQty, formData.noticePayDay, formData.noticeDeductionDay, formData.dailyGross, formData.dailyBasic]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (!DataUseCases.isConfigured(factory.id)) { setSearchStatus('notfound'); return; }
    const result = await DataUseCases.load('settlements', factory.id, 200);
    if (!result.ok) { setSearchStatus('notfound'); return; }
    const q     = searchQuery.trim().toLowerCase();
    const match = result.records.find(r =>
      String(r.cardNo       ?? '').toLowerCase() === q ||
      String(r.id           ?? '').toLowerCase() === q ||
      String(r.employeeName ?? '').toLowerCase().includes(q)
    );
    if (match) {
      // FIX: uses recordToFormData helper — same fields as onLoadRecord/onUpdate
      setFormData(prev => recordToFormData(match as Record<string, unknown>, prev));
      sheets.setEditingId(String(match.id ?? ''));
      setSearchStatus('found');
      setActiveTab('কর্মী তথ্য');
    } else {
      setSearchStatus('notfound');
    }
  };

  // ── Derived totals ────────────────────────────────────────────────────────
  const getTotalReceivable = () => calculateTotalReceivable(formData);
  const getFinalTotal      = () => calculateFinalTotal(getTotalReceivable(), formData.totalDeductions);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ModuleShell
      moduleName="চূড়ান্ত পাওনা হিসাব"
      moduleNameEn="Final Settlement"
      date={formData.settlementDate}
      onDateChange={d => setFormData(p => ({ ...p, settlementDate: d }))}
      steps={[
        { id: 'কর্মী তথ্য',    label: 'কর্মী তথ্য',    icon: 'ti-user-circle',    fieldCount: 5 },
        { id: 'চাকরির মেয়াদ', label: 'চাকরির মেয়াদ', icon: 'ti-calendar-stats', fieldCount: 4 },
        { id: 'বেতন তথ্য',     label: 'বেতন তথ্য',     icon: 'ti-cash',           fieldCount: 6 },
        { id: 'হিসাব বিবরণ',  label: 'হিসাব বিবরণ',  icon: 'ti-calculator',     fieldCount: 5 },
      ]}
      activeStep={activeTab}
      onStepChange={tab => { setActiveTab(tab); setBillView(null); }}
      billItems={[
        { label: 'বাংলা বিল',    onClick: () => { setBillView('bn'); setActiveTab('পেমেন্ট বিল'); } },
        { label: 'English Bill', onClick: () => { setBillView('en'); setActiveTab('পেমেন্ট বিল'); } },
      ]}
      isBillActive={activeTab === 'পেমেন্ট বিল'}

      // FIX: reads sheets.editingId (state) not editingIdRef (ref).
      // FIX: buildRecord now saves ALL form fields — 24 fields were previously missing.
      // FIX: finalTotal now saves getFinalTotal() not formData.totalDeductions.
      onSave={async () => {
        const record = {
          // ── Employee ───────────────────────────────────────────────────
          employeeName:                formData.employeeName,
          cardNo:                      formData.cardNo,
          designation:                 formData.designation,
          section:                     formData.section,
          // ── Dates ──────────────────────────────────────────────────────
          joiningDate:                 formData.joiningDate,
          lastAttendance:              formData.lastAttendance,
          settlementDate:              formData.settlementDate,
          terminationType:             formData.terminationType,
          // ── Service duration ───────────────────────────────────────────
          serviceYears:                formData.serviceYears,
          serviceMonths:               formData.serviceMonths,
          serviceDays:                 formData.serviceDays,
          benefitYears:                formData.benefitYears,
          totalDays:                   formData.totalDays,
          absentDays:                  formData.absentDays,
          // ── Wage ───────────────────────────────────────────────────────
          totalWage:                   formData.totalMonthlyWage,  // alias: totalWage
          basicWage:                   formData.basicWage,
          houseRent:                   formData.houseRent,
          foodAllowance:               formData.foodAllowance,
          medicalAllowance:            formData.medicalAllowance,
          transportAllowance:          formData.transportAllowance,
          dailyBasic:                  formData.dailyBasic,
          dailyGross:                  formData.dailyGross,
          // ── Calculation inputs ──────────────────────────────────────────
          elQty:                       formData.elQty,
          noticePayDay:                formData.noticePayDay,
          noticeDeductionDay:          formData.noticeDeductionDay,
          payableDay:                  formData.payableDay,
          payableHours:                formData.payableHours,
          lastMonthName:               formData.lastMonthName,
          lastMonthYear:               formData.lastMonthYear,
          // ── Earnings ───────────────────────────────────────────────────
          earnedLeave:                 formData.earnedLeave,
          serviceCompensation:         formData.serviceCompensation,
          deathCompensation:           formData.deathCompensation,
          layOffDays:                  formData.layOffDays,
          layOffCompensation:          formData.layOffCompensation,
          gratuityAmount:              formData.gratuityAmount,
          gratuityDaysPerYear:         formData.gratuityDaysPerYear,
          paymentMethod:               formData.paymentMethod,
          noticePay:                   formData.noticePay,
          lastMonthSalary:             formData.lastMonthSalary,
          lastMonthOvertime:           formData.lastMonthOvertime,
          others:                      formData.others,
          serviceCompDaysPerYear:      formData.serviceCompDaysPerYear,
          DeathCompensationDaysPerYear:formData.DeathCompensationDaysPerYear,
          // ── Deductions ──────────────────────────────────────────────────
          advanceDeduction:            formData.advanceDeduction,
          noticeDeduction:             formData.noticeDeduction,
          otherDeduction:              formData.otherDeduction,
          totalDeductions:             formData.totalDeductions,
          // ── Summary ─────────────────────────────────────────────────────
          totalReceivable:             getTotalReceivable(),
          finalTotal:                  getFinalTotal(),   // FIX: was saving totalDeductions
        };

        // FIX: single source of truth — sheets.editingId drives create vs update
        const ok = sheets.editingId
          ? await sheets.update(sheets.editingId, record)
          : await sheets.save(record);

        if (ok) { handleNewEmployee(); }
        return ok;
      }}
      isSaving={sheets.isSaving}
      configured={sheets.configured}
      adapterName={sheets.adapterName}
      saveDisabled={!formData.employeeName}
      editingId={sheets.editingId}
      onCancelEdit={handleNewEmployee}
      onReset={handleNewEmployee}

      // FIX: uses recordToFormData — restores ALL 38 fields, not just 12
      onUpdate={rec => {
        sheets.setEditingId(String(rec.id ?? ''));
        setFormData(prev => recordToFormData(rec, prev));
        setActiveTab('কর্মী তথ্য');
      }}
      updateModule="settlements"
      updateLabel="Settlement রেকর্ড খুঁজুন"

      calcRows={[
        { label: 'মোট মজুরি',   value: formData.totalMonthlyWage ? `৳ ${formData.totalMonthlyWage}` : '—' },
        { label: 'সেবার বছর',   value: formData.serviceYears ? `${formData.serviceYears} বছর` : '—' },
        { label: 'মোট প্রাপ্য', value: getTotalReceivable() !== '0.00' ? `৳ ${getTotalReceivable()}` : '—' },
        { label: 'মোট কর্তন',   value: formData.totalDeductions ? `৳ ${formData.totalDeductions}` : '—', muted: true },
      ]}
      totalRow={{ label: 'নিট প্রদেয়', value: `৳ ${getFinalTotal()}` }}

      records={sheets.records}
      isLoading={sheets.isLoading}

      // FIX: uses recordToFormData — same as onUpdate, all fields consistent
      onLoadRecord={rec => {
        sheets.setEditingId(String(rec.id ?? ''));
        setFormData(prev => recordToFormData(rec as Record<string, unknown>, prev));
        setActiveTab('কর্মী তথ্য');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onDeleteRecord={sheets.remove}
      onReload={sheets.reload}

      auth={authorization}
      onAuthChange={setAuthorization}
      onPrint={() => billRef.current?.print()}
      onPDF={() => billRef.current?.exportPDF() ?? Promise.resolve()}
      onExcel={async () => {
        const { exportToExcel } = await import('../../utils/excelExport');
        exportToExcel({
          filename:  `FinalSettlement_${formData.employeeName || 'export'}`,
          sheetName: 'Final Settlement',
          headerInfo: [
            { label: 'Employee', value: formData.employeeName },
            { label: 'Card No',  value: formData.cardNo },
            { label: 'Date',     value: formData.settlementDate },
            { label: 'Net Pay',  value: getFinalTotal() },
          ],
          sections: [{ title: 'Final Settlement', columns: [], rows: [] }],
        });
      }}
      lang="bn"
    >
      {activeTab === 'কর্মী তথ্য' && (
        <EmployeeInfoTable formData={formData} handleChange={handleChange} />
      )}
      {activeTab === 'চাকরির মেয়াদ' && (
        <ServiceDurationTable formData={formData} handleChange={handleChange} />
      )}
      {activeTab === 'বেতন তথ্য' && (
        <WageTable formData={formData} handleChange={handleChange} />
      )}
      {activeTab === 'হিসাব বিবরণ' && (
        <CalculationTable
          formData={formData}
          handleChange={handleChange}
          calculateTotalReceivable={getTotalReceivable}
          calculateFinalTotal={getFinalTotal}
        />
      )}
      {activeTab === 'পেমেন্ট বিল' && (
        <PaymentBill
          ref={billRef}
          formData={formData}
          totalReceivable={getTotalReceivable()}
          totalDeductions={formData.totalDeductions}
          netPayable={getFinalTotal()}
          lang={billView ?? 'bn'}
          authorization={authorization}
        />
      )}
    </ModuleShell>
  );
}