// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY CONTROL MODULE
//
// Central management for document authorization settings.
// Replaces the per-module AuthorizationBlock with one master configuration
// that all modules read via the useAuthority() hook.
//
// Features:
//   • Per-factory authority configuration (names, designations, both languages)
//   • Per-module prepared-by override
//   • Visibility control per authority per module
//   • Signature placement setting (each page / last page)
//   • Live print preview of the signature block
//   • Saves to Google Sheets (authorities sheet) — loads on app start
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import {
  FaSave, FaUndo, FaEye, FaPrint, FaCheckCircle,
  FaUserTie, FaBuilding, FaChevronDown, FaChevronUp,
  FaInfoCircle,
} from 'react-icons/fa';
import ModuleHeader from '../common/ModuleHeader';
import ModuleNavBar from '../common/ModuleNavBar';
import { useFactory } from '../../hooks/useFactory';
import { useAuth } from '../../context/AuthContext';
import { DataUseCases } from '../../business/DataUseCases';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthorityPerson {
  nameEn:        string;
  nameBn:        string;
  designationEn: string;
  designationBn: string;
}

export interface ModuleAuthority {
  moduleId:      string;
  moduleLabel:   string;
  preparedBy:    string;
  preparedByDesignation: string;
  showFactoryHead:      boolean;
  showHrManager:        boolean;
  showHoHrHead:         boolean;
  showHeadOfOperations: boolean;
  signatureMode:        'each-page' | 'last-page';
}

export interface AuthorityConfig {
  factoryId:         string;
  factoryHead:       AuthorityPerson;
  hrManager:         AuthorityPerson;
  hoHrHead:          AuthorityPerson;
  headOfOperations:  AuthorityPerson;
  moduleOverrides:   ModuleAuthority[];
  updatedAt:         string;
  updatedBy:         string;
}

// ── Modules list ──────────────────────────────────────────────────────────────

const HR_MODULES = [
  { id: 'settlement',   label: 'চূড়ান্ত পাওনা',          labelEn: 'Final Settlement'     },
  { id: 'maternity',    label: 'মাতৃত্ব সুবিধা',          labelEn: 'Maternity Benefit'    },
  { id: 'leftnotice',   label: 'অনুপস্থিতির নোটিশ',      labelEn: 'Left Worker Notice'   },
  { id: 'personalfile', label: 'কর্মী ব্যক্তিগত ফাইল',   labelEn: 'Personal File'        },
  { id: 'requisition',  label: 'স্টাফ রিকুইজিশন',        labelEn: 'Requisition'          },
  { id: 'increment',    label: 'বেতন বৃদ্ধির বিল',        labelEn: 'Salary Increment'     },
  { id: 'meeting',      label: 'সভার কার্যবিবরণী',        labelEn: 'Meeting Minutes'      },
];

// ── Build initial config from factory ────────────────────────────────────────

function buildInitialConfig(factory: ReturnType<typeof useFactory>): AuthorityConfig {
  const auth = factory.authorities;
  return {
    factoryId: factory.id,
    factoryHead:      { nameEn: auth.factoryHead.nameEn,      nameBn: auth.factoryHead.name,      designationEn: auth.factoryHead.designationEn,      designationBn: auth.factoryHead.designation      },
    hrManager:        { nameEn: auth.hrManager.nameEn,        nameBn: auth.hrManager.name,        designationEn: auth.hrManager.designationEn,        designationBn: auth.hrManager.designation        },
    hoHrHead:         { nameEn: auth.hoHrHead.nameEn,         nameBn: auth.hoHrHead.name,         designationEn: auth.hoHrHead.designationEn,         designationBn: auth.hoHrHead.designation         },
    headOfOperations: { nameEn: auth.headOfOperations.nameEn, nameBn: auth.headOfOperations.name, designationEn: auth.headOfOperations.designationEn, designationBn: auth.headOfOperations.designation },
    moduleOverrides: HR_MODULES.map(m => ({
      moduleId:              m.id,
      moduleLabel:           m.label,
      preparedBy:            '',
      preparedByDesignation: '',
      showFactoryHead:       true,
      showHrManager:         true,
      showHoHrHead:          true,
      showHeadOfOperations:  true,
      signatureMode:         'last-page' as const,
    })),
    updatedAt: '',
    updatedBy: '',
  };
}

// ── Person Editor (one signatory row) ─────────────────────────────────────────

