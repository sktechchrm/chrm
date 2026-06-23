// ─────────────────────────────────────────────────────────────────────────────
// IncrementManager.tsx
// Path: src/components/incrementBill/IncrementManager.tsx
//
// CHANGES FROM PREVIOUS VERSION (same pattern as RequisitionManager):
//  - Removed editingIdRef (stale closure bug) → uses sheets.editingId directly
//  - Removed localStorage draft auto-save → DB is the single source of truth
//  - Removed window.confirm in handleReset → ModuleShell handles confirmation
//  - date now lives in ModuleShell header (date/onDateChange)
//  - preparedBy/preparedByDesignation auto-filled from logged-in user session
//  - buildRecord/recordToFormData centralize record shape
//  - billItems added: sidebar "প্রিভিউ" link navigates to preview step
//  - Step renamed: 'view' → 'preview'
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useFactory } from '../../hooks/useFactory';
import { useAuth }                           from '../../context/AuthContext';
import { useSheetsSync }                     from '../../hooks/useSheetsSync';
import { DEFAULT_AUTHORIZATION }             from '../common/AuthorizationBlock';
import type { AuthorizationState }           from '../common/AuthorizationBlock';
import ModuleShell                           from '../shell/ModuleShell';
import IncrementFormComponent                from './Incrementform';
import IncrementViewComponent                from './Incrementview';
import { exportToPDF }                       from '../../utils/pdfExport';
import { toDateInput }                       from '../../utils/dateUtils';
import { BASE_PRINT_CSS, PAGE_A4_LANDSCAPE }  from '../../utils/printCSS';
import {
  IncrementData,
  IncrementManagerProps,
  INITIAL_INCREMENT_STATE,
  EmployeeIncrement,
  calculateTotals,
} from './dataType';

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'form', label: 'প্রস্তাব ফর্ম', icon: 'ti-file-plus', fieldCount: 5 },
];

// ── recordToFormData ──────────────────────────────────────────────────────────

