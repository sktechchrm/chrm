// ─────────────────────────────────────────────────────────────────────────────
// EmployeeFileSystem.tsx
//
// REBUILT on ModuleShell — replaces the hand-rolled sidebar/toggle layout.
//
// CHANGES vs previous version:
//  - No persistence existed at all: useSheetsSync was imported but
//    sheets.save/update/records/editingId were never used. There was no
//    Save button, no way to load a saved employee, no update-search. Now
//    fully wired via useSheetsSync, matching every other module.
//  - Removed dead imports (AppButton, SheetsSaveButton, ModuleHeader,
//    AuthorizationBlock, SheetsHistory, EmployeeSearchBar) — all were
//    imported but never rendered in the old file. EmployeeSearchBar is now
//    actually used, for card-no lookup of an existing employee.
//  - The 6 "Generate Documents" buttons are now ModuleShell output items
//    instead of a custom sidebar, reusing the same PrintFiles components
//    unchanged.
//  - 10 real form steps (from the old "All" tab's sections — see
//    EmployeeForm.tsx for why the other 6 tabs were dropped as duplicates).
//  - buildRecord() now saves the FULL ~147-field EmployeeFormData shape.
//    Critically, this also makes toPersonalData() in EmployeePersonalData.ts
//    actually reachable for the first time — every OTHER module's
//    EmployeeSearchBar (card-no auto-fill) depends on this module's saved
//    records, which never existed before since nothing was ever saved here.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSheetsSync } from '../../hooks/useSheetsSync';
import { useFactory } from '../../hooks/useFactory';
import ModuleShell from '../shell/ModuleShell';
import { DEFAULT_AUTHORIZATION } from '../common/AuthorizationBlock';
import type { AuthorizationState } from '../common/AuthorizationBlock';
import EmployeeSearchBar from '../common/EmployeeSearchBar';
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';
import { EmployeeFormData, initialFormData } from '../../types/employee.types';
import EmployeeForm, { type FormStepId } from './EmployeeForm';
import AppointmentLetter from './PrintFiles/AppointmentLetter';
import NomineeForm from './PrintFiles/NomineeForm';
import AgeEstimation from './PrintFiles/AgeEstimation';
import IdCard from './PrintFiles/IdCard';
import PersonalInfoSheet from './PrintFiles/PersonalInfoSheet';

// ── Steps & output items ───────────────────────────────────────────────────

const STEPS: { id: FormStepId; label: string; icon: string }[] = [
  { id: 'identity',   label: 'ব্যক্তিগত তথ্য',     icon: 'ti-user'           },
  { id: 'contact',    label: 'যোগাযোগ',            icon: 'ti-map-pin'        },
  { id: 'employment', label: 'চাকরির তথ্য',         icon: 'ti-briefcase'      },
  { id: 'education',  label: 'শিক্ষাগত যোগ্যতা',     icon: 'ti-school'         },
  { id: 'previous',   label: 'পূর্ববর্তী অভিজ্ঞতা',  icon: 'ti-history'        },
  { id: 'nominee',    label: 'নমিনি তথ্য',          icon: 'ti-users'          },
  { id: 'supervisor', label: 'তত্ত্বাবধায়ক',        icon: 'ti-user-shield'    },
];

type OutputId = 'appointment' | 'nominee_doc' | 'age' | 'idcard' | 'personal_doc';

