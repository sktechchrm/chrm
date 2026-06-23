// ─────────────────────────────────────────────────────────────────────────────
// REPORT MODULE
// Enterprise-grade dynamic report viewer
//
// Features:
//   • Module dropdown filter
//   • Date range filter (start–end)
//   • Search by ID or name
//   • Sort by any column (asc/desc)
//   • Pagination (configurable page size)
//   • Row click → detail modal
//   • Export: PDF (jsPDF) | Excel (SheetJS) | Word (docx-like HTML)
//   • Print with A4 layout, header/footer
//   • Real-time sync from Google Sheets
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FaFilter, FaSearch, FaFilePdf, FaFileExcel, FaFileWord, FaPrint,
  FaSort, FaSortUp, FaSortDown, FaEye, FaTimes, FaSync, FaChevronLeft,
  FaChevronRight, FaDatabase,
} from 'react-icons/fa';
import { REPORT_CONFIGS, getReportConfig, formatDate, formatCurrency } from './ReportConfig';
import { DataUseCases } from '../../business/DataUseCases';
import type { DbRecord, DbModule } from '../../business/DataUseCases';
import { useFactory } from '../../hooks/useFactory';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel } from '../../utils/excelExport';
import ModuleHeader from '../common/ModuleHeader';
import ModuleNavBar from '../common/ModuleNavBar';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SortState { key: string; dir: 'asc' | 'desc'; }

interface FilterState {
  module:    DbModule | '';
  search:    string;
  dateStart: string;
  dateEnd:   string;
  fields:    Record<string, string>;
}