function recordToFormData(
  rec: Record<string, unknown>,
  prev: IncrementData,
): IncrementData {
  // Prefer the full employees array (employeesJson) saved by buildRecord.
  // Fall back to reconstructing a single employee from the legacy summary
  // columns for older records saved before employeesJson existed.
  const employees: EmployeeIncrement[] = (() => {
    try {
      const parsed = JSON.parse(String(rec.employeesJson ?? ''));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((emp, i) => ({
          slNo:                i + 1,
          employeeName:        String(emp.employeeName        ?? ''),
          employeeId:          String(emp.employeeId          ?? ''),
          designation:         String(emp.designation         ?? ''),
          department:          String(emp.department          ?? ''),
          dateOfJoining:       String(emp.dateOfJoining        ?? ''),
          serviceAge:          String(emp.serviceAge           ?? ''),
          basicSalary:         String(emp.basicSalary          ?? ''),
          grossSalary:         String(emp.grossSalary          ?? ''),
          lastIncrementDate:   String(emp.lastIncrementDate    ?? ''),
          lastIncrementAmount: String(emp.lastIncrementAmount  ?? ''),
          proposedIncrement:   String(emp.proposedIncrement    ?? ''),
          proposedSalary:      String(emp.proposedSalary       ?? ''),
          effectiveFrom:       String(emp.effectiveFrom        ?? ''),
          recommendPromotion:  String(emp.recommendPromotion   ?? ''),
          remarks:             String(emp.remarks              ?? ''),
        }));
      }
    } catch { /* fall through to legacy single-employee reconstruction */ }

    // Legacy fallback — pre-employeesJson records stored only one employee
    return [{
      slNo: 1,
      employeeName:        String(rec.employeeName    ?? ''),
      employeeId:          String(rec.cardNo          ?? ''),
      designation:         String(rec.designation     ?? ''),
      department:          String(rec.department      ?? ''),
      dateOfJoining:       '',
      serviceAge:          '',
      basicSalary:         String(rec.oldBasic        ?? ''),
      grossSalary:         String(rec.oldTotal        ?? ''),
      lastIncrementDate:   '',
      lastIncrementAmount: '',
      proposedIncrement:   String(rec.incrementAmount ?? ''),
      proposedSalary:      String(rec.newTotal        ?? ''),
      effectiveFrom:       toDateInput(rec.effectiveDate),
      recommendPromotion:  '',
      remarks:             '',
    }];
  })();

  return {
    ...prev,
    subject: String(rec.subject ?? rec.reason ?? prev.subject),
    date:    toDateInput(rec.date) || prev.date,
    employees,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IncrementManager({ setCurrentPage }: IncrementManagerProps) {
  const factory  = useFactory();
  const { user } = useAuth();

  const sheets   = useSheetsSync('increments', factory.id, user?.name ?? 'unknown');
  const viewRef  = useRef<HTMLDivElement>(null);

  const [authorization, setAuthorization] = useState<AuthorizationState>(DEFAULT_AUTHORIZATION);
  const [activeStep,    setActiveStep]    = useState<'form' | 'preview'>('form');
  const [increment,     setIncrement]     = useState<IncrementData>(INITIAL_INCREMENT_STATE);

  // ── Auto-fill factory info from session ────────────────────────────────────
  useEffect(() => {
    setIncrement(prev => ({
      ...prev,
      factoryName:    factory.nameEn,
      factoryAddress: factory.addressEn,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory.id]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setIncrement(prev => ({
      ...INITIAL_INCREMENT_STATE,
      // Preserve factory data from session
      factoryName:    prev.factoryName,
      factoryAddress: prev.factoryAddress,
    }));
    setActiveStep('form');
    sheets.setEditingId(null);
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const el = viewRef.current;
    if (!el) { window.print(); return; }
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:297mm;height:210mm;border:none;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument!;
    const styles = Array.from(document.styleSheets)
      .map(ss => { try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; } })
      .join('\n');
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>@page{size:A4 landscape;margin:10mm 8mm 10mm 8mm;}body{margin:0;}${styles}</style>
      </head><body>${el.outerHTML}</body></html>`);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    const el = viewRef.current;
    if (!el) return;
    await exportToPDF({ element: el, filename: `SalaryIncrement_${increment.factoryName || 'document'}`, scale: 2 });
  };

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    const { exportToExcel } = await import('../../utils/excelExport');
    const totals = calculateTotals(increment.employees ?? []);

    const columns = [
      { key: 'slNo',                header: 'Sl No',              width: 6  },
      { key: 'employeeName',        header: 'Employee Name',      width: 24 },
      { key: 'employeeId',          header: 'ID',                 width: 12 },
      { key: 'designation',         header: 'Designation',        width: 20 },
      { key: 'department',          header: 'Department',         width: 18 },
      { key: 'serviceAge',          header: 'Service Age',        width: 12 },
      { key: 'basicSalary',         header: 'Current Basic',      width: 14 },
      { key: 'grossSalary',         header: 'Current Gross',      width: 14 },
      { key: 'lastIncrementDate',   header: 'Last Inc. Date',     width: 14 },
      { key: 'lastIncrementAmount', header: 'Last Inc. Amount',   width: 14 },
      { key: 'proposedIncrement',   header: 'Proposed Increment', width: 16 },
      { key: 'proposedSalary',      header: 'Proposed Salary',    width: 16 },
      { key: 'effectiveFrom',       header: 'Effective From',     width: 14 },
      { key: 'recommendPromotion',  header: 'Promotion',          width: 14 },
      { key: 'remarks',             header: 'Remarks',            width: 24 },
    ];

    const rows = (increment.employees ?? []).map(emp => ({
      slNo:                emp.slNo,
      employeeName:        emp.employeeName,
      employeeId:          emp.employeeId,
      designation:         emp.designation,
      department:          emp.department,
      serviceAge:          emp.serviceAge,
      basicSalary:         emp.basicSalary ? Number(emp.basicSalary) : '',
      grossSalary:         emp.grossSalary ? Number(emp.grossSalary) : '',
      lastIncrementDate:   emp.lastIncrementDate,
      lastIncrementAmount: emp.lastIncrementAmount ? Number(emp.lastIncrementAmount) : '',
      proposedIncrement:   emp.proposedIncrement ? Number(emp.proposedIncrement) : '',
      proposedSalary:      emp.proposedSalary ? Number(emp.proposedSalary) : '',
      effectiveFrom:       emp.effectiveFrom,
      recommendPromotion:  emp.recommendPromotion,
      remarks:             emp.remarks,
    }));

    exportToExcel({
      filename:  `SalaryIncrement_${increment.subject.replace(/[^a-z0-9]/gi, '_') || 'Document'}_${increment.date || new Date().toISOString().split('T')[0]}`,
      sheetName: 'Increment',
      title:     'Salary Increment Proposal',
      headerInfo: [
        { label: 'Factory',       value: increment.factoryName || '—' },
        { label: 'Subject',       value: increment.subject     || '—' },
        { label: 'Date',          value: increment.date        || '—' },
        { label: 'Total Employees', value: String(increment.employees?.length ?? 0) },
        { label: 'Total Proposed Increment (৳)', value: totals.totalProposedInc },
      ],
      sections: [{ title: 'Employees', columns, rows }],
    });
  };

  const firstEmp = increment.employees?.[0];

  // ── Build DB record ───────────────────────────────────────────────────────
  const buildRecord = () => ({
    subject: increment.subject ?? '',
    date:    increment.date    ?? '',
    preparedBy:            authorization.preparedBy,
    preparedByDesignation: authorization.preparedByDesignation,
    // Legacy single-employee summary columns — kept for backward
    // compatibility with the records list / older sheets.
    employeeName:    firstEmp?.employeeName    ?? '',
    cardNo:          firstEmp?.employeeId      ?? '',
    designation:     firstEmp?.designation     ?? '',
    department:      firstEmp?.department      ?? '',
    oldBasic:        firstEmp?.basicSalary     ?? '',
    oldTotal:        firstEmp?.grossSalary     ?? '',
    newBasic:        firstEmp?.proposedSalary  ?? '',
    newTotal:        firstEmp?.proposedSalary  ?? '',
    incrementAmount: firstEmp?.proposedIncrement ?? '',
    effectiveDate:   firstEmp?.effectiveFrom   ?? '',
    reason:          increment.subject         ?? '',
    // Full employee list — all rows added via "+ Add Employee" are saved here
    employeesJson:   JSON.stringify(increment.employees ?? []),
    totalEmployees:  String(increment.employees?.length ?? 0),
  });

  // ── Sidebar output items ──────────────────────────────────────────────────
  const billItems = [
    {
      label:   'রিভিউ',
      onClick: () => setActiveStep('preview'),
    },
  ];

  const isPreview = activeStep === 'preview';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`${BASE_PRINT_CSS}${PAGE_A4_LANDSCAPE}`}</style>

      <ModuleShell
        moduleName="বেতন বৃদ্ধির প্রস্তাব"
        moduleNameEn="Salary Increment Proposal"
        date={increment.date}
        onDateChange={d => setIncrement(p => ({ ...p, date: d }))}

        steps={STEPS}
        activeStep={activeStep}
        onStepChange={id => setActiveStep(id as 'form' | 'preview')}

        billItems={billItems}
        isBillActive={isPreview}

        onSave={async () => {
          const record = buildRecord();
          const ok = sheets.editingId
            ? await sheets.update(sheets.editingId, record)
            : await sheets.save(record);
          if (ok) handleReset();
          return ok;
        }}
        isSaving={sheets.isSaving}
        configured={sheets.configured}
        adapterName={sheets.adapterName}
        saveDisabled={!firstEmp?.employeeName}

        editingId={sheets.editingId}
        onCancelEdit={handleReset}
        onReset={handleReset}

        onUpdate={rec => {
          sheets.setEditingId(String(rec.id ?? ''));
          setIncrement(p => recordToFormData(rec, p));
          setActiveStep('form');
        }}
        updateModule="increments"
        updateLabel="ইনক্রিমেন্ট রেকর্ড খুঁজুন"
        updateSearchPlaceholder="নাম, আইডি বা পদবী দিয়ে খুঁজুন..."

        calcRows={[
          { label: 'মোট কর্মী',     value: `${increment.employees?.length ?? 0} জন` },
          { label: 'কার্যকর তারিখ', value: firstEmp?.effectiveFrom || '—' },
          ...(firstEmp?.proposedIncrement ? [{ label: 'বৃদ্ধির পরিমাণ', value: `৳ ${firstEmp.proposedIncrement}` }] : []),
        ]}

        records={sheets.records}
        isLoading={sheets.isLoading}
        onLoadRecord={rec => {
          sheets.setEditingId(String(rec.id ?? ''));
          setIncrement(p => recordToFormData(rec as Record<string, unknown>, p));
          setActiveStep('form');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleteRecord={sheets.remove}
        onReload={sheets.reload}

        auth={authorization}
        onAuthChange={setAuthorization}
        onPrint={handlePrint}
        onPDF={handleExportPDF}
        onExcel={handleExportExcel}
        lang="bn"
      >
        {activeStep === 'form' && (
          <IncrementFormComponent increment={increment} setIncrement={setIncrement} />
        )}

        {activeStep === 'preview' && (
          <div id="printable-area" ref={viewRef}>
            <IncrementViewComponent increment={increment} authorization={authorization} />
          </div>
        )}
      </ModuleShell>
    </>
  );
}