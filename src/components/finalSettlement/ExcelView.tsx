import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { EmployeeFormData } from "./FinalSettlementDataTypes";
import * as XLSX from "xlsx";
import {
  calculateLastMonthSalary,
  calculateHourlyOvertimeRate,
  calculateServiceCompensation,
  calculateDeathCompensation,
  calculateEarnedLeave,
  calculateNoticePay,
  calculateNoticeDeduction,
  calculateTotalReceivable,
  calculateFinalTotal,
  SALARY_MONTHLY_DAYS,
} from "./FinalSettlementFormula";

// ─────────────────────────────────────────────────────────────────────────────
// Derive all calculated values from a EmployeeFormData row (same logic as PaymentBill)
// ─────────────────────────────────────────────────────────────────────────────
function deriveRow(fd: EmployeeFormData) {
  const totalMonthlyWage = parseFloat(fd.totalMonthlyWage) || 0;
  const payableDay       = parseFloat(fd.payableDay)       || 0;
  const basicWage        = parseFloat(fd.basicWage)        || 0;
  const yearNum          = parseInt(fd.lastMonthYear || "") || new Date().getFullYear();
  const month            = fd.lastMonthName || "";
  const calDays          = SALARY_MONTHLY_DAYS(month, yearNum);
  const perDayRate       = calDays > 0 ? totalMonthlyWage / calDays : 0;

  const lastMonthSalary   = calculateLastMonthSalary(totalMonthlyWage, payableDay, month, fd.lastMonthYear);
  const hourlyRate        = calculateHourlyOvertimeRate(basicWage);
  const otHours           = parseFloat(fd.payableHours || "0") || 0;
  const lastMonthOvertime = parseFloat((hourlyRate * otHours).toFixed(2));
  const earnedLeave       = calculateEarnedLeave(parseFloat(fd.elQty) || 0, parseFloat(fd.dailyGross) || 0);
  const serviceComp       = calculateServiceCompensation(fd.terminationType, parseFloat(fd.benefitYears) || 0, parseFloat(fd.dailyBasic) || 0);
  const deathComp         = calculateDeathCompensation(fd.terminationType, parseFloat(fd.benefitYears) || 0, parseFloat(fd.dailyBasic) || 0);
  const noticePay         = calculateNoticePay(parseFloat(fd.noticePayDay) || 0, parseFloat(fd.dailyBasic) || 0);
  const others            = parseFloat(fd.others || "0") || 0;

  const patchedFd = {
    ...fd,
    lastMonthSalary:     lastMonthSalary.toString(),
    lastMonthOvertime:   lastMonthOvertime.toString(),
    earnedLeave:         earnedLeave.toString(),
    serviceCompensation: serviceComp.toString(),
    deathCompensation:   deathComp.toString(),
    noticePay:           noticePay.toString(),
  };

  const totalReceivable  = parseFloat(calculateTotalReceivable(patchedFd)) || 0;
  const noticeDeduction  = calculateNoticeDeduction(parseFloat(fd.noticeDeductionDay) || 0, parseFloat(fd.dailyBasic) || 0);
  const advanceDeduction = parseFloat(fd.advanceDeduction || "0") || 0;
  const otherDeduction   = parseFloat(fd.otherDeduction   || "0") || 0;
  const totalDeductions  = noticeDeduction + advanceDeduction + otherDeduction;
  const netPayable       = parseFloat(calculateFinalTotal(totalReceivable.toString(), totalDeductions.toString())) || 0;

  const basicComponents =
    (parseFloat(fd.basicWage)          || 0) +
    (parseFloat(fd.houseRent)          || 0) +
    (parseFloat(fd.foodAllowance)      || 0) +
    (parseFloat(fd.transportAllowance) || 0) +
    (parseFloat(fd.medicalAllowance)   || 0);

  // চাকরির মেয়াদকাল display string
  const serviceDuration = [
    fd.serviceYears  ? `${fd.serviceYears} বছর`  : "",
    fd.serviceMonths ? `${fd.serviceMonths} মাস`  : "",
    fd.serviceDays   ? `${fd.serviceDays} দিন`    : "",
  ].filter(Boolean).join(" ") || "—";

  return {
    perDayRate,
    lastMonthSalary,
    lastMonthOvertime,
    earnedLeave,
    serviceComp,
    deathComp,
    noticePay,
    others,
    totalReceivable,
    noticeDeduction,
    advanceDeduction,
    otherDeduction,
    totalDeductions,
    netPayable,
    basicComponents,
    serviceDuration,
    otHours,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline editable cell
// ─────────────────────────────────────────────────────────────────────────────
interface EditableCellProps {
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number";
  align?: "left" | "center" | "right";
  width?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value, onChange, type = "text", align = "left", width = "80px",
}) => {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  const open = () => {
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => ref.current?.select(), 0);
  };
  const commit = () => { setEditing(false); onChange(draft); };

  if (editing) {
    return (
      <input
        ref={ref}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter")  commit();
          if (e.key === "Escape") setEditing(false);
        }}
        style={{ minWidth: width, textAlign: align }}
        className="border border-blue-400 bg-blue-50 rounded px-1 text-[11px] outline-none w-full"
      />
    );
  }

  return (
    <div
      onClick={open}
      title="ক্লিক করে সম্পাদনা করুন"
      style={{ minWidth: width, textAlign: align }}
      className="cursor-pointer rounded px-1 py-[2px] text-[11px] min-h-[20px]
                 border border-transparent hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
      {value === "" || value === 0
        ? <span className="text-gray-300 italic text-[10px]">—</span>
        : String(value)}
    </div>
  );
};

