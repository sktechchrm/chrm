// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC WORKER GUIDELINE PAGE
// Accessible via QR scan — no login required.
// Route: /worker-guide/:factoryId
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useMemo, useState } from 'react';
import CalculatorHub    from './CalculatorHub';
import FormulaReference from './FormulaReference';
import { useParams } from 'react-router-dom';
import { getActiveTopics } from './workerGuidelineData';
import { getFactoryById } from '../../factories/FactoryRegistry';
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';
import AppButton from '../common/AppButton';
import {
  FaBuilding, FaPhone, FaUser, FaMoneyBillWave, FaClock,
  FaShieldAlt, FaHandshake, FaLeaf, FaBan, FaTrophy,
  FaExclamationTriangle, FaHeartbeat, FaGavel, FaBaby,
  FaArrowLeft, FaPrint, FaFilePdf, FaIndustry, FaRegCalendarAlt,
  FaTools, FaUserShield, FaBalanceScale, FaRecycle,
} from 'react-icons/fa';

// ── Section wrapper ────────────────────────────────────────────────────────────
const Section: React.FC<{
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}> = ({ id, icon, title, color, children }) => (
  <div id={id} style={{
    background: '#fff',
    borderRadius: '12px',
    marginBottom: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: '1px solid #e2e8f0',
  }}>
    <div style={{
      background: color,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <span style={{ color: '#fff', fontSize: '16px' }}>{icon}</span>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{title}</span>
    </div>
    <div style={{ padding: '14px 16px' }}>{children}</div>
  </div>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '7px 0',
    borderBottom: '1px solid #f1f5f9',
    gap: '8px',
  }}>
    <span style={{ color: '#64748b', fontSize: '13px', flexShrink: 0, maxWidth: '55%' }}>{label}</span>
    <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>{value}</span>
  </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {items.map((item, i) => (
      <li key={i} style={{
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        padding: '5px 0', borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
        fontSize: '13px', color: '#334155',
      }}>
        <span style={{ color: '#3b82f6', marginTop: '4px', flexShrink: 0 }}>●</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const InfoBox: React.FC<{ color: string; title: string; items: string[] }> = ({ color, title, items }) => (
  <div style={{
    background: color + '15',
    border: `1px solid ${color}30`,
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '10px',
  }}>
    <div style={{ fontWeight: 700, color: color, fontSize: '12px', marginBottom: '6px' }}>{title}</div>
    <BulletList items={items} />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function WorkerGuidelinePage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const resolvedId   = factoryId ?? 'mg_shartex';
  const factory      = getFactoryById(resolvedId);
  const cfg          = factory.workerGuidelineConfig;
  const profile      = factory.workerProfile;
  const activeTopics = useMemo(() => getActiveTopics(factory), [factory.id]);
  const show = (n: number) => activeTopics.has(n);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  // ── App navigation state ─────────────────────────────────────────────────
  const [appView, setAppView] = useState<'guide' | 'calculator' | 'formula'>('guide');

  const handlePDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      if (!printRef.current) return;
      const canvas = await html2canvas(printRef.current, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let pos = 0;
      const pageH = pdf.internal.pageSize.getHeight();
      while (pos < pdfH) {
        pdf.addImage(imgData, 'JPEG', 0, -pos, pdfW, pdfH);
        pos += pageH;
        if (pos < pdfH) pdf.addPage();
      }
      pdf.save(`worker-guideline-${resolvedId}.pdf`);
    } catch (e) {
      alert('PDF export failed. Please use Print instead.');
    }
  };

  // ── Conditional app views ─────────────────────────────────────────────────
  if (appView === 'calculator') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setAppView('guide')}
          style={{
            position: 'fixed', top: '12px', left: '12px', zIndex: 1000,
            background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '10px',
            padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
          }}
        >
          ← গাইডে ফিরুন
        </button>
        <CalculatorHub />
      </div>
    );
  }

  if (appView === 'formula') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setAppView('guide')}
          style={{
            position: 'fixed', top: '12px', left: '12px', zIndex: 1000,
            background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '10px',
            padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
          }}
        >
          ← গাইডে ফিরুন
        </button>
        <FormulaReference />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f1f5f9; }
        .wg-container { max-width: 680px; margin: 0 auto; padding: 0 0 60px; }

        /* Top bar */
        .wg-topbar {
          position: sticky; top: 0; z-index: 100;
          background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
          padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .wg-topbar-back {
          display: flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.8); font-size: 13px; cursor: pointer;
          text-decoration: none; background: none; border: none;
        }
        .wg-topbar-actions { display: flex; gap: 8px; }
        .wg-action-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 6px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.15s;
        }
        .wg-action-btn--print { background: rgba(255,255,255,0.15); color: #fff; }
        .wg-action-btn--print:hover { background: rgba(255,255,255,0.25); }
        .wg-action-btn--pdf { background: #dc2626; color: #fff; }
        .wg-action-btn--pdf:hover { background: #b91c1c; }

        /* Factory header */
        .wg-header {
          background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
          padding: 20px 16px 28px;
          color: #fff;
          text-align: center;
        }
        .wg-header-logo {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px; font-size: 28px;
        }
        .wg-header-name { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
        .wg-header-name-bn { font-size: 14px; color: #93c5fd; margin-bottom: 6px; }
        .wg-header-address { font-size: 12px; color: rgba(255,255,255,0.7); }
        .wg-header-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15);
          border-radius: 20px; padding: 5px 14px;
          font-size: 11px; color: #bfdbfe; margin-top: 10px;
        }

        /* TOC */
        .wg-toc {
          background: #fff; margin: -14px 12px 14px;
          border-radius: 12px; padding: 14px 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .wg-toc-title { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .wg-toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
        .wg-toc-item {
          font-size: 11px; color: #3b82f6; padding: 3px 0;
          text-decoration: none; display: block;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .wg-toc-item:hover { color: #1d4ed8; }

        /* Content */
        .wg-content { padding: 0 12px; }

        /* Salary table */
        .salary-table { width: 100%; border-collapse: collapse; }
        .salary-table td { padding: 7px 8px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .salary-table td:last-child { text-align: right; font-weight: 600; color: #1e293b; }
        .salary-table tr.total-row td { font-weight: 700; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 10px; }

        /* Tag badges */
        .tag-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .tag {
          display: inline-block; padding: 3px 10px;
          background: #eff6ff; color: #1d4ed8;
          border-radius: 20px; font-size: 11px; font-weight: 600;
          border: 1px solid #bfdbfe;
        }

        /* Misconduct grid */
        .misconduct-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .misconduct-item {
          background: #fff7ed; border: 1px solid #fed7aa;
          border-radius: 6px; padding: 6px 10px;
          font-size: 12px; color: #9a3412;
        }

        /* Punishment grid */
        .punishment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .punishment-item {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 6px; padding: 6px 10px;
          font-size: 12px; color: #991b1b;
        }

        /* Restricted areas */
        .area-badge {
          display: inline-block; margin: 3px;
          padding: 4px 10px; border-radius: 6px;
          background: #fef2f2; border: 1px solid #fca5a5;
          color: #991b1b; font-size: 11px; font-weight: 600;
        }

        /* Footer */
        .wg-footer {
          background: #0f172a; color: #94a3b8;
          padding: 20px 16px; text-align: center;
          font-size: 12px; margin-top: 20px;
        }
        .wg-footer-hotline {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          margin-bottom: 16px;
        }
        .wg-hotline-chip {
          display: flex; align-items: center; gap: 8px;
          background: #1e293b; border-radius: 8px;
          padding: 8px 16px; color: #fff;
        }
        .wg-hotline-num { font-size: 16px; font-weight: 700; color: #60a5fa; }

        \${BASE_PRINT_CSS}
        \${PAGE_A4_PORTRAIT}
        @media print {
          .wg-topbar { display: none !important; }
          .wg-toc    { display: none !important; }
          .wg-container { max-width: 100%; padding: 0; }
          .wg-header { background: none !important; color: #000 !important;
            border: 2px solid #000; padding: 12px !important; }
          .wg-header-name { color: #000 !important; font-size:16px !important; }
          .wg-header-name-bn { color: #333 !important; }
          .wg-header-address { color: #555 !important; }
          .wg-header-badge { background:none !important; border:1px solid #999 !important; color:#333 !important; }
          .wg-footer { background:none !important; color:#000 !important; border-top:2px solid #000; }
          .wg-hotline-chip { background:none !important; border:1px solid #999; color:#000 !important; }
          .wg-hotline-num { color:#000 !important; }
          .tag, .misconduct-item, .punishment-item, .area-badge {
            background:none !important; border:1px solid #999 !important; color:#000 !important; }
          .wg-section-wrapper { break-inside:avoid !important; page-break-inside:avoid !important; }
          p, li { orphans:3; widows:3; }
        }      `}</style>

      {/* Top action bar */}
      <div className="wg-topbar" data-print-hide>
        <AppButton variant="back" onClick={() => window.history.back()}><FaArrowLeft aria-hidden="true" /> ফিরে যান</AppButton>
        <div className="wg-topbar-actions">
          <AppButton variant="print" onClick={handlePrint}><FaPrint aria-hidden="true" /> Print</AppButton>
          <AppButton variant="pdf" onClick={handlePDF}><FaFilePdf aria-hidden="true" /> PDF</AppButton>
        </div>
      </div>

      {/* ── App Launch Bar ─────────────────────────────────────────────────── */}
      <div data-print-hide style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        padding: '14px 16px',
        display: 'flex', gap: '10px', justifyContent: 'center',
        fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
      }}>
        <button
          onClick={() => setAppView('calculator')}
          style={{
            flex: 1, maxWidth: '220px',
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            border: 'none', borderRadius: '12px', padding: '12px 10px',
            cursor: 'pointer', color: '#fff', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🧮</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>শ্রমিক ক্যালকুলেটর</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>বেতন • মাতৃত্ব • ক্ষতিপূরণ</div>
          </div>
        </button>
        <button
          onClick={() => setAppView('formula')}
          style={{
            flex: 1, maxWidth: '220px',
            background: 'linear-gradient(135deg, #064e3b, #059669)',
            border: 'none', borderRadius: '12px', padding: '12px 10px',
            cursor: 'pointer', color: '#fff', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>📐</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>হিসাবের সূত্র</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>সকল আইনি ফর্মুলা দেখুন</div>
          </div>
        </button>
      </div>

      <div className="wg-container" ref={printRef}>

        {/* Factory header */}
        <div className="wg-header">
          <div className="wg-header-logo"><FaIndustry aria-hidden="true" /></div>
          <div className="wg-header-name">{factory.nameEn}</div>
          <div className="wg-header-name-bn">{factory.nameBn}</div>
          <div className="wg-header-address">{factory.addressEn}</div>
          <div className="wg-header-badge">
            <FaRegCalendarAlt aria-hidden="true" /> প্রতিষ্ঠাকাল: {profile.establishedYear} সাল
          </div>
        </div>

        {/* Table of contents */}
        <div className="wg-toc">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <div className="wg-toc-title" style={{ marginBottom:0 }}>
              বিষয়সূচি — Training Topics
              <span style={{ marginLeft:'6px', color:'#94a3b8', fontWeight:400, fontSize:'11px' }}>({activeTopics.size}টি)</span>
            </div>
            <button
              onClick={() => document.getElementById('s1')?.scrollIntoView({ behavior:'smooth' })}
              style={{
                background:'#eff6ff', border:'1px solid #bfdbfe', color:'#1d4ed8',
                borderRadius:'6px', padding:'3px 10px', fontSize:'11px', fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0,
              }}
            >
              ⊞ সব বিষয়
            </button>
          </div>
          <div className="wg-toc-grid">
            {[
              ['#s1','১. কারখানা পরিচিতি'],['#s2','২. কোম্পানির লক্ষ্য'],
              ['#s3','৩. উৎপাদন প্রক্রিয়া'],['#s4','৪. নিয়োগ পত্র'],
              ['#s5','৫. হ্যান্ড বুক'],['#s6','৬. আর্থিক সুবিধা'],
              ['#s7','৭. দক্ষতা বৃদ্ধি'],['#s8','৮. কর্মক্ষেত্রে ঝুঁকি'],
              ['#s9','৯. স্বাস্থ্য ও নিরাপত্তা'],['#s10','১০. ক্ষতিপূরণ নীতি'],
              ['#s11','১১. ঘুষ ও দুর্নীতি'],['#s12','১২. সংরক্ষিত এলাকা'],
              ['#s13','১৩. পুরস্কার'],['#s14','১৪. দুর্যোগ মোকাবেলা'],
              ['#s15','১৫. হয়রানি/যৌন নির্যাতন'],['#s16','১৬. বৈষম্য ও জবরদস্তি'],
              ['#s17','১৭. অভিযোগ পদ্ধতি'],['#s18','১৮. HR বিজনেস প্রিন্সিপাল'],
              ['#s19','১৯. শিশু ও কিশোর শ্রমিক'],['#s20','২০. শৃঙ্খলা'],
              ['#s21','২১. অসদাচরণ'],['#s22','২২. দেশি ও বিদেশি শ্রমিক'],
              ['#s23','২৩. সাব-কন্ট্রাক্ট'],['#s24','২৪. সংগঠনের স্বাধীনতা'],
              ['#s25','২৫. লিঙ্গ সমতা'],['#s26','২৬. মেটাল কন্ট্রোল'],
              ['#s27','২৭. HIV/AIDS'],['#s28','২৮. Ergonomic'],
              ['#s29','২৯. মেশিন সেফটি'],['#s30','৩০. ফিটব্যাক'],
              ['#s31','৩১. কারখানা ভিজিট'],['#s32','৩২. এনভায়রনমেন্ট'],
            ].map(([href, label]) => (
              <a key={href} className="wg-toc-item" href={href}>{label}</a>
            ))}
          </div>
        </div>

        {/* All sections */}
        <div className="wg-content">

          {/* 1 - Factory Overview */}
          {show(1) && (
          <Section id="s1" icon={<FaBuilding aria-hidden="true" />} title="১। কারখানা পরিচিতি ও পরিচয় পর্ব" color="#1e40af">
            <Row label="কারখানার নাম" value={factory.nameBn} />
            <Row label="ঠিকানা" value={factory.addressBn} />
            <Row label="প্রতিষ্ঠাকাল" value={`${profile.establishedYear} সাল`} />
            <Row label="মোট তলা" value={`${profile.totalFloors} তলা`} />
            <Row label="মোট শ্রমিক/কর্মকর্তা/কর্মচারী" value={`${profile.totalWorkers.toLocaleString()} জন`} />
            <Row label="মোট শিফট" value={`${profile.totalShifts} টি`} />
            <Row label="সেলাই লাইন" value={`${profile.totalSewingLines} টি`} />
            <Row label="বাথরুম" value={`${profile.totalBathrooms} টি`} />
            <Row label="দৈনিক উৎপাদন" value={`${profile.dailyProduction.toLocaleString()} পিছ`} />
            <Row label="মাসিক উৎপাদন" value={`${profile.monthlyProduction.toLocaleString()} পিছ`} />
            <Row label="বার্ষিক উৎপাদন" value={`${profile.yearlyProduction.toLocaleString()} পিছ`} />
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>বায়ার সমূহ:</div>
              <div className="tag-wrap">
                {profile.buyers.map((b, i) => <span key={i} className="tag">{b}</span>)}
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>সেকশন সমূহ:</div>
              <div className="tag-wrap">
                {profile.sections.map((s, i) => <span key={i} className="tag" style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>{s}</span>)}
              </div>
            </div>
          </Section>
          )}

          {/* 2 - Company Goals */}
          {show(2) && (
          <Section id="s2" icon={<FaTrophy aria-hidden="true" />} title="২। কোম্পানির লক্ষ্য" color="#0891b2">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              পাঁচ বছরের মধ্যে গুণগতমান, আন্তর্জাতিক মানের সেবা প্রদান, শ্রমিক কর্মচারীদের সন্তুষ্ট এবং সর্বসাফল্যক্রমে গ্রাহকের সন্তুষ্ট অর্জনের মাধ্যমে বাংলাদেশের প্রেক্ষাপটে সুউচ্চ পোশাক নির্মাণকারী প্রতিষ্ঠান হিসাবে স্বীকৃতি অর্জন করা।
            </p>
            <BulletList items={[
              'আন্তর্জাতিক মানের পণ্য তৈরি পূর্বক গ্রাহকের চাহিদা পূরণ ও গুণগতমানের নিশ্চয়তা',
              'শ্রমিক কর্মচারীদের মধ্যে প্রতিষ্ঠানের মালিকানা অনুভূতি জাগ্রত করা',
              'সর্বোচ্চ মানের দক্ষতা এবং সততা নিশ্চিত করা',
              'গ্রাহকের সন্তুষ্টি এবং বিশ্বস্ততা অর্জন করা',
              'একটি নিরাপদ কর্মপরিবেশ নিশ্চিত করা এবং সুস্থ কাজের অভ্যাস গড়ে তোলা',
              'কারখানার সকলের জন্য ন্যায্য মজুরি নিশ্চিত করা',
              'পণ্যের গুণগতমানের নিশ্চয়তা প্রদান করা, যথাসময়ে পণ্যের রপ্তানি নিশ্চিত করা',
              'পরিবেশ এবং সম্প্রদায়ের জন্য কাজ করার মনোবল গঠন করা',
              'দীর্ঘস্থায়ী উন্নতি সাধন করা',
              'সকলের জন্য সমান অধিকার নিশ্চিত করা',
            ]} />
          </Section>
          )}

          {/* 3 - Production */}
          {show(3) && (
          <Section id="s3" icon={<FaIndustry aria-hidden="true" />} title="৩। উৎপাদন প্রক্রিয়া" color="#059669">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              এটি একটি ওভেন কারখানা। এখানে সকল প্রকার ওভেন টপস (শার্ট) তৈরি করা হয়।
            </p>
            <div className="tag-wrap" style={{ marginBottom: '10px' }}>
              {profile.productTypes.map((p, i) => <span key={i} className="tag" style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>{p}</span>)}
            </div>
            <BulletList items={[
              'উৎপাদন প্রক্রিয়ায় জড়িত সকলের সাথে ধারাবাহিকতা রক্ষা করতে হবে',
              'পোশাকের মান নিশ্চিত করতে হবে',
              'উৎপাদন বাড়াতে হবে এবং নির্দেশনা মেনে কাজ করতে হবে',
              'অভিজ্ঞতার বৃদ্ধির সাথে সাথে দক্ষতা বাড়াতে হবে',
              'ওয়েস্টেজ, অলটার, রিজেক্ট মালের সংখ্যা কমাতে হবে',
            ]} />
          </Section>
          )}

          {/* 4 - Appointment Letter */}
          {show(4) && (
          <Section id="s4" icon={<FaGavel aria-hidden="true" />} title="৪। নিয়োগ পত্রের উল্লেখিত বিষয়াদি" color="#7c3aed">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              নিয়োগ পত্রে কর্মে যোগদানের তারিখ, নাম, পিতা/স্বামীর নাম, পদবী, গ্রেড, কার্ড নং এবং কোন বিভাগ/সেকশনে যোগদান করেছেন তা উল্লেখ আছে।
            </p>

            <div style={{ fontWeight: 700, fontSize: '13px', color: '#4c1d95', marginBottom: '8px' }}>
              শিক্ষানবিসকাল
            </div>
            <p style={{ fontSize: '13px', color: '#334155', marginBottom: '10px' }}>
              নিয়োগের তারিখ হইতে <strong>{cfg.probationMonths} মাস</strong> শিক্ষানবিসকাল অতিক্রম হইলে স্থায়ী শ্রমিক হিসেবে গণ্য হবে।
            </p>

            <div style={{ fontWeight: 700, fontSize: '13px', color: '#4c1d95', marginBottom: '8px' }}>
              বেতন ও মজুরির বিন্যাস
            </div>
            <table className="salary-table">
              <tbody>
                <tr><td>ক) মূল বেতন</td><td>৳ {cfg.salary.basicSalary.toLocaleString()}/–</td></tr>
                <tr><td>খ) বাড়ি ভাড়া (মূল মজুরির ৫০%)</td><td>৳ {cfg.salary.houseRent.toLocaleString()}/–</td></tr>
                <tr><td>গ) চিকিৎসা ভাতা</td><td>৳ {cfg.salary.medicalAllowance.toLocaleString()}/–</td></tr>
                <tr><td>ঘ) যাতায়াত</td><td>৳ {cfg.salary.transport.toLocaleString()}/–</td></tr>
                <tr><td>ঙ) খাদ্য ভাতা</td><td>৳ {cfg.salary.foodAllowance.toLocaleString()}/–</td></tr>
                <tr className="total-row"><td>চ) সর্বমোট</td><td>৳ {cfg.salary.total.toLocaleString()}/–</td></tr>
              </tbody>
            </table>

            <div style={{ fontWeight: 700, fontSize: '13px', color: '#4c1d95', margin: '12px 0 8px' }}>
              কার্য ঘণ্টা ও ওভারটাইম
            </div>
            <Row label="সাধারণ কার্য সময়" value={`দৈনিক ${cfg.workingHoursPerDay} ঘণ্টা`} />
            <Row label="সর্বোচ্চ ওভারটাইম" value={`${cfg.maxOvertimeHours} ঘণ্টা`} />
            <Row label="ওভারটাইম হিসাব" value={cfg.overtimeFormula} />
            <Row label="অভিযোগ বাক্স খোলা হয়" value="প্রতি ১৫ দিন পর পর" />
            <Row label="দুপুরে খাবার বিরতি" value={`দুপুর ${cfg.lunchBreakStart} টা – ${cfg.lunchBreakEnd} টা (১ ঘণ্টা)`} />
            <Row label="বেতন পরিশোধ" value={`মাস শেষের পরবর্তী ${cfg.salaryPaymentDays} কার্যদিবসের মধ্যে`} />

            <div style={{ fontWeight: 700, fontSize: '13px', color: '#4c1d95', margin: '12px 0 8px' }}>
              চাকুরির অবসান (নোটিশ পিরিয়ড)
            </div>
            <Row label="মালিক কর্তৃক (স্থায়ী শ্রমিক)" value={`${cfg.noticePeriodDays.permanent} দিনের নোটিশ`} />
            <Row label="মালিক কর্তৃক (অস্থায়ী শ্রমিক)" value={`${cfg.noticePeriodDays.temporary} দিনের নোটিশ`} />
            <Row label="মালিক কর্তৃক (অন্যান্য)" value={`${cfg.noticePeriodDays.other} দিনের নোটিশ`} />
            <Row label="শ্রমিক কর্তৃক (স্থায়ী)" value={`${cfg.noticePeriodDays.permanent} দিন আগে নোটিশ`} />
          </Section>
          )}

          {/* 5 - Handbook */}
          {show(5) && (
          <Section id="s5" icon={<FaUser aria-hidden="true" />} title="৫। হ্যান্ড বুক বা শ্রমিক সহায়িকা বই" color="#0891b2">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
              কারখানায় নিয়োগ পত্র পাওয়ার সাথে একটি করে শ্রমিক সহায়িকা বই দেওয়া হয়। শ্রমিক সহায়িকা বইয়ে উল্লেখ থাকে আইনের সারাংশ, বাংলাদেশ গেজেটে উল্লেখকৃত বিভিন্ন গ্রেড, কারখানায় সমস্ত নিয়মকানুন, সুযোগ সুবিধা ইত্যাদি।
            </p>
          </Section>
          )}

          {/* 6 - Benefits */}
          {show(6) && (
          <Section id="s6" icon={<FaMoneyBillWave aria-hidden="true" />} title="৬। আর্থিক ও অনার্থিক সুবিধা সমূহ" color="#16a34a">
            <InfoBox color="#16a34a" title="আর্থিক সুবিধা সমূহ" items={[
              'দুইটি ঈদ বোনাস',
              'হাজিরা বোনাস',
              'বার্ষিক ছুটির টাকা প্রদান',
              'সার্ভিস বেনিফিটের টাকা',
            ]} />
            <InfoBox color="#0891b2" title="অনার্থিক সুবিধা সমূহ" items={[
              'মেডিকেল সুবিধা',
              'ফ্রি শিক্ষা ব্যবস্থা',
              'ফ্রি প্রশিক্ষণ ব্যবস্থা',
              'ডে-কেয়ার সুবিধা',
              'বাৎসরিক এওয়ার্ড প্রদান',
              'বাৎসরিক অনুষ্ঠান',
            ]} />
          </Section>
          )}

          {/* 7 - Skill Development */}
          {show(7) && (
          <Section id="s7" icon={<FaTrophy aria-hidden="true" />} title="৭। দক্ষতা বৃদ্ধির সুযোগ ও মজুরি বৃদ্ধি" color="#d97706">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              প্রত্যেকটি শ্রমিকের কাজ শেখার সুযোগ দেওয়া হয় এবং কাজের জটিলতা ও গভিরতা বৃদ্ধির সাথে সাথে তাদের পদোন্নতি ও বেতন বৃদ্ধি করা হয়।
            </p>
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#92400e', marginBottom: '6px' }}>পদোন্নতির ক্ষেত্রে ৭টি বিষয় বিবেচনা করা হয়:</div>
            <div className="tag-wrap">
              {['দক্ষতা', 'বিভিন্ন প্রসেস', 'কাজের কোয়ালিটি', 'শিক্ষাগত যোগ্যতা', 'অভিজ্ঞতা', 'উপস্থিতি', 'শৃঙ্খলা'].map((item, i) => (
                <span key={i} className="tag" style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>{item}</span>
              ))}
            </div>
          </Section>
          )}

          {/* 8 - Workplace Risk */}
          {show(8) && (
          <Section id="s8" icon={<FaExclamationTriangle aria-hidden="true" />} title="৮। কর্মক্ষেত্রে ঝুঁকি ও প্রতিকার" color="#dc2626">
            <BulletList items={[
              'কোম্পানি/কর্তৃপক্ষের সম্পদ রক্ষার ব্যাপারে সবাইকে সচেতন হতে হবে',
              'টিফিন বক্স এবং জুতার ব্যাগ ছাড়া অন্য কোনো ব্যাগ নিয়ে কারখানার ভিতরে প্রবেশ করা যাবে না',
              'বিড়ি, সিগারেট, দিয়াশলাই এবং কোনো দাহ্য পদার্থ ফ্যাক্টরিতে বহন করা যাবে না',
              'ক্যামিকেল জাতীয় দ্রব্যাদি ক্যামিকেল রুম ব্যাতিত অন্য কোনো জায়গায় ব্যবহার করা যাবে না',
              'কারখানার যাবতীয় সম্পদ যাতে আপনার দ্বারা বা অন্যের দ্বারা ক্ষতি সাধিত না হয় সেদিকে খেয়াল রাখতে হবে',
              'কেউ যদি ক্ষতি করার পরিকল্পনা করে তাহলে সাথে সাথে কর্তৃপক্ষকে অবহিত করবেন',
            ]} />
          </Section>
          )}

          {/* 9 - Health & Safety */}
          {show(9) && (
          <Section id="s9" icon={<FaShieldAlt aria-hidden="true" />} title="৯। স্বাস্থ্য নিরাপত্তা ও পি পি ই" color="#0891b2">
            <BulletList items={[
              'সকল ওয়ার্কার কাটার, সিজার, ভোমর রশি দিয়ে বেধে নাম কার্ড নং লিখতে হবে এবং নির্দিষ্ট পরিমাণ উচ্চ স্থানে বেধে কাজ করতে হবে',
              'মেশিনে নিডেল গার্ড, আইগার্ড, পুলিকভার নিশ্চিত করুন',
              'ব্যান্ড নাইফ মেশিন চালাতে হ্যান্ড গ্লোভস ব্যবহার ও সকলকে মাস্ক ব্যবহার করতে হবে',
              'থ্রেড সার্কিং অপারেটর কাজ করার সময় মাস্ক ও এয়ার প্লাগ ব্যবহার করবে',
              'স্পট রিমুভিং ম্যানকে হ্যান্ড গ্লোভস, মাস্ক অবশ্যই ব্যবহার করে কাজ করবেন',
              'পরিষ্কার-পরিচ্ছন্নতা, জঞ্জাল ও নির্গত ময়লা অপসারণ নিয়মিত করতে হবে',
              'বায়ু চলাচল ব্যবস্থা ও তাপমাত্রা নিয়ন্ত্রণ করতে হবে',
              'পর্যাপ্ত ফায়ার এক্সটিংগুইসার এবং ফায়ার ফাইটার, ফার্স্ট এইডার রয়েছে',
            ]} />
          </Section>
          )}

          {/* 10 - Compensation */}
          {show(10) && (
          <Section id="s10" icon={<FaBalanceScale aria-hidden="true" />} title="১০। ক্ষতিপূরণ নীতি" color="#7c3aed">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              প্রতিষ্ঠান কর্মচারীদের জন্য ন্যায্য, স্বচ্ছ এবং মানবিক পরিশোধ নিশ্চিত করার জন্য প্রতিশ্রুতিবদ্ধ।
            </p>
            <BulletList items={[
              'কর্মক্ষেত্রে দুর্ঘটনায় আহত শ্রমিকের চিকিৎসা মালিকের তত্ত্বাবধানে করিতে হইবে এবং মালিক উহার ব্যয় বহন করিবেন',
              'কর্মক্ষেত্রে দুর্ঘটনাজনিত কারণে বা পেশাগত রোগে আক্রান্ত হয়ে মৃত্যুবরণ করলে সমস্ত সুবিধাভোগীকে যথাযথ উত্তরণ ও সহযোগে লক্ষ টাকা অনুদান প্রদান',
              'কোনো সুবিধাভোগী চাকুরীর অবস্থায় অসুস্থ হয়ে বা কর্মক্ষেত্রের বাইরে কোনো দুর্ঘটনায় মৃত্যুবরণ বা স্থায়ীভাবে অসুস্থ হলে তিনি বা তার উত্তরণকারীর প্রতি লক্ষ টাকা অনুদান প্রদান',
              'কোনো সুবিধাভোগী কর্মকালীন দুর্ঘটনায় আহত হলে তার কোনো অস্থায়ী ক্ষতিপূরণ বা স্থায়ী অক্ষমতার কারণে অর্থহীন হলে তাকে অনুদান প্রদান',
              'সুবিধাভোগীদের পরিবারের মেধাবী সদস্যকে শিক্ষার জন্য বৃত্তি প্রদান',
              'সামাজিক নিরাপত্তামূলক সুবিধা হিসেবে বিশেষায়িত হাসপাতালে চিকিৎসা এবং সহায়তা প্রদান',
              'সমস্ত পরিশোধ প্রক্রিয়া গোপনীয়তা, দ্রুততা এবং সহানুভূতির সঙ্গে পরিচালিত হবে',
            ]} />
          </Section>
          )}

          {/* 11 - Bribery & Corruption */}
          {show(11) && (
          <Section id="s11" icon={<FaBan aria-hidden="true" />} title="১১। ঘুষ ও দুর্নীতি" color="#dc2626">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              ঘুষ ও দুর্নীতিকে আমরা মারাত্মক অপরাধ হিসেবে চিহ্নিত করেছি এবং আমাদের কারখানায় সর্বত্র ঘুষ আদান প্রদান ও দুর্নীতি সম্পন্ন নিষিদ্ধ।
            </p>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
              ⚠️ যদি কোনো কর্মচারীর বিরুদ্ধে ঘুষ ও দুর্নীতির সম্পৃক্ততা পাওয়া যায় তাৎক্ষণিক তার বিরুদ্ধে শাস্তিমূলক ব্যবস্থা গ্রহণ করা হবে।
            </div>
          </Section>
          )}

          {/* 12 - Restricted Areas */}
          {show(12) && (
          <Section id="s12" icon={<FaBan aria-hidden="true" />} title="১২। সংরক্ষিত এলাকা" color="#ea580c">
            <p style={{ fontSize: '13px', color: '#334155', marginBottom: '10px', lineHeight: 1.7 }}>
              নিম্নোক্ত সংরক্ষিত এলাকায় প্রবেশ নিষেধ। প্রবেশ করতে হলে কর্তৃপক্ষের আবেদনের সাপেক্ষে প্রবেশ করতে হবে এবং সংরক্ষিত এলাকায় দায়িত্বরত নিরাপত্তা প্রহরী রেজিস্টারে লিপিবদ্ধ করে প্রবেশ করতে হবে।
            </p>
            <div>
              {['ওয়্যার হাউজ', 'ফিনিশড গোডাউন', 'বন্ডেড ওয়্যার হাউজ', 'ক্যামিক্যাল রুম', 'ব্যান্ড নাইফ রুম', 'ফায়ার পাম্প রুম', 'জেনারেটর রুম', 'বয়লার রুম'].map((area, i) => (
                <span key={i} className="area-badge">{area}</span>
              ))}
            </div>
          </Section>
          )}

          {/* 13 - Reward */}
          {show(13) && (
          <Section id="s13" icon={<FaTrophy aria-hidden="true" />} title="১৩। পুরস্কার" color="#ca8a04">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
              যদি কোনো শ্রমিক/কর্মচারী/কর্মকর্তা কারখানার ভিতরে কোনো বেআইনী পণ্য যেমন: বিস্ফোরক, সিগারেট, বোমা, দিয়াশলাই জাতীয় কোনো কিছু নিয়ে প্রবেশ করে এবং যদি কোনো কর্মচারী/কর্মকর্তার ঘুষ ও দুনীতির প্রমাণ কেউ ধরে দিতে পারেন তাহলে সেই তথ্যদাতাকে পুরস্কৃত করা হবে।
            </p>
            <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '13px', color: '#854d0e' }}>
              🔒 তথ্যদাতার নাম অবশ্যই গোপন রাখা হবে।
            </div>
          </Section>
          )}

          {/* 14 - Emergency */}
          {show(14) && (
          <Section id="s14" icon={<FaExclamationTriangle aria-hidden="true" />} title="১৪। দুর্যোগ মোকাবেলায় করণীয়" color="#dc2626">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              যেকোনো দুর্যোগ মোকাবেলায় গুরুত্বপূর্ণ হলো বহির্গমন। তাই সর্বপ্রথম আপনি বহির্গমন নক্সা দেখে জানবেন আপনি যেকোনো দুর্যোগ মোকাবেলায় দ্রুত কোন রাস্তা ব্যবহার করবেন।
            </p>
            <BulletList items={[
              'বহির্গমন নক্সা দেখে জানুন — দ্রুততম রাস্তা চিহ্নিত করুন',
              'যারা ফায়ার টিমের সদস্য তারা তাদের স্ব স্ব দায়িত্ব পালন করবেন',
              'জরুরি বহির্গমনের প্রশিক্ষণের উদ্দেশ্যে আমাদের কারখানায় প্রতি মাসে অগ্নি মহড়া হয়',
              'অগ্নি মহড়ায় প্রত্যেকেই যে অবস্থায় থাকবেন সেই অবস্থায় দ্রুত কারখানার বাহিরে সমাবেশ স্থানে চলে যাবেন',
            ]} />
          </Section>
          )}

          {/* 15 - Harassment */}
          {show(15) && (
          <Section id="s15" icon={<FaUserShield aria-hidden="true" />} title="১৫। হয়রানি/যৌন হয়রানি ও শারীরিক নির্যাতন" color="#9333ea">
            <InfoBox color="#dc2626" title="শারীরিক হয়রানি নিষিদ্ধ" items={[
              'শারীরিকভাবে আঘাত বা ক্ষতি সাধন করা',
              'শারীরিক বা মানসিকভাবে ক্ষতি সাধনের হুমকি দেওয়া',
              'ভয়দেখার উদ্দেশ্যে বা হেয় করার জন্য কোনো প্রকার মন্তব্য করা',
              'টয়লেট ব্যবহার করতে বা পানি পান করতে বাধা সৃষ্টি করা',
              'অযৌক্তিক নিরাপত্তা তল্লাশী',
            ]} />
            <InfoBox color="#7c3aed" title="যৌন হয়রানি নিষিদ্ধ" items={[
              'সুপারভাইজার কর্তৃক যেকোনো উপায়ে শ্রমিকদের শরীর স্পর্শ করা',
              'শ্রমিকদের যৌন মন্তব্য করা যা কাজের প্রতিকূল পরিবেশ সৃষ্টি করা',
              'চাকুরিতে বিশেষ সুবিধা দেওয়ার জন্য শ্রমিকদের যেকোনো ধরনের যৌন আচরণে অংশ নিতে বাধ্য করা',
              'চাকুরী রক্ষার চুক্তি হিসেবে যেকোনো ধরনের যৌন আচরণে অংশ নেওয়া বা অংশ নিতে বাধ্য করা',
            ]} />
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>
              ⛔ কোনো শ্রমিককে মৌখিকভাবে গালাগালি করা যাবে না বা মানসিক পীড়াদায়ক কোনো আচরণ করা যাবে না।
              কারখানার অভ্যন্তরে বৈষম্য, হয়রানি, গালাগালি, বলপূর্বক শ্রম, বন্দী অথবা জিম্মি করে কোনো কাজ করানো যাবে না।
            </div>
          </Section>
          )}

          {/* 16 - Discrimination & Forced Labour */}
          {show(16) && (
          <Section id="s16" icon={<FaBalanceScale aria-hidden="true" />} title="১৬। বৈষম্য ও জবরদস্তিমূলক শ্রম" color="#0f766e">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              নিয়োগ, বেতন, সুবিধাদি, পদোন্নতি, কাজের পরিবেশ রক্ষা, শৃঙ্খলা রক্ষা, চাকুরি অবসান ইত্যাদি ক্ষেত্রে জাতীয়তা, সামাজিক পরিচিতি, রাজনৈতিক পরিচিতি, মাতৃত্বকালীন অবস্থা, প্রতিবন্ধী, জাতি, ধর্ম, বর্ণ, গোষ্ঠী, নারী/পুরুষ ইত্যাদির উপর নির্ভর করে যেন কোনো বৈষম্য না হয়।
            </p>
            <BulletList items={[
              'মোহাম্মাদী গ্রুপ জবরদস্তিমূলক শ্রম বিরোধী নীতিমালা বাস্তবায়ন করার জন্য বদ্ধ পরিকর',
              'বলপূর্বক শ্রম/রুদ্ধ শ্রম ও চুক্তিবদ্ধ শ্রম মোহাম্মাদী গ্রুপ কোনো ভাবে গ্রহণ অথবা সমর্থন করে না',
              'কর্তৃপক্ষ কোনো ব্যক্তি স্বাধীনতায় কোনো রূপ হস্তক্ষেপ করে না',
            ]} />
          </Section>
          )}

          {/* 17 - Complaint Procedure */}
          {show(17) && (
          <Section id="s17" icon={<FaPhone aria-hidden="true" />} title="১৭। অভিযোগ পদ্ধতি ও হট লাইন নম্বর" color="#1e40af">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              যদি কোনো শ্রমিক হয়রানি/গর্হিত আচরণ ও শারীরিক নির্যাতনের স্বীকার হয় এবং যদি কোনো অভিযোগ, পরামর্শ, অনুযোগ থাকে তাহলে অভিযোগের ধরন বুঝে আপনার পার্শ্ববর্তী সুপারভাইজার, সেকশন ইনচার্জ, ইউনিয়নের সদস্য, ওয়েলফেয়ার অফিসার, এডমিন ম্যানেজার, কারখানার জি.এম এদেরকে জানাতে পারেন।
            </p>
            <BulletList items={[
              'কারখানার বিভিন্ন টয়লেটের ভিতরে অভিযোগ বক্স রয়েছে, সেখানেও আপনার অভিযোগ বক্সে ফেলতে পারেন',
              'এছাড়াও বহিরাগত যেকোনো অর্গানাইজেশন এর নিকট অভিযোগ করতে পারেন',
              'অভিযোগ বক্স ১৫ দিন পর পর খোলা হয়',
            ]} />
            <div style={{ marginTop: '12px' }}>
              {profile.hotlines.map((h, i) => (
                <a key={i} href={`tel:${h.number}`} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: '8px', padding: '10px 12px', marginBottom: '8px',
                  textDecoration: 'none',
                }}>
                  <FaPhone style={{ color: '#1d4ed8', fontSize: '16px' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{h.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1d4ed8' }}>{h.number}</div>
                  </div>
                </a>
              ))}
            </div>
          </Section>
          )}

          {/* 18 - HR Business Principal */}
          {show(18) && (
          <Section id="s18" icon={<FaUser aria-hidden="true" />} title="১৮। এইচ আর বিজনেস প্রিন্সিপাল" color="#475569">
            <BulletList items={[
              'মানবসম্পদ ব্যবস্থাপনা এবং দক্ষতা নিশ্চিত করার লক্ষ্যে পলিসি অনুসারে দায়িত্ব এবং দায়বদ্ধতা নিশ্চিত করা হয়',
              'কারখানায় কমপ্লায়েন্স নিশ্চিত করা',
              'নিয়মিত এবং নির্দিষ্ট সময় পর পর বিভিন্ন কমিটি মিটিং এর ব্যবস্থা করা',
            ]} />
          </Section>
          )}

          {/* 19 - Child Labour */}
          {show(19) && (
          <Section id="s19" icon={<FaBaby aria-hidden="true" />} title="১৯। শিশু শ্রমিক ও কিশোর শ্রমিক" color="#0891b2">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, marginBottom: '10px' }}>
              দরিদ্রতার কষাঘাত সহ্য করেও যে সকল কিশোর কিশোরী সংসারের হাল ধরে ঠোটের কোণে হাসির রেখা ফুটিয়ে তোলার নিরন্তর সংগ্রামে নিয়োজিত আছে তাদের প্রতি সম্মান প্রদর্শনের জন্য দৃঢ় অঙ্গীকারাবদ্ধ।
            </p>
            <BulletList items={[
              'বাংলাদেশ শ্রম আইন ২০০৬ (সংশোধিত-২০১৩, ২০১৮ ও ২০২৫ অধ্যাদেশ) এবং বাংলাদেশ শ্রম বিধিমালা ২০১৫ অনুযায়ী যাবতীয় সুবিধা নিশ্চিত করে কাজ করানো হয়',
              'শিশু শ্রম সম্পূর্ণ নিষিদ্ধ',
            ]} />
          </Section>
          )}

          {/* 20 - Discipline */}
          {show(20) && (
          <Section id="s20" icon={<FaGavel aria-hidden="true" />} title="২০। শৃঙ্খলা" color="#1e40af">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
              শৃঙ্খলা মানব সম্পদ বিভাগের একটি গুরুত্বপূর্ণ বিষয়। শাস্তিমূলক নীতি ও পদ্ধতির উদ্দেশ্য হচ্ছে নির্ধারণ ও কারখানার মধ্যে আচরণের মান বজায় রাখা এবং নিশ্চিত করা যাতে সকল কর্মকর্তা, কর্মচারী ও শ্রমিকবৃন্দ ধারাবাহিকভাবে ন্যায়ের পথে থাকে।
            </p>
          </Section>
          )}

          {/* 21 - Misconduct */}
          {show(21) && (
          <Section id="s21" icon={<FaBan aria-hidden="true" />} title="২১। অসদাচরণ ও শাস্তিমূলক ব্যবস্থা" color="#dc2626">
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#991b1b', marginBottom: '8px' }}>অসদাচরণ সমূহ:</div>
            <div className="misconduct-grid">
              {[
                'ইচ্ছাকৃতভাবে অবাধ্যতা',
                'চুরি, প্রতারণা বা অসাধুতা',
                'চাকুরির সংক্রান্ত ঘুষ গ্রহণ ও প্রদান',
                'বিনা ছুটিতে অভ্যাসগত অনুপস্থিতি',
                'অভ্যাসগত বিলম্বে অনুপস্থিতি',
                'প্রতিষ্ঠানের কোনো আইনের অভ্যাসগত লংঘন',
                'উচ্ছৃঙ্খল বা দাঙ্গা-হাঙ্গামামূলক আচরণ',
                'কাজে-কর্মে অভ্যাসগত গাফিলতি',
              ].map((item, i) => <div key={i} className="misconduct-item">{item}</div>)}
            </div>

            <div style={{ fontWeight: 700, fontSize: '12px', color: '#991b1b', margin: '12px 0 8px' }}>শাস্তিমূলক ব্যবস্থা:</div>
            <div className="punishment-grid">
              {[
                'চাকুরী থেকে অপসারণ',
                'নীচের পদে/গ্রেডে আনয়ন (১ বছর পর্যন্ত)',
                'পদোন্নতি বন্ধ (১ বছর পর্যন্ত)',
                'মজুরি বৃদ্ধি বন্ধ (১ বছর পর্যন্ত)',
                'জরিমানা',
                'সাময়িক বরখাস্ত (৭ দিন পর্যন্ত)',
                'ভর্ৎসনা ও সতর্কীকরণ',
              ].map((item, i) => <div key={i} className="punishment-item">{item}</div>)}
            </div>
          </Section>
          )}

          {/* 22 - Migrant Workers */}
          {show(22) && (
          <Section id="s22" icon={<FaUser aria-hidden="true" />} title="২২। দেশি ও বিদেশি অভিবাসি শ্রমিক" color="#0f766e">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
              আন্তর্জাতিক শ্রম সংস্থার ১৮৯ নং কানভেনশন অনুসারে অভিবাসী গৃহকর্মী হলেন এমন যেকোনো ব্যক্তি যারা পরিবারের অবস্থার উন্নতি করতে এবং নিজের ভবিষ্যতকে উন্নত করতে এক অঞ্চল থেকে অন্য অঞ্চলে গিয়ে কাজ করেন। মোহাম্মাদী গ্রুপ সমস্ত আইনী প্রয়োজনীয়তা মেনে অভিবাসী স্বদেশী শ্রমিকদের নিয়োগ করে থাকে।
            </p>
          </Section>
          )}

          {/* 23 - Sub-Contract */}
          {show(23) && (
          <Section id="s23" icon={<FaHandshake aria-hidden="true" />} title="২৩। সাব-কন্ট্রাক্ট" color="#475569">
            <BulletList items={[
              'সাপ্লায়ার এবং সাব কন্ট্রাক্টরদের আমাদের পলিসি এবং প্রোসিডিউর শেয়ার করা হয়',
              'সাপ্লায়ার এবং সাব কন্ট্রাক্টরদের সোশ্যাল এবং শ্রম চর্চার উপরে প্রশিক্ষণ দেওয়া হয়',
            ]} />
          </Section>
          )}

          {/* 24 - Freedom of Association */}
          {show(24) && (
          <Section id="s24" icon={<FaHandshake aria-hidden="true" />} title="২৪। সংগঠন করার স্বাধীনতা ও যৌথ দরকষাকষি" color="#1e40af">
            <BulletList items={[
              'শ্রমিকেরা স্বাধীনভাবে ইউনিয়নে যোগদান করতে পারে',
              'ইউনিয়ন স্বাধীনভাবে কোনো ফেডারেশন বা কনফেডারেশনে যোগদান করতে পারে',
              'ইউনিয়নের সদস্য স্বাধীনভাবে শ্রমিকদের সাথে যোগাযোগ করতে পারে',
              'ইউনিয়নের সদস্য হওয়ার জন্য কোনো ধরনের অননুমোদিত মজুরি কর্তন করা হয় না',
              'কর্তৃপক্ষের উপস্থিতি ছাড়াও ইউনিয়ন সদস্যগণ মিটিং ও আলোচনা করতে পারে',
              'ম্যানেজমেন্ট কখনও ইউনিয়নের কাজে হস্তক্ষেপ, নিয়ন্ত্রণ অথবা প্রভাবিত করবে না',
              'নিয়োগের সময় ইউনিয়ন সদস্য হওয়ার কারণে কোনো ধরণের বাধা বা বিষম্য করা যাবে না',
              'কোনো অননুমোদিত পদ্ধতিতে কোনো ইউনিয়ন সদস্যকে শাস্তি, হুমকি, ভয়ভীতি প্রদর্শন করা যাবে না',
            ]} />
          </Section>
          )}

          {/* 25 - Gender Equality */}
          {show(25) && (
          <Section id="s25" icon={<FaBalanceScale aria-hidden="true" />} title="২৫। কর্মক্ষেত্রে লিঙ্গ সমতা ও নারী অধিকার" color="#7c3aed">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
              নারী ও পুরুষ লিঙ্গ ভেদে সবাইকে সমান দৃষ্টিতে মূল্যায়ন করা হয় এবং নারীদের অধিকারের ব্যাপারে অগ্রাধিকার দেওয়া হয়।
            </p>
          </Section>
          )}

          {/* 26 - Metal Control */}
          {show(26) && (
          <Section id="s26" icon={<FaTools aria-hidden="true" />} title="২৬। মেটাল কন্ট্রোল পলিসি" color="#64748b">
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#475569', marginBottom: '8px' }}>গ্রহণ পদ্ধতি:</div>
            <BulletList items={[
              'ধারালো বস্তু যেমন কাটার, সিজার, ভোমর ইত্যাদি স্টোর সেকশন থেকে প্রত্যেক লাইন সুপারভাইজার নির্দিষ্ট রিকুইজিশন এর মাধ্যমে গ্রহন করবে',
              'নিডেল ওম্যান স্টোর সেকশন থেকে নির্দিষ্ট রিকুইজিশন এর মাধ্যমে নিডেল গ্রহন করবে',
            ]} />
          </Section>
          )}

          {/* 27 - HIV/AIDS */}
          {show(27) && (
          <Section id="s27" icon={<FaHeartbeat aria-hidden="true" />} title="২৭। HIV/AIDS" color="#be185d">
            <BulletList items={[
              'এইডস কী? — এটি একটি মারাত্মক রোগ যা HIV ভাইরাস দ্বারা সৃষ্ট',
              'কেন হয়? — অনিরাপদ যৌন সম্পর্ক, আক্রান্ত রক্ত গ্রহণ, একই সুচ ব্যবহার',
              'এইডস রোগের লক্ষণ — দীর্ঘমেয়াদী জ্বর, ওজন হ্রাস, ডায়রিয়া, ফুসফুসের সংক্রমণ',
              'কীভাবে এইডস রোগ ছড়ায়? — যৌন সম্পর্ক, রক্ত সঞ্চালন, আক্রান্ত মায়ের কাছ থেকে সন্তানে',
              'এইডস রোগ থেকে মুক্তির উপায় — সচেতনতা, নিরাপদ যৌন সম্পর্ক, পরীক্ষা করানো',
              'এইডস রোগীদের সাথে স্বাভাবিক আচরণ করতে হবে — এটি ছোঁয়াচে রোগ নয়',
            ]} />
          </Section>
          )}

          {/* 28 - Ergonomics */}
          {show(28) && (
          <Section id="s28" icon={<FaShieldAlt aria-hidden="true" />} title="২৮। মূল Ergonomic নীতি" color="#0891b2">
            <div className="tag-wrap">
              {[
                '১। নিরপেক্ষ ভঙ্গী',
                '২। সঠিক ফিট',
                '৩। ঘন ঘন বিরতি',
                '৪। পুনরাবৃত্তিমূলক গতি এড়িয়ে চলুন',
                '৫। সঠিক উত্তোলন কৌশল',
                '৬। স্থায়ী কাজ',
              ].map((item, i) => (
                <span key={i} className="tag" style={{ background: '#ecfeff', color: '#0e7490', borderColor: '#a5f3fc' }}>{item}</span>
              ))}
            </div>
          </Section>
          )}

          {/* 29 - Machine Safety */}
          {show(29) && (
          <Section id="s29" icon={<FaTools aria-hidden="true" />} title="২৯। মেশিন সেফটি" color="#b45309">
            <div className="tag-wrap">
              {[
                '১। মেশিন গার্ডিং',
                '২। প্রশিক্ষিত অপারেটর',
                '৩। নিয়মিত রক্ষণাবেক্ষণ',
                '৪। ইলেকট্রিক্যাল সেফটি',
                '৫। ব্যক্তিগত সুরক্ষা সামগ্রী',
                '৬। হাউসকিপিং ও পরিবেশ',
                '৭। দুর্ঘটনা রিপোর্টিং',
                '৮। আইন ও কমপ্লায়েন্স নীতির উদ্দেশ্য',
              ].map((item, i) => (
                <span key={i} className="tag" style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>{item}</span>
              ))}
            </div>
          </Section>
          )}

          {/* 30 - Feedback */}
          {show(30) && (
          <Section id="s30" icon={<FaHandshake aria-hidden="true" />} title="৩০। ফিটব্যাক" color="#16a34a">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
              প্রশিক্ষণ শেষে উপস্থিত শ্রমিক/কর্মচারীরা উপরোক্ত প্রশিক্ষণের বিষয়বস্তু সঠিকভাবে বুঝেছে কিনা জিজ্ঞাসা করা হলে সকলে বুঝেছে এই মর্মে স্বীকার করার পর সকলের স্বাক্ষর গ্রহণ করা হয়।
            </p>
          </Section>
          )}

          {/* 31 - Factory Visit */}
          {show(31) && (
          <Section id="s31" icon={<FaBuilding aria-hidden="true" />} title="৩১। কারখানা ভিজিট" color="#1e40af">
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
              প্রশিক্ষণ শেষে নতুন শ্রমিকদের পুরো কারখানা ঘুরিয়ে দেখানো হয় — প্রতিটি বিভাগ, ফ্লোর, সুবিধাদি এবং নিরাপত্তা ব্যবস্থা সম্পর্কে পরিচিত করানো হয়।
            </p>
          </Section>
          )}

          {/* 32 - Environment */}
          {show(32) && (
          <Section id="s32" icon={<FaLeaf aria-hidden="true" />} title="৩২। এনভায়রনমেন্ট" color="#15803d">
            <InfoBox color="#16a34a" title={`এনার্জি ও GHG লক্ষ্যমাত্রা (${cfg.environmentTargets.targetYear} সালের মধ্যে)`} items={[
              `শক্তি ব্যবহার ${cfg.environmentTargets.ghgReductionPct}% হ্রাস করা`,
              `GHG গ্যাস নিঃসরণ ${cfg.environmentTargets.ghgReductionPct}% হ্রাস করা`,
              'গ্যাস ও ডিজেল জেনারেটর এবং আর ই বি থেকে বিদ্যুৎ পাই',
              'শক্তি উৎপাদনের জন্য জ্বালানীর ব্যবহারের ফলে কালো ধোঁয়া সৃষ্টি হয় যার দ্বারা পরিবেশ দূষণ হয়',
            ]} />
            <InfoBox color="#0891b2" title={`পানি লক্ষ্যমাত্রা (${cfg.environmentTargets.targetYear} সালের মধ্যে)`} items={[
              `পানির ব্যবহার ${cfg.environmentTargets.waterReductionPct}% হ্রাস করা`,
              'পানি একটি স্বচ্ছ, স্বাদহীন, গন্ধহীন তরল পদার্থ',
            ]} />
            <InfoBox color="#7c3aed" title={`বর্জ্য ব্যবস্থাপনা লক্ষ্যমাত্রা (${cfg.environmentTargets.targetYear} সালের মধ্যে)`} items={[
              `বিপজ্জনক ও অ-বিপজ্জনক বর্জ্য ${cfg.environmentTargets.wasteReductionPct}% হ্রাস করা`,
              'বিপজ্জনক বর্জ্য: ইলেকট্রিক বর্জ্য, প্রিন্টার কার্টিজ এবং খালি কেমিক্যাল ড্রাম',
              'অ-বিপজ্জনক বর্জ্য: টেক্সটাইল বর্জ্য, কার্টুন, খালি সুতার কোণ, পলি ব্যাগ, ফুড ওয়েস্ট এবং কাগজ',
              'সব ধরনের বর্জ্য আলাদা আলাদা (Separately) বা নির্দিষ্ট স্থানে সংরক্ষণ করতে হবে',
            ]} />
          </Section>
          )}

        </div>{/* .wg-content */}

        {/* Footer */}
        <div className="wg-footer">
          <div className="wg-footer-hotline">
            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
              ওয়েলফেয়ার অফিসার
            </div>
            {profile.welfareOfficers.map((w, i) => (
              <div key={i} style={{ color: '#cbd5e1', fontSize: '13px' }}>
                {w.name} — {w.designation}
              </div>
            ))}
            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '14px', margin: '10px 0 4px' }}>
              হট লাইন নম্বর
            </div>
            {profile.hotlines.map((h, i) => (
              <a key={i} href={`tel:${h.number}`} className="wg-hotline-chip">
                <FaPhone style={{ color: '#60a5fa' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{h.label}</div>
                  <div className="wg-hotline-num">{h.number}</div>
                </div>
              </a>
            ))}
          </div>
          <div>
            <strong style={{ color: '#e2e8f0' }}>{factory.nameBn}</strong><br />
            {factory.addressBn}
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px' }}>
            মোহাম্মাদী গ্রুপ — কর্মচারী নির্দেশিকা | শ্রমিক সহায়িকা
          </div>
        </div>

      </div>{/* .wg-container */}
    </>
  );
}