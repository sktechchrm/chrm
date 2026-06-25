/**
 * MonthlyReport.tsx — Monthly Employee Grievance Report
 *
 * Pure data report — everything shown is derived directly from real grievance
 * records. No static text, no generic recommendations, no fabricated findings.
 *
 * Sections (data-only):
 *   Cover     — factory header + print date + 4 real KPI numbers
 *   Section 1 — Status breakdown (donut chart)
 *   Section 2 — Urgency breakdown (donut chart)
 *   Section 3 — Category breakdown (vertical bar chart)
 *   Section 4 — Department/section breakdown (vertical bar chart)
 *   Section 5 — Full case register (table, overdue flagged ⚠)
 *   Section 6 — Authorisation (PrintSignatureRow from ModuleShell auth state)
 *
 * Print: iframe-based (maternity pattern) — pixel-perfect A4.
 * PDF:   same iframe → browser print dialog → "Save as PDF" (no canvas blur).
 */

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import generatePDF, { Margin, Resolution } from 'react-to-pdf';
import type { Grievance } from '../shared/types';
import { FLOW_STEPS, STATUS_COLORS, URGENCY_COLORS } from '../shared/constants';
import { FaSpinner } from 'react-icons/fa';
import { useFactory }    from '../../../hooks/useFactory';
import { PrintSignatureRow } from '../../common/AuthorizationBlock';
import type { AuthorizationState } from '../../common/AuthorizationBlock';

const MONTHS_BN = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const URGENCY_KEYS = ['জরুরি','বেশি','মাঝারি','কম'] as const;

const URG_BG:  Record<string,string> = { 'জরুরি':'#FCEBEB','বেশি':'#FAECE7','মাঝারি':'#FAEEDA','কম':'#EAF3DE' };
const URG_TXT: Record<string,string> = { 'জরুরি':'#A32D2D','বেশি':'#993C1D','মাঝারি':'#854F0B','কম':'#3B6D11' };
const URG_BDR: Record<string,string> = { 'জরুরি':'#F09595','বেশি':'#F0997B','মাঝারি':'#EF9F27','কম':'#97C459' };

// ── Bilingual labels ─────────────────────────────────────────────────────────
const T = {
  bn: {
    title:       'কর্মী অভিযোগ মাসিক প্রতিবেদন',
    sub:         'এইচআর ও কমপ্লায়েন্স বিভাগ',
    totalFiled:  'মোট দাখিল',
    resolved:    'সমাধান',
    pending:     'অমীমাংসিত',
    avgDays:     'গড় দিন',
    s1:          '০১  স্ট্যাটাস বিশ্লেষণ',
    s2:          '০২  জরুরিত্ব বিশ্লেষণ',
    s3:          '০৩  বিভাগভিত্তিক বিশ্লেষণ',
    s4:          '০৪  বিভাগ/সেকশনভিত্তিক সারাংশ',
    s5:          '০৫  মামলা রেজিস্টার',
    s6:          '০৬  অনুমোদন',
    status:      'স্ট্যাটাস',
    count:       'সংখ্যা',
    pct:         'শতাংশ',
    urgency:     'জরুরিত্ব',
    category:    'ধরন',
    dept:        'বিভাগ/সেকশন',
    date:        'তারিখ',
    caseId:      'কেস আইডি',
    worker:      'কর্মী',
    colStatus:   'স্ট্যাটাস',
    colUrgency:  'জরুরিত্ব',
    days:        'দিন',
    anonymous:   'বেনামী',
    total:       'মোট',
    noData:      'এই মাসে কোনো অভিযোগ নেই।',
    confidential:'গোপনীয় — শুধুমাত্র অভ্যন্তরীণ ব্যবহার',
    auth:        'এই প্রতিবেদন এইচআর ও কমপ্লায়েন্স বিভাগ কর্তৃক প্রস্তুত।',
    period:      'প্রতিবেদনের সময়কাল:',
  },
  en: {
    title:       'Monthly Employee Grievance Report',
    sub:         'HR & Compliance Division',
    totalFiled:  'Total filed',
    resolved:    'Resolved',
    pending:     'Pending',
    avgDays:     'Avg. days open',
    s1:          '01  Status breakdown',
    s2:          '02  Urgency breakdown',
    s3:          '03  Category breakdown',
    s4:          '04  Department / section summary',
    s5:          '05  Case register',
    s6:          '06  Authorisation',
    status:      'Status',
    count:       'Count',
    pct:         'Share',
    urgency:     'Urgency',
    category:    'Category',
    dept:        'Department / section',
    date:        'Date',
    caseId:      'Case ID',
    worker:      'Worker',
    colStatus:   'Status',
    colUrgency:  'Urgency',
    days:        'Days',
    anonymous:   'Anonymous',
    total:       'Total',
    noData:      'No grievances filed this month.',
    confidential:'Confidential — internal use only',
    auth:        'This report has been prepared by the HR & Compliance Division.',
    period:      'Reporting period:',
  },
};

