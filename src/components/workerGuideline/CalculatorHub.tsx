// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR HUB
// Three calculators: Salary Breakdown, Maternity Benefit, Compensation
// Language: Bangla only | Display only (no print)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  calculateBenefitYears,
  calculateServiceCompensation,
  calculateEarnedLeave,
  calculateNoticePay,
} from '../finalSettlement/FinalSettlementFormula';

// ── Bangla digit converter ────────────────────────────────────────────────────
const bn = (n: number | string, decimals = 0): string => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '০';
  const fixed = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
  return fixed.replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
};

const tk = (n: number) => `৳ ${bn(n)} টাকা`;

// ── Shared styles ─────────────────────────────────────────────────────────────
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
    padding: '28px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    marginBottom: '20px',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#1e293b',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#1e293b',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  resultBox: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
    borderRadius: '14px',
    padding: '24px',
    marginTop: '24px',
  } as React.CSSProperties,
  resultTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '4px',
  } as React.CSSProperties,
  resultValue: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 700,
  } as React.CSSProperties,
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '14px',
  } as React.CSSProperties,
  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '14px',
    marginBottom: '14px',
  } as React.CSSProperties,
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '20px 0',
  } as React.CSSProperties,
};

// ── Tab Bar ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'salary',     label: 'বেতন হিসাব',      emoji: '💰' },
  { id: 'maternity',  label: 'মাতৃত্ব সুবিধা',  emoji: '🤱' },
  { id: 'settlement', label: 'ক্ষতিপূরণ হিসাব', emoji: '📋' },
];

// ── Shared sub-components (defined outside calculators to avoid re-creation) ──

const ResultItem = ({ label, value, highlight = false }: {
  label: string; value: string; highlight?: boolean;
}) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>{label}</div>
    <div style={{ color: highlight ? '#86efac' : '#ffffff', fontSize: highlight ? '22px' : '17px', fontWeight: highlight ? 700 : 600 }}>{value}</div>
  </div>
);

interface RowProps { label: string; value: string; sub?: string; green?: boolean; }
const Row = ({ label, value, sub = '', green = false }: RowProps) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
    <div>
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13.5px' }}>{label}</div>
      {sub && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>{sub}</div>}
    </div>
    <div style={{ color: green ? '#86efac' : '#ffffff', fontWeight: 600, fontSize: '15px', textAlign: 'right' as const }}>{value}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR 1: SALARY BREAKDOWN
