// ─────────────────────────────────────────────────────────────────────────────
// ModuleShell — Global Standard Layout (Design System v2)
// src/components/shell/ModuleShell.tsx
//
// Changes from v1:
//   • Dual theme (Refined Slate / Dark Mode) with localStorage persistence
//   • Dark/light toggle embedded in header
//   • Improved sidebar visual hierarchy — active border, done checkmarks
//   • Updated buttons: primary, warning, danger with WCAG AA contrast
//   • Status pills with dot + label (never color-only)
//   • Border radius: 6px inputs, 8px buttons, 12px cards
//   • Focus rings on all interactive elements (WCAG 2.2)
//   • ARIA labels on all icon-only buttons
//   • Inter font via CSS var, falls back to system-ui
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useRef, useEffect, useLayoutEffect, useCallback,
} from 'react';
import {
  FaSave, FaTimes, FaSearch, FaEdit, FaCalendarAlt,
  FaTrash, FaSyncAlt, FaChevronDown,
  FaFilePdf, FaFileExcel, FaFileWord,
  FaDownload, FaPrint, FaDatabase, FaSun, FaMoon,
} from 'react-icons/fa';
import { useFactory }            from '../../hooks/useFactory';
import AuthorityIconButton       from '../common/AuthorityIconButton';
import type { AuthorizationState } from '../common/AuthorizationBlock';
import { DataUseCases }          from '../../business/DataUseCases';
import type { DbModule, DbRecord } from '../../business/DataUseCases';
import { formatSavedAt }         from '../../utils/dateUtils';

// ── Theme definitions ─────────────────────────────────────────────────────────

interface Theme {
  // Header / sidebar
  headerBg:        string;
  headerText:      string;
  sidebarBg:       string;
  sidebarText:     string;
  sidebarActive:   string;
  sidebarActiveBg: string;
  sidebarBorder:   string;
  sidebarLabel:    string;
  sidebarDone:     string;
  // Content
  pageBg:          string;
  cardBg:          string;
  cardBorder:      string;
  text:            string;
  textSec:         string;
  textMut:         string;
  // Inputs
  inputBg:         string;
  inputBorder:     string;
  inputFocus:      string;
  // Buttons
  btnPri:          string;
  btnPriText:      string;
  btnWarnText:     string;
  btnWarnBorder:   string;
  btnDangerText:   string;
  btnDangerBorder: string;
  btnOutBg:        string;
  btnOutText:      string;
  btnOutBorder:    string;
  // Table
  tblHead:         string;
  tblBorder:       string;
  tblAlt:          string;
  // Status
  success:         { bg: string; brd: string; txt: string; dot: string };
  warning:         { bg: string; brd: string; txt: string; dot: string };
  danger:          { bg: string; brd: string; txt: string; dot: string };
  accent:          { bg: string; brd: string; txt: string; dot: string };
  // Edit banner
  editBg:          string;
  editBorder:      string;
  editText:        string;
  // Calc panel
  calcTotalBg:     string;
  rightBg:         string;
  rightBorder:     string;
  rightLabel:      string;
  // Step heading
  stepText:        string;
  progBg:          string;
  progFill:        string;
}

const LIGHT: Theme = {
  headerBg:        '#0F2442',
  headerText:      '#FFFFFF',
  sidebarBg:       '#112240',
  sidebarText:     'rgba(255,255,255,0.55)',
  sidebarActive:   '#FFFFFF',
  sidebarActiveBg: 'rgba(255,255,255,0.10)',
  sidebarBorder:   '#60A5FA',
  sidebarLabel:    'rgba(255,255,255,0.30)',
  sidebarDone:     '#34D399',
  pageBg:          '#F4F6F9',
  cardBg:          '#FFFFFF',
  cardBorder:      '#E2E8F0',
  text:            '#1A202C',
  textSec:         '#4A5568',
  textMut:         '#94A3B8',
  inputBg:         '#FFFFFF',
  inputBorder:     '#CBD5E1',
  inputFocus:      '#2563EB',
  btnPri:          '#2563EB',
  btnPriText:      '#FFFFFF',
  btnWarnText:     '#92400E',
  btnWarnBorder:   'rgba(217,119,6,0.45)',
  btnDangerText:   'rgba(185,28,28,0.85)',
  btnDangerBorder: 'rgba(220,38,38,0.35)',
  btnOutBg:        '#FFFFFF',
  btnOutText:      '#374151',
  btnOutBorder:    '#E2E8F0',
  tblHead:         '#F1F5F9',
  tblBorder:       '#E2E8F0',
  tblAlt:          '#F8FAFC',
  success: { bg: '#F0FDF4', brd: '#86EFAC', txt: '#166534', dot: '#16A34A' },
  warning: { bg: '#FFFBEB', brd: '#FDE68A', txt: '#92400E', dot: '#D97706' },
  danger:  { bg: '#FEF2F2', brd: '#FECACA', txt: '#991B1B', dot: '#DC2626' },
  accent:  { bg: '#EFF6FF', brd: '#BFDBFE', txt: '#1E40AF', dot: '#2563EB' },
  editBg:      '#FFFBEB',
  editBorder:  '#FDE68A',
  editText:    '#92400E',
  calcTotalBg: '#0F2442',
  rightBg:     '#F8FAFC',
  rightBorder: '#E2E8F0',
  rightLabel:  '#94A3B8',
  stepText:    '#1E3A5F',
  progBg:      '#F1F5F9',
  progFill:    '#1E40AF',
};

