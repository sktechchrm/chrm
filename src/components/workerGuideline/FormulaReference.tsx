// ─────────────────────────────────────────────────────────────────────────────
// FORMULA REFERENCE APP
// Shows all calculation formulas used in the Calculator Hub
// Language: Bangla only | Display only
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

const S = {
  formulaBox: {
    background: '#1e293b',
    borderRadius: '10px',
    padding: '12px 16px',
    margin: '10px 0',
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#7dd3fc',
    lineHeight: 1.8 as const,
    overflowX: 'auto' as const,
  } as React.CSSProperties,
  pill: (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    background: color === 'blue'  ? '#dbeafe' : color === 'green' ? '#dcfce7' : color === 'amber' ? '#fef9c3' : color === 'red' ? '#fee2e2' : '#f3f4f6',
    color:      color === 'blue'  ? '#1d4ed8' : color === 'green' ? '#15803d' : color === 'amber' ? '#a16207' : color === 'red' ? '#b91c1c' : '#374151',
    marginRight: '6px',
    marginBottom: '4px',
  }),
};

// ── Accordion Section ─────────────────────────────────────────────────────────
function Section({ emoji, title, subtitle, color, children }: {
  emoji: string; title: string; subtitle: string; color: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const bg = color === 'blue'  ? { header: '#eff6ff', border: '#3b82f6', title: '#1e40af' } :
             color === 'green' ? { header: '#f0fdf4', border: '#22c55e', title: '#15803d' } :
             color === 'amber' ? { header: '#fffbeb', border: '#f59e0b', title: '#b45309' } :
                                 { header: '#fdf4ff', border: '#a855f7', title: '#7e22ce' };
  return (
    <div style={{ border: `1px solid ${bg.border}40`, borderLeft: `4px solid ${bg.border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
        padding: '14px 16px', background: bg.header,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{emoji}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: bg.title }}>{title}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{subtitle}</div>
          </div>
        </div>
        <span style={{ fontSize: '18px', color: bg.border, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▾</span>
      </button>
      {open && <div style={{ padding: '16px', borderTop: `1px solid ${bg.border}22` }}>{children}</div>}
    </div>
  );
}

function FormulaBlock({ lines }: { lines: string[] }) {
  return (
    <div style={S.formulaBox}>
      {lines.map((line, i) => (
        <div key={i} style={{ color: line.startsWith('//') ? '#64748b' : line.includes('=') ? '#7dd3fc' : '#e2e8f0' }}>{line}</div>
      ))}
    </div>
  );
}

function RuleRow({ condition, result, law }: { condition: string; result: string; law?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{condition}</div>
      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e40af', whiteSpace: 'nowrap' }}>{result}</div>
      {law && <span style={S.pill('blue')}>{law}</span>}
    </div>
  );
}

function Sub({ text }: { text: string }) {
  return <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e3a5f', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '16px 0 8px' }}>{text}</div>;
}

function Note({ text, color = 'blue' }: { text: string; color?: string }) {
  const bg = color === 'amber' ? '#fffbeb' : color === 'red' ? '#fef2f2' : '#eff6ff';
  const tc = color === 'amber' ? '#92400e' : color === 'red' ? '#991b1b' : '#1e40af';
  return <div style={{ background: bg, borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', color: tc, margin: '10px 0' }}>{text}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — exported for WorkerGuidelineViewer section 34
// ─────────────────────────────────────────────────────────────────────────────
export default function FormulaReference() {
  return (
    <div style={{ fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" }}>

      {/* ── SECTION 1: SALARY ── */}
      <Section emoji="💰" title="বেতন বিভাজন সূত্র" subtitle="মোট মজুরি থেকে মূল মজুরি ও সকল ভাতা বের করার পদ্ধতি" color="blue">
        <Note text="📌 মূল মজুরি = (মোট মজুরি − ভাতাসমূহ) ÷ ১.৫ — কারণ বাড়ি ভাড়া সবসময় মূল মজুরির অর্ধেক হয়।" />
        <Sub text="মূল মজুরি" />
        <FormulaBlock lines={['মূল_মজুরি = (মোট_মজুরি − খাদ্য − চিকিৎসা − যাতায়াত) ÷ ১.৫','','// উদাহরণ: মোট ৮৫০০, ভাতা ২২০০','= (৮৫০০ − ২২০০) ÷ ১.৫ = ৪২০০ টাকা']} />
        <Sub text="বাড়ি ভাড়া ও দৈনিক মজুরি" />
        <FormulaBlock lines={['বাড়ি_ভাড়া = মূল_মজুরি ÷ ২','দৈনিক_মূল = মূল_মজুরি ÷ ৩০','দৈনিক_মোট = মোট_মজুরি ÷ ৩০']} />
        <Sub text="ওভারটাইম রেট (ধারা ১০৮)" />
        <FormulaBlock lines={['ওভারটাইম_রেট = (মূল_মজুরি ÷ ২০৮) × ২','// ২০৮ = বার্ষিক মোট কর্মঘণ্টা']} />
      </Section>

      {/* ── SECTION 2: MATERNITY ── */}
      <Section emoji="🤱" title="মাতৃত্ব সুবিধা সূত্র" subtitle="বাংলাদেশ শ্রম আইন ২০০৬, ধারা ৪৫–৫০ অনুযায়ী" color="green">
        <Note text="📌 যোগ্যতা: চাকরির মেয়াদ ≥ ৬ মাস এবং জীবিত সন্তান ≤ ১ জন — উভয় শর্ত পূরণ করতে হবে।" color="amber" />
        <div style={{ marginBottom: '8px' }}>
          <RuleRow condition="চাকরির মেয়াদ ≥ ৬ মাস" result="যোগ্য ✓" law="ধারা ৪৬" />
          <RuleRow condition="জীবিত সন্তান ০ বা ১ জন" result="যোগ্য ✓" law="ধারা ৪৫" />
          <RuleRow condition="২ বা তার বেশি সন্তান" result="অযোগ্য ✗" law="ধারা ৪৫" />
        </div>
        <Sub text="ছুটি ও সুবিধার হিসাব" />
        <FormulaBlock lines={['মাতৃত্ব_ছুটি = ৬০ + ৫৯ = ১১৯ দিন','দৈনিক_মজুরি = মোট_মাসিক_মজুরি ÷ ২৬  // কার্যদিবস','মোট_সুবিধা  = দৈনিক_মজুরি × ১১৯','','// উদাহরণ: মোট মজুরি ৮৫০০ টাকা','= (৮৫০০ ÷ ২৬) × ১১৯ = ৩৮,৯০৩ টাকা']} />
        <Note text="💡 মাতৃত্ব সুবিধায় মোট মজুরির ভিত্তিতে হিসাব হয় — শুধু মূল মজুরি নয়।" />
      </Section>

      {/* ── SECTION 3: SETTLEMENT ── */}
      <Section emoji="📋" title="ক্ষতিপূরণ ও চূড়ান্ত পাওনার সূত্র" subtitle="বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী চাকরি বিচ্ছেদের হিসাব" color="amber">
        <Sub text="সুবিধা বছর নির্ধারণ" />
        <FormulaBlock lines={['বাকি_দিন ≥ ৩৬৫ → সুবিধা_বছর = পূর্ণ_বছর + ১','বাকি_দিন ≥ ১৮২ → সুবিধা_বছর = পূর্ণ_বছর + ০.৫','অন্যথায়        → সুবিধা_বছর = পূর্ণ_বছর']} />
        <Note text="📌 সকল ক্ষতিপূরণ দৈনিক মূল মজুরির ভিত্তিতে হিসাব হয়।" color="amber" />
        <div style={{ marginBottom: '10px' }}>
          <RuleRow condition="চাকুরী অবসান, ছাঁটাই, অবসর, মৃত্যু" result="৩০ দিন/বছর" law="ধারা ২৬" />
          <RuleRow condition="অপসারণ, বরখাস্ত (সাধারণ)" result="১৫ দিন/বছর" law="ধারা ২৩" />
          <RuleRow condition="ইস্তফা — ঠিক ৩ বছর" result="৭ দিন/বছর" law="ধারা ২৭" />
          <RuleRow condition="ইস্তফা — ৩ থেকে ১০ বছরের কম" result="১৫ দিন/বছর" law="ধারা ২৭" />
          <RuleRow condition="ইস্তফা — ১০ বছর বা তার বেশি" result="৩০ দিন/বছর" law="ধারা ২৭" />
          <RuleRow condition="বরখাস্ত (ধারা ২৩.৪: খ/ছ)" result="০ টাকা" law="ধারা ২৩.৪" />
        </div>
        <Sub text="চূড়ান্ত হিসাব" />
        <FormulaBlock lines={['মোট_প্রাপ্য = অর্জিত_ছুটির_পাওনা','             + চাকরি_বিচ্ছেদ_ক্ষতিপূরণ','             + নোটিশ_পে','সর্বমোট    = মোট_প্রাপ্য − অগ্রিম_কর্তন']} />
        <Note text="⚠️ ১ বছরের কম চাকরিতে সাধারণত কোনো চাকরি বিচ্ছেদ ক্ষতিপূরণ প্রযোজ্য নয়।" color="red" />
      </Section>

      {/* ── SECTION 4: QUICK REFERENCE ── */}
      <Section emoji="⚡" title="দ্রুত রেফারেন্স কার্ড" subtitle="সবচেয়ে গুরুত্বপূর্ণ সংখ্যাগুলো এক নজরে" color="purple">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          {[
            { icon: '÷১.৫', label: 'মূল মজুরি', sub: 'মোট − ভাতা, তারপর ÷ ১.৫', c: '#eff6ff', b: '#bfdbfe', t: '#1e40af' },
            { icon: '÷২',   label: 'বাড়ি ভাড়া', sub: 'মূল মজুরির ঠিক অর্ধেক',   c: '#f0fdf4', b: '#bbf7d0', t: '#15803d' },
            { icon: '÷৩০',  label: 'দৈনিক মজুরি', sub: 'ক্ষতিপূরণ হিসাবের জন্য',  c: '#fffbeb', b: '#fde68a', t: '#b45309' },
            { icon: '÷২৬',  label: 'মাতৃত্ব দৈনিক', sub: 'মাতৃত্ব সুবিধার জন্য',  c: '#fdf4ff', b: '#e9d5ff', t: '#7e22ce' },
            { icon: '×২',   label: 'ওভারটাইম গুণক', sub: 'ধারা ১০৮ অনুযায়ী',      c: '#fef2f2', b: '#fecaca', t: '#b91c1c' },
            { icon: '১১৯',  label: 'মাতৃত্ব ছুটি', sub: '৬০ + ৫৯ = ১১৯ দিন',      c: '#f0fdf4', b: '#bbf7d0', t: '#15803d' },
            { icon: '৬ মাস',label: 'মাতৃত্ব যোগ্যতা', sub: 'ন্যূনতম চাকরির মেয়াদ', c: '#fffbeb', b: '#fde68a', t: '#b45309' },
            { icon: '÷২০৮', label: 'ঘণ্টাপ্রতি মজুরি', sub: 'বার্ষিক ২০৮ কর্মঘণ্টা', c: '#f0f9ff', b: '#bae6fd', t: '#0369a1' },
          ].map(item => (
            <div key={item.label} style={{ background: item.c, border: `1.5px solid ${item.b}`, borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: item.t, fontFamily: 'monospace', marginBottom: '4px' }}>{item.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ color: '#7dd3fc', fontSize: '12px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>ক্ষতিপূরণের দিন — দ্রুত দেখুন</div>
          {[
            ['অবসান, ছাঁটাই, অবসর, মৃত্যু, ডিসচার্জ', '৩০ দিন/বছর'],
            ['অপসারণ, বরখাস্ত (সাধারণ)', '১৫ দিন/বছর'],
            ['ইস্তফা — ঠিক ৩ বছর', '৭ দিন/বছর'],
            ['ইস্তফা — ৩–১০ বছর', '১৫ দিন/বছর'],
            ['ইস্তফা — ১০+ বছর', '৩০ দিন/বছর'],
            ['বরখাস্ত (ধারা ২৩.৪: খ/ছ)', '০ দিন/বছর'],
          ].map(([cond, val]) => (
            <div key={cond} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#cbd5e1', fontSize: '12.5px' }}>{cond}</span>
              <span style={{ color: '#fcd34d', fontWeight: 700, fontSize: '12.5px', fontFamily: 'monospace' }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const }}>
          তথ্যসূত্র: বাংলাদেশ শ্রম আইন ২০০৬ এবং শ্রম বিধিমালা ২০১৫
        </div>
      </Section>
    </div>
  );
}