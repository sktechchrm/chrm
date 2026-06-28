// ─────────────────────────────────────────────────────────────────────────────
// EmployeeNoticeView.tsx
// Path: src/components/LeftEmployeeNotice/EmployeeNoticeView.tsx
//
// REBUILT on ModuleShell — same pattern as requisition / increment / maternity.
//
// CHANGES vs previous version:
//  - localStorage persistence removed → real database persistence via
//    useDatabase('leftnotice', ...), matching every other module.
//  - Custom <nav> tab bar replaced by ModuleShell's steps + billItems.
//  - Added EmployeeSearchBar for card-no auto-fill (was completely absent
//    from the live flow before — only existed in the dead App in
//    EmployeeInfoForm.tsx, which nobody imported).
//  - Fixed the dead-tab bug: clicking পত্র নং-১/২/৩ or খাম in the sidebar
//    now actually renders NoticeLetter / Envelope — previously these were
//    decorative only (children always rendered the data-entry form).
//  - window.confirm() reset replaced by ModuleShell's built-in confirm.
//  - Notice letters' signature block now sourced from the shared
//    Authorization panel (auth/onAuthChange) instead of hardcoded text.
//  - buildRecord()/recordToFormData() persist the FULL Employee shape,
//    including both addresses (as addressesJson) and all three
//    auto-calculated notice dates — previously, if this had ever been
//    wired to save, only 6 of ~16 fields would have been kept.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useAuth }                  from '../../context/AuthContext';
import { useFactory }                from '../../hooks/useFactory';
import { useDatabase }             from '../../hooks/useDatabase';
import { toDateInput }               from '../../utils/dateUtils';
import ModuleShell                   from '../shell/ModuleShell';
import { DEFAULT_AUTHORIZATION }     from '../common/AuthorizationBlock';
import type { AuthorizationState }   from '../common/AuthorizationBlock';
import { Employee, initialEmployee, toBanglaNumber } from '../../types/LeftNoticeDataType';
import { EmployeeForm }              from './EmployeeInfoForm';
import { NoticeLetter }              from './EmployeeNotice';
import { Envelope }                  from './Envelope';
import { exportToPDF }               from '../../utils/pdfExport';
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';

// ── Steps & output items ───────────────────────────────────────────────────

const STEPS = [
  { id: 'personal', label: 'সাধারণ তথ্য', icon: 'ti-user-circle' },
  { id: 'address',  label: 'ঠিকানা',      icon: 'ti-map-pin' },
];

type FormStepId = 'personal' | 'address';
type ViewId = FormStepId | 'notice1' | 'notice2' | 'notice3' | 'envelope-present' | 'envelope-permanent';

// ── recordToFormData ─────────────────────────────────────────────────────────