const DARK: Theme = {
  headerBg:        '#0A1628',
  headerText:      '#F1F5F9',
  sidebarBg:       '#080F1E',
  sidebarText:     'rgba(241,245,249,0.40)',
  sidebarActive:   '#93C5FD',
  sidebarActiveBg: 'rgba(255,255,255,0.07)',
  sidebarBorder:   '#3B82F6',
  sidebarLabel:    'rgba(241,245,249,0.25)',
  sidebarDone:     '#4ADE80',
  pageBg:          '#0F172A',
  cardBg:          '#1E293B',
  cardBorder:      '#334155',
  text:            '#F1F5F9',
  textSec:         '#94A3B8',
  textMut:         '#64748B',
  inputBg:         '#1E293B',
  inputBorder:     '#334155',
  inputFocus:      '#3B82F6',
  btnPri:          '#3B82F6',
  btnPriText:      '#FFFFFF',
  btnWarnText:     '#FCD34D',
  btnWarnBorder:   'rgba(252,211,77,0.35)',
  btnDangerText:   '#F87171',
  btnDangerBorder: 'rgba(248,113,113,0.30)',
  btnOutBg:        '#1E293B',
  btnOutText:      '#94A3B8',
  btnOutBorder:    '#334155',
  tblHead:         '#162032',
  tblBorder:       '#334155',
  tblAlt:          '#162032',
  success: { bg: '#052E16', brd: 'rgba(74,222,128,0.25)',  txt: '#4ADE80', dot: '#4ADE80' },
  warning: { bg: '#1C1007', brd: 'rgba(252,211,77,0.25)', txt: '#FCD34D', dot: '#FCD34D' },
  danger:  { bg: '#1C0607', brd: 'rgba(248,113,113,0.25)',txt: '#F87171', dot: '#F87171' },
  accent:  { bg: '#1E3A5F', brd: 'rgba(147,197,253,0.2)', txt: '#93C5FD', dot: '#3B82F6' },
  editBg:      '#1C1007',
  editBorder:  'rgba(252,211,77,0.30)',
  editText:    '#FCD34D',
  calcTotalBg: '#0A1628',
  rightBg:     '#162032',
  rightBorder: '#334155',
  rightLabel:  '#64748B',
  stepText:    '#93C5FD',
  progBg:      '#334155',
  progFill:    '#3B82F6',
};

// ── Shared font ───────────────────────────────────────────────────────────────

const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Types (unchanged from v1) ─────────────────────────────────────────────────

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
  isDirty?:       boolean;
  onUpdate?:      (record: Record<string, unknown>) => void;
  onUpdateSearch?: () => void;
  updateModule?:  DbModule;
  updateLabel?:   string;
  updateSearchPlaceholder?: string;

  children:       React.ReactNode;
  hideStepNav?:   boolean;

  calcRows?:      CalcRow[];
  totalRow?:      CalcRow;

  records?:       DbRecord[];
  isLoading?:     boolean;
  onLoadRecord?:  (rec: Record<string, unknown>) => void;
  onDeleteRecord?:(id: string) => Promise<boolean>;
  onReload?:      () => void;
  recordBadge?:   (rec: DbRecord) => React.ReactNode;
  recordLabel?:   (rec: DbRecord) => string;

  auth?:          AuthorizationState;
  onAuthChange?:  (v: AuthorizationState) => void;
  onPrint?:       () => void;
  onPDF?:         () => void;
  onExcel?:       () => void;
  onWord?:        () => void;

  lang?: 'bn' | 'en';
}

// ── Theme hook ────────────────────────────────────────────────────────────────

function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem('rms-theme') === 'dark'; } catch { return false; }
  });

  const toggle = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem('rms-theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  }, []);

  return { isDark, T: isDark ? DARK : LIGHT, toggle };
}

// ── Shared style helpers ──────────────────────────────────────────────────────

function btnBase(T: Theme): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '7px 13px', borderRadius: 8, border: 'none',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    fontFamily: font, whiteSpace: 'nowrap',
    transition: 'opacity .13s, box-shadow .13s',
    outline: 'none',
  };
}

// ── Export dropdown ───────────────────────────────────────────────────────────

