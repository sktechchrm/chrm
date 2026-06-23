// src/utils/excelExport.ts
// ─────────────────────────────────────────────────────────────────────────────
// Central smart Excel export — wraps SheetJS (xlsx).
// Every module calls exportToExcel() instead of rolling its own.
// ─────────────────────────────────────────────────────────────────────────────
import * as XLSX from "xlsx";

export interface ExcelColumn {
  key: string;
  header: string;
  /** Column width in chars (approx). Default: auto */
  width?: number;
}

export interface ExcelSection {
  /** Section heading row (merged, bold) */
  title?: string;
  rows: Record<string, string | number | null | undefined>[];
  columns: ExcelColumn[];
}

export interface ExcelExportOptions {
  /** File name without extension */
  filename?: string;
  /** Sheet name */
  sheetName?: string;
  /** Company / factory info rows injected at top */
  headerInfo?: { label: string; value: string }[];
  /** One or more data sections */
  sections: ExcelSection[];
  /** Title shown in row 1 */
  title?: string;
}

/** ARGB hex for xlsx cell fill */
const COLORS = {
  docTitle:   "FF1E3A5F",
  sectionHdr: "FF1E3A5F",
  colHdr:     "FF2563EB",
  infoLabel:  "FFE2E8F0",
  altRow:     "FFF8FAFC",
  white:      "FFFFFFFF",
};

function cell(v: string | number, bold = false, bg?: string, align?: "center" | "left" | "right", color?: string): XLSX.CellObject {
  return {
    v,
    t: typeof v === "number" ? "n" : "s",
    s: {
      font:      { bold, color: color ? { rgb: color } : { rgb: "FF1E293B" }, sz: 10 },
      fill:      bg ? { fgColor: { rgb: bg }, patternType: "solid" } : undefined,
      alignment: { horizontal: align ?? "left", vertical: "center", wrapText: true },
      border: {
        top:    { style: "thin", color: { rgb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { rgb: "FFE2E8F0" } },
        left:   { style: "thin", color: { rgb: "FFE2E8F0" } },
        right:  { style: "thin", color: { rgb: "FFE2E8F0" } },
      },
    },
  };
}

export function exportToExcel(opts: ExcelExportOptions): void {
  const {
    filename = "export",
    sheetName = "Sheet1",
    headerInfo = [],
    sections,
    title,
  } = opts;

  const ws: XLSX.WorkSheet = {};
  const merges: XLSX.Range[] = [];
  let row = 0; // 0-indexed

  // ── Determine max columns for merges ──
  const maxCols = Math.max(
    ...sections.map(s => s.columns.length),
    2
  );

  // ── Row 0: Document title ──
  if (title) {
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell(title, true, COLORS.docTitle, "center", "FFFFFFFF");
    // @ts-ignore
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })].s.font.sz = 13;
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: maxCols - 1 } });
    row++;
  }

  // ── Header info rows ──
  if (headerInfo.length) {
    headerInfo.forEach(({ label, value }) => {
      ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell(label, true, COLORS.infoLabel);
      ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = cell(value, false, COLORS.white);
      merges.push({ s: { r: row, c: 1 }, e: { r: row, c: maxCols - 1 } });
      row++;
    });
    row++; // blank spacer
  }

  // ── Sections ──
  sections.forEach(section => {
    // Section title
    if (section.title) {
      ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell(section.title, true, COLORS.sectionHdr, "left", "FFFFFFFF");
      merges.push({ s: { r: row, c: 0 }, e: { r: row, c: section.columns.length - 1 } });
      row++;
    }

    // Column headers
    section.columns.forEach((col, ci) => {
      ws[XLSX.utils.encode_cell({ r: row, c: ci })] = cell(col.header, true, COLORS.colHdr, "center", "FFFFFFFF");
    });
    row++;

    // Data rows
    section.rows.forEach((dataRow, ri) => {
      const bg = ri % 2 === 0 ? COLORS.white : COLORS.altRow;
      section.columns.forEach((col, ci) => {
        const val = dataRow[col.key] ?? "";
        ws[XLSX.utils.encode_cell({ r: row, c: ci })] = cell(
          typeof val === "number" ? val : String(val),
          false,
          bg
        );
      });
      row++;
    });

    row++; // blank between sections
  });

  // ── Column widths ──
  const colWidths: { wch: number }[] = Array.from({ length: maxCols }, (_, i) => {
    const allSectionWidths = sections.map(s => s.columns[i]?.width ?? 0);
    return { wch: Math.max(14, ...allSectionWidths) };
  });
  ws["!cols"] = colWidths;

  // ── Row heights ──
  ws["!rows"] = Array.from({ length: row }, () => ({ hpt: 20 }));

  // ── Sheet ref range ──
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row - 1, c: maxCols - 1 } });

  // ── Merges ──
  ws["!merges"] = merges;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