function recordToFormData(rec: Record<string, unknown>, prev: Employee): Employee {
  let addresses: { present?: Employee['presentAddress']; permanent?: Employee['permanentAddress'] } = {};
  try {
    addresses = JSON.parse(String(rec.addressesJson ?? '{}')) ?? {};
  } catch { /* ignore malformed JSON */ }

  return {
    ...prev,
    name:              String(rec.employeeName ?? ''),
    fatherName:        String(rec.fatherName    ?? ''),
    motherName:        String(rec.motherName    ?? ''),
    gender:            String(rec.gender        ?? ''),
    husbandName:       String(rec.husbandName   ?? ''),
    cardNo:            String(rec.cardNo        ?? ''),
    designation:       String(rec.designation   ?? ''),
    section:           String(rec.department    ?? ''),
    date:              toDateInput(rec.date),
    joiningDate:       toDateInput(rec.joiningDate),
    absenceStartDate:  toDateInput(rec.absentFrom),
    firstNoticeDate:   toDateInput(rec.firstNoticeDate),
    secondNoticeDate:  toDateInput(rec.secondNoticeDate),
    thirdNoticeDate:   toDateInput(rec.thirdNoticeDate),
    presentAddress:    addresses.present   ?? prev.presentAddress,
    permanentAddress:  addresses.permanent ?? prev.permanentAddress,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

function NoticeView() {
  const factory  = useFactory();
  const { user } = useAuth();

  const sheets  = useDatabase('leftnotice', factory.id, user?.name ?? 'unknown');
  const viewRef = useRef<HTMLDivElement>(null);

  // "Prepared By" is always hidden for this module (hidePrepared on
  // PrintSignatureRow). The other 4 authority rows (Authorized 1/2,
  // Approved 1/2) remain fully user-selectable via the same visibility
  // checkboxes every other module uses — the user can show just one (it
  // sits left-aligned), two (spread left/right), or all four.
  const [authorization, setAuthorization] = useState<AuthorizationState>(DEFAULT_AUTHORIZATION);
  const [touched,   setTouched]   = useState(false);
  const [activeView,    setActiveView]    = useState<ViewId>('personal');
  const [employee,      setEmployee]      = useState<Employee>(initialEmployee);

  // ── Auto-fill factory info + today's date from session ────────────────────
  useEffect(() => {
    setEmployee(prev => ({
      ...prev,
      companyName:    factory.nameBn,
      companyAddress: factory.addressBn,
      date:           prev.date || new Date().toISOString().split('T')[0],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory.id]);

  const isDataReady     = !!(employee.name && employee.cardNo && employee.companyName);
  const noticesGenerated = !!employee.absenceStartDate;

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setTouched(false);
    setEmployee(prev => ({
      ...initialEmployee,
      // Keep factory data from session
      companyName:    prev.companyName,
      companyAddress: prev.companyAddress,
    }));
    setActiveView('personal');
    sheets.setEditingId(null);
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    const el = viewRef.current;
    if (!el) return;
    await exportToPDF({ element: el, filename: `LeftNotice_${employee.name || 'document'}`, scale: 2 });
  };

  // ── Build DB record ───────────────────────────────────────────────────────
  const buildRecord = () => ({
    employeeName:     employee.name,
    cardNo:           employee.cardNo,
    designation:      employee.designation,
    department:       employee.section,
    fatherName:       employee.fatherName ?? '',
    motherName:       employee.motherName ?? '',
    gender:           employee.gender ?? '',
    husbandName:      employee.husbandName ?? '',
    date:             employee.date ?? '',
    joiningDate:      employee.joiningDate ?? '',
    absentFrom:       employee.absenceStartDate ?? '',
    firstNoticeDate:  employee.firstNoticeDate ?? '',
    secondNoticeDate: employee.secondNoticeDate ?? '',
    thirdNoticeDate:  employee.thirdNoticeDate ?? '',
    noticeType:       'notice1',
    addressesJson:    JSON.stringify({
      present:   employee.presentAddress,
      permanent: employee.permanentAddress,
    }),
  });

  // ── Sidebar output items ──────────────────────────────────────────────────
  const billItems = [
    { label: 'পত্র নং-১', onClick: () => noticesGenerated && setActiveView('notice1') },
    { label: 'পত্র নং-২', onClick: () => noticesGenerated && setActiveView('notice2') },
    { label: 'পত্র নং-৩', onClick: () => noticesGenerated && setActiveView('notice3') },
    {
      label: 'খাম',
      // NOTE: ModuleShell calls both sub.onClick() AND this parent onClick()
      // together whenever a sub-item is clicked — so this must stay a no-op,
      // otherwise it would override whichever sub-item (present/permanent)
      // was just selected back to a single default every time.
      onClick: () => {},
      subItems: [
        { label: 'বর্তমান ঠিকানা',  onClick: () => noticesGenerated && setActiveView('envelope-present'),   active: activeView === 'envelope-present' },
        { label: 'স্থায়ী ঠিকানা',   onClick: () => noticesGenerated && setActiveView('envelope-permanent'), active: activeView === 'envelope-permanent' },
      ],
    },
  ];

  const isOutputView = activeView !== 'personal' && activeView !== 'address';
  const activeFormStep: FormStepId = (activeView === 'personal' || activeView === 'address') ? activeView : 'personal';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`${BASE_PRINT_CSS}${PAGE_A4_PORTRAIT}`}</style>

      <ModuleShell
        moduleName="কর্মী অনুপস্থিতি নোটিশ"
        moduleNameEn="Left Worker Notice"
        date={employee.date}
        onDateChange={d => setEmployee(prev => ({ ...prev, date: d }))}

        steps={STEPS}
        activeStep={activeFormStep}
        onStepChange={id => setActiveView(id as FormStepId)}

        billItems={billItems}
        isBillActive={isOutputView}

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
        saveDisabled={!isDataReady}

        editingId={sheets.editingId}
        onCancelEdit={handleReset}
        isDirty={touched}
        onReset={handleReset}

        onUpdate={rec => {
          sheets.setEditingId(String(rec.id ?? ''));
          setEmployee(prev => recordToFormData(rec, prev));
          setActiveView('personal');
        }}
        updateModule="leftnotice"
        updateLabel="Left Notice রেকর্ড খুঁজুন"
        updateSearchPlaceholder="নাম, কার্ড নং বা পদবী দিয়ে খুঁজুন..."

        calcRows={[
          { label: '১ম নোটিশ',     value: employee.firstNoticeDate  ? toBanglaNumber(employee.firstNoticeDate.split('-').reverse().join('/'))  : '—' },
          { label: '২য় নোটিশ',     value: employee.secondNoticeDate ? toBanglaNumber(employee.secondNoticeDate.split('-').reverse().join('/')) : '—' },
          { label: 'চূড়ান্ত নোটিশ', value: employee.thirdNoticeDate  ? toBanglaNumber(employee.thirdNoticeDate.split('-').reverse().join('/'))  : '—' },
        ]}

        records={sheets.records}
        isLoading={sheets.isLoading}
        onLoadRecord={rec => {
          sheets.setEditingId(String(rec.id ?? ''));
          setEmployee(prev => recordToFormData(rec as Record<string, unknown>, prev));
          setActiveView('personal');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleteRecord={sheets.remove}
        onReload={sheets.reload}

        auth={authorization}
        onAuthChange={setAuthorization}
        onPrint={handlePrint}
        onPDF={handleExportPDF}
        lang="bn"
      >
        {(activeView === 'personal' || activeView === 'address') && (
          <>
            <EmployeeForm
              key={sheets.editingId ?? 'new'}
              employee={employee}
              onChange={data => { setTouched(true); setEmployee(data); }}
              activeTab={activeView}
              onDirtyChange={dirty => { if (dirty) setTouched(true); }}
            />
          </>
        )}

        {(activeView === 'envelope-present' || activeView === 'envelope-permanent') && (
          <div id="printable-area" ref={viewRef}>
            <Envelope employee={employee} addressType={activeView === 'envelope-present' ? 'present' : 'permanent'} />
          </div>
        )}

        {(['notice1', 'notice2', 'notice3'] as const).map((type, idx) => (
          activeView === type && (
            <div id="printable-area" ref={viewRef} key={type}>
              <NoticeLetter
                employee={employee}
                title={`পত্র নং-${toBanglaNumber(idx + 1)}`}
                noticeType={type}
                authorization={authorization}
              />
            </div>
          )
        ))}
      </ModuleShell>
    </>
  );
}

export default NoticeView;