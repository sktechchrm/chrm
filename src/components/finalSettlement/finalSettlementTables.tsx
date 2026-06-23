import React, { useState } from "react";
import { EmployeeFormData, STATIC_DATA } from "./FinalSettlementDataTypes";
import { calculateLastMonthSalary, calculateServiceCompensation, calculateDeathCompensation, isGratuityEligible } from "./FinalSettlementFormula";
import { LAW_REFERENCES } from "../common/Lawreferences";

interface TableProps {
  formData: EmployeeFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface CalculationTableProps {
  formData: EmployeeFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  calculateTotalReceivable: () => string;
  calculateFinalTotal: () => string;
}

// ── Responsive CSS injected once ─────────────────────────────────────────────
const RESPONSIVE_CSS = `
  .fst-table { width: 100%; border-collapse: collapse; }
  .fst-table td { vertical-align: middle; }

  /* Label column */
  .fst-label {
    background: linear-gradient(to right, #f8fafc, #f1f5f9);
    border-right: 1px solid #e2e8f0;
    padding: 10px 14px;
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
    width: 38%;
    min-width: 130px;
  }
  .fst-label-inner { display: flex; align-items: center; gap: 6px; }
  .fst-bar { width: 3px; border-radius: 99px; flex-shrink: 0; }

  /* Value column */
  .fst-value { padding: 8px 12px; }

  /* Input base */
  .fst-input {
    width: 100%;
    padding: 7px 10px;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
    box-sizing: border-box;
    background: #fff;
  }
  .fst-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
  .fst-input[readonly] { background: #f8fafc; color: #64748b; cursor: default; }
  .fst-input-mono { font-family: 'Courier New', monospace; font-weight: 700; text-align: right; font-size: 14px; }
  .fst-input-center { text-align: center; }

  /* Select */
  .fst-select {
    width: 100%;
    padding: 7px 10px;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    background: #fff;
    transition: border-color .15s;
  }
  .fst-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }

  /* Date row: three inputs side by side */
  .fst-date-group { display: flex; gap: 6px; }
  .fst-date-group .fst-input { width: auto; flex: 1; min-width: 0; text-align: center; }

  /* Row stripe */
  .fst-row { border-bottom: 1px solid #e2e8f0; }
  .fst-row:hover { background: #f0f9ff; }
  .fst-row-earn { background: linear-gradient(to right, #eff6ff, #f0fdfa); }
  .fst-row-earn:hover { background: linear-gradient(to right, #dbeafe, #ccfbf1); }
  .fst-row-deduct { background: linear-gradient(to right, #fff1f2, #fdf2f8); }
  .fst-row-deduct:hover { background: linear-gradient(to right, #ffe4e6, #fce7f3); }

  /* Total rows */
  .fst-total-a { background: linear-gradient(to right, #16a34a, #059669); color: #fff; border-bottom: 3px solid #15803d; }
  .fst-total-b { background: linear-gradient(to right, #d97706, #b45309); color: #fff; border-bottom: 3px solid #92400e; }
  .fst-total-net { background: linear-gradient(to right, #ecfdf5, #d1fae5); border: 2.5px solid #10b981; }

  /* Inline compact inputs (inside text) */
  .fst-inline-input {
    display: inline-block;
    width: 52px;
    padding: 3px 6px;
    border: 1.5px solid #93c5fd;
    border-radius: 6px;
    text-align: center;
    font-weight: 700;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    background: #fff;
    transition: border-color .15s;
    vertical-align: middle;
  }
  .fst-inline-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
  .fst-inline-input-wide {
    display: inline-block;
    width: 140px;
    padding: 3px 8px;
    border: 1.5px solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
    outline: none;
    font-family: inherit;
    background: #fff;
    transition: border-color .15s;
    vertical-align: middle;
  }
  @media (max-width: 400px) { .fst-inline-input-wide { width: 100px; } }
  .fst-inline-input-wide:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }

  /* Section header */
  .fst-header {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    padding: 11px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .fst-header-accent { width: 3px; height: 22px; background: #60a5fa; border-radius: 99px; flex-shrink: 0; }
  .fst-header-text { color: #fff; font-weight: 700; font-size: 13px; letter-spacing: .04em; text-transform: uppercase; }

  /* Card wrapper */
  .fst-card { border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; background: #fff; margin-bottom: 16px; box-shadow: 0 1px 6px rgba(0,0,0,.06); }
  .fst-card:last-child { margin-bottom: 0; }

  /* Service grid */
  .fst-service-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 14px; }
  @media (max-width: 640px) { .fst-service-grid { grid-template-columns: repeat(2, 1fr); } }

  .fst-service-box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; }
  .fst-service-box-blue { background: #eff6ff; border-color: #bfdbfe; }
  .fst-service-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
  .fst-service-label-blue { color: #1d4ed8; }

  /* Absent days grid */
  .fst-absent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 14px; }
  @media (max-width: 480px) { .fst-absent-grid { grid-template-columns: 1fr; } }
  .fst-absent-box { background: linear-gradient(to br, #eff6ff, #eef2ff); border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 10px 12px; }
  .fst-absent-box-label { font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }

  /* Last month row — flex wraps on small screens */
  .fst-lastmonth { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 13px; font-weight: 600; color: #1e293b; }
  .fst-lastmonth select {
    padding: 4px 8px; border: 1.5px solid #d1d5db; border-radius: 7px;
    font-size: 12px; outline: none; font-family: inherit; background: #fff;
  }
  .fst-lastmonth select:focus { border-color: #3b82f6; }

  /* Amount value cell */
  .fst-amount { font-family: 'Courier New', monospace; font-weight: 800; font-size: 15px; text-align: right; padding: 10px 12px; white-space: nowrap; }
  .fst-unit { font-size: 11px; font-weight: 700; color: #6b7280; padding: 0 10px; white-space: nowrap; }
  .fst-unit-white { color: rgba(255,255,255,.8); }

  /* Wage row — read-only vs header row */
  .fst-row-wage-main { background: linear-gradient(to right, #fffbeb, #fef3c7); }
  .fst-row-wage-main:hover { background: linear-gradient(to right, #fef9c3, #fde68a); }

  /* Dots */
  .dot { width: 6px; height: 6px; border-radius: 99px; flex-shrink: 0; display: inline-block; }

  /* Responsive table scroll wrapper (only for wide tables on mobile) */
  .fst-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

  /* Law-reference info icon + panel */
  .fst-info-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border: none; background: none; cursor: pointer;
    color: #94a3b8; padding: 0; flex-shrink: 0; transition: color .15s;
  }
  .fst-info-btn:hover { color: #2563eb; }
  .fst-info-btn[aria-expanded="true"] { color: #2563eb; }
  .fst-law-panel { background: #eff6ff; }
  .fst-law-panel td { padding: 9px 14px; font-size: 12px; color: #1e3a8a; line-height: 1.6; border-bottom: 1px solid #dbeafe; }

  /* Payment method (compensation vs gratuity) toggle row */
  .fst-toggle-row { background: linear-gradient(to right, #faf5ff, #eef2ff); border-bottom: 1px solid #e9d5ff; }
  .fst-toggle-row td { padding: 10px 14px; }
  .fst-toggle-inner { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .fst-radio-label { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer; }
  .fst-ref-note { font-size: 11px; color: #64748b; margin-left: auto; }
  .fst-row-gratuity { background: linear-gradient(to right, #f5f3ff, #eef2ff); }
  .fst-row-gratuity:hover { background: linear-gradient(to right, #ede9fe, #e0e7ff); }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = RESPONSIVE_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => {
  injectCSS();
  return (
    <div className="fst-header">
      <div className="fst-header-accent" />
      <span className="fst-header-text">{title}</span>
    </div>
  );
};

const Bar = ({ color }: { color: string }) => (
  <span className="fst-bar" style={{ height: 16, background: color }} />
);

const Dot = ({ color }: { color: string }) => (
  <span className="dot" style={{ background: color }} />
);

// Law-reference info icon + accordion panel — only one open at a time per table.
const InfoBtn = ({ id, openId, onToggle }: { id: string; openId: string | null; onToggle: (id: string) => void }) => (
  <button
    type="button"
    className="fst-info-btn"
    aria-label="আইনি রেফারেন্স দেখুন"
    aria-expanded={openId === id}
    onClick={() => onToggle(id)}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  </button>
);

const LawPanel = ({ colSpan, text }: { colSpan: number; text: string }) => (
  <tr className="fst-law-panel">
    <td colSpan={colSpan}>{text}</td>
  </tr>
);

// ── 1. COMPANY INFORMATION TABLE ─────────────────────────────────────────────

export const CompanyInfoTable: React.FC<TableProps> = ({ formData }) => (
  <div className="fst-card">
    <SectionHeader title="কারখানার তথ্য" />
    <table className="fst-table">
      <colgroup><col style={{ width: '38%', minWidth: 130 }} /><col /></colgroup>
      <tbody>
        <tr className="fst-row">
          <td className="fst-label">
            <div className="fst-label-inner"><Bar color="#3b82f6" />কারখানার নামঃ</div>
          </td>
          <td className="fst-value" style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
            {formData.companyName}
          </td>
        </tr>
        <tr>
          <td className="fst-label" style={{ verticalAlign: 'top' }}>
            <div className="fst-label-inner"><Bar color="#3b82f6" />কারখানার ঠিকানাঃ</div>
          </td>
          <td className="fst-value" style={{ color: '#374151', fontSize: 13 }}>
            {formData.companyAddress}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

// ── 2. EMPLOYEE INFORMATION TABLE ─────────────────────────────────────────────

export const EmployeeInfoTable: React.FC<TableProps> = ({ formData, handleChange }) => (
  <div className="fst-card">
    <SectionHeader title="কর্মীর অফিসিয়াল তথ্য, চাকরিকাল ও নিষ্পত্তির ধরন" />
    <table className="fst-table">
      <colgroup><col style={{ width: '38%', minWidth: 130 }} /><col /></colgroup>
      <tbody>
        {[
          { label: 'নাম',      name: 'employeeName' },
          { label: 'কার্ড নং', name: 'cardNo'       },
          { label: 'পদবি',     name: 'designation'  },
          { label: 'বিভাগ',    name: 'section'      },
        ].map(item => (
          <tr className="fst-row" key={item.name}>
            <td className="fst-label">
              <div className="fst-label-inner"><Bar color="#22c55e" />{item.label}</div>
            </td>
            <td className="fst-value">
              <input
                className="fst-input"
                name={item.name}
                value={formData[item.name as keyof EmployeeFormData] as string}
                onChange={handleChange}
              />
            </td>
          </tr>
        ))}

        {/* Date fields */}
        {[
          { label: 'নিয়োগের তারিখ',          name: 'joiningDate'    },
          { label: 'সর্বশেষ উপস্থিতির তারিখ', name: 'lastAttendance' },
        ].map(item => {
          const raw   = (formData[item.name as keyof EmployeeFormData] as string) || '';
          const parts = raw.split('-');
          const year  = parts[0] || '';
          const month = parts[1] || '';
          const day   = parts[2] || '';

          const fire = (d: string, m: string, y: string) =>
            handleChange({ target: { name: item.name, value: `${y || new Date().getFullYear()}-${m || '01'}-${d || '01'}` } } as unknown as React.ChangeEvent<HTMLInputElement>);

          return (
            <tr className="fst-row" key={item.name}>
              <td className="fst-label">
                <div className="fst-label-inner"><Bar color="#22c55e" />{item.label}</div>
              </td>
              <td className="fst-value">
                <div className="fst-date-group">
                  <input className="fst-input fst-input-center" type="number" min="1" max="31"
                    value={day} placeholder="দিন"
                    onChange={e => e.target.value && fire(e.target.value, month, year)} />
                  <input className="fst-input fst-input-center" type="number" min="1" max="12"
                    value={month} placeholder="মাস"
                    onChange={e => e.target.value && fire(day, e.target.value, year)} />
                  <input className="fst-input fst-input-center" type="number" min="1900" max="2100"
                    value={year} placeholder="বছর" style={{ flex: 1.5 }}
                    onChange={e => e.target.value && fire(day, month, e.target.value)} />
                </div>
              </td>
            </tr>
          );
        })}

        {/* Termination type */}
        <tr>
          <td className="fst-label">
            <div className="fst-label-inner"><Bar color="#22c55e" />চাকরি নিষ্পত্তির ধরন</div>
          </td>
          <td className="fst-value">
            <select className="fst-select" name="terminationType" value={formData.terminationType} onChange={handleChange}>
              <option value="">-- নির্বাচন করুন --</option>
              <option value="ইস্তফা (২৭)">ইস্তফা (২৭)</option>
              <option value="অনুপস্থিতির কারণে ইস্তফা (২৭)">অনুপস্থিতির কারণে ইস্তফা (২৭)</option>
              <option value="অবসর (২৮)">অবসর (২৮)</option>
              <option value="চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)">চাকুরীরত থাকা অবস্থায় স্বাভাবিক মৃত্যু (১৯)</option>
              <option value="কর্মরত অবস্থায়/কর্মকালীন দূর্ঘটনার কারণে মৃত্যু (১৯)">কর্মরত অবস্থায় দুর্ঘটনাজনিত মৃত্যু (১৯)</option>
              <option value="ডিসচার্জ (২২)">ডিসচার্জ (২২)</option>
              <option value="বরখাস্ত (২৩)">বরখাস্ত (২৩)</option>
              <option value="বরখাস্ত (২৩.৪: খ/ছ)">বরখাস্ত (২৩.৪: খ/ছ)</option>
              <option value="অপসারন (২৩.৩)">অপসারন (২৩.৩)</option>
              <option value="চাকুরী অবসান (২৬)">চাকুরী অবসান (২৬)</option>
              <option value="ছাঁটাই (২০)">ছাঁটাই (২০)</option>
              <option value="লে-অফ (১৬)">লে-অফ (১৬)</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

// ── 3. SERVICE DURATION TABLE ─────────────────────────────────────────────────

export const ServiceDurationTable: React.FC<TableProps> = ({ formData, handleChange }) => (
  <div className="fst-card">
    <SectionHeader title="কর্মের মেয়াদকাল" />

    {/* Service years / months / days / benefit years */}
    <div className="fst-service-grid">
      {[
        { key: 'serviceYears',  label: 'বছর',           blue: false },
        { key: 'serviceMonths', label: 'মাস',            blue: false },
        { key: 'serviceDays',   label: 'দিন',            blue: false },
        { key: 'benefitYears',  label: 'সুবিধা প্রাপ্ত বছর', blue: true  },
      ].map(({ key, label, blue }) => (
        <div key={key} className={`fst-service-box${blue ? ' fst-service-box-blue' : ''}`}>
          <div className={`fst-service-label${blue ? ' fst-service-label-blue' : ''}`}>
            <Dot color={blue ? '#3b82f6' : '#a855f7'} />
            {label}
          </div>
          <input
            readOnly
            name={key}
            value={formData[key as keyof EmployeeFormData] as string}
            className="fst-input fst-input-mono fst-input-center"
            style={{ fontSize: 16, padding: '8px 6px', border: blue ? '1.5px solid #93c5fd' : undefined }}
          />
        </div>
      ))}
    </div>

    {/* Absent days */}
    <div className="fst-absent-grid">
      <div className="fst-absent-box">
        <div className="fst-absent-box-label"><Dot color="#6366f1" />অসম্পূর্ণ বছরের সর্বমোট দিন সমূহ</div>
        <input readOnly name="totalDays" value={formData.totalDays}
          className="fst-input fst-input-mono" />
      </div>
      <div className="fst-absent-box">
        <div className="fst-absent-box-label"><Dot color="#6366f1" />অসম্পূর্ণ বছরে অনুপস্থিতির দিন সমূহ</div>
        <input name="absentDays" value={formData.absentDays} onChange={handleChange}
          className="fst-input fst-input-mono"
          style={{ borderColor: '#93c5fd' }} />
      </div>
    </div>
  </div>
);

// ── 4. WAGE TABLE ─────────────────────────────────────────────────────────────

export const WageTable: React.FC<TableProps> = ({ formData, handleChange }) => (
  <div className="fst-card">
    <SectionHeader title="সর্বশেষ ধার্যকৃত মাসিক মোট মজুরির বিবরণ" />
    <div className="fst-scroll">
      <table className="fst-table">
        <colgroup><col /><col style={{ width: 160, minWidth: 120 }} /><col style={{ width: 48 }} /></colgroup>
        <tbody>
          {/* Total wage — editable highlight row */}
          <tr className="fst-row fst-row-wage-main">
            <td className="fst-label" style={{ background: 'transparent' }}>
              <div className="fst-label-inner">
                <Bar color="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>মোট মজুরি বা বেতন</span>
              </div>
            </td>
            <td className="fst-value">
              <input className="fst-input fst-input-mono"
                style={{ borderColor: '#fbbf24', fontSize: 16 }}
                name="totalMonthlyWage" value={formData.totalMonthlyWage} onChange={handleChange} />
            </td>
            <td className="fst-unit">টাকা</td>
          </tr>

          {/* Read-only breakdown rows */}
          {[
            { label: 'মূল মজুরি',            name: 'basicWage'         },
            { label: 'বাড়ি ভাড়া',            name: 'houseRent'         },
            { label: 'খাদ্য ভাতা',            name: 'foodAllowance'     },
            { label: 'চিকিৎসা ভাতা',          name: 'medicalAllowance'  },
            { label: 'যাতায়াত ভাতা',          name: 'transportAllowance'},
            { label: 'এক দিনের মূল মজুরি',    name: 'dailyBasic'        },
            { label: 'এক দিনের মোট মজুরি',    name: 'dailyGross'        },
            { label: 'অতিরিক্ত কর্ম ঘন্টার হার', name: 'hourlyOvertimeRate'},
          ].map(item => (
            <tr className="fst-row" key={item.name}>
              <td className="fst-label">
                <div className="fst-label-inner"><Bar color="#60a5fa" />{item.label}</div>
              </td>
              <td className="fst-value">
                <input readOnly className="fst-input fst-input-mono"
                  name={item.name}
                  value={formData[item.name as keyof EmployeeFormData] as string}
                  onChange={handleChange} />
              </td>
              <td className="fst-unit">টাকা</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── 5. CALCULATION TABLE ──────────────────────────────────────────────────────

export const CalculationTable: React.FC<CalculationTableProps> = ({
  formData, handleChange, calculateTotalReceivable, calculateFinalTotal,
}) => {
  const [openRef, setOpenRef] = useState<string | null>(null);
  const toggleRef = (id: string) => setOpenRef(prev => (prev === id ? null : id));
  const usesGratuity = formData.paymentMethod === "gratuity" && isGratuityEligible(formData.terminationType || "");
  const isDeathType = !!formData.terminationType?.includes("মৃত্যু");

  return (
  <div className="fst-card">
    <SectionHeader title="হিসাবের বিবরণ ও প্রাপ্য টাকার পরিমাণ" />
    <div className="fst-scroll">
      <table className="fst-table">
        <colgroup><col /><col style={{ width: 150, minWidth: 110 }} /><col style={{ width: 48 }} /></colgroup>
        <tbody>

          {/* ── EARNINGS ── */}

          {/* Last month salary */}
          <tr className="fst-row fst-row-earn">
            <td className="fst-label" style={{ background: 'transparent', width: '55%' }}>
              <div className="fst-label-inner" style={{ flexWrap: 'wrap', rowGap: 4 }}>
                <Bar color="#3b82f6" />
                <div className="fst-lastmonth">
                  <span>সর্বশেষ মাস</span>
                  <select name="lastMonthName" value={formData.lastMonthName} onChange={handleChange}>
                    <option value="">--মাস--</option>
                    {STATIC_DATA.bengaliMonths.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select name="lastMonthYear" value={formData.lastMonthYear} onChange={handleChange} style={{ width: 70 }}>
                    <option value="">বছর</option>
                    {STATIC_DATA.en_years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span>এর</span>
                  <input className="fst-inline-input" name="payableDay" value={formData.payableDay} onChange={handleChange} />
                  <span>দিনের মজুরি</span>
                  <InfoBtn id="lastMonthWage" openId={openRef} onToggle={toggleRef} />
                </div>
              </div>
            </td>
            <td className="fst-amount">
              {calculateLastMonthSalary(formData.totalMonthlyWage, formData.payableDay, formData.lastMonthName, formData.lastMonthYear).toFixed(2)}
            </td>
            <td className="fst-unit">টাকা</td>
          </tr>
          {openRef === "lastMonthWage" && <LawPanel colSpan={3} text={LAW_REFERENCES.lastMonthWage} />}

          {/* Overtime */}
          <tr className="fst-row fst-row-earn">
            <td className="fst-label" style={{ background: 'transparent' }}>
              <div className="fst-label-inner">
                <Bar color="#06b6d4" />
                <span>সর্বশেষ মাসের অতিরিক্ত কর্মঘন্টা (</span>
                <input className="fst-inline-input" name="payableHours" value={formData.payableHours} onChange={handleChange} />
                <span>ঘন্টা)</span>
                <InfoBtn id="overtime" openId={openRef} onToggle={toggleRef} />
              </div>
            </td>
            <td className="fst-amount">{formData.lastMonthOvertime || '0.00'}</td>
            <td className="fst-unit">টাকা</td>
          </tr>
          {openRef === "overtime" && <LawPanel colSpan={3} text={LAW_REFERENCES.overtime} />}

          {/* Earned leave */}
          <tr className="fst-row fst-row-earn">
            <td className="fst-label" style={{ background: 'transparent' }}>
              <div className="fst-label-inner">
                <Bar color="#06b6d4" />
                <span>প্রাপ্য অর্জিত ছুটি (</span>
                <input className="fst-inline-input" name="elQty" value={formData.elQty} onChange={handleChange} />
                <span>দিন)</span>
                <InfoBtn id="earnedLeave" openId={openRef} onToggle={toggleRef} />
              </div>
            </td>
            <td className="fst-amount">{formData.earnedLeave}</td>
            <td className="fst-unit">টাকা</td>
          </tr>
          {openRef === "earnedLeave" && <LawPanel colSpan={3} text={LAW_REFERENCES.earnedLeave} />}

          {/* Lay-off compensation (Section 16) — its own per-day formula */}
          {formData.terminationType === "লে-অফ (১৬)" && (
            <>
            <tr className="fst-row fst-row-earn">
              <td className="fst-label" style={{ background: 'transparent' }}>
                <div className="fst-label-inner">
                  <Bar color="#06b6d4" />
                  <span>লে-অফ ক্ষতিপূরণ (১৬) (</span>
                  <input className="fst-inline-input" name="layOffDays" value={formData.layOffDays || ''} onChange={handleChange} />
                  <span>দিন)</span>
                  <InfoBtn id="layOff" openId={openRef} onToggle={toggleRef} />
                </div>
              </td>
              <td className="fst-amount">{formData.layOffCompensation || '0.00'}</td>
              <td className="fst-unit">টাকা</td>
            </tr>
            {openRef === "layOff" && <LawPanel colSpan={3} text={LAW_REFERENCES.layOff} />}
            </>
          )}

          {/* বরখাস্ত (২৩) / বরখাস্ত (২৩.৪: খ/ছ) — not gratuity-eligible, shown plainly */}
          {!isGratuityEligible(formData.terminationType || "") && formData.terminationType !== "লে-অফ (১৬)" && formData.terminationType !== "" && (
            <>
            <tr className="fst-row fst-row-earn">
              <td className="fst-label" style={{ background: 'transparent' }}>
                <div className="fst-label-inner">
                  <Bar color="#06b6d4" />চাকরি অবসানজনিত ক্ষতিপূরণ
                  <InfoBtn id="serviceComp" openId={openRef} onToggle={toggleRef} />
                </div>
              </td>
              <td className="fst-amount">{formData.serviceCompensation}</td>
              <td className="fst-unit">টাকা</td>
            </tr>
            {openRef === "serviceComp" && (
              <LawPanel
                colSpan={3}
                text={
                  (LAW_REFERENCES.serviceCompensationByType as Record<string, string>)[formData.terminationType || ""] ||
                  "এই নিষ্পত্তির ধরনের জন্য নির্দিষ্ট রেফারেন্স পাওয়া যায়নি।"
                }
              />
            )}
            </>
          )}

          {/* ── Compensation vs Gratuity (Section 2(10)) ──
              Only offered where the Act allows the comparison — see
              isGratuityEligible() for the excluded types and why. Exactly
              one item (ক্ষতিপূরণ/মৃত্যু OR গ্র্যাচুইটি) is shown below the
              toggle, matching whichever is currently selected. */}
          {isGratuityEligible(formData.terminationType || "") && (() => {
            const benefitYears = parseFloat(formData.benefitYears || "0") || 0;
            const dailyBasic = parseFloat(formData.dailyBasic || "0") || 0;
            const refCompensation = (
              calculateServiceCompensation(formData.terminationType || "", benefitYears, dailyBasic) +
              calculateDeathCompensation(formData.terminationType || "", benefitYears, dailyBasic)
            ).toFixed(2);

            return (
            <>
            <tr className="fst-toggle-row">
              <td colSpan={3}>
                <div className="fst-toggle-inner">
                  <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bar color="#a855f7" />পেমেন্ট পদ্ধতি:
                  </span>
                  <label className="fst-radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="compensation"
                      checked={(formData.paymentMethod || "compensation") === "compensation"}
                      onChange={handleChange}
                    />
                    বিধিবদ্ধ ক্ষতিপূরণ
                  </label>
                  <label className="fst-radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="gratuity"
                      checked={usesGratuity}
                      onChange={handleChange}
                    />
                    গ্র্যাচুইটি
                  </label>
                  <span className="fst-ref-note">
                    রেফারেন্স — ক্ষতিপূরণ: {refCompensation} টাকা &nbsp;|&nbsp; গ্র্যাচুইটি: {formData.gratuityAmount || "0.00"} টাকা
                  </span>
                </div>
              </td>
            </tr>

            {!usesGratuity ? (
              <>
              <tr className="fst-row fst-row-earn">
                <td className="fst-label" style={{ background: 'transparent' }}>
                  <div className="fst-label-inner">
                    <Bar color="#06b6d4" />
                    {isDeathType ? "মৃত্যুজনিত ক্ষতিপূরণ (১৯)" : "চাকরি অবসানজনিত ক্ষতিপূরণ"}
                    <InfoBtn id="compOrDeath" openId={openRef} onToggle={toggleRef} />
                  </div>
                </td>
                <td className="fst-amount">{isDeathType ? formData.deathCompensation : formData.serviceCompensation}</td>
                <td className="fst-unit">টাকা</td>
              </tr>
              {openRef === "compOrDeath" && (
                <LawPanel
                  colSpan={3}
                  text={
                    (isDeathType
                      ? (LAW_REFERENCES.deathCompensationByType as Record<string, string>)[formData.terminationType || ""]
                      : (LAW_REFERENCES.serviceCompensationByType as Record<string, string>)[formData.terminationType || ""]
                    ) || "এই নিষ্পত্তির ধরনের জন্য নির্দিষ্ট রেফারেন্স পাওয়া যায়নি।"
                  }
                />
              )}
              </>
            ) : (
              <>
              <tr className="fst-row fst-row-gratuity">
                <td className="fst-label" style={{ background: 'transparent' }}>
                  <div className="fst-label-inner">
                    <Bar color="#a855f7" />গ্র্যাচুইটি
                    <InfoBtn id="gratuityRow" openId={openRef} onToggle={toggleRef} />
                  </div>
                </td>
                <td className="fst-amount">{formData.gratuityAmount || "0.00"}</td>
                <td className="fst-unit">টাকা</td>
              </tr>
              {openRef === "gratuityRow" && <LawPanel colSpan={3} text={LAW_REFERENCES.gratuity} />}
              </>
            )}
            </>
            );
          })()}

          {/* Notice pay — conditional */}
          {['চাকুরী অবসান (২৬)', 'ছাঁটাই (২০)'].includes(formData.terminationType || '') && (
            <>
            <tr className="fst-row fst-row-earn">
              <td className="fst-label" style={{ background: 'transparent' }}>
                <div className="fst-label-inner">
                  <Bar color="#06b6d4" />
                  <span>নোটিশ পে (</span>
                  <input className="fst-inline-input" name="noticePayDay" value={formData.noticePayDay} onChange={handleChange} />
                  <span>দিন)</span>
                  <InfoBtn id="noticePay" openId={openRef} onToggle={toggleRef} />
                </div>
              </td>
              <td className="fst-amount">{formData.noticePay}</td>
              <td className="fst-unit">টাকা</td>
            </tr>
            {openRef === "noticePay" && <LawPanel colSpan={3} text={LAW_REFERENCES.noticePay} />}
            </>
          )}

          {/* Others (earnings) */}
          <tr className="fst-row fst-row-earn" style={{ borderBottom: '2px solid #bfdbfe' }}>
            <td className="fst-label" style={{ background: 'transparent' }}>
              <div className="fst-label-inner" style={{ flexWrap: 'wrap', rowGap: 4 }}>
                <Bar color="#06b6d4" />
                <span>অন্যান্য:</span>
                <input className="fst-inline-input-wide" name="otherBenefits"
                  value={formData.otherBenefits || ''} onChange={handleChange} placeholder="বিবরণ লিখুন" />
              </div>
            </td>
            <td className="fst-value">
              <input className="fst-input fst-input-mono" name="others" value={formData.others} onChange={handleChange} />
            </td>
            <td className="fst-unit">টাকা</td>
          </tr>

          {/* Total A */}
          <tr className="fst-total-a">
            <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: 15, letterSpacing: '.02em' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 4, height: 28, background: 'rgba(255,255,255,.6)', borderRadius: 99 }} />
                মোট প্রাপ্য (A)
              </div>
            </td>
            <td style={{ textAlign: 'right', fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 18, padding: '12px 12px' }}>
              {calculateTotalReceivable()}
            </td>
            <td className="fst-unit fst-unit-white">টাকা</td>
          </tr>

          {/* ── DEDUCTIONS ── */}

          {/* Notice deduction — conditional */}
          {['ইস্তফা (২৭)', 'অনুপস্থিতির কারণে ইস্তফা (২৭)'].includes(formData.terminationType || '') && (
            <tr className="fst-row fst-row-deduct">
              <td className="fst-label" style={{ background: 'transparent' }}>
                <div className="fst-label-inner">
                  <Bar color="#ef4444" />
                  <span>কর্তন (নোটিশ বাবদ):</span>
                  <input className="fst-inline-input" style={{ borderColor: '#fca5a5' }}
                    name="noticeDeductionDay" value={formData.noticeDeductionDay} onChange={handleChange} />
                  <span>দিন</span>
                </div>
              </td>
              <td className="fst-amount">{formData.noticeDeduction}</td>
              <td className="fst-unit">টাকা</td>
            </tr>
          )}

          {/* Advance deduction */}
          <tr className="fst-row fst-row-deduct">
            <td className="fst-label" style={{ background: 'transparent' }}>
              <div className="fst-label-inner" style={{ flexWrap: 'wrap', rowGap: 4 }}>
                <Bar color="#ef4444" />
                <span>কর্তন (অগ্রিম গ্রহণ বাবদ):</span>
                <input className="fst-inline-input-wide" style={{ borderColor: '#fca5a5' }}
                  name="deductionForAdvance" value={formData.deductionForAdvance || ''} onChange={handleChange} placeholder="বিবরণ লিখুন" />
              </div>
            </td>
            <td className="fst-value">
              <input className="fst-input fst-input-mono" style={{ borderColor: '#fca5a5' }}
                name="advanceDeduction" value={formData.advanceDeduction} onChange={handleChange} />
            </td>
            <td className="fst-unit">টাকা</td>
          </tr>

          {/* Other deductions */}
          <tr className="fst-row fst-row-deduct" style={{ borderBottom: '2px solid #fecaca' }}>
            <td className="fst-label" style={{ background: 'transparent' }}>
              <div className="fst-label-inner" style={{ flexWrap: 'wrap', rowGap: 4 }}>
                <Bar color="#ef4444" />
                <span>অন্যান্য কর্তন:</span>
                <input className="fst-inline-input-wide" style={{ borderColor: '#fca5a5' }}
                  name="deductionParticularsB" value={formData.deductionParticularsB || ''} onChange={handleChange} placeholder="বিবরণ লিখুন" />
              </div>
            </td>
            <td className="fst-value">
              <input className="fst-input fst-input-mono" style={{ borderColor: '#fca5a5' }}
                name="otherDeduction" value={formData.otherDeduction} onChange={handleChange} />
            </td>
            <td className="fst-unit">টাকা</td>
          </tr>

          {/* Total B */}
          <tr className="fst-total-b">
            <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 4, height: 28, background: 'rgba(255,255,255,.6)', borderRadius: 99 }} />
                মোট কর্তন (B)
              </div>
            </td>
            <td style={{ textAlign: 'right', fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 18, padding: '12px 12px' }}>
              {formData.totalDeductions}
            </td>
            <td className="fst-unit fst-unit-white">টাকা</td>
          </tr>

          {/* ── NET TOTAL ── */}
          <tr className="fst-total-net">
            <td style={{ padding: '14px 14px', fontWeight: 900, fontSize: 15, color: '#065f46' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 5, height: 32, background: '#10b981', borderRadius: 99 }} />
                সর্বমোট নিট প্রাপ্য (A − B)
              </div>
            </td>
            <td style={{ textAlign: 'right', fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 20, color: '#047857', padding: '14px 12px' }}>
              {calculateFinalTotal()}
            </td>
            <td style={{ fontSize: 12, fontWeight: 800, color: '#065f46', padding: '0 10px', whiteSpace: 'nowrap' }}>টাকা</td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
  );
};