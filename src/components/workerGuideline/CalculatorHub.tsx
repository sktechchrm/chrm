// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR HUB
// Three calculators: Salary Breakdown, Maternity Benefit, Compensation
// Language: Bangla only | Display only (no print)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

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
    boxSizing: 'border-box' as const,
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
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  resultBox: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
    borderRadius: '14px',
    padding: '20px',
    marginTop: '20px',
  } as React.CSSProperties,
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  } as React.CSSProperties,
  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  } as React.CSSProperties,
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '16px 0',
  } as React.CSSProperties,
};

// Hoisted to module level to prevent re-creation on each render
const ResultItem = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>{label}</div>
    <div style={{ color: highlight ? '#86efac' : '#ffffff', fontSize: highlight ? '20px' : '16px', fontWeight: highlight ? 700 : 600 }}>{value}</div>
  </div>
);

// Hoisted to module level to prevent re-creation on each render
const EligBadge = ({ ok }: { ok: boolean }) => (
  <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
    background: ok ? '#dcfce7' : '#fef2f2', color: ok ? '#16a34a' : '#dc2626' }}>
    {ok ? '✓ অধিকারী' : '✗ অধিকারী নয়'}
  </span>
);

// Hoisted to module level to prevent re-creation on each render
const CompRow = ({ label, value, sub = '', green = false }: { label: string; value: string; sub?: string; green?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
    <div>
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>{label}</div>
      {sub && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>{sub}</div>}
    </div>
    <div style={{ color: green ? '#86efac' : '#ffffff', fontWeight: 600, fontSize: '14px', textAlign: 'right' }}>{value}</div>
  </div>
);

// ── Tab Bar ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'salary',     label: 'বেতন হিসাব',      emoji: '💰' },
  { id: 'maternity',  label: 'মাতৃত্ব সুবিধা',  emoji: '🤱' },
  // { id: 'settlement', label: 'ক্ষতিপূরণ হিসাব', emoji: '📋' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR 1: SALARY BREAKDOWN
// ─────────────────────────────────────────────────────────────────────────────
function SalaryCalculator() {
  const [total,     setTotal]     = useState('');
  const [food,      setFood]      = useState('1250');
  const [medical,   setMedical]   = useState('750');
  const [transport, setTransport] = useState('450');

  const t  = parseFloat(total)     || 0;
  const f  = parseFloat(food)      || 0;
  const m  = parseFloat(medical)   || 0;
  const tr = parseFloat(transport) || 0;

  const basic    = t > 0 ? (t - (f + m + tr)) / 1.5 : 0;
  const house    = basic / 2;
  const daily    = basic / 30;
  const dailyG   = t / 30;
  const overtime = (basic / 208) * 2;
  const valid    = t > 0 && basic > 0;



  return (
    <div>
      <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#1e40af' }}>
        💡 মোট মাসিক মজুরি লিখুন — বাকি সব স্বয়ংক্রিয়ভাবে হিসাব হবে
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={S.label}>মোট মাসিক মজুরি (টাকা) *</label>
        <input type="number" style={{ ...S.input, borderColor: total ? '#3b82f6' : '#e2e8f0', fontSize: '18px' }}
          placeholder="যেমন: ১২৫০০" value={total} onChange={e => setTotal(e.target.value)} />
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
      <div style={{ marginBottom: '12px', maxWidth: '50%' }}>
        <label style={S.label}>যাতায়াত ভাতা (টাকা)</label>
        <input type="number" style={S.input} value={transport} onChange={e => setTransport(e.target.value)} />
      </div>
      {valid ? (
        <div style={S.resultBox}>
          <div style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>হিসাবের ফলাফল</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <ResultItem label="মূল মজুরি (Basic)" value={tk(basic)} highlight />
            <ResultItem label="বাড়ি ভাড়া ভাতা" value={tk(house)} />
            <ResultItem label="খাদ্য ভাতা" value={tk(f)} />
            <ResultItem label="চিকিৎসা ভাতা" value={tk(m)} />
            <ResultItem label="যাতায়াত ভাতা" value={tk(tr)} />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '14px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <ResultItem label="দৈনিক মূল মজুরি" value={`৳ ${bn(daily, 2)} টাকা`} />
            <ResultItem label="দৈনিক মোট মজুরি" value={`৳ ${bn(dailyG, 2)} টাকা`} />
            <ResultItem label="প্রতি ঘণ্টা ওভারটাইম রেট" value={`৳ ${bn(overtime, 2)} টাকা`} highlight />
          </div>
          <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '4px' }}>মোট মাসিক মজুরি (যাচাই)</div>
            <div style={{ color: '#fcd34d', fontSize: '18px', fontWeight: 700 }}>৳ {bn(basic + house + f + m + tr)} টাকা</div>
          </div>
        </div>
      ) : total && !valid ? (
        <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '12px 14px', color: '#dc2626', fontSize: '13px' }}>
          ⚠️ মোট মজুরি থেকে ভাতা বাদ দেওয়ার পর মূল মজুরি ঋণাত্মক হয়ে যাচ্ছে।
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

  let serviceMonths = 0;
  if (joining && delivery) {
    const j = new Date(joining);
    const d = new Date(delivery);
    serviceMonths = (d.getFullYear() - j.getFullYear()) * 12 + (d.getMonth() - j.getMonth());
  }

  const serviceEligible  = serviceMonths >= 6;
  const childrenEligible = parseInt(children) <= 1;
  const eligible         = serviceEligible && childrenEligible;

  const preDays     = 60;
  const postDays    = 60;
  const totalDays   = 120;
  const preBenefit  = dailyGross * preDays;
  const postBenefit = dailyGross * postDays;
  const total       = eligible ? dailyGross * totalDays : 0;
  const showResult  = w > 0;



  return (
    <div>
      <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#1e40af' }}>
        💡 বাংলাদেশ শ্রম আইন ২০০৬ — মাতৃত্ব ছুটি মোট ১২০ দিন (প্রসবের দিন সহ ৬০ + প্রসবের পরে ৬০)
      </div>
      <div style={S.row}>
        <div>
          <label style={S.label}>মোট মাসিক মজুরি (টাকা) *</label>
          <input type="number" style={{ ...S.input, borderColor: wage ? '#3b82f6' : '#e2e8f0' }}
            placeholder="যেমন: ১২৫০০" value={wage} onChange={e => setWage(e.target.value)} />
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
      <div style={{ marginBottom: '12px', maxWidth: '50%' }}>
        <label style={S.label}>কিস্তি</label>
        <select style={S.select} value={installment} onChange={e => setInstallment(e.target.value)}>
          <option>প্রথম কিস্তি</option>
          <option>দ্বিতীয় কিস্তি</option>
        </select>
      </div>
      {showResult && (
        <div style={S.resultBox}>
          <div style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>হিসাবের ফলাফল</div>
          {joining && delivery && (
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>যোগ্যতা যাচাই</div>
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
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>দৈনিক মোট মজুরি (÷২৬)</div>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>৳ {bn(dailyGross, 2)} টাকা</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>মোট ছুটির দিন</div>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>{bn(totalDays)} দিন</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>প্রথম কিস্তি ({bn(preDays)} দিন)</div>
              <div style={{ color: eligible ? '#86efac' : '#94a3b8', fontSize: '16px', fontWeight: 600 }}>{eligible ? tk(preBenefit) : '—'}</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginBottom: '3px' }}>দ্বিতীয় কিস্তি ({bn(postDays)} দিন)</div>
              <div style={{ color: eligible ? '#86efac' : '#94a3b8', fontSize: '16px', fontWeight: 600 }}>{eligible ? tk(postBenefit) : '—'}</div>
            </div>
          </div>
          <div style={{ background: eligible ? 'rgba(134,239,172,0.12)' : 'rgba(239,68,68,0.12)', borderRadius: '10px', padding: '12px 14px', marginTop: '6px', border: `1px solid ${eligible ? 'rgba(134,239,172,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div style={{ color: eligible ? '#86efac' : '#fca5a5', fontSize: '12px', marginBottom: '4px' }}>
              {eligible ? '✓ মোট মাতৃত্ব সুবিধা' : '✗ অযোগ্য — মাতৃত্ব সুবিধা প্রযোজ্য নয়'}
            </div>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>
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
  const [food,        setFood]        = useState('1250');
  const [medical,     setMedical]     = useState('750');
  const [transport,   setTransport]   = useState('450');
  const [termType,    setTermType]    = useState('চাকুরী অবসান (২৬)');
  const [earnedLeave, setEarnedLeave] = useState('');
  const [advance,     setAdvance]     = useState('0');
  const [noticeDays,  setNoticeDays]  = useState('0');

  let years = 0, months = 0, days = 0, totalDays = 0;
  if (joining && leaving) {
    const j = new Date(joining);
    const l = new Date(leaving);
    const diff = l.getTime() - j.getTime();
    totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    years  = Math.floor(totalDays / 365);
    const rem = totalDays % 365;
    months = Math.floor(rem / 30);
    days   = rem % 30;
  }

  const w  = parseFloat(total) || 0;
  const f  = parseFloat(food) || 0;
  const m  = parseFloat(medical) || 0;
  const tr = parseFloat(transport) || 0;
  const basic      = w > 0 ? (w - (f + m + tr)) / 1.5 : 0;
  const dailyBasic = basic / 30;
  const dailyGross = w / 30;

  let benefitYears = years;
  if (totalDays % 365 >= 365) benefitYears += 1;
  else if (totalDays % 365 >= 182) benefitYears += 0.5;

  const getCompensation = () => {
    if (benefitYears < 1) return 0;
    const resign  = ['ইস্তফা (২৭)', 'অনুপস্থিতির কারণে ইস্তফা (২৭)'];
    const thirty  = ['অবসর (২৮)', 'চাকুরী অবসান (২৬)', 'চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)', 'ডিসচার্জ (২২)', 'ছাঁটাই (২০)'];
    const fifteen = ['অপসারন (২৩)', 'বরখাস্ত (২৩)'];
    if (resign.includes(termType)) {
      if (benefitYears <= 3) return benefitYears * 7 * dailyBasic;
      if (benefitYears < 10)  return benefitYears * 15 * dailyBasic;
      return benefitYears * 30 * dailyBasic;
    }
    if (thirty.includes(termType))  return benefitYears * 30 * dailyBasic;
    if (fifteen.includes(termType)) return benefitYears * 15 * dailyBasic;
    return 0;
  };

  const earned     = (parseFloat(earnedLeave) || 0) * dailyBasic;
  const notice     = (parseFloat(noticeDays) || 0) * dailyGross;
  const comp       = getCompensation();
  const grossTotal = earned + comp + notice;
  const adv        = parseFloat(advance) || 0;
  const net        = grossTotal - adv;
  const valid      = w > 0 && joining && leaving && basic > 0;

  const termTypes = ['চাকুরী অবসান (২৬)','ছাঁটাই (২০)','অবসর (২৮)','ইস্তফা (২৭)','অনুপস্থিতির কারণে ইস্তফা (২৭)','চাকুরীরত থাকা অবস্থায় মৃত্যু (১৯)','ডিসচার্জ (২২)','অপসারন (২৩)','বরখাস্ত (২৩)','বরখাস্ত (২৩.৪: খ/ছ)'];



  return (
    <div>
      <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#1e40af' }}>
        💡 বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী চূড়ান্ত পাওনা হিসাব
      </div>
      <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>চাকরির তথ্য</div>
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
        <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '13px', color: '#0369a1' }}>
          চাকরির মেয়াদ: <strong>{bn(years)} বছর {bn(months)} মাস {bn(days)} দিন</strong>
        </div>
      )}
      <div style={{ marginBottom: '12px' }}>
        <label style={S.label}>চাকরি বিচ্ছেদের ধরন *</label>
        <select style={S.select} value={termType} onChange={e => setTermType(e.target.value)}>
          {termTypes.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <hr style={S.divider} />
      <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>বেতনের তথ্য</div>
      <div style={{ marginBottom: '12px' }}>
        <label style={S.label}>মোট মাসিক মজুরি (টাকা) *</label>
        <input type="number" style={{ ...S.input, borderColor: total ? '#3b82f6' : '#e2e8f0' }}
          placeholder="যেমন: ১২৫০০" value={total} onChange={e => setTotal(e.target.value)} />
      </div>
      <div style={S.row3}>
        <div><label style={S.label}>খাদ্য ভাতা</label><input type="number" style={S.input} value={food} onChange={e => setFood(e.target.value)} /></div>
        <div><label style={S.label}>চিকিৎসা ভাতা</label><input type="number" style={S.input} value={medical} onChange={e => setMedical(e.target.value)} /></div>
        <div><label style={S.label}>যাতায়াত ভাতা</label><input type="number" style={S.input} value={transport} onChange={e => setTransport(e.target.value)} /></div>
      </div>
      <hr style={S.divider} />
      <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>অতিরিক্ত তথ্য</div>
      <div style={S.row3}>
        <div><label style={S.label}>অর্জিত ছুটির দিন</label><input type="number" style={S.input} placeholder="০" value={earnedLeave} onChange={e => setEarnedLeave(e.target.value)} /></div>
        <div><label style={S.label}>নোটিশ দিন</label><input type="number" style={S.input} placeholder="০" value={noticeDays} onChange={e => setNoticeDays(e.target.value)} /></div>
        <div><label style={S.label}>অগ্রিম কর্তন</label><input type="number" style={S.input} placeholder="০" value={advance} onChange={e => setAdvance(e.target.value)} /></div>
      </div>
      {valid && (
        <div style={S.resultBox}>
          <div style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>হিসাবের ফলাফল</div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '6px', fontWeight: 600 }}>মজুরি বিশ্লেষণ</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[{ l: 'মূল মজুরি', v: `৳ ${bn(basic)} টাকা` },{ l: 'দৈনিক মূল', v: `৳ ${bn(dailyBasic, 2)} টাকা` },{ l: 'সুবিধা বছর', v: `${bn(benefitYears)} বছর` }].map(x => (
                <div key={x.l}><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{x.l}</div><div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{x.v}</div></div>
              ))}
            </div>
          </div>
          <CompRow label="অর্জিত ছুটির ক্ষতিপূরণ" sub={`${bn(parseFloat(earnedLeave)||0)} দিন × দৈনিক মূল`} value={tk(earned)} green />
          <CompRow label="চাকরি বিচ্ছেদ ক্ষতিপূরণ" sub={`${bn(benefitYears)} বছর × দৈনিক মূল`} value={comp > 0 ? tk(comp) : '০ টাকা'} green={comp > 0} />
          {parseFloat(noticeDays) > 0 && <CompRow label="নোটিশ পে" sub={`${bn(parseFloat(noticeDays)||0)} দিন × দৈনিক মোট`} value={tk(notice)} green />}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '13px' }}>মোট প্রাপ্য (A)</div>
            <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '15px' }}>৳ {bn(grossTotal)} টাকা</div>
          </div>
          {adv > 0 && <CompRow label="অগ্রিম কর্তন (B)" value={`— ৳ ${bn(adv)} টাকা`} />}
          <div style={{ background: 'rgba(134,239,172,0.12)', borderRadius: '10px', padding: '14px', marginTop: '12px', border: '1px solid rgba(134,239,172,0.3)' }}>
            <div style={{ color: '#86efac', fontSize: '12px', marginBottom: '4px' }}>সর্বমোট প্রাপ্য (A{adv > 0 ? ' − B' : ''})</div>
            <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>৳ {bn(net)} টাকা</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CALCULATOR HUB — exported for WorkerGuidelineViewer section 33
// ─────────────────────────────────────────────────────────────────────────────
export default function CalculatorHub() {
  const [activeTab, setActiveTab] = useState('salary');

  return (
    <div style={{ fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" }}>
      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: '#f8fafc', padding: '5px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '10px 6px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 600, transition: 'all 0.2s',
            background: activeTab === tab.id ? 'linear-gradient(135deg, #1e3a5f, #1e40af)' : 'transparent',
            color: activeTab === tab.id ? '#ffffff' : '#64748b',
          }}>
            <div style={{ fontSize: '16px', marginBottom: '3px' }}>{tab.emoji}</div>
            {tab.label}
          </button>
        ))}
      </div>
      {/* Calculator Panel */}
      {activeTab === 'salary'     && <SalaryCalculator />}
      {activeTab === 'maternity'  && <MaternityCalculator />}
      {activeTab === 'settlement' && <CompensationCalculator />}
    </div>
  );
}