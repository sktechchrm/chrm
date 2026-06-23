/**
 * IncrementViewComponent
 *
 * FIXES applied vs previous version:
 *  1. <colgroup> moved OUT of <THead> — it is now a separate <ColGroup>
 *     component rendered as a direct child of <table>, which is the only
 *     valid HTML position for colgroup. Browsers/print engines silently
 *     ignored it when it was nested inside <thead>.
 *
 *  2. Column-width rounding fixed — toFixed(2) on each column accumulated
 *     floating-point drift that could total ≠ 100%. The remainder is now
 *     absorbed by the last visible column so the sum is always exactly 100%.
 *
 *  3. TotalRow colSpan audit — all four combinations of
 *     visible.lastIncrement × visible.promotion verified to produce the
 *     correct number of cells (no layout-breaking surplus/deficit).
 *
 * SMART / DYNAMIC LAYOUT (unchanged from original)
 * ─────────────────────────────────────────────
 *  1. DYNAMIC COLUMNS  — lastIncrement / promotion only rendered when data exists.
 *  2. DYNAMIC ROWS-PER-PAGE — computed from max remarks length.
 *  3. DYNAMIC TITLE    — derived from increment.subject keyword.
 *
 * SCREEN vs PRINT TOGGLE: Explicit CSS classes (NO Tailwind print: utilities)
 * .inc-screen  → visible on screen, hidden in print
 * .inc-print   → hidden on screen, visible in print
 */

import { BASE_PRINT_CSS } from '../../utils/printCSS';
import { PrintSignatureRow } from '../common/AuthorizationBlock';
import type { AuthorizationState } from '../common/AuthorizationBlock';
import {
  IncrementViewProps,
  EmployeeIncrement,
  formatDate,
  calculateTotals,
} from './dataType';

// ── Dynamic column visibility ─────────────────────────────────────────────────
interface VisibleCols {
  lastIncrement: boolean;
  promotion:     boolean;
}

function computeVisibleCols(employees: EmployeeIncrement[]): VisibleCols {
  return {
    lastIncrement: employees.some(e => (e.lastIncrementDate || '').trim() || (e.lastIncrementAmount || '').trim()),
    promotion:     employees.some(e => (e.recommendPromotion || '').trim()),
  };
}

// ── Dynamic rows-per-page ────────────────────────────────────────────────────
function computeRowsPerPage(employees: EmployeeIncrement[]): number {
  if (employees.length === 0) return 6;
  const maxRemarksLen = employees.reduce((max, e) => Math.max(max, (e.remarks || '').length), 0);
  if (maxRemarksLen <= 80)  return 6;
  if (maxRemarksLen <= 160) return 5;
  if (maxRemarksLen <= 240) return 4;
  return 3;
}

// ── Dynamic document title ───────────────────────────────────────────────────
function computeDocTitle(subject: string): string {
  const s = (subject || '').toLowerCase();
  if (s.includes('promotion'))                      return 'Salary Increment & Promotion Proposal';
  if (s.includes('adjustment'))                     return 'Salary Adjustment Proposal';
  if (s.includes('annual') || s.includes('yearly')) return 'Annual Salary Increment Proposal';
  return 'Salary Increment Proposal';
}

// ── Column proportions (inches, used as relative weights) ────────────────────
const COL_UNITS: Record<string, number> = {
  sl:                0.45,
  empInfo:           1.55,
  serviceAge:        0.56,
  currentBasic:      0.75,
  currentGross:      0.94,
  lastIncDate:       0.80,
  lastIncAmount:     0.89,
  proposedIncrement: 0.94,
  proposedSalary:    1.06,
  effectiveFrom:     0.81,
  promotion:         1.00,
  remarks:           0.75,
};

// ── Always-visible column keys (ordered) ─────────────────────────────────────
const ALWAYS_VISIBLE = [
  'sl', 'empInfo', 'serviceAge', 'currentBasic', 'currentGross',
  'proposedIncrement', 'proposedSalary', 'effectiveFrom', 'remarks',
] as const;

