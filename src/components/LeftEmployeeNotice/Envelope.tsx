// ─────────────────────────────────────────────────────────────────────────────
// Envelope.tsx
//
// REBUILT to match a real-world envelope reference photo, rather than a
// "designed template" look:
//  - FROM block: top-left, simple stacked lines (name/title, org/street, city)
//  - Reserved blank box top-right for a postage stamp / speed-post sticker
//  - TO block: starts roughly a third down the envelope, flows naturally as
//    wrapped lines (not separate labeled গ্রাম/ডাকঘর/থানা/জেলা fields)
//  - No decorative flap graphic or postal lines — a real envelope doesn't
//    have those printed on it
//
// Still drawn at real DL dimensions (220mm x 110mm) using flexbox flow
// layout (not absolute positioning with magic offsets) so content can never
// overlap regardless of address length — same fix rationale as before.
// ─────────────────────────────────────────────────────────────────────────────

import { useFactory } from '../../hooks/useFactory';
import React from 'react';
import { Employee, Address } from '../../types/LeftNoticeDataType';
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';

interface Props {
  employee: Employee;
  /** Which envelope(s) to render — defaults to both (present + permanent) */
  addressType?: 'present' | 'permanent' | 'both';
}

interface EnvelopeCardProps {
  employee: Employee;
  address: Address;
  addressLabel: string; // small header above the TO block, e.g. "Speed Post — Present Address"
}

// ── Single envelope — fixed DL dimensions (220mm x 110mm), flow layout ───────
function EnvelopeCard({ employee, address, addressLabel }: EnvelopeCardProps) {
  const factory = useFactory();

  const addressLines = [address.houseNo, address.village, address.postOffice, address.thana, address.district]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="envelope-container">
      <div className="envelope">

        {/* Top row: FROM (left) + reserved stamp area (right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '55%' }}>
            <p style={{ fontSize: '8pt', fontWeight: 700, color: '#111827', margin: 0, textDecoration: 'underline' }}>From</p>
            <p style={{ fontSize: '9pt', fontWeight: 700, color: '#111827', margin: '3pt 0 0' }}>
              {employee.companyName || factory.nameEn}
            </p>
            <p style={{ fontSize: '8pt', color: '#374151', margin: '1pt 0 0', lineHeight: 1.35 }}>
              {employee.companyAddress || '32, Lakshmipura, Chandana, Joydevpur, Gazipur-1700'}
            </p>
          </div>

          {/* Reserved stamp / speed-post sticker area */}
          <div style={{
            width: '32mm', height: '18mm', flexShrink: 0,
            border: '1px dashed #9ca3af', borderRadius: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '6.5pt', color: '#9ca3af' }}>Postage / Stamp</span>
          </div>
        </div>

        {/* TO block — starts roughly a third down, flows naturally */}
        <div style={{ marginTop: '14mm' }}>
          <p style={{ fontSize: '10pt', fontWeight: 700, color: '#111827', margin: 0 }}>To</p>
          <p style={{ fontSize: '9pt', fontWeight: 700, color: '#111827', margin: '5pt 0 3pt', textDecoration: 'underline' }}>
            {addressLabel}
          </p>
          <p style={{ fontSize: '11pt', fontWeight: 700, color: '#111827', margin: '4pt 0 0' }}>
            {employee.name || 'Employee Name'}
          </p>
          {(employee.fatherName || employee.husbandName) && (
            <p style={{ fontSize: '8.5pt', color: '#1f2937', margin: '2pt 0 0' }}>
              {employee.fatherName ? `son/daughter of ${employee.fatherName}` : `wife of ${employee.husbandName}`}
            </p>
          )}
          {addressLines && (
            <p style={{ fontSize: '9.5pt', color: '#1f2937', margin: '4pt 0 0', lineHeight: 1.6, maxWidth: '85%' }}>
              {addressLines}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export const Envelope: React.FC<Props> = ({ employee, addressType = 'both' }) => {
  const showPresent   = addressType === 'present'   || addressType === 'both';
  const showPermanent = addressType === 'permanent' || addressType === 'both';

  return (
    <div className="envelope-page">
      {showPresent && (
        <EnvelopeCard
          employee={employee}
          address={employee.presentAddress}
          addressLabel="বর্তমান ঠিকানা (Present Address)"
        />
      )}

      {showPermanent && (
        <EnvelopeCard
          employee={employee}
          address={employee.permanentAddress}
          addressLabel="স্থায়ী ঠিকানা (Permanent Address)"
        />
      )}

      {/* Styles — envelope is drawn at real DL dimensions (220mm x 110mm),
          screen and print both use the SAME fixed size so what you see in
          the in-app preview matches what prints. */}
      <style>{`
        ${BASE_PRINT_CSS}
        ${PAGE_A4_PORTRAIT}

        .envelope-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 24px 0;
          width: 100%;
          overflow-x: auto;
        }

        .envelope-container {
          width: 220mm;
          flex-shrink: 0;
        }

        .envelope {
          position: relative;
          width: 220mm;
          height: 110mm;
          background: #fff;
          border: 1px solid #d1d5db;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          box-sizing: border-box;
          padding: 10mm 12mm;
        }

        @media print {
          /* ModuleShell's root container (and other ancestors) carry
             overflow:hidden as an inline style which clips its rendered
             content box regardless of child positioning. Since this is a
             shared component we can't edit, force every ancestor to
             overflow:visible in print so our position:absolute envelope
             page isn't clipped to a tiny visible region. */
          html, body, body * {
            overflow: visible !important;
          }

          html, body { width: 210mm; height: auto; }
          .envelope-page {
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            width: 210mm;
            padding: 0;
            gap: 0;
            overflow: visible;
          }
          .envelope-container {
            width: 220mm;
            margin: 35mm auto 0;
            page-break-after: always;
            page-break-inside: avoid;
          }
          .envelope-container:last-child { page-break-after: avoid; }
          .envelope {
            box-shadow: none;
            border: 1px solid #000;
          }
        }
      `}</style>
    </div>
  );
};

export default Envelope;