function PersonEditor({
  label, value, onChange,
}: {
  label: string;
  value: AuthorityPerson;
  onChange: (next: AuthorityPerson) => void;
}) {
  const [open, setOpen] = useState(false);

  const inp: React.CSSProperties = {
    width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', fontSize: '13px', color: '#1e293b',
    background: '#fafafa', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = { fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' };

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUserTie aria-hidden="true" style={{ color: '#1e40af', fontSize: '14px' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a5f' }}>{label}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{value.nameEn || '(not set)'}</div>
          </div>
        </div>
        {open
          ? <FaChevronUp   aria-hidden="true" style={{ color: '#94a3b8', fontSize: '12px' }} />
          : <FaChevronDown aria-hidden="true" style={{ color: '#94a3b8', fontSize: '12px' }} />
        }
      </button>

      {open && (
        <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={lbl}>Name (English)</label>
            <input style={inp} value={value.nameEn}
              onChange={e => onChange({ ...value, nameEn: e.target.value })}
              placeholder="Full name in English"
            />
          </div>
          <div>
            <label style={lbl}>নাম (বাংলা)</label>
            <input style={inp} value={value.nameBn}
              onChange={e => onChange({ ...value, nameBn: e.target.value })}
              placeholder="বাংলায় পূর্ণ নাম"
            />
          </div>
          <div>
            <label style={lbl}>Designation (English)</label>
            <input style={inp} value={value.designationEn}
              onChange={e => onChange({ ...value, designationEn: e.target.value })}
              placeholder="Job title in English"
            />
          </div>
          <div>
            <label style={lbl}>পদবী (বাংলা)</label>
            <input style={inp} value={value.designationBn}
              onChange={e => onChange({ ...value, designationBn: e.target.value })}
              placeholder="বাংলায় পদবী"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Module Override Row ───────────────────────────────────────────────────────

function ModuleRow({
  override, authorities, onChange,
}: {
  override:    ModuleAuthority;
  authorities: AuthorityConfig;
  onChange:    (next: ModuleAuthority) => void;
}) {
  const [open, setOpen] = useState(false);

  const inp: React.CSSProperties = {
    width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', fontSize: '13px', color: '#1e293b',
    background: '#fafafa', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const authorities_list = [
    { key: 'showFactoryHead'      as const, person: authorities.factoryHead      },
    { key: 'showHrManager'        as const, person: authorities.hrManager        },
    { key: 'showHoHrHead'         as const, person: authorities.hoHrHead         },
    { key: 'showHeadOfOperations' as const, person: authorities.headOfOperations },
  ];

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: open ? '#eff6ff' : '#f8fafc', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBuilding aria-hidden="true" style={{ color: '#1e40af', fontSize: '13px' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a5f' }}>{override.moduleLabel}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {override.preparedBy || 'Default prepared-by'} · {override.signatureMode === 'each-page' ? 'Every page' : 'Last page only'}
            </div>
          </div>
        </div>
        {open
          ? <FaChevronUp   aria-hidden="true" style={{ color: '#94a3b8', fontSize: '12px' }} />
          : <FaChevronDown aria-hidden="true" style={{ color: '#94a3b8', fontSize: '12px' }} />
        }
      </button>

      {open && (
        <div style={{ padding: '14px', background: '#fff' }}>
          {/* Prepared By */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
                Prepared By (override)
              </label>
              <input style={inp} value={override.preparedBy}
                onChange={e => onChange({ ...override, preparedBy: e.target.value })}
                placeholder="Leave blank to use module default"
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
                Designation
              </label>
              <input style={inp} value={override.preparedByDesignation}
                onChange={e => onChange({ ...override, preparedByDesignation: e.target.value })}
                placeholder="e.g. Manager (HR)"
              />
            </div>
          </div>

          {/* Visibility checkboxes */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Authority Signatures Visible in Print
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {authorities_list.map(a => (
                <label key={a.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: override[a.key] ? '#eff6ff' : '#fafafa' }}>
                  <input
                    type="checkbox"
                    checked={override[a.key]}
                    onChange={e => onChange({ ...override, [a.key]: e.target.checked })}
                    style={{ accentColor: '#1e40af', width: '15px', height: '15px' }}
                  />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{a.person.nameEn}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{a.person.designationEn}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Signature placement */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Signature Block Placement
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([
                { value: 'last-page', label: 'Last page only', sub: 'Recommended' },
                { value: 'each-page', label: 'Every page',     sub: 'For long docs' },
              ] as const).map(opt => (
                <label key={opt.value} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: `1.5px solid ${override.signatureMode === opt.value ? '#1e40af' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', background: override.signatureMode === opt.value ? '#eff6ff' : '#fafafa' }}>
                  <input type="radio" name={`sigMode-${override.moduleId}`} value={opt.value}
                    checked={override.signatureMode === opt.value}
                    onChange={() => onChange({ ...override, signatureMode: opt.value })}
                    style={{ accentColor: '#1e40af' }}
                  />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{opt.label}</div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>{opt.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Signature Preview ─────────────────────────────────────────────────────────

function SignaturePreview({ config }: { config: AuthorityConfig }) {
  const visibleAuthorities = [
    { person: config.factoryHead,      label: 'Authorized By', show: false },
    { person: config.hrManager,        label: 'Authorized By', show: true },
    { person: config.hoHrHead,         label: 'Approved By',   show: true },
    { person: config.headOfOperations, label: 'Approved By',   show: true },
  ];
  const defaultPrep = { nameEn: 'Prepared By', designationEn: '' };
  const cols = [defaultPrep, ...visibleAuthorities.filter(a => a.show).map(a => a.person)];

  return (
    <div style={{ border: '1.5px solid #1e3a5f', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
      <div style={{ background: '#1e3a5f', padding: '8px 14px', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
        <FaEye aria-hidden="true" style={{ marginRight: '6px' }} />
        Signature Block Preview
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, borderTop: '2px solid #1e293b' }}>
          {cols.map((col, i) => (
            <div key={i} style={{ borderRight: i < cols.length - 1 ? '1px solid #e2e8f0' : 'none', padding: '14px 10px 10px', textAlign: 'center' }}>
              <div style={{ borderBottom: '1.5px solid #374151', height: '44px', marginBottom: '8px' }} />
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>{col.nameEn}</div>
              <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '2px' }}>{col.designationEn}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
          This is how the signature block will appear on printed documents
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AuthorityControl() {
  const factory    = useFactory();
  const { user }   = useAuth();
  const configured = DataUseCases.isConfigured(factory.id);

  const [config,    setConfig]    = useState<AuthorityConfig>(() => buildInitialConfig(factory));
  const [isSaving,  setIsSaving]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'authorities' | 'modules' | 'preview'>('authorities');

  // ── Load from Sheets ───────────────────────────────────────────────────────
  const loadConfig = useCallback(async () => {
    if (!configured) return;
    setIsLoading(true);
    setError(null);
    const result = await DataUseCases.load('employees', factory.id, 10);
    // Authority config is stored with a special ID prefix "AUTH-CTRL-"
    if (result.ok) {
      const authRecord = result.records.find(r => String(r.id).startsWith('AUTH-CTRL-'));
      if (authRecord?.configJson) {
        try {
          const parsed = JSON.parse(String(authRecord.configJson));
          setConfig(parsed);
        } catch { /* use default */ }
      }
    }
    setIsLoading(false);
  }, [factory.id, configured]);

  // ── Save to Sheets ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!configured) { setError('Google Sheets not configured'); return; }
    setIsSaving(true);
    setError(null);
    const record = {
      fullName:    'AUTHORITY_CONTROL_CONFIG',
      cardNo:      'AUTH-CTRL',
      designation: 'System',
      department:  'Authority Control',
      configJson:  JSON.stringify({ ...config, updatedAt: new Date().toISOString(), updatedBy: user?.name ?? '' }),
      status:      'System',
    };
    const result = await DataUseCases.save('employees', record, factory.id, user?.name ?? '');
    setIsSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error ?? 'Save failed');
    }
  };

  const handleReset = () => setConfig(buildInitialConfig(factory));

  const updateAuthority = (key: keyof AuthorityConfig, value: AuthorityPerson) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateModuleOverride = (moduleId: string, next: ModuleAuthority) => {
    setConfig(prev => ({
      ...prev,
      moduleOverrides: prev.moduleOverrides.map(m => m.moduleId === moduleId ? next : m),
    }));
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const S = {
    page: { minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Noto Sans Bengali', Arial, sans-serif" } as React.CSSProperties,
    inner: { maxWidth: '900px', margin: '0 auto', padding: '20px 16px' } as React.CSSProperties,
    card: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px', overflow: 'hidden' } as React.CSSProperties,
    cardHeader: { background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#1e3a5f', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    cardBody: { padding: '16px' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <ModuleHeader
          moduleName="কর্তৃপক্ষ নিয়ন্ত্রণ"
          moduleNameEn="Authority Control"
        />
        <ModuleNavBar
          lang="en"
          tabs={[
            { id: 'authorities', label: 'কর্তৃপক্ষ'   },
            { id: 'modules',     label: 'মডিউল সেটিং' },
            { id: 'preview',     label: 'প্রিভিউ'      },
          ]}
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab as typeof activeTab)}
          onSave={async () => { await handleSave(); return true; }}
          isSaving={isSaving}
          onPrint={() => window.print()}
        />


      <div style={S.inner}>
        {/* ── Errors / Status ── */}
        {error && (
          <div role="alert" style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#dc2626' }}>
            ⚠️ {error}
          </div>
        )}

        {!configured && (
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', fontSize: '13px', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FaInfoCircle aria-hidden="true" style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <strong>Google Sheets not configured.</strong> Changes made here will apply to this session only.
              Configure <code>src/config/sheets.ts</code> to save authority settings permanently.
            </div>
          </div>
        )}

        {/* ── TAB: Authorities ── */}
        {activeTab === 'authorities' && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <FaUserTie aria-hidden="true" />
              কর্তৃপক্ষের নাম ও পদবী সম্পাদনা
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>
                Factory: {factory.nameEn}
              </span>
            </div>
            <div style={S.cardBody}>
              <PersonEditor
                label="Factory Head — কারখানা প্রধান"
                value={config.factoryHead}
                onChange={v => updateAuthority('factoryHead', v)}
              />
              <PersonEditor
                label="HR Manager — মানবসম্পদ ব্যবস্থাপক"
                value={config.hrManager}
                onChange={v => updateAuthority('hrManager', v)}
              />
              <PersonEditor
                label="HO HR Head — প্রধান কার্যালয় এইচআর প্রধান"
                value={config.hoHrHead}
                onChange={v => updateAuthority('hoHrHead', v)}
              />
              <PersonEditor
                label="Head of Operations — পরিচালন প্রধান"
                value={config.headOfOperations}
                onChange={v => updateAuthority('headOfOperations', v)}
              />
            </div>
          </div>
        )}

        {/* ── TAB: Module Settings ── */}
        {activeTab === 'modules' && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <FaBuilding aria-hidden="true" />
              মডিউল-ভিত্তিক অনুমোদন সেটিং
            </div>
            <div style={S.cardBody}>
              <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '12.5px', color: '#1e40af' }}>
                💡 প্রতিটি মডিউলে আলাদা "Prepared By" ও স্বাক্ষর ব্লক দৃশ্যমানতা নির্ধারণ করুন।
                ফাঁকা রাখলে মডিউলের নিজস্ব সেটিং ব্যবহার হবে।
              </div>
              {config.moduleOverrides.map(override => (
                <ModuleRow
                  key={override.moduleId}
                  override={override}
                  authorities={config}
                  onChange={next => updateModuleOverride(override.moduleId, next)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Preview ── */}
        {activeTab === 'preview' && (
          <div>
            <div style={{ ...S.card }}>
              <div style={S.cardHeader}>
                <FaEye aria-hidden="true" />
                স্বাক্ষর ব্লক প্রিভিউ
              </div>
              <div style={S.cardBody}>
                <SignaturePreview config={config} />
              </div>
            </div>

            {/* Per-module preview */}
            {config.moduleOverrides.slice(0, 3).map(override => {
              const visibleCols = [
                { person: { nameEn: override.preparedBy || 'Prepared By', designationEn: override.preparedByDesignation }, label: 'Prepared By' },
                override.showFactoryHead      && { person: config.factoryHead,      label: 'Authorized By' },
                override.showHrManager        && { person: config.hrManager,        label: 'Authorized By' },
                override.showHoHrHead         && { person: config.hoHrHead,         label: 'Approved By'   },
                override.showHeadOfOperations && { person: config.headOfOperations, label: 'Approved By'   },
              ].filter(Boolean) as { person: { nameEn: string; designationEn: string }; label: string }[];

              return (
                <div key={override.moduleId} style={{ ...S.card, marginBottom: '12px' }}>
                  <div style={S.cardHeader}>
                    {override.moduleLabel}
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>
                      {override.signatureMode === 'each-page' ? 'Every page' : 'Last page only'}
                    </span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleCols.length}, 1fr)`, borderTop: '2px solid #1e293b' }}>
                      {visibleCols.map((col, i) => (
                        <div key={i} style={{ borderRight: i < visibleCols.length - 1 ? '1px solid #e2e8f0' : 'none', padding: '12px 8px 8px', textAlign: 'center' }}>
                          <div style={{ borderBottom: '1.5px solid #374151', height: '36px', marginBottom: '6px' }} />
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{col.person.nameEn}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{col.person.designationEn}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px', fontStyle: 'italic' }}>{col.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1.5px solid #374151', borderRadius: '8px', background: 'transparent', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <FaPrint aria-hidden="true" />
              Print Authority Settings
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
