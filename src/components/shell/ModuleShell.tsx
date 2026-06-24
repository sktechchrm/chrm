// ─────────────────────────────────────────────────────────────────────────────
// ModuleShell — Global Standard Layout (Layout 2)
// src/components/shell/ModuleShell.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  FaSave, FaTimes, FaSearch, FaEdit, FaCalendarAlt,
  FaTrash, FaSyncAlt, FaChevronDown,
  FaFilePdf, FaFileExcel, FaFileWord,
  FaDownload, FaPrint, FaDatabase,
} from 'react-icons/fa';
import { useFactory }            from '../../hooks/useFactory';
import AuthorityIconButton       from '../common/AuthorityIconButton';
import type { AuthorizationState } from '../common/AuthorizationBlock';
import { DataUseCases }          from '../../business/DataUseCases';
import type { DbModule, DbRecord } from '../../business/DataUseCases';
import { formatSavedAt }         from '../../utils/dateUtils';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShellStep {
  id:          string;
  label:       string;
  icon:        string;
  fieldCount?: number;
}

export interface ShellBillItem {
  label:     string;
  onClick:   () => void;
  subItems?: { label: string; onClick: () => void; active?: boolean }[];
}

export interface CalcRow {
  label: string;
  value: string;
  muted?: boolean;
}

export interface ShellProps {
  moduleName:    string;
  moduleNameEn?: string;
  date?:         string;
  onDateChange?: (d: string) => void;

  steps:          ShellStep[];
  activeStep:     string;
  onStepChange:   (id: string) => void;
  billItems?:     ShellBillItem[];
  isBillActive?:  boolean;

  onSave?:        () => Promise<boolean | string | null>;
  isSaving?:      boolean;
  saveDisabled?:  boolean;
  configured?:    boolean;
  adapterName?:   string;
  editingId?:     string | null;
  onCancelEdit?:  () => void;
  onReset?:       () => void;
  onUpdate?:      (record: Record<string, unknown>) => void;
  /** Override the built-in UpdateModal — if provided, clicking আপডেট সার্চ calls this
   *  instead of opening the DataUseCases modal. Use for modules with their own search. */
  onUpdateSearch?: () => void;
  updateModule?:  DbModule;
  updateLabel?:   string;
  /** Placeholder text for the update-search input — defaults to "কার্ড নং বা নাম..." */
  updateSearchPlaceholder?: string;

  children:       React.ReactNode;

  /** Hide the ← পূর্ববর্তী / পরবর্তী → footer nav — for tab-style modules where steps
   *  are independent views, not a sequential flow (e.g. grievance). */
  hideStepNav?:   boolean;

  calcRows?:      CalcRow[];
  totalRow?:      CalcRow;

  records?:       DbRecord[];
  isLoading?:     boolean;
  onLoadRecord?:  (rec: Record<string, unknown>) => void;
  onDeleteRecord?:(id: string) => Promise<boolean>;
  onReload?:      () => void;
  /** Optional badge rendered next to each record row — e.g. urgency badge for grievance */
  recordBadge?:   (rec: DbRecord) => React.ReactNode;
  /** Optional label override per record — defaults to employeeName/fullName/subject/id */
  recordLabel?:   (rec: DbRecord) => string;

  auth?:          AuthorizationState;
  onAuthChange?:  (v: AuthorizationState) => void;
  onPrint?:       () => void;
  onPDF?:         () => void;
  onExcel?:       () => void;
  onWord?:        () => void;

  lang?: 'bn' | 'en';
}

// ── Styles ────────────────────────────────────────────────────────────────────

const font = "'Noto Sans Bengali', Arial, sans-serif";

const S = {
  btn: (active = false, color = '#1e40af'): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 7, border: 'none',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: font, whiteSpace: 'nowrap',
    background: active ? color : '#fff',
    color:      active ? '#fff' : color,
    outline:    `1.5px solid ${active ? color : color + '55'}`,
    transition: 'all .13s',
  }),
  iconBtn: (color = '#374151'): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 10px', borderRadius: 7,
    border: '1px solid #e2e8f0',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    fontFamily: font, background: '#fff', color,
  }),
};

