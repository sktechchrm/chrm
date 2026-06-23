// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRINT CSS UTILITY
// Import BASE_PRINT_CSS and embed at the top of every module style block.
//
// Usage:
//   import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from "../utils/printCSS";
//   <style>{`${BASE_PRINT_CSS}${PAGE_A4_PORTRAIT}\n/* module overrides */`}</style>
//
// Page size helpers (use ONE after BASE_PRINT_CSS):
//   PAGE_A4_PORTRAIT  — 14mm/12mm margins (standard HR docs)
//   PAGE_A4_LANDSCAPE — 10mm/8mm  (increment bill)
//   PAGE_ENVELOPE_DL  — 9in x 4in (left-employee envelope)
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_PRINT_CSS: string = [
  "@media print {",
  "  .nav-root, .nav-mobile-panel, .footer-root,",
  "  .no-print, [data-no-print], [data-print-hide],",
  "  button[data-print-hide], .pl-screen-only,",
  "  .eb-toolbar, .eb-btn { display: none !important; }",
  "  * { -webkit-print-color-adjust: exact !important;",
  "      print-color-adjust: exact !important; }",
  "  body { background: #fff !important;",
  "         margin: 0 !important; padding: 0 !important; }",
  "}",
].join("\n");

export const PAGE_A4_PORTRAIT: string = [
  "@media print {",
  "  @page { size: A4 portrait; margin: 14mm 12mm 14mm 12mm; }",
  "}",
].join("\n");

export const PAGE_A4_LANDSCAPE: string = [
  "@media print {",
  "  @page { size: A4 landscape; margin: 10mm 8mm 10mm 8mm; }",
  "}",
].join("\n");

// 9in x 4in DL envelope  (Envelope.tsx)
export const PAGE_ENVELOPE_DL: string = [
  "@media print {",
  "  @page { size: 9in 4in; margin: 0.25in; }",
  "}",
].join("\n");

import React from "react";

/**
 * Optional convenience component — renders the shared base print rules.
 * Drop <GlobalPrintStyle /> as the first child of any print view.
 * Pass pageCSS to set page size (defaults to A4 portrait).
 */
export function GlobalPrintStyle({
  pageCSS = PAGE_A4_PORTRAIT,
}: {
  pageCSS?: string;
}): React.ReactElement {
  return <style>{BASE_PRINT_CSS + pageCSS}</style>;
}
