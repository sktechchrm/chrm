// ─────────────────────────────────────────────────────────────────────────────
// OpeningAndClosingSpeech.tsx
//
// RENAMED from OpeningSpeechSection.tsx — now holds two boxes side by side:
//   উদ্বোধনী (Opening)  — minutes.generalNotes (existing field)
//   সমাপনী (Closing)    — minutes.closingNotes (new field)
//
// Each box has a "টেমপ্লেট যোগ করুন" (insert template) button that drops in
// a common boilerplate speech the user can then edit/customize, instead of
// writing from scratch every time.
//
// Desktop: two boxes side by side, together spanning the full available
// width (no narrow centered card). Mobile: stacks to one column.
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from 'react';
import { MeetingMinutes } from './MeetingMinutesTypes';

interface Props {
  minutes: MeetingMinutes;
  setMinutes: (data: MeetingMinutes) => void;
}

// ── Common speech templates — quick-insert starting points ─────────────────
const OPENING_TEMPLATE =
  'সম্মানিত উপস্থিত সকলকে স্বাগত জানিয়ে সভাপতি সভার কার্যক্রম শুরু করেন। তিনি সকলের উপস্থিতির জন্য ধন্যবাদ জ্ঞাপন করেন এবং আজকের সভার মূল আলোচ্যসূচি সম্পর্কে সংক্ষিপ্ত ধারণা প্রদান করেন।';

const CLOSING_TEMPLATE =
  'আলোচ্যসূচির সকল বিষয়ে আলোচনা সম্পন্ন হওয়ার পর সভাপতি উপস্থিত সকল সদস্যকে তাঁদের গঠনমূলক মতামত ও সক্রিয় অংশগ্রহণের জন্য ধন্যবাদ জানান। পরবর্তী সভার তারিখ ও সময় যথাসময়ে জানানো হবে মর্মে উল্লেখ করে তিনি সভার সমাপ্তি ঘোষণা করেন।';

function BlockTitle({ label, variant = 'orange' }: {
  label: string;
  variant?: 'default' | 'blue' | 'green' | 'purple' | 'orange';
}) {
  const S: Record<string, { bg: string; border: string; color: string }> = {
    default: { bg: '#f1f5f9', border: '#94a3b8', color: '#475569' },
    blue:    { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8' },
    green:   { bg: '#f0fdf4', border: '#22c55e', color: '#065f46' },
    purple:  { bg: '#faf5ff', border: '#a855f7', color: '#6b21a8' },
    orange:  { bg: '#fff7ed', border: '#f97316', color: '#9a3412' },
  };
  const s = S[variant];
  return (
    <div className="ocs-block-title" style={{ background: s.bg, borderLeftColor: s.border, color: s.color }}>
      {label}
    </div>
  );
}

function SpeechBox({
  label, variant, value, onChange, placeholder, template,
}: {
  label: string;
  variant: 'orange' | 'blue';
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  template: string;
}) {
  const insertTemplate = () => {
    onChange(value ? `${value}\n\n${template}` : template);
  };

  return (
    <div className="ocs-card">
      <div className="ocs-card-head">
        <BlockTitle label={label} variant={variant} />
        <button type="button" className="ocs-template-btn" onClick={insertTemplate}>
          টেমপ্লেট যোগ করুন
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="ocs-textarea"
        rows={9}
        placeholder={placeholder}
        lang="bn"
      />
    </div>
  );
}

function OpeningAndClosingSpeech({ minutes, setMinutes }: Props) {
  return (
    <div className="ocs-wrap">
      <div className="ocs-grid">
        <SpeechBox
          label="উদ্বোধনী"
          variant="orange"
          value={minutes.generalNotes}
          onChange={v => setMinutes({ ...minutes, generalNotes: v })}
          placeholder="সভার উদ্বোধনী বক্তব্য, প্রারম্ভিক মন্তব্য বা পর্যবেক্ষণ লিখুন..."
          template={OPENING_TEMPLATE}
        />
        <SpeechBox
          label="সমাপনী"
          variant="blue"
          value={minutes.closingNotes}
          onChange={v => setMinutes({ ...minutes, closingNotes: v })}
          placeholder="সভার সমাপনী বক্তব্য বা সংক্ষিপ্ত উপসংহার লিখুন..."
          template={CLOSING_TEMPLATE}
        />
      </div>

      <style>{`
        .ocs-wrap { width: 100%; }

        .ocs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .ocs-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .ocs-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 12px;
        }

        .ocs-block-title {
          display: inline-flex;
          align-items: center;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 4px 10px 4px 8px;
          border-left: 3px solid;
          border-radius: 0 5px 5px 0;
          margin: 0;
        }

        .ocs-template-btn {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 11px;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.12s;
          white-space: nowrap;
        }
        .ocs-template-btn:hover { background: #dbeafe; }

        .ocs-textarea {
          width: 100%; padding: 12px 14px;
          font-size: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          background: #fff; color: #1e293b;
          outline: none; resize: vertical; min-height: 220px;
          line-height: 1.7;
          transition: border-color 0.14s, box-shadow 0.14s;
          box-sizing: border-box;
          font-family: inherit;
          flex: 1;
        }
        .ocs-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }
        .ocs-textarea::placeholder { color: #cbd5e1; }

        /* Tablet — still side by side but tighter */
        @media (max-width: 1023px) and (min-width: 769px) {
          .ocs-card { padding: 16px; }
          .ocs-textarea { min-height: 190px; }
        }

        /* Mobile/narrow tablet — stack vertically, full width each */
        @media (max-width: 768px) {
          .ocs-grid { grid-template-columns: 1fr; gap: 14px; }
          .ocs-card { padding: 16px; border-radius: 10px; }
          .ocs-textarea { min-height: 180px; font-size: 13px; }
        }

        @media (max-width: 480px) {
          .ocs-card { padding: 12px; border-left: none; border-right: none; border-radius: 9px; }
          .ocs-card-head { flex-direction: column; align-items: flex-start; gap: 8px; }
          .ocs-template-btn { width: 100%; text-align: center; }
          .ocs-textarea { min-height: 150px; font-size: 14px; }
        }
      `}</style>
    </div>
  );
}

export default memo(OpeningAndClosingSpeech);