// ─────────────────────────────────────────────────────────────────────────────
// RequisitionView.tsx
// Path: src/components/requisition/RequisitionView.tsx
//
// Preview/print bill — matches the two requisition types from RequisitionForm:
//
//  Type A — Qty mode  : Sl No | Particulars | Quantity | Unit Price (৳) | Remarks
//  Type B — Taka mode : Sl No | Particulars/Purpose | Amount (৳) | Payment To | Remarks
//
// Both types end with a Total row, then the signature block.
//
// Multi-page handling (A4 portrait, native browser pagination):
//  - <thead> repeats on every printed page (display: table-header-group)
//  - each <tr> avoids splitting mid-row (break-inside: avoid)
//  - total row + signature block stay together at the end (break-inside: avoid)
// ─────────────────────────────────────────────────────────────────────────────

import { RequisitionViewProps, calculateRequisitionTotal } from "./types";
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';
import { PrintSignatureRow } from '../common/AuthorizationBlock';
import type { AuthorizationState } from '../common/AuthorizationBlock';

export default function RequisitionViewComponent({ requisition, authorization }: RequisitionViewProps & { authorization: AuthorizationState }) {

  // Format date to DD-MMM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format taka amounts with commas
  const formatTaka = (value: number) => {
    if (isNaN(value)) return "0.00";
    return value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isTaka = requisition.quantityType === 'taka';
  const total  = calculateRequisitionTotal(requisition);

  return (
    <div className="bg-white max-w-7xl mx-auto" id="printable-area">
      <div className="print-content p-12 print:p-0">

        {/* ==================== HEADER SECTION ==================== */}
        <header className="print-header">
          {/* Company Header */}
          <div className="text-center pb-4 border-b-2 border-black company-header">
            <h1 className="text-2xl font-bold text-black mb-1 uppercase tracking-wide company-name">
              {requisition.factoryName || 'FACTORY NAME'}
            </h1>
            <p className="text-xs text-black company-address">
              {requisition.factoryAddress || 'Factory Address'}
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center mt-4 mb-4">
            <h2 className="text-lg font-bold underline decoration-2 underline-offset-2">
              Official Requisition
            </h2>
            <p className="text-xs text-gray-600 mt-1 req-type-label">
              {isTaka ? 'Direct Money / Fee Requisition' : 'Item / Material Requisition'}
            </p>
          </div>

          {/* Subject and Date Row */}
          <div className="flex justify-between items-start text-sm border-gray-300 pb-3">
            <div className="flex-1">
              <p>
                <span className="font-bold">Sub: Requisition for</span> {requisition.subject || '_______________'}
              </p>
            </div>
            <div className="text-right ml-8 min-w-[150px]">
              <p>
                <span className="font-bold">Date:</span> {formatDate(requisition.date)}
              </p>
            </div>
          </div>
        </header>

        {/* ==================== BODY SECTION (Items Table) ==================== */}
        <main className="print-body mt-6">
          <table className="w-full border-collapse border-2 border-black req-items-table">
            <thead>
              {!isTaka ? (
                <tr className="bg-gray-50 print:bg-white">
                  <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm w-16">Sl No</th>
                  <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm">Particulars</th>
                  <th className="border-2 border-black px-3 py-2 text-center font-bold text-sm w-28">Quantity</th>
                  <th className="border-2 border-black px-3 py-2 text-right font-bold text-sm w-32">Unit Price (৳)</th>
                  <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm w-48">Remarks</th>
                </tr>
              ) : (
                <tr className="bg-gray-50 print:bg-white">
                  <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm w-16">Sl No</th>
                  <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm">Particulars / Purpose</th>
                  <th className="border-2 border-black px-3 py-2 text-right font-bold text-sm w-32">Amount (৳)</th>
                  <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm w-44">Payment To</th>
                  <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm w-48">Remarks</th>
                </tr>
              )}
            </thead>
            <tbody>
              {requisition.items && requisition.items.length > 0 ? (
                requisition.items.map((item, index) => {
                  if (!isTaka) {
                    const qtyNum  = parseFloat(item.quantity);
                    const unitNum = parseFloat(item.unitPrice);
                    const lineTotal = (!isNaN(qtyNum) && !isNaN(unitNum)) ? qtyNum * unitNum : null;
                    return (
                      <tr key={index} className="req-item-row">
                        <td className="border-2 border-black px-3 py-2 text-center font-semibold text-sm align-top">
                          {item.slNo}
                        </td>
                        <td className="border-2 border-black px-3 py-2 text-sm align-top">
                          <p className="whitespace-pre-wrap leading-relaxed">{item.particulars}</p>
                        </td>
                        <td className="border-2 border-black px-3 py-2 text-sm align-top text-center">
                          {item.quantity || '—'}
                        </td>
                        <td className="border-2 border-black px-3 py-2 text-sm align-top text-right">
                          {item.unitPrice
                            ? <>৳ {formatTaka(parseFloat(item.unitPrice))}{lineTotal !== null && (
                                <div className="text-xs text-gray-500">= ৳ {formatTaka(lineTotal)}</div>
                              )}</>
                            : '—'}
                        </td>
                        <td className="border-2 border-black px-3 py-2 text-sm align-top">
                          <p className="whitespace-pre-wrap leading-relaxed">{item.remarks}</p>
                        </td>
                      </tr>
                    );
                  }
                  // Taka (Type B) row
                  return (
                    <tr key={index} className="req-item-row">
                      <td className="border-2 border-black px-3 py-2 text-center font-semibold text-sm align-top">
                        {item.slNo}
                      </td>
                      <td className="border-2 border-black px-3 py-2 text-sm align-top">
                        <p className="whitespace-pre-wrap leading-relaxed">{item.particulars}</p>
                      </td>
                      <td className="border-2 border-black px-3 py-2 text-sm align-top text-right font-medium">
                        {item.amount ? `৳ ${formatTaka(parseFloat(item.amount))}` : '—'}
                      </td>
                      <td className="border-2 border-black px-3 py-2 text-sm align-top">
                        <p className="whitespace-pre-wrap leading-relaxed">{item.paymentTo || '—'}</p>
                      </td>
                      <td className="border-2 border-black px-3 py-2 text-sm align-top">
                        <p className="whitespace-pre-wrap leading-relaxed">{item.remarks}</p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="border-2 border-black px-3 py-8 text-center text-sm text-gray-400">
                    No items added
                  </td>
                </tr>
              )}

              {/* ===== TOTAL ROW — Taka mode only (Materials mode has no total) ===== */}
              {isTaka && requisition.items.length > 0 && (
                <tr className="req-total-row">
                  <td colSpan={2} className="border-2 border-black px-3 py-3 text-right font-bold text-sm">
                    Total Amount:
                  </td>
                  <td className="border-2 border-black px-3 py-3 text-right font-bold text-sm text-emerald-800 print:text-black">
                    ৳ {formatTaka(total)}
                  </td>
                  <td className="border-2 border-black px-3 py-3 text-sm" />
                </tr>
              )}
            </tbody>
          </table>
        </main>

        {/* ==================== FOOTER SECTION (Signatures Only) ==================== */}
        <footer className="print-footer mt-12 req-signature-block">
          <PrintSignatureRow value={authorization} lang="en" />
        </footer>

      </div>

      {/* PRINT STYLES */}
      <style>{`
        ${BASE_PRINT_CSS}
        ${PAGE_A4_PORTRAIT}
        @media print {
          body * { visibility: hidden !important; }
          #printable-area, #printable-area *, .print-content, .print-content * {
            visibility: visible !important;
          }
          #printable-area { position: absolute !important; left: 0 !important;
            top: 0 !important; width: 100%; background: white !important;
            box-shadow: none !important; }
          .print-content { font-size: 10pt !important; }

          /* ── Multi-page table support ──────────────────────────────────
             - thead repeats on every printed page
             - each row stays intact (never split across a page break)
             - total row + signature block stay together at document end */
          .req-items-table thead {
            display: table-header-group;
          }
          .req-items-table tfoot {
            display: table-row-group;
          }
          .req-item-row,
          .req-total-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .req-signature-block {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}