// src/components/common/ExportButtons.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable PDF & Excel export buttons for every module.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef } from "react";
import { FaFilePdf, FaFileExcel, FaPrint } from "react-icons/fa";
import { exportToPDF } from "../../utils/pdfExport";
import type { ExcelExportOptions } from "../../utils/excelExport";
import { exportToExcel } from "../../utils/excelExport";

/* ── PDF Button ─────────────────────────────────────────────────────────────── */
interface PDFButtonProps {
  /** Ref to the element to capture */
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
  label?: string;
  watermark?: string;
  orientation?: "portrait" | "landscape";
  scale?: number;
  style?: React.CSSProperties;
}

export function PDFButton({
  targetRef,
  filename = "document",
  label = "PDF",
  watermark,
  orientation = "portrait",
  scale = 2,
  style,
}: PDFButtonProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleClick = async () => {
    if (!targetRef.current || loading) return;
    setLoading(true);
    setProgress(0);
    try {
      await exportToPDF({
        element: targetRef.current,
        filename,
        orientation,
        scale,
        watermark,
        onProgress: setProgress,
      });
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("PDF generation failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="eb-btn eb-btn--pdf"
      aria-label="Export as PDF" title="Export as PDF"
      style={style}
      data-print-hide
    >
      <FaFilePdf aria-hidden="true" />
      {loading ? (
        <span>{label} {progress}%</span>
      ) : (
        <span>{label}</span>
      )}
      {loading && <span className="eb-spinner" />}
    </button>
  );
}

/* ── Excel Button ───────────────────────────────────────────────────────────── */
interface ExcelButtonProps extends ExcelExportOptions {
  label?: string;
  style?: React.CSSProperties;
}

export function ExcelButton({ label = "Excel", style, ...excelOpts }: ExcelButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;
    setLoading(true);
    try {
      exportToExcel(excelOpts);
    } catch (e) {
      console.error("Excel export failed:", e);
      alert("Excel generation failed. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="eb-btn eb-btn--excel"
      aria-label="Export as Excel" title="Export as Excel"
      style={style}
      data-print-hide
    >
      <FaFileExcel aria-hidden="true" />
      <span>{loading ? "Exporting…" : label}</span>
    </button>
  );
}

/* ── Print Button ───────────────────────────────────────────────────────────── */
interface PrintButtonProps {
  label?: string;
  style?: React.CSSProperties;
}

export function PrintButton({ label = "Print", style }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className="eb-btn eb-btn--print"
      title="Print document"
      style={style}
      data-print-hide
    >
      <FaPrint aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/* ── Export Toolbar (groups all three) ─────────────────────────────────────── */
interface ExportToolbarProps {
  pdfProps?: Omit<PDFButtonProps, "targetRef"> & { targetRef: React.RefObject<HTMLElement | null> };
  excelProps?: ExcelButtonProps;
  printEnabled?: boolean;
  /** Show labels next to icons */
  showLabels?: boolean;
}

export function ExportToolbar({
  pdfProps,
  excelProps,
  printEnabled = true,
  showLabels = true,
}: ExportToolbarProps) {
  return (
    <>
      <style>{`
        .eb-toolbar {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .eb-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .eb-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .eb-btn svg { font-size: 14px; flex-shrink: 0; }

        .eb-btn--pdf   { background: #dc2626; color: #fff; }
        .eb-btn--pdf:hover:not(:disabled)   { background: #b91c1c; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220,38,38,0.35); }

        .eb-btn--excel { background: #16a34a; color: #fff; }
        .eb-btn--excel:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,0.35); }

        .eb-btn--print { background: #0f172a; color: #fff; }
        .eb-btn--print:hover:not(:disabled) { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

        .eb-spinner {
          display: inline-block;
          width: 11px; height: 11px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: eb-spin 0.7s linear infinite;
          margin-left: 4px;
        }
        @keyframes eb-spin { to { transform: rotate(360deg); } }

        @media print { .eb-toolbar, .eb-btn { display: none !important; } }
      `}</style>
      <div className="eb-toolbar">
        {pdfProps   && <PDFButton   {...pdfProps}   label={showLabels ? (pdfProps.label ?? "PDF")   : ""} />}
        {excelProps && <ExcelButton {...excelProps} label={showLabels ? (excelProps.label ?? "Excel") : ""} />}
        {printEnabled && <PrintButton label={showLabels ? "Print" : ""} />}
      </div>
    </>
  );
}