// ── SVG Donut ────────────────────────────────────────────────────────────────
interface Slice { label: string; value: number; color: string; }

function Donut({ slices, size = 160 }: { slices: Slice[]; size?: number }) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  if (total === 0) return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#f1f5f9',
      display:'flex', alignItems:'center', justifyContent:'center',
      margin:'0 auto', fontSize:11, color:'#94a3b8' }}>—</div>
  );

  const cx = size/2, cy = size/2, r = size/2 - 8;
  const nonZero = slices.filter(s => s.value > 0);

  // Build SVG paths — handle full-circle (single slice = 100%) as a special case
  const paths: { d:string; color:string; pct:number; lx:number; ly:number }[] = [];

  if (nonZero.length === 1) {
    // Single slice: draw two half-arcs to avoid degenerate start=end point
    const s = nonZero[0];
    const pct = 100;
    paths.push({
      d: `M${cx},${cy} L${cx},${cy-r} A${r},${r} 0 1,1 ${cx-0.01},${cy-r} Z`,
      color: s.color, pct, lx: cx, ly: cy - r*.5,
    });
  } else {
    let cum = -Math.PI/2;
    nonZero.forEach(s => {
      const angle = (s.value/total)*2*Math.PI;
      const x1 = cx+r*Math.cos(cum), y1 = cy+r*Math.sin(cum);
      cum += angle;
      const x2 = cx+r*Math.cos(cum), y2 = cy+r*Math.sin(cum);
      const mid = cum - angle/2;
      const lx = cx+r*.62*Math.cos(mid), ly = cy+r*.62*Math.sin(mid);
      const pct = Math.round(s.value/total*100);
      paths.push({
        d: `M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${angle>Math.PI?1:0},1 ${x2},${y2}Z`,
        color: s.color, pct, lx, ly,
      });
    });
  }

  return (
    // Use percentage width so it scales inside any column width
    <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ display:'block', maxWidth:size, margin:'0 auto', overflow:'visible' }}>
      {paths.map((p,i) => (
        <g key={i}>
          <path d={p.d} fill={p.color} stroke="#fff" strokeWidth={2}/>
          {p.pct >= 8 && (
            <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
              fill="#fff" fontSize={9} fontWeight="700">{p.pct}%</text>
          )}
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r*.42} fill="#fff"/>
      <text x={cx} y={cy-4}  textAnchor="middle" fill="#0f2442" fontSize={14} fontWeight="700">{total}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fill="#94a3b8" fontSize={9}>মোট</text>
    </svg>
  );
}

