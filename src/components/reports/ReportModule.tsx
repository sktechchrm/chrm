// ─────────────────────────────────────────────────────────────────────────────
// REPORT MODULE  v3
//
//  Dashboard  →  module cards with live record counts (security-filtered)
//  Table view →  ALL columns auto-discovered from real DB records (not
//                just the ReportConfig curated subset). Config columns are
//                used first, then any extra DB fields appended automatically.
//  Detail modal → ALL fields from the record, formatted, with individual print.
//  Per-module filter bar from ReportConfig.filters.
//  Export: Excel (all columns) | Word | Print (all).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FaFilter, FaSearch, FaFileExcel, FaFileWord, FaPrint,
  FaSort, FaSortUp, FaSortDown, FaTimes, FaSync, FaChevronLeft,
  FaChevronRight, FaArrowLeft, FaExternalLinkAlt,
} from 'react-icons/fa';
import { REPORT_CONFIGS, getReportConfig, formatDate, formatCurrency } from './ReportConfig';
import { DataUseCases } from '../../business/DataUseCases';
import type { DbRecord, DbModule } from '../../business/DataUseCases';
import { useFactory }   from '../../hooks/useFactory';
import { useAuth }      from '../../context/AuthContext';
import { useSecurity }  from '../../security';
import { exportToExcel } from '../../utils/excelExport';
import ModuleHeader     from '../common/ModuleHeader';
import { apiGet as grievanceApiGet } from '../grievance/shared/api';
import { FLOW_STEPS, STATUS_COLORS, URGENCY_COLORS } from '../grievance/shared/constants';
import type { Grievance } from '../grievance/shared/types';

// ── ID mappings ───────────────────────────────────────────────────────────────
const DB_TO_SECURITY: Record<string, string> = {
  employees: 'personalfile', settlements: 'settlement', maternity: 'maternity',
  leftnotice: 'leftnotice', requisitions: 'requisition', increments: 'increment',
  meetings: 'meeting',
  grievance: 'grievance',   // ← separate GAS endpoint, not DbModule
};
export const DB_TO_PAGE: Record<string, string> = {
  employees: 'personalfile', settlements: 'settlement', maternity: 'maternity',
  leftnotice: 'leftnotice', requisitions: 'requisition', increments: 'increment',
  meetings: 'meeting',
  grievance: 'grievance',
};

/** Virtual module key for grievance (not a real DbModule — own GAS endpoint) */
const GRV = 'grievance' as const;
type ModuleKey = DbModule | typeof GRV;

const SKIP_KEYS = new Set(['factoryId']);  // hide from display
const PAGE_SIZES = [10, 25, 50, 100];

// ── Grievance virtual config ──────────────────────────────────────────────────
// Grievance lives in its own GAS endpoint — not in DbModule. We treat it as a
// virtual module with its own fetch, columns, and filters.
const GRIEVANCE_CONFIG = {
  module:  GRV,
  labelBn: 'কর্মী অভিযোগ',
  labelEn: 'Employee Grievance',
  icon:    '🎧',
};

const GRIEVANCE_COLUMNS = [
  { key: 'ID',          label: 'কেস আইডি',      format: undefined as ((v:string)=>string)|undefined, badgeMap: undefined as Record<string,{bg:string;text:string}>|undefined },
  { key: 'SubmittedAt', label: 'দাখিলের তারিখ',  format: (v:string) => formatDate(v),                badgeMap: undefined },
  { key: 'Name',        label: 'কর্মীর নাম',      format: undefined,                                   badgeMap: undefined },
  { key: 'EmployeeID',  label: 'কর্মী আইডি',      format: undefined,                                   badgeMap: undefined },
  { key: 'Department',  label: 'বিভাগ',            format: undefined,                                   badgeMap: undefined },
  { key: 'Category',    label: 'ধরন',              format: undefined,                                   badgeMap: undefined },
  { key: 'Urgency',     label: 'জরুরিত্ব',        format: undefined,
    badgeMap: Object.fromEntries(
      Object.entries(URGENCY_COLORS).map(([k, v]) => [k, { bg: v.bg, text: v.text }])
    ) as Record<string,{bg:string;text:string}>,
  },
  { key: 'Status',      label: 'স্ট্যাটাস',        format: undefined,
    badgeMap: Object.fromEntries(
      Object.entries(STATUS_COLORS).map(([k, v]) => [k, { bg: v + '18', text: v }])
    ) as Record<string,{bg:string;text:string}>,
  },
  { key: 'Description', label: 'বিবরণ',            format: undefined, badgeMap: undefined },
  { key: 'UpdatedAt',   label: 'আপডেট তারিখ',     format: (v:string) => formatDate(v), badgeMap: undefined },
];