function ExportMenu({ onPDF, onExcel, onWord, lang, T }: {
  onPDF?:()=>void; onExcel?:()=>void; onWord?:()=>void; lang: string; T: Theme;
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
    onPDF   && { icon: <FaFilePdf/>,   label: 'PDF',   color: '#DC2626', fn: onPDF   },
    onExcel && { icon: <FaFileExcel/>, label: 'Excel', color: '#16A34A', fn: onExcel },
    onWord  && { icon: <FaFileWord/>,  label: 'Word',  color: '#1D4ED8', fn: onWord  },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; color: string; fn: ()=>void }[];

  if (!items.length) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        aria-label={lang === 'bn' ? 'এক্সপোর্ট মেনু' : 'Export menu'}
        aria-expanded={open}
        style={{
          ...btnBase(T),
          background: T.btnOutBg, color: T.btnOutText,
          outline: `0.5px solid ${T.btnOutBorder}`,
        }}
        onClick={() => setOpen(v => !v)}
      >
        <FaDownload style={{ fontSize: 11 }} aria-hidden="true" />
        {lang === 'bn' ? 'এক্সপোর্ট' : 'Export'}
        <FaChevronDown
          aria-hidden="true"
          style={{ fontSize: 9, transform: open ? 'rotate(180deg)' : 'none', transition: '.15s' }}
        />
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, zIndex: 900,
          background: T.cardBg, border: `0.5px solid ${T.cardBorder}`,
          borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.14)',
          minWidth: 160, padding: 5,
        }}>
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => { it.fn(); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '7px 10px', border: 'none',
                borderRadius: 8, background: 'transparent', cursor: 'pointer',
                fontFamily: font, fontSize: 13, color: T.text,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.tblHead)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: it.color, fontSize: 13 }} aria-hidden="true">{it.icon}</span>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Theme toggle button ───────────────────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      style={{
        width: 40, height: 22, borderRadius: 99,
        background: isDark ? '#3B82F6' : 'rgba(255,255,255,0.18)',
        border: isDark ? '1.5px solid #60A5FA' : '1.5px solid rgba(255,255,255,0.30)',
        display: 'flex', alignItems: 'center', padding: 2,
        cursor: 'pointer', transition: 'background .25s, border-color .25s',
        outline: 'none', flexShrink: 0,
      }}
      onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.45)'}
      onBlur={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: isDark ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform .25s',
        flexShrink: 0,
      }}>
        {isDark
          ? <FaMoon  aria-hidden="true" style={{ fontSize: 9,  color: '#3B82F6' }} />
          : <FaSun   aria-hidden="true" style={{ fontSize: 9,  color: '#F59E0B' }} />
        }
      </div>
    </button>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({
  type, label, T,
}: { type: 'success'|'warning'|'danger'|'accent'; label: string; T: Theme }) {
  const s = T[type];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, padding: '2px 9px', borderRadius: 99,
      background: s.bg, color: s.txt, border: `0.5px solid ${s.brd}`,
      fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} aria-hidden="true" />
      {label}
    </span>
  );
}

// ── Update search modal ───────────────────────────────────────────────────────