// Read-only calculated cell
const CalcCell: React.FC<{ value: number | string; cls?: string }> = ({ value, cls = "" }) => (
  <div className={`text-[11px] text-right px-1 py-[2px] font-semibold select-none ${cls}`}>
    {typeof value === "number"
      ? value > 0 ? value.toLocaleString("en-IN") : <span className="text-gray-300">—</span>
      : <span className="text-[10px] text-center block">{value || <span className="text-gray-300">—</span>}</span>
    }
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// XLSX export  (updated with new columns)
// ─────────────────────────────────────────────────────────────────────────────
function doExport(
  rows: EmployeeFormData[],
  companyName: string,
  companyAddress: string,
  salaryMonth: string,
  department: string
) {
  const HEADERS = [
    // কর্মীর তথ্য
    "#", "নাম / যোগদান তারিখ", "কার্ড নং", "পদ", "সেকশন",
    "চাকরির মেয়াদকাল", "মোট সুবিধাপ্রাপ্ত বছর",
    // বেতন ও ভাতাদি
    "মোট মাসিক মজুরি", "মূল বেতন", "বাড়ি ভাড়া",
    "টিফিন", "যাতায়াত", "চিকিৎসা", "মোট বেতন (ভাতাদি সহ)",
    // সর্বশেষ মাসের বেতন
    "দিন", "অতিরিক্ত কর্মঘন্টা",
    // চূড়ান্ত পাওনা
    "সর্বশেষ মাসের বেতন", "ওভারটাইম", "অর্জিত ছুটি",
    "সার্ভিস ক্ষতিপূরণ", "মৃত্যু ক্ষতিপূরণ", "নোটিশ পে", "অন্যান্য",
    "মোট প্রাপ্তি",
    // কর্তন
    "নোটিশ কর্তন", "অগ্রিম কর্তন", "অন্যান্য কর্তন", "মোট কর্তন",
    // নিট
    "নিট প্রদেয়",
    // অন্যান্য
    "স্বাক্ষর / টিপ", "মন্তব্য",
  ];

  const wsData: (string | number | null)[][] = [
    [companyName,    ...Array(HEADERS.length - 1).fill(null)],
    [companyAddress, ...Array(HEADERS.length - 1).fill(null)],
    [
      `কার্যালয়/বিভাগ: ${department}`,
      ...Array(6).fill(null),
      "চূড়ান্ত পাওনা বিল — Out Going List",
      ...Array(13).fill(null),
      `বেতন মাস: ${salaryMonth}`,
      ...Array(8).fill(null),
    ],
    HEADERS,
  ];

  rows.forEach((fd, i) => {
    const d = deriveRow(fd);
    wsData.push([
      i + 1,
      `${fd.employeeName}\n${fd.joiningDate}`,
      fd.cardNo, fd.designation, fd.section,
      d.serviceDuration,
      fd.benefitYears || "—",
      parseFloat(fd.totalMonthlyWage) || 0,
      parseFloat(fd.basicWage)        || 0,
      parseFloat(fd.houseRent)        || 0,
      parseFloat(fd.foodAllowance)    || 0,
      parseFloat(fd.transportAllowance) || 0,
      parseFloat(fd.medicalAllowance) || 0,
      d.basicComponents,
      parseFloat(fd.payableDay)       || 0,
      parseFloat(fd.payableHours)     || 0,
      d.lastMonthSalary, d.lastMonthOvertime, d.earnedLeave,
      d.serviceComp, d.deathComp, d.noticePay, d.others,
      d.totalReceivable,
      d.noticeDeduction, d.advanceDeduction, d.otherDeduction, d.totalDeductions,
      d.netPayable,
      "", "",
    ]);
  });

  // Totals row
  const totRow: (string | number | null)[] = Array(HEADERS.length).fill(null);
  totRow[0] = "সর্বমোট";
  const numStart = 7; // index of "মোট মাসিক মজুরি"
  const getters: ((fd: EmployeeFormData) => number)[] = [
    fd => parseFloat(fd.totalMonthlyWage)    || 0,
    fd => parseFloat(fd.basicWage)           || 0,
    fd => parseFloat(fd.houseRent)           || 0,
    fd => parseFloat(fd.foodAllowance)       || 0,
    fd => parseFloat(fd.transportAllowance)  || 0,
    fd => parseFloat(fd.medicalAllowance)    || 0,
    fd => deriveRow(fd).basicComponents,
    fd => parseFloat(fd.payableDay)          || 0,
    fd => parseFloat(fd.payableHours)        || 0,
    fd => deriveRow(fd).lastMonthSalary,
    fd => deriveRow(fd).lastMonthOvertime,
    fd => deriveRow(fd).earnedLeave,
    fd => deriveRow(fd).serviceComp,
    fd => deriveRow(fd).deathComp,
    fd => deriveRow(fd).noticePay,
    fd => parseFloat(fd.others || "0")       || 0,
    fd => deriveRow(fd).totalReceivable,
    fd => deriveRow(fd).noticeDeduction,
    fd => parseFloat(fd.advanceDeduction || "0") || 0,
    fd => parseFloat(fd.otherDeduction   || "0") || 0,
    fd => deriveRow(fd).totalDeductions,
    fd => deriveRow(fd).netPayable,
  ];
  getters.forEach((fn, gi) => {
    totRow[numStart + gi] = rows.reduce((s, fd) => s + fn(fd), 0);
  });
  wsData.push(totRow);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [
    {wch:5},{wch:24},{wch:9},{wch:14},{wch:13},
    {wch:16},{wch:12},
    {wch:12},{wch:10},{wch:10},{wch:8},{wch:9},{wch:9},{wch:13},
    {wch:6},{wch:10},
    {wch:13},{wch:10},{wch:10},{wch:14},{wch:14},{wch:10},{wch:10},
    {wch:13},{wch:11},{wch:11},{wch:11},{wch:12},{wch:12},
    {wch:12},{wch:12},
  ];
  ws["!merges"] = [
    { s:{r:0,c:0}, e:{r:0,c:HEADERS.length-1} },
    { s:{r:1,c:0}, e:{r:1,c:HEADERS.length-1} },
    { s:{r:2,c:0}, e:{r:2,c:6} },
    { s:{r:2,c:7}, e:{r:2,c:21} },
    { s:{r:2,c:22}, e:{r:2,c:HEADERS.length-1} },
    { s:{r:3+rows.length+1,c:0}, e:{r:3+rows.length+1,c:6} },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Out Going List");
  const out  = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `Out_Going_List_${salaryMonth.replace(/\s/g, "_")}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export interface ExcelViewHandle {
  appendRow: (fd: EmployeeFormData) => void;
}

interface ExcelViewProps {
  formData: EmployeeFormData;
}

const ExcelView = forwardRef<ExcelViewHandle, ExcelViewProps>(({ formData }, ref) => {
  // rows state is 100% self-contained — never reacts to prop changes
  // Start empty — rows are added only via appendRow (never from prop)
  const [rows,  setRows]  = useState<EmployeeFormData[]>([]);
  const [month, setMonth] = useState("February 2026");
  const [dept,  setDept]  = useState(formData.section || "");

  // Expose appendRow to parent via ref — the ONLY way rows get added
  useImperativeHandle(ref, () => ({
    appendRow: (fd: EmployeeFormData) => setRows((p) => [...p, fd]),
  }));

  const deleteRow = useCallback(
    (idx: number) => setRows((p) => p.filter((_, i) => i !== idx)),
    []
  );

  const updateField = useCallback(
    (rowIdx: number, key: keyof EmployeeFormData, val: string) =>
      setRows((p) => p.map((r, i) => (i === rowIdx ? { ...r, [key]: val } : r))),
    []
  );

  const TH = ({ children, cls = "" }: { children: React.ReactNode; cls?: string }) => (
    <th className={`border border-gray-400 text-[10px] font-bold text-center px-1 py-1 align-middle ${cls}`}>
      {children}
    </th>
  );

  // Include both stored rows AND live formData row in totals
  const sumAll = (fn: (fd: EmployeeFormData) => number) =>
    [...rows, formData].reduce((s, r) => s + fn(r), 0).toLocaleString("en-IN");

  // ── Column group span counts (must match header cols exactly) ──
  // কর্মীর তথ্য: #, নাম, যোগদান, কার্ড, পদ, সেকশন, মেয়াদকাল, সুবিধাপ্রাপ্ত = 8
  // বেতন ও ভাতাদি: মোট মজুরি, মূল, বাড়ি, টিফিন, যাতায়াত, চিকিৎসা, মোট বেতন = 7
  // সর্বশেষ মাসের বেতন: দিন, অতিরিক্ত কর্মঘন্টা = 2
  // চূড়ান্ত পাওনা: বেতন, OT, EL, svc, death, notice, others, মোট = 8
  // কর্তন: notice, advance, other, মোট = 4
  // নিট: 1
  // অন্যান্য: স্বাক্ষর, মন্তব্য = 2
  // Action: 1
  // Total = 8+7+2+8+4+1+2+1 = 33

  return (
    <div className="space-y-3">

      {/* ── Controls bar ── */}
      <div className="flex flex-wrap gap-3 items-end justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">বিভাগ / সেকশন</label>
            <input
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
              placeholder="বিভাগের নাম"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">বেতন মাস</label>
            <input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
              placeholder="February 2026"
            />
          </div>
          <div className="text-[11px] text-gray-500 self-end pb-1">
            মোট কর্মী: <span className="font-bold text-gray-700">{rows.length}</span>
          </div>
        </div>
        <button
          onClick={() => doExport(rows, formData.companyName || "", formData.companyAddress || "", month, dept)}
          className="eb-btn eb-btn--excel"
          title="Export to Excel"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17l-1.5-2.5L5.5 17H4l2-3.3L4.1 10.5H5.6l1.4 2.3 1.4-2.3H10l-2 3.2L10 17H8.5zm5.5 0h-1.4l-1.6-5.5h1.3l1 3.7 1-3.7h1.3L14 17z"/></svg>
          <span>Export Excel (.xlsx)</span>
        </button>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-5 text-[11px] text-gray-500 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400 inline-block" />
          <span className="text-emerald-700 font-semibold">চলমান কর্মী</span> — ফর্মে পরিবর্তন এখানে লাইভ দেখা যাবে
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" />
          সংরক্ষিত কর্মী — ক্লিক করে সম্পাদনা করুন
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-100 border border-gray-300 inline-block" />
          নিট প্রদেয়
        </span>
      </div>

      {/* ── Scrollable table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-300 shadow">
        <table className="border-collapse" style={{ minWidth: "2600px" }}>
          <thead>
            {/* Company header */}
            <tr>
              <td colSpan={33} className="text-center font-extrabold text-sm py-2 px-3 border border-gray-400 bg-[#1F3864] text-white">
                {formData.companyName || "কোম্পানির নাম"}
              </td>
            </tr>
            <tr>
              <td colSpan={33} className="text-center text-[11px] py-1 px-3 border border-gray-400 bg-[#1F3864] text-blue-200">
                {formData.companyAddress || ""}
              </td>
            </tr>

            {/* Title strip */}
            <tr>
              <td colSpan={8}  className="text-left text-[11px] font-bold py-1 px-2 border border-gray-400 bg-[#2E75B6] text-white">
                কার্যালয়/বিভাগ : {dept}
              </td>
              <td colSpan={15} className="text-center text-sm font-extrabold py-1 border border-gray-400 bg-[#2E75B6] text-white underline">
                চূড়ান্ত পাওনা বিল — Out Going List
              </td>
              <td colSpan={10} className="text-right text-[11px] font-bold py-1 px-2 border border-gray-400 bg-[#2E75B6] text-white">
                বেতন মাস : {month}
              </td>
            </tr>

            {/* Column group headers */}
            <tr>
              <th colSpan={8}  className="border border-gray-400 bg-[#D9E1F2] text-[10px] font-bold text-center py-1">কর্মীর তথ্য</th>
              <th colSpan={7}  className="border border-gray-400 bg-[#E2EFDA] text-[10px] font-bold text-center py-1">বেতন ও ভাতাদি</th>
              <th colSpan={2}  className="border border-gray-400 bg-[#FFF9C4] text-[10px] font-bold text-center py-1">সর্বশেষ মাসের বেতন</th>
              <th colSpan={8}  className="border border-gray-400 bg-[#DDEBF7] text-[10px] font-bold text-center py-1">চূড়ান্ত পাওনা — প্রাপ্তি</th>
              <th colSpan={4}  className="border border-gray-400 bg-[#FCE4D6] text-[10px] font-bold text-center py-1">কর্তন</th>
              <th colSpan={1}  className="border border-gray-400 bg-[#FFF2CC] text-[10px] font-bold text-center py-1">নিট প্রদেয়</th>
              <th colSpan={2}  className="border border-gray-400 bg-[#D9E1F2] text-[10px] font-bold text-center py-1">অন্যান্য</th>
              <th            className="border border-gray-400 bg-red-100   text-[10px] font-bold text-center py-1">Action</th>
            </tr>

            {/* Column headers */}
            <tr>
              {/* কর্মীর তথ্য (8) */}
              <TH cls="bg-[#D9E1F2] w-7">#</TH>
              <TH cls="bg-[#D9E1F2]">নাম</TH>
              <TH cls="bg-[#D9E1F2]">যোগদান তারিখ</TH>
              <TH cls="bg-[#D9E1F2]">কার্ড নং</TH>
              <TH cls="bg-[#D9E1F2]">পদ</TH>
              <TH cls="bg-[#D9E1F2]">সেকশন</TH>
              <TH cls="bg-[#D9E1F2]">চাকরির মেয়াদকাল ✦</TH>
              <TH cls="bg-[#D9E1F2]">মোট সুবিধাপ্রাপ্ত বছর ✦</TH>
              {/* বেতন ও ভাতাদি (7) */}
              <TH cls="bg-[#E2EFDA]">মোট মাসিক মজুরি</TH>
              <TH cls="bg-[#E2EFDA]">মূল বেতন</TH>
              <TH cls="bg-[#E2EFDA]">বাড়ি ভাড়া</TH>
              <TH cls="bg-[#E2EFDA]">টিফিন ভাতা</TH>
              <TH cls="bg-[#E2EFDA]">যাতায়াত ভাতা</TH>
              <TH cls="bg-[#E2EFDA]">চিকিৎসা ভাতা</TH>
              <TH cls="bg-[#E2EFDA]">মোট বেতন ✦</TH>
              {/* সর্বশেষ মাসের বেতন (2) */}
              <TH cls="bg-[#FFF9C4]">দিন</TH>
              <TH cls="bg-[#FFF9C4]">অতিরিক্ত কর্মঘন্টা</TH>
              {/* চূড়ান্ত পাওনা (8) */}
              <TH cls="bg-[#DDEBF7]">সর্বশেষ মাসের বেতন ✦</TH>
              <TH cls="bg-[#DDEBF7]">ওভারটাইম ✦</TH>
              <TH cls="bg-[#DDEBF7]">অর্জিত ছুটি ✦</TH>
              <TH cls="bg-[#DDEBF7]">সার্ভিস ক্ষতিপূরণ ✦</TH>
              <TH cls="bg-[#DDEBF7]">মৃত্যু ক্ষতিপূরণ ✦</TH>
              <TH cls="bg-[#DDEBF7]">নোটিশ পে ✦</TH>
              <TH cls="bg-[#DDEBF7]">অন্যান্য</TH>
              <TH cls="bg-[#DDEBF7] text-green-800">মোট প্রাপ্তি ✦</TH>
              {/* কর্তন (4) */}
              <TH cls="bg-[#FCE4D6]">নোটিশ কর্তন ✦</TH>
              <TH cls="bg-[#FCE4D6]">অগ্রিম কর্তন</TH>
              <TH cls="bg-[#FCE4D6]">অন্যান্য কর্তন</TH>
              <TH cls="bg-[#FCE4D6] text-red-800">মোট কর্তন ✦</TH>
              {/* নিট (1) */}
              <TH cls="bg-[#FFF2CC] text-yellow-900">নিট প্রদেয় ✦</TH>
              {/* অন্যান্য (2) */}
              <TH cls="bg-[#D9E1F2]">স্বাক্ষর / টিপ</TH>
              <TH cls="bg-[#D9E1F2]">মন্তব্য</TH>
              {/* Action (1) */}
              <TH cls="bg-red-100 text-red-700">মুছুন</TH>
            </tr>
          </thead>

          <tbody>
            {/* ── STORED rows (locked, added via ＋ নতুন কর্মী) ── */}
            {rows.map((row, idx) => {
              const d     = deriveRow(row);
              const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
              const td    = `border border-gray-300 px-0.5 py-0.5 align-middle ${rowBg}`;
              const up    = (key: keyof EmployeeFormData) => (val: string) => updateField(idx, key, val);

              return (
                <tr key={`stored-${idx}`} className="hover:bg-indigo-50/20 transition-colors">
                  <td className={`${td} text-center text-[11px] font-bold text-gray-500`}>{idx + 1}</td>
                  <td className={td}><EditableCell value={row.employeeName} onChange={up("employeeName")} width="110px" /></td>
                  <td className={td}><EditableCell value={row.joiningDate}  onChange={up("joiningDate")}  width="82px"  /></td>
                  <td className={td}><EditableCell value={row.cardNo}       onChange={up("cardNo")}       width="58px" align="center" /></td>
                  <td className={td}><EditableCell value={row.designation}  onChange={up("designation")}  width="75px"  /></td>
                  <td className={td}><EditableCell value={row.section}      onChange={up("section")}      width="72px"  /></td>
                  <td className={`${td} bg-[#EEF2FB]`}><div className="text-[10px] text-center px-1 py-[2px] text-gray-700">{d.serviceDuration}</div></td>
                  <td className={`${td} bg-[#EEF2FB]`}><div className="text-[11px] text-center px-1 py-[2px] text-gray-700">{row.benefitYears ? `${row.benefitYears} বছর` : <span className="text-gray-300">—</span>}</div></td>
                  <td className={td}><EditableCell value={row.totalMonthlyWage}   onChange={up("totalMonthlyWage")}   width="70px" type="number" align="right" /></td>
                  <td className={td}><EditableCell value={row.basicWage}          onChange={up("basicWage")}          width="65px" type="number" align="right" /></td>
                  <td className={td}><EditableCell value={row.houseRent}          onChange={up("houseRent")}          width="62px" type="number" align="right" /></td>
                  <td className={td}><EditableCell value={row.foodAllowance}      onChange={up("foodAllowance")}      width="55px" type="number" align="right" /></td>
                  <td className={td}><EditableCell value={row.transportAllowance} onChange={up("transportAllowance")} width="58px" type="number" align="right" /></td>
                  <td className={td}><EditableCell value={row.medicalAllowance}   onChange={up("medicalAllowance")}   width="55px" type="number" align="right" /></td>
                  <td className={`${td} bg-green-50`}><CalcCell value={d.basicComponents} cls="text-green-800" /></td>
                  <td className={`${td} bg-[#FFFDE7]`}><EditableCell value={row.payableDay}   onChange={up("payableDay")}   width="38px" type="number" align="center" /></td>
                  <td className={`${td} bg-[#FFFDE7]`}><EditableCell value={row.payableHours} onChange={up("payableHours")} width="52px" type="number" align="center" /></td>
                  <td className={`${td} bg-blue-50`}><CalcCell value={d.lastMonthSalary}   cls="text-blue-800" /></td>
                  <td className={`${td} bg-blue-50`}><CalcCell value={d.lastMonthOvertime}  cls="text-blue-800" /></td>
                  <td className={`${td} bg-blue-50`}><CalcCell value={d.earnedLeave}        cls="text-blue-800" /></td>
                  <td className={`${td} bg-blue-50`}><CalcCell value={d.serviceComp}        cls="text-blue-800" /></td>
                  <td className={`${td} bg-blue-50`}><CalcCell value={d.deathComp}          cls="text-blue-800" /></td>
                  <td className={`${td} bg-blue-50`}><CalcCell value={d.noticePay}          cls="text-blue-800" /></td>
                  <td className={td}><EditableCell value={row.others || "0"} onChange={up("others")} width="55px" type="number" align="right" /></td>
                  <td className={`${td} bg-green-100`}><CalcCell value={d.totalReceivable} cls="text-green-900 font-extrabold" /></td>
                  <td className={`${td} bg-orange-50`}><CalcCell value={d.noticeDeduction} cls="text-orange-800" /></td>
                  <td className={td}><EditableCell value={row.advanceDeduction || "0"} onChange={up("advanceDeduction")} width="65px" type="number" align="right" /></td>
                  <td className={td}><EditableCell value={row.otherDeduction   || "0"} onChange={up("otherDeduction")}   width="65px" type="number" align="right" /></td>
                  <td className={`${td} bg-orange-100`}><CalcCell value={d.totalDeductions} cls="text-orange-900 font-extrabold" /></td>
                  <td className={`${td} bg-yellow-100`}><CalcCell value={d.netPayable} cls="text-yellow-900 font-extrabold text-[13px]" /></td>
                  <td className={`${td} min-w-[72px]`} />
                  <td className={td}><EditableCell value="" onChange={() => {}} width="70px" /></td>
                  <td className={`${td} text-center`}>
                    <button onClick={() => deleteRow(idx)}
                      className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded transition-colors">
                      🗑️ মুছুন
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* ── LIVE preview row — always shows current formData, highlighted ── */}
            {(() => {
              const row = formData;
              const d   = deriveRow(row);
              const liveIdx = rows.length; // serial number after stored rows
              const td  = "border border-gray-300 px-0.5 py-0.5 align-middle bg-emerald-50";
              return (
                <tr key="live" className="ring-2 ring-inset ring-emerald-400">
                  <td className={`${td} text-center text-[11px] font-bold text-emerald-600`}>
                    {liveIdx + 1}
                    <div className="text-[9px] text-emerald-500 font-normal leading-tight">চলমান</div>
                  </td>
                  {/* Info — read-only from formData (user edits in the form tabs) */}
                  {[row.employeeName, row.joiningDate, row.cardNo, row.designation, row.section].map((v, i) => (
                    <td key={i} className={td}>
                      <div className="text-[11px] px-1 py-[2px] text-gray-700">{v || <span className="text-gray-300 italic text-[10px]">—</span>}</div>
                    </td>
                  ))}
                  <td className={`${td} bg-emerald-100`}><div className="text-[10px] text-center px-1 py-[2px] text-gray-700">{d.serviceDuration}</div></td>
                  <td className={`${td} bg-emerald-100`}><div className="text-[11px] text-center px-1 py-[2px] text-gray-700">{row.benefitYears ? `${row.benefitYears} বছর` : <span className="text-gray-300">—</span>}</div></td>
                  {/* Wages — read-only */}
                  {[row.totalMonthlyWage, row.basicWage, row.houseRent, row.foodAllowance, row.transportAllowance, row.medicalAllowance].map((v, i) => (
                    <td key={i} className={td}><div className="text-[11px] text-right px-1 py-[2px]">{v || <span className="text-gray-300">—</span>}</div></td>
                  ))}
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-green-100"><CalcCell value={d.basicComponents} cls="text-green-800" /></td>
                  <td className={`${td} bg-yellow-100`}><div className="text-[11px] text-center px-1 py-[2px]">{row.payableDay || <span className="text-gray-300">—</span>}</div></td>
                  <td className={`${td} bg-yellow-100`}><div className="text-[11px] text-center px-1 py-[2px]">{row.payableHours || <span className="text-gray-300">—</span>}</div></td>
                  {/* Calc columns */}
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-blue-100"><CalcCell value={d.lastMonthSalary}   cls="text-blue-800" /></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-blue-100"><CalcCell value={d.lastMonthOvertime}  cls="text-blue-800" /></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-blue-100"><CalcCell value={d.earnedLeave}        cls="text-blue-800" /></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-blue-100"><CalcCell value={d.serviceComp}        cls="text-blue-800" /></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-blue-100"><CalcCell value={d.deathComp}          cls="text-blue-800" /></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-blue-100"><CalcCell value={d.noticePay}          cls="text-blue-800" /></td>
                  <td className={td}><div className="text-[11px] text-right px-1 py-[2px]">{row.others || "0"}</div></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-green-200"><CalcCell value={d.totalReceivable} cls="text-green-900 font-extrabold" /></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-orange-100"><CalcCell value={d.noticeDeduction} cls="text-orange-800" /></td>
                  <td className={td}><div className="text-[11px] text-right px-1 py-[2px]">{row.advanceDeduction || "0"}</div></td>
                  <td className={td}><div className="text-[11px] text-right px-1 py-[2px]">{row.otherDeduction || "0"}</div></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-orange-200"><CalcCell value={d.totalDeductions} cls="text-orange-900 font-extrabold" /></td>
                  <td className="border border-gray-300 px-0.5 py-0.5 align-middle bg-yellow-200"><CalcCell value={d.netPayable} cls="text-yellow-900 font-extrabold text-[13px]" /></td>
                  <td className={`${td} min-w-[72px]`} />
                  <td className={td} />
                  {/* No delete for live row */}
                  <td className={`${td} text-center`}>
                    <span className="text-[9px] text-emerald-600 font-semibold px-1">চলমান</span>
                  </td>
                </tr>
              );
            })()}
          </tbody>

          {/* ── Grand Totals ── */}
          <tfoot>
            <tr className="bg-[#F4B942] font-bold text-xs">
              <td colSpan={8} className="border border-gray-400 text-right pr-3 py-1.5">সর্বমোট</td>

              {/* Wage totals */}
              {(["totalMonthlyWage","basicWage","houseRent","foodAllowance","transportAllowance","medicalAllowance"] as (keyof EmployeeFormData)[]).map((k) => (
                <td key={k} className="border border-gray-400 text-right px-1 py-1">
                  {sumAll((r) => parseFloat(r[k] as string) || 0)}
                </td>
              ))}
              {/* মোট বেতন */}
              <td className="border border-gray-400 text-right px-1 py-1 bg-green-200">
                {sumAll((r) => deriveRow(r).basicComponents)}
              </td>
              {/* দিন + কর্মঘন্টা */}
              <td className="border border-gray-400 text-right px-1 py-1 bg-yellow-200">
                {sumAll((r) => parseFloat(r.payableDay) || 0)}
              </td>
              <td className="border border-gray-400 text-right px-1 py-1 bg-yellow-200">
                {sumAll((r) => parseFloat(r.payableHours) || 0)}
              </td>

              {/* চূড়ান্ত পাওনা totals */}
              {[
                (r: EmployeeFormData) => deriveRow(r).lastMonthSalary,
                (r: EmployeeFormData) => deriveRow(r).lastMonthOvertime,
                (r: EmployeeFormData) => deriveRow(r).earnedLeave,
                (r: EmployeeFormData) => deriveRow(r).serviceComp,
                (r: EmployeeFormData) => deriveRow(r).deathComp,
                (r: EmployeeFormData) => deriveRow(r).noticePay,
              ].map((fn, i) => (
                <td key={i} className="border border-gray-400 text-right px-1 py-1 bg-blue-200">
                  {sumAll(fn)}
                </td>
              ))}
              {/* others */}
              <td className="border border-gray-400 text-right px-1 py-1">
                {sumAll((r) => parseFloat(r.others || "0") || 0)}
              </td>
              {/* মোট প্রাপ্তি */}
              <td className="border border-gray-400 text-right px-1 py-1 bg-green-300 font-extrabold text-sm">
                {sumAll((r) => deriveRow(r).totalReceivable)}
              </td>
              {/* কর্তন totals */}
              <td className="border border-gray-400 text-right px-1 py-1 bg-orange-200">
                {sumAll((r) => deriveRow(r).noticeDeduction)}
              </td>
              <td className="border border-gray-400 text-right px-1 py-1">
                {sumAll((r) => parseFloat(r.advanceDeduction || "0") || 0)}
              </td>
              <td className="border border-gray-400 text-right px-1 py-1">
                {sumAll((r) => parseFloat(r.otherDeduction || "0") || 0)}
              </td>
              <td className="border border-gray-400 text-right px-1 py-1 bg-orange-300 font-extrabold text-sm">
                {sumAll((r) => deriveRow(r).totalDeductions)}
              </td>
              {/* নিট */}
              <td className="border border-gray-400 text-right px-1 py-1 bg-yellow-400 font-extrabold text-base">
                {sumAll((r) => deriveRow(r).netPayable)}
              </td>
              {/* blanks: স্বাক্ষর, মন্তব্য, action */}
              <td className="border border-gray-400" colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-gray-400 italic pt-1">
        ✦ চিহ্নিত কলামগুলো PaymentBill-এর একই ফর্মুলায় স্বয়ংক্রিয়ভাবে হিসাব হয়। বাকি কলামে ক্লিক করে সম্পাদনা করুন।
        নতুন কর্মী যোগ করতে মূল ফর্মে "＋ নতুন কর্মী" বাটন ব্যবহার করুন।
      </p>
    </div>
  );
});

ExcelView.displayName = "ExcelView";
export default ExcelView;