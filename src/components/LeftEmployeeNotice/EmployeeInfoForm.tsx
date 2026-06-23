// ─────────────────────────────────────────────────────────────────────────────
// EmployeeInfoForm.tsx
//
// CHANGES vs previous version:
//  - Removed the dead default-exported `App` component (was never imported
//    anywhere — EmployeeNoticeView.tsx only ever used the named `EmployeeForm`
//    export). That dead code is now superseded by the rebuilt
//    EmployeeNoticeView.tsx, which wires this form into ModuleShell directly.
//  - Removed the local duplicate `Address`/`Employee` interfaces — now
//    imports the single canonical versions from `LeftNoticeDataType.ts`,
//    eliminating a type-definition split that risked silent drift between
//    the two copies.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import type { Address, Employee } from '../../types/LeftNoticeDataType';
import { 
  FaUser, FaMapMarkerAlt, FaHome, 
  FaSync 
} from 'react-icons/fa';

/* ===================== CONSTANTS & LOGIC ===================== */
const publicHolidays: Record<string, string> = {
  '02-21': 'Language Day',
  '03-26': 'Independence Day',
  '04-14': 'Pohela Boishakh',
  '05-01': 'May Day',
  '08-15': 'National Mourning Day',
  '12-16': 'Victory Day'
};

const isPublicHoliday = (date: Date): boolean => {
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return key in publicHolidays;
};

const isWeekend = (date: Date): boolean => date.getDay() === 5 || date.getDay() === 6;

const isWorkingDay = (date: Date): boolean => !isWeekend(date) && !isPublicHoliday(date);

const addWorkingDays = (startDate: string, days: number): string => {
  if (!startDate) return '';
  let date = new Date(startDate);
  let count = 0;
  while (count < days) {
    date.setDate(date.getDate() + 1);
    if (isWorkingDay(date)) count++;
  }
  return date.toISOString().split('T')[0];
};

const getDateParts = (isoDate?: string) => {
  if (!isoDate) return { day: '', month: '', year: '' };
  const [year, month, day] = isoDate.split('-');
  return { day, month, year };
};

const buildDateISO = ({ day, month, year }: { day: string; month: string; year: string }): string => {
  if (!day || !month || !year) return '';
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (
    Number.isNaN(d) ||
    Number.isNaN(m) ||
    Number.isNaN(y) ||
    d < 1 || d > 31 ||
    m < 1 || m > 12 ||
    y < 1900 || y > 2100
  ) {
    return '';
  }
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const testDate = new Date(iso);
  if (isNaN(testDate.getTime())) return '';
  return iso;
};

/* ===================== MAIN COMPONENT ===================== */
interface Props {
  employee: Employee;
  onChange: (data: Employee) => void;
  /** Which section to show — controlled by the sidebar tabs in ModuleShell */
  activeTab?: 'personal' | 'address';
}

