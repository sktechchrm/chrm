// ─────────────────────────────────────────────────────────────────────────────
// AuthorizationBlock — Shared signature/authorization section
//
// Pulled from all HR modules into one place.
// Reads authority names from the factory config automatically.
// Each factory defines its own signatories in its factory file.
//
// Layout:
//   ┌─────────────────────────────────────────────────────────────────┐
//   │  Prepared By        Authorized By       Approved By             │
//   │  [Name / Desig]     [checkbox list]     [radio: page placement] │
//   └─────────────────────────────────────────────────────────────────┘
//
// Usage:
//   <AuthorizationBlock
//     value={authState}
//     onChange={setAuthState}
//   />
// ─────────────────────────────────────────────────────────────────────────────

import { useFactory } from '../../hooks/useFactory';

// ── Types (exported so modules can use them in their state) ───────────────────

export interface AuthorityVisibility {
  factoryHead:      boolean;
  hrManager:        boolean;
  hoHrHead:         boolean;
  headOfOperations: boolean;
  /** Optional — only used by modules that set president/secretary below (e.g. Meeting Minutes) */
  president?:       boolean;
  secretary?:       boolean;
}

export interface AuthorizationState {
  /** Person who prepared the document */
  preparedBy:            string;
  preparedByDesignation: string;
  /** Which authority rows to show in print output */
  visibility:            AuthorityVisibility;
  /** Whether signature block prints on every page or only the last */
  signatureMode:         'each-page' | 'last-page';
  /** Optional — committee president/secretary signatories, used only by
   *  Meeting Minutes. Unlike the 4 roles above (always pulled live from
   *  factory.authorities), these come from the meeting's selected
   *  Committee, which varies per meeting, so the name/designation are
   *  supplied directly here rather than read from factory config. */
  president?:            string;
  presidentDesignation?: string;
  secretary?:            string;
  secretaryDesignation?: string;
}

export const DEFAULT_AUTHORIZATION: AuthorizationState = {
  preparedBy:            '',
  preparedByDesignation: '',
  visibility: {
    factoryHead:      true,
    hrManager:        true,
    hoHrHead:         true,
    headOfOperations: true,
  },
  signatureMode: 'last-page',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  value:    AuthorizationState;
  onChange: (next: AuthorizationState) => void;
  /** If true, renders a compact print-ready signature row instead of the form */
  printMode?: boolean;
  /** Label language: 'en' | 'bn' */
  lang?: 'en' | 'bn';
}

// ── Labels ────────────────────────────────────────────────────────────────────

const L = {
  en: {
    title:        'Authorization',
    preparedBy:   'Prepared By',
    designation:  'Designation',
    authorities:  'Authority Signatures in View',
    hideHint:     'uncheck to hide from print',
    sigBlock:     'Signature Block',
    eachPage:     'Each page',
    lastPage:     'Last page only',
    prepared:     'Prepared By',
    authorized:   '',
    approved:     '',
    president:    '',
    secretary:    '',
    signature:    'Signature',
  },
  bn: {
    title:        'অনুমোদন',
    preparedBy:   'প্রস্তুতকারী',
    designation:  'পদবী',
    authorities:  'স্বাক্ষর ব্লক দৃশ্যমানতা',
    hideHint:     'আনচেক করলে প্রিন্টে দেখাবে না',
    sigBlock:     'স্বাক্ষর ব্লক',
    eachPage:     'প্রতিটি পৃষ্ঠায়',
    lastPage:     'শুধু শেষ পৃষ্ঠায়',
    prepared:     'প্রস্তুতকারী',
    authorized:   '',
    approved:     '',
    president:    '',
    secretary:    '',
    signature:    'স্বাক্ষর',
  },
};

// ── Print mode — clean signature row ─────────────────────────────────────────