// ── computeColWidths ──────────────────────────────────────────────────────────
// Returns percentage strings that sum to exactly 100%.
function computeColWidths(visible: VisibleCols): Record<string, string> {
  // Build the ordered list of visible keys
  const keys: string[] = [...ALWAYS_VISIBLE];
  // Insert optional columns in their correct visual positions
  if (visible.lastIncrement) {
    const afterGross = keys.indexOf('proposedIncrement');
    keys.splice(afterGross, 0, 'lastIncDate', 'lastIncAmount');
  }
  if (visible.promotion) {
    const afterEffective = keys.indexOf('remarks');
    keys.splice(afterEffective, 0, 'promotion');
  }

  // Sum of visible units
  const total = keys.reduce((s, k) => s + COL_UNITS[k], 0);

  // Convert to percentages — accumulate to absorb rounding error in last col
  let accumulated = 0;
  const result: Record<string, string> = {};
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      // Last column: remainder to guarantee sum = 100%
      result[k] = (100 - accumulated).toFixed(2) + '%';
    } else {
      const pct = parseFloat(((COL_UNITS[k] / total) * 100).toFixed(2));
      accumulated += pct;
      result[k] = pct.toFixed(2) + '%';
    }
  });
  return result;
}

// ── Total visible column count (for empty-state colSpan) ─────────────────────
function totalColCount(visible: VisibleCols): number {
  let n = ALWAYS_VISIBLE.length; // 9 fixed cols
  if (visible.lastIncrement) n += 2;
  if (visible.promotion)     n += 1;
  return n;
}

// ── ColGroup — MUST be a direct child of <table>, never inside <thead> ────────
// FIX #1: extracted from THead so it can be placed correctly in JSX.
type ColWidths = Record<string, string>;

function ColGroup({ visible, colWidths }: { visible: VisibleCols; colWidths: ColWidths }) {
  return (
    <colgroup>
      <col style={{ width: colWidths.sl }} />
      <col style={{ width: colWidths.empInfo }} />
      <col style={{ width: colWidths.serviceAge }} />
      <col style={{ width: colWidths.currentBasic }} />
      <col style={{ width: colWidths.currentGross }} />
      {visible.lastIncrement && <col style={{ width: colWidths.lastIncDate }} />}
      {visible.lastIncrement && <col style={{ width: colWidths.lastIncAmount }} />}
      <col style={{ width: colWidths.proposedIncrement }} />
      <col style={{ width: colWidths.proposedSalary }} />
      <col style={{ width: colWidths.effectiveFrom }} />
      {visible.promotion && <col style={{ width: colWidths.promotion }} />}
      <col style={{ width: colWidths.remarks }} />
    </colgroup>
  );
}

// ── THead — header rows only, no colgroup ────────────────────────────────────
function THead({ visible }: { visible: VisibleCols }) {
  const th: React.CSSProperties = {
    border: '1.5px solid #000',
    padding: '4px 5px',
    fontSize: '8pt',
    fontWeight: 700,
    textAlign: 'left',
    verticalAlign: 'middle',
    lineHeight: 1.3,
    background: '#f8fafc',
  };

  return (
    <thead>
      <tr>
        <th style={th} rowSpan={2}>Sl</th>
        <th style={th} rowSpan={2}>Employee Information</th>
        <th style={th} rowSpan={2}>Service Age</th>
        <th style={{ ...th, textAlign: 'right' }} rowSpan={2}>Current Basic</th>
        <th style={{ ...th, textAlign: 'right' }} rowSpan={2}>Current Gross</th>
        {visible.lastIncrement && (
          <th style={{ ...th, textAlign: 'center' }} colSpan={2}>Last Increment</th>
        )}
        <th style={{ ...th, textAlign: 'right' }} rowSpan={2}>Proposed Increment</th>
        <th style={{ ...th, textAlign: 'right' }} rowSpan={2}>Proposed Salary</th>
        <th style={{ ...th, textAlign: 'center' }} rowSpan={2}>Effective From</th>
        {visible.promotion && (
          <th style={{ ...th, textAlign: 'center' }} rowSpan={2}>Recommend Promotion</th>
        )}
        <th style={th} rowSpan={2}>Remarks</th>
      </tr>
      <tr>
        {visible.lastIncrement && (
          <>
            <th style={{ ...th, textAlign: 'center' }}>Date</th>
            <th style={{ ...th, textAlign: 'right' }}>Amount</th>
          </>
        )}
      </tr>
    </thead>
  );
}