export const EmployeeForm: React.FC<Props> = ({ employee, onChange, activeTab = 'personal' }) => {
  const [sameAddress, setSameAddress] = useState(false);
  const [dateInputs, setDateInputs] = useState({ day: '', month: '', year: '' });

  // Sync date inputs with employee data when it changes externally
  useEffect(() => {
    const parts = getDateParts(employee.absenceStartDate);
    setDateInputs(parts);
  }, [employee.absenceStartDate]);

  useEffect(() => {
    if (!employee.absenceStartDate) return;
    const first = addWorkingDays(employee.absenceStartDate, 10);
    const second = addWorkingDays(first, 10);
    const third = addWorkingDays(second, 7);

    // Only update if dates have changed to avoid infinite loop
    if (employee.firstNoticeDate !== first || employee.secondNoticeDate !== second || employee.thirdNoticeDate !== third) {
      onChange({
        ...employee,
        firstNoticeDate: first,
        secondNoticeDate: second,
        thirdNoticeDate: third
      });
    }
  }, [employee.absenceStartDate, employee.firstNoticeDate, employee.secondNoticeDate, employee.thirdNoticeDate, employee, onChange]);

  useEffect(() => {
    if (sameAddress) {
      // Only update if addresses are different to avoid infinite loop
      if (JSON.stringify(employee.permanentAddress) !== JSON.stringify(employee.presentAddress)) {
        onChange({
          ...employee,
          permanentAddress: { ...employee.presentAddress }
        });
      }
    }
  }, [employee.presentAddress, sameAddress, employee, onChange]);

  const updateAddr = (type: 'presentAddress' | 'permanentAddress', field: keyof Address, val: string) => {
    onChange({
      ...employee,
      [type]: { ...employee[type], [field]: val }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">

      {activeTab === 'personal' && (
      <>
      {/* 1. PERSONAL & WORK INFO */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <FaUser className="text-slate-400" />
          <span className="font-bold text-slate-700">সাধারণ তথ্য / Personal Info</span>
        </div>

        {/* Form Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Name */}
          <InputBox
            label="কর্মীর নাম *"
            value={employee.name}
            onChange={(v) => onChange({ ...employee, name: v })}
            placeholder="নাম লিখুন"
          />

          {/* Father's Name */}
          <InputBox
            label="পিতার নাম"
            value={employee.fatherName}
            onChange={(v) => onChange({ ...employee, fatherName: v })}
            placeholder="পিতার নাম"
          />

          {/* Card No */}
          <InputBox
            label="কার্ড নং *"
            value={employee.cardNo}
            onChange={(v) => onChange({ ...employee, cardNo: v })}
            placeholder="ID নম্বর"
          />

          {/* Designation */}
          <InputBox
            label="পদবী *"
            value={employee.designation}
            onChange={(v) => onChange({ ...employee, designation: v })}
            placeholder="যেমন: অপারেটর"
          />

          {/* Section */}
          <InputBox
            label="সেকশন"
            value={employee.section}
            onChange={(v) => onChange({ ...employee, section: v })}
            placeholder="যেমন: সুইং"
          />

          {/* Absence Start Date */}
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
              অনুপস্থিতির শুরু *
            </label>

            <div className="flex gap-2">
              {/* Day */}
              <input
                type="number"
                min={1}
                max={31}
                value={dateInputs.day}
                onChange={(e) => {
                  const newDay = e.target.value;
                  setDateInputs({ ...dateInputs, day: newDay });
                  const newDate = buildDateISO({ day: newDay, month: dateInputs.month, year: dateInputs.year });
                  onChange({ ...employee, absenceStartDate: newDate });
                }}
                placeholder="দিন"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
              <input
                type="number"
                min={1}
                max={12}
                value={dateInputs.month}
                onChange={(e) => {
                  const newMonth = e.target.value;
                  setDateInputs({ ...dateInputs, month: newMonth });
                  const newDate = buildDateISO({ day: dateInputs.day, month: newMonth, year: dateInputs.year });
                  onChange({ ...employee, absenceStartDate: newDate });
                }}
                placeholder="মাস"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
              <input
                type="number"
                min={1900}
                max={2100}
                value={dateInputs.year}
                onChange={(e) => {
                  const newYear = e.target.value;
                  setDateInputs({ ...dateInputs, year: newYear });
                  const newDate = buildDateISO({ day: dateInputs.day, month: dateInputs.month, year: newYear });
                  onChange({ ...employee, absenceStartDate: newDate });
                }}
                placeholder="বছর"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">লিঙ্গ *</label>
            <select
              className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              value={employee.gender}
              onChange={(e) => onChange({ ...employee, gender: e.target.value })}
            >
              <option value="">লিঙ্গ নির্বাচন করুন</option>
              <option value="male">পুরুষ</option>
              <option value="female">মহিলা</option>
            </select>
          </div>

          {/* Husband Name (conditional) */}
          {employee.gender === "female" && (
            <InputBox
              label="স্বামীর নাম"
              value={employee.husbandName || ""}
              onChange={(v) => onChange({ ...employee, husbandName: v })}
              placeholder="স্বামীর নাম লিখুন"
            />
          )}
        </div>
      </div>
      </>
      )}

      {activeTab === 'address' && (
      <>
      {/* 2. ADDRESS SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-slate-400" />
            <span className="font-bold text-slate-700">ঠিকানা / Addresses</span>
          </div>
          <label className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              checked={sameAddress} 
              onChange={(e) => setSameAddress(e.target.checked)} 
            />
            <span className="text-xs font-bold text-slate-600">উভয় ঠিকানা একই</span>
          </label>
        </div>

        <div className="p-8 flex flex-col lg:flex-row gap-8">
          {/* Present Address */}
          <div className="flex-1 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 mb-6 text-blue-800">
              <FaMapMarkerAlt aria-hidden="true" /> <h3 className="font-bold uppercase tracking-wider">বর্তমান ঠিকানা</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputBox label="গ্রাম" value={employee.presentAddress.village} onChange={(v) => updateAddr('presentAddress', 'village', v)} compact />
              <InputBox label="ডাকঘর" value={employee.presentAddress.postOffice} onChange={(v) => updateAddr('presentAddress', 'postOffice', v)} compact />
              <InputBox label="থানা" value={employee.presentAddress.thana} onChange={(v) => updateAddr('presentAddress', 'thana', v)} compact />
              <InputBox label="জেলা" value={employee.presentAddress.district} onChange={(v) => updateAddr('presentAddress', 'district', v)} compact />
            </div>
          </div>

          <div className="hidden lg:flex items-center opacity-20"><FaSync className={sameAddress ? "animate-spin-slow" : ""} /></div>

          {/* Permanent Address */}
          <div className={`flex-1 p-6 rounded-2xl border transition-all ${sameAddress ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-emerald-50/30 border-emerald-100'}`}>
            <div className={`flex items-center gap-2 mb-6 ${sameAddress ? 'text-slate-400' : 'text-emerald-800'}`}>
              <FaHome aria-hidden="true" /> <h3 className="font-bold uppercase tracking-wider">স্থায়ী ঠিকানা</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputBox label="গ্রাম" value={employee.permanentAddress.village} onChange={(v) => updateAddr('permanentAddress', 'village', v)} disabled={sameAddress} compact />
              <InputBox label="ডাকঘর" value={employee.permanentAddress.postOffice} onChange={(v) => updateAddr('permanentAddress', 'postOffice', v)} disabled={sameAddress} compact />
              <InputBox label="থানা" value={employee.permanentAddress.thana} onChange={(v) => updateAddr('permanentAddress', 'thana', v)} disabled={sameAddress} compact />
              <InputBox label="জেলা" value={employee.permanentAddress.district} onChange={(v) => updateAddr('permanentAddress', 'district', v)} disabled={sameAddress} compact />
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

/* ===================== SUB-COMPONENTS WITH TYPES ===================== */

interface InputBoxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ label, value, onChange, placeholder, disabled = false, compact = false }) => (
  <div className="group">
    <label className={`block font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
      {label}
    </label>
    <input
      disabled={disabled}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none 
        ${disabled ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}`}
    />
  </div>
);