function PrintSignatureRow({ value, lang = 'en', hidePrepared = false }: { value: AuthorizationState; lang?: 'en' | 'bn'; /** Hide the "Prepared By" column — used by modules with a single-signatory approval chain (e.g. Left Notice letters) */ hidePrepared?: boolean }) {
  const factory = useFactory();
  const auth    = factory.authorities;
  const t       = L[lang];

  const cols: { label: string; name: string; desig: string; show: boolean }[] = [
    {
      label: t.prepared,
      name:  value.preparedBy,
      desig: value.preparedByDesignation,
      show:  !hidePrepared,
    },
    {
      label: t.authorized,
      name:  lang === 'bn' ? auth.hrManager.name      : auth.hrManager.nameEn,
      desig: lang === 'bn' ? auth.hrManager.designation : auth.hrManager.designationEn,
      show:  value.visibility.hrManager,
    },
    {
      label: t.authorized,
      name:  lang === 'bn' ? auth.factoryHead.name      : auth.factoryHead.nameEn,
      desig: lang === 'bn' ? auth.factoryHead.designation : auth.factoryHead.designationEn,
      show:  value.visibility.factoryHead,
    },
    {
      label: t.approved,
      name:  lang === 'bn' ? auth.hoHrHead.name      : auth.hoHrHead.nameEn,
      desig: lang === 'bn' ? auth.hoHrHead.designation : auth.hoHrHead.designationEn,
      show:  value.visibility.hoHrHead,
    },
    {
      label: t.approved,
      name:  lang === 'bn' ? auth.headOfOperations.name      : auth.headOfOperations.nameEn,
      desig: lang === 'bn' ? auth.headOfOperations.designation : auth.headOfOperations.designationEn,
      show:  value.visibility.headOfOperations,
    },
    {
      // President/Secretary — only used by Meeting Minutes. Name/designation
      // come from the state itself (set from the meeting's selected
      // Committee), not from factory.authorities like the 4 roles above.
      label: t.president,
      name:  value.president ?? '',
      desig: value.presidentDesignation ?? '',
      show:  !!(value.visibility.president && value.president),
    },
    {
      label: t.secretary,
      name:  value.secretary ?? '',
      desig: value.secretaryDesignation ?? '',
      show:  !!(value.visibility.secretary && value.secretary),
    },
  ].filter(c => c.show);

  // Layout rule: 1 signatory -> single left-aligned column (not centered,
  // not stretched). 2+ signatories -> evenly spread columns from the left
  // edge to the right edge (existing grid behavior), with the first column
  // text-aligned left and the last column text-aligned right so they sit
  // at the true edges rather than all being centered.
  const isSingle = cols.length === 1;

  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: isSingle ? '1fr' : `repeat(${cols.length}, 1fr)`,
      gap:                 '0',
      borderTop:           '1.5px solid #374151',
      marginTop:           '24px',
      paddingTop:          '0',
      fontFamily:          "'Noto Sans Bengali', Arial, sans-serif",
    }}>
      {cols.map((col, i) => {
        const textAlign: 'left' | 'center' | 'right' =
          isSingle ? 'left' : i === 0 ? 'left' : i === cols.length - 1 ? 'right' : 'center';
        return (
        <div key={i} style={{
          borderRight: !isSingle && i < cols.length - 1 ? '1px solid white' : 'none',
          padding:      '16px 12px 10px',
          textAlign,
          maxWidth:     isSingle ? '260px' : undefined,
        }}>
          {/* Signature line */}
          <div style={{
            borderBottom: '1.5px solid #374151',
            height:       '52px',
            marginBottom: '6px',
          }} />
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
            {col.name}
          </div>
          <div style={{ fontSize: '10.5px', color: '#4b5563', marginTop: '2px' }}>
            {col.desig}
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', fontStyle: 'italic' }}>
            {col.label}
          </div>
        </div>
        );
      })}
    </div>
  );
}

// ── Form mode ─────────────────────────────────────────────────────────────────

