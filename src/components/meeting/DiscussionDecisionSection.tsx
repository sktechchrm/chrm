// ─────────────────────────────────────────────────────────────────────────────
// DiscussionDecisionSection.tsx
//
// New sidebar form step — "Discussion and Decision". Shows the SAME data as
// the Agenda step (minutes.agendaItems), but as an editable table matching
// the reference layout: নং | আলোচ্যসূচি ও আলোচনা | সিদ্ধান্ত | দায়িত্ব |
// সময়সীমা | অবস্থা (checkbox: অপেক্ষমান / চলমান / সম্পন্ন).
//
// Editing here writes to the same agendaItems[].decisions[0] /
// actionItems[0] fields that Agendasection.tsx's "Block 2/3" used to edit —
// those blocks were removed from Agendasection.tsx since this table is now
// their home, and Printview.tsx's existing "আলোচ্যসূচি ও সিদ্ধান্ত" table is
// the read-only rendering of this exact same data.
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from 'react';
import {
  MeetingMinutes,
  AgendaItem,
  ActionItem,
  Decision,
  generateId,
  ACTION_STATUS,
} from './MeetingMinutesTypes';
import { ALL_FACTORIES } from '../../factories/FactoryRegistry';

interface Props {
  minutes: MeetingMinutes;
  setMinutes: (data: MeetingMinutes) => void;
}

// ── Status label/colour config — matches the 3 real ActionItem.status values ──
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  Pending:       { label: 'অপেক্ষমান', bg: '#fef9c3', color: '#a16207' },
  'In Progress': { label: 'চলমান',      bg: '#dbeafe', color: '#1d4ed8' },
  Completed:     { label: 'সম্পন্ন',    bg: '#dcfce7', color: '#15803d' },
};

// ── Builds a name suggestion list from the selected committee, same logic
//    as Agendasection.tsx's buildPersonList ────────────────────────────────
function buildPersonList(organizationName: string, meetingTitle: string): string[] {
  if (!meetingTitle) return [];
  const factory   = ALL_FACTORIES.find(f => f.name === organizationName);
  const factories = factory ? [factory] : ALL_FACTORIES;
  let committee: (typeof factories)[0]['committees'][0] | undefined;
  for (const f of factories) {
    committee = f.committees.find(c => c.name === meetingTitle);
    if (committee) break;
  }
  if (!committee) return [];
  const seen = new Set<string>();
  const list: string[] = [];
  const push = (name?: string) => { if (name && !seen.has(name)) { seen.add(name); list.push(name); } };
  push(committee.chairperson);
  push(committee.secretary);
  for (const m of committee.members ?? []) push(m.name);
  return list;
}