// ── Vertical bar chart ───────────────────────────────────────────────────────
function VBar({ data, total }: { data: { label:string; value:number; color:string }[]; total:number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const BAR_H = 100; // max bar height px

  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, paddingBottom:2 }}>
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * BAR_H);
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            {/* count above bar */}
            <span style={{ fontSize:10, fontWeight:700, color:'#374151' }}>{d.value}</span>
            {/* bar — border only, no fill background, ink-efficient */}
            <div style={{
              width:'100%', height:BAR_H, display:'flex', alignItems:'flex-end',
            }}>
              <div style={{
                width:'100%', height:`${h}px`,
                background:'#374151',   // single dark fill — prints as solid ink on labels
                borderRadius:'3px 3px 0 0',
                minHeight: d.value > 0 ? 4 : 0,
              }}/>
            </div>
            {/* label below */}
            <span style={{ fontSize:9, color:'#374151', textAlign:'center', lineHeight:1.3,
              overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box',
              WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const,
              maxWidth:'100%', wordBreak:'break-word' }}>
              {d.label}
            </span>
            <span style={{ fontSize:9, color:'#64748b' }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Horizontal bar (kept for internal use only) ───────────────────────────────
function HBar({ data }: { data: { label:string; value:number; color:string; total:number }[] }) {
  return (
    <div>
      {data.map((d,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:150, fontSize:11, color:'#374151', textAlign:'right',
            flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.label}</div>
          <div style={{ flex:1, background:'#f1f5f9', borderRadius:4, height:20, overflow:'hidden' }}>
            <div style={{ width:`${d.total>0?(d.value/d.total)*100:0}%`, background:'#374151',
              height:'100%', borderRadius:4, minWidth:d.value>0?24:0,
              display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:6 }}>
              {d.value > 0 && <span style={{ fontSize:10, color:'#fff', fontWeight:700 }}>{d.value}</span>}
            </div>
          </div>
          <div style={{ width:34, fontSize:11, color:'#64748b', textAlign:'right', flexShrink:0 }}>
            {d.total > 0 ? `${Math.round((d.value/d.total)*100)}%` : '0%'}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section label ────────────────────────────────────────────────────────────
function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' as const,
      color:'#0f2442', borderBottom:'1.5px solid #0f2442', paddingBottom:5,
      marginBottom:14, lineHeight:'1' }}>
      {children}
    </div>
  );
}

// ── Breakdown table ──────────────────────────────────────────────────────────
function BkTable({ rows, labelKey, t }: {
  rows: { label:string; color?:string; count:number; share:number }[];
  labelKey: string;
  t: typeof T.bn;
}) {
  const total = rows.reduce((a,r) => a+r.count, 0);
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, marginTop:12 }}>
      <thead>
        <tr style={{ background:'#f8fafc' }}>
          <th style={{ padding:'7px 10px', textAlign:'left', fontWeight:700, fontSize:11,
            color:'#64748b', borderBottom:'1px solid #e2e8f0', width:'60%' }}>{labelKey}</th>
          <th style={{ padding:'7px 10px', textAlign:'center', fontWeight:700, fontSize:11,
            color:'#64748b', borderBottom:'1px solid #e2e8f0' }}>{t.count}</th>
          <th style={{ padding:'7px 10px', textAlign:'center', fontWeight:700, fontSize:11,
            color:'#64748b', borderBottom:'1px solid #e2e8f0' }}>{t.pct}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i) => (
          <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
            <td style={{ padding:'7px 10px', display:'flex', alignItems:'center', gap:7 }}>
              {r.color && <span style={{ width:9, height:9, borderRadius:2, background:r.color, flexShrink:0, display:'inline-block' }}/>}
              {r.label}
            </td>
            <td style={{ padding:'7px 10px', textAlign:'center', fontWeight:600 }}>{r.count}</td>
            <td style={{ padding:'7px 10px', textAlign:'center', color:'#64748b' }}>
              {total > 0 ? `${Math.round((r.count/total)*100)}%` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ background:'#f8fafc' }}>
          <td style={{ padding:'7px 10px', fontWeight:700 }}>{t.total}</td>
          <td style={{ padding:'7px 10px', textAlign:'center', fontWeight:700 }}>{total}</td>
          <td style={{ padding:'7px 10px', textAlign:'center', fontWeight:700 }}>100%</td>
        </tr>
      </tfoot>
    </table>
  );
}

// ── Exports ──────────────────────────────────────────────────────────────────
export interface MonthlyReportRef {
  print:      () => void;
  exportPDF:  () => Promise<void>;
  pdfLoading: boolean;
}

interface MonthlyReportProps {
  grievances:    Grievance[];
  loading:       boolean;
  auth:          AuthorizationState;
  lang:          'bn' | 'en';
  onLangChange?: (l: 'bn' | 'en') => void;
}

