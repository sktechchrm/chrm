// ─────────────────────────────────────────────────────────────────────────────
// FORMULA REFERENCE APP
// Shows all calculation formulas used in the Calculator Hub
// Language: Bangla only | Display only
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

const S = {
  wrap: {
    fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
    minHeight: '100vh',
    background: '#f0f4f8',
    padding: '24px 16px',
  } as React.CSSProperties,
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '0',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    marginBottom: '16px',
    overflow: 'hidden',
  } as React.CSSProperties,
  formulaBox: {
    background: '#1e293b',
    borderRadius: '10px',
    padding: '14px 18px',
    margin: '12px 0',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#7dd3fc',
    lineHeight: 1.8,
    overflowX: 'auto' as const,
  } as React.CSSProperties,
  pill: (color: string) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '11.5px',
    fontWeight: 700,
    background: color === 'blue'  ? '#dbeafe' :
                color === 'green' ? '#dcfce7' :
                color === 'amber' ? '#fef9c3' :
                color === 'red'   ? '#fee2e2' : '#f3f4f6',
    color:      color === 'blue'  ? '#1d4ed8' :
                color === 'green' ? '#15803d' :
                color === 'amber' ? '#a16207' :
                color === 'red'   ? '#b91c1c' : '#374151',
    marginRight: '6px',
    marginBottom: '4px',
  } as React.CSSProperties),
};