function UpdateModal({ onSelect, onClose, module, factoryId, label, placeholder, T }: {
  onSelect: (r: Record<string, unknown>) => void;
  onClose:  () => void;
  module?:  DbModule;
  factoryId?: string;
  label?:   string;
  placeholder?: string;
  T: Theme;
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
      const dateMatch = (r: Record<string, unknown>): boolean => {
        if (!dateQ) return true;
        const fields = [r.date, r.formDate, r.effectiveDate, r.deliveryDate, r.savedAt];
        return fields.some(v => v && String(v).slice(0, 10) === dateQ);
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

  const inp: React.CSSProperties = {
    padding: '7px 11px', border: `1.5px solid ${T.inputBorder}`,
    borderRadius: 7, fontSize: 13, fontFamily: font, outline: 'none',
    background: T.inputBg, color: T.text,
    transition: 'border-color .15s, box-shadow .15s',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label ?? 'রেকর্ড খুঁজুন'}
      style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.48)' }} aria-hidden="true" />
      <div style={{
        position: 'relative', background: T.cardBg, borderRadius: 14,
        width: '100%', maxWidth: 500, border: `0.5px solid ${T.cardBorder}`,
        boxShadow: '0 20px 60px rgba(0,0,0,.22)', overflow: 'hidden', fontFamily: font,
      }}>
        <div style={{ background: T.headerBg, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaSearch aria-hidden="true" /> {label ?? 'রেকর্ড খুঁজুন'}
          </span>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', color: '#fff' }}
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <div style={{ padding: '12px 18px', borderBottom: `0.5px solid ${T.cardBorder}` }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder={placeholder ?? 'কার্ড নং বা নাম...'}
              aria-label="কর্মী খুঁজুন"
              style={{ ...inp, flex: 1 }}
              onFocus={e => { e.currentTarget.style.borderColor = T.inputFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.inputFocus}22`; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <div style={{ position: 'relative', width: 140, flexShrink: 0 }}>
              <FaCalendarAlt aria-hidden="true" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: T.textMut, pointerEvents: 'none' }} />
              <input
                type="date"
                value={dateQ}
                onChange={e => setDateQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                title="তারিখ দিয়ে খুঁজুন"
                aria-label="তারিখ দিয়ে খুঁজুন"
                style={{ ...inp, width: '100%', paddingLeft: 26, boxSizing: 'border-box', color: dateQ ? T.text : T.textMut }}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.inputFocus}22`; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              onClick={search}
              disabled={loading}
              aria-label="খুঁজুন"
              style={{ padding: '7px 14px', background: T.btnPri, color: T.btnPriText, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: font }}
            >
              {loading ? '...' : 'খুঁজুন'}
            </button>
          </div>
          {error && <div role="alert" style={{ fontSize: 12, color: T.danger.txt, marginTop: 6 }}>⚠ {error}</div>}
        </div>

        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          {results.length === 0 && q && !loading && (
            <div style={{ padding: 24, textAlign: 'center', color: T.textMut, fontSize: 13 }}>কোনো রেকর্ড পাওয়া যায়নি</div>
          )}
          {results.map(rec => {
            const name = String(rec.employeeName ?? rec.fullName ?? rec.subject ?? '—');
            return (
              <button
                key={String(rec.id)}
                onClick={() => { onSelect(rec); onClose(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 18px', border: 'none', borderBottom: `0.5px solid ${T.cardBorder}`,
                  background: 'transparent', cursor: 'pointer', fontFamily: font, textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.tblHead}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onFocus={e => e.currentTarget.style.background = T.tblHead}
                onBlur={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: T.accent.bg, border: `1.5px solid ${T.accent.brd}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.accent.dot, flexShrink: 0,
                }} aria-hidden="true">
                  <FaEdit style={{ fontSize: 12 }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ fontSize: 11, color: T.textMut }}>ID: {String(rec.id)} · Card: {String(rec.cardNo ?? '—')}</div>
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
  editingId, onCancelEdit, onReset, isDirty,
  onUpdate, onUpdateSearch, updateModule, updateLabel, updateSearchPlaceholder,
  children, hideStepNav,
  calcRows, totalRow,
  records = [], isLoading, onLoadRecord, onDeleteRecord, onReload,
  recordBadge, recordLabel,
  auth, onAuthChange,
  onPrint, onPDF, onExcel, onWord,
  lang = 'bn',
}: ShellProps) {
  const factory = useFactory();
  const { isDark, T, toggle } = useTheme();

  const [saved,           setSaved]          = useState(false);
  const [showUpdate,      setShowUpdate]      = useState(false);
  const [histExpanded,    setHistExpanded]    = useState(true);
  const [expandedBillIdx, setExpandedBillIdx] = useState<number | null>(null);

  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  );
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Dynamic full-height fill
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      el.style.height = '0px';
      const top = el.getBoundingClientRect().top;
      let belowH = 0;
      let sib: Element | null = el.nextElementSibling;
      while (sib) { belowH += sib.getBoundingClientRect().height; sib = sib.nextElementSibling; }
      sib = el.parentElement?.nextElementSibling ?? null;
      while (sib) { belowH += sib.getBoundingClientRect().height; sib = sib.nextElementSibling; }
      el.style.height = `${window.innerHeight - top - belowH}px`;
    };
    measure();
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

  const currentIdx = steps.findIndex(s => s.id === activeStep);
  const hasPrev    = currentIdx > 0;
  const hasNext    = currentIdx < steps.length - 1;

  // Sidebar button styles
  const sbBtn = (active: boolean, done: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '9px 14px', border: 'none', cursor: 'pointer', fontFamily: font,
    background: active ? T.sidebarActiveBg : 'transparent',
    borderLeft: `2.5px solid ${active ? T.sidebarBorder : done ? T.sidebarDone + '88' : 'transparent'}`,
    color: active ? T.sidebarActive : done ? T.sidebarDone : T.sidebarText,
    textAlign: 'left', width: '100%',
    transition: 'all .12s',
  });

  const actionBtn = (
    bg: string, color: string, border?: string, disabled = false,
  ): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
    padding: '10px 14px',
    borderRadius: 8,
    border: border ? `1px solid ${border}` : 'none',
    background: bg, color,
    fontSize: 12, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: font, opacity: disabled ? 0.52 : 1,
    transition: 'opacity .13s, box-shadow .13s', outline: 'none',
  });

  const outBtn: React.CSSProperties = {
    ...btnBase(T),
    background: T.btnOutBg, color: T.btnOutText,
    outline: `0.5px solid ${T.btnOutBorder}`,
  };

  return (
    <div
      ref={rootRef}
      style={{ fontFamily: font, background: T.pageBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <style>{`
        @media print {
          .shell-sidebar { display: none !important; }
          .shell-right   { display: none !important; }
          .shell-header  { background: #fff !important; color: #000 !important; }
          .no-print      { display: none !important; }
        }
        @keyframes shellSpin { to { transform: rotate(360deg); } }
        .shell-hist-row:hover { background: ${T.tblHead}; }
        .shell-step:hover     { background: rgba(255,255,255,.06); }
        :focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px ${T.inputFocus}33;
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        className="shell-header"
        style={{
          flexShrink: 0,
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', padding: '10px 20px',
          background: T.headerBg, color: T.headerText, gap: 12,
        }}
      >
        {/* Left: factory info */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '.4px', textTransform: 'uppercase', color: T.headerText }}>
            {factory.nameEn}
          </div>
          <div style={{ fontSize: 11, opacity: .6, marginTop: 2, color: T.headerText }}>{factory.addressEn}</div>
        </div>

        {/* Center: module name */}
        <div style={{ textAlign: 'center', minWidth: 200 }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: T.headerText }}>{moduleName}</div>
          {moduleNameEn && <div style={{ fontSize: 11, opacity: .55, marginTop: 2, color: T.headerText }}>{moduleNameEn}</div>}
        </div>

        {/* Right: date + theme toggle + user avatar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <span style={{ fontSize: 11, opacity: .6, color: T.headerText }}>
            {lang === 'bn' ? 'তারিখ:' : 'Date:'}
          </span>
          {onDateChange ? (
            <input
              type="date"
              value={date || ''}
              onChange={e => onDateChange(e.target.value)}
              aria-label={lang === 'bn' ? 'তারিখ পরিবর্তন করুন' : 'Change date'}
              style={{
                background: 'rgba(255,255,255,.12)', border: '0.5px solid rgba(255,255,255,.28)',
                borderRadius: 6, color: '#fff', fontSize: 12, padding: '3px 8px',
                outline: 'none', fontFamily: font, cursor: 'pointer',
              }}
            />
          ) : (
            <span style={{ fontSize: 12, color: T.headerText, borderBottom: '1px solid rgba(255,255,255,.35)', paddingBottom: 1 }}>
              {date || '—'}
            </span>
          )}
          <ThemeToggle isDark={isDark} onToggle={toggle} />
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 500, color: '#fff', cursor: 'pointer',
              border: '1.5px solid rgba(255,255,255,.25)',
            }}
            title="User profile"
          >
            HR
          </div>
        </div>
      </div>

      {/* ── MOBILE STEP STRIP ─────────────────────────────────────────────── */}
      {mobile && (
        <div className="no-print" style={{
          flexShrink: 0, background: T.cardBg,
          borderBottom: `0.5px solid ${T.cardBorder}`,
          padding: '8px 12px', display: 'flex', gap: 6, overflowX: 'auto',
        }}>
          {steps.map((step, i) => {
            const isActive = activeStep === step.id;
            const isDone   = i < currentIdx;
            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                aria-current={isActive ? 'step' : undefined}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 20, border: 'none',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  fontFamily: font, flexShrink: 0, whiteSpace: 'nowrap',
                  background: isActive ? T.headerBg : isDone ? T.success.bg : T.tblHead,
                  color: isActive ? '#fff' : isDone ? T.success.txt : T.textSec,
                }}
              >
                {isDone && <span aria-hidden="true" style={{ fontSize: 10 }}>✓</span>}
                {step.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── BODY GRID ─────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '180px 1fr 236px',
        overflow: 'hidden', minHeight: 0,
      }}>

        {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
        {!mobile && (
          <nav
            className="shell-sidebar no-print"
            aria-label={lang === 'bn' ? 'ফর্ম ধাপ নেভিগেশন' : 'Form step navigation'}
            style={{
              background: T.sidebarBg, display: 'flex', flexDirection: 'column',
              borderRight: `0.5px solid rgba(255,255,255,.06)`,
              overflow: 'hidden', minHeight: 0,
            }}
          >
            <div style={{ flexShrink: 0, padding: '14px 14px 8px', fontSize: 10, fontWeight: 500, letterSpacing: '.07em', textTransform: 'uppercase', color: T.sidebarLabel }}>
              {lang === 'bn' ? 'ফর্ম ধাপ' : 'Form steps'}
            </div>

            {/* Steps */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {steps.map((step, i) => {
                const isActive = activeStep === step.id;
                const isDone   = i < currentIdx;
                return (
                  <button
                    key={step.id}
                    className="shell-step"
                    onClick={() => onStepChange(step.id)}
                    aria-current={isActive ? 'step' : undefined}
                    style={sbBtn(isActive, isDone)}
                  >
                    <i className={`ti ${step.icon}`} style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ fontSize: 12, fontWeight: isActive ? 500 : 400, flex: 1, lineHeight: 1.3 }}>
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
                    {isDone && !isActive && (
                      <span aria-label="সম্পন্ন" style={{ fontSize: 11, color: T.sidebarDone }}>✓</span>
                    )}
                  </button>
                );
              })}

              {/* Bill links */}
              {billItems && billItems.length > 0 && (
                <>
                  <div style={{ height: '.5px', background: 'rgba(255,255,255,.08)', margin: '8px 14px' }} aria-hidden="true" />
                  <div style={{ padding: '4px 14px 6px', fontSize: 10, fontWeight: 500, letterSpacing: '.07em', textTransform: 'uppercase', color: T.sidebarLabel }}>
                    {lang === 'bn' ? 'আউটপুট' : 'Output'}
                  </div>
                  {billItems.map((item, i) => {
                    const hasSub    = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedBillIdx === i;
                    return (
                      <div key={i}>
                        <button
                          className="shell-step"
                          onClick={() => {
                            if (hasSub) setExpandedBillIdx(isExpanded ? null : i);
                            else { item.onClick(); setExpandedBillIdx(null); }
                          }}
                          aria-expanded={hasSub ? isExpanded : undefined}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'space-between',
                            padding: '8px 14px', border: 'none', cursor: 'pointer', fontFamily: font,
                            background: 'transparent', borderLeft: '2.5px solid transparent',
                            color: T.sidebarText, textAlign: 'left', width: '100%',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <i className="ti ti-file-invoice" style={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" />
                            <span style={{ fontSize: 12, fontWeight: 400 }}>{item.label}</span>
                          </span>
                          {hasSub && (
                            <span aria-hidden="true" style={{ fontSize: 10, opacity: .6, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▾</span>
                          )}
                        </button>
                        {isExpanded && hasSub && (
                          <div style={{ paddingLeft: 14, paddingBottom: 2 }}>
                            {item.subItems!.map((sub, j) => (
                              <button key={j} onClick={() => { sub.onClick(); item.onClick(); }} style={{
                                display: 'block', width: '100%',
                                padding: '4px 10px 4px 24px', border: 'none', cursor: 'pointer',
                                fontFamily: font, fontSize: 11, textAlign: 'left',
                                background: sub.active ? 'rgba(255,255,255,.12)' : 'transparent',
                                borderLeft: `2px solid ${sub.active ? T.sidebarBorder : 'rgba(255,255,255,.18)'}`,
                                color: sub.active ? '#fff' : 'rgba(255,255,255,.45)',
                                fontWeight: sub.active ? 500 : 400, borderRadius: '0 4px 4px 0',
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

            {/* Sidebar actions pinned at bottom */}
            <div style={{ flexShrink: 0, padding: '12px 10px 14px', display: 'flex', flexDirection: 'column', gap: 6, borderTop: '0.5px solid rgba(255,255,255,.07)' }}>
              {onSave && (
                <button
                  onClick={handleSave}
                  disabled={!!(isSaving || saveDisabled || !configured)}
                  aria-label={lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save record'}
                  title={!configured ? `${adapterName} কনফিগার নেই` : undefined}
                  style={actionBtn(
                    saved ? '#16A34A' : editingId ? '#D97706' : T.btnPri,
                    '#fff',
                    undefined,
                    !!(isSaving || saveDisabled || !configured),
                  )}
                  onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 3px ${T.sidebarBorder}55`}
                  onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {isSaving
                    ? <span aria-hidden="true" style={{ animation: 'shellSpin .8s linear infinite', display: 'inline-block' }}>⟳</span>
                    : <FaSave aria-hidden="true" style={{ fontSize: 12 }} />}
                  {saved
                    ? (lang === 'bn' ? '✓ সংরক্ষিত' : '✓ Saved')
                    : isSaving ? '...'
                    : editingId ? (lang === 'bn' ? 'আপডেট করুন' : 'Update')
                    : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save')}
                </button>
              )}

              {onUpdate && (
                <button
                  onClick={() => onUpdateSearch ? onUpdateSearch() : setShowUpdate(true)}
                  aria-label={lang === 'bn' ? 'রেকর্ড খুঁজে আপডেট করুন' : 'Search to update'}
                  style={actionBtn('transparent', T.btnWarnText, T.btnWarnBorder)}
                  onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 3px ${T.warning.dot}33`}
                  onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <FaSearch aria-hidden="true" style={{ fontSize: 11 }} />
                  {lang === 'bn' ? 'আপডেট সার্চ' : 'Search to update'}
                </button>
              )}

              {onReset && (
                <button
                  onClick={() => {
                    if (!isDirty || window.confirm(lang === 'bn' ? 'রিসেট করবেন?' : 'Reset form?')) onReset();
                  }}
                  aria-label={lang === 'bn' ? 'ফর্ম রিসেট করুন' : 'Reset form'}
                  style={actionBtn('transparent', T.btnDangerText, T.btnDangerBorder)}
                  onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 3px ${T.danger.dot}33`}
                  onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <FaTimes aria-hidden="true" style={{ fontSize: 11 }} />
                  {lang === 'bn' ? 'রিসেট' : 'Reset'}
                </button>
              )}
            </div>
          </nav>
        )}

        {/* ── FORM CONTENT ──────────────────────────────────────────────── */}
        <main
          className="shell-content"
          style={{ background: T.cardBg, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
        >
          {/* Edit mode banner */}
          {editingId && (
            <div
              role="status"
              className="no-print"
              style={{
                flexShrink: 0, background: T.editBg,
                borderBottom: `1.5px solid ${T.editBorder}`,
                padding: '6px 20px', display: 'flex', alignItems: 'center',
                gap: 8, fontSize: 12, color: T.editText, fontFamily: font,
              }}
            >
              <FaEdit aria-hidden="true" style={{ fontSize: 12 }} />
              <span>{lang === 'bn' ? 'সম্পাদনা মোড —' : 'Editing —'} <strong>{editingId}</strong></span>
              {onCancelEdit && (
                <button
                  onClick={onCancelEdit}
                  aria-label={lang === 'bn' ? 'সম্পাদনা বাতিল করুন' : 'Cancel editing'}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T.editText, fontSize: 12, fontWeight: 500, fontFamily: font, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <FaTimes aria-hidden="true" /> {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              )}
            </div>
          )}

          {/* Step heading + progress bar */}
          {!isBillActive && currentIdx >= 0 && (
            <div className="no-print" style={{ flexShrink: 0, padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className={`ti ${steps[currentIdx]?.icon}`} style={{ fontSize: 18, color: T.stepText }} aria-hidden="true" />
              <span style={{ fontSize: 15, fontWeight: 500, color: T.stepText }}>{steps[currentIdx]?.label}</span>
              <div
                role="progressbar"
                aria-valuenow={currentIdx + 1}
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-label={`Step ${currentIdx + 1} of ${steps.length}`}
                style={{ flex: 1, height: 3, background: T.progBg, borderRadius: 2, marginLeft: 8, overflow: 'hidden' }}
              >
                <div style={{ height: '100%', width: `${((currentIdx + 1) / steps.length) * 100}%`, background: T.progFill, borderRadius: 2, transition: 'width .3s ease' }} />
              </div>
              <span style={{ fontSize: 11, color: T.textMut, whiteSpace: 'nowrap' }}>
                {currentIdx + 1}/{steps.length}
              </span>
            </div>
          )}

          {/* Tab content — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0 }}>
            {children}
          </div>

          {/* Prev / Next footer */}
          {!isBillActive && !hideStepNav && (
            <div
              className="no-print"
              style={{
                flexShrink: 0, padding: '10px 20px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: `0.5px solid ${T.cardBorder}`,
              }}
            >
              <button
                onClick={() => hasPrev && onStepChange(steps[currentIdx - 1].id)}
                disabled={!hasPrev}
                aria-label={lang === 'bn' ? 'পূর্ববর্তী ধাপ' : 'Previous step'}
                style={{ ...outBtn, opacity: hasPrev ? 1 : .35 }}
              >
                ← {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
              </button>

              {mobile && onSave && (
                <button
                  onClick={handleSave}
                  disabled={!!(isSaving || saveDisabled || !configured)}
                  style={{
                    ...btnBase(T),
                    background: saved ? '#16A34A' : editingId ? '#D97706' : T.btnPri,
                    color: T.btnPriText,
                  }}
                >
                  {isSaving ? '⟳' : <FaSave aria-hidden="true" style={{ fontSize: 11 }} />}
                  {saved ? (lang === 'bn' ? '✓ সংরক্ষিত' : '✓ Saved') : (lang === 'bn' ? 'সংরক্ষণ' : 'Save')}
                </button>
              )}

              <button
                onClick={() => hasNext && onStepChange(steps[currentIdx + 1].id)}
                disabled={!hasNext}
                aria-label={lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next step'}
                style={{
                  ...outBtn, opacity: hasNext ? 1 : .35,
                  background: hasNext ? T.btnPri : T.btnOutBg,
                  color: hasNext ? T.btnPriText : T.btnOutText,
                  outline: hasNext ? 'none' : `0.5px solid ${T.btnOutBorder}`,
                }}
              >
                {lang === 'bn' ? 'পরবর্তী' : 'Next'} →
              </button>
            </div>
          )}
        </main>

        {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
        {!mobile && (
          <aside
            className="shell-right no-print"
            aria-label={lang === 'bn' ? 'হিসাব ও রেকর্ড প্যানেল' : 'Calculation and records panel'}
            style={{
              background: T.rightBg, borderLeft: `0.5px solid ${T.rightBorder}`,
              display: 'flex', flexDirection: 'column', fontSize: 12,
              overflow: 'hidden', minHeight: 0,
            }}
          >
            {/* Live calculation */}
            {(calcRows?.length || totalRow) && (
              <div style={{ flexShrink: 0, padding: '12px 14px', borderBottom: `0.5px solid ${T.rightBorder}` }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.07em', textTransform: 'uppercase', color: T.rightLabel, marginBottom: 10 }}>
                  {lang === 'bn' ? 'লাইভ হিসাব' : 'Live calculation'}
                </div>
                {calcRows?.map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: row.muted ? T.textMut : T.textSec }}>
                    <span style={{ color: T.textMut }}>{row.label}</span>
                    <span style={{ fontWeight: 500, color: T.text }}>{row.value}</span>
                  </div>
                ))}
                {totalRow && (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 8, padding: '8px 10px', borderRadius: 8,
                    background: T.calcTotalBg, color: '#fff',
                  }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{totalRow.label}</span>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{totalRow.value}</span>
                  </div>
                )}
              </div>
            )}

            {/* Saved records */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
              <div
                style={{ flexShrink: 0, padding: '10px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setHistExpanded(v => !v)}
                role="button"
                tabIndex={0}
                aria-expanded={histExpanded}
                onKeyDown={e => e.key === 'Enter' && setHistExpanded(v => !v)}
              >
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.07em', textTransform: 'uppercase', color: T.rightLabel }}>
                  {lang === 'bn' ? 'সংরক্ষিত রেকর্ড' : 'Saved records'}
                  {records.length > 0 && (
                    <span style={{ marginLeft: 6, background: T.tblHead, borderRadius: 10, padding: '1px 6px', fontSize: 10, color: T.textSec }}>
                      {records.length}
                    </span>
                  )}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {onReload && (
                    <button
                      onClick={e => { e.stopPropagation(); onReload(); }}
                      aria-label={lang === 'bn' ? 'পুনরায় লোড করুন' : 'Reload records'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, padding: 2 }}
                    >
                      <FaSyncAlt aria-hidden="true" style={{ fontSize: 11 }} />
                    </button>
                  )}
                  <FaChevronDown aria-hidden="true" style={{ fontSize: 10, color: T.textMut, transform: histExpanded ? 'rotate(180deg)' : 'none', transition: '.15s' }} />
                </div>
              </div>

              {histExpanded && (
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  {isLoading && (
                    <div style={{ padding: 16, textAlign: 'center', color: T.textMut }} role="status" aria-label="লোড হচ্ছে">
                      <span aria-hidden="true" style={{ animation: 'shellSpin .8s linear infinite', display: 'inline-block' }}>⟳</span>
                    </div>
                  )}
                  {!isLoading && records.length === 0 && (
                    <div style={{ padding: '16px 14px', textAlign: 'center', color: T.textMut, fontSize: 12 }}>
                      <FaDatabase aria-hidden="true" style={{ fontSize: 20, marginBottom: 6, display: 'block', margin: '0 auto 6px' }} />
                      {lang === 'bn' ? 'কোনো রেকর্ড নেই' : 'No records yet'}
                    </div>
                  )}
                  {records.map(rec => {
                    const isEditing = rec.id === editingId;
                    const name = recordLabel
                      ? recordLabel(rec)
                      : String(rec.employeeName ?? rec.fullName ?? rec.subject ?? rec.id ?? '—');
                    return (
                      <div
                        key={String(rec.id)}
                        className="shell-hist-row"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 14px', borderBottom: `0.5px solid ${T.rightBorder}`,
                          cursor: 'pointer',
                          background: isEditing ? T.editBg : undefined,
                          borderLeft: isEditing ? `2.5px solid ${T.warning.dot}` : '2.5px solid transparent',
                        }}
                        onClick={() => onLoadRecord?.(rec as unknown as Record<string, unknown>)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${lang === 'bn' ? 'রেকর্ড লোড করুন' : 'Load record'}: ${name}`}
                        onKeyDown={e => e.key === 'Enter' && onLoadRecord?.(rec as unknown as Record<string, unknown>)}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 12, color: isEditing ? T.editText : T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isEditing && <span aria-label="সম্পাদনা হচ্ছে">✎ </span>}{name}
                          </div>
                          <div style={{ fontSize: 10, color: T.textMut, marginTop: 1 }}>
                            {formatSavedAt(String(rec.savedAt ?? ''))}
                          </div>
                          {recordBadge && <div style={{ marginTop: 4 }}>{recordBadge(rec)}</div>}
                        </div>
                        {onDeleteRecord && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (window.confirm(lang === 'bn' ? 'মুছবেন?' : 'Delete?'))
                                onDeleteRecord(String(rec.id));
                            }}
                            aria-label={`${lang === 'bn' ? 'মুছুন' : 'Delete'}: ${name}`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger.dot, padding: 3, flexShrink: 0 }}
                          >
                            <FaTrash aria-hidden="true" style={{ fontSize: 11 }} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Output / approval buttons */}
            <div style={{ flexShrink: 0, borderTop: `0.5px solid ${T.rightBorder}`, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.07em', textTransform: 'uppercase', color: T.rightLabel, marginBottom: 8 }}>
                {lang === 'bn' ? 'অনুমোদন ও প্রিন্ট' : 'Approval and output'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {auth && onAuthChange && (
                  <div><AuthorityIconButton value={auth} onChange={onAuthChange} lang={lang} /></div>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {onPrint && (
                    <button
                      onClick={onPrint}
                      aria-label={lang === 'bn' ? 'প্রিন্ট করুন' : 'Print'}
                      style={outBtn}
                    >
                      <FaPrint aria-hidden="true" style={{ fontSize: 11 }} />
                      {lang === 'bn' ? 'প্রিন্ট' : 'Print'}
                    </button>
                  )}
                  <ExportMenu onPDF={onPDF} onExcel={onExcel} onWord={onWord} lang={lang} T={T} />
                </div>
              </div>
            </div>
          </aside>
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
          T={T}
        />
      )}
    </div>
  );
}