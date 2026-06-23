// ─────────────────────────────────────────────────────────────────────────────
// AuthoritySlidePanel
//
// A compact icon button (🔏) that opens a slide-over panel styled like
// ApprovalChainSection. Replaces the bulky inline AuthorizationBlock in
// every module's navbar. Only the icon appears in the button bar — the
// full panel slides in from the right on click.
//
// Usage in ModuleNavBar:
//   <AuthorityIconButton value={auth} onChange={setAuth} lang="en" />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import {
  FaUserShield, FaTimes, FaCheckSquare, FaUserTie,
  FaBuilding, FaSignature,
} from 'react-icons/fa';
import { useFactory } from '../../hooks/useFactory';
import type { AuthorizationState } from './AuthorizationBlock';

// ── Types (re-exported for convenience) ──────────────────────────────────────
export type { AuthorizationState };
export { DEFAULT_AUTHORIZATION } from './AuthorizationBlock';

// ── Shared input style ────────────────────────────────────────────────────────
const inp = {
  width: '100%',
  padding: '7px 10px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#1e293b',
  background: '#fafafa',
  outline: 'none',
  fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
  boxSizing: 'border-box' as const,
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  value:    AuthorizationState;
  onChange: (next: AuthorizationState) => void;
  lang?:    'en' | 'bn';
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AuthorityIconButton({ value, onChange, lang = 'en' }: Props) {
  const [open,    setOpen]    = useState(false);
  const panelRef              = useRef<HTMLDivElement>(null);
  const factory               = useFactory();
  const auth                  = factory.authorities;

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const isBn = lang === 'bn';

  const AUTHORITIES = [
    {
      key:   'factoryHead'      as const,
      label: isBn ? auth.factoryHead.designation       : auth.factoryHead.designationEn,
      name:  isBn ? auth.factoryHead.name              : auth.factoryHead.nameEn,
      icon:  <FaBuilding   aria-hidden="true" />,
      color: '#7c3aed',
      bg:    '#f5f3ff',
    },
    {
      key:   'hrManager'        as const,
      label: isBn ? auth.hrManager.designation         : auth.hrManager.designationEn,
      name:  isBn ? auth.hrManager.name                : auth.hrManager.nameEn,
      icon:  <FaUserTie    aria-hidden="true" />,
      color: '#1d4ed8',
      bg:    '#eff6ff',
    },
    {
      key:   'hoHrHead'         as const,
      label: isBn ? auth.hoHrHead.designation          : auth.hoHrHead.designationEn,
      name:  isBn ? auth.hoHrHead.name                 : auth.hoHrHead.nameEn,
      icon:  <FaUserShield aria-hidden="true" />,
      color: '#0369a1',
      bg:    '#f0f9ff',
    },
    {
      key:   'headOfOperations' as const,
      label: isBn ? auth.headOfOperations.designation  : auth.headOfOperations.designationEn,
      name:  isBn ? auth.headOfOperations.name         : auth.headOfOperations.nameEn,
      icon:  <FaSignature  aria-hidden="true" />,
      color: '#047857',
      bg:    '#f0fdf4',
    },
  ];

  // President/Secretary — committee-driven roles (e.g. Meeting Minutes
  // module). Only shown in this panel when the calling module has actually
  // set a name for them; otherwise the checkbox would control a signatory
  // with nothing to display.
  const COMMITTEE_AUTHORITIES = [
    ...(value.president ? [{
      key:   'president' as const,
      label: value.presidentDesignation || (isBn ? 'সভাপতি' : 'President'),
      name:  value.president,
      icon:  <FaUserShield aria-hidden="true" />,
      color: '#b45309',
      bg:    '#fffbeb',
    }] : []),
    ...(value.secretary ? [{
      key:   'secretary' as const,
      label: value.secretaryDesignation || (isBn ? 'সচিব' : 'Secretary'),
      name:  value.secretary,
      icon:  <FaSignature aria-hidden="true" />,
      color: '#0891b2',
      bg:    '#ecfeff',
    }] : []),
  ];

  const ALL_AUTHORITIES = [...COMMITTEE_AUTHORITIES, ...AUTHORITIES];

  // Map AuthorizationState.visibility keys to our authority keys
  const visibilityMap: Record<typeof ALL_AUTHORITIES[number]['key'], keyof AuthorizationState['visibility']> = {
    president:        'president',
    secretary:        'secretary',
    factoryHead:      'factoryHead',
    hrManager:        'hrManager',
    hoHrHead:         'hoHrHead',
    headOfOperations: 'headOfOperations',
  };

  // Count visible authorities for the badge — only count roles that are
  // actually eligible to show (president/secretary only count if a name
  // was set by the calling module).
  const visibleCount = ALL_AUTHORITIES.filter(a => value.visibility[visibilityMap[a.key]]).length;

  return (
    <>
      {/* ── Trigger icon button ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        title={isBn ? 'অনুমোদন সেটিং' : 'Authorization Settings'}
        aria-label={isBn ? 'অনুমোদন সেটিং খুলুন' : 'Open authorization settings'}
        aria-haspopup="dialog"
        className="no-print"
        style={{
          position:     'relative',
          display:      'inline-flex',
          alignItems:   'center',
          gap:          '5px',
          padding:      '6px 10px',
          border:       '1.5px solid #7c3aed',
          borderRadius: '8px',
          background:   open ? '#7c3aed' : 'transparent',
          color:        open ? '#fff' : '#7c3aed',
          fontSize:     '12.5px',
          fontWeight:   600,
          cursor:       'pointer',
          fontFamily:   "'Noto Sans Bengali', Arial, sans-serif",
          transition:   'all 0.15s',
          whiteSpace:   'nowrap',
        }}
        onMouseEnter={e => {
          if (open) return;
          (e.currentTarget as HTMLButtonElement).style.background = '#f5f3ff';
        }}
        onMouseLeave={e => {
          if (open) return;
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        <FaUserShield aria-hidden="true" style={{ fontSize: '13px' }} />
        <span className="hidden sm:inline">
          {isBn ? 'অনুমোদন' : 'Auth'}
        </span>
        {/* Badge showing how many authorities are visible */}
        <span style={{
          display:      'inline-flex',
          alignItems:   'center',
          justifyContent:'center',
          width:        '16px',
          height:       '16px',
          background:   open ? 'rgba(255,255,255,0.3)' : '#7c3aed',
          color:        '#fff',
          borderRadius: '50%',
          fontSize:     '9px',
          fontWeight:   700,
        }}>
          {visibleCount}
        </span>
      </button>

      {/* ── Backdrop ────────────────────────────────────────────────────── */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          style={{
            position:   'fixed', inset: 0, zIndex: 8000,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* ── Slide-over panel ────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={isBn ? 'অনুমোদন সেটিং' : 'Authorization Settings'}
        style={{
          position:   'fixed',
          top:        0,
          right:      open ? 0 : '-460px',
          width:      '460px',
          maxWidth:   '100vw',
          height:     '100vh',
          zIndex:     8001,
          background: '#fff',
          boxShadow:  '-8px 0 32px rgba(0,0,0,0.15)',
          display:    'flex',
          flexDirection:'column',
          transition: 'right 0.25s cubic-bezier(0.4,0,0.2,1)',
          fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
        }}
      >
        {/* Panel header */}
        <div style={{
          background:   '#1e3a5f',
          padding:      '14px 18px',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          flexShrink:   0,
        }}>
          <div>
            <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUserShield aria-hidden="true" />
              {isBn ? 'অনুমোদন চেইন' : 'Approval Chain'}
            </div>
            <div style={{ color: '#93c5fd', fontSize: '11px', marginTop: '2px' }}>
              {isBn ? 'প্রিন্টে কোন স্বাক্ষর দেখাবে তা নির্ধারণ করুন' : 'Configure approval signatures for print output'}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#fff' }}
            aria-label="Close"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        {/* Panel body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

          {/* ── 1. Prepared By ─────────────────────────────────────────── */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
              {isBn ? 'প্রস্তুতকারী' : 'Prepared By'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                style={inp}
                value={value.preparedBy}
                onChange={e => onChange({ ...value, preparedBy: e.target.value })}
                placeholder={isBn ? 'নাম' : 'Full name'}
                aria-label="Prepared by name"
              />
              <input
                style={inp}
                value={value.preparedByDesignation}
                onChange={e => onChange({ ...value, preparedByDesignation: e.target.value })}
                placeholder={isBn ? 'পদবী' : 'Designation'}
                aria-label="Prepared by designation"
              />
            </div>
          </div>

          {/* ── 2. Authority visibility ─────────────────────────────────── */}
          <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              <FaCheckSquare aria-hidden="true" />
              {isBn ? 'প্রিন্টে অন্তর্ভুক্ত করুন' : 'Include in Print Output'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {ALL_AUTHORITIES.map(a => {
                const visKey = visibilityMap[a.key];
                const checked = value.visibility[visKey];
                return (
                  <label
                    key={a.key}
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          '10px',
                      padding:      '8px 12px',
                      border:       `1.5px solid ${checked ? a.color + '40' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      cursor:       'pointer',
                      background:   checked ? a.bg : '#fafafa',
                      transition:   'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => onChange({
                        ...value,
                        visibility: { ...value.visibility, [visKey]: e.target.checked },
                      })}
                      style={{ width: '15px', height: '15px', accentColor: a.color, cursor: 'pointer' }}
                    />
                    {/* Colour icon */}
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: a.color + '18', border: `1.5px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, fontSize: '12px', flexShrink: 0 }}>
                      {a.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{a.name}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '1px' }}>{a.label}</div>
                    </div>
                    {checked && (
                      <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: a.color, background: a.color + '15', padding: '2px 8px', borderRadius: '10px' }}>
                        {isBn ? 'দৃশ্যমান' : 'Visible'}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>
              {isBn
                ? '* শুধুমাত্র নির্বাচিত কর্তৃপক্ষ প্রিন্টে দেখানো হবে'
                : '* Only checked authorities will appear in the printed document'
              }
            </div>
          </div>

          {/* ── 3. Signature placement ──────────────────────────────────── */}
          <div style={{ background: '#fafafa', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '10px' }}>
              {isBn ? 'স্বাক্ষর ব্লক স্থান' : 'Signature Block Placement'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([
                { value: 'last-page' as const, labelBn: 'শুধু শেষ পৃষ্ঠায়',   labelEn: 'Last page only', sub: 'Recommended' },
                { value: 'each-page' as const, labelBn: 'প্রতিটি পৃষ্ঠায়',    labelEn: 'Every page',    sub: 'Long docs'     },
              ]).map(opt => (
                <label
                  key={opt.value}
                  style={{
                    flex:         1,
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '8px',
                    padding:      '9px 12px',
                    border:       `1.5px solid ${value.signatureMode === opt.value ? '#1e40af' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor:       'pointer',
                    background:   value.signatureMode === opt.value ? '#eff6ff' : '#fff',
                    transition:   'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="sigMode"
                    value={opt.value}
                    checked={value.signatureMode === opt.value}
                    onChange={() => onChange({ ...value, signatureMode: opt.value })}
                    style={{ accentColor: '#1e40af' }}
                  />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                      {isBn ? opt.labelBn : opt.labelEn}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{opt.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── 4. Print preview strip ──────────────────────────────────── */}
          <div style={{ background: '#1e293b', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
              {isBn ? 'প্রিভিউ' : 'Preview'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${1 + visibleCount}, 1fr)`, borderTop: '1.5px solid #e2e8f0', background: '#fff', borderRadius: '6px' }}>
              {/* Prepared By */}
              <div style={{ borderRight: `1px solid #e2e8f0`, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ borderBottom: '1.5px solid #374151', height: '32px', marginBottom: '6px' }} />
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>{value.preparedBy || (isBn ? 'প্রস্তুতকারী' : 'Prepared By')}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>{value.preparedByDesignation || '—'}</div>
              </div>
              {/* Visible authorities */}
              {ALL_AUTHORITIES.filter(a => value.visibility[visibilityMap[a.key]]).map((a, i, arr) => (
                <div key={a.key} style={{ borderRight: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none', padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ borderBottom: '1.5px solid #374151', height: '32px', marginBottom: '6px' }} />
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>{a.name}</div>
                  <div style={{ fontSize: '9px', color: '#6b7280' }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '10.5px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
            {isBn ? 'মুদ্রিত দস্তাবেজে স্বাক্ষর ব্লক এভাবে দেখাবে' : 'This is how the signature block will appear in the printed document'}
          </div>
        </div>

        {/* Panel footer */}
        <div style={{ padding: '12px 16px', borderTop: '1.5px solid #e2e8f0', flexShrink: 0, background: '#f8fafc' }}>
          <button
            onClick={() => setOpen(false)}
            style={{ width: '100%', padding: '9px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {isBn ? '✓ সম্পন্ন করুন' : '✓ Done'}
          </button>
        </div>
      </div>
    </>
  );
}