// ─────────────────────────────────────────────────────────────────────────────
function SalaryCalculator() {
  const [total,     setTotal]     = useState('');
  const [food,      setFood]      = useState('1200');
  const [medical,   setMedical]   = useState('600');
  const [transport, setTransport] = useState('400');

  const t = parseFloat(total)     || 0;
  const f = parseFloat(food)      || 0;
  const m = parseFloat(medical)   || 0;
  const tr= parseFloat(transport) || 0;

  const basic    = t > 0 ? (t - (f + m + tr)) / 1.5 : 0;
  const house    = basic / 2;
  const daily    = basic / 30;
  const dailyG   = t / 30;
  const overtime = (basic / 208) * 2;
  const valid    = t > 0 && basic > 0;

  return (
    <div>
      {/* Instruction */}
      <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13.5px', color: '#1e40af' }}>
        💡 মোট মাসিক মজুরি লিখুন — বাকি সব স্বয়ংক্রিয়ভাবে হিসাব হবে
      </div>

      {/* Inputs */}
      <div style={{ marginBottom: '14px' }}>
        <label style={S.label}>মোট মাসিক মজুরি (টাকা) *</label>
        <input
          type="number" style={{ ...S.input, borderColor: total ? '#3b82f6' : '#e2e8f0', fontSize: '18px' }}
          placeholder="যেমন: ৮৫০০"
          value={total} onChange={e => setTotal(e.target.value)}
        />
      </div>

      <div style={S.row}>
        <div>
          <label style={S.label}>খাদ্য ভাতা (টাকা)</label>
          <input type="number" style={S.input} value={food} onChange={e => setFood(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>চিকিৎসা ভাতা (টাকা)</label>
          <input type="number" style={S.input} value={medical} onChange={e => setMedical(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: '14px', maxWidth: '50%' }}>
        <label style={S.label}>যাতায়াত ভাতা (টাকা)</label>
        <input type="number" style={S.input} value={transport} onChange={e => setTransport(e.target.value)} />
      </div>

      {/* Results */}
      {valid ? (
        <div style={S.resultBox}>
          <div style={{ color: '#93c5fd', fontSize: '13px', fontWeight: 700, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            হিসাবের ফলাফল
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <ResultItem label="মূল মজুরি (Basic)" value={tk(basic)} highlight />
            <ResultItem label="বাড়ি ভাড়া ভাতা" value={tk(house)} />
            <ResultItem label="খাদ্য ভাতা" value={tk(f)} />
            <ResultItem label="চিকিৎসা ভাতা" value={tk(m)} />
            <ResultItem label="যাতায়াত ভাতা" value={tk(tr)} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '16px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <ResultItem label="দৈনিক মূল মজুরি" value={`৳ ${bn(daily, 2)} টাকা`} />
            <ResultItem label="দৈনিক মোট মজুরি" value={`৳ ${bn(dailyG, 2)} টাকা`} />
            <ResultItem label="প্রতি ঘণ্টা ওভারটাইম রেট" value={`৳ ${bn(overtime, 2)} টাকা`} highlight />
          </div>

          <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '4px' }}>মোট মাসিক মজুরি (যাচাই)</div>
            <div style={{ color: '#fcd34d', fontSize: '20px', fontWeight: 700 }}>
              ৳ {bn(basic + house + f + m + tr)} টাকা
            </div>
          </div>
        </div>
      ) : total && !valid ? (
        <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '14px 16px', color: '#dc2626', fontSize: '13.5px' }} role="alert">
          ⚠️ মোট মজুরি থেকে ভাতা বাদ দেওয়ার পর মূল মজুরি ঋণাত্মক হয়ে যাচ্ছে। ভাতার পরিমাণ কমান।
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR 2: MATERNITY BENEFIT
// ─────────────────────────────────────────────────────────────────────────────
function MaternityCalculator() {
  const [wage,        setWage]        = useState('');
  const [joining,     setJoining]     = useState('');
  const [delivery,    setDelivery]    = useState('');
  const [children,    setChildren]    = useState('0');
  const [installment, setInstallment] = useState('প্রথম কিস্তি');

  const w = parseFloat(wage) || 0;
  const dailyGross = w / 26;

  // Eligibility checks
  let serviceMonths = 0;
  if (joining && delivery) {
    const j = new Date(joining);
    const d = new Date(delivery);
    serviceMonths = (d.getFullYear() - j.getFullYear()) * 12 + (d.getMonth() - j.getMonth());
  }

  const serviceEligible  = serviceMonths >= 6;
  const childrenEligible = parseInt(children) <= 1;
  const eligible         = serviceEligible && childrenEligible;

  // Benefit calculation
  const preDays     = 60;
  const postDays    = 59;
  const totalDays   = 119;
  const preBenefit  = dailyGross * preDays;
  const postBenefit = dailyGross * postDays;
  const total       = eligible ? dailyGross * totalDays : 0;

  const showResult = w > 0;

  const EligBadge = ({ ok }: { ok: boolean }) => (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
      background: ok ? '#dcfce7' : '#fef2f2', color: ok ? '#16a34a' : '#dc2626',
    }}>
      {ok ? '✓ অধিকারী' : '✗ অধিকারী নয়'}
    </span>
  );

  return (
    <div>
      <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13.5px', color: '#1e40af' }}>
        💡 বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী — মাতৃত্ব ছুটি মোট ১১৯ দিন (প্রসবের আগে ৬০ + পরে ৫৯)
      </div>

      <div style={S.row}>
        <div>
          <label style={S.label}>মোট মাসিক মজুরি (টাকা) *</label>
          <input type="number" style={{ ...S.input, borderColor: wage ? '#3b82f6' : '#e2e8f0' }}
            placeholder="যেমন: ৮৫০০" value={wage} onChange={e => setWage(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>জীবিত সন্তান সংখ্যা</label>
          <select style={S.select} value={children} onChange={e => setChildren(e.target.value)}>
            <option value="0">০</option>
            <option value="1">১</option>
            <option value="2">২ (অযোগ্য)</option>
            <option value="3">৩ (অযোগ্য)</option>
          </select>
        </div>
      </div>

      <div style={S.row}>
        <div>
          <label style={S.label}>যোগদানের তারিখ</label>
          <input type="date" style={S.input} value={joining} onChange={e => setJoining(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>সম্ভাব্য প্রসবের তারিখ</label>
          <input type="date" style={S.input} value={delivery} onChange={e => setDelivery(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: '14px', maxWidth: '50%' }}>
        <label style={S.label}>কিস্তি</label>
        <select style={S.select} value={installment} onChange={e => setInstallment(e.target.value)}>
          <option>প্রথম কিস্তি</option>
          <option>দ্বিতীয় কিস্তি</option>
        </select>
      </div>

      {showResult && (
        <div style={S.resultBox}>
          <div style={{ color: '#93c5fd', fontSize: '13px', fontWeight: 700, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            হিসাবের ফলাফল
          </div>

          {/* Eligibility */}
          {joining && delivery && (
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '10px', fontWeight: 600 }}>যোগ্যতা যাচাই</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginBottom: '4px' }}>চাকরির মেয়াদ</div>
                  <EligBadge ok={serviceEligible} />
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '3px' }}>
                    {bn(serviceMonths)} মাস {serviceEligible ? '(৬+ মাস ✓)' : '(৬ মাস পূর্ণ হয়নি ✗)'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginBottom: '4px' }}>সন্তান সংখ্যা</div>
                  <EligBadge ok={childrenEligible} />
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '3px' }}>
                    {children} জন জীবিত সন্তান {childrenEligible ? '(০-১ ✓)' : '(২+ হলে অযোগ্য ✗)'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calculation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>দৈনিক মোট মজুরি (÷২৬)</div>
              <div style={{ color: '#fff', fontSize: '17px', fontWeight: 600 }}>৳ {bn(dailyGross, 2)} টাকা</div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>মোট ছুটির দিন</div>
              <div style={{ color: '#fff', fontSize: '17px', fontWeight: 600 }}>{bn(totalDays)} দিন</div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '12px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>
                প্রথম কিস্তি (প্রসবের আগে {bn(preDays)} দিন)
              </div>
              <div style={{ color: eligible ? '#86efac' : '#94a3b8', fontSize: '17px', fontWeight: 600 }}>
                {eligible ? tk(preBenefit) : '—'}
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>
                দ্বিতীয় কিস্তি (প্রসবের পরে {bn(postDays)} দিন)
              </div>
              <div style={{ color: eligible ? '#86efac' : '#94a3b8', fontSize: '17px', fontWeight: 600 }}>
                {eligible ? tk(postBenefit) : '—'}
              </div>
            </div>
          </div>

          <div style={{ background: eligible ? 'rgba(134,239,172,0.12)' : 'rgba(239,68,68,0.12)', borderRadius: '10px', padding: '14px 16px', marginTop: '8px', border: `1px solid ${eligible ? 'rgba(134,239,172,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div style={{ color: eligible ? '#86efac' : '#fca5a5', fontSize: '12px', marginBottom: '4px' }}>
              {eligible ? '✓ মোট মাতৃত্ব সুবিধা' : '✗ অযোগ্য — মাতৃত্ব সুবিধা প্রযোজ্য নয়'}
            </div>
            <div style={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}>
              {eligible ? `৳ ${bn(total)} টাকা` : '০ টাকা'}
            </div>
            {eligible && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' }}>
                {installment === 'প্রথম কিস্তি' ? `এই কিস্তিতে পাবেন: ৳ ${bn(preBenefit)} টাকা` : `এই কিস্তিতে পাবেন: ৳ ${bn(postBenefit)} টাকা`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR 3: COMPENSATION / FINAL SETTLEMENT
// ─────────────────────────────────────────────────────────────────────────────
function CompensationCalculator() {
  const [joining,     setJoining]     = useState('');
  const [leaving,     setLeaving]     = useState('');
  const [total,       setTotal]       = useState('');
  const [food,        setFood]        = useState('1200');
  const [medical,     setMedical]     = useState('600');
  const [transport,   setTransport]   = useState('400');
  const [termType,    setTermType]    = useState('চাকুরী অবসান (২৬)');
  const [earnedLeave, setEarnedLeave] = useState('');
  const [advance,     setAdvance]     = useState('0');
  const [noticeDays,  setNoticeDays]  = useState('0');

  // ── Service duration ─────────────────────────────────────────────────────────
  let years = 0, months = 0, days = 0, totalDays = 0;
  if (joining && leaving) {
    const j = new Date(joining);
    const l = new Date(leaving);
    const diff = l.getTime() - j.getTime();
    totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    years  = Math.floor(totalDays / 365);
    const rem = totalDays % 365;   // rem is always 0..364
    months = Math.floor(rem / 30);
    days   = rem % 30;
  }

  // ── Wage components ───────────────────────────────────────────────────────
  const w  = parseFloat(total) || 0;
  const f  = parseFloat(food) || 0;
  const m  = parseFloat(medical) || 0;
  const tr = parseFloat(transport) || 0;
  const basic      = w > 0 ? (w - (f + m + tr)) / 1.5 : 0;
  const dailyBasic = basic / 30;
  const dailyGross = w / 30;

  // ── Benefit years — use the same function as the main settlement module ───
  // FIX: the old code had `totalDays % 365 >= 365` which can NEVER be true
  // (modulo result is always strictly less than the divisor). Using the shared
  // formula function ensures the calculator matches the actual bill output.
  const benefitYears = (joining && leaving)
    ? calculateBenefitYears(years, totalDays)
    : 0;

  // ── Compensation — delegate to shared formula ─────────────────────────────
  // FIX: old inline logic had wrong resign tier (7 days for ≤3 years is wrong;
  // under-3-year resignees get 0 per Labour Law 2006 §27). Using
  // calculateServiceCompensation keeps the calculator in sync with the bill.
  const comp   = calculateServiceCompensation(termType, benefitYears, dailyBasic);
  const earned = calculateEarnedLeave(parseFloat(earnedLeave) || 0, dailyBasic);
  const notice = calculateNoticePay(parseFloat(noticeDays) || 0, dailyGross);
  const grossTotal = earned + comp + notice;
  const adv     = parseFloat(advance) || 0;
  const net     = grossTotal - adv;

  const valid = w > 0 && joining && leaving && basic > 0;

  const termTypes = [
    'চাকুরী অবসান (২৬)',
    'ছাঁটাই (২০)',
    'অবসর (২৮)',
    'ইস্তফা (২৭)',
    'অনুপস্থিতির কারণে ইস্তফা (২৭)',
    'চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)',
    'ডিসচার্জ (২২)',
    'অপসারন (২৩)',
    'বরখাস্ত (২৩)',
    'বরখাস্ত (২৩.৪: খ/ছ)',
  ];

  return (
    <div>
      <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13.5px', color: '#1e40af' }}>
        💡 বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী চূড়ান্ত পাওনা হিসাব
      </div>

      <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>চাকরির তথ্য</div>
      <div style={S.row}>
        <div>
          <label style={S.label}>যোগদানের তারিখ *</label>
          <input type="date" style={S.input} value={joining} onChange={e => setJoining(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>শেষ কর্মদিবস *</label>
          <input type="date" style={S.input} value={leaving} onChange={e => setLeaving(e.target.value)} />
        </div>
      </div>

      {joining && leaving && totalDays > 0 && (
        <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13.5px', color: '#0369a1' }}>
          চাকরির মেয়াদ: <strong>{bn(years)} বছর {bn(months)} মাস {bn(days)} দিন</strong> (মোট {bn(totalDays)} দিন)
        </div>
      )}

      <div style={{ marginBottom: '14px' }}>
        <label style={S.label}>চাকরি বিচ্ছেদের ধরন *</label>
        <select style={S.select} value={termType} onChange={e => setTermType(e.target.value)}>
          {termTypes.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <hr style={S.divider} />
      <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>বেতনের তথ্য</div>

      <div style={{ marginBottom: '14px' }}>
        <label style={S.label}>মোট মাসিক মজুরি (টাকা) *</label>
        <input type="number" style={{ ...S.input, borderColor: total ? '#3b82f6' : '#e2e8f0' }}
          placeholder="যেমন: ৮৫০০" value={total} onChange={e => setTotal(e.target.value)} />
      </div>

      <div style={S.row3}>
        <div>
          <label style={S.label}>খাদ্য ভাতা</label>
          <input type="number" style={S.input} value={food} onChange={e => setFood(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>চিকিৎসা ভাতা</label>
          <input type="number" style={S.input} value={medical} onChange={e => setMedical(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>যাতায়াত ভাতা</label>
          <input type="number" style={S.input} value={transport} onChange={e => setTransport(e.target.value)} />
        </div>
      </div>

      <hr style={S.divider} />
      <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>অতিরিক্ত তথ্য</div>

      <div style={S.row3}>
        <div>
          <label style={S.label}>অর্জিত ছুটির দিন</label>
          <input type="number" style={S.input} placeholder="০" value={earnedLeave} onChange={e => setEarnedLeave(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>নোটিশ দিন</label>
          <input type="number" style={S.input} placeholder="০" value={noticeDays} onChange={e => setNoticeDays(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>অগ্রিম কর্তন</label>
          <input type="number" style={S.input} placeholder="০" value={advance} onChange={e => setAdvance(e.target.value)} />
        </div>
      </div>

      {valid && (
        <div style={S.resultBox}>
          <div style={{ color: '#93c5fd', fontSize: '13px', fontWeight: 700, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            হিসাবের ফলাফল
          </div>

          {/* Wage summary */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px', fontWeight: 600 }}>মজুরি বিশ্লেষণ</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { l: 'মূল মজুরি', v: `৳ ${bn(basic)} টাকা` },
                { l: 'দৈনিক মূল', v: `৳ ${bn(dailyBasic, 2)} টাকা` },
                { l: 'সুবিধা বছর', v: `${bn(benefitYears)} বছর` },
              ].map(x => (
                <div key={x.l}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{x.l}</div>
                  <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings */}
          <Row label="অর্জিত ছুটির ক্ষতিপূরণ"
            sub={`${bn(parseFloat(earnedLeave)||0)} দিন × ৳${bn(dailyBasic, 2)} (দৈনিক মূল)`}
            value={tk(earned)} green />
          <Row label="চাকরি বিচ্ছেদ ক্ষতিপূরণ"
            sub={`${bn(benefitYears)} বছর × ${termType.includes('ইস্তফা') ? (benefitYears >= 10 ? '৩০' : benefitYears > 3 ? '১৫' : '৭') : termType.includes('অপসারন') || termType.includes('বরখাস্ত (২৩)') ? '১৫' : '৩০'} দিন × দৈনিক মূল`}
            value={comp > 0 ? tk(comp) : '০ টাকা'} green={comp > 0} />
          {parseFloat(noticeDays) > 0 && (
            <Row label="নোটিশ পে"
              sub={`${bn(parseFloat(noticeDays)||0)} দিন × ৳${bn(dailyGross, 2)} (দৈনিক মোট)`}
              value={tk(notice)} green />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '14px' }}>মোট প্রাপ্য (A)</div>
            <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '16px' }}>৳ {bn(grossTotal)} টাকা</div>
          </div>

          {adv > 0 && (
            <Row label="অগ্রিম কর্তন (B)" value={`— ৳ ${bn(adv)} টাকা`} />
          )}

          <div style={{ background: 'rgba(134,239,172,0.12)', borderRadius: '10px', padding: '16px', marginTop: '14px', border: '1px solid rgba(134,239,172,0.3)' }}>
            <div style={{ color: '#86efac', fontSize: '12px', marginBottom: '4px' }}>সর্বমোট প্রাপ্য (A{adv > 0 ? ' − B' : ''})</div>
            <div style={{ color: '#ffffff', fontSize: '26px', fontWeight: 700 }}>৳ {bn(net)} টাকা</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CALCULATOR HUB
// ─────────────────────────────────────────────────────────────────────────────
export default function CalculatorHub() {
  const [activeTab, setActiveTab] = useState('salary');

  return (
    <div style={S.wrap}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🧮</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
            শ্রমিক ক্যালকুলেটর
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
            বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী তাৎক্ষণিক হিসাব
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#ffffff', padding: '6px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '13.5px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #1e3a5f, #1e40af)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#64748b',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{tab.emoji}</div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calculator Panel */}
        <div style={S.card}>
          {activeTab === 'salary'     && <SalaryCalculator />}
          {activeTab === 'maternity'  && <MaternityCalculator />}
          {activeTab === 'settlement' && <CompensationCalculator />}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
          এই হিসাব শুধুমাত্র আনুমানিক। চূড়ান্ত পাওনার জন্য HR বিভাগে যোগাযোগ করুন।
        </div>
      </div>
    </div>
  );
}