const GRIEVANCE_FILTERS = [
  { key: 'Name',       label: 'কর্মীর নাম',   type: 'text'   as const },
  { key: 'Department', label: 'বিভাগ',          type: 'text'   as const },
  { key: 'Category',   label: 'ধরন',            type: 'text'   as const },
  { key: 'Status',     label: 'স্ট্যাটাস',      type: 'select' as const,
    options: FLOW_STEPS.map(s => ({ value: s.status, label: s.label })) },
  { key: 'Urgency',    label: 'জরুরিত্ব',       type: 'select' as const,
    options: ['জরুরি','বেশি','মাঝারি','কম'].map(u => ({ value: u, label: u })) },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format any DB value for display */
function fmtVal(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—';
  const s = String(val);
  // Date-like
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return formatDate(s);
  // Currency-like field names handled via column config
  return s;
}

/** Generate a human-readable label from a camelCase/snake_case key */
function keyToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

/**
 * Build the full column list for a module:
 *   1. Curated columns from ReportConfig (in order, with format/badge info)
 *   2. Any extra keys from actual DB records not already covered
 */
function buildColumns(
  moduleKey: string,
  sampleRecord: DbRecord | undefined,
): { key: string; label: string; format?: (v: string) => string; badgeMap?: Record<string, { bg: string; text: string }> }[] {
  const cfg = getReportConfig(moduleKey);
  const curated = (cfg?.columns ?? []).map(c => ({
    key: c.key, label: c.label,
    format: c.format,
    badgeMap: c.badgeMap,
  }));
  const curatedKeys = new Set(curated.map(c => c.key));

  // Extra keys from real record
  const extra: typeof curated = [];
  if (sampleRecord) {
    Object.keys(sampleRecord).forEach(k => {
      if (!curatedKeys.has(k) && !SKIP_KEYS.has(k)) {
    extra.push({ key: k, label: keyToLabel(k), format: undefined, badgeMap: undefined });
      }
    });
  }
  return [...curated, ...extra];
}

// ── Badge component ───────────────────────────────────────────────────────────
function Badge({ value, badgeMap }: {
  value: string;
  badgeMap?: Record<string, { bg: string; text: string }>;
}) {
  const s = badgeMap?.[value];
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      background: s?.bg ?? '#f3f4f6', color: s?.text ?? '#374151' }}>
      {value || '—'}
    </span>
  );
}