// ── Export dropdown ───────────────────────────────────────────────────────────

function ExportMenu({ onPDF, onExcel, onWord, lang }: {
  onPDF?:()=>void; onExcel?:()=>void; onWord?:()=>void; lang: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const items = [
    onPDF   && { icon: <FaFilePdf/>,   label: 'PDF',   color: '#dc2626', fn: onPDF   },
    onExcel && { icon: <FaFileExcel/>, label: 'Excel', color: '#16a34a', fn: onExcel },
    onWord  && { icon: <FaFileWord/>,  label: 'Word',  color: '#1d4ed8', fn: onWord  },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; color: string; fn: ()=>void }[];
  if (!items.length) return null;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button style={S.iconBtn()} onClick={() => setOpen(v => !v)}>
        <FaDownload style={{ fontSize: 11 }}/>
        {lang === 'bn' ? 'এক্সপোর্ট' : 'Export'}
        <FaChevronDown style={{ fontSize: 9, transform: open ? 'rotate(180deg)' : 'none', transition: '.15s' }}/>
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, zIndex: 900,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 160, padding: 5,
        }}>
          {items.map((it, i) => (
            <button key={i} onClick={() => { it.fn(); setOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '7px 10px', border: 'none',
              borderRadius: 7, background: 'transparent', cursor: 'pointer',
              fontFamily: font, fontSize: 13,
            }}>
              <span style={{ color: it.color, fontSize: 13 }}>{it.icon}</span>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Update search modal ───────────────────────────────────────────────────────

function UpdateModal({ onSelect, onClose, module, factoryId, label, placeholder }: {
  onSelect: (r: Record<string, unknown>) => void;
  onClose:  () => void;
  module?:  DbModule;
  factoryId?: string;
  label?:   string;
  placeholder?: string;
}) {
  const [q, setQ]             = useState('');
  const [dateQ, setDateQ]     = useState('');
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const search = async () => {
    const qTrim = q.trim();
    if (!module || !factoryId || (!qTrim && !dateQ)) return;
    setLoading(true); setError('');
    const res = await DataUseCases.load(module, factoryId, 100);
    setLoading(false);
    if (res.ok) {
      const qL = qTrim.toLowerCase();
      // Search inside itemsJson / employeesJson too — matches item বিবরণ
      // (particulars/paymentTo/remarks) for requisitions, or employee
      // name/ID/designation/department for increments.
      const itemsMatch = (r: Record<string, unknown>): boolean => {
        if (!qL) return false;
        const checkJson = (raw: unknown, fields: string[]): boolean => {
          if (typeof raw !== 'string' || !raw) return false;
          try {
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return false;
            return arr.some((it: Record<string, unknown>) =>
              fields.some(f => String(it?.[f] ?? '').toLowerCase().includes(qL))
            );
          } catch { return false; }
        };
        return (
          checkJson(r.itemsJson,     ['particulars', 'paymentTo', 'remarks']) ||
          checkJson(r.employeesJson, ['employeeName', 'employeeId', 'designation', 'department', 'remarks'])
        );
      };
      // Date filter — matches against any common date field on the record.
      // dateQ is an ISO "YYYY-MM-DD" string from the <input type="date">.
      const dateMatch = (r: Record<string, unknown>): boolean => {
        if (!dateQ) return true;
        const fields = [r.date, r.formDate, r.effectiveDate, r.deliveryDate, r.savedAt];
        return fields.some(v => {
          if (!v) return false;
          const s = String(v);
          // Compare just the date portion (handles both "YYYY-MM-DD" and full ISO timestamps)
          return s.slice(0, 10) === dateQ;
        });
      };
      const textMatch = (r: Record<string, unknown>): boolean => {
        if (!qL) return true;
        return (
          String(r.cardNo ?? '').toLowerCase().includes(qL) ||
          String(r.employeeName ?? '').toLowerCase().includes(qL) ||
          String(r.subject ?? '').toLowerCase().includes(qL) ||
          String(r.id ?? '').toLowerCase().includes(qL) ||
          itemsMatch(r)
        );
      };
      setResults(res.records.filter(r => textMatch(r) && dateMatch(r)).slice(0, 20));
    } else setError(res.error ?? 'লোড ব্যর্থ');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' }}/>
      <div style={{ position: 'relative', background: '#fff', borderRadius: 14, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,.2)', overflow: 'hidden', fontFamily: font }}>
        <div style={{ background: '#1e3a5f', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaSearch/> {label ?? 'রেকর্ড খুঁজুন'}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', color: '#fff' }}><FaTimes/></button>
        </div>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder={placeholder ?? "কার্ড নং বা নাম..."}
              style={{ flex: 1, padding: '7px 11px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontFamily: font, outline: 'none' }}/>
            <div style={{ position: 'relative', width: 140, flexShrink: 0 }}>
              <FaCalendarAlt style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', pointerEvents: 'none' }}/>
              <input type="date" value={dateQ} onChange={e => setDateQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                title="তারিখ দিয়ে খুঁজুন"
                style={{ width: '100%', padding: '7px 9px 7px 26px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: font, outline: 'none', color: dateQ ? '#1e293b' : '#94a3b8', boxSizing: 'border-box' }}/>
            </div>
            <button onClick={search} disabled={loading} style={{ padding: '7px 14px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: font }}>
              {loading ? '...' : 'খুঁজুন'}
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>⚠ {error}</div>}
        </div>
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          {results.length === 0 && q && !loading && (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>কোনো রেকর্ড পাওয়া যায়নি</div>
          )}
          {results.map(rec => {
            const qL = q.trim().toLowerCase();
            // If the query matched an item's particulars/paymentTo/remarks (not the
            // record's own subject/cardNo/employeeName/id), show that item as a hint.
            const directHit =
              String(rec.cardNo ?? '').toLowerCase().includes(qL) ||
              String(rec.employeeName ?? '').toLowerCase().includes(qL) ||
              String(rec.subject ?? '').toLowerCase().includes(qL) ||
              String(rec.id ?? '').toLowerCase().includes(qL);

            let itemHint = '';
            if (!directHit) {
              const findHint = (raw: unknown, fields: string[]): string => {
                if (typeof raw !== 'string' || !raw) return '';
                try {
                  const arr = JSON.parse(raw);
                  if (!Array.isArray(arr)) return '';
                  const hit = arr.find((it: Record<string, unknown>) =>
                    fields.some(f => String(it?.[f] ?? '').toLowerCase().includes(qL))
                  );
                  if (!hit) return '';
                  for (const f of fields) {
                    const v = String(hit[f] ?? '');
                    if (v) return v;
                  }
                  return '';
                } catch { return ''; }
              };
              itemHint = findHint(rec.itemsJson,     ['particulars', 'paymentTo', 'remarks'])
                      || findHint(rec.employeesJson, ['employeeName', 'employeeId', 'designation', 'department', 'remarks']);
            }

            return (
              <button key={String(rec.id)} onClick={() => { onSelect(rec); onClose(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', border: 'none', borderBottom: '1px solid #f8fafc', background: 'transparent', cursor: 'pointer', fontFamily: font, textAlign: 'left' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', flexShrink: 0 }}>
                  <FaEdit style={{ fontSize: 12 }}/>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {String(rec.employeeName ?? rec.fullName ?? rec.subject ?? '—')}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>ID: {String(rec.id)} · Card: {String(rec.cardNo ?? '—')}</div>
                  {itemHint && (
                    <div style={{ fontSize: 11, color: '#059669', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ম্যাচ: {itemHint}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ModuleShell({
  moduleName, moduleNameEn, date, onDateChange,
  steps, activeStep, onStepChange,
  billItems, isBillActive,
  onSave, isSaving, saveDisabled, configured = true, adapterName = 'Database',
  editingId, onCancelEdit, onReset, onUpdate, onUpdateSearch, updateModule, updateLabel, updateSearchPlaceholder,
  children, hideStepNav,
  calcRows, totalRow,
  records = [], isLoading, onLoadRecord, onDeleteRecord, onReload,
  recordBadge, recordLabel,
  auth, onAuthChange,
  onPrint, onPDF, onExcel, onWord,
  lang = 'bn',
}: ShellProps) {
  const factory = useFactory();
  const [saved,            setSaved]           = useState(false);
  const [showUpdate,       setShowUpdate]       = useState(false);
  const [histExpanded,     setHistExpanded]     = useState(true);
  const [expandedBillIdx,  setExpandedBillIdx]  = useState<number | null>(null);

  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  );
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // ── Dynamic height: measures navbar above + footer below, fills the gap ──
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      // Temporarily collapse to 0 so getBoundingClientRect gives true top position
      el.style.height = '0px';

      const top = el.getBoundingClientRect().top; // px from viewport top = navbar height

      // Sum heights of all siblings rendered AFTER this element (within same parent)
      let belowH = 0;
      let sib: Element | null = el.nextElementSibling;
      while (sib) { belowH += sib.getBoundingClientRect().height; sib = sib.nextElementSibling; }

      // Also sum heights of all siblings of the parent rendered AFTER the parent
      sib = el.parentElement?.nextElementSibling ?? null;
      while (sib) { belowH += sib.getBoundingClientRect().height; sib = sib.nextElementSibling; }

      el.style.height = `${window.innerHeight - top - belowH}px`;
    };

    measure();

    // Re-measure on any resize (window or DOM changes like footer toggling)
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const handleSave = async () => {
    if (!onSave) return;
    const ok = await onSave();
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const currentIdx   = steps.findIndex(s => s.id === activeStep);
  const hasPrev      = currentIdx > 0;
  const hasNext      = currentIdx < steps.length - 1;
  const totalBg      = totalRow ? '#0f2442' : undefined;

  return (
    // ── ROOT: height set dynamically by useLayoutEffect — fills navbar→footer gap
    <div ref={rootRef} style={{
      fontFamily: font,
      background: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      // height is injected by the ResizeObserver above — do NOT set it here
    }}>
      <style>{`
        @media print {
          .shell-sidebar { display: none !important; }
          .shell-right   { display: none !important; }
          .shell-header  { background: #fff !important; color: #000 !important; }
          .no-print      { display: none !important; }
          .shell-content { border: none !important; }
        }
        @keyframes shellSpin { to { transform: rotate(360deg); } }
        .shell-hist-row:hover { background: #f0f9ff; }
        .shell-step:hover { background: rgba(255,255,255,.08); }
      `}</style>

      {/* ── ZONE A: Dark header — fixed height, never scrolls ───────────── */}
      <div className="shell-header" style={{
        flexShrink: 0,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', padding: '10px 20px',
        background: '#0f2442', color: '#fff', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase' }}>
            {factory.nameEn}
          </div>
          <div style={{ fontSize: 11, opacity: .65, marginTop: 2 }}>{factory.addressEn}</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 200 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{moduleName}</div>
          {moduleNameEn && <div style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{moduleNameEn}</div>}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: 11, opacity: .65 }}>{lang === 'bn' ? 'তারিখ:' : 'Date:'}</span>
          {onDateChange ? (
            <input type="date" value={date || ''} onChange={e => onDateChange(e.target.value)}
              style={{ background: 'rgba(255,255,255,.12)', border: '0.5px solid rgba(255,255,255,.25)', borderRadius: 6, color: '#fff', fontSize: 12, padding: '3px 8px', outline: 'none', fontFamily: font, cursor: 'pointer' }}/>
          ) : (
            <span style={{ fontSize: 12, borderBottom: '1px solid rgba(255,255,255,.4)', paddingBottom: 1 }}>{date || '—'}</span>
          )}
        </div>
      </div>

      {/* ── ZONE B: Mobile step strip — fixed height, never scrolls ────── */}
      {mobile && (
        <div className="no-print" style={{
          flexShrink: 0,
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '8px 12px', display: 'flex', gap: 6, overflowX: 'auto',
        }}>
          {steps.map((step, i) => {
            const isActive = activeStep === step.id;
            const isDone   = i < currentIdx;
            return (
              <button key={step.id} onClick={() => onStepChange(step.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 20, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: font, flexShrink: 0,
                background: isActive ? '#0f2442' : isDone ? '#dcfce7' : '#f1f5f9',
                color:      isActive ? '#fff'    : isDone ? '#166534' : '#475569',
              }}>
                {isDone && <span style={{ fontSize: 10 }}>✓</span>}
                {step.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── BODY: Three-column grid — fills remaining height exactly ─────── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '176px 1fr 232px',
        overflow: 'hidden',   // ← prevents grid from growing past viewport
        minHeight: 0,         // ← critical for flex children to shrink
      }}>

        {/* ── ZONE B: Left sidebar (desktop) — internal scroll ─────────── */}
        {!mobile && (
          <div className="shell-sidebar no-print" style={{
            background: '#152f50',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,.07)',
            overflow: 'hidden',   // column itself doesn't scroll
            minHeight: 0,
          }}>

            {/* Step label */}
            <div style={{ flexShrink: 0, padding: '14px 14px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)' }}>
              {lang === 'bn' ? 'ফর্ম ধাপ' : 'Form Steps'}
            </div>

            {/* Steps — scrollable if many steps */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {steps.map((step, i) => {
                const isActive = activeStep === step.id;
                const isDone   = i < currentIdx;
                return (
                  <button key={step.id} className="shell-step" onClick={() => onStepChange(step.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 14px', border: 'none', cursor: 'pointer', fontFamily: font,
                    background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
                    borderLeft: `2.5px solid ${isActive ? '#60a5fa' : isDone ? '#34d39888' : 'transparent'}`,
                    color: isActive ? '#fff' : isDone ? '#6ee7b7' : 'rgba(255,255,255,.55)',
                    textAlign: 'left', width: '100%', transition: 'all .12s',
                  }}>
                    <i className={`ti ${step.icon}`} style={{ fontSize: 16, flexShrink: 0 }}/>
                    <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, flex: 1, lineHeight: 1.3 }}>
                      {step.label}
                    </span>
                    {step.fieldCount !== undefined && (
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 10,
                        background: isActive ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.08)',
                        color: isActive ? '#fff' : 'rgba(255,255,255,.4)',
                      }}>
                        {step.fieldCount}
                      </span>
                    )}
                    {isDone && !isActive && <span style={{ fontSize: 11, color: '#34d399' }}>✓</span>}
                  </button>
                );
              })}

              {/* Bill links */}
              {billItems && billItems.length > 0 && (
                <>
                  <div style={{ height: '0.5px', background: 'rgba(255,255,255,.1)', margin: '8px 14px' }}/>
                  <div style={{ padding: '4px 14px 6px', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)' }}>
                    {lang === 'bn' ? 'আউটপুট' : 'Output'}
                  </div>
                  {billItems.map((item, i) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded  = expandedBillIdx === i;
                    return (
                      <div key={i}>
                        <button
                          className="shell-step"
                          onClick={() => {
                            if (hasSubItems) {
                              // Toggle this item's dropdown; collapse others
                              setExpandedBillIdx(isExpanded ? null : i);
                            } else {
                              // No sub-items — navigate directly
                              item.onClick();
                              setExpandedBillIdx(null);
                            }
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 9,
                            padding: '8px 14px', border: 'none', cursor: 'pointer', fontFamily: font,
                            background: isBillActive && isExpanded ? 'rgba(255,255,255,.08)' : 'transparent',
                            borderLeft: '2.5px solid transparent',
                            color: 'rgba(255,255,255,.55)', textAlign: 'left', width: '100%',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <i className="ti ti-file-invoice" style={{ fontSize: 15, flexShrink: 0 }}/>
                            <span style={{ fontSize: 12, fontWeight: 500 }}>{item.label}</span>
                          </span>
                          {hasSubItems && (
                            <span style={{ fontSize: 10, opacity: .6, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▾</span>
                          )}
                        </button>
                        {isExpanded && hasSubItems && (
                          <div style={{ paddingLeft: 14, paddingBottom: 2 }}>
                            {item.subItems!.map((sub, j) => (
                              <button key={j} onClick={() => { sub.onClick(); item.onClick(); }} style={{
                                display: 'block', width: '100%',
                                padding: '4px 10px 4px 24px',
                                border: 'none', cursor: 'pointer', fontFamily: font,
                                background: sub.active ? 'rgba(255,255,255,.15)' : 'transparent',
                                borderLeft: `2px solid ${sub.active ? '#60a5fa' : 'rgba(255,255,255,.2)'}`,
                                color: sub.active ? '#fff' : 'rgba(255,255,255,.45)',
                                fontSize: 11,
                                fontWeight: sub.active ? 700 : 400,
                                textAlign: 'left',
                                borderRadius: '0 4px 4px 0',
                              }}>
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Save / Reset — pinned to bottom, never scrolls away */}
            <div style={{ flexShrink: 0, padding: '12px 10px 14px', display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid rgba(255,255,255,.07)' }}>
              {onSave && (<button onClick={handleSave}
                disabled={!!(isSaving || saveDisabled || !configured)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                  padding: '9px 10px', borderRadius: 8, border: 'none',
                  background: saved ? '#16a34a' : editingId ? '#d97706' : '#2563eb',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  fontFamily: font, opacity: (isSaving || saveDisabled || !configured) ? .55 : 1,
                  transition: 'all .15s',
                }}
                title={!configured ? `${adapterName} কনফিগার নেই` : undefined}
              >
                {isSaving
                  ? <span style={{ animation: 'shellSpin .8s linear infinite', display: 'inline-block' }}>⟳</span>
                  : <FaSave style={{ fontSize: 12 }}/>}
                {saved
                  ? (lang === 'bn' ? '✓ সংরক্ষিত' : '✓ Saved')
                  : isSaving ? '...'
                  : editingId ? (lang === 'bn' ? 'আপডেট করুন' : 'Update')
                  : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save')}
              </button>
              )}
              {onUpdate && (
                <button onClick={() => onUpdateSearch ? onUpdateSearch() : setShowUpdate(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                  padding: '7px 10px', borderRadius: 8,
                  border: '1px solid rgba(245,158,11,.45)',
                  background: 'transparent', color: '#f59e0b',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: font,
                }}>
                  <FaSearch style={{ fontSize: 11 }}/> 
                  {lang === 'bn' ? 'আপডেট সার্চ' : 'Search to update'}
                </button>
              )}
              {onReset && (
                <button onClick={() => { if (window.confirm(lang === 'bn' ? 'রিসেট করবেন?' : 'Reset form?')) onReset(); }} style={{
                  display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                  padding: '7px 10px', borderRadius: 8,
                  border: '1px solid rgba(239,68,68,.3)',
                  background: 'transparent', color: 'rgba(239,68,68,.8)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: font,
                }}>
                  <FaTimes style={{ fontSize: 11 }}/>
                  {lang === 'bn' ? 'রিসেট' : 'Reset'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── ZONE C: Form content — scrolls internally ─────────────────── */}
        <div className="shell-content" style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',   // column clips; inner area scrolls
          minHeight: 0,
        }}>

          {/* Editing banner — fixed, never scrolls */}
          {editingId && (
            <div className="no-print" style={{ flexShrink: 0, background: '#fffbeb', borderBottom: '1.5px solid #fde68a', padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#92400e', fontFamily: font }}>
              <FaEdit style={{ fontSize: 12 }}/>
              <span>{lang === 'bn' ? 'সম্পাদনা মোড —' : 'Editing —'} <strong>{editingId}</strong></span>
              {onCancelEdit && (
                <button onClick={onCancelEdit} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#b45309', fontSize: 12, fontWeight: 600, fontFamily: font, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FaTimes/> {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              )}
            </div>
          )}

          {/* Step heading — fixed, never scrolls */}
          {!isBillActive && currentIdx >= 0 && (
            <div className="no-print" style={{ flexShrink: 0, padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className={`ti ${steps[currentIdx]?.icon}`} style={{ fontSize: 18, color: '#1e3a5f' }}/>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f' }}>{steps[currentIdx]?.label}</span>
              <div style={{ flex: 1, height: 3, background: '#f1f5f9', borderRadius: 2, marginLeft: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentIdx + 1) / steps.length) * 100}%`, background: '#1e40af', borderRadius: 2, transition: 'width .3s ease' }}/>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {currentIdx + 1}/{steps.length}
              </span>
            </div>
          )}

          {/* Tab content — the ONLY scrolling region in Zone C */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0 }}>
            {children}
          </div>

          {/* Prev / Next — fixed at bottom, never scrolls away */}
          {!isBillActive && !hideStepNav && (
            <div className="no-print" style={{ flexShrink: 0, padding: '12px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => hasPrev && onStepChange(steps[currentIdx - 1].id)}
                disabled={!hasPrev}
                style={{ ...S.btn(false, '#475569'), opacity: hasPrev ? 1 : .35 }}
              >
                ← {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              {mobile && onSave && (
                <button onClick={handleSave}
                  disabled={!!(isSaving || saveDisabled || !configured)}
                  style={{ ...S.btn(true, saved ? '#16a34a' : editingId ? '#d97706' : '#1e40af') }}>
                  {isSaving ? '⟳' : <FaSave style={{ fontSize: 11 }}/>}
                  {saved ? (lang === 'bn' ? '✓ সংরক্ষিত' : '✓ Saved') : (lang === 'bn' ? 'সংরক্ষণ' : 'Save')}
                </button>
              )}
              <button
                onClick={() => hasNext && onStepChange(steps[currentIdx + 1].id)}
                disabled={!hasNext}
                style={{ ...S.btn(hasNext, '#1e40af'), opacity: hasNext ? 1 : .35 }}
              >
                {lang === 'bn' ? 'পরবর্তী' : 'Next'} →
              </button>
            </div>
          )}
        </div>

        {/* ── ZONE D + E: Right panel — scrolls internally ──────────────── */}
        {!mobile && (
          <div className="shell-right no-print" style={{
            background: '#f8fafc',
            borderLeft: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 12,
            overflow: 'hidden',   // column clips
            minHeight: 0,
          }}>

            {/* Zone D: Live calculation — fixed height, no scroll */}
            {(calcRows?.length || totalRow) && (
              <div style={{ flexShrink: 0, padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
                  {lang === 'bn' ? 'লাইভ হিসাব' : 'Live Calculation'}
                </div>
                {calcRows?.map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: row.muted ? '#94a3b8' : '#374151' }}>
                    <span style={{ color: '#6b7280' }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                {totalRow && (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 8, padding: '8px 10px', borderRadius: 8,
                    background: totalBg ?? '#0f2442', color: '#fff',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{totalRow.label}</span>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{totalRow.value}</span>
                  </div>
                )}
              </div>
            )}

            {/* Zone E: History — flex-grows and scrolls internally */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
              <div
                style={{ flexShrink: 0, padding: '10px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setHistExpanded(v => !v)}
              >
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#94a3b8' }}>
                  {lang === 'bn' ? 'সংরক্ষিত রেকর্ড' : 'Saved Records'}
                  {records.length > 0 && (
                    <span style={{ marginLeft: 6, background: '#e2e8f0', borderRadius: 10, padding: '1px 6px', fontSize: 10, color: '#475569' }}>{records.length}</span>
                  )}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {onReload && (
                    <button onClick={e => { e.stopPropagation(); onReload(); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }} title={lang === 'bn' ? 'পুনরায় লোড' : 'Reload'}>
                      <FaSyncAlt style={{ fontSize: 11 }}/>
                    </button>
                  )}
                  <FaChevronDown style={{ fontSize: 10, color: '#94a3b8', transform: histExpanded ? 'rotate(180deg)' : 'none', transition: '.15s' }}/>
                </div>
              </div>

              {/* Record list — the ONLY scrolling region in Zone E */}
              {histExpanded && (
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  {isLoading && (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                      <span style={{ animation: 'shellSpin .8s linear infinite', display: 'inline-block' }}>⟳</span>
                    </div>
                  )}
                  {!isLoading && records.length === 0 && (
                    <div style={{ padding: '16px 14px', textAlign: 'center', color: '#cbd5e1', fontSize: 12 }}>
                      <FaDatabase style={{ fontSize: 20, marginBottom: 6, display: 'block', margin: '0 auto 6px' }}/>
                      {lang === 'bn' ? 'কোনো রেকর্ড নেই' : 'No records yet'}
                    </div>
                  )}
                  {records.map(rec => {
                    const isEditing = rec.id === editingId;
                    const name = recordLabel
                      ? recordLabel(rec)
                      : String(rec.employeeName ?? rec.fullName ?? rec.subject ?? rec.id ?? '—');
                    return (
                      <div key={String(rec.id)} className="shell-hist-row" style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 14px', borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isEditing ? '#fffbeb' : undefined,
                        borderLeft: isEditing ? '2.5px solid #f59e0b' : '2.5px solid transparent',
                      }} onClick={() => onLoadRecord?.(rec as unknown as Record<string, unknown>)}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 12, color: isEditing ? '#92400e' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isEditing && '✎ '}{name}
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                            {formatSavedAt(String(rec.savedAt ?? ''))}
                          </div>
                          {recordBadge && (
                            <div style={{ marginTop: 4 }}>{recordBadge(rec)}</div>
                          )}
                        </div>
                        {onDeleteRecord && (
                          <button onClick={e => { e.stopPropagation(); if (window.confirm(lang === 'bn' ? 'মুছবেন?' : 'Delete?')) onDeleteRecord(String(rec.id)); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: 3, flexShrink: 0 }}>
                            <FaTrash style={{ fontSize: 11 }}/>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Output / auth buttons — pinned to bottom, never scrolls away */}
            <div style={{ flexShrink: 0, borderTop: '1px solid #e2e8f0', padding: '10px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
                {lang === 'bn' ? 'অনুমোদন ও প্রিন্ট' : 'Approval & Output'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {auth && onAuthChange && (
                  <div><AuthorityIconButton value={auth} onChange={onAuthChange} lang={lang}/></div>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {onPrint && (
                    <button onClick={onPrint} style={S.iconBtn()}>
                      <FaPrint style={{ fontSize: 11 }}/> 
                      {lang === 'bn' ? 'প্রিন্ট' : 'Print'}
                    </button>
                  )}
                  <ExportMenu onPDF={onPDF} onExcel={onExcel} onWord={onWord} lang={lang}/>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Update modal */}
      {showUpdate && onUpdate && (
        <UpdateModal
          onSelect={rec => onUpdate(rec)}
          onClose={() => setShowUpdate(false)}
          module={updateModule}
          factoryId={factory.id}
          label={updateLabel}
          placeholder={updateSearchPlaceholder}
        />
      )}
    </div>
  );
}