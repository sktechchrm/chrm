// ─────────────────────────────────────────────────────────────────────────────
// ModuleHeader — Top header row only (matches attached image)
//
// Layout:
//   ┌──────────────────────────────────────────────────────────────────────┐
//   │  MG SHIRTEX LTD.            মাতৃত্বকালীন সুবিধা         তারিখ: □  │
//   │  32, Lakshmipura...          Maternity Benefit                       │
//   └──────────────────────────────────────────────────────────────────────┘
//
// The tab+button row is handled separately by ModuleNavBar.
// ─────────────────────────────────────────────────────────────────────────────

import { useFactory } from '../../hooks/useFactory';

export interface ModuleTab {
  label:     string;
  value:     string;
  disabled?: boolean;
}

interface ModuleHeaderProps {
  moduleName:    string;      // Bangla — displayed large/bold in centre
  moduleNameEn?: string;      // English — smaller subtitle
  date?:         string;      // ISO date value
  onDateChange?: (date: string) => void;
  children?:     React.ReactNode;  // Slot below the header row
}

export default function ModuleHeader({
  moduleName, moduleNameEn, date, onDateChange, children,
}: ModuleHeaderProps) {
  const factory = useFactory();

  return (
    <div style={{ fontFamily: "'Noto Sans Bengali', Arial, sans-serif" }}>

      {/* ── Single header row: Factory | Module | Date ─────────────────── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems:          'center',
        padding:             '8px 16px',
        background:          '#ffffff',
        borderBottom:        '1.5px solid #e2e8f0',
        gap:                 '12px',
        minHeight:           '52px',
      }}>

        {/* Left — Factory name + address */}
        <div>
          <div style={{
            fontSize:   '14px',
            fontWeight: 800,
            color:      '#1e3a5f',
            lineHeight: 1.25,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>
            {factory.nameEn}
          </div>
          <div style={{
            fontSize:  '11px',
            color:     '#64748b',
            marginTop: '2px',
            lineHeight: 1.3,
          }}>
            {factory.addressEn}
          </div>
        </div>

        {/* Centre — Module name */}
        <div style={{ textAlign: 'center', minWidth: '200px' }}>
          <div style={{
            fontSize:   '18px',
            fontWeight: 800,
            color:      '#1e3a5f',
            lineHeight: 1.2,
          }}>
            {moduleName}
          </div>
          {moduleNameEn && (
            <div style={{
              fontSize:  '11.5px',
              color:     '#6b7280',
              marginTop: '2px',
            }}>
              {moduleNameEn}
            </div>
          )}
        </div>

        {/* Right — Date */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        '6px',
            fontSize:   '12px',
            fontWeight: 600,
            color:      '#374151',
          }}>
            <span>তারিখ:</span>
            {onDateChange ? (
              <input
                type="date"
                value={date || ''}
                onChange={e => onDateChange(e.target.value)}
                aria-label="Document date"
                style={{
                  border:       'none',
                  borderBottom: '1.5px solid #94a3b8',
                  background:   'transparent',
                  fontSize:     '12px',
                  color:        '#374151',
                  outline:      'none',
                  cursor:       'pointer',
                  fontFamily:   'inherit',
                  padding:      '1px 2px',
                }}
              />
            ) : (
              <span style={{ borderBottom: '1.5px solid #94a3b8', paddingBottom: '1px' }}>
                {date || 'mm/dd/yyyy'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Slot for children (e.g. ModuleNavBar injected below) */}
      {children}
    </div>
  );
}