// ── Individual record print ───────────────────────────────────────────────────
function printRecord(record: DbRecord, moduleKey: string, columns: ReturnType<typeof buildColumns>, factoryName: string) {
  const rows = columns
    .filter(c => !SKIP_KEYS.has(c.key))
    .map(c => {
      const raw = record[c.key];
      const val = c.format ? c.format(String(raw ?? '')) : fmtVal(raw);
      return `<tr>
        <td style="padding:7px 12px;border:1px solid #e2e8f0;font-size:12px;
          font-weight:600;color:#374151;width:40%;background:#f8fafc">${c.label}</td>
        <td style="padding:7px 12px;border:1px solid #e2e8f0;font-size:12px;
          color:#1e293b">${val}</td>
      </tr>`;
    }).join('');

  const cfg    = getReportConfig(moduleKey);
  const html   = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      @page { size: A4 portrait; margin: 14mm 16mm; }
      body  { font-family: 'Noto Sans Bengali', Arial, sans-serif; margin: 0; color: #1e293b; }
      .hdr  { border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 14px; }
      .factory { font-size: 16px; font-weight: 700; color: #1e3a5f; }
      .modname  { font-size: 12px; color: #64748b; margin-top: 3px; }
      .rid  { font-size: 18px; font-weight: 800; color: #1e3a5f; margin: 10px 0 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      .footer { margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 8px;
        font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
    </style>
    </head><body>
    <div class="hdr">
      <div class="factory">${factoryName}</div>
      <div class="modname">${cfg?.labelBn ?? moduleKey} — রেকর্ড বিবরণ</div>
    </div>
    <div class="rid">${record.id}</div>
    <table>${rows}</table>
    <div class="footer">
      <span>${factoryName}</span>
      <span>RMS V16 · ${new Date().toLocaleDateString('en-GB')}</span>
    </div>
    </body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;border:none;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open(); doc.write(html); doc.close();
  iframe.onload = () => {
    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();
    setTimeout(() => document.body.removeChild(iframe), 1500);
  };
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function DetailModal({ record, moduleKey, columns, factoryName, onClose, onOpenModule }: {
  record:        DbRecord;
  moduleKey:     string;
  columns:       ReturnType<typeof buildColumns>;
  factoryName:   string;
  onClose:       () => void;
  onOpenModule?: () => void;
}) {
  const cfg = getReportConfig(moduleKey);
  const detailCols = columns.filter(c => !SKIP_KEYS.has(c.key));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 680,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>

        {/* Header */}
        <div style={{ background: '#1e3a5f', color: '#fff', padding: '14px 18px',
          borderRadius: '14px 14px 0 0', flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, opacity: .55, marginBottom: 2,
              textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {cfg?.labelBn ?? moduleKey}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{record.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Individual print */}
            <button onClick={() => printRecord(record, moduleKey, columns, factoryName)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                border: '1px solid rgba(255,255,255,.3)', borderRadius: 7,
                background: 'rgba(255,255,255,.1)', color: '#fff', cursor: 'pointer',
                fontSize: 12, fontFamily: 'inherit' }}>
              <FaPrint style={{ fontSize: 11 }}/> প্রিন্ট
            </button>
            {onOpenModule && (
              <button onClick={onOpenModule}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                  border: '1px solid rgba(255,255,255,.3)', borderRadius: 7,
                  background: 'rgba(255,255,255,.1)', color: '#fff', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'inherit' }}>
                <FaExternalLinkAlt style={{ fontSize: 10 }}/> মডিউলে খুলুন
              </button>
            )}
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 6,
                padding: '6px 9px', color: '#fff', cursor: 'pointer', lineHeight: 1 }}>
              <FaTimes style={{ fontSize: 14 }}/>
            </button>
          </div>
        </div>

        {/* Scrollable body — ALL fields */}
        <div style={{ overflowY: 'auto', padding: '16px 18px', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {detailCols.map((col, i) => {
                const raw = record[col.key];
                const val = col.badgeMap
                  ? <Badge value={String(raw ?? '')} badgeMap={col.badgeMap}/>
                  : <span>{col.format ? col.format(String(raw ?? '')) : fmtVal(raw)}</span>;
                return (
                  <tr key={col.key} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#64748b',
                      fontSize: 11, width: '38%', borderBottom: '1px solid #f1f5f9',
                      textTransform: 'uppercase', letterSpacing: '.03em' }}>
                      {col.label}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#1e293b',
                      borderBottom: '1px solid #f1f5f9', wordBreak: 'break-word' }}>
                      {val}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Meta */}
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#f0f9ff',
            borderRadius: 8, fontSize: 11, color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>সংরক্ষণকারী: <strong>{record.savedBy || '—'}</strong></span>
            <span>তারিখ: <strong>{formatDate(record.savedAt)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReportModule({
  onNavigateToModule,
}: {
  onNavigateToModule?: (module: string, record?: DbRecord) => void;
}) {
  const factory    = useFactory();
  const { user: _user } = useAuth();
  const security   = useSecurity();
  const configured = DataUseCases.isConfigured(factory.id);

  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);
  const [allRecords,   setAllRecords]   = useState<Record<string, DbRecord[]>>({});
  const [loadingMods,  setLoadingMods]  = useState<Record<string, boolean>>({});
  const [errorMods,    setErrorMods]    = useState<Record<string, string>>({});

  // Grievance — own GAS endpoint, stored separately
  const [grievances,     setGrievances]     = useState<Grievance[]>([]);
  const [grievanceLoad,  setGrievanceLoad]  = useState(false);
  const [grievanceError, setGrievanceError] = useState('');

  // Table state
  const [search,       setSearch]       = useState('');
  const [dateStart,    setDateStart]    = useState('');
  const [dateEnd,      setDateEnd]      = useState('');
  const [fieldFilters, setFieldFilters] = useState<Record<string, string>>({});
  const [sortState,    setSortState]    = useState<{ key: string; dir: 'asc'|'desc' }>({ key: 'savedAt', dir: 'desc' });
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(25);
  const [detail,       setDetail]       = useState<DbRecord | null>(null);

  // Security-filtered configs (RMS modules)
  const visibleConfigs = useMemo(() =>
    REPORT_CONFIGS.filter(cfg => {
      const secId = DB_TO_SECURITY[cfg.module];
      return secId ? security.module(secId).allowed : true;
    }),
  [security]);

  // Whether grievance card should show
  const showGrievance = security.module('grievance').allowed;

  // Load grievances from own GAS endpoint
  const loadGrievances = useCallback(async () => {
    if (grievances.length > 0) return;        // already cached
    setGrievanceLoad(true); setGrievanceError('');
    try {
      const res = await grievanceApiGet({ action: 'getAll' });
      if (res.success && Array.isArray(res.data)) {
        setGrievances(res.data as Grievance[]);
      } else {
        setGrievanceError('ডেটা লোড ব্যর্থ');
      }
    } catch { setGrievanceError('নেটওয়ার্ক ত্রুটি'); }
    setGrievanceLoad(false);
  }, [grievances.length]);

  const reloadGrievances = useCallback(async () => {
    setGrievances([]);
    setGrievanceLoad(true); setGrievanceError('');
    try {
      const res = await grievanceApiGet({ action: 'getAll' });
      if (res.success && Array.isArray(res.data)) setGrievances(res.data as Grievance[]);
      else setGrievanceError('ডেটা লোড ব্যর্থ');
    } catch { setGrievanceError('নেটওয়ার্ক ত্রুটি'); }
    setGrievanceLoad(false);
  }, []);

  // Active records — DbModule from cache OR grievance from own state
  const isGrievanceActive = activeModule === GRV;
  const activeRecords: DbRecord[] = isGrievanceActive
    ? grievances.map(g => ({
        id: g.ID, savedAt: g.SubmittedAt ?? '', savedBy: g.EmployeeID ?? '', factoryId: '',
        ID: g.ID, Name: g.Name, EmployeeID: g.EmployeeID, Department: g.Department,
        Category: g.Category, Description: g.Description, Urgency: g.Urgency,
        Status: g.Status, SubmittedAt: g.SubmittedAt, UpdatedAt: g.UpdatedAt,
      } as DbRecord))
    : (activeModule ? (allRecords[activeModule] ?? []) : []);

  const columns = useMemo(() => {
    if (!activeModule) return [];
    if (isGrievanceActive) return GRIEVANCE_COLUMNS;
    const sample = activeRecords[0];
    return buildColumns(activeModule as string, sample);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, isGrievanceActive, activeRecords.length]);

  // Load one module (no infinite loop — allRecords not in deps)
  const loadModule = useCallback(async (mod: DbModule) => {
    if (!configured) return;
    let alreadyLoaded = false;
    setAllRecords(prev => { alreadyLoaded = !!prev[mod]; return prev; });
    if (alreadyLoaded) return;
    setLoadingMods(s => ({ ...s, [mod]: true }));
    setErrorMods(s => ({ ...s, [mod]: '' }));
    const result = await DataUseCases.load(mod, factory.id, 1000);
    setLoadingMods(s => ({ ...s, [mod]: false }));
    if (result.ok) setAllRecords(s => ({ ...s, [mod]: result.records }));
    else setErrorMods(s => ({ ...s, [mod]: result.error ?? 'লোড ব্যর্থ' }));
  }, [configured, factory.id]);

  // Load all visible modules on mount for counts
  useEffect(() => {
    if (!configured) return;
    visibleConfigs.forEach(cfg => loadModule(cfg.module as DbModule));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, factory.id]);

  // Load grievance count on mount
  useEffect(() => {
    if (showGrievance) loadGrievances();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrievance]);

  // When drilling into a module, also load it and reset table state
  useEffect(() => {
    if (activeModule) {
      if (activeModule === GRV) {
        loadGrievances();
      } else {
        loadModule(activeModule as DbModule);
      }
      setSearch(''); setDateStart(''); setDateEnd('');
      setFieldFilters({}); setPage(1);
      setSortState({ key: 'savedAt', dir: 'desc' });
    }
  }, [activeModule, loadModule, loadGrievances]);

  // Force-reload a module
  const reloadModule = useCallback((mod: DbModule) => {
    setAllRecords(s => { const n = { ...s }; delete n[mod]; return n; });
    setLoadingMods(s => ({ ...s, [mod]: true }));
    DataUseCases.load(mod, factory.id, 1000).then(result => {
      setLoadingMods(s => ({ ...s, [mod]: false }));
      if (result.ok) setAllRecords(s => ({ ...s, [mod]: result.records }));
      else setErrorMods(s => ({ ...s, [mod]: result.error ?? 'লোড ব্যর্থ' }));
    });
  }, [factory.id]);

  // Filter + sort
  const filteredRecords = useMemo(() => {
    if (!activeModule) return [];
    let rows = [...activeRecords];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r =>
        Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q))
      );
    }

    const cfg = isGrievanceActive ? null : getReportConfig(activeModule as DbModule);
    const dateKey = isGrievanceActive ? 'SubmittedAt'
      : (cfg?.columns.find(c => c.type === 'date' && c.key !== 'savedAt')?.key ?? 'savedAt');
    if (dateStart) rows = rows.filter(r => r[dateKey] && String(r[dateKey]) >= dateStart);
    if (dateEnd)   rows = rows.filter(r => r[dateKey] && String(r[dateKey]) <= dateEnd);

    Object.entries(fieldFilters).forEach(([k, v]) => {
      if (!v) return;
      rows = rows.filter(r => String(r[k] ?? '').toLowerCase().includes(v.toLowerCase()));
    });

    if (sortState.key) {
      rows.sort((a, b) => {
        const av = String(a[sortState.key] ?? '');
        const bv = String(b[sortState.key] ?? '');
        const cmp = av.localeCompare(bv, 'bn', { numeric: true });
        return sortState.dir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [activeModule, activeRecords, search, dateStart, dateEnd, fieldFilters, sortState]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pageRows   = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    setSortState(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExcel = async () => {
    if (!activeModule) return;
    const cfg = getReportConfig(activeModule);
    await exportToExcel({
      filename:  `${cfg?.labelEn ?? activeModule}_${new Date().toISOString().slice(0, 10)}`,
      sheetName: cfg?.labelEn ?? activeModule,
      headerInfo: [
        { label: 'Factory', value: factory.nameEn || factory.nameBn },
        { label: 'Module',  value: cfg?.labelEn ?? activeModule },
        { label: 'Records', value: String(filteredRecords.length) },
        { label: 'Exported',value: new Date().toLocaleString() },
      ],
      sections: [{
        title:   cfg?.labelEn ?? activeModule,
        columns: columns.filter(c => !SKIP_KEYS.has(c.key)).map(c => ({ key: c.key, header: c.label })),
        rows: filteredRecords as unknown as Record<string, string | number | null | undefined>[],
      }],
    });
  };

  const handleWord = () => {
    if (!activeModule) return;
    const cfg  = getReportConfig(activeModule);
    const cols = columns.filter(c => !SKIP_KEYS.has(c.key));
    const hdr  = cols.map(c => `<th style="background:#1e3a5f;color:#fff;padding:7px 10px;border:1px solid #ccc;font-size:11px">${c.label}</th>`).join('');
    const body = filteredRecords.map((rec, i) =>
      `<tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">${cols.map(c =>
        `<td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:11px">${
          c.format ? c.format(String(rec[c.key] ?? '')) : fmtVal(rec[c.key])
        }</td>`
      ).join('')}</tr>`
    ).join('');
    const html = `<html><head><meta charset="utf-8"><style>
      body{font-family:'Noto Sans Bengali',Arial,sans-serif}
      table{border-collapse:collapse;width:100%}
      </style></head><body>
      <h2 style="color:#1e3a5f">${factory.nameEn || factory.nameBn} — ${cfg?.labelBn ?? activeModule}</h2>
      <p style="font-size:12px;color:#6b7280">Generated: ${new Date().toLocaleString()} | Records: ${filteredRecords.length}</p>
      <table><thead><tr>${hdr}</tr></thead><tbody>${body}</tbody></table>
      </body></html>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff', html], { type: 'application/msword' }));
    a.download = `${cfg?.labelEn ?? activeModule}.doc`;
    a.click();
  };

  const handlePrintAll = () => window.print();

  // ── Styles ────────────────────────────────────────────────────────────────
  const inp: React.CSSProperties = { padding: '7px 10px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#1e293b',
    background: '#fafafa', outline: 'none', width: '100%' };
  const th: React.CSSProperties = { background: '#1e3a5f', color: '#fff', padding: '9px 11px',
    textAlign: 'left', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap',
    userSelect: 'none', cursor: 'pointer', position: 'sticky', top: 0, zIndex: 1 };

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  if (!activeModule) {
    return (
      <div style={{ fontFamily: "'Noto Sans Bengali',Arial,sans-serif", minHeight: '100vh', background: '#f0f4f8' }}>
        <ModuleHeader moduleName="রিপোর্ট মডিউল" moduleNameEn="Report Module"/>
        <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>

          {!configured && (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10,
              padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#92400e' }}>
              ⚠ ডেটাবেস কনফিগার করা হয়নি। Settings থেকে Google Sheets সংযোগ করুন।
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: '0 0 2px' }}>
              {factory.nameBn || factory.nameEn}
            </h2>
            <div style={{ fontSize: 12, color: '#64748b' }}>{factory.addressBn || factory.addressEn}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>
            {visibleConfigs.map(cfg => {
              const recs    = allRecords[cfg.module] ?? [];
              const loading = loadingMods[cfg.module];
              const err     = errorMods[cfg.module];
              return (
                <div key={cfg.module}
                  onClick={() => configured && setActiveModule(cfg.module as DbModule)}
                  style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0',
                    padding: '18px 16px', cursor: configured ? 'pointer' : 'not-allowed',
                    transition: 'all .15s', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}
                  onMouseEnter={e => { if (configured) (e.currentTarget as HTMLElement).style.borderColor = '#1e3a5f'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>{cfg.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 3, lineHeight: 1.3 }}>
                    {cfg.labelBn}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{cfg.labelEn}</div>
                  {loading ? (
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>লোড হচ্ছে…</div>
                  ) : err ? (
                    <div style={{ fontSize: 11, color: '#dc2626' }}>ডেটা পাওয়া যায়নি</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>{recs.length}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>মোট রেকর্ড</div>
                    </>
                  )}
                  <button onClick={e => { e.stopPropagation(); if (configured) reloadModule(cfg.module as DbModule); }}
                    style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 11, color: '#94a3b8', padding: 0, fontFamily: 'inherit' }}>
                    ↺ রিফ্রেশ
                  </button>
                </div>
              );
            })}

            {/* ── Grievance card — own GAS endpoint ── */}
            {showGrievance && (
              <div
                onClick={() => setActiveModule(GRV)}
                style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0',
                  padding: '18px 16px', cursor: 'pointer', transition: 'all .15s',
                  boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#dc2626'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{GRIEVANCE_CONFIG.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 3, lineHeight: 1.3 }}>
                  {GRIEVANCE_CONFIG.labelBn}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{GRIEVANCE_CONFIG.labelEn}</div>
                {grievanceLoad ? (
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>লোড হচ্ছে…</div>
                ) : grievanceError ? (
                  <div style={{ fontSize: 11, color: '#dc2626' }}>{grievanceError}</div>
                ) : (
                  <>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{grievances.length}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>মোট অভিযোগ</div>
                  </>
                )}
                <button onClick={e => { e.stopPropagation(); reloadGrievances(); }}
                  style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: '#94a3b8', padding: 0, fontFamily: 'inherit' }}>
                  ↺ রিফ্রেশ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── TABLE VIEW ────────────────────────────────────────────────────────────
  const cfg       = isGrievanceActive ? GRIEVANCE_CONFIG : getReportConfig(activeModule as DbModule);
  const isLoading = isGrievanceActive ? grievanceLoad : loadingMods[activeModule!];
  const error     = isGrievanceActive ? grievanceError : errorMods[activeModule!];
  const visibleCols = columns.filter(c => !SKIP_KEYS.has(c.key));
  const activeFilters = isGrievanceActive ? GRIEVANCE_FILTERS : (getReportConfig(activeModule as DbModule)?.filters ?? []);
  const handleReload  = () => isGrievanceActive ? reloadGrievances() : reloadModule(activeModule as DbModule);

  return (
    <div style={{ fontFamily: "'Noto Sans Bengali',Arial,sans-serif", minHeight: '100vh', background: '#f0f4f8' }}>
      <style>{`@media print{.no-print{display:none!important}@page{size:A4 landscape;margin:12mm 10mm}}`}</style>
      <ModuleHeader moduleName="রিপোর্ট মডিউল" moduleNameEn="Report Module"/>

      <div style={{ padding: '14px 16px', maxWidth: 1600, margin: '0 auto' }}>

        {/* Breadcrumb + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }} className="no-print">
          <button onClick={() => setActiveModule(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
              border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff',
              cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#374151' }}>
            <FaArrowLeft style={{ fontSize: 11 }}/> ড্যাশবোর্ড
          </button>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>
            {cfg?.icon} {cfg?.labelBn}
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            ({filteredRecords.length} / {activeRecords.length})
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={handleReload}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff',
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: '#374151' }}>
              <FaSync style={{ fontSize: 11 }}/> রিফ্রেশ
            </button>
            <button onClick={handlePrintAll}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff',
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: '#374151' }}>
              <FaPrint style={{ fontSize: 11 }}/> সব প্রিন্ট
            </button>
            <button onClick={handleExcel}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                border: '1.5px solid #22c55e', borderRadius: 8, background: '#f0fdf4',
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: '#15803d' }}>
              <FaFileExcel style={{ fontSize: 11 }}/> Excel
            </button>
            <button onClick={handleWord}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                border: '1.5px solid #3b82f6', borderRadius: 8, background: '#eff6ff',
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: '#1d4ed8' }}>
              <FaFileWord style={{ fontSize: 11 }}/> Word
            </button>
          </div>
        </div>

        {/* Filter bar — per module */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: '12px 14px', marginBottom: 12 }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <FaFilter style={{ color: '#1e40af', fontSize: 13 }} aria-hidden="true"/>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>ফিল্টার ও অনুসন্ধান</span>
            {(search || dateStart || dateEnd || Object.values(fieldFilters).some(Boolean)) && (
              <button onClick={() => { setSearch(''); setDateStart(''); setDateEnd(''); setFieldFilters({}); setPage(1); }}
                style={{ marginLeft: 'auto', padding: '4px 10px', border: '1px solid #fca5a5',
                  borderRadius: 6, background: '#fef2f2', color: '#b91c1c', cursor: 'pointer',
                  fontSize: 11, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaTimes style={{ fontSize: 10 }}/> মুছুন
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 8 }}>
            {/* Global search — searches ALL fields */}
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }} aria-hidden="true"/>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="সব ক্ষেত্রে খুঁজুন…" style={{ ...inp, paddingLeft: 28 }}/>
            </div>
            {/* Date range */}
            <input type="date" value={dateStart} onChange={e => { setDateStart(e.target.value); setPage(1); }} style={inp} aria-label="তারিখ শুরু"/>
            <input type="date" value={dateEnd}   onChange={e => { setDateEnd(e.target.value);   setPage(1); }} style={inp} aria-label="তারিখ শেষ"/>
            {/* Module-specific per-field filters */}
            {activeFilters.map(f => {
              if (f.type === 'select') return (
                <select key={f.key} value={fieldFilters[f.key] ?? ''}
                  onChange={e => { setFieldFilters(s => ({ ...s, [f.key]: e.target.value })); setPage(1); }}
                  style={inp} aria-label={f.label}>
                  <option value="">{f.label} — সব</option>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              );
              if (f.type === 'text') return (
                <input key={f.key} value={fieldFilters[f.key] ?? ''}
                  onChange={e => { setFieldFilters(s => ({ ...s, [f.key]: e.target.value })); setPage(1); }}
                  placeholder={f.label} style={inp} aria-label={f.label}/>
              );
              return null;
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }} className="no-print">
          {[
            { lbl: 'মোট রেকর্ড',    val: activeRecords.length,    clr: '#1e3a5f' },
            { lbl: 'ফিল্টার ফলাফল', val: filteredRecords.length,  clr: '#059669' },
            { lbl: 'এই পৃষ্ঠায়',    val: pageRows.length,          clr: '#d97706' },
          ].map(s => (
            <div key={s.lbl} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '10px 14px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.clr }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '11px 14px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
              {cfg?.icon} {cfg?.labelBn} — রিপোর্ট
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{filteredRecords.length} টি রেকর্ড</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>প্রতি পৃষ্ঠা:</span>
              <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}
                style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 12, fontFamily: 'inherit' }}>
                {PAGE_SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <FaSync style={{ fontSize: 24, animation: 'spin 1s linear infinite' }} aria-hidden="true"/>
              <div style={{ marginTop: 8, fontSize: 13 }}>লোড হচ্ছে…</div>
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', color: '#dc2626', textAlign: 'center', fontSize: 13 }}>{error}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 36 }}>#</th>
                    {visibleCols.map(col => (
                      <th key={col.key} style={th} onClick={() => toggleSort(col.key)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {col.label}
                          {sortState.key === col.key
                            ? (sortState.dir === 'asc'
                              ? <FaSortUp   aria-hidden="true" style={{ fontSize: 10, color: '#60a5fa' }}/>
                              : <FaSortDown aria-hidden="true" style={{ fontSize: 10, color: '#60a5fa' }}/>)
                            : <FaSort aria-hidden="true" style={{ fontSize: 10, opacity: .35 }}/>}
                        </span>
                      </th>
                    ))}
                    <th style={{ ...th, width: 60, cursor: 'default' }}>বিবরণ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={visibleCols.length + 2}
                        style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: 13 }}>
                        কোনো রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : pageRows.map((rec, idx) => (
                    <tr key={rec.id}
                      onClick={() => setDetail(rec)}
                      style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#eff6ff'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#f8fafc' : '#fff'}>
                      <td style={{ padding: '8px 10px', color: '#94a3b8', fontSize: 11, borderBottom: '1px solid #f1f5f9' }}>
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      {visibleCols.map(col => (
                        <td key={col.key} style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9',
                          maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' }}>
                          {col.badgeMap
                            ? <Badge value={String(rec[col.key] ?? '')} badgeMap={col.badgeMap}/>
                            : col.format
                              ? col.format(String(rec[col.key] ?? ''))
                              : fmtVal(rec[col.key])}
                        </td>
                      ))}
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                        <button onClick={e => { e.stopPropagation(); setDetail(rec); }}
                          style={{ padding: '3px 9px', border: '1px solid #1e3a5f', borderRadius: 5,
                            background: '#1e3a5f', color: '#fff', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit' }}>
                          দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div style={{ padding: '10px 14px', borderTop: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }} className="no-print">
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredRecords.length)} / {filteredRecords.length}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { label: '«', action: () => setPage(1),           disabled: page === 1 },
                  { label: <FaChevronLeft/>, action: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
                ].map((b, i) => (
                  <button key={i} onClick={b.action} disabled={b.disabled as boolean}
                    style={{ padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: 6,
                      background: 'transparent', color: '#374151', cursor: b.disabled ? 'not-allowed' : 'pointer',
                      opacity: b.disabled ? .4 : 1, fontSize: 12 }}>
                    {b.label as React.ReactNode}
                  </button>
                ))}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = page <= 3 ? i + 1
                    : page >= totalPages - 2 ? totalPages - 4 + i
                    : page - 2 + i;
                  p = Math.max(1, Math.min(totalPages, p));
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ padding: '5px 9px', border: '1px solid #e2e8f0', borderRadius: 6,
                        cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                        background: p === page ? '#1e3a5f' : 'transparent',
                        color: p === page ? '#fff' : '#374151',
                        fontWeight: p === page ? 700 : 400 }}>
                      {p}
                    </button>
                  );
                })}
                {[
                  { label: <FaChevronRight/>, action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
                  { label: '»', action: () => setPage(totalPages), disabled: page === totalPages },
                ].map((b, i) => (
                  <button key={i} onClick={b.action} disabled={b.disabled as boolean}
                    style={{ padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: 6,
                      background: 'transparent', color: '#374151', cursor: b.disabled ? 'not-allowed' : 'pointer',
                      opacity: b.disabled ? .4 : 1, fontSize: 12 }}>
                    {b.label as React.ReactNode}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>পৃষ্ঠা {page}/{totalPages}</span>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <DetailModal
          record={detail}
          moduleKey={activeModule}
          columns={columns}
          factoryName={factory.nameEn || factory.nameBn}
          onClose={() => setDetail(null)}
          onOpenModule={onNavigateToModule ? () => {
            onNavigateToModule(activeModule!, detail);
            setDetail(null);
          } : undefined}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}