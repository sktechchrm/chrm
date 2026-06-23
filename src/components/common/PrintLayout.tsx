// src/components/common/PrintLayout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Central dynamic print layout — used by EVERY module for consistent
// print / PDF output with factory branding, header, footer, page numbers.
// ─────────────────────────────────────────────────────────────────────────────
import React, { forwardRef } from "react";

export interface PrintLayoutProps {
  children: React.ReactNode;
  /** Main document title (e.g. "Final Settlement Bill") */
  title: string;
  /** Optional Bangla title */
  titleBn?: string;
  /** Factory / company name */
  factoryName?: string;
  /** Factory address */
  factoryAddress?: string;
  /** Logo src (base64 or URL) */
  logoSrc?: string;
  /** Document ref number or ID */
  docRef?: string;
  /** Date string to show in header */
  date?: string;
  /** Hide header (for pages that supply their own) */
  hideHeader?: boolean;
  /** Extra class on root */
  className?: string;
}

const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
  (
    {
      children,
      title,
      titleBn,
      factoryName,
      factoryAddress,
      logoSrc,
      docRef,
      date,
      hideHeader = false,
      className = "",
    },
    ref
  ) => {
    const today = date ?? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    return (
      <div className={`pl-root ${className}`} ref={ref}>
        <style>{`
          /* ════════════════════════════════════════
             CENTRAL PRINT LAYOUT  — global @media print rules
             All modules import this; no module should define its own
             @media print anymore.
          ════════════════════════════════════════ */

          /* ── Screen wrapper ── */
          .pl-root {
            background: #fff;
            font-family: 'SolaimanLipi', 'Noto Sans Bengali', 'DM Sans', Arial, sans-serif;
          }

          /* ── Print header ── */
          .pl-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding-bottom: 12px;
            border-bottom: 2.5px solid #1e3a5f;
            margin-bottom: 16px;
          }
          .pl-header-logo img {
            height: 56px;
            width: auto;
            object-fit: contain;
          }
          .pl-header-logo-placeholder {
            width: 56px; height: 56px;
            background: #e2e8f0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #94a3b8;
          }
          .pl-header-center { flex: 1; text-align: center; }
          .pl-header-factory-name {
            font-size: 16px;
            font-weight: 700;
            color: #1e3a5f;
            line-height: 1.3;
          }
          .pl-header-factory-address {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
            line-height: 1.5;
          }
          .pl-header-doc-title {
            font-size: 13px;
            font-weight: 700;
            color: #dc2626;
            margin-top: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .pl-header-doc-title-bn {
            font-size: 13px;
            color: #dc2626;
            font-weight: 600;
          }
          .pl-header-right {
            text-align: right;
            font-size: 11px;
            color: #64748b;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .pl-header-ref {
            font-weight: 600;
            color: #1e3a5f;
            font-size: 12px;
          }

          /* ── Body ── */
          .pl-body { }

          /* ── Print footer ── */
          .pl-print-footer {
            display: none;          /* hidden on screen; shown in @media print */
            margin-top: 16px;
            padding-top: 8px;
            border-top: 1px solid #cbd5e1;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #94a3b8;
          }

          /* ════════════════════════════════════════
             @media print — ALL global print rules
          ════════════════════════════════════════ */
          @media print {
            /* Page setup */
            @page {
              size: A4 portrait;
              margin: 14mm 12mm 14mm 12mm;
            }

            /* Hide navigation, footer, buttons, tabs from all modules */
            .nav-root,
            .footer-root,
            .nav-mobile-panel,
            .print\\:hidden,
            [data-no-print],
            button[data-print-hide],
            .pl-screen-only {
              display: none !important;
            }

            /* Show print footer */
            .pl-print-footer {
              display: flex !important;
            }

            /* Prevent content breaking mid-element */
            table       { page-break-inside: auto; }
            thead       { display: table-header-group; }
            tfoot       { display: table-footer-group; }
            tr          { page-break-inside: avoid; break-inside: avoid; }
            td, th      { page-break-inside: avoid; break-inside: avoid; }
            img         { page-break-inside: avoid; break-inside: avoid; }

            /* Block-level containers */
            .pl-root,
            .pl-body,
            section,
            article,
            .card,
            .section-block,
            .avoid-break {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            /* Keep headings with their content */
            h1,h2,h3,h4,h5,h6 {
              page-break-after: avoid;
              break-after: avoid;
            }

            /* Orphan / widow control */
            p { orphans: 3; widows: 3; }

            /* Force white backgrounds */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body { background: #fff !important; }

            /* Reset any screen-only shadow/radius */
            .pl-root {
              box-shadow: none !important;
              border-radius: 0 !important;
            }
          }
        `}</style>

        {/* ── Print header ── */}
        {!hideHeader && (
          <div className="pl-header">
            <div className="pl-header-logo">
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" />
              ) : (
                <div className="pl-header-logo-placeholder">LOGO</div>
              )}
            </div>

            <div className="pl-header-center">
              {factoryName && (
                <div className="pl-header-factory-name">{factoryName}</div>
              )}
              {factoryAddress && (
                <div className="pl-header-factory-address">{factoryAddress}</div>
              )}
              {title && (
                <div className="pl-header-doc-title">{title}</div>
              )}
              {titleBn && (
                <div className="pl-header-doc-title-bn">{titleBn}</div>
              )}
            </div>

            <div className="pl-header-right">
              {docRef && <div className="pl-header-ref">Ref: {docRef}</div>}
              <div>{today}</div>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        <div className="pl-body">{children}</div>

        {/* ── Print-only footer ── */}
        <div className="pl-print-footer">
          <span>{factoryName ?? "SK-TECH RMS"} · {title}</span>
          <span>Printed: {today}</span>
        </div>
      </div>
    );
  }
);

PrintLayout.displayName = "PrintLayout";
export default PrintLayout;