function EmployeeFileSystem() {
  const factory  = useFactory();
  const { user } = useAuth();
  const sheets   = useSheetsSync('employees', factory.id, user?.name ?? 'unknown');

  const [authorization, setAuthorization] = useState<AuthorizationState>(DEFAULT_AUTHORIZATION);
  const [formData,   setFormData]   = useState<EmployeeFormData>(initialFormData);
  const [activeView, setActiveView] = useState<FormStepId | OutputId>('identity');

  // Auto-fill factory info + today's date from session
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      companyName:    factory.nameEn,
      companyAddress: factory.addressEn,
      date:           prev.date || new Date().toISOString().split('T')[0],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory.id]);

  const isFormStep = (v: string): v is FormStepId => STEPS.some(s => s.id === v);
  const isOutputView = !isFormStep(activeView);
  const activeFormStep: FormStepId = isFormStep(activeView) ? activeView : 'identity';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...initialFormData,
      companyName:    prev.companyName,
      companyAddress: prev.companyAddress,
      date:           new Date().toISOString().split('T')[0],
    }));
    setActiveView('identity');
    sheets.setEditingId(null);
  };

  const handlePrint = () => window.print();

  // ── Build DB record — full EmployeeFormData shape ─────────────────────────
  const buildRecord = (): Record<string, string> => {
    const { educationHistory, previousJobs, ...flat } = formData;
    return {
      ...(flat as unknown as Record<string, string>),
      educationHistoryJson: JSON.stringify(educationHistory ?? []),
      previousJobsJson:     JSON.stringify(previousJobs ?? []),
    };
  };

  const recordToFormData = (rec: Record<string, unknown>): EmployeeFormData => {
    const next = { ...initialFormData };
    (Object.keys(initialFormData) as (keyof EmployeeFormData)[]).forEach(key => {
      if (key === 'educationHistory' || key === 'previousJobs') return; // handled below
      if (rec[key] !== undefined) {
        (next as unknown as Record<string, string>)[key as string] = String(rec[key] ?? '');
      }
    });
    try { next.educationHistory = JSON.parse(String(rec.educationHistoryJson ?? '[]')); } catch { next.educationHistory = []; }
    try { next.previousJobs     = JSON.parse(String(rec.previousJobsJson     ?? '[]')); } catch { next.previousJobs     = []; }
    return next;
  };

  const loadRecord = (rec: Record<string, unknown>) => {
    sheets.setEditingId(String(rec.id ?? ''));
    setFormData(recordToFormData(rec));
    setActiveView('identity');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Sidebar output items ──────────────────────────────────────────────────
  const billItems = [
    { label: 'নিয়োগপত্র',          onClick: () => setActiveView('appointment')  },
    { label: 'নমিনি ফরম',           onClick: () => setActiveView('nominee_doc')  },
    { label: 'মেডিকেল ফিটনেস',      onClick: () => setActiveView('age')          },
    { label: 'আইডি কার্ড',          onClick: () => setActiveView('idcard')       },
    { label: 'ব্যক্তিগত তথ্য শিট',   onClick: () => setActiveView('personal_doc') },
  ];

  const isDataReady = !!(formData.fullName && formData.employeeId);

  return (
    <>
      <style>{`${BASE_PRINT_CSS}${PAGE_A4_PORTRAIT}`}</style>

      <ModuleShell
        moduleName="কর্মীর ব্যক্তিগত ফাইল"
        moduleNameEn="Employee Personal File"
        date={formData.date}
        onDateChange={d => setFormData(prev => ({ ...prev, date: d }))}

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
        onReset={handleReset}

        onUpdate={loadRecord}
        updateModule="employees"
        updateLabel="কর্মী রেকর্ড খুঁজুন"
        updateSearchPlaceholder="নাম বা কার্ড নং দিয়ে খুঁজুন..."

        records={sheets.records}
        isLoading={sheets.isLoading}
        onLoadRecord={rec => loadRecord(rec as Record<string, unknown>)}
        onDeleteRecord={sheets.remove}
        onReload={sheets.reload}

        auth={authorization}
        onAuthChange={setAuthorization}
        onPrint={handlePrint}
        lang="bn"
      >
        {isFormStep(activeView) && (
          <>
            {activeView === 'identity' && (
              <EmployeeSearchBar
                hideLabel
                factoryId={factory?.id || ''}
                initialCardNo={formData.cardNo}
                onFound={data => setFormData(prev => ({
                  ...prev,
                  fullName:        data.fullName,
                  fullNameBengali: data.fullNameBengali,
                  cardNo:          data.cardNo,
                  employeeId:      data.employeeId,
                  designation:     data.designation,
                  department:      data.department,
                  fatherName:      data.fatherName,
                  motherName:      data.motherName,
                  gender:          data.gender,
                  dateOfBirth:     data.dateOfBirth,
                  nid:             data.nid,
                  mobile:          data.mobile,
                  email:           data.email,
                  joiningDate:     data.joiningDate,
                  grade:           data.grade,
                  basicSalary:        data.basicSalary,
                  houseRent:          data.houseRent,
                  medicalAllowance:   data.medicalAllowance,
                  transportAllowance: data.transportAllowance,
                  foodAllowance:      data.foodAllowance,
                  presentAddress:   data.presentAddress,
                  permanentAddress: data.permanentAddress,
                }))}
              />
            )}
            <EmployeeForm formData={formData} handleInputChange={handleInputChange} setFormData={setFormData} activeStep={activeFormStep} />
          </>
        )}

        {activeView === 'appointment' && (
          <div id="printable-area"><AppointmentLetter formData={formData} /></div>
        )}
        {activeView === 'nominee_doc' && (
          <div id="printable-area"><NomineeForm formData={formData} /></div>
        )}
        {activeView === 'age' && (
          <div id="printable-area"><AgeEstimation formData={formData} /></div>
        )}
        {activeView === 'idcard' && (
          <div id="printable-area"><IdCard formData={formData} /></div>
        )}
        {activeView === 'personal_doc' && (
          <div id="printable-area"><PersonalInfoSheet formData={formData} /></div>
        )}
      </ModuleShell>
    </>
  );
}

export default EmployeeFileSystem;