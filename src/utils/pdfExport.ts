// src/utils/pdfExport.ts
// ─────────────────────────────────────────────────────────────────────────────
// Central smart PDF export — wraps jsPDF + html2canvas.
//
// FIX: Before capture, the element is temporarily forced to A4 width (794px =
// 210mm at 96dpi) so the captured image always fills the full A4 page width —
// matching the print preview exactly. The original styles are restored after.
// ─────────────────────────────────────────────────────────────────────────────
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  /** The DOM element to capture */
  element:      HTMLElement;
  /** File name (without .pdf) */
  filename?:    string;
  /** A4 portrait (default) or landscape */
  orientation?: 'portrait' | 'landscape';
  /** 1–3; higher = better quality, slower. Default 2 */
  scale?:       number;
  /** Light diagonal watermark text */
  watermark?:   string;
  /** Called with 0–100 progress */
  onProgress?:  (pct: number) => void;
}

// A4 at 96dpi = 793.7px — use 794px as the forced capture width
const A4_WIDTH_PX   = 794;
const A4_WIDTH_MM   = 210;
const A4_HEIGHT_MM  = 297;
const MARGIN_MM     = 10;

/** Bengali font CDN URLs */
const FONT_400 = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-bengali@5.0.18/files/noto-sans-bengali-bengali-400-normal.woff2';
const FONT_700 = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-bengali@5.0.18/files/noto-sans-bengali-bengali-700-normal.woff2';

async function toDataURI(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { cache: 'force-cache' });
    if (!r.ok) return null;
    const buf   = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return `data:font/woff2;base64,${btoa(bin)}`;
  } catch { return null; }
}

function buildFontStyle(u400: string | null, u700: string | null): string {
  let css = '';
  if (u400) css += `@font-face{font-family:BengaliFontEmbed;font-weight:400;src:url('${u400}') format('woff2');}`;
  if (u700) css += `@font-face{font-family:BengaliFontEmbed;font-weight:700;src:url('${u700}') format('woff2');}`;
  return css;
}

function addWatermark(doc: jsPDF, text: string) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(42);
    doc.setFont('helvetica', 'bold');
    // @ts-ignore
    doc.text(text, doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
      align: 'center', angle: 45,
    });
  }
}

/**
 * Force the element to A4 width before capture so the PDF always fills the
 * full page — identical to the print preview.
 * Returns a cleanup function that restores the original styles.
 */
function forceA4Width(el: HTMLElement): () => void {
  const prev = {
    width:     el.style.width,
    maxWidth:  el.style.maxWidth,
    minWidth:  el.style.minWidth,
    margin:    el.style.margin,
    position:  el.style.position,
    left:      el.style.left,
    top:       el.style.top,
  };

  // Position off-screen so layout doesn't shift visibly, then force width
  el.style.position = 'fixed';
  el.style.left     = '-9999px';
  el.style.top      = '0px';
  el.style.width    = `${A4_WIDTH_PX}px`;
  el.style.maxWidth = `${A4_WIDTH_PX}px`;
  el.style.minWidth = `${A4_WIDTH_PX}px`;
  el.style.margin   = '0';

  return () => {
    el.style.width    = prev.width;
    el.style.maxWidth = prev.maxWidth;
    el.style.minWidth = prev.minWidth;
    el.style.margin   = prev.margin;
    el.style.position = prev.position;
    el.style.left     = prev.left;
    el.style.top      = prev.top;
  };
}

export async function exportToPDF(opts: PDFExportOptions): Promise<void> {
  const {
    element,
    filename     = 'document',
    orientation  = 'portrait',
    scale        = 2,
    watermark,
    onProgress,
  } = opts;

  onProgress?.(5);

  // Inject Bengali font so html2canvas captures it correctly
  const [u400, u700] = await Promise.all([toDataURI(FONT_400), toDataURI(FONT_700)]);
  const fontStyle = buildFontStyle(u400, u700);
  let styleEl: HTMLStyleElement | null = null;
  if (fontStyle) {
    styleEl = document.createElement('style');
    styleEl.textContent = fontStyle;
    document.head.appendChild(styleEl);
    await new Promise(r => setTimeout(r, 120));
  }

  onProgress?.(15);

  // FIX: force element to A4 width before capture
  const restoreStyles = forceA4Width(element);

  // Let browser reflow at the new width
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  onProgress?.(20);

  const canvas = await html2canvas(element, {
    scale,
    useCORS:       true,
    allowTaint:    true,
    backgroundColor: '#ffffff',
    logging:       false,
    // Use the forced A4 width — not the element's original scrollWidth
    windowWidth:   A4_WIDTH_PX,
    windowHeight:  element.scrollHeight,
    width:         A4_WIDTH_PX,
  });

  // Restore original element styles immediately after capture
  restoreStyles();
  if (styleEl) document.head.removeChild(styleEl);

  onProgress?.(75);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pageW   = orientation === 'portrait' ? A4_WIDTH_MM  : A4_HEIGHT_MM;
  const pageH   = orientation === 'portrait' ? A4_HEIGHT_MM : A4_WIDTH_MM;
  const usableW = pageW - MARGIN_MM * 2;
  const usableH = pageH - MARGIN_MM * 2;

  // px-per-mm based on the FORCED width (always A4_WIDTH_PX → usableW mm)
  const pxPerMm  = canvas.width / usableW;
  const totalMmH = canvas.height / pxPerMm;

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  let yOffset   = 0;
  let pageIndex = 0;

  while (yOffset < totalMmH) {
    if (pageIndex > 0) doc.addPage();

    const srcY   = yOffset * pxPerMm;
    const stripH = Math.min(usableH, totalMmH - yOffset);
    const srcH   = stripH * pxPerMm;

    const strip    = document.createElement('canvas');
    strip.width    = canvas.width;
    strip.height   = Math.ceil(srcH);
    const ctx      = strip.getContext('2d')!;
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, Math.ceil(srcH));

    const stripData = strip.toDataURL('image/jpeg', 0.95);
    doc.addImage(stripData, 'JPEG', MARGIN_MM, MARGIN_MM, usableW, stripH);

    yOffset   += stripH;
    pageIndex++;
  }

  if (watermark) addWatermark(doc, watermark);

  onProgress?.(95);
  doc.save(`${filename}.pdf`);
  onProgress?.(100);
}

// ─── Convenience types ────────────────────────────────────────────────────────
export interface UsePDFExportReturn {
  exportPDF:   () => Promise<void>;
  isExporting: boolean;
  progress:    number;
}