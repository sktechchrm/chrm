// ─────────────────────────────────────────────────────────────────────────────
// maternityBill.tsx
// Path: src/components/maternityBenefit/maternityBill.tsx
//
// Changes from original:
//  - Internal language useState + dropdown REMOVED
//    → lang: 'bn' | 'en' accepted as prop from parent (same as PaymentBill)
//    → billItems side-nav ("বাংলা বিল" / "English Bill") controls language
//  - ExportToolbar + language button div REMOVED from bill body
//    → print/PDF triggered imperatively via billRef from parent
//  - Duplicate calculateEarnedWage / calculateOtherBenefits REMOVED
//    → imported from MaternityFormula (single source of truth)
//  - maternityLeavenoticedDate added to bill employee info section
//  - Imports from global types file (../../types/MaternityBenefitTypes)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { MaternityFormData, MATERNITY_CONSTANTS } from './MaternityBenefitTypes';
import { MaternityFormula }                       from './MaternityFormula';
import { toBanglaNumber, formatDate, numberToWordsBN, numberToWordsEN } from '../../utils/bnEnDate';
import { exportToPDF }                             from '../../utils/pdfExport';
import { translations }                            from '../../context/LanguageContext';
import { GlobalPrintStyle, PAGE_A4_PORTRAIT }                  from '../../utils/printCSS';
import { PrintSignatureRow }                       from '../common/AuthorizationBlock';
import type { AuthorizationState }                 from '../common/AuthorizationBlock';

export interface MaternityBillHandle {
  print:     () => void;
  exportPDF: () => Promise<void>;
}

interface MaternityBillProps {
  formData:       MaternityFormData;
  totalPayable:   string;
  lang:           'bn' | 'en';
  authorization?: AuthorizationState;
}