const MonthlyReport = forwardRef<MonthlyReportRef, MonthlyReportProps>(
function MonthlyReport({ grievances, loading, auth, lang, onLangChange }, ref) {
  const factory   = useFactory();
  const t         = T[lang];
  const today     = new Date();
  const reportRef = useRef<HTMLDivElement>(null);
  const [month, setMonth] = useState(today.getMonth());
  const [year,  setYear]  = useState(today.getFullYear());
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Print (iframe — maternity pattern) ───────────────────────────────────
  const buildIframeDoc = (title: string) => {
    const el = reportRef.current;
    if (!el) return null;
    const styles = Array.from(document.styleSheets)
      .map(ss => { try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; } })
      .join('\n');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        @page{size:A4 portrait;margin:12mm 14mm;}
        body{margin:0;font-family:'Noto Sans Bengali',Arial,sans-serif;color:#000;}
        .no-print{display:none!important;}
        ${styles}
      </style>
      </head><body>${el.outerHTML}</body></html>`;
  };

  const handlePrint = () => {
    const el = reportRef.current;
    if (!el) { window.print(); return; }
    const html = buildIframeDoc('Grievance Report');
    if (!html) return;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument!;
    doc.open(); doc.write(html); doc.close();
    iframe.onload = () => {
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
      setTimeout(() => document.body.removeChild(iframe), 1200);
    };
  };

  // PDF — @react-pdf/renderer vector PDF (crisp text, sharp charts, no canvas blur)
  // PDF — react-to-pdf captures the reportRef DOM element directly.
  // No print dialog, no external font fetching, direct download.
  const handleExportPDF = async () => {
    if (pdfLoading || !reportRef.current) return;
    setPdfLoading(true);
    try {
      await generatePDF(reportRef, {
        filename: `GrievanceReport-${MONTHS_EN[month]}-${year}.pdf`,
        page: {
          margin:     Margin.MEDIUM,
          format:     'A4',
          orientation:'portrait',
        },
        resolution: Resolution.HIGH,
        overrides: {
          canvas: { useCORS: true, scale: 2 },
        },
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ print: handlePrint, exportPDF: handleExportPDF, pdfLoading }), [pdfLoading]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = grievances.filter(g => {
    if (!g.SubmittedAt) return false;
    const d = new Date(g.SubmittedAt);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const total     = filtered.length;
  const today_ts  = Date.now();
  const lastDay   = new Date(year, month+1, 0).getDate();
  const yearOpts  = Array.from({ length:5 }, (_,i) => today.getFullYear() - i);

  // ── Status counts ─────────────────────────────────────────────────────────
  const statusRows = FLOW_STEPS.map(s => ({
    label: s.status, color: STATUS_COLORS[s.status],
    count: filtered.filter(g => g.Status === s.status).length,
    share: 0,
  }));
  const resolved = filtered.filter(g => g.Status === 'সমাধান হয়েছে' || g.Status === 'বন্ধ').length;
  const pending  = total - resolved;

  // ── Urgency counts ────────────────────────────────────────────────────────
  const urgencyRows = URGENCY_KEYS.map(u => ({
    label: u, color: URG_TXT[u],
    count: filtered.filter(g => g.Urgency === u).length,
    share: 0,
  }));

  // ── Category counts (only non-zero) ──────────────────────────────────────
  const catMap: Record<string,number> = {};
  filtered.forEach(g => { catMap[g.Category] = (catMap[g.Category]||0) + 1; });
  const catRows = Object.entries(catMap)
    .sort((a,b) => b[1]-a[1])
    .map(([label, count], i) => ({
      label, count, share:0,
      color: ['#0f2442','#A32D2D','#BA7517','#378ADD','#639922','#7F77DD','#993C1D','#888780','#1D9E75','#854F0B'][i%10],
    }));

  // ── Department counts (only non-zero) ────────────────────────────────────
  const deptMap: Record<string,number> = {};
  filtered.forEach(g => { if (g.Department) deptMap[g.Department] = (deptMap[g.Department]||0) + 1; });
  const deptRows = Object.entries(deptMap)
    .sort((a,b) => b[1]-a[1])
    .map(([label, count]) => ({ label, count, share:0 }));

  // ── Avg days ──────────────────────────────────────────────────────────────
  const avgDays = total > 0
    ? (filtered.reduce((a,g) => {
        const start = g.SubmittedAt ? new Date(g.SubmittedAt).getTime() : today_ts;
        return a + Math.round((today_ts - start) / 86400000);
      }, 0) / total).toFixed(1)
    : '—';

  // ── Donut slices ──────────────────────────────────────────────────────────
  const statusSlices: Slice[] = statusRows.map(r => ({ label:r.label, value:r.count, color:r.color }));
  const urgencySlices: Slice[] = urgencyRows.map(r => ({ label:r.label, value:r.count, color:r.color }));

  // ── Styles ────────────────────────────────────────────────────────────────
  const card: React.CSSProperties = { background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden', marginBottom:16 };
  const cardHdr: React.CSSProperties = {
    borderBottom:'1.5px solid #0f2442', padding:'9px 14px', fontSize:13, fontWeight:700,
    color:'#0f2442', background:'#fff',
  };
  const sel: React.CSSProperties = { border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 10px', fontSize:13, fontFamily:'inherit', background:'#fff', cursor:'pointer' };
  const tblTd: React.CSSProperties = { padding:'7px 10px', borderBottom:'1px solid #f1f5f9', fontSize:12 };
  const tblTh: React.CSSProperties = { padding:'8px 10px', textAlign:'left' as const, fontWeight:700, fontSize:11, color:'#64748b', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', whiteSpace:'nowrap' as const };

  return (
    <div style={{ fontFamily:"'Noto Sans Bengali',Arial,sans-serif" }}>

      {/* Controls — no-print */}
      <div className="no-print" style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <span style={{ fontSize:14, fontWeight:700, color:'#0f2442' }}>{t.title}</span>
        <select style={sel} value={month} onChange={e => setMonth(+e.target.value)}>
          {(lang==='bn' ? MONTHS_BN : MONTHS_EN).map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select style={sel} value={year} onChange={e => setYear(+e.target.value)}>
          {yearOpts.map(y => <option key={y}>{y}</option>)}
        </select>
        <div style={{ display:'flex', marginLeft:'auto' }}>
          {(['bn','en'] as const).map(l => (
            <button key={l} onClick={() => onLangChange?.(l)} style={{
              padding:'6px 12px', fontSize:12, fontWeight:lang===l?700:400,
              border:'1px solid #e2e8f0',
              borderRight: l==='bn' ? 'none' : '1px solid #e2e8f0',
              borderRadius: l==='bn' ? '8px 0 0 8px' : '0 8px 8px 0',
              background: lang===l ? '#0f2442' : '#fff',
              color: lang===l ? '#fff' : '#374151',
              cursor:'pointer', fontFamily:'inherit' }}>
              {l==='bn' ? 'বাংলা' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'#94a3b8' }}>
          <FaSpinner style={{ fontSize:28, animation:'spin 1s linear infinite' }}/>
          <div style={{ marginTop:8, fontSize:13 }}>লোড হচ্ছে…</div>
        </div>
      ) : (
        <div ref={reportRef} style={{ background:'#fff' }}>

          {/* ── COVER ─────────────────────────────────────────────────── */}
          <div style={{ background:'#0f2442', color:'#fff', borderRadius:'10px 10px 0 0', padding:'22px 24px 18px' }}>
            {/* Left: factory name + address + title | Right: print date */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, lineHeight:1.3 }}>
                  {lang==='bn' ? (factory.nameBn || factory.nameEn) : (factory.nameEn || factory.nameBn)}
                </div>
                <div style={{ fontSize:11, opacity:.6, marginTop:2 }}>
                  {lang==='bn' ? (factory.addressBn || factory.addressEn) : (factory.addressEn || factory.addressBn)}
                </div>
                <div style={{ fontSize:18, fontWeight:700, lineHeight:1.3, marginTop:10 }}>{t.title}</div>
                <div style={{ fontSize:11, opacity:.5, marginTop:3 }}>
                  {lang==='bn' ? MONTHS_BN[month] : MONTHS_EN[month]} 1–{lastDay}, {year}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0, paddingLeft:16 }}>
                <div style={{ fontSize:10, opacity:.5, marginBottom:3 }}>
                  {lang==='bn' ? 'মুদ্রণের তারিখ' : 'Print date'}
                </div>
                <div style={{ fontSize:13, fontWeight:600 }}>
                  {new Date().toLocaleDateString(lang==='bn' ? 'bn-BD' : 'en-GB')}
                </div>
              </div>
            </div>
            {/* 4 KPI cells — all real numbers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, marginTop:4,
              background:'rgba(255,255,255,.1)', borderRadius:8, overflow:'hidden' }}>
              {[
                { v: String(total),    l: t.totalFiled },
                { v: String(resolved), l: t.resolved   },
                { v: String(pending),  l: t.pending    },
                { v: String(avgDays),  l: t.avgDays    },
              ].map(({ v, l }) => (
                <div key={l} style={{ background:'rgba(255,255,255,.08)', padding:'12px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:'#fff' }}>{v}</div>
                  <div style={{ fontSize:10, opacity:.55, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height:3, background:'#0f2442', borderRadius:'0 0 4px 4px', marginBottom:20 }}/>

          {/* KPI strip — bordered cells, no fill */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', border:'1px solid #000',
            borderRadius:6, overflow:'hidden', marginBottom:18 }}>
            {[
              { v: String(total),    l: t.totalFiled },
              { v: String(resolved), l: t.resolved   },
              { v: String(pending),  l: t.pending    },
              { v: String(avgDays),  l: t.avgDays    },
            ].map(({ v, l }, i) => (
              <div key={l} style={{ padding:'10px 8px', textAlign:'center',
                borderRight: i < 3 ? '1px solid #000' : 'none',
                background:'#fff' }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#0f2442' }}>{v}</div>
                <div style={{ fontSize:10, color:'#374151', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>

          {total === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem 2rem', color:'#94a3b8', fontSize:14 }}>
              {t.noData}
            </div>
          ) : (<>

            {/* ── S1 STATUS + S2 URGENCY — two donuts, one row ─────── */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
              <div>
                <SecLabel>{t.s1}</SecLabel>
                <Donut slices={statusSlices} size={160}/>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 10px', marginTop:10, justifyContent:'center' }}>
                  {statusRows.filter(r=>r.count>0).map(r=>(
                    <span key={r.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#374151' }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:r.color, flexShrink:0, display:'inline-block' }}/>
                      {r.label} ({r.count})
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <SecLabel>{t.s2}</SecLabel>
                <Donut slices={urgencySlices} size={160}/>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 10px', marginTop:10, justifyContent:'center' }}>
                  {urgencyRows.filter(r=>r.count>0).map(r=>(
                    <span key={r.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#374151' }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:r.color, flexShrink:0, display:'inline-block' }}/>
                      {r.label} ({r.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── S3 CATEGORY + S4 DEPARTMENT — two vertical bars, one row */}
            {(catRows.length > 0 || deptRows.length > 0) && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                {catRows.length > 0 && (
                  <div>
                    <SecLabel>{t.s3}</SecLabel>
                    <VBar data={catRows.map(r=>({ label:r.label, value:r.count, color:'#374151' }))} total={total}/>
                  </div>
                )}
                {deptRows.length > 0 && (
                  <div>
                    <SecLabel>{t.s4}</SecLabel>
                    <VBar data={deptRows.map(r=>({ label:r.label, value:r.count, color:'#374151' }))} total={total}/>
                  </div>
                )}
              </div>
            )}

            {/* ── S5 CASE REGISTER ───────────────────────────────────── */}
            <div style={{ marginBottom:20 }}>
              <SecLabel>{t.s5}</SecLabel>
              <div style={card}>
                <div style={{ ...cardHdr, display:'flex', justifyContent:'space-between' }}>
                  <span>{lang==='bn' ? `${MONTHS_BN[month]} ${year}` : `${MONTHS_EN[month]} ${year}`}</span>
                  <span style={{ fontSize:11, opacity:.65 }}>{total} {lang==='bn' ? 'টি' : 'cases'}</span>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr>
                        <th style={tblTh}>{t.date}</th>
                        <th style={tblTh}>{t.caseId}</th>
                        <th style={tblTh}>{t.worker}</th>
                        <th style={tblTh}>{t.dept}</th>
                        <th style={tblTh}>{t.category}</th>
                        <th style={tblTh}>{t.colStatus}</th>
                        <th style={tblTh}>{t.colUrgency}</th>
                        <th style={{ ...tblTh, textAlign:'center' as const }}>{t.days}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(g => {
                        const daysOpen = g.SubmittedAt
                          ? Math.round((today_ts - new Date(g.SubmittedAt).getTime()) / 86400000)
                          : 0;
                        const isDone    = g.Status === 'সমাধান হয়েছে' || g.Status === 'বন্ধ';
                        const isOverdue = !isDone && daysOpen > 5;
                        const sClr = STATUS_COLORS[g.Status] || '#888';
                        const uBg  = URG_BG[g.Urgency]  || '#f8fafc';
                        const uTxt = URG_TXT[g.Urgency] || '#374151';
                        const uBdr = URG_BDR[g.Urgency] || '#e2e8f0';
                        return (
                          <tr key={g.ID}>
                            <td style={{ ...tblTd, color:'#64748b', whiteSpace:'nowrap' as const }}>
                              {g.SubmittedAt ? new Date(g.SubmittedAt).toLocaleDateString(lang==='bn'?'bn-BD':'en-GB') : '—'}
                            </td>
                            <td style={{ ...tblTd, fontSize:10, color:'#0f2442', fontWeight:600 }}>{g.ID}</td>
                            <td style={tblTd}>{g.EmployeeID === 'ANON' ? t.anonymous : (g.Name || '—')}</td>
                            <td style={{ ...tblTd, color:'#475569' }}>{g.Department || '—'}</td>
                            <td style={{ ...tblTd, color:'#475569', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{g.Category}</td>
                            <td style={tblTd}>
                              <span style={{ background:sClr+'18', color:sClr, border:`1px solid ${sClr}44`,
                                borderRadius:20, padding:'2px 7px', fontSize:10, fontWeight:700,
                                display:'inline-block', whiteSpace:'nowrap' as const }}>{g.Status}</span>
                            </td>
                            <td style={tblTd}>
                              <span style={{ background:uBg, color:uTxt, border:`1px solid ${uBdr}`,
                                borderRadius:20, padding:'2px 7px', fontSize:10, fontWeight:700,
                                display:'inline-block' }}>{g.Urgency}</span>
                            </td>
                            <td style={{ ...tblTd, textAlign:'center' as const, fontWeight:700,
                              color: isOverdue ? '#A32D2D' : '#374151' }}>
                              {daysOpen}{isOverdue ? ' ⚠' : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background:'#f8fafc' }}>
                        <td colSpan={7} style={{ ...tblTd, fontWeight:700, borderBottom:'none' }}>{t.total}</td>
                        <td style={{ ...tblTd, textAlign:'center' as const, fontWeight:700, borderBottom:'none' }}>{total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

          </>)}



          {/* ── Section 6 — Authorisation ────────────────────────────── */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em',
              textTransform:'uppercase' as const, color:'#0f2442',
              borderBottom:'1.5px solid #0f2442', paddingBottom:5, marginBottom:12 }}>
              {t.s6}
            </div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:14, lineHeight:1.7 }}>
              {t.auth} {t.period} {lang==='bn' ? MONTHS_BN[month] : MONTHS_EN[month]} 1–{lastDay}, {year}.
            </div>
            <PrintSignatureRow value={auth} lang={lang} hidePrepared />
          </div>

          {/* Footer */}
          <div style={{ borderTop:'1px solid #000', marginTop:20, paddingTop:8,
            display:'flex', justifyContent:'space-between', fontSize:10, color:'#374151' }}>
            <span>{lang==='bn' ? (factory.nameBn||factory.nameEn) : (factory.nameEn||factory.nameBn)} &nbsp;·&nbsp; {t.confidential}</span>
            <span>RMS V16 &nbsp;·&nbsp; {lang==='bn' ? MONTHS_BN[month] : MONTHS_EN[month]} {year}</span>
          </div>

        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
});

export default MonthlyReport;