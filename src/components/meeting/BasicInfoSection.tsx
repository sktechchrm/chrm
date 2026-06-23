// ─────────────────────────────────────────────────────────────────────────────
// BasicInfoSection.tsx
//
// REWRITTEN — replaced the old 4-tab (প্রতিষ্ঠান / মিটিং বিবরণ / সময় ও স্থান
// / সভাপতি-সচিব) internal navigation with one single scrollable card:
//
//   মিটিং Schedule card:
//     কমিটি নির্বাচন | মিটিং ধরন | স্থান | মিটিং তারিখ | শুরু
//
//  Removed from form (appear dynamically in output only):
//    - প্রতিষ্ঠানের তথ্য section  (org name/address already in ModuleShell header)
//    - মিটিং নম্বর                 (auto-generated, shown in output)
//    - কমিটি প্রতিষ্ঠার তারিখ      (from committee config, shown in output)
//    - বিগত মিটিং রেফারেন্স       (removed from form entirely)
//    - নোটিশের তারিখ              (removed from form)
//    - সভাপতি / সচিব fields       (auto-filled from selected committee, shown in output)
//    - শেষ (end time) field        (auto-calculated = শুরু + 3h, shown in output)
//
//  Committee selection still auto-populates:
//    - chairperson/secretary → mirrored into AuthorizationState by MeetingManager
//    - attendees[] → committee members + 5 blank guest rows
//    - meetingEstablishDate, meetingNumber
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, memo } from 'react';
import {
  MeetingMinutes,
  MEETING_TYPES,
  generateMeetingNumber,
  Committee,
  Attendee,
  AgendaItem,
  generateId,
} from './MeetingMinutesTypes';
import { ALL_FACTORIES } from '../../factories/FactoryRegistry';
import { useFactory } from '../../hooks/useFactory';

// ── Venue quick-pick options ───────────────────────────────────────────────
const VENUE_OPTIONS = [
  'কনফারেন্স রুম', 'কনফারেন্স হল', 'বোর্ড রুম',
  'ট্রেনিং রুম', 'ডাইনিং হল', 'কারখানার প্রধান কক্ষ',
  'মিটিং রুম', 'অডিটোরিয়াম',
];

// ── Gender tally helper (kept for the summary hint) ───────────────────────
function computeCommitteeGender(committee: Committee | undefined) {
  if (!committee) return { male: 0, female: 0, total: 0 };
  const all: string[] = [];
  if (committee.chairpersonGender) all.push(committee.chairpersonGender);
  if (committee.secretaryGender)   all.push(committee.secretaryGender);
  for (const m of committee.members ?? []) if (m.gender) all.push(m.gender);
  return {
    male:   all.filter(g => g === 'পুরুষ').length,
    female: all.filter(g => g === 'মহিলা').length,
    total:  all.length,
  };
}

// ── Auto-calculate শেষ = শুরু + 3 hours ──────────────────────────────────
function addHours(timeStr: string, hours: number): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const endH = (h + hours) % 24;
  return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Time period badge (সকাল / বিকাল) ─────────────────────────────────────
function timePeriod(timeStr: string): { text: string; bg: string; color: string } | null {
  if (!timeStr) return null;
  const h = parseInt(timeStr.split(':')[0]);
  return h >= 12
    ? { text: 'বিকাল', bg: '#e0e7ff', color: '#4338ca' }
    : { text: 'সকাল',  bg: '#fef3c7', color: '#92400e' };
}

// ── Bangla serial number ───────────────────────────────────────────────────
const BANGLA_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
function toBangla(n: number): string {
  return String(n).split('').map(d => BANGLA_DIGITS[parseInt(d)] ?? d).join('');
}

// ── Blank agenda item factory ──────────────────────────────────────────────
function blankAgendaItem(index: number): AgendaItem {
  return {
    id:            generateId(),
    itemNumber:    String(index),
    topic:         '',
    presenter:     '',
    timeAllocated: '',
    discussion:    '',
    decisions:     [],
    actionItems:   [],
  };
}

interface Props {
  minutes: MeetingMinutes;
  setMinutes: (data: MeetingMinutes) => void;
}

