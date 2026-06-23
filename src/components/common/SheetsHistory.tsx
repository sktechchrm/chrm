// ─────────────────────────────────────────────────────────────────────────────
// SheetsHistory — universal record history panel
// Works with any database adapter: Google Sheets, MySQL, or any future backend.
// Legacy name kept so all existing imports still work.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { FaHistory, FaTrash, FaSyncAlt, FaDatabase, FaChevronDown, FaEdit, FaArrowUp } from 'react-icons/fa';
import { formatSavedAt }  from '../../utils/dateUtils';
import type { DbModule as SheetModule, DbRecord as SheetRecord } from '../../business/DataUseCases';

// ── Column display config per module ─────────────────────────────────────────
const MODULE_DISPLAY: Record<SheetModule, { label: string; cols: { key: string; label: string }[] }> = {
  settlements: {
    label: 'চূড়ান্ত পাওনার ইতিহাস',
    cols: [
      { key: 'employeeName',    label: 'নাম'         },
      { key: 'cardNo',          label: 'কার্ড নং'    },
      { key: 'terminationType', label: 'ধরন'          },
      { key: 'finalTotal',      label: 'পাওনা'        },
    ],
  },
  maternity: {
    label: 'মাতৃত্ব সুবিধার ইতিহাস',
    cols: [
      { key: 'employeeName',  label: 'নাম'         },
      { key: 'cardNo',        label: 'কার্ড নং'    },
      { key: 'installment',   label: 'কিস্তি'      },
      { key: 'totalBenefit',  label: 'মোট সুবিধা'  },
    ],
  },
  leftnotice: {
    label: 'অনুপস্থিতি নোটিশ ইতিহাস',
    cols: [
      { key: 'employeeName',      label: 'নাম'          },
      { key: 'cardNo',            label: 'কার্ড নং'     },
      { key: 'totalAbsentDays',   label: 'অনুপস্থিত'    },
      { key: 'noticeType',        label: 'নোটিশ ধরন'    },
    ],
  },
  employees: {
    label: 'কর্মী ফাইল ইতিহাস',
    cols: [
      { key: 'fullName',     label: 'নাম'          },
      { key: 'cardNo',       label: 'কার্ড নং'     },
      { key: 'designation',  label: 'পদবী'          },
      { key: 'status',       label: 'অবস্থা'        },
    ],
  },
  requisitions: {
    label: 'রিকুইজিশন ইতিহাস',
    cols: [
      { key: 'subject',      label: 'বিষয়'         },
      { key: 'date',         label: 'তারিখ'         },
      { key: 'preparedBy',   label: 'প্রস্তুতকারী'  },
      { key: 'status',       label: 'অবস্থা'        },
    ],
  },
  increments: {
    label: 'বেতন বৃদ্ধির ইতিহাস',
    cols: [
      { key: 'employeeName',       label: 'নাম'          },
      { key: 'cardNo',             label: 'কার্ড নং'     },
      { key: 'incrementAmount',    label: 'বৃদ্ধির পরিমাণ' },
      { key: 'effectiveDate',      label: 'কার্যকর তারিখ'  },
    ],
  },
  meetings: {
    label: 'সভার কার্যবিবরণী ইতিহাস',
    cols: [
      { key: 'meetingTitle',    label: 'সভার শিরোনাম' },
      { key: 'meetingDate',     label: 'তারিখ'         },
      { key: 'chairperson',     label: 'সভাপতি'        },
      { key: 'attendeeCount',   label: 'উপস্থিত'       },
    ],
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  module:    SheetModule;
  records:   SheetRecord[];
  isLoading: boolean;
  onLoad?:   (record: SheetRecord) => void;  // Load record into form for editing
  onDelete?: (id: string) => Promise<boolean>;
  onReload?: () => void;
  editingId?: string | null;  // Highlight the row being edited
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SheetsHistory({ module, records, isLoading, onLoad, onDelete, onReload, editingId }: Props) {
  const [open,        setOpen]        = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const cfg = MODULE_DISPLAY[module];

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (!confirm('এই রেকর্ডটি মুছে ফেলবেন?')) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    wrapper: {
      marginTop: '16px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
    } as React.CSSProperties,
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      background: '#f8fafc',
      borderBottom: open ? '1.5px solid #e2e8f0' : 'none',
      cursor: 'pointer',
    } as React.CSSProperties,
    title: {
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '13.5px', fontWeight: 700, color: '#1e3a5f',
    } as React.CSSProperties,
    badge: {
      background: '#dbeafe', color: '#1d4ed8',
      fontSize: '11px', fontWeight: 700,
      padding: '2px 8px', borderRadius: '10px',
    } as React.CSSProperties,
    table: {
      width: '100%', borderCollapse: 'collapse' as const,
      fontSize: '12.5px',
    } as React.CSSProperties,
    th: {
      background: '#1e3a5f', color: '#fff',
      padding: '8px 10px', textAlign: 'left' as const,
      fontWeight: 600, fontSize: '11.5px',
      whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    td: (even: boolean) => ({
      padding: '8px 10px',
      background: even ? '#f8fafc' : '#ffffff',
      borderBottom: '1px solid #f1f5f9',
      color: '#374151', maxWidth: '140px',
      overflow: 'hidden', textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    } as React.CSSProperties),
    deleteBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      color: '#dc2626', padding: '4px 6px', borderRadius: '4px',
    } as React.CSSProperties,
  };

  return (
    <div style={S.wrapper}>
      {/* ── Accordion Header ─────────────────────────────────────────── */}
      <div style={S.header} onClick={() => setOpen(o => !o)}>
        <div style={S.title}>
          <FaHistory aria-hidden="true" style={{ color: '#1e40af' }} />
          {cfg.label}
          <span style={S.badge}>{records.length} টি রেকর্ড</span>
          {isLoading && (
            <span style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
              লোড হচ্ছে...
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onReload && (
            <button
              onClick={e => { e.stopPropagation(); onReload(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', padding: '4px' }}
              aria-label="রিফ্রেশ"
              title="রিফ্রেশ"
            >
              <FaSyncAlt aria-hidden="true" style={{ fontSize: '12px' }} />
            </button>
          )}
          <FaChevronDown
            aria-hidden="true"
            style={{
              fontSize: '13px', color: '#6b7280',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>

      {/* ── Records Table ─────────────────────────────────────────────── */}
      {open && (
        <div style={{ overflowX: 'auto' }}>
          {records.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              <FaDatabase aria-hidden="true" style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.4 }} />
              <div>কোনো রেকর্ড নেই</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>প্রথম ফর্মটি পূরণ করে সংরক্ষণ করুন</div>
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>ID</th>
                  {cfg.cols.map(c => <th key={c.key} style={S.th}>{c.label}</th>)}
                  <th style={S.th}>সংরক্ষণকারী</th>
                  <th style={S.th}>তারিখ/সময়</th>
                  {onLoad && <th style={{ ...S.th, width: '80px', background: '#1d4ed8' }}>সম্পাদনা</th>}
                  {onDelete && <th style={{ ...S.th, width: '40px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={rec.id} style={{ outline: editingId === rec.id ? '2px solid #3b82f6' : 'none', outlineOffset: '-2px' }}>
                    <td style={S.td(i % 2 === 0)}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
                        {rec.id}
                      </span>
                    </td>
                    {cfg.cols.map(c => (
                      <td key={c.key} style={S.td(i % 2 === 0)}>
                        {String(rec[c.key] ?? '—')}
                      </td>
                    ))}
                    <td style={S.td(i % 2 === 0)}>{rec.savedBy}</td>
                    <td style={{ ...S.td(i % 2 === 0), fontSize: '11px', color: '#6b7280' }}>
                      {formatSavedAt(rec.savedAt)}
                    </td>
                    {onLoad && (
                      <td style={{ ...S.td(i % 2 === 0), textAlign: 'center' as const }}>
                        <button
                          style={{
                            background: editingId === rec.id ? '#dbeafe' : '#eff6ff',
                            border: '1px solid #93c5fd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#1d4ed8',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontFamily: 'inherit',
                          }}
                          onClick={() => onLoad(rec)}
                          aria-label={`${rec.id} ফর্মে লোড করুন`}
                          title="ফর্মে লোড করুন"
                        >
                          {editingId === rec.id
                            ? <><FaArrowUp aria-hidden="true" style={{ fontSize: '9px' }} /> সম্পাদনা</>
                            : <><FaEdit aria-hidden="true" style={{ fontSize: '9px' }} /> লোড</>
                          }
                        </button>
                      </td>
                    )}
                    {onDelete && (
                      <td style={S.td(i % 2 === 0)}>
                        <button
                          style={S.deleteBtn}
                          onClick={() => handleDelete(rec.id)}
                          disabled={deletingId === rec.id}
                          aria-label={`${rec.id} মুছুন`}
                          title="মুছুন"
                        >
                          {deletingId === rec.id
                            ? <span style={{ fontSize: '11px' }}>...</span>
                            : <FaTrash aria-hidden="true" style={{ fontSize: '11px' }} />
                          }
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