// ── Accordion Section ─────────────────────────────────────────────────────────
function Section({
  emoji, title, subtitle, color, children,
}: {
  emoji: string; title: string; subtitle: string;
  color: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const bg = color === 'blue'  ? { header: '#eff6ff', border: '#3b82f6', title: '#1e40af' } :
             color === 'green' ? { header: '#f0fdf4', border: '#22c55e', title: '#15803d' } :
             color === 'amber' ? { header: '#fffbeb', border: '#f59e0b', title: '#b45309' } :
                                 { header: '#fdf4ff', border: '#a855f7', title: '#7e22ce' };

  return (
    <div style={{ ...S.card, borderLeft: `4px solid ${bg.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
          padding: '18px 22px', background: bg.header,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{emoji}</span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: bg.title }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{subtitle}</div>
          </div>
        </div>
        <span style={{ fontSize: '20px', color: bg.border, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
          ▾
        </span>
      </button>

      {open && (
        <div style={{ padding: '20px 22px', borderTop: `1px solid ${bg.border}22` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Formula Block ─────────────────────────────────────────────────────────────
function FormulaBlock({ lines }: { lines: string[] }) {
  return (
    <div style={S.formulaBox}>
      {lines.map((line, i) => (
        <div key={i} style={{ color: line.startsWith('//') ? '#64748b' : line.startsWith('=') || line.includes('=') ? '#7dd3fc' : '#e2e8f0' }}>
          {line}
        </div>
      ))}
    </div>
  );
}

// ── Rule Row ──────────────────────────────────────────────────────────────────
function RuleRow({ condition, result, law }: { condition: string; result: string; law?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ flex: 1, fontSize: '13.5px', color: '#374151' }}>{condition}</div>
      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e40af', whiteSpace: 'nowrap' }}>{result}</div>
      {law && <span style={S.pill('blue')}>{law}</span>}
    </div>
  );
}

// ── Sub heading ───────────────────────────────────────────────────────────────
function Sub({ text }: { text: string }) {
  return (
    <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e3a5f', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '20px 0 10px' }}>
      {text}
    </div>
  );
}

function Note({ text, color = 'blue' }: { text: string; color?: string }) {
  const bg = color === 'amber' ? '#fffbeb' : color === 'red' ? '#fef2f2' : '#eff6ff';
  const tc = color === 'amber' ? '#92400e' : color === 'red' ? '#991b1b' : '#1e40af';
  return (
    <div style={{ background: bg, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: tc, margin: '12px 0' }}>
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function FormulaReference() {

  return (
    <div style={S.wrap}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>📐</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
            হিসাবের সূত্রসমূহ
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
            ক্যালকুলেটরে ব্যবহৃত সকল সূত্র ও আইনি ভিত্তি
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: SALARY BREAKDOWN
        ════════════════════════════════════════════════════════════════════ */}
        <Section emoji="💰" title="বেতন বিভাজন সূত্র" subtitle="মোট মজুরি থেকে মূল মজুরি ও সকল ভাতা বের করার পদ্ধতি" color="blue">

          <Note text="📌 বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী — মূল মজুরি = (মোট মজুরি − ভাতাসমূহ) ÷ ১.৫, কারণ বাড়ি ভাড়া সবসময় মূল মজুরির অর্ধেক হয়।" />

          <Sub text="ধাপ ১ — মূল মজুরি বের করা" />
          <FormulaBlock lines={[
            '// প্রথমে ভাতা বাদ দাও, তারপর ১.৫ দিয়ে ভাগ করো',
            'মূল_মজুরি = (মোট_মজুরি − খাদ্য_ভাতা − চিকিৎসা_ভাতা − যাতায়াত_ভাতা) ÷ ১.৫',
            '',
            '// উদাহরণ: মোট মজুরি ৮৫০০ টাকা, ভাতা ২২০০ টাকা',
            'মূল_মজুরি = (৮৫০০ − ১২০০ − ৬০০ − ৪০০) ÷ ১.৫',
            '           = ৬৩০০ ÷ ১.৫',
            '           = ৪২০০ টাকা',
          ]} />

          <Sub text="ধাপ ২ — বাড়ি ভাড়া ভাতা" />
          <FormulaBlock lines={[
            '// বাড়ি ভাড়া = মূল মজুরির ঠিক অর্ধেক',
            'বাড়ি_ভাড়া = মূল_মজুরি ÷ ২',
            '',
            '// উদাহরণ:',
            'বাড়ি_ভাড়া = ৪২০০ ÷ ২ = ২১০০ টাকা',
          ]} />

          <Sub text="ধাপ ৩ — দৈনিক মজুরি" />
          <FormulaBlock lines={[
            '// চাকরি বিচ্ছেদের হিসাবে ব্যবহার হয় (৩০ দিন ধরে)',
            'দৈনিক_মূল_মজুরি  = মূল_মজুরি ÷ ৩০',
            'দৈনিক_মোট_মজুরি  = মোট_মজুরি ÷ ৩০',
          ]} />

          <Sub text="ধাপ ৪ — ওভারটাইম রেট" />
          <FormulaBlock lines={[
            '// শ্রম আইন ধারা ১০৮: বার্ষিক কর্মঘণ্টা = ২০৮ ঘণ্টা',
            '// ওভারটাইম রেট = মূল মজুরির দ্বিগুণ হারে প্রতি ঘণ্টা',
            'ওভারটাইম_রেট = (মূল_মজুরি ÷ ২০৮) × ২',
            '',
            '// উদাহরণ:',
            'ওভারটাইম_রেট = (৪২০০ ÷ ২০৮) × ২ = ৪০.৩৮ টাকা/ঘণ্টা',
          ]} />

          <Sub text="যাচাই সূত্র" />
          <FormulaBlock lines={[
            '// মোট মজুরি = মূল + বাড়িভাড়া + সকল ভাতা',
            'মোট_মজুরি = মূল_মজুরি + বাড়ি_ভাড়া + খাদ্য + চিকিৎসা + যাতায়াত',
            '           = ৪২০০ + ২১০০ + ১২০০ + ৬০০ + ৪০০',
            '           = ৮৫০০ টাকা ✓',
          ]} />
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: MATERNITY
        ════════════════════════════════════════════════════════════════════ */}
        <Section emoji="🤱" title="মাতৃত্ব সুবিধা সূত্র" subtitle="বাংলাদেশ শ্রম আইন ২০০৬, ধারা ৪৫–৫০ অনুযায়ী" color="green">

          <Note text="📌 মাতৃত্ব সুবিধা পেতে হলে — চাকরির মেয়াদ কমপক্ষে ৬ মাস এবং জীবিত সন্তান সংখ্যা ১ বা তার কম হতে হবে।" color="amber" />

          <Sub text="যোগ্যতার শর্ত" />
          <div style={{ marginBottom: '12px' }}>
            <RuleRow condition="চাকরির মেয়াদ ≥ ৬ মাস" result="যোগ্য ✓" law="ধারা ৪৬" />
            <RuleRow condition="চাকরির মেয়াদ < ৬ মাস" result="অযোগ্য ✗" law="ধারা ৪৬" />
            <RuleRow condition="জীবিত সন্তান ০ বা ১ জন" result="যোগ্য ✓" law="ধারা ৪৫" />
            <RuleRow condition="জীবিত সন্তান ২ বা তার বেশি" result="অযোগ্য ✗" law="ধারা ৪৫" />
          </div>

          <Note text="⚠️ উভয় শর্ত পূরণ করতে হবে — একটি পূরণ হলেই যথেষ্ট নয়।" color="red" />

          <Sub text="মাতৃত্ব ছুটির হিসাব" />
          <FormulaBlock lines={[
            '// মোট মাতৃত্ব ছুটি = ১১৯ দিন',
            'প্রসবের আগে  =  ৬০ দিন   (প্রথম কিস্তি)',
            'প্রসবের পরে  =  ৫৯ দিন   (দ্বিতীয় কিস্তি)',
            '               ─────────',
            'মোট ছুটি    = ১১৯ দিন',
          ]} />

          <Sub text="দৈনিক মজুরি ও সুবিধার পরিমাণ" />
          <FormulaBlock lines={[
            '// মাতৃত্ব সুবিধায় ২৬ কার্যদিবস ধরা হয় (৩০ নয়)',
            'দৈনিক_মোট_মজুরি = মোট_মাসিক_মজুরি ÷ ২৬',
            '',
            'প্রথম_কিস্তি  = দৈনিক_মোট_মজুরি × ৬০',
            'দ্বিতীয়_কিস্তি = দৈনিক_মোট_মজুরি × ৫৯',
            'মোট_সুবিধা    = দৈনিক_মোট_মজুরি × ১১৯',
            '',
            '// উদাহরণ: মোট মজুরি ৮৫০০ টাকা',
            'দৈনিক_মোট_মজুরি = ৮৫০০ ÷ ২৬ = ৩২৬.৯২ টাকা',
            'মোট_সুবিধা      = ৩২৬.৯২ × ১১৯ = ৩৮,৯০৩ টাকা',
          ]} />

          <Note text="💡 মাতৃত্ব সুবিধায় মোট মজুরির ভিত্তিতে হিসাব হয় — শুধু মূল মজুরি নয়।" />
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: FINAL SETTLEMENT
        ════════════════════════════════════════════════════════════════════ */}
        <Section emoji="📋" title="ক্ষতিপূরণ ও চূড়ান্ত পাওনার সূত্র" subtitle="বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী চাকরি বিচ্ছেদের হিসাব" color="amber">

          <Sub text="ধাপ ১ — সুবিধা বছর নির্ধারণ" />
          <FormulaBlock lines={[
            '// চাকরির মেয়াদের ভিত্তিতে সুবিধা বছর গণনা',
            'পূর্ণ_বছর = মোট_দিন ÷ ৩৬৫',
            '',
            'যদি (বাকি_দিন ≥ ৩৬৫)  → সুবিধা_বছর = পূর্ণ_বছর + ১',
            'যদি (বাকি_দিন ≥ ১৮২)  → সুবিধা_বছর = পূর্ণ_বছর + ০.৫',
            'অন্যথায়               → সুবিধা_বছর = পূর্ণ_বছর',
          ]} />

          <Sub text="ধাপ ২ — চাকরি বিচ্ছেদের ধরন অনুযায়ী ক্ষতিপূরণ" />
          <Note text="📌 সকল ক্ষতিপূরণ দৈনিক মূল মজুরির ভিত্তিতে হিসাব হয় (মোট মজুরি নয়)।" color="amber" />

          <div style={{ marginBottom: '12px' }}>
            <RuleRow condition="চাকুরী অবসান (ধারা ২৬) — ১ বছর বা বেশি" result="৩০ দিন × সুবিধা_বছর" law="ধারা ২৬" />
            <RuleRow condition="ছাঁটাই (ধারা ২০) — ১ বছর বা বেশি" result="৩০ দিন × সুবিধা_বছর" law="ধারা ২০" />
            <RuleRow condition="অবসর (ধারা ২৮) — ১ বছর বা বেশি" result="৩০ দিন × সুবিধা_বছর" law="ধারা ২৮" />
            <RuleRow condition="মৃত্যু (ধারা ১৯) — যেকোনো মেয়াদ" result="৩০ দিন × সুবিধা_বছর" law="ধারা ১৯" />
            <RuleRow condition="ডিসচার্জ (ধারা ২২) — ১ বছর বা বেশি" result="৩০ দিন × সুবিধা_বছর" law="ধারা ২২" />
            <RuleRow condition="অপসারণ (ধারা ২৩) — ১ বছর বা বেশি" result="১৫ দিন × সুবিধা_বছর" law="ধারা ২৩" />
            <RuleRow condition="বরখাস্ত (ধারা ২৩) — ১ বছর বা বেশি" result="১৫ দিন × সুবিধা_বছর" law="ধারা ২৩" />
            <RuleRow condition="বরখাস্ত (ধারা ২৩.৪: খ/ছ)" result="০ টাকা" law="ধারা ২৩.৪" />
          </div>

          <Sub text="ইস্তফার ক্ষেত্রে বিশেষ নিয়ম (ধারা ২৭)" />
          <div style={{ marginBottom: '12px' }}>
            <RuleRow condition="ইস্তফা — ৩ বছরের কম চাকরি" result="০ টাকা" law="ধারা ২৭" />
            <RuleRow condition="ইস্তফা — ঠিক ৩ বছর" result="৭ দিন × সুবিধা_বছর" law="ধারা ২৭" />
            <RuleRow condition="ইস্তফা — ৩ থেকে ১০ বছরের কম" result="১৫ দিন × সুবিধা_বছর" law="ধারা ২৭" />
            <RuleRow condition="ইস্তফা — ১০ বছর বা তার বেশি" result="৩০ দিন × সুবিধা_বছর" law="ধারা ২৭" />
          </div>

          <Sub text="ধাপ ৩ — অর্জিত ছুটির ক্ষতিপূরণ" />
          <FormulaBlock lines={[
            '// অর্জিত ছুটির হিসাব দৈনিক মূল মজুরিতে হয়',
            'অর্জিত_ছুটির_পাওনা = অর্জিত_ছুটি_দিন × দৈনিক_মূল_মজুরি',
            '',
            '// দৈনিক মূল মজুরি = মূল মজুরি ÷ ৩০',
          ]} />

          <Sub text="ধাপ ৪ — নোটিশ পে (প্রযোজ্য হলে)" />
          <FormulaBlock lines={[
            '// নোটিশ পে হিসাব মোট মজুরিতে হয় (মূল নয়)',
            'নোটিশ_পে = নোটিশ_দিন × দৈনিক_মোট_মজুরি',
            '',
            '// দৈনিক মোট মজুরি = মোট মজুরি ÷ ৩০',
          ]} />

          <Sub text="ধাপ ৫ — চূড়ান্ত হিসাব" />
          <FormulaBlock lines={[
            'মোট_প্রাপ্য (A) = অর্জিত_ছুটির_পাওনা',
            '                 + চাকরি_বিচ্ছেদ_ক্ষতিপূরণ',
            '                 + নোটিশ_পে',
            '',
            'অগ্রিম_কর্তন (B) = প্রদত্ত_অগ্রিমের_পরিমাণ',
            '',
            'সর্বমোট_প্রাপ্য = A − B',
          ]} />

          <Note text="⚠️ ১ বছরের কম চাকরিতে সাধারণত কোনো চাকরি বিচ্ছেদ ক্ষতিপূরণ প্রযোজ্য নয়।" color="red" />
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: QUICK REFERENCE
        ════════════════════════════════════════════════════════════════════ */}
        <Section emoji="⚡" title="দ্রুত রেফারেন্স কার্ড" subtitle="সবচেয়ে গুরুত্বপূর্ণ সংখ্যাগুলো এক নজরে" color="purple">

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { icon: '÷১.৫', label: 'মূল মজুরি বের করার ভাজক', sub: 'মোট − ভাতা, তারপর ÷ ১.৫', color: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
              { icon: '÷২',   label: 'বাড়ি ভাড়া ভাতা',         sub: 'মূল মজুরির ঠিক অর্ধেক',   color: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
              { icon: '÷৩০',  label: 'দৈনিক মজুরি',             sub: 'ক্ষতিপূরণ হিসাবের জন্য',  color: '#fffbeb', border: '#fde68a', text: '#b45309' },
              { icon: '÷২৬',  label: 'মাতৃত্ব দৈনিক মজুরি',    sub: 'মাতৃত্ব সুবিধার জন্য',     color: '#fdf4ff', border: '#e9d5ff', text: '#7e22ce' },
              { icon: '×২',   label: 'ওভারটাইম গুণক',           sub: 'ধারা ১০৮ অনুযায়ী',        color: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
              { icon: '÷২০৮', label: 'ঘণ্টাপ্রতি মূল মজুরি',   sub: 'বার্ষিক ২০৮ কর্মঘণ্টা',  color: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
              { icon: '১১৯',  label: 'মাতৃত্ব ছুটির দিন',       sub: '৬০ + ৫৯ = ১১৯ দিন',       color: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
              { icon: '৬ মাস', label: 'মাতৃত্বের যোগ্যতা',      sub: 'ন্যূনতম চাকরির মেয়াদ',   color: '#fffbeb', border: '#fde68a', text: '#b45309' },
            ].map(item => (
              <div key={item.label} style={{ background: item.color, border: `1.5px solid ${item.border}`, borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: item.text, fontFamily: 'monospace', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ color: '#7dd3fc', fontSize: '13px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
              ক্ষতিপূরণের দিন — দ্রুত দেখুন
            </div>
            {[
              ['অবসান, ছাঁটাই, অবসর, মৃত্যু, ডিসচার্জ', '৩০ দিন/বছর'],
              ['অপসারণ, বরখাস্ত (সাধারণ)',               '১৫ দিন/বছর'],
              ['ইস্তফা — ঠিক ৩ বছর',                    ' ৭ দিন/বছর'],
              ['ইস্তফা — ৩–১০ বছর',                     '১৫ দিন/বছর'],
              ['ইস্তফা — ১০+ বছর',                       '৩০ দিন/বছর'],
              ['বরখাস্ত (ধারা ২৩.৪: খ/ছ)',               ' ০ দিন/বছর'],
            ].map(([cond, val]) => (
              <div key={cond} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{cond}</span>
                <span style={{ color: '#fcd34d', fontWeight: 700, fontSize: '13px', fontFamily: 'monospace' }}>{val}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '8px', paddingBottom: '16px' }}>
          তথ্যসূত্র: বাংলাদেশ শ্রম আইন ২০০৬ এবং শ্রম বিধিমালা ২০১৫
        </div>
      </div>
    </div>
  );
}