function DiscussionDecisionSection({ minutes, setMinutes }: Props) {
  const personList = buildPersonList(minutes.organizationName, minutes.meetingTitle);

  const upsertDecision = (agendaId: string, field: keyof Decision, value: string) =>
    setMinutes({
      ...minutes,
      agendaItems: minutes.agendaItems.map(a => {
        if (a.id !== agendaId) return a;
        const dec = a.decisions[0] || { id: generateId(), description: '', madeBy: '' };
        return { ...a, decisions: [{ ...dec, [field]: value }] };
      }),
    });

  const upsertAction = (agendaId: string, field: keyof ActionItem, value: string) =>
    setMinutes({
      ...minutes,
      agendaItems: minutes.agendaItems.map(a => {
        if (a.id !== agendaId) return a;
        const act = a.actionItems[0] || {
          id: generateId(), description: '', assignedTo: '',
          dueDate: '', priority: 'Medium', status: 'Pending',
        };
        return { ...a, actionItems: [{ ...act, [field]: value }] };
      }),
    });

  if (minutes.agendaItems.length === 0) {
    return (
      <div className="dd-empty">
        <p>কোনো আলোচ্যসূচি নেই। প্রথমে &quot;আলোচ্যসূচি&quot; ধাপে গিয়ে আইটেম যুক্ত করুন।</p>
        <style>{`.dd-empty { text-align: center; padding: 48px 16px; color: #94a3b8; font-size: 13px; }`}</style>
      </div>
    );
  }

  return (
    <div className="dd-wrap">

      <table className="dd-table">
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '12%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>নং</th>
            <th style={{ textAlign: 'left' }}>আলোচ্যসূচি</th>
            <th style={{ textAlign: 'left' }}>আলোচনা ও সিদ্ধান্ত</th>
            <th className="dd-col-assignee" style={{ textAlign: 'left' }}>দায়িত্ব</th>
            <th className="dd-col-due">সময়সীমা</th>
            <th>অবস্থা</th>
          </tr>
        </thead>
        <tbody>
          {minutes.agendaItems.map((agenda, index) => {
            const decision = agenda.decisions[0];
            const action   = agenda.actionItems[0];

            return (
              <tr key={agenda.id}>
                <td className="dd-num" data-label="ক্রম">{index + 1}</td>

                <td className="dd-readonly" data-label="আলোচ্যসূচি">
                  {agenda.topic
                    ? <div className="dd-topic">{agenda.topic}</div>
                    : <span className="dd-muted">—</span>}
                </td>

                <td data-label="আলোচনা ও সিদ্ধান্ত">
                  <textarea
                    value={decision?.description ?? ''}
                    onChange={e => upsertDecision(agenda.id, 'description', e.target.value)}
                    placeholder="আলোচনা ও গৃহীত সিদ্ধান্ত লিখুন..."
                    className="dd-cell-input"
                    rows={3}
                    lang="bn"
                  />
                </td>

                <td className="dd-col-assignee" data-label="দায়িত্ব">
                  <input
                    list={`dd-people-${agenda.id}`}
                    value={action?.assignedTo ?? ''}
                    onChange={e => upsertAction(agenda.id, 'assignedTo', e.target.value)}
                    placeholder="নাম / বিভাগ"
                    className="dd-cell-input"
                    lang="bn"
                  />
                  <datalist id={`dd-people-${agenda.id}`}>
                    {personList.map(p => <option key={p} value={p} />)}
                  </datalist>
                </td>

                <td className="dd-col-due" data-label="সময়সীমা">
                  <input
                    type="date"
                    value={action?.dueDate ?? ''}
                    onChange={e => upsertAction(agenda.id, 'dueDate', e.target.value)}
                    className="dd-cell-input dd-date-input"
                  />
                </td>

                <td data-label="অবস্থা">
                  <div className="dd-status-group">
                    {ACTION_STATUS.map(s => (
                      <label key={s} className="dd-status-check">
                        <input
                          type="checkbox"
                          checked={action?.status === s}
                          onChange={() => {
                            if (action?.status === s) {
                              setMinutes({
                                ...minutes,
                                agendaItems: minutes.agendaItems.map(a =>
                                  a.id === agenda.id ? { ...a, actionItems: [] } : a
                                ),
                              });
                            } else {
                              upsertAction(agenda.id, 'status', s);
                            }
                          }}
                        />
                        <span style={{ color: STATUS_CONFIG[s].color }}>{STATUS_CONFIG[s].label}</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .dd-wrap { width: 100%; overflow-x: auto; }

        /* ─── Desktop: full 6-col table ─── */
        .dd-table {
          width: 100%; border-collapse: collapse; font-size: 12.5px;
          border: 1.5px solid #cbd5e1; table-layout: fixed; min-width: 640px;
        }
        .dd-table th {
          background: #e5e7eb; border: 1px solid #cbd5e1;
          padding: 9px 10px; font-weight: 700; text-align: center; color: #1e293b;
          white-space: nowrap;
        }
        .dd-table td {
          border: 1px solid #cbd5e1; padding: 8px 8px; vertical-align: top;
        }
        .dd-num { text-align: center; font-weight: 700; color: #64748b; width: 44px; }
        .dd-readonly { background: #fafafa; }
        .dd-topic { font-weight: 600; font-size: 12.5px; color: #1e293b; line-height: 1.4; }
        .dd-muted { color: #cbd5e1; }

        .dd-cell-input {
          width: 100%; padding: 6px 8px; font-size: 12px; font-family: inherit;
          border: 1px solid #e2e8f0; border-radius: 5px;
          background: #fff; color: #1e293b; outline: none;
          box-sizing: border-box; resize: vertical; line-height: 1.5;
        }
        .dd-cell-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
        .dd-date-input { font-size: 11px; padding: 6px 4px; }

        .dd-status-group { display: flex; flex-direction: column; gap: 5px; }
        .dd-status-check {
          display: flex; align-items: center; gap: 6px;
          cursor: pointer; font-size: 11.5px; white-space: nowrap;
        }
        .dd-status-check input {
          width: 13px; height: 13px; cursor: pointer; accent-color: #1e40af; flex-shrink: 0;
        }

        /* ─── Tablet ≤768px: hide দায়িত্ব + সময়সীমা cols, stack status ─── */
        @media (max-width: 768px) {
          .dd-col-assignee, .dd-col-due { display: none; }
          .dd-table { min-width: 0; font-size: 12px; }
          .dd-table th, .dd-table td { padding: 7px 6px; }
        }

        /* ─── Mobile ≤480px: card layout, no table at all ─── */
        @media (max-width: 480px) {
          .dd-table, .dd-table thead, .dd-table tbody,
          .dd-table th, .dd-table td, .dd-table tr {
            display: block; width: 100%;
          }
          .dd-table thead { display: none; }
          .dd-table tr {
            border: 1px solid #cbd5e1; border-radius: 8px;
            margin-bottom: 12px; overflow: hidden; background: #fff;
          }
          .dd-table td {
            border: none; border-bottom: 1px solid #f1f5f9;
            padding: 10px 14px; font-size: 13px;
          }
          .dd-table td:last-child { border-bottom: none; }
          .dd-table td::before {
            content: attr(data-label);
            display: block; font-size: 10px; font-weight: 700;
            color: #94a3b8; text-transform: uppercase;
            letter-spacing: 0.05em; margin-bottom: 5px;
          }
          .dd-num { text-align: left; font-size: 11px; color: #94a3b8; }
          .dd-col-assignee, .dd-col-due { display: block; }
          .dd-status-group { flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .dd-cell-input { font-size: 13px; padding: 8px 10px; }
        }
      `}</style>
    </div>
  );
}

export default memo(DiscussionDecisionSection);