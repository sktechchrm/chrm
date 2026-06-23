import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { EmployeeFormData } from "./FinalSettlementDataTypes";
import { calculateLastMonthSalary,SALARY_MONTHLY_DAYS, } from "./FinalSettlementFormula";
import { toBanglaNumber, formatDate, numberToWordsBN, numberToWordsEN, } from "../../utils/bnEnDate";
import { translations } from "../../context/LanguageContext";
import { exportToPDF } from "../../utils/pdfExport";
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';
import { PrintSignatureRow } from '../common/AuthorizationBlock';
import type { AuthorizationState } from '../common/AuthorizationBlock';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface PaymentBillProps {
  formData: EmployeeFormData;
  totalReceivable: string;
  totalDeductions: string;
  netPayable: string;
  lang?: Language;
  authorization?: AuthorizationState;
}
type Language = "bn" | "en";

export interface PaymentBillHandle {
  print:     () => void;
  exportPDF: () => Promise<void>;
}

// Font family name used in CSS
const FONT_FAMILY = "NotoSansBengaliEmbed";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const PaymentBill = forwardRef<PaymentBillHandle, PaymentBillProps>(function PaymentBill({
  formData, totalReceivable, totalDeductions, netPayable, lang: initialLang, authorization,
}, ref) {
  const [lang, setLang] = useState<Language>(initialLang ?? "bn");

  useEffect(() => {
    if (initialLang) setLang(initialLang);
  }, [initialLang]);

  const billRef = useRef<HTMLDivElement>(null);

  // ── Expose imperative handle ───────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    print:     () => handlePrint(),
    exportPDF: () => handleExportPDF(),
  }));

  // ── PRINT — iframe approach ────────────────────────────────────────────────
  const handlePrint = () => {
    const el = billRef.current;
    if (!el) return;

    const styleLinks  = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(l => l.outerHTML).join("\n");
    const styleBlocks = Array.from(document.querySelectorAll("style"))
      .map(s => `<style>${s.textContent}</style>`).join("\n");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  ${styleLinks}
  ${styleBlocks}
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    *, *::before, *::after {
      font-family: '${FONT_FAMILY}', 'Noto Sans Bengali', sans-serif !important;
      -webkit-font-smoothing: antialiased;
    }
    html, body { margin: 0; padding: 0; background: white;
      print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    body { font-size: 8.5pt; line-height: 1.3; }
    .no-print { display: none !important; }
    #payment-bill-container {
      box-shadow: none !important; padding: 0 !important;
      margin: 0 !important; max-width: 100% !important;
    }
    .bill-header h1 { font-size: 10.5pt !important; margin-bottom: 0.5mm; }
    .bill-header p  { font-size: 8pt !important; margin: 0; }
    .bill-title-box { margin: 1.5mm auto !important; }
    .title-text     { font-size: 9.5pt !important; }
    .title-date     { font-size: 8.5pt !important; }
    .term-bar       { padding: 0.8mm 2mm !important; font-size: 9pt !important; }
    .emp-header-bar { padding: 0.8mm 2mm !important; font-size: 9.5pt !important; }
    .grid-cols-3 > div { padding: 1mm 2mm !important; }
    .grid-cols-3 > div > div { font-size: 10pt !important; margin-bottom: 0.8mm !important; line-height: 1.35 !important; }
    table th, table td { padding: 0.8mm 2mm !important; font-size: 9.5pt !important; line-height: 1.2 !important; }
    .sub-label  { font-size: 9pt !important; line-height: 1.15 !important; }
    .net-amount { font-size: 10pt !important; }
    .sig-grid   { margin-top: 10mm !important; font-size: 9.5pt !important; gap: 4mm !important; }
    .rcv-footer { margin-top: 3mm !important; font-size: 9.5pt !important; }
    table, th, td {
      border-color: #000 !important;
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }
  </style>
</head>
<body>${el.outerHTML}</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:0;";
    document.body.appendChild(iframe);

    const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iDoc) { document.body.removeChild(iframe); return; }

    iDoc.open(); iDoc.write(html); iDoc.close();

    iframe.contentWindow?.addEventListener("load", () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 600);
    });
  };

  // ── PDF export — delegates to central exportToPDF ─────────────────────────
  // exportToPDF forces the element to A4 width (794px) before capture so the
  // PDF always fills the full page — identical to the print preview.
  const handleExportPDF = async () => {
    const el = billRef.current;
    if (!el) return;
    await exportToPDF({
      element:  el,
      filename: `PaymentBill_${formData.employeeName || 'employee'}`,
      scale:    3,
    });
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toDisplay = (val: string | number | undefined): string | number =>
    lang === "bn" ? toBanglaNumber(val ?? 0) : (val ?? 0);
  const displayDate = (d: string) =>
    lang === "bn" ? toBanglaNumber(formatDate(d)) : formatDate(d);
  const t = (key: keyof typeof translations.bn) => translations[lang][key];
  const n = (val: string | number | undefined) => Number(val) || 0;

  // ── Wage calculations ──────────────────────────────────────────────────────
  const totalMonthlyWageNum = n(formData.totalMonthlyWage);
  const yearNum    = parseInt(formData.lastMonthYear || "") || new Date().getFullYear();
  const month      = formData.lastMonthName || "";
  const calDays    = SALARY_MONTHLY_DAYS(month, yearNum) || 30;
  const perDayRate = totalMonthlyWageNum / calDays;
  const lastMonthSalary = calculateLastMonthSalary(
    formData.totalMonthlyWage, formData.payableDay, month, formData.lastMonthYear
  );

  // ── Earnings rows ──────────────────────────────────────────────────────────
  const earningsRows: { label: React.ReactNode; value: number }[] = [
    { label: (<>{t("lastMonthSalary")}<br/><span className="sub-label">({formData.lastMonthName} - {toDisplay(formData.lastMonthYear)}, {toDisplay(formData.payableDay||0)} {t("days")} × {toDisplay(perDayRate.toFixed(2))} {t("amount")})</span></>), value: lastMonthSalary },
    { label: (<>{t("lastMonthOvertime")}<br/><span className="sub-label">({toDisplay(formData.payableHours||0)} {t("hours")} × {toDisplay(formData.hourlyOvertimeRate||0)} {t("amount")})</span></>), value: n(formData.lastMonthOvertime) },
    { label: (<>{t("earnedLeave")}<br/><span className="sub-label">({toDisplay(formData.elQty||0)} {t("days")} × {toDisplay(formData.dailyGross||0)} {t("amount")})</span></>), value: n(formData.earnedLeave) },
    { label: (<>{t("serviceCompensation")}<br/><span className="sub-label">({toDisplay(formData.benefitYears||0)} {t("years")} × {toDisplay(formData.serviceCompDaysPerYear||0)} {t("days")} × {toDisplay(formData.dailyBasic||0)} {t("amount")})</span></>), value: n(formData.serviceCompensation) },
    { label: (<>{t("deathCompensation")}<br/><span className="sub-label">({toDisplay(formData.benefitYears||0)} {t("years")} × {toDisplay(formData.DeathCompensationDaysPerYear||0)} {t("days")} × {toDisplay(formData.dailyBasic||0)} {t("amount")})</span></>), value: n(formData.deathCompensation) },
    { label: (<>{t("layOffCompensation")}<br/><span className="sub-label">({toDisplay(formData.layOffDays||0)} {t("days")} × {t("amount")})</span></>), value: n(formData.layOffCompensation) },
    { label: (<>{t("gratuityCompensation")}<br/><span className="sub-label">({toDisplay(formData.benefitYears||0)} {t("years")} × {toDisplay(formData.gratuityDaysPerYear||0)} {t("days")} × {toDisplay(formData.dailyBasic||0)} {t("amount")})</span></>), value: formData.paymentMethod === "gratuity" ? n(formData.gratuityAmount) : 0 },
    { label: (<>{t("noticePay")}<br/><span className="sub-label">({toDisplay(formData.noticePayDay||0)} {t("days")} × {toDisplay(formData.dailyBasic||0)} {t("amount")})</span></>), value: n(formData.noticePay) },
    { label: (<>{t("others")}<br/><span className="sub-label">({formData.otherBenefits||"---"})</span></>), value: n(formData.others) },
  ];

  // ── Deduction rows ─────────────────────────────────────────────────────────
  const deductionRows: { label: React.ReactNode; value: number }[] = [
    { label: (<>{t("noticeDeduction")}<br/><span className="sub-label">({toDisplay(formData.noticeDeductionDay||0)} {t("days")} × {toDisplay(formData.dailyBasic||0)} {t("amount")})</span></>), value: n(formData.noticeDeduction) },
    { label: (<>{t("advanceDeduction")}<br/><span className="sub-label">({toDisplay(formData.deductionForAdvance||"---")})</span></>), value: n(formData.advanceDeduction) },
    { label: (<>{t("otherDeduction")}<br/><span className="sub-label">({formData.deductionParticularsB||"---"})</span></>), value: n(formData.otherDeduction) },
  ];

  const netPayableInt      = Math.round(n(netPayable));
  const netPayableInWords  = lang === "bn"
    ? `${numberToWordsBN(netPayableInt)} টাকা মাত্র`
    : `${numberToWordsEN(netPayableInt)} taka only`;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap');

        #payment-bill-container,
        #payment-bill-container * {
          font-family: '${FONT_FAMILY}', 'Noto Sans Bengali', sans-serif !important;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        #payment-bill-container .sub-label {
          font-size: 0.78rem; font-style: italic;
          color: #555; line-height: 1.2; display: block;
        }

        /* Screen only — maxWidth + shadow. pdfExport overrides during capture. */
        @media screen {
          #payment-bill-container {
            max-width: 210mm;
            margin: 0 auto;
            box-shadow: 0 2px 20px rgba(0,0,0,0.13);
          }
        }

        ${BASE_PRINT_CSS}
        ${PAGE_A4_PORTRAIT}
        @media print {
          .bill-controls { display: none !important; }
          #payment-bill-container {
            max-width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* ── Payment Bill ──────────────────────────────────────────────────── */}
      <div ref={billRef} id="payment-bill-container" className="bg-white p-4 md:p-5 text-sm">

        {/* Header */}
        <header className="bill-header text-center border-b-2 border-black pb-2 mb-2">
          <h1 className="text-lg font-bold uppercase mb-0.5">
            {(lang === "en" ? formData.companyNameEn : formData.companyName) || t("companyName")}
          </h1>
          <p className="text-sm">{(lang === "en" ? formData.companyAddressEn : formData.companyAddress) || t("address")}</p>
        </header>

        {/* Bill title */}
        <div className="flex justify-center my-2 bill-title-box">
          <div className="border-2 border-slate-900 px-5 py-1.5 text-center">
            <p className="title-text font-black border-b border-slate-900 pb-1 mb-1 text-sm">
              {t("paymentBill")}
            </p>
            <time className="title-date block text-sm font-semibold tracking-wide text-slate-700">
              {t("date")}: {displayDate(formData.settlementDate)} {t("dateEndSign")}
            </time>
          </div>
        </div>

        {/* Termination */}
        <section className="border border-black rounded mb-2">
          <div className="term-bar bg-gray-200 px-3 py-1 font-bold text-sm flex items-center">
            <strong>{t("terminationType")}:&nbsp;</strong>
            <span>{formData.terminationType}</span>
          </div>
        </section>

        {/* Employee info */}
        <section className="border border-black rounded mb-2">
          <div className="emp-header-bar bg-gray-200 px-2 py-1 border-b border-black font-bold text-sm">
            {t("empDetails")}
          </div>
          <div className="grid grid-cols-3 divide-x divide-black">

            {/* Col 1 */}
            <div className="p-2 flex flex-col justify-center gap-y-1">
              {([
                [t("employeeName"), formData.employeeName],
                ["ID/Card No",     String(toDisplay(formData.cardNo))],
                [t("designation"), formData.designation],
                [t("section"),     formData.section],
              ] as [string, string][]).map(([lbl, val], i) => (
                <div key={i} className="flex items-start" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                  <span style={{ minWidth: "90px", fontWeight: 600, flexShrink: 0 }}>{lbl}:</span>
                  <span style={{ flex: 1, wordBreak: "break-word" }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Col 2 */}
            <div className="p-2 flex flex-col justify-center gap-y-1">
              {([
                [t("serviceDuration"), `${toDisplay(formData.serviceYears||0)} ${t("years")} ${toDisplay(formData.serviceMonths||0)} ${t("months")} ${toDisplay(formData.serviceDays||0)} ${t("days")}`],
                [t("benefitYears"),    `${toDisplay(formData.benefitYears||0)} ${t("years")}`],
                [t("joiningDate"),     `${displayDate(formData.joiningDate)} ${t("dateEndSign")}`],
                [t("lastAttendance"),  `${displayDate(formData.lastAttendance)} ${t("dateEndSign")}`],
              ] as [string, string][]).map(([lbl, val], i) => (
                <div key={i} className="flex items-start" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                  <span style={{ minWidth: "104px", fontWeight: 600, flexShrink: 0 }}>{lbl}:</span>
                  <span style={{ flex: 1, wordBreak: "break-word" }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Col 3 */}
            <div className="p-2 flex flex-col justify-center gap-y-1">
              {([
                [t("totalMonthlyWage"), toDisplay(formData.totalMonthlyWage||0)],
                [t("basicWage"),        toDisplay(formData.basicWage||0)],
                [t("dailyGross"),       toDisplay(formData.dailyGross||0)],
                [t("dailyBasic"),       toDisplay(formData.dailyBasic||0)],
              ] as [string, string|number][]).map(([lbl, val], i) => (
                <div key={i} className="flex items-start" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                  <span style={{ minWidth: "100px", fontWeight: 600, flexShrink: 0 }}>{lbl}:</span>
                  <span style={{ flex: 1, wordBreak: "break-word" }}>{val} {t("amount")}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Payment table */}
        <section className="border border-black rounded overflow-hidden mb-3">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-black px-2 py-1 text-left">{t("description")}</th>
                <th className="border border-black px-2 py-1 text-right w-28">{t("amount")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-50 font-bold">
                <td colSpan={2} className="border border-black px-2 py-1">{t("earnings")}</td>
              </tr>
              {earningsRows.map((row, i) => row.value > 0 ? (
                <tr key={i}>
                  <td className="border border-black px-2 py-1 leading-snug">{row.label}</td>
                  <td className="border border-black px-2 py-1 text-right align-middle whitespace-nowrap">{toDisplay(row.value)}</td>
                </tr>
              ) : null)}
              <tr className="font-bold bg-green-100">
                <td className="border border-black px-2 py-1 text-right">{t("totalEarnings")}</td>
                <td className="border border-black px-2 py-1 text-right">{toDisplay(totalReceivable)}</td>
              </tr>

              <tr className="bg-red-50 font-bold">
                <td colSpan={2} className="border border-black px-2 py-1">{t("deductions")}</td>
              </tr>
              {deductionRows.map((row, i) => row.value > 0 ? (
                <tr key={i}>
                  <td className="border border-black px-2 py-1 leading-snug">{row.label}</td>
                  <td className="border border-black px-2 py-1 text-right align-middle whitespace-nowrap">{toDisplay(row.value)}</td>
                </tr>
              ) : null)}
              <tr className="font-bold bg-yellow-100">
                <td className="border border-black px-2 py-1 text-right">{t("totalDeductions")}</td>
                <td className="border border-black px-2 py-1 text-right">{toDisplay(totalDeductions)}</td>
              </tr>

              <tr className="bg-green-200 font-extrabold">
                <td className="border border-black px-2 py-2 text-right uppercase">{t("netPayable")}</td>
                <td className="net-amount border border-black px-2 py-2 text-right text-base">{toDisplay(netPayable)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-black px-2 py-1 italic font-semibold">
                  {lang==="bn" ? `কথায়: ${netPayableInWords}` : `In words: ${netPayableInWords}`}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Signatures */}
        {authorization
          ? <PrintSignatureRow value={authorization} lang={lang} />
          : (
            <section className="sig-grid grid grid-cols-3 gap-6 mt-8 text-center text-sm font-bold">
              {[t("preparedBy"), t("checkedBy"), t("approvedBy")].map((title, i) => (
                <div key={i} className="border-t border-black pt-1">{title}</div>
              ))}
            </section>
          )
        }

        {/* Receiver */}
        <footer className="rcv-footer mt-5 text-sm">
          <p className="mb-5 italic">{t("receivedAmount")}</p>
          <div className="w-56 ml-auto text-center">
            <div className="border-t border-black pt-1 font-bold">({formData.employeeName})</div>
            <p className="font-bold mt-1">{t("receiverSignature")}</p>
            <p className="font-bold">{t("rcvdate")}</p>
          </div>
        </footer>
      </div>
    </>
  );
});

export default PaymentBill;