const PAGE_SIZES = [10, 25, 50, 100];

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ value, badgeMap }: { value: string; badgeMap?: Record<string, { bg: string; text: string }> }) {
  const style = badgeMap?.[value];
  return (
    <span style={{
      display:      'inline-block',
      padding:      '2px 8px',
      borderRadius: '10px',
      fontSize:     '11px',
      fontWeight:   600,
      background:   style?.bg ?? '#f3f4f6',
      color:        style?.text ?? '#374151',
      whiteSpace:   'nowrap',
    }}>
      {value || '—'}
    </span>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({
  record, config, onClose, onEdit,
}: {
  record: DbRecord;
  config: ReturnType<typeof getReportConfig>;
  onClose: () => void;
  onEdit?: (record: DbRecord) => void;
}) {
  const fields = config?.detailFields ?? config?.columns.map(c => ({ key: c.key, label: c.label })) ?? [];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Record details"
    >
      <div
        style={{
          background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '720px',
          maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ background: '#1e3a5f', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>
              {config?.icon} {config?.labelBn}
            </div>
            <div style={{ color: '#93c5fd', fontSize: '12px', marginTop: '2px' }}>
              ID: {record.id}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button
                onClick={() => { onClose(); onEdit(record); }}
                style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}
              >
                ✏️ সম্পাদনা করুন
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}
              aria-label="Close"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Fields grid */}
        <div style={{ overflow: 'auto', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {fields.map(f => {
              const raw  = record[f.key];
              const col  = config?.columns.find(c => c.key === f.key);
              let display = String(raw ?? '—');
              if (raw && col?.format)  display = col.format(raw as string);
              if (!raw)                display = '—';
              return (
                <div
                  key={f.key}
                  style={{
                    gridColumn: (f as { span?: number }).span ? `span ${(f as { span?: number }).span}` : undefined,
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, marginBottom: '3px' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>
                    {col?.type === 'badge' && col.badgeMap
                      ? <Badge value={String(raw ?? '')} badgeMap={col.badgeMap} />
                      : display
                    }
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metadata */}
          <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f0f9ff', borderRadius: '8px', fontSize: '12px', color: '#6b7280' }}>
            সংরক্ষণকারী: <strong>{record.savedBy}</strong> &nbsp;|&nbsp;
            ফ্যাক্টরি: <strong>{record.factoryId}</strong> &nbsp;|&nbsp;
            সময়: <strong>{formatDate(record.savedAt)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReportModule({ onNavigateToModule }: { onNavigateToModule?: (module: string, record?: DbRecord) => void }) {
  const factory    = useFactory();
  const { user }   = useAuth();
  const printRef   = useRef<HTMLDivElement>(null);
  const configured = DataUseCases.isConfigured(factory.id);

  // ── State ──────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>({
    module: 'employees', search: '', dateStart: '', dateEnd: '', fields: {},
  });
  const [records,    setRecords]    = useState<DbRecord[]>([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [sortState,  setSortState]  = useState<SortState>({ key: 'savedAt', dir: 'desc' });
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(25);
  const [detail,     setDetail]     = useState<DbRecord | null>(null);
  const [showFilters,setShowFilters]= useState(false);

  const currentConfig = useMemo(() =>
    filters.module ? getReportConfig(filters.module) : undefined,
  [filters.module]);

  // ── Load records ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!filters.module || !configured) return;
    setIsLoading(true);
    setError(null);
    const result = await DataUseCases.load(filters.module as DbModule, factory.id, 500);
    setIsLoading(false);
    if (result.ok) {
      setRecords(result.records);
      setPage(1);
    } else {
      setError(result.error ?? 'ডেটা লোড ব্যর্থ হয়েছে');
    }
  }, [filters.module, factory.id, configured]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filter + sort + paginate ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...records];

    // Global search (ID or name)
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      rows = rows.filter(r =>
        String(r.id).toLowerCase().includes(q)              ||
        String(r.employeeName ?? r.fullName ?? r.meetingTitle ?? r.subject ?? '').toLowerCase().includes(q) ||
        String(r.cardNo ?? '').toLowerCase().includes(q)
      );
    }

    // Date range on savedAt or module date field
    const dateKey = currentConfig?.columns.find(c => c.type === 'date' && c.key !== 'savedAt')?.key ?? 'savedAt';
    if (filters.dateStart) {
      rows = rows.filter(r => r[dateKey] && String(r[dateKey]) >= filters.dateStart);
    }
    if (filters.dateEnd) {
      rows = rows.filter(r => r[dateKey] && String(r[dateKey]) <= filters.dateEnd);
    }

    // Per-field filters
    Object.entries(filters.fields).forEach(([k, v]) => {
      if (!v) return;
      rows = rows.filter(r => String(r[k] ?? '').toLowerCase().includes(v.toLowerCase()));
    });

    // Sort
    if (sortState.key) {
      rows.sort((a, b) => {
        const av = String(a[sortState.key] ?? '');
        const bv = String(b[sortState.key] ?? '');
        const cmp = av.localeCompare(bv, 'bn', { numeric: true });
        return sortState.dir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [records, filters, sortState, currentConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows   = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    setSortState(s => s.key === key
      ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' }
    );
    setPage(1);
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExcel = async () => {
    if (!currentConfig) return;
    await exportToExcel({
      filename: `${currentConfig.labelEn}_Report_${new Date().toISOString().slice(0,10)}`,
      sheetName: currentConfig.labelEn,
      headerInfo: [
        { label: 'Factory',  value: factory.nameEn },
        { label: 'Module',   value: currentConfig.labelEn },
        { label: 'Exported', value: new Date().toLocaleString() },
        { label: 'Records',  value: String(filtered.length) },
      ],
      sections: [{
        title: currentConfig.labelEn,
        columns: currentConfig.columns.map(c => ({ key: c.key, header: c.label })),
        rows: filtered as unknown as Record<string, string | number | null | undefined>[],
      }],
    });
  };

  const handlePDF = () => {
    if (printRef.current) {
      window.print();
    }
  };

  const handleWord = () => {
    if (!currentConfig) return;
    const headers = currentConfig.columns.map(c => `<th style="background:#1e3a5f;color:#fff;padding:8px 10px;border:1px solid #ccc;font-size:11px">${c.label}</th>`).join('');
    const bodyRows = filtered.map((rec, i) =>
      `<tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">${
        currentConfig!.columns.map(c => `<td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:11px">${
          c.format ? c.format(rec[c.key] as string ?? '') : (rec[c.key] ?? '—')
        }</td>`).join('')
      }</tr>`
    ).join('');
    const html = `
      <html><head><meta charset="utf-8">
      <style>body{font-family:Arial,sans-serif;} table{border-collapse:collapse;width:100%}</style>
      </head><body>
      <h2 style="color:#1e3a5f">${factory.nameEn} — ${currentConfig.labelBn} Report</h2>
      <p style="color:#6b7280;font-size:12px">Generated: ${new Date().toLocaleString()} | Records: ${filtered.length}</p>
      <table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table>
      </body></html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${currentConfig.labelEn}_Report.doc`; a.click();
  };

  const handlePrint = () => window.print();

  // ── Render helpers ─────────────────────────────────────────────────────────
  const SortIcon = ({ col }: { col: string }) => {
    if (sortState.key !== col) return <FaSort aria-hidden="true" style={{ fontSize: '10px', opacity: 0.35 }} />;
    return sortState.dir === 'asc'
      ? <FaSortUp   aria-hidden="true" style={{ fontSize: '10px', color: '#60a5fa' }} />
      : <FaSortDown aria-hidden="true" style={{ fontSize: '10px', color: '#60a5fa' }} />;
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const S = {
    wrap: {
      fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
      minHeight:  '100vh',
      background: '#f0f4f8',
    } as React.CSSProperties,
    card: {
      background: '#fff', borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
    } as React.CSSProperties,
    th: {
      background: '#1e3a5f', color: '#fff',
      padding: '10px 12px', textAlign: 'left' as const,
      fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap' as const,
      userSelect: 'none' as const, cursor: 'pointer',
    } as React.CSSProperties,
    td: (even: boolean) => ({
      padding: '9px 12px',
      background: even ? '#f8fafc' : '#fff',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '12.5px', color: '#374151',
      maxWidth: '180px', overflow: 'hidden',
      textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
    } as React.CSSProperties),
    inputBase: {
      padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
      fontSize: '13px', fontFamily: 'inherit', color: '#1e293b',
      background: '#fafafa', outline: 'none',
    } as React.CSSProperties,
  };

  return (
    <div style={S.wrap}>
      {/* Print style */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-print-area { padding: 0 !important; }
          body { font-size: 10px; }
          @page { size: A4 landscape; margin: 12mm 10mm; }
        }
      `}</style>

      <ModuleHeader
        moduleName="রিপোর্ট মডিউল"
        moduleNameEn="Report Module"
      />
      <ModuleNavBar
        lang="en"
        tabs={REPORT_CONFIGS.map(cfg => ({ id: cfg.module, label: `${cfg.icon} ${cfg.labelBn}` }))}
        activeTab={filters.module || 'employees'}
        onTabChange={(mod: string) => { setFilters(f => ({ ...f, module: mod as DbModule | '' })); setPage(1); }}
        onSave={undefined}
        onUpdate={undefined}
        onPrint={handlePrint}
        onPDF={handlePDF}
        onExcel={handleExcel}
        onWord={handleWord}
        extraButtons={
          <button
            onClick={() => { setFilters({ module: 'employees', search: '', dateStart: '', dateEnd: '', fields: {} }); setPage(1); }}
            style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 11px', border:'1.5px solid #6b7280', borderRadius:'7px', background:'transparent', color:'#6b7280', fontSize:'12.5px', fontWeight:600, cursor:'pointer', fontFamily:"'Noto Sans Bengali', Arial, sans-serif", whiteSpace:'nowrap' }}
            aria-label="Reset filters"
          >
            ↺ রিসেট
          </button>
        }
      />

      <div style={{ padding: '16px', maxWidth: '1600px', margin: '0 auto' }}>

        {/* ── Top Filter Bar ──────────────────────────────────────────────── */}
        <div style={{ ...S.card, marginBottom: '16px' }} className="no-print">
          <div style={{ padding: '12px 16px', borderBottom: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaFilter aria-hidden="true" style={{ color: '#1e40af', fontSize: '13px' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a5f' }}>ফিল্টার ও অনুসন্ধান</span>
            <button
              onClick={() => setShowFilters(v => !v)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}
            >
              {showFilters ? 'সংক্ষিপ্ত করুন ▲' : 'বিস্তারিত ▼'}
            </button>
          </div>

          <div style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            {/* Module selector */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                মডিউল
              </label>
              <select
                value={filters.module}
                onChange={e => {
                  setFilters(f => ({ ...f, module: e.target.value as DbModule | '', fields: {} }));
                  setPage(1);
                }}
                style={{ ...S.inputBase, minWidth: '180px' }}
                aria-label="Module selector"
              >
                {REPORT_CONFIGS.map(c => (
                  <option key={c.module} value={c.module}>{c.icon} {c.labelBn}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                তারিখ (শুরু)
              </label>
              <input
                type="date" value={filters.dateStart}
                onChange={e => { setFilters(f => ({ ...f, dateStart: e.target.value })); setPage(1); }}
                style={S.inputBase}
                aria-label="Date range start"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                তারিখ (শেষ)
              </label>
              <input
                type="date" value={filters.dateEnd}
                onChange={e => { setFilters(f => ({ ...f, dateEnd: e.target.value })); setPage(1); }}
                style={S.inputBase}
                aria-label="Date range end"
              />
            </div>

            {/* Global search */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                আইডি / নাম / কার্ড নং
              </label>
              <div style={{ position: 'relative' }}>
                <FaSearch aria-hidden="true" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
                  placeholder="খুঁজুন..."
                  style={{ ...S.inputBase, paddingLeft: '30px', width: '100%', boxSizing: 'border-box' as const }}
                  aria-label="Search"
                />
                {filters.search && (
                  <button onClick={() => setFilters(f => ({ ...f, search: '' }))}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    aria-label="Clear search"
                  >
                    <FaTimes aria-hidden="true" style={{ fontSize: '11px' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Reload */}
            <button
              onClick={loadData}
              disabled={isLoading}
              style={{ ...S.inputBase, border: '1.5px solid #1e40af', color: '#1e40af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent' }}
              aria-label="Reload data"
              title="ডেটা রিফ্রেশ করুন"
            >
              <FaSync aria-hidden="true" style={{ animation: isLoading ? 'spin 0.8s linear infinite' : 'none', fontSize: '12px' }} />
              রিফ্রেশ
            </button>
          </div>

          {/* Advanced per-field filters */}
          {showFilters && currentConfig && (
            <div style={{ padding: '0 16px 14px', display: 'flex', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              {currentConfig.filters.map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    {f.label}
                  </label>
                  {f.type === 'select' ? (
                    <select
                      value={filters.fields[f.key] ?? ''}
                      onChange={e => { setFilters(prev => ({ ...prev, fields: { ...prev.fields, [f.key]: e.target.value } })); setPage(1); }}
                      style={S.inputBase}
                    >
                      <option value="">সব</option>
                      {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'date' ? (
                    <input type="date" value={filters.fields[f.key] ?? ''}
                      onChange={e => { setFilters(prev => ({ ...prev, fields: { ...prev.fields, [f.key]: e.target.value } })); setPage(1); }}
                      style={S.inputBase}
                    />
                  ) : (
                    <input type="text" value={filters.fields[f.key] ?? ''}
                      onChange={e => { setFilters(prev => ({ ...prev, fields: { ...prev.fields, [f.key]: e.target.value } })); setPage(1); }}
                      placeholder={f.label}
                      style={{ ...S.inputBase, minWidth: '140px' }}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={() => { setFilters(f => ({ ...f, fields: {} })); setPage(1); }}
                style={{ ...S.inputBase, border: '1.5px solid #dc2626', color: '#dc2626', cursor: 'pointer', background: 'transparent', alignSelf: 'flex-end' }}
              >
                ফিল্টার মুছুন
              </button>
            </div>
          )}
        </div>

        {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }} className="no-print">
          {[
            { label: 'মোট রেকর্ড', value: records.length,  color: '#1e40af' },
            { label: 'ফিল্টার ফলাফল', value: filtered.length, color: '#16a34a' },
            { label: 'এই পৃষ্ঠায়', value: pageRows.length, color: '#d97706'  },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '10px 16px', flex: 1, minWidth: '120px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div style={S.card} ref={printRef}>
          {/* Print header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a5f' }}>
                {currentConfig?.icon} {currentConfig?.labelBn} — রিপোর্ট
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '12px' }}>
                {filtered.length} টি রেকর্ড
              </span>
            </div>
            {/* Page size selector */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151' }}>
              প্রতি পৃষ্ঠা:
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{ ...S.inputBase, padding: '4px 8px' }}
              >
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Not configured warning */}
          {!configured && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <FaDatabase aria-hidden="true" style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, marginBottom: '6px' }}>Google Sheets কনফিগার করা নেই</div>
              <div style={{ fontSize: '12.5px' }}>src/config/sheets.ts-এ URL এবং key যোগ করুন</div>
            </div>
          )}

          {/* Error */}
          {configured && error && (
            <div role="alert" style={{ padding: '20px 16px', color: '#dc2626', fontSize: '13px', background: '#fef2f2' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {configured && isLoading && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ animation: 'spin 0.8s linear infinite', fontSize: '24px', marginBottom: '8px' }}>⟳</div>
              লোড হচ্ছে...
            </div>
          )}

          {/* Table */}
          {configured && !isLoading && !error && currentConfig && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: '40px' }}>#</th>
                    {currentConfig.columns.map(col => (
                      <th
                        key={col.key}
                        style={{ ...S.th, width: col.width }}
                        onClick={() => col.sortable && toggleSort(col.key)}
                        aria-sort={sortState.key === col.key ? (sortState.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {col.label}
                          {col.sortable && <SortIcon col={col.key} />}
                        </span>
                      </th>
                    ))}
                    <th style={{ ...S.th, width: '50px' }} className="no-print">▸</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={currentConfig.columns.length + 2} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        কোনো রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((rec, i) => (
                      <tr
                        key={rec.id}
                        onClick={() => setDetail(rec)}
                        style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#eff6ff'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                        aria-label={`Row ${(page - 1) * pageSize + i + 1}`}
                      >
                        <td style={{ ...S.td(i % 2 === 0), color: '#94a3b8', textAlign: 'center' as const }}>
                          {(page - 1) * pageSize + i + 1}
                        </td>
                        {currentConfig.columns.map(col => {
                          const raw = rec[col.key];
                          let display: React.ReactNode = String(raw ?? '—');
                          if (raw && col.format) display = col.format(raw as string | number);
                          if (!raw)              display = '—';
                          if (col.type === 'badge') display = <Badge value={String(raw ?? '')} badgeMap={col.badgeMap} />;
                          return (
                            <td key={col.key} style={S.td(i % 2 === 0)} title={String(raw ?? '')}>
                              {display}
                            </td>
                          );
                        })}
                        <td style={{ ...S.td(i % 2 === 0), textAlign: 'center' as const }} className="no-print">
                          <FaEye aria-hidden="true" style={{ color: '#94a3b8', fontSize: '13px' }} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────────────────── */}
          {configured && !isLoading && totalPages > 1 && (
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {(page - 1) * pageSize + 1} – {Math.min(page * pageSize, filtered.length)} / {filtered.length} রেকর্ড
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  onClick={() => setPage(1)} disabled={page === 1}
                  style={{ padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: 'transparent', color: '#374151', fontSize: '12px', opacity: page === 1 ? 0.4 : 1 }}
                  aria-label="First page"
                >«</button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: 'transparent', color: '#374151', opacity: page === 1 ? 0.4 : 1 }}
                  aria-label="Previous page"
                >
                  <FaChevronLeft aria-hidden="true" style={{ fontSize: '10px' }} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ padding: '5px 9px', border: `1px solid ${p === page ? '#1e40af' : '#e2e8f0'}`, borderRadius: '6px', cursor: 'pointer', background: p === page ? '#1e40af' : 'transparent', color: p === page ? '#fff' : '#374151', fontSize: '12px', fontWeight: p === page ? 700 : 400 }}
                      aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined}
                    >{p}</button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: 'transparent', color: '#374151', opacity: page === totalPages ? 0.4 : 1 }}
                  aria-label="Next page"
                >
                  <FaChevronRight aria-hidden="true" style={{ fontSize: '10px' }} />
                </button>
                <button
                  onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  style={{ padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: 'transparent', color: '#374151', fontSize: '12px', opacity: page === totalPages ? 0.4 : 1 }}
                  aria-label="Last page"
                >»</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ───────────────────────────────────────────────────── */}
      {detail && (
        <DetailModal
          record={detail}
          config={currentConfig}
          onClose={() => setDetail(null)}
          onEdit={onNavigateToModule
            ? rec => {
                if (filters.module) onNavigateToModule(filters.module, rec);
              }
            : undefined
          }
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