function BasicInfoSection({ minutes, setMinutes }: Props) {
  const factory = useFactory();

  // Auto-lock org from login session on mount
  useEffect(() => {
    const f = ALL_FACTORIES.find(f => f.id === factory.id) ?? ALL_FACTORIES[0];
    if (f) setMinutes({
      ...minutes,
      organizationName:    f.name,
      organizationAddress: f.address,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory.id]);

  const update = (patch: Partial<MeetingMinutes>) => setMinutes({ ...minutes, ...patch });

  // ── Agenda CRUD ────────────────────────────────────────────────────────────
  const addAgendaItem = () => update({
    agendaItems: [...minutes.agendaItems, blankAgendaItem(minutes.agendaItems.length + 1)],
  });

  const updateAgendaTopic = (id: string, topic: string) => update({
    agendaItems: minutes.agendaItems.map(a => a.id === id ? { ...a, topic } : a),
  });

  const removeAgendaItem = (id: string) => update({
    agendaItems: minutes.agendaItems
      .filter(a => a.id !== id)
      .map((a, i) => ({ ...a, itemNumber: String(i + 1) })),
  });

  // ── Committee selection — populates attendees + chair/secretary + dates ──
  const handleCommitteeSelect = (committeeId: string) => {
    const src = (ALL_FACTORIES.find(f => f.name === minutes.organizationName) ?? ALL_FACTORIES[0])
      ?.committees ?? ALL_FACTORIES.flatMap(f => f.committees);
    const c = src.find(c => c.id === committeeId);
    if (!c) return;
    update({
      meetingTitle:         c.name,
      meetingEstablishDate: c.establishDate ?? minutes.meetingEstablishDate,
      meetingNumber:        generateMeetingNumber(),
      chairperson:          c.chairperson,
      secretary:            c.secretary,
      attendees:            buildAttendeesFromCommittee(c),
    });
  };

  const buildAttendeesFromCommittee = (c: Committee): Attendee[] => {
    const fromCommittee: Attendee[] = [
      {
        id: generateId(), name: c.chairperson,
        designation: c.chairpersonDesignation ?? '', department: c.chairpersonDept ?? '',
        email: '', attendanceStatus: 'Present', committeeRole: 'সভাপতি',
      },
      {
        id: generateId(), name: c.secretary,
        designation: c.secretaryDesignation ?? '', department: c.secretaryDept ?? '',
        email: '', attendanceStatus: 'Present', committeeRole: 'সচিব',
      },
      ...(c.members ?? []).map(m => ({
        id: generateId(), name: m.name,
        designation: m.designation, department: m.section,
        email: '', attendanceStatus: 'Present' as const, committeeRole: 'সদস্য',
      })),
    ];
    const guestRows: Attendee[] = Array.from({ length: 5 }, () => ({
      id: generateId(), name: '', designation: '', department: '',
      email: '', attendanceStatus: 'Present' as const, committeeRole: 'অতিথি',
    }));
    return [...fromCommittee, ...guestRows];
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const selectedFactory   = ALL_FACTORIES.find(f => f.name === minutes.organizationName);
  const committeeSource   = selectedFactory
    ? selectedFactory.committees
    : ALL_FACTORIES.flatMap(f => f.committees);
  const selectedCommittee = committeeSource.find(c => c.name === minutes.meetingTitle);
  const genderCount       = computeCommitteeGender(selectedCommittee);
  const startPeriod = timePeriod(minutes.startTime);

  return (
    <div className="bis-wrap">

      {/* ── Single card: মিটিং সময়সূচি ─── */}
      <div className="bis-card">
        <div className="bis-card-header">
          <i className="ti ti-calendar-event" aria-hidden="true" />
          <span>মিটিং সময়সূচি</span>
        </div>

        <div className="bis-body">

          {/* Row 1 — 2 fields: কমিটি (wide) + মিটিং ধরন */}
          <div className="bis-field bis-r1a">
            <label className="bis-label">কমিটি নির্বাচন *</label>
            <select
              className="bis-select"
              value={committeeSource.find(c => c.name === minutes.meetingTitle)?.id ?? ''}
              onChange={e => handleCommitteeSelect(e.target.value)}
            >
              <option value="">— কমিটি নির্বাচন করুন —</option>
              {committeeSource.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {selectedCommittee && (
              <p className="bis-hint bis-hint-green">
                ✓ সভাপতি: {selectedCommittee.chairperson} · সচিব: {selectedCommittee.secretary}
                {genderCount.total > 0 && (
                  <span> · মোট {genderCount.total} জন
                    (<span style={{ color: '#db2777' }}>নারী {genderCount.female}</span>
                    {' / '}
                    <span style={{ color: '#1d4ed8' }}>পুরুষ {genderCount.male}</span>)
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="bis-field bis-r1b">
            <label className="bis-label">মিটিং ধরন *</label>
            <select
              className="bis-select"
              value={minutes.meetingType}
              onChange={e => update({ meetingType: e.target.value as MeetingMinutes['meetingType'] })}
            >
              {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Row 2 — 3 fields: স্থান + তারিখ + শুরু */}
          <div className="bis-field bis-r2a">
            <label className="bis-label">স্থান *</label>
            <input
              type="text"
              className="bis-input"
              value={minutes.venue}
              onChange={e => update({ venue: e.target.value })}
              placeholder="কনফারেন্স রুম"
              list="bis-venue-list"
              lang="bn"
            />
            <datalist id="bis-venue-list">
              {VENUE_OPTIONS.map(v => <option key={v} value={v} />)}
            </datalist>
          </div>

          <div className="bis-field bis-r2b">
            <label className="bis-label">মিটিং তারিখ *</label>
            <input
              type="date"
              className="bis-input"
              value={minutes.meetingDate}
              onChange={e => update({ meetingDate: e.target.value })}
            />
          </div>

          <div className="bis-field bis-r2c">
            <label className="bis-label">শুরু *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="time"
                className="bis-input"
                value={minutes.startTime}
                onChange={e => {
                  const v = e.target.value;
                  update({ startTime: v, endTime: addHours(v, 3) });
                }}
                style={{ paddingRight: startPeriod ? 72 : 12 }}
              />
              {startPeriod && (
                <span className="bis-time-badge"
                  style={{ background: startPeriod.bg, color: startPeriod.color }}>
                  {startPeriod.text}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Agenda table card ─── */}
      <div className="bis-card" style={{ marginTop: 16 }}>
        <div className="bis-card-header">
          <i className="ti ti-list-check" aria-hidden="true" />
          <span>আলোচ্যসূচি</span>
          <button className="bis-add-btn" onClick={addAgendaItem}>
            <i className="ti ti-plus" aria-hidden="true" /> যোগ করুন
          </button>
        </div>

        <table className="bis-ag-table">
          <colgroup>
            <col style={{ width: 52 }} />
            <col />
            <col style={{ width: 44 }} />
          </colgroup>
          <thead>
            <tr>
              <th>ক্রম</th>
              <th style={{ textAlign: 'left' }}>আলোচ্যসূচি</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {minutes.agendaItems.length === 0 && (
              <tr>
                <td colSpan={3} className="bis-ag-empty">
                  কোনো আলোচ্যসূচি নেই — উপরে + যোগ করুন চাপুন
                </td>
              </tr>
            )}
            {minutes.agendaItems.map((item, i) => (
              <tr key={item.id}>
                <td className="bis-ag-sl">{toBangla(i + 1).padStart(2, '০')}</td>
                <td className="bis-ag-topic">
                  <input
                    type="text"
                    className="bis-ag-input"
                    value={item.topic}
                    onChange={e => updateAgendaTopic(item.id, e.target.value)}
                    placeholder="আলোচ্যসূচি লিখুন..."
                    lang="bn"
                  />
                </td>
                <td className="bis-ag-del">
                  <button
                    className="bis-ag-del-btn"
                    onClick={() => removeAgendaItem(item.id)}
                    title="মুছুন"
                    style={{
                      WebkitAppearance: 'none',
                      backgroundColor: '#fef2f2',
                      border: '1.5px solid #fca5a5',
                      color: '#ef4444',
                    }}
                  >
                    <i className="ti ti-x" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .bis-wrap { width: 100%; display: flex; flex-direction: column; gap: 0; }

        .bis-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;
        }
        .bis-card-header {
          display: flex; align-items: center; gap: 9px;
          padding: 13px 22px;
          background: #f8fafc; border-bottom: 1px solid #e2e8f0;
          font-size: 11.5px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.07em;
        }
        .bis-card-header i { font-size: 16px; color: #94a3b8; }

        /* ── Grid: 6-column base so rows can be 2-wide or 3-wide cleanly ── */
        .bis-body {
          padding: 22px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 18px;
        }

        /* Row 1: কমিটি (4 cols) + ধরন (2 cols) = 2 fields */
        .bis-r1a { grid-column: span 4; }
        .bis-r1b { grid-column: span 2; }

        /* Row 2: স্থান (2 cols) + তারিখ (2 cols) + শুরু (2 cols) = 3 fields */
        .bis-r2a { grid-column: span 2; }
        .bis-r2b { grid-column: span 2; }
        .bis-r2c { grid-column: span 2; }

        /* Tablet 640–1023px — 2 col */
        @media (min-width: 640px) and (max-width: 1023px) {
          .bis-body { grid-template-columns: 1fr 1fr; gap: 14px; padding: 18px; }
          .bis-r1a { grid-column: span 1; }
          .bis-r1b { grid-column: span 1; }
          .bis-r2a { grid-column: span 1; }
          .bis-r2b { grid-column: span 1; }
          .bis-r2c { grid-column: 1 / -1; }
        }

        /* Mobile <640px — 1 col */
        @media (max-width: 639px) {
          .bis-body { grid-template-columns: 1fr; gap: 12px; padding: 14px; }
          .bis-r1a, .bis-r1b, .bis-r2a, .bis-r2b, .bis-r2c { grid-column: 1; }
        }

        .bis-field { display: flex; flex-direction: column; gap: 6px; }

        .bis-label {
          font-size: 11px; font-weight: 700;
          color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;
        }

        .bis-input, .bis-select {
          width: 100%; padding: 10px 14px;
          font-size: 14px; font-family: inherit;
          border: 1px solid #e2e8f0; border-radius: 8px;
          background: #fff; color: #1e293b;
          outline: none; box-sizing: border-box;
          transition: border-color 0.14s, box-shadow 0.14s;
          min-height: 42px;
        }
        .bis-input:focus, .bis-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }
        .bis-input::placeholder { color: #cbd5e1; }
        .bis-select { cursor: pointer; appearance: none; }

        .bis-time-badge {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          font-size: 10px; font-weight: 700; padding: 2px 9px; border-radius: 20px;
          pointer-events: none;
        }

        .bis-hint {
          font-size: 11.5px; color: #475569;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 6px; padding: 6px 11px;
          line-height: 1.5;
        }
        .bis-hint-green { background: #f0fdf4; border-color: #bbf7d0; color: #065f46; }

        /* ── Add button in card header ── */
        .bis-add-btn {
          margin-left: auto;
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; font-size: 12px; font-weight: 600;
          background: #eff6ff; color: #1d4ed8;
          border: 1px solid #bfdbfe; border-radius: 6px;
          cursor: pointer; transition: background 0.12s; font-family: inherit;
          appearance: none;
        }
        .bis-add-btn:hover { background: #dbeafe; }
        .bis-add-btn i { font-size: 13px; }

        /* ── Agenda table ── */
        .bis-ag-table {
          width: 100%; border-collapse: collapse;
          font-size: 13px; table-layout: fixed;
        }
        .bis-ag-table th {
          background: #f8fafc; border: 1px solid #e2e8f0;
          padding: 8px 12px; font-size: 11px; font-weight: 700;
          color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;
          text-align: center;
        }
        .bis-ag-table td { border: 1px solid #e2e8f0; vertical-align: middle; }
        .bis-ag-sl {
          text-align: center; font-size: 12px;
          color: #94a3b8; font-weight: 700; padding: 8px 10px;
        }
        .bis-ag-topic { padding: 4px 6px; }
        .bis-ag-input {
          width: 100%; padding: 8px 10px;
          font-size: 13px; font-family: inherit;
          border: none; outline: none; background: transparent;
          color: #1e293b; box-sizing: border-box;
        }
        .bis-ag-input:focus {
          background: #f0f9ff;
          box-shadow: inset 0 0 0 1.5px #93c5fd;
          border-radius: 4px;
        }
        .bis-ag-input::placeholder { color: #cbd5e1; }
        .bis-ag-del { text-align: center; padding: 4px 8px; }
        /* Force red — override browser default button background */
        .bis-ag-del-btn {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 28px; height: 28px;
          display: inline-flex; align-items: center; justify-content: center;
          background-color: #fef2f2 !important;
          border: 1.5px solid #fca5a5 !important;
          border-radius: 6px;
          color: #ef4444 !important;
          cursor: pointer; font-size: 14px;
          transition: background-color 0.12s;
        }
        .bis-ag-del-btn:hover {
          background-color: #fee2e2 !important;
          border-color: #f87171 !important;
        }
        .bis-ag-empty {
          text-align: center; padding: 24px;
          color: #cbd5e1; font-size: 12.5px; font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default memo(BasicInfoSection);