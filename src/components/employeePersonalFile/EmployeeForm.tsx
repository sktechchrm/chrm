// ─────────────────────────────────────────────────────────────────────────────
// EmployeeForm.tsx
//
// UPDATED per latest restructure:
//  - Bank info merged into চাকরির তথ্য (was its own সাব-section under the
//    removed জরুরি যোগাযোগ ও ব্যাংক step).
//  - Emergency contact merged into যোগাযোগ (now just called যোগাযোগ, not
//    যোগাযোগ ও ঠিকানা).
//  - জরুরি যোগাযোগ ও ব্যাংক step removed entirely (both halves redistributed).
//  - ব্যক্তিগত ও পরিবারের তথ্য renamed to just ব্যক্তিগত তথ্য (family/spouse
//    fields stay as sub-section B, only the step LABEL changed).
//  - নমিনির ঠিকানার বিবরণ (separate nominee address sub-fields) removed —
//    নমিনির সম্পূর্ণ ঠিকানা is now a textarea instead of a single-line input.
//  - তত্ত্বাবধায়ক's ঠিকানা field is now a textarea.
//  - পূর্ববর্তী অভিজ্ঞতা and শিক্ষাগত যোগ্যতা are now TABLE-based — add rows
//    via a + button, each row has an ✕ remove action in the last column.
//  - No more "step name X/Y" sub-heading repeated inside the form body —
//    ModuleShell's own step header (top of the page) already shows that.
// ─────────────────────────────────────────────────────────────────────────────

import React, { ChangeEvent } from 'react';
import { EmployeeFormData, EducationEntry, PreviousJobEntry, generateEntryId } from '../../types/employee.types';

export type FormStepId =
  | 'identity' | 'contact' | 'employment' | 'education'
  | 'previous' | 'nominee' | 'supervisor';

interface EmployeeFormProps {
  formData: EmployeeFormData;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: (updater: (prev: EmployeeFormData) => EmployeeFormData) => void;
  activeStep: FormStepId;
}

const S = {
  section: 'space-y-5',
};

// ── Card + labeled-field system (matches Meeting Minutes' মিটিং সময়সূচি
//    card pattern: header bar + persistent labels above each input) ────────
function FormCard({ title, dense, children }: { title: string; dense?: boolean; children: React.ReactNode }) {
  return (
    <div className="ef-card">
      <div className="ef-card-header">{title}</div>
      <div className={`ef-card-body${dense ? ' ef-dense' : ''}`}>{children}</div>
    </div>
  );
}

function Field({
  label, span, children,
}: { label: string; span?: 'full'; children: React.ReactNode }) {
  return (
    <fieldset className={`ef-field${span === 'full' ? ' ef-field-full' : ''}`}>
      <legend className="ef-label">{label}</legend>
      {children}
    </fieldset>
  );
}

// ── Generic array-row table editor ──────────────────────────────────────────
// Works on any array field of EmployeeFormData (EducationEntry[] /
// PreviousJobEntry[]) — each row is a real, independently-saved entry.
interface TableField<T> {
  key: keyof T;
  placeholder: string;
  type?: string;
}