const MaternityBenefitBill = forwardRef<MaternityBillHandle, MaternityBillProps>(
  function MaternityBenefitBill({ formData, totalPayable, lang, authorization }, ref) {
    const billRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
      const el = billRef.current;
      if (!el) { window.print(); return; }
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument!;
      const styles = Array.from(document.styleSheets)
        .map(ss => { try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; } })
        .join('\n');
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>@page{size:A4 portrait;margin:10mm 12mm;}body{margin:0;font-family:'Noto Sans Bengali',Arial,sans-serif;}${styles}</style>
        </head><body>${el.outerHTML}</body></html>`);
      doc.close();
      iframe.onload = () => {
        iframe.contentWindow!.focus();
        iframe.contentWindow!.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      };
    };

    const handleExportPDF = async () => {
      const el = billRef.current;
      if (!el) return;
      await exportToPDF({ element: el, filename: formData.employeeName || 'maternity_bill', scale: 2 });
    };

    useImperativeHandle(ref, () => ({ print: handlePrint, exportPDF: handleExportPDF }));

    const t         = translations[lang];
    const disp      = (val: string | number) => lang === 'bn' ? toBanglaNumber(val) : String(val);
    const dispDate  = (d: string)            => lang === 'bn' ? toBanglaNumber(formatDate(d)) : formatDate(d);
    const font      = "'Noto Sans Bengali', Arial, sans-serif";

    const isEligible        = formData.eligibilityStatus === 'অধিকারী';
    const isSecondInst      = formData.activeInstallment === 'দ্বিতীয় কিস্তি';
    // When ineligible: preDeliveryAmount = 0 — no benefit row shown
    const preDeliveryAmount = isEligible ? parseFloat(formData.benefitAmount || '0') : 0;
    const earnedAmount      = MaternityFormula.calculateEarnedWage(formData.earnedLeaveDays, formData.dailyGross, formData.currentMonth, formData.currentYear);
    const otherAmount       = MaternityFormula.calculateOtherBenefits(formData.otherBenefitsValue, formData.otherBenefitsType, formData.totalMonthlyWage);
    // billTotal per installment:
    //   2nd:       benefit only (earned+others already paid in 1st)
    //   1st+eligible: benefit + earned + others
    //   ineligible:   earned + others only
    const billTotal = isSecondInst
      ? preDeliveryAmount.toFixed(2)
      : (preDeliveryAmount + earnedAmount + otherAmount).toFixed(0);
    const netWords          = lang === 'bn'
      ? `${numberToWordsBN(Math.floor(parseFloat(billTotal)))} ${t.takaOnly}`
      : `${numberToWordsEN(Math.floor(parseFloat(billTotal)))} ${t.takaOnly}`;

    return (
      <>
      {/* Shared base print rules + A4 portrait page size */}
      <GlobalPrintStyle pageCSS={PAGE_A4_PORTRAIT} />

      {/* Bill-scoped overrides */}
      <style>{`
        #maternity-bill-container {
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
        }
        @media screen {
          #maternity-bill-container {
            max-width: 210mm;
            margin: 0 auto;
            box-shadow: 0 2px 20px rgba(0,0,0,0.12);
          }
        }
        @media print {
          #maternity-bill-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          #maternity-bill-container table,
          #maternity-bill-container th,
          #maternity-bill-container td {
            border-color: #000 !important;
          }
        }
      `}</style>

        <div id="maternity-bill-container" ref={billRef} style={{ background: '#fff', padding: '24px 32px', fontSize: 13, fontFamily: font }}>

          {/* Header */}
          <header style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 12, marginBottom: 12 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', fontFamily: font }}>
              {(lang === 'en' ? formData.companyNameEn : formData.companyName) || formData.companyName}
            </h1>
            <p style={{ fontSize: 12, margin: 0, color: '#374151' }}>
              {(lang === 'en' ? formData.companyAddressEn : formData.companyAddress) || formData.companyAddress}
            </p>
          </header>

          {/* Title & date */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
            <div style={{ border: '2px solid #0f2442', padding: '8px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px', borderBottom: '1px solid #0f2442', paddingBottom: 4, fontFamily: font }}>{t.maternityBill}</p>
              <time style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: font }}>{t.date}: {dispDate(formData.formDate)}</time>
            </div>
          </div>

          {/* Employee info */}
          <section style={{ border: '1px solid #000', borderRadius: 6, marginBottom: 10, fontSize: 12 }}>
            <div style={{ background: '#e5e7eb', padding: '6px 12px', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #000', fontFamily: font }}>{t.empDetails}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: 12, borderRight: '1px solid #000', lineHeight: 1.9 }}>
                <p><strong>{t.employeeName}:</strong> {formData.employeeName}</p>
                <p><strong>{t.idCard}:</strong> {disp(formData.cardNo)}</p>
                <p><strong>{t.designation}:</strong> {formData.designation}</p>
                <p><strong>{t.section}:</strong> {formData.section}</p>
                <p><strong>{t.serviceDuration}:</strong> {disp(formData.serviceYears || 0)} {t.years} {disp(formData.serviceMonths || 0)} {t.months} {disp(formData.serviceDays || 0)} {t.days}</p>
                <p><strong>{t.aliveChildren}:</strong> {disp(formData.aliveChildren || 0)}</p>
              </div>
              <div style={{ padding: 12, lineHeight: 1.9 }}>
                <p><strong>{t.joiningDate}:</strong>  {dispDate(formData.joiningDate)}</p>
                <p><strong>{t.noticedDate}:</strong>  {dispDate(formData.maternityLeavenoticedDate)}</p>
                <p><strong>{t.deliveryDate}:</strong> {dispDate(formData.possibleDeliveryDate)}</p>
                <p><strong>{t.leaveStart}:</strong>   {dispDate(formData.maternityLeaveStartDate)}</p>
                <p><strong>{t.leaveEnd}:</strong>     {dispDate(formData.maternityLeaveEndDate)}</p>
                <p><strong>{t.totalMonthlyWage}:</strong>  {disp(formData.totalMonthlyWage || 0)} {t.amount}</p>
                <p><strong>{t.dailyGross}:</strong>    {disp(formData.dailyGross || 0)} {t.amount}</p>
              </div>
            </div>
          </section>

          {/* Eligibility */}
          {formData.eligibilityStatus && (
            <section style={{ marginBottom: 10, padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, textAlign: 'center', fontSize: 12 }}>
              <strong>{t.eligibility}:</strong>{' '}
              <span style={{ fontWeight: 700, color: isEligible ? '#15803d' : '#b91c1c' }}>
                {lang === 'en'
                  ? (isEligible ? 'Eligible' : 'Not Eligible')
                  : formData.eligibilityStatus}
              </span>
            </section>
          )}

          {/* Benefits table */}
          <section style={{ border: '1px solid #000', borderRadius: 6, overflow: 'hidden', marginBottom: 14, fontSize: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
              <thead style={{ background: '#e5e7eb' }}>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'left', width: '75%' }}>{t.description}</th>
                  <th style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'right' }}>{t.amount}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#eff6ff' }}>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 700 }}>{t.benefits}</td>
                </tr>

                {isEligible && preDeliveryAmount > 0 && (
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      {t.maternityBenefit} ({formData.benefitInstallment})<br />
                      <span style={{ fontSize: 11, color: '#6b7280' }}>({disp(formData.benifitDays || 60)} {t.days} × {disp(formData.dailyGross || 0)} {t.amount})</span>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}>{disp(preDeliveryAmount.toFixed(2))}</td>
                  </tr>
                )}

                {!isSecondInst && earnedAmount > 0 && (
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      {t.earnedWage}<br />
                      <span style={{ fontSize: 11, color: '#6b7280' }}>
                        ({formData.currentMonth}-{disp(formData.currentYear)} = {disp(Number(formData.earnedLeaveDays) || 0)} {t.days} × {disp((Number(formData.totalMonthlyWage || 0) / MATERNITY_CONSTANTS.TOTAL_MONTHLY_DAYS).toFixed(2))} {t.amount})
                      </span>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}>{disp(earnedAmount.toFixed(2))}</td>
                  </tr>
                )}

                {!isSecondInst && otherAmount > 0 && (
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      {t.others}: {formData.otherBenefits}<br />
                      <span style={{ fontSize: 11, color: '#6b7280' }}>({disp(formData.otherBenefitsValue || 0)} {formData.otherBenefitsType})</span>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}>{disp(otherAmount.toFixed(2))}</td>
                  </tr>
                )}

                <tr style={{ background: '#bbf7d0' }}>
                  <td style={{ border: '1px solid #000', padding: '8px 10px', textAlign: 'right', fontWeight: 800, fontSize: 13, textTransform: 'uppercase' }}>{t.totalPayable}</td>
                  <td style={{ border: '1px solid #000', padding: '8px 10px', textAlign: 'right', fontWeight: 800, fontSize: 16 }}>{disp(billTotal)}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 10px', fontStyle: 'italic', fontWeight: 600 }}>{t.inWords}: {netWords}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Signatures */}
          {authorization
            ? <PrintSignatureRow value={authorization} lang={lang} />
            : (
              <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 60, textAlign: 'center', fontSize: 12, fontWeight: 700, fontFamily: font }}>
                {[t.preparedBy, t.checkedBy, t.approvedBy].map((title, i) => (
                  <div key={i} style={{ borderTop: '1px solid #000', paddingTop: 6 }}>{title}</div>
                ))}
              </section>
            )
          }

          {/* Receiver */}
          <footer style={{ marginTop: 32, fontSize: 12, fontFamily: font }}>
            <p style={{ marginBottom: 24, fontStyle: 'italic', color: '#374151' }}>{t.receivedAmount}</p>
            <div style={{ width: 220, marginLeft: 'auto', textAlign: 'center', paddingTop: 16 }}>
              <div style={{ borderTop: '1px solid #000', paddingTop: 6, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>({formData.employeeName || '_______________'})</div>
              <p style={{ fontWeight: 700, marginTop: 12 }}>{t.receiverSignature}</p>
              <p style={{ fontWeight: 700, marginTop: 6 }}>{t.date}: _______________</p>
            </div>
          </footer>
        </div>
      </>
    );
  }
);

export default MaternityBenefitBill;