export default function AuthorizationBlock({ value, onChange, printMode = false, lang = 'en' }: Props) {
  const factory = useFactory();
  const auth    = factory.authorities;
  const t       = L[lang];

  // In print mode — render clean signature row only
  if (printMode) {
    return <PrintSignatureRow value={value} lang={lang} />;
  }

  // ── Form UI ────────────────────────────────────────────────────────────────
  const S = {
    section: {
      border:       '1.5px solid #e2e8f0',
      borderRadius: '12px',
      overflow:     'hidden',
      fontFamily:   "'Noto Sans Bengali', Arial, sans-serif",
      marginBottom: '0',
    } as React.CSSProperties,
    header: {
      background:   '#f8fafc',
      borderBottom: '1.5px solid #e2e8f0',
      padding:      '10px 16px',
      fontSize:     '12.5px',
      fontWeight:   700,
      color:        '#1e3a5f',
      display:      'flex',
      alignItems:   'center',
      gap:          '8px',
    } as React.CSSProperties,
    body: {
      padding:             '16px',
      display:             'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap:                 '16px',
    } as React.CSSProperties,
    label: {
      display:      'block',
      fontSize:     '12px',
      fontWeight:   600,
      color:        '#374151',
      marginBottom: '6px',
    } as React.CSSProperties,
    input: {
      width:        '100%',
      padding:      '8px 12px',
      border:       '1.5px solid #e2e8f0',
      borderRadius: '8px',
      fontSize:     '13px',
      fontFamily:   'inherit',
      color:        '#1e293b',
      background:   '#fafafa',
      outline:      'none',
      boxSizing:    'border-box' as const,
      marginBottom: '8px',
    } as React.CSSProperties,
    checkRow: (last: boolean) => ({
      display:        'flex',
      alignItems:     'center',
      gap:            '10px',
      padding:        '8px 12px',
      borderBottom:   last ? 'none' : '1px solid #f1f5f9',
      cursor:         'pointer',
      background:     '#fafafa',
    } as React.CSSProperties),
    radioRow: (last: boolean) => ({
      display:      'flex',
      alignItems:   'center',
      gap:          '10px',
      padding:      '8px 12px',
      borderBottom: last ? 'none' : '1px solid #f1f5f9',
      cursor:       'pointer',
      background:   '#fafafa',
    } as React.CSSProperties),
  };

  const visibilityItems = [
    {
      key:   'factoryHead' as const,
      label: `${lang === 'bn' ? auth.factoryHead.designation : auth.factoryHead.designationEn}`,
    },
    {
      key:   'hrManager' as const,
      label: `${lang === 'bn' ? auth.hrManager.designation : auth.hrManager.designationEn}`,
    },
    {
      key:   'hoHrHead' as const,
      label: `${lang === 'bn' ? auth.hoHrHead.designation : auth.hoHrHead.designationEn}`,
    },
    {
      key:   'headOfOperations' as const,
      label: `${lang === 'bn' ? auth.headOfOperations.designation : auth.headOfOperations.designationEn}`,
    },
    // President/Secretary — only shown when the calling module has actually
    // set a name (e.g. Meeting Minutes, after selecting a committee). Label
    // comes from the state itself, not factory.authorities, since it varies
    // per meeting/committee rather than being a fixed factory setting.
    ...(value.president ? [{
      key:   'president' as const,
      label: value.presidentDesignation || (lang === 'bn' ? 'সভাপতি' : 'President'),
    }] : []),
    ...(value.secretary ? [{
      key:   'secretary' as const,
      label: value.secretaryDesignation || (lang === 'bn' ? 'সচিব' : 'Secretary'),
    }] : []),
  ];

  return (
    <div style={S.section}>
      <div style={S.header}>
        ✍️ {t.title}
      </div>
      <div style={S.body}>

        {/* Col 1 — Prepared By */}
        <div>
          <label style={S.label}>{t.preparedBy}</label>
          <input
            type="text"
            value={value.preparedBy}
            onChange={e => onChange({ ...value, preparedBy: e.target.value })}
            placeholder={t.preparedBy}
            style={S.input}
            aria-label={t.preparedBy}
          />
          <input
            type="text"
            value={value.preparedByDesignation}
            onChange={e => onChange({ ...value, preparedByDesignation: e.target.value })}
            placeholder={t.designation}
            style={{ ...S.input, marginBottom: 0 }}
            aria-label={t.designation}
          />
        </div>

        {/* Col 2 — Authority visibility checkboxes */}
        <div>
          <label style={S.label}>
            {t.authorities}
            <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 400, color: '#9ca3af', marginTop: '2px' }}>
              {t.hideHint}
            </span>
          </label>
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {visibilityItems.map((item, i) => (
              <label key={item.key} style={S.checkRow(i === visibilityItems.length - 1)}>
                <input
                  type="checkbox"
                  checked={value.visibility[item.key]}
                  onChange={e => onChange({
                    ...value,
                    visibility: { ...value.visibility, [item.key]: e.target.checked },
                  })}
                  style={{ width: '15px', height: '15px', accentColor: '#1e40af', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#374151' }}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Col 3 — Signature placement radio */}
        <div>
          <label style={S.label}>{t.sigBlock}</label>
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {([
              { value: 'each-page' as const, label: t.eachPage },
              { value: 'last-page' as const, label: t.lastPage },
            ]).map((opt, i) => (
              <label key={opt.value} style={S.radioRow(i === 1)}>
                <input
                  type="radio"
                  name={`sigMode-${Math.random()}`}
                  value={opt.value}
                  checked={value.signatureMode === opt.value}
                  onChange={() => onChange({ ...value, signatureMode: opt.value })}
                  style={{ width: '15px', height: '15px', accentColor: '#1e40af', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#374151' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Re-export PrintSignatureRow for use in print/bill views
export { PrintSignatureRow };