function ArrayTableForm<T extends { id: string }>({
  entries, fields, blankEntry, onChange, addLabel,
}: {
  entries: T[];
  fields: TableField<T>[];
  blankEntry: () => T;
  onChange: (entries: T[]) => void;
  addLabel: string;
}) {
  // If there are zero entries, seed exactly one blank row immediately so the
  // table always has a real, addressable row to type into — avoids any
  // separate "placeholder vs real row" timing/identity mismatch entirely.
  React.useEffect(() => {
    if (entries.length === 0) onChange([blankEntry()]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const updateCell = (rowId: string, key: keyof T, value: string) => {
    onChange(entries.map(row => row.id === rowId ? { ...row, [key]: value } : row));
  };
  // New rows are added to the TOP, so the most recently added entry is
  // always the first row the user sees.
  const addRow = () => onChange([blankEntry(), ...entries]);
  const removeRow = (rowId: string) => {
    const next = entries.filter(row => row.id !== rowId);
    // Never leave the table with zero rows — replace with a fresh blank one.
    onChange(next.length > 0 ? next : [blankEntry()]);
  };

  // While the seeding effect above runs (one render tick), render nothing
  // for an empty array to avoid a flash of a row with no real id yet.
  if (entries.length === 0) return null;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
        >
          + {addLabel}
        </button>
      </div>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full border-collapse text-sm min-w-[640px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="border px-2 py-2 text-xs font-bold text-slate-500 w-10">নং</th>
              {fields.map(f => (
                <th key={String(f.key)} className="border px-2 py-2 text-xs font-bold text-slate-500 text-left">{f.placeholder}</th>
              ))}
              <th className="border px-2 py-2 text-xs font-bold text-slate-500 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((row, i) => (
              <tr key={row.id}>
                <td className="border px-2 py-1.5 text-center text-xs text-slate-400 font-semibold">{i + 1}</td>
                {fields.map(f => (
                  <td key={String(f.key)} className="border px-1 py-1">
                    <input
                      type={f.type ?? 'text'}
                      value={(row[f.key] as string) ?? ''}
                      onChange={e => updateCell(row.id, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-2 py-1.5 text-sm border-none outline-none bg-transparent"
                    />
                  </td>
                ))}
                <td className="border px-1 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 text-sm font-bold"
                    aria-label="Remove row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ formData, handleInputChange, setFormData, activeStep }) => {

  return (
    <div className={S.section}>

      {/* ── ব্যক্তিগত তথ্য (Personal + Family) ── */}
      {activeStep === 'identity' && (
        <div className="space-y-4">
          <FormCard title="A. ব্যক্তিগত তথ্য" dense>
            <Field label="পূর্ণ নাম (ইংরেজি) *"><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="ef-input" aria-label="Full Name (English)" aria-required="true" /></Field>
            <Field label="পূর্ণ নাম (বাংলা)"><input type="text" name="fullNameBengali" value={formData.fullNameBengali} onChange={handleInputChange} className="ef-input" aria-label="Full Name (Bengali)" /></Field>
            <Field label="পিতার নাম"><input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="ef-input" aria-label="Father" /></Field>
            <Field label="মাতার নাম"><input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="ef-input" aria-label="Mother" /></Field>
            <Field label="জন্ম তারিখ *"><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="ef-input" aria-label="Date of Birth" aria-required="true" /></Field>
            <Field label="লিঙ্গ নির্বাচন *">
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="ef-select">
                <option value="">নির্বাচন করুন</option>
                <option value="Male">পুরুষ</option>
                <option value="Female">মহিলা</option>
                <option value="Other">অন্যান্য</option>
              </select>
            </Field>
            <Field label="রক্তের গ্রুপ">
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="ef-select">
                <option value="">নির্বাচন করুন</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </Field>
            <Field label="বৈবাহিক অবস্থা">
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="ef-select">
                <option value="">নির্বাচন করুন</option>
                <option value="Single">অবিবাহিত</option>
                <option value="Married">বিবাহিত</option>
                <option value="Divorced">তালাকপ্রাপ্ত</option>
              </select>
            </Field>
            <Field label="জাতীয়তা"><input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="ef-input" aria-label="Nationality" /></Field>
            <Field label="ধর্ম"><input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="ef-input" aria-label="Religion" /></Field>
            <Field label="জাতীয় পরিচয়পত্র নম্বর"><input type="text" name="nid" value={formData.nid} onChange={handleInputChange} className="ef-input" aria-label="National ID Number" /></Field>
            <Field label="জন্ম নিবন্ধন নম্বর"><input type="text" name="birthRegistrationNo" value={formData.birthRegistrationNo} onChange={handleInputChange} className="ef-input" aria-label="Birth Registration No" /></Field>
            <Field label="পাসপোর্ট নম্বর"><input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} className="ef-input" aria-label="Passport Number" /></Field>
            <Field label="উচ্চতা (সেমি)"><input type="text" name="height" value={formData.height} onChange={handleInputChange} className="ef-input" aria-label="Height (cm)" /></Field>
            <Field label="ওজন (কেজি)"><input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="ef-input" aria-label="Weight (kg)" /></Field>
            <Field label="সনাক্তকরণ চিহ্ন" span="full"><input type="text" name="identificationMark" value={formData.identificationMark} onChange={handleInputChange} className="ef-input" aria-label="Identification Mark" /></Field>
          </FormCard>

          <FormCard title="B. পরিবার">
            <Field label="স্বামী/স্ত্রীর নাম"><input type="text" name="spouseName" value={formData.spouseName} onChange={handleInputChange} className="ef-input" aria-label="Spouse Name" /></Field>
            <Field label="স্বামী/স্ত্রীর জন্ম তারিখ"><input type="date" name="spouseDob" value={formData.spouseDob} onChange={handleInputChange} className="ef-input" /></Field>
            <Field label="স্বামী/স্ত্রীর রক্তের গ্রুপ"><input type="text" name="spouseBloodGroup" value={formData.spouseBloodGroup} onChange={handleInputChange} className="ef-input" aria-label="Spouse Blood Group" /></Field>
            <Field label="স্বামী/স্ত্রীর পেশা"><input type="text" name="spouseProfession" value={formData.spouseProfession} onChange={handleInputChange} className="ef-input" aria-label="Spouse Profession" /></Field>
            <Field label="স্বামী/স্ত্রীর মোবাইল"><input type="tel" name="spousePhone" value={formData.spousePhone} onChange={handleInputChange} className="ef-input" aria-label="Spouse Mobile" /></Field>
            <Field label="স্বামী/স্ত্রীর শিক্ষাগত যোগ্যতা"><input type="text" name="spouseEducation" value={formData.spouseEducation} onChange={handleInputChange} className="ef-input" aria-label="Spouse Education" /></Field>
            <Field label="পুত্র সন্তান সংখ্যা"><input type="number" name="numberOfSons" value={formData.numberOfSons} onChange={handleInputChange} className="ef-input" aria-label="Number of Sons" /></Field>
            <Field label="কন্যা সন্তান সংখ্যা"><input type="number" name="numberOfDaughters" value={formData.numberOfDaughters} onChange={handleInputChange} className="ef-input" aria-label="Number of Daughters" /></Field>
          </FormCard>
        </div>
      )}

      {/* ── যোগাযোগ (Contact + Address + Emergency) ── */}
      {activeStep === 'contact' && (
        <div>
          <FormCard title="A. যোগাযোগের তথ্য">
            <Field label="মোবাইল নম্বর"><input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="ef-input" aria-label="Mobile Number" /></Field>
            <Field label="ইমেইল ঠিকানা"><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="ef-input" aria-label="Email Address" /></Field>
          </FormCard>

          <FormCard title="B. ঠিকানা">
            <div className="ef-field-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                <div className="space-y-2">
                  <h4 className="ef-subgroup-title">বর্তমান ঠিকানা</h4>
                  <Field label="সম্পূর্ণ ঠিকানা"><input type="text" name="presentAddress" value={formData.presentAddress} onChange={handleInputChange} className="ef-input" aria-label="Full Address" /></Field>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Field label="ইউনিয়ন/পৌরসভা"><input type="text" name="presentUnion" value={formData.presentUnion} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Union/Municipality" /></Field>
                    <Field label="গ্রাম"><input type="text" name="presentVillage" value={formData.presentVillage} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Village" /></Field>
                    <Field label="ডাকঘর"><input type="text" name="presentPostOffice" value={formData.presentPostOffice} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Post Office" /></Field>
                    <Field label="থানা"><input type="text" name="presentThana" value={formData.presentThana} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Thana" /></Field>
                    <Field label="জেলা"><input type="text" name="presentDistrict" value={formData.presentDistrict} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="District" /></Field>
                    <Field label="বিভাগ"><input type="text" name="presentDivision" value={formData.presentDivision} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Division" /></Field>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="ef-subgroup-title">স্থায়ী ঠিকানা</h4>
                  <Field label="সম্পূর্ণ ঠিকানা *"><input type="text" name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} className="ef-input" aria-label="Full Address" aria-required="true" /></Field>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Field label="ইউনিয়ন"><input type="text" name="permanentUnion" value={formData.permanentUnion} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Union" /></Field>
                    <Field label="গ্রাম *"><input type="text" name="permanentVillage" value={formData.permanentVillage} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Village" aria-required="true" /></Field>
                    <Field label="ডাকঘর *"><input type="text" name="permanentPostOffice" value={formData.permanentPostOffice} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Post Office" aria-required="true" /></Field>
                    <Field label="থানা *"><input type="text" name="permanentThana" value={formData.permanentThana} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Thana" aria-required="true" /></Field>
                    <Field label="জেলা *"><input type="text" name="permanentDistrict" value={formData.permanentDistrict} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="District" aria-required="true" /></Field>
                    <Field label="বিভাগ"><input type="text" name="permanentDivision" value={formData.permanentDivision} onChange={handleInputChange} className="ef-input ef-input-sm" aria-label="Division" /></Field>
                  </div>
                </div>
              </div>
            </div>
          </FormCard>

          <FormCard title="C. জরুরি যোগাযোগ" dense>
            <Field label="জরুরি যোগাযোগের নাম"><input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} className="ef-input" aria-label="Emergency Contact Name" /></Field>
            <Field label="সম্পর্ক"><input type="text" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleInputChange} className="ef-input" aria-label="Relation" /></Field>
            <Field label="মোবাইল নম্বর"><input type="tel" name="emergencyMobile" value={formData.emergencyMobile} onChange={handleInputChange} className="ef-input" aria-label="Mobile Number" /></Field>
            <Field label="পেশা"><input type="text" name="emergencyProfession" value={formData.emergencyProfession} onChange={handleInputChange} className="ef-input" aria-label="Profession" /></Field>
          </FormCard>
        </div>
      )}

      {/* ── চাকরির তথ্য (Office + Employment + Bank) ── */}
      {activeStep === 'employment' && (
        <div className="space-y-4">
          <FormCard title="A. অফিস ও পরিচয়">
            <Field label="কার্ড নং"><input type="text" name="cardNo" value={formData.cardNo} onChange={handleInputChange} className="ef-input" aria-label="Card No" /></Field>
            <Field label="আইডি নং"><input type="text" name="idNo" value={formData.idNo} onChange={handleInputChange} className="ef-input" aria-label="ID No" /></Field>
            <Field label="প্রক্সিমিটি নম্বর"><input type="text" name="proximityNumber" value={formData.proximityNumber} onChange={handleInputChange} className="ef-input" aria-label="Proximity Number" /></Field>
            <Field label="কর্মী আইডি *"><input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="ef-input" aria-label="Employee ID" aria-required="true" /></Field>
            <Field label="গ্রেড"><input type="text" name="grade" value={formData.grade} onChange={handleInputChange} className="ef-input" aria-label="Grade" /></Field>
            <Field label="সেকশন/লাইন"><input type="text" name="sectionLine" value={formData.sectionLine} onChange={handleInputChange} className="ef-input" aria-label="Section/Line" /></Field>
          </FormCard>

          <FormCard title="B. চাকরির তথ্য" dense>
            <Field label="পদবি *"><input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="ef-input" aria-label="Designation" aria-required="true" /></Field>
            <Field label="বিভাগ"><input type="text" name="department" value={formData.department} onChange={handleInputChange} className="ef-input" aria-label="Department" /></Field>
            <Field label="যোগদানের তারিখ"><input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className="ef-input" /></Field>
            <Field label="প্রবেশনকাল শেষের তারিখ"><input type="date" name="probationEndDate" value={formData.probationEndDate} onChange={handleInputChange} className="ef-input" aria-label="Probation End Date" /></Field>
            <Field label="মাসিক বেতন (মোট)"><input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="ef-input" aria-label="Monthly Salary" /></Field>
            <Field label="নির্ধারিত বেতন"><input type="text" name="fixedSalary" value={formData.fixedSalary} onChange={handleInputChange} className="ef-input" aria-label="Fixed Salary" /></Field>
            <Field label="নিয়োগ সূত্র"><input type="text" name="jobSource" value={formData.jobSource} onChange={handleInputChange} className="ef-input" aria-label="Job Source" /></Field>
            <Field label="স্থানীয় প্রতিনিধি"><input type="text" name="localRepresentative" value={formData.localRepresentative} onChange={handleInputChange} className="ef-input" aria-label="Local Representative" /></Field>

            <div className="ef-field-full ef-subgroup">
              <h4 className="ef-subgroup-title">বেতন বিভাজন</h4>
              <div className="ef-grid">
                <Field label="মূল বেতন"><input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleInputChange} className="ef-input" aria-label="Basic Salary" /></Field>
                <Field label="বাড়ি ভাড়া"><input type="number" name="houseRent" value={formData.houseRent} onChange={handleInputChange} className="ef-input" aria-label="House Rent" /></Field>
                <Field label="চিকিৎসা ভাতা"><input type="number" name="medicalAllowance" value={formData.medicalAllowance} onChange={handleInputChange} className="ef-input" aria-label="Medical Allowance" /></Field>
                <Field label="যাতায়াত ভাতা"><input type="number" name="transportAllowance" value={formData.transportAllowance} onChange={handleInputChange} className="ef-input" aria-label="Transport Allowance" /></Field>
                <Field label="খাদ্য ভাতা"><input type="number" name="foodAllowance" value={formData.foodAllowance} onChange={handleInputChange} className="ef-input" aria-label="Food Allowance" /></Field>
              </div>
            </div>
          </FormCard>

          <FormCard title="C. ব্যাংক তথ্য">
            <Field label="টিন নম্বর"><input type="text" name="tinNumber" value={formData.tinNumber} onChange={handleInputChange} className="ef-input" aria-label="TIN Number" /></Field>
            <Field label="ব্যাংকের নাম"><input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="ef-input" aria-label="Bank Name" /></Field>
            <Field label="হিসাব নম্বর"><input type="text" name="bankAccountNo" value={formData.bankAccountNo} onChange={handleInputChange} className="ef-input" aria-label="Account Number" /></Field>
            <Field label="শাখার নাম"><input type="text" name="bankBranch" value={formData.bankBranch} onChange={handleInputChange} className="ef-input" aria-label="Branch Name" /></Field>
          </FormCard>
        </div>
      )}

      {/* ── শিক্ষাগত যোগ্যতা (table) ── */}
      {activeStep === 'education' && (
        <FormCard title="শিক্ষাগত যোগ্যতা">
        <div className="ef-field-full">
        <ArrayTableForm<EducationEntry>
          entries={formData.educationHistory}
          onChange={list => setFormData(prev => ({ ...prev, educationHistory: list }))}
          addLabel="নতুন যোগ্যতা যোগ করুন"
          blankEntry={() => ({
            id: generateEntryId(), education: '', institution: '',
            educationGroup: '', educationResult: '', educationBoard: '', passingYear: '',
          })}
          fields={[
            { key: 'education',       placeholder: 'সর্বোচ্চ শিক্ষাগত যোগ্যতা' },
            { key: 'institution',     placeholder: 'প্রতিষ্ঠানের নাম' },
            { key: 'educationGroup',  placeholder: 'গ্রুপ/বিষয়' },
            { key: 'educationResult', placeholder: 'ফলাফল/জিপিএ' },
            { key: 'educationBoard',  placeholder: 'বোর্ড/বিশ্ববিদ্যালয়' },
            { key: 'passingYear',     placeholder: 'পাসের সন' },
          ]}
        />
        </div>
        </FormCard>
      )}

      {/* ── পূর্ববর্তী অভিজ্ঞতা (table) ── */}
      {activeStep === 'previous' && (
        <FormCard title="পূর্ববর্তী অভিজ্ঞতা">
        <div className="ef-field-full">
        <ArrayTableForm<PreviousJobEntry>
          entries={formData.previousJobs}
          onChange={list => setFormData(prev => ({ ...prev, previousJobs: list }))}
          addLabel="নতুন অভিজ্ঞতা যোগ করুন"
          blankEntry={() => ({
            id: generateEntryId(), prevCompanyName: '', prevServicePeriod: '',
            prevDesignation: '', prevSection: '', prevCompanyPhone: '',
            prevStartDate: '', prevEndDate: '', prevLeaveReason: '',
            prevRefName: '', prevRefPhone: '',
          })}
          fields={[
            { key: 'prevCompanyName',    placeholder: 'প্রতিষ্ঠানের নাম' },
            { key: 'prevDesignation',    placeholder: 'পদবি' },
            { key: 'prevSection',        placeholder: 'সেকশন/বিভাগ' },
            { key: 'prevStartDate',      placeholder: 'শুরুর তারিখ', type: 'date' },
            { key: 'prevEndDate',        placeholder: 'শেষ তারিখ', type: 'date' },
            { key: 'prevCompanyPhone',   placeholder: 'প্রতিষ্ঠানের ফোন' },
            { key: 'prevLeaveReason',    placeholder: 'ছাড়ার কারণ' },
            { key: 'prevRefName',        placeholder: 'রেফারেন্স কর্মকর্তার নাম' },
            { key: 'prevRefPhone',       placeholder: 'রেফারেন্স কর্মকর্তার ফোন' },
          ]}
        />
        </div>
        </FormCard>
      )}

      {/* ── নমিনি তথ্য ── */}
      {activeStep === 'nominee' && (
        <FormCard title="নমিনি তথ্য" dense>
          <Field label="নমিনির নাম"><input type="text" name="nomineeName" value={formData.nomineeName} onChange={handleInputChange} className="ef-input" aria-label="Nominee Name" /></Field>
          <Field label="কর্মীর সাথে সম্পর্ক"><input type="text" name="nomineeRelation" value={formData.nomineeRelation} onChange={handleInputChange} className="ef-input" aria-label="Relation with Employee" /></Field>
          <Field label="নমিনির এনআইডি নম্বর"><input type="text" name="nomineeNid" value={formData.nomineeNid} onChange={handleInputChange} className="ef-input" aria-label="Nominee NID Number" /></Field>
          <Field label="নমিনির জন্ম তারিখ"><input type="date" name="nomineeDob" value={formData.nomineeDob} onChange={handleInputChange} className="ef-input" aria-label="Nominee Date of Birth" /></Field>
          <Field label="অংশের শতাংশ"><input type="number" name="nomineePercentage" value={formData.nomineePercentage} onChange={handleInputChange} className="ef-input" aria-label="Percentage of Share" /></Field>
          <Field label="নমিনির শিক্ষাগত যোগ্যতা"><input type="text" name="nomineeEducation" value={formData.nomineeEducation} onChange={handleInputChange} className="ef-input" aria-label="Nominee Education" /></Field>
          <Field label="নমিনির পেশা"><input type="text" name="nomineeProfession" value={formData.nomineeProfession} onChange={handleInputChange} className="ef-input" aria-label="Nominee Profession" /></Field>
          <Field label="নমিনির রক্তের গ্রুপ"><input type="text" name="nomineeBloodGroup" value={formData.nomineeBloodGroup} onChange={handleInputChange} className="ef-input" aria-label="Nominee Blood Group" /></Field>
          <Field label="নমিনির মোবাইল"><input type="tel" name="nomineePhone" value={formData.nomineePhone} onChange={handleInputChange} className="ef-input" aria-label="Nominee Mobile" /></Field>
          <Field label="নমিনির সম্পূর্ণ ঠিকানা" span="full"><textarea name="nomineeAddress" value={formData.nomineeAddress} onChange={handleInputChange} className="ef-input ef-textarea" aria-label="Full Nominee Address" rows={3} /></Field>
        </FormCard>
      )}

      {/* ── তত্ত্বাবধায়ক ── */}
      {activeStep === 'supervisor' && (
        <FormCard title="তত্ত্বাবধায়ক / রেফারেন্স">
          <Field label="তত্ত্বাবধায়কের নাম"><input type="text" name="supervisorName" value={formData.supervisorName} onChange={handleInputChange} className="ef-input" aria-label="Supervisor Name" /></Field>
          <Field label="প্রতিষ্ঠানের নাম"><input type="text" name="supervisorOrg" value={formData.supervisorOrg} onChange={handleInputChange} className="ef-input" aria-label="Organization Name" /></Field>
          <Field label="পদবি"><input type="text" name="supervisorDesignation" value={formData.supervisorDesignation} onChange={handleInputChange} className="ef-input" aria-label="Designation" /></Field>
          <Field label="পেশা"><input type="text" name="supervisorProfession" value={formData.supervisorProfession} onChange={handleInputChange} className="ef-input" aria-label="Profession" /></Field>
          <Field label="মোবাইল নম্বর"><input type="tel" name="supervisorPhone" value={formData.supervisorPhone} onChange={handleInputChange} className="ef-input" aria-label="Mobile Number" /></Field>
          <Field label="সম্পর্ক"><input type="text" name="supervisorRelation" value={formData.supervisorRelation} onChange={handleInputChange} className="ef-input" aria-label="Relationship" /></Field>
          <Field label="ঠিকানা" span="full"><textarea name="supervisorAddress" value={formData.supervisorAddress} onChange={handleInputChange} className="ef-input ef-textarea" aria-label="Supervisor Address" rows={3} /></Field>
        </FormCard>
      )}

      <style>{`
        .ef-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;
        }
        .ef-card-header {
          padding: 13px 22px;
          background: #f8fafc; border-bottom: 1px solid #e2e8f0;
          font-size: 13px; font-weight: 700; color: #1d4ed8;
        }
        .ef-card-body {
          padding: 22px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px 18px;
        }
        .ef-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px 18px;
        }
        @media (min-width: 1024px) {
          .ef-card-body { grid-template-columns: repeat(3, 1fr); }
          .ef-grid { grid-template-columns: repeat(3, 1fr); }
        }
        /* Dense variant — sections with many short fields (e.g. ব্যক্তিগত
           তথ্য's ~15-field block) go to 4 columns on wide desktop screens
           to reduce vertical scroll length. */
        @media (min-width: 1280px) {
          .ef-card-body.ef-dense { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 639px) {
          .ef-card-body { grid-template-columns: 1fr; padding: 16px; gap: 12px; }
          .ef-grid { grid-template-columns: 1fr; gap: 12px; }
        }

        /* ── Fieldset-style field: label sits embedded in the border,
              like a form fieldset legend (reference: rounded purple-ish
              border, small label breaking the top-left border line). ── */
        .ef-field {
          margin: 0; padding: 0 10px 9px;
          border: 1.5px solid #cbd5e1; border-radius: 9px;
          min-width: 0;
          transition: border-color 0.14s, box-shadow 0.14s;
        }
        .ef-field:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
        }
        .ef-field-full { grid-column: 1 / -1; }

        .ef-label {
          margin: 0 0 0 2px; padding: 0 6px;
          font-size: 11px; font-weight: 600;
          color: #6366f1; letter-spacing: 0.2px;
          width: auto;
        }

        .ef-input, .ef-select {
          width: 100%; padding: 2px 4px 0;
          font-size: 14px; font-family: inherit;
          border: none; background: transparent; color: #1e293b;
          outline: none; box-sizing: border-box;
          min-height: 26px;
        }
        .ef-input::placeholder { color: #cbd5e1; }
        .ef-select {
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 2px center;
          padding-right: 18px;
        }
        .ef-input-sm { font-size: 13px; min-height: 22px; }
        .ef-textarea { resize: vertical; min-height: 64px; padding-top: 4px; }

        .ef-subgroup {
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
          margin-top: 4px;
        }
        .ef-subgroup-title {
          font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 12px;
        }
      `}</style>

    </div>
  );
};

export default EmployeeForm;