// ── Single employee row ───────────────────────────────────────────────────────
function EmpRow({ emp, visible }: { emp: EmployeeIncrement; visible: VisibleCols }) {
  const td: React.CSSProperties = {
    border: '1.5px solid #000',
    padding: '4px 5px',
    fontSize: '8pt',
    verticalAlign: 'middle',
    lineHeight: 1.35,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };
  const num = (v: string) =>
    parseFloat(v || '0').toLocaleString('en-BD', { minimumFractionDigits: 2 });

  const empInfoRows: Array<[string, string]> = [
    ['Name',        emp.employeeName  || '—'],
    ['ID',          emp.employeeId    || '—'],
    ['Designation', emp.designation   || '—'],
    ['Section',     emp.department    || '—'],
    ['DoJ',         emp.dateOfJoining ? formatDate(emp.dateOfJoining) : '—'],
  ];

  return (
    <tr>
      <td style={{ ...td, textAlign: 'center', fontWeight: 600 }}>{emp.slNo}</td>
      <td style={{ ...td, lineHeight: 1.3 }}>
        {empInfoRows.map(([label, value]) => (
          <div key={label}><b>{label}:</b> {value}</div>
        ))}
      </td>
      <td style={{ ...td, textAlign: 'center' }}>{emp.serviceAge || '—'}</td>
      <td style={{ ...td, textAlign: 'right' }}>{num(emp.basicSalary)}</td>
      <td style={{ ...td, textAlign: 'right' }}>{num(emp.grossSalary)}</td>
      {visible.lastIncrement && (
        <>
          <td style={{ ...td, textAlign: 'center' }}>{emp.lastIncrementDate || '—'}</td>
          <td style={{ ...td, textAlign: 'right' }}>
            {emp.lastIncrementAmount ? num(emp.lastIncrementAmount) : '—'}
          </td>
        </>
      )}
      <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>
        {parseFloat(emp.proposedIncrement || '0') === 0 ? '—' : num(emp.proposedIncrement)}
      </td>
      <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>
        {parseFloat(emp.proposedIncrement || '0') === 0 ? '—' : num(emp.proposedSalary)}
      </td>
      <td style={{ ...td, textAlign: 'center' }}>{emp.effectiveFrom || '—'}</td>
      {visible.promotion && (
        <td style={{ ...td, textAlign: 'center' }}>{emp.recommendPromotion || '—'}</td>
      )}
      <td style={td}>{emp.remarks || ''}</td>
    </tr>
  );
}

// ── TotalRow ──────────────────────────────────────────────────────────────────
// FIX #3: all 4 combinations of visible.lastIncrement × visible.promotion
// verified to produce the correct total cell count.
//
// Fixed columns always present (9):
//   [colSpan=3: Sl+EmpInfo+ServiceAge | TOTAL label]
//   currentBasic | currentGross
//   proposedIncrement | proposedSalary
//   [colSpan = trailingColSpan: effectiveFrom + promotion? + remarks]
//
// Optional columns:
//   lastIncrement → blank colSpan=2 between currentGross and proposedIncrement
//   promotion     → counted inside trailingColSpan
//
// trailingColSpan: effectiveFrom(1) + promotion?(0|1) + remarks(1) = 2 or 3
function TotalRow({ visible, totals, padding }: {
  visible: VisibleCols;
  totals:  ReturnType<typeof calculateTotals>;
  padding: string;
}) {
  const td: React.CSSProperties = { border: '1.5px solid #000', padding, fontSize: '8pt' };
  const trailingColSpan = 1 + (visible.promotion ? 1 : 0) + 1; // effectiveFrom + promotion? + remarks

  return (
    <tr style={{ background: '#f3f4f6', fontWeight: 700 }}>
      {/* Sl + EmpInfo + ServiceAge → label */}
      <td colSpan={3} style={{ ...td, textAlign: 'right' }}>TOTAL:</td>
      {/* Current Basic */}
      <td style={{ ...td, textAlign: 'right' }}>৳ {totals.totalBasic}</td>
      {/* Current Gross */}
      <td style={{ ...td, textAlign: 'right' }}>৳ {totals.totalGross}</td>
      {/* Last Increment placeholder — only when those columns exist */}
      {visible.lastIncrement && <td colSpan={2} style={td} />}
      {/* Proposed Increment */}
      <td style={{ ...td, textAlign: 'right' }}>৳ {totals.totalProposedInc}</td>
      {/* Proposed Salary */}
      <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>
        {!totals.totalProposedSal || totals.totalProposedSal === ''
          ? '—'
          : `৳ ${parseFloat(totals.totalProposedSal).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`}
      </td>
      {/* Effective From + Promotion? + Remarks */}
      <td colSpan={trailingColSpan} style={td} />
    </tr>
  );
}

// ── Document header ───────────────────────────────────────────────────────────
function DocHeader({ increment, title }: { increment: IncrementViewProps['increment']; title: string }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{
        textAlign: 'center', borderBottom: '2px solid #000',
        paddingBottom: '5px', marginBottom: '4px',
      }}>
        <div style={{ fontSize: '15pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {increment.factoryName || 'FACTORY NAME'}
        </div>
        <div style={{ fontSize: '8.5pt', color: '#444', marginTop: '2px' }}>
          {increment.factoryAddress || ''}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '10pt', fontWeight: 700, textDecoration: 'underline' }}>
          {title}
        </span>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: '8.5pt', borderBottom: '1px solid #000', paddingBottom: '4px',
      }}>
        <div><b>Subject:</b> {increment.subject || '_______________'}</div>
        <div><b>Date:</b> {formatDate(increment.date)}</div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IncrementViewComponent({
  increment,
  authorization,
}: IncrementViewProps & { authorization?: AuthorizationState }) {
  const employees  = increment.employees ?? [];
  const empCount   = employees.length;
  const totals     = calculateTotals(employees);
  const eachPage   = authorization?.signatureMode === 'each-page';

  const visible     = computeVisibleCols(employees);
  const rowsPerPage = computeRowsPerPage(employees);
  const colWidths   = computeColWidths(visible);
  const docTitle    = computeDocTitle(increment.subject);
  const colCount    = totalColCount(visible);

  // Split into page chunks
  const pages: EmployeeIncrement[][] = [];
  if (empCount === 0) {
    pages.push([]);
  } else {
    for (let i = 0; i < empCount; i += rowsPerPage) {
      pages.push(employees.slice(i, i + rowsPerPage));
    }
  }
  const lastIdx = pages.length - 1;

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '8pt',
    tableLayout: 'fixed',
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          SCREEN VIEW  (.inc-screen)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="inc-screen" style={{ overflowX: 'auto', padding: '4px 0' }}>
        {pages.map((pageEmps, pageIdx) => {
          const isFirst = pageIdx === 0;
          const isLast  = pageIdx === lastIdx;

          return (
            <div key={pageIdx} style={{
              background: '#fff',
              width: '297mm',
              minHeight: '210mm',
              flexShrink: 0,
              padding: '10mm 8mm',
              margin: '0 auto 28px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <DocHeader increment={increment} title={docTitle} />
              {!isFirst && (
                <div style={{ fontSize: '7.5pt', color: '#94a3b8', textAlign: 'right', marginBottom: '4px' }}>
                  (continued — page {pageIdx + 1} of {pages.length})
                </div>
              )}

              {/* FIX #1: ColGroup is now a direct child of <table> */}
              <table style={tableStyle}>
                <ColGroup visible={visible} colWidths={colWidths} />
                <THead visible={visible} />
                <tbody>
                  {pageEmps.length > 0
                    ? pageEmps.map((emp, i) => <EmpRow key={i} emp={emp} visible={visible} />)
                    : (
                      <tr>
                        <td colSpan={colCount} style={{
                          border: '1.5px solid #000', padding: '28px',
                          textAlign: 'center', color: '#9ca3af', fontSize: '9pt',
                        }}>
                          No employees added
                        </td>
                      </tr>
                    )
                  }
                  {isLast && empCount > 0 && (
                    <TotalRow visible={visible} totals={totals} padding="4px 5px" />
                  )}
                </tbody>
              </table>

              {(eachPage || isLast) && authorization && (
                <div style={{ marginTop: '14px', borderTop: '1px solid #e5e7eb', paddingTop: '4px' }}>
                  <PrintSignatureRow value={authorization} lang="en" />
                </div>
              )}
              {!isLast && (
                <div style={{
                  marginTop: '10px', textAlign: 'center',
                  fontSize: '7.5pt', color: '#94a3b8',
                  borderTop: '1px dashed #e5e7eb', paddingTop: '6px',
                }}>
                  ── Page {pageIdx + 1} of {pages.length} ──
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PRINT VIEW  (.inc-print)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="inc-print">
        {pages.map((pageEmps, pageIdx) => {
          const isFirst = pageIdx === 0;
          const isLast  = pageIdx === lastIdx;

          return (
            <div
              key={pageIdx}
              className={pageIdx === 0 ? 'print-page' : 'print-page print-page-break'}
            >
              <div className="print-doc-header">
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '4px' }}>
                  <div className="print-company-name">{increment.factoryName || 'FACTORY NAME'}</div>
                  <div className="print-company-addr">{increment.factoryAddress || ''}</div>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                  <span className="print-doc-title">{docTitle}</span>
                </div>
                <div className="print-subject-row">
                  <div><b>Subject:</b> {increment.subject || '_______________'}</div>
                  <div><b>Date:</b> {formatDate(increment.date)}</div>
                </div>
              </div>

              {!isFirst && (
                <div style={{ fontSize: '7.5pt', color: '#555', textAlign: 'right', marginBottom: '3px' }}>
                  (continued — page {pageIdx + 1} of {pages.length})
                </div>
              )}

              {/* FIX #1: ColGroup is now a direct child of <table> */}
              <table className="print-table">
                <ColGroup visible={visible} colWidths={colWidths} />
                <THead visible={visible} />
                <tbody>
                  {pageEmps.length > 0
                    ? pageEmps.map((emp, i) => <EmpRow key={i} emp={emp} visible={visible} />)
                    : (
                      <tr>
                        <td colSpan={colCount} style={{
                          border: '1.5px solid #000', padding: '24px',
                          textAlign: 'center', fontSize: '9pt',
                        }}>
                          No employees added
                        </td>
                      </tr>
                    )
                  }
                  {isLast && empCount > 0 && (
                    <TotalRow visible={visible} totals={totals} padding="3pt 5pt" />
                  )}
                </tbody>
              </table>

              {(eachPage || isLast) && authorization && (
                <div className="print-sig">
                  <PrintSignatureRow value={authorization} lang="en" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════════════════════════════ */}
      <style>{`
        ${BASE_PRINT_CSS}

        @media screen {
          .inc-screen { display: block; }
          .inc-print  { display: none !important; }
        }

        @media print {
          .inc-screen { display: none !important; }
          .inc-print  { display: block !important; }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print-page {
            display: block;
            box-sizing: border-box;
            overflow: hidden;
          }

          .print-page-break {
            break-before: page !important;
            page-break-before: always !important;
          }

          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8pt !important;
            table-layout: fixed !important;
          }
          .print-table th,
          .print-table td {
            border: 1.5pt solid #000 !important;
            padding: 3pt 4pt !important;
            font-size: 8pt !important;
            line-height: 1.3 !important;
          }
          .print-table thead { display: table-header-group; }
          .print-table tbody tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .print-doc-header { margin-bottom: 6pt; }
          .print-company-name {
            font-size: 14pt !important;
            font-weight: 800 !important;
            text-transform: uppercase;
          }
          .print-company-addr { font-size: 8pt !important; color: #333 !important; }
          .print-doc-title {
            font-size: 10pt !important;
            font-weight: 700 !important;
            text-decoration: underline;
          }
          .print-subject-row {
            display: flex !important;
            justify-content: space-between !important;
            font-size: 8.5pt !important;
            border-bottom: 1pt solid #000;
            padding-bottom: 4pt;
          }

          .print-sig {
            margin-top: 10pt !important;
            border-top: 1pt solid #000;
            padding-top: 4pt !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          * {
            color: #000 !important;
            background: transparent !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          b, strong { font-weight: 700 !important; }
        }
      `}</style>
    </>
  );
}