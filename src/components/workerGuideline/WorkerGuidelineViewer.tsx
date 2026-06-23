// ─────────────────────────────────────────────────────────────────────────────
// WORKER GUIDELINE VIEWER
// বিষয়সূচি shows as mini-cards. Clicking a card opens only that section.
// All other sections stay hidden until selected.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useMemo} from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { getActiveTopics } from './workerGuidelineData';
import type { WorkerGuidelineConfig, FactoryConfig, HotLine } from '../../factories/FactoryTypes';
import { getFactoryById } from '../../factories/FactoryRegistry';
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';
import AppButton from '../common/AppButton';
import CalculatorHub    from './CalculatorHub';
import FormulaReference from './FormulaReference';
import {
  FaBuilding, FaPhone, FaUser, FaMoneyBillWave, FaClock,
  FaShieldAlt, FaHandshake, FaLeaf, FaBan, FaTrophy,
  FaExclamationTriangle, FaHeartbeat, FaGavel, FaBaby,
  FaPrint, FaFilePdf, FaIndustry, FaRegCalendarAlt,
  FaTools, FaUserShield, FaBalanceScale, FaRecycle,
  FaChevronLeft, FaTimes, FaCalculator, FaBook,
} from 'react-icons/fa';

// ── Reusable sub-components ───────────────────────────────────────────────────

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
    padding:'7px 0', borderBottom:'1px solid #f1f5f9', gap:'8px' }}>
    <span style={{ color:'#64748b', fontSize:'13px', flexShrink:0, maxWidth:'55%' }}>{label}</span>
    <span style={{ color:'#1e293b', fontSize:'13px', fontWeight:600, textAlign:'right' }}>{value}</span>
  </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul style={{ margin:0, padding:0, listStyle:'none' }}>
    {items.map((item, i) => (
      <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'8px',
        padding:'5px 0', borderBottom: i < items.length-1 ? '1px solid #f1f5f9' : 'none',
        fontSize:'13px', color:'#334155' }}>
        <span style={{ color:'#3b82f6', marginTop:'4px', flexShrink:0 }}>●</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const InfoBox: React.FC<{ color: string; title: string; items: string[] }> = ({ color, title, items }) => (
  <div style={{ background: color+'15', border:`1px solid ${color}30`, borderRadius:'8px',
    padding:'10px 12px', marginBottom:'10px' }}>
    <div style={{ fontWeight:700, color, fontSize:'12px', marginBottom:'6px' }}>{title}</div>
    <BulletList items={items} />
  </div>
);

const TagWrap: React.FC<{ items: string[]; style?: React.CSSProperties }> = ({ items, style }) => (
  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'4px' }}>
    {items.map((t,i) => (
      <span key={i} style={{ display:'inline-block', padding:'3px 10px',
        background:'#eff6ff', color:'#1d4ed8', borderRadius:'20px',
        fontSize:'11px', fontWeight:600, border:'1px solid #bfdbfe', ...style }}>{t}</span>
    ))}
  </div>
);

// ── Section definition list ────────────────────────────────────────────────────

interface SectionDef {
  id: number;
  titleBn: string;
  color: string;
  icon: React.ReactNode;
}

const SECTIONS: SectionDef[] = [
  { id:1,  titleBn:'কারখানা পরিচিতি',         color:'#1e40af', icon:<FaBuilding aria-hidden="true" /> },
  { id:2,  titleBn:'কোম্পানির লক্ষ্য',         color:'#0891b2', icon:<FaTrophy aria-hidden="true" /> },
  { id:3,  titleBn:'উৎপাদন প্রক্রিয়া',         color:'#059669', icon:<FaIndustry aria-hidden="true" /> },
  { id:4,  titleBn:'নিয়োগ পত্র',              color:'#7c3aed', icon:<FaGavel aria-hidden="true" /> },
  { id:5,  titleBn:'হ্যান্ড বুক',              color:'#0891b2', icon:<FaUser aria-hidden="true" /> },
  { id:6,  titleBn:'আর্থিক সুবিধা',            color:'#16a34a', icon:<FaMoneyBillWave aria-hidden="true" /> },
  { id:7,  titleBn:'দক্ষতা বৃদ্ধি',            color:'#d97706', icon:<FaTrophy aria-hidden="true" /> },
  { id:8,  titleBn:'কর্মক্ষেত্রে ঝুঁকি',       color:'#dc2626', icon:<FaExclamationTriangle aria-hidden="true" /> },
  { id:9,  titleBn:'স্বাস্থ্য ও নিরাপত্তা',   color:'#0891b2', icon:<FaShieldAlt aria-hidden="true" /> },
  { id:10, titleBn:'ক্ষতিপূরণ নীতি',          color:'#7c3aed', icon:<FaBalanceScale aria-hidden="true" /> },
  { id:11, titleBn:'ঘুষ ও দুর্নীতি',          color:'#dc2626', icon:<FaBan aria-hidden="true" /> },
  { id:12, titleBn:'সংরক্ষিত এলাকা',          color:'#ea580c', icon:<FaBan aria-hidden="true" /> },
  { id:13, titleBn:'পুরস্কার',                 color:'#ca8a04', icon:<FaTrophy aria-hidden="true" /> },
  { id:14, titleBn:'দুর্যোগ মোকাবেলা',         color:'#dc2626', icon:<FaExclamationTriangle aria-hidden="true" /> },
  { id:15, titleBn:'হয়রানি/যৌন নির্যাতন',     color:'#9333ea', icon:<FaUserShield aria-hidden="true" /> },
  { id:16, titleBn:'বৈষম্য ও জবরদস্তি',       color:'#0f766e', icon:<FaBalanceScale aria-hidden="true" /> },
  { id:17, titleBn:'অভিযোগ পদ্ধতি',           color:'#1e40af', icon:<FaPhone aria-hidden="true" /> },
  { id:18, titleBn:'HR বিজনেস প্রিন্সিপাল',   color:'#475569', icon:<FaUser aria-hidden="true" /> },
  { id:19, titleBn:'শিশু ও কিশোর শ্রমিক',    color:'#0891b2', icon:<FaBaby aria-hidden="true" /> },
  { id:20, titleBn:'শৃঙ্খলা',                 color:'#1e40af', icon:<FaGavel aria-hidden="true" /> },
  { id:21, titleBn:'অসদাচরণ',                 color:'#dc2626', icon:<FaBan aria-hidden="true" /> },
  { id:22, titleBn:'দেশি ও বিদেশি শ্রমিক',   color:'#0f766e', icon:<FaUser aria-hidden="true" /> },
  { id:23, titleBn:'সাব-কন্ট্রাক্ট',          color:'#475569', icon:<FaHandshake aria-hidden="true" /> },
  { id:24, titleBn:'সংগঠনের স্বাধীনতা',       color:'#1e40af', icon:<FaHandshake aria-hidden="true" /> },
  { id:25, titleBn:'লিঙ্গ সমতা',             color:'#7c3aed', icon:<FaBalanceScale aria-hidden="true" /> },
  { id:26, titleBn:'মেটাল কন্ট্রোল',          color:'#64748b', icon:<FaTools aria-hidden="true" /> },
  { id:27, titleBn:'HIV/AIDS',               color:'#be185d', icon:<FaHeartbeat aria-hidden="true" /> },
  { id:28, titleBn:'Ergonomic',              color:'#0891b2', icon:<FaShieldAlt aria-hidden="true" /> },
  { id:29, titleBn:'মেশিন সেফটি',             color:'#b45309', icon:<FaTools aria-hidden="true" /> },
  { id:30, titleBn:'ফিটব্যাক',               color:'#16a34a', icon:<FaHandshake aria-hidden="true" /> },
  { id:31, titleBn:'কারখানা ভিজিট',           color:'#1e40af', icon:<FaBuilding aria-hidden="true" /> },
  { id:32, titleBn:'এনভায়রনমেন্ট',           color:'#15803d', icon:<FaLeaf aria-hidden="true" /> },
  { id:33, titleBn:'শ্রমিক ক্যালকুলেটর',        color:'#1e40af', icon:<FaCalculator aria-hidden="true" /> },
  { id:34, titleBn:'হিসাবের সূত্র',              color:'#059669', icon:<FaBook aria-hidden="true" /> },
];

// ── Mini card component ───────────────────────────────────────────────────────

const MiniCard: React.FC<{
  section: SectionDef;
  active: boolean;
  onClick: () => void;
}> = ({ section, active, onClick }) => {
  const isApp = section.id === 33 || section.id === 34;
  return (
    <button
      onClick={onClick}
      aria-label={section.titleBn}
      style={{
        background: isApp
          ? `linear-gradient(135deg, ${section.color}18, ${section.color}30)`
          : active ? section.color : '#fff',
        border: `2px solid ${isApp ? section.color : active ? section.color : '#e2e8f0'}`,
        borderRadius: '10px',
        padding: '10px 8px',
        cursor: 'pointer',
        textAlign: 'center' as const,
        transition: 'all 0.18s ease',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '6px',
        boxShadow: isApp
          ? `0 2px 10px ${section.color}30`
          : active ? `0 4px 14px ${section.color}40` : '0 1px 3px rgba(0,0,0,0.06)',
        transform: active ? 'scale(1.03)' : 'scale(1)',
        minWidth: 0,
        position: 'relative' as const,
      }}
    >
      {/* App badge for cards 33/34 */}
      {isApp && (
        <div style={{
          position: 'absolute', top: '-6px', right: '-4px',
          background: section.color, color: '#fff',
          fontSize: '8px', fontWeight: 800, padding: '2px 5px',
          borderRadius: '6px', letterSpacing: '0.3px',
        }}>
          APP
        </div>
      )}
      {/* Number badge */}
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: active ? 'rgba(255,255,255,0.25)' : section.color + '18',
        border: `1.5px solid ${active ? 'rgba(255,255,255,0.5)' : section.color + '40'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '9px', fontWeight: 700,
        color: active ? '#fff' : section.color,
        flexShrink: 0,
      }}>
        {section.id}
      </div>
      {/* Icon */}
      <div style={{ fontSize: '15px', color: isApp ? section.color : active ? '#fff' : section.color }}>
        {section.icon}
      </div>
      {/* Title */}
      <div style={{
        fontSize: '10px', fontWeight: 600, lineHeight: 1.3,
        color: isApp ? section.color : active ? '#fff' : '#334155',
        wordBreak: 'keep-all' as const,
      }}>
        {section.titleBn}
      </div>
    </button>
  );
};

// ── Section content renderer ──────────────────────────────────────────────────

function SectionContent({ id, cfg, factory }: { id: number; cfg: WorkerGuidelineConfig; factory: FactoryConfig }) {
  const profile = factory.workerProfile;
  const c = cfg;

  switch (id) {
    case 1: return (
      <>
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
        <div style={{ marginTop:'10px' }}>
          <div style={{ fontSize:'12px', color:'#64748b', marginBottom:'6px', fontWeight:600 }}>বায়ার সমূহ:</div>
          <TagWrap items={profile.buyers} />
        </div>
        <div style={{ marginTop:'10px' }}>
          <div style={{ fontSize:'12px', color:'#64748b', marginBottom:'6px', fontWeight:600 }}>সেকশন সমূহ:</div>
          <TagWrap items={profile.sections} style={{ background:'#f0fdf4', color:'#166534', borderColor:'#bbf7d0' }} />
        </div>
      </>
    );
    case 2: return (
      <>
        <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7, marginBottom:'10px' }}>
          পাঁচ বছরের মধ্যে গুণগতমান, আন্তর্জাতিক মানের সেবা প্রদান, শ্রমিক কর্মচারীদের সন্তুষ্ট এবং সর্বসাফল্যক্রমে গ্রাহকের সন্তুষ্ট অর্জনের মাধ্যমে বাংলাদেশের প্রেক্ষাপটে সুউচ্চ পোশাক নির্মাণকারী প্রতিষ্ঠান হিসাবে স্বীকৃতি অর্জন করা।
        </p>
        <BulletList items={['আন্তর্জাতিক মানের পণ্য তৈরি পূর্বক গ্রাহকের চাহিদা পূরণ ও গুণগতমানের নিশ্চয়তা','শ্রমিক কর্মচারীদের মধ্যে প্রতিষ্ঠানের মালিকানা অনুভূতি জাগ্রত করা','সর্বোচ্চ মানের দক্ষতা এবং সততা নিশ্চিত করা','গ্রাহকের সন্তুষ্টি এবং বিশ্বস্ততা অর্জন করা','একটি নিরাপদ কর্মপরিবেশ নিশ্চিত করা','কারখানার সকলের জন্য ন্যায্য মজুরি নিশ্চিত করা','পণ্যের গুণগতমানের নিশ্চয়তা প্রদান','পরিবেশ এবং সম্প্রদায়ের জন্য কাজ করার মনোবল','দীর্ঘস্থায়ী উন্নতি সাধন করা','সকলের জন্য সমান অধিকার নিশ্চিত করা']} />
      </>
    );
    case 3: return (
      <>
        <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7, marginBottom:'10px' }}>
          এটি একটি ওভেন কারখানা। এখানে সকল প্রকার ওভেন টপস (শার্ট) তৈরি করা হয়।
        </p>
        <TagWrap items={profile.productTypes} style={{ background:'#f0fdf4', color:'#166534', borderColor:'#bbf7d0' }} />
        <div style={{ marginTop:'10px' }}>
          <BulletList items={['উৎপাদন প্রক্রিয়ায় জড়িত সকলের সাথে ধারাবাহিকতা রক্ষা করতে হবে','পোশাকের মান নিশ্চিত করতে হবে','উৎপাদন বাড়াতে হবে এবং নির্দেশনা মেনে কাজ করতে হবে','অভিজ্ঞতার বৃদ্ধির সাথে সাথে দক্ষতা বাড়াতে হবে','ওয়েস্টেজ, অলটার, রিজেক্ট মালের সংখ্যা কমাতে হবে']} />
        </div>
      </>
    );
    case 4: return (
      <>
        <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7, marginBottom:'10px' }}>
          নিয়োগ পত্রে কর্মে যোগদানের তারিখ, নাম, পিতা/স্বামীর নাম, পদবী, গ্রেড, কার্ড নং এবং কোন বিভাগ/সেকশনে যোগদান করেছেন তা উল্লেখ আছে।
        </p>
        <div style={{ fontWeight:700, fontSize:'13px', color:'#4c1d95', marginBottom:'8px' }}>শিক্ষানবিসকাল</div>
        <p style={{ fontSize:'13px', color:'#334155', marginBottom:'10px' }}>নিয়োগের তারিখ হইতে <strong>{c.probationMonths} মাস</strong> শিক্ষানবিসকাল অতিক্রম হইলে স্থায়ী শ্রমিক হিসেবে গণ্য হবে।</p>
        <div style={{ fontWeight:700, fontSize:'13px', color:'#4c1d95', marginBottom:'8px' }}>বেতন ও মজুরির বিন্যাস</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            {[['ক) মূল বেতন', c.salary.basicSalary],['খ) বাড়ি ভাড়া (মূল মজুরির ৫০%)', c.salary.houseRent],['গ) চিকিৎসা ভাতা', c.salary.medicalAllowance],['ঘ) যাতায়াত', c.salary.transport],['ঙ) খাদ্য ভাতা', c.salary.foodAllowance]].map(([label, val]) => (
              <tr key={String(label)}><td style={{ padding:'7px 8px', fontSize:'13px', borderBottom:'1px solid #f1f5f9' }}>{label}</td><td style={{ padding:'7px 8px', fontSize:'13px', textAlign:'right', fontWeight:600, borderBottom:'1px solid #f1f5f9' }}>৳ {Number(val).toLocaleString()}/–</td></tr>
            ))}
            <tr style={{ borderTop:'2px solid #e2e8f0' }}><td style={{ padding:'10px 8px', fontSize:'13px', fontWeight:700 }}>চ) সর্বমোট</td><td style={{ padding:'10px 8px', fontSize:'13px', fontWeight:700, textAlign:'right' }}>৳ {c.salary.total.toLocaleString()}/–</td></tr>
          </tbody>
        </table>
        <div style={{ fontWeight:700, fontSize:'13px', color:'#4c1d95', margin:'12px 0 8px' }}>কার্য ঘণ্টা ও ওভারটাইম</div>
        <Row label="সাধারণ কার্য সময়" value={`দৈনিক ${c.workingHoursPerDay} ঘণ্টা`} />
        <Row label="সর্বোচ্চ ওভারটাইম" value={`${c.maxOvertimeHours} ঘণ্টা`} />
        <Row label="ওভারটাইম হিসাব" value={c.overtimeFormula} />
        <Row label="দুপুরে খাবার বিরতি" value={`দুপুর ${c.lunchBreakStart} টা – ${c.lunchBreakEnd} টা (১ ঘণ্টা)`} />
        <Row label="বেতন পরিশোধ" value={`মাস শেষের পরবর্তী ${c.salaryPaymentDays} কার্যদিবসের মধ্যে`} />
        <div style={{ fontWeight:700, fontSize:'13px', color:'#4c1d95', margin:'12px 0 8px' }}>চাকুরির অবসান (নোটিশ পিরিয়ড)</div>
        <Row label="মালিক কর্তৃক (স্থায়ী শ্রমিক)" value={`${c.noticePeriodDays.permanent} দিনের নোটিশ`} />
        <Row label="মালিক কর্তৃক (অস্থায়ী শ্রমিক)" value={`${c.noticePeriodDays.temporary} দিনের নোটিশ`} />
        <Row label="মালিক কর্তৃক (অন্যান্য)" value={`${c.noticePeriodDays.other} দিনের নোটিশ`} />
        <Row label="শ্রমিক কর্তৃক (স্থায়ী)" value={`${c.noticePeriodDays.permanent} দিন আগে নোটিশ`} />
      </>
    );
    case 5: return <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7 }}>কারখানায় নিয়োগ পত্র পাওয়ার সাথে একটি করে শ্রমিক সহায়িকা বই দেওয়া হয়। শ্রমিক সহায়িকা বইয়ে উল্লেখ থাকে আইনের সারাংশ, বাংলাদেশ গেজেটে উল্লেখকৃত বিভিন্ন গ্রেড, কারখানায় সমস্ত নিয়মকানুন, সুযোগ সুবিধা ইত্যাদি।</p>;
    case 6: return (
      <>
        <InfoBox color="#16a34a" title="আর্থিক সুবিধা সমূহ" items={['দুইটি ঈদ বোনাস','হাজিরা বোনাস','বার্ষিক ছুটির টাকা প্রদান','সার্ভিস বেনিফিটের টাকা']} />
        <InfoBox color="#0891b2" title="অনার্থিক সুবিধা সমূহ" items={['মেডিকেল সুবিধা','ফ্রি শিক্ষা ব্যবস্থা','ফ্রি প্রশিক্ষণ ব্যবস্থা','ডে-কেয়ার সুবিধা','বাৎসরিক এওয়ার্ড প্রদান','বাৎসরিক অনুষ্ঠান']} />
      </>
    );
    case 7: return (
      <>
        <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7, marginBottom:'10px' }}>প্রত্যেকটি শ্রমিকের কাজ শেখার সুযোগ দেওয়া হয় এবং কাজের জটিলতা ও গভিরতা বৃদ্ধির সাথে সাথে তাদের পদোন্নতি ও বেতন বৃদ্ধি করা হয়।</p>
        <div style={{ fontWeight:700, fontSize:'12px', color:'#92400e', marginBottom:'6px' }}>পদোন্নতির ক্ষেত্রে ৭টি বিষয় বিবেচনা করা হয়:</div>
        <TagWrap items={['দক্ষতা','বিভিন্ন প্রসেস','কাজের কোয়ালিটি','শিক্ষাগত যোগ্যতা','অভিজ্ঞতা','উপস্থিতি','শৃঙ্খলা']} style={{ background:'#fffbeb', color:'#92400e', borderColor:'#fde68a' }} />
      </>
    );
    case 8: return <BulletList items={['কোম্পানি/কর্তৃপক্ষের সম্পদ রক্ষার ব্যাপারে সবাইকে সচেতন হতে হবে','টিফিন বক্স এবং জুতার ব্যাগ ছাড়া অন্য কোনো ব্যাগ নিয়ে কারখানার ভিতরে প্রবেশ করা যাবে না','বিড়ি, সিগারেট, দিয়াশলাই এবং কোনো দাহ্য পদার্থ ফ্যাক্টরিতে বহন করা যাবে না','ক্যামিকেল জাতীয় দ্রব্যাদি ক্যামিকেল রুম ব্যাতিত অন্য কোনো জায়গায় ব্যবহার করা যাবে না','কারখানার যাবতীয় সম্পদ যাতে আপনার দ্বারা বা অন্যের দ্বারা ক্ষতি সাধিত না হয় সেদিকে খেয়াল রাখতে হবে']} />;
    case 9: return <BulletList items={['সকল ওয়ার্কার কাটার, সিজার, ভোমর রশি দিয়ে বেধে নাম কার্ড নং লিখতে হবে','মেশিনে নিডেল গার্ড, আইগার্ড, পুলিকভার নিশ্চিত করুন','ব্যান্ড নাইফ মেশিন চালাতে হ্যান্ড গ্লোভস ব্যবহার ও সকলকে মাস্ক ব্যবহার করতে হবে','থ্রেড সার্কিং অপারেটর কাজ করার সময় মাস্ক ও এয়ার প্লাগ ব্যবহার করবে','স্পট রিমুভিং ম্যানকে হ্যান্ড গ্লোভস, মাস্ক অবশ্যই ব্যবহার করে কাজ করবেন','পরিষ্কার-পরিচ্ছন্নতা, জঞ্জাল ও নির্গত ময়লা অপসারণ নিয়মিত করতে হবে','পর্যাপ্ত ফায়ার এক্সটিংগুইসার এবং ফায়ার ফাইটার, ফার্স্ট এইডার রয়েছে']} />;
    case 10: return <BulletList items={['কর্মক্ষেত্রে দুর্ঘটনায় আহত শ্রমিকের চিকিৎসা মালিকের তত্ত্বাবধানে করিতে হইবে','কর্মক্ষেত্রে দুর্ঘটনাজনিত কারণে বা পেশাগত রোগে আক্রান্ত হয়ে মৃত্যুবরণ করলে অনুদান প্রদান','কোনো সুবিধাভোগী চাকুরীর অবস্থায় অসুস্থ হয়ে মৃত্যুবরণ করলে অনুদান প্রদান','সুবিধাভোগীদের পরিবারের মেধাবী সদস্যকে শিক্ষার জন্য বৃত্তি প্রদান','সামাজিক নিরাপত্তামূলক সুবিধা হিসেবে বিশেষায়িত হাসপাতালে চিকিৎসা']} />;
    case 11: return (
      <>
        <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7, marginBottom:'10px' }}>ঘুষ ও দুর্নীতিকে আমরা মারাত্মক অপরাধ হিসেবে চিহ্নিত করেছি এবং আমাদের কারখানায় সর্বত্র ঘুষ আদান প্রদান ও দুর্নীতি সম্পন্ন নিষিদ্ধ।</p>
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#991b1b', fontWeight:600 }}>⚠️ যদি কোনো কর্মচারীর বিরুদ্ধে ঘুষ ও দুর্নীতির সম্পৃক্ততা পাওয়া যায় তাৎক্ষণিক তার বিরুদ্ধে শাস্তিমূলক ব্যবস্থা গ্রহণ করা হবে।</div>
      </>
    );
    case 12: return (
      <>
        <p style={{ fontSize:'13px', color:'#334155', marginBottom:'10px', lineHeight:1.7 }}>নিম্নোক্ত সংরক্ষিত এলাকায় প্রবেশ নিষেধ। প্রবেশ করতে হলে কর্তৃপক্ষের আবেদনের সাপেক্ষে প্রবেশ করতে হবে।</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {['ওয়্যার হাউজ','ফিনিশড গোডাউন','বন্ডেড ওয়্যার হাউজ','ক্যামিক্যাল রুম','ব্যান্ড নাইফ রুম','ফায়ার পাম্প রুম','জেনারেটর রুম','বয়লার রুম'].map((a,i) => (
            <span key={i} style={{ display:'inline-block', margin:'3px', padding:'4px 10px', borderRadius:'6px', background:'#fef2f2', border:'1px solid #fca5a5', color:'#991b1b', fontSize:'11px', fontWeight:600 }}>{a}</span>
          ))}
        </div>
      </>
    );
    case 13: return (
      <>
        <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7 }}>যদি কোনো শ্রমিক/কর্মচারী/কর্মকর্তা কারখানার ভিতরে কোনো বেআইনী পণ্য যেমন: বিস্ফোরক, সিগারেট, বোমা, দিয়াশলাই জাতীয় কোনো কিছু নিয়ে প্রবেশ করে তথ্য দিতে পারলে তথ্যদাতাকে পুরস্কৃত করা হবে।</p>
        <div style={{ background:'#fefce8', border:'1px solid #fde047', borderRadius:'8px', padding:'8px 12px', marginTop:'8px', fontSize:'13px', color:'#854d0e' }}>🔒 তথ্যদাতার নাম অবশ্যই গোপন রাখা হবে।</div>
      </>
    );
    case 14: return <BulletList items={['বহির্গমন নক্সা দেখে জানুন — দ্রুততম রাস্তা চিহ্নিত করুন','যারা ফায়ার টিমের সদস্য তারা তাদের স্ব স্ব দায়িত্ব পালন করবেন','জরুরি বহির্গমনের প্রশিক্ষণের উদ্দেশ্যে আমাদের কারখানায় প্রতি মাসে অগ্নি মহড়া হয়','অগ্নি মহড়ায় প্রত্যেকেই দ্রুত কারখানার বাহিরে সমাবেশ স্থানে চলে যাবেন']} />;
    case 15: return (
      <>
        <InfoBox color="#dc2626" title="শারীরিক হয়রানি নিষিদ্ধ" items={['শারীরিকভাবে আঘাত বা ক্ষতি সাধন করা','শারীরিক বা মানসিকভাবে ক্ষতি সাধনের হুমকি দেওয়া','ভয়দেখার উদ্দেশ্যে হেয় করার জন্য মন্তব্য করা','টয়লেট ব্যবহার করতে বা পানি পান করতে বাধা সৃষ্টি করা']} />
        <InfoBox color="#7c3aed" title="যৌন হয়রানি নিষিদ্ধ" items={['সুপারভাইজার কর্তৃক যেকোনো উপায়ে শ্রমিকদের শরীর স্পর্শ করা','শ্রমিকদের যৌন মন্তব্য করা','চাকুরিতে বিশেষ সুবিধা দেওয়ার জন্য যৌন আচরণে অংশ নিতে বাধ্য করা']} />
      </>
    );
    case 16: return <BulletList items={['মোহাম্মাদী গ্রুপ জবরদস্তিমূলক শ্রম বিরোধী নীতিমালা বাস্তবায়ন করার জন্য বদ্ধ পরিকর','বলপূর্বক শ্রম/রুদ্ধ শ্রম ও চুক্তিবদ্ধ শ্রম মোহাম্মাদী গ্রুপ কোনো ভাবে গ্রহণ করে না','কর্তৃপক্ষ কোনো ব্যক্তি স্বাধীনতায় কোনো রূপ হস্তক্ষেপ করে না']} />;
    case 17: return (
      <>
        <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7, marginBottom:'10px' }}>যদি কোনো শ্রমিক হয়রানি/গর্হিত আচরণ ও শারীরিক নির্যাতনের স্বীকার হয় তাহলে অভিযোগের ধরন বুঝে আপনার পার্শ্ববর্তী সুপারভাইজার, ওয়েলফেয়ার অফিসার, এডমিন ম্যানেজার এদেরকে জানাতে পারেন।</p>
        <div style={{ marginTop:'12px' }}>
          {profile.hotlines.map((h: HotLine, i: number) => (
            <a key={i} href={`tel:${h.number}`} style={{ display:'flex', alignItems:'center', gap:'10px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'8px', padding:'10px 12px', marginBottom:'8px', textDecoration:'none' }}>
              <FaPhone style={{ color:'#1d4ed8', fontSize:'16px' }} />
              <div>
                <div style={{ fontSize:'11px', color:'#64748b' }}>{h.label}</div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#1d4ed8' }}>{h.number}</div>
              </div>
            </a>
          ))}
        </div>
      </>
    );
    case 18: return <BulletList items={['মানবসম্পদ ব্যবস্থাপনা এবং দক্ষতা নিশ্চিত করার লক্ষ্যে পলিসি অনুসারে দায়িত্ব নিশ্চিত করা হয়','কারখানায় কমপ্লায়েন্স নিশ্চিত করা','নিয়মিত এবং নির্দিষ্ট সময় পর পর বিভিন্ন কমিটি মিটিং এর ব্যবস্থা করা']} />;
    case 19: return <BulletList items={['বাংলাদেশ শ্রম আইন ২০০৬ (সংশোধিত-২০১৩, ২০১৮ ও ২০২৫ অধ্যাদেশ) অনুযায়ী যাবতীয় সুবিধা নিশ্চিত করে কাজ করানো হয়','শিশু শ্রম সম্পূর্ণ নিষিদ্ধ']} />;
    case 20: return <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7 }}>শৃঙ্খলা মানব সম্পদ বিভাগের একটি গুরুত্বপূর্ণ বিষয়। শাস্তিমূলক নীতি ও পদ্ধতির উদ্দেশ্য হচ্ছে নির্ধারণ ও কারখানার মধ্যে আচরণের মান বজায় রাখা।</p>;
    case 21: return (
      <>
        <div style={{ fontWeight:700, fontSize:'12px', color:'#991b1b', marginBottom:'8px' }}>অসদাচরণ সমূহ:</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'12px' }}>
          {['ইচ্ছাকৃতভাবে অবাধ্যতা','চুরি, প্রতারণা বা অসাধুতা','চাকুরির সংক্রান্ত ঘুষ গ্রহণ ও প্রদান','বিনা ছুটিতে অভ্যাসগত অনুপস্থিতি','অভ্যাসগত বিলম্বে অনুপস্থিতি','প্রতিষ্ঠানের কোনো আইনের অভ্যাসগত লংঘন','উচ্ছৃঙ্খল বা দাঙ্গা-হাঙ্গামামূলক আচরণ','কাজে-কর্মে অভ্যাসগত গাফিলতি'].map((item,i) => (
            <div key={i} style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'6px', padding:'6px 10px', fontSize:'12px', color:'#9a3412' }}>{item}</div>
          ))}
        </div>
        <div style={{ fontWeight:700, fontSize:'12px', color:'#991b1b', marginBottom:'8px' }}>শাস্তিমূলক ব্যবস্থা:</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
          {['চাকুরী থেকে অপসারণ','নীচের পদে/গ্রেডে আনয়ন (১ বছর পর্যন্ত)','পদোন্নতি বন্ধ (১ বছর পর্যন্ত)','মজুরি বৃদ্ধি বন্ধ (১ বছর পর্যন্ত)','জরিমানা','সাময়িক বরখাস্ত (৭ দিন পর্যন্ত)','ভর্ৎসনা ও সতর্কীকরণ'].map((item,i) => (
            <div key={i} style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'6px', padding:'6px 10px', fontSize:'12px', color:'#991b1b' }}>{item}</div>
          ))}
        </div>
      </>
    );
    case 22: return <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7 }}>মোহাম্মাদী গ্রুপ সমস্ত আইনী প্রয়োজনীয়তা মেনে অভিবাসী স্বদেশী শ্রমিকদের নিয়োগ করে থাকে এবং তাদের সকল অধিকার নিশ্চিত করে।</p>;
    case 23: return <BulletList items={['সাপ্লায়ার এবং সাব কন্ট্রাক্টরদের আমাদের পলিসি এবং প্রোসিডিউর শেয়ার করা হয়','সাপ্লায়ার এবং সাব কন্ট্রাক্টরদের সোশ্যাল এবং শ্রম চর্চার উপরে প্রশিক্ষণ দেওয়া হয়']} />;
    case 24: return <BulletList items={['শ্রমিকেরা স্বাধীনভাবে ইউনিয়নে যোগদান করতে পারে','ইউনিয়ন স্বাধীনভাবে কোনো ফেডারেশন বা কনফেডারেশনে যোগদান করতে পারে','ইউনিয়নের সদস্য হওয়ার জন্য কোনো ধরনের অননুমোদিত মজুরি কর্তন করা হয় না','ম্যানেজমেন্ট কখনও ইউনিয়নের কাজে হস্তক্ষেপ করবে না']} />;
    case 25: return <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7 }}>নারী ও পুরুষ লিঙ্গ ভেদে সবাইকে সমান দৃষ্টিতে মূল্যায়ন করা হয় এবং নারীদের অধিকারের ব্যাপারে অগ্রাধিকার দেওয়া হয়।</p>;
    case 26: return <BulletList items={['ধারালো বস্তু যেমন কাটার, সিজার, ভোমর ইত্যাদি স্টোর সেকশন থেকে প্রত্যেক লাইন সুপারভাইজার নির্দিষ্ট রিকুইজিশন এর মাধ্যমে গ্রহন করবে','নিডেল ওম্যান স্টোর সেকশন থেকে নির্দিষ্ট রিকুইজিশন এর মাধ্যমে নিডেল গ্রহন করবে']} />;
    case 27: return <BulletList items={['এইডস কী? — এটি একটি মারাত্মক রোগ যা HIV ভাইরাস দ্বারা সৃষ্ট','কেন হয়? — অনিরাপদ যৌন সম্পর্ক, আক্রান্ত রক্ত গ্রহণ, একই সুচ ব্যবহার','এইডস রোগের লক্ষণ — দীর্ঘমেয়াদী জ্বর, ওজন হ্রাস, ডায়রিয়া','এইডস রোগ থেকে মুক্তির উপায় — সচেতনতা, নিরাপদ যৌন সম্পর্ক, পরীক্ষা করানো','এইডস রোগীদের সাথে স্বাভাবিক আচরণ করতে হবে — এটি ছোঁয়াচে রোগ নয়']} />;
    case 28: return <TagWrap items={['১। নিরপেক্ষ ভঙ্গী','২। সঠিক ফিট','৩। ঘন ঘন বিরতি','৪। পুনরাবৃত্তিমূলক গতি এড়িয়ে চলুন','৫। সঠিক উত্তোলন কৌশল','৬। স্থায়ী কাজ']} style={{ background:'#ecfeff', color:'#0e7490', borderColor:'#a5f3fc' }} />;
    case 29: return <TagWrap items={['১। মেশিন গার্ডিং','২। প্রশিক্ষিত অপারেটর','৩। নিয়মিত রক্ষণাবেক্ষণ','৪। ইলেকট্রিক্যাল সেফটি','৫। ব্যক্তিগত সুরক্ষা সামগ্রী','৬। হাউসকিপিং','৭। দুর্ঘটনা রিপোর্টিং','৮। আইন ও কমপ্লায়েন্স']} style={{ background:'#fffbeb', color:'#92400e', borderColor:'#fde68a' }} />;
    case 30: return <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7 }}>প্রশিক্ষণ শেষে উপস্থিত শ্রমিক/কর্মচারীরা উপরোক্ত প্রশিক্ষণের বিষয়বস্তু সঠিকভাবে বুঝেছে কিনা জিজ্ঞাসা করা হলে সকলে বুঝেছে এই মর্মে স্বীকার করার পর সকলের স্বাক্ষর গ্রহণ করা হয়।</p>;
    case 31: return <p style={{ fontSize:'13px', color:'#334155', lineHeight:1.7 }}>প্রশিক্ষণ শেষে নতুন শ্রমিকদের পুরো কারখানা ঘুরিয়ে দেখানো হয় — প্রতিটি বিভাগ, ফ্লোর, সুবিধাদি এবং নিরাপত্তা ব্যবস্থা সম্পর্কে পরিচিত করানো হয়।</p>;
    case 32: return (
      <>
        <InfoBox color="#16a34a" title={`এনার্জি ও GHG লক্ষ্যমাত্রা (${c.environmentTargets.targetYear} সালের মধ্যে)`} items={[`শক্তি ব্যবহার ${c.environmentTargets.ghgReductionPct}% হ্রাস করা`,`GHG গ্যাস নিঃসরণ ${c.environmentTargets.ghgReductionPct}% হ্রাস করা`,'গ্যাস ও ডিজেল জেনারেটর এবং আর ই বি থেকে বিদ্যুৎ পাই']} />
        <InfoBox color="#0891b2" title={`পানি লক্ষ্যমাত্রা (${c.environmentTargets.targetYear} সালের মধ্যে)`} items={[`পানির ব্যবহার ${c.environmentTargets.waterReductionPct}% হ্রাস করা`,'পানি একটি স্বচ্ছ, স্বাদহীন, গন্ধহীন তরল পদার্থ']} />
        <InfoBox color="#7c3aed" title={`বর্জ্য ব্যবস্থাপনা লক্ষ্যমাত্রা (${c.environmentTargets.targetYear} সালের মধ্যে)`} items={[`বিপজ্জনক ও অ-বিপজ্জনক বর্জ্য ${c.environmentTargets.wasteReductionPct}% হ্রাস করা`,'বিপজ্জনক বর্জ্য: ইলেকট্রিক বর্জ্য, প্রিন্টার কার্টিজ এবং খালি কেমিক্যাল ড্রাম','অ-বিপজ্জনক বর্জ্য: টেক্সটাইল বর্জ্য, কার্টুন, পলি ব্যাগ, কাগজ']} />
      </>
    );
    default: return <p style={{ color:'#64748b', fontSize:'13px' }}>তথ্য শীঘ্রই আসছে...</p>;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WorkerGuidelineViewer() {
  const { activeFactoryId } = useAuth();
  const { factoryId: paramFactoryId } = useParams<{ factoryId: string }>();
  // When opened via QR (/view route), factoryId comes from URL params.
  // When opened inside the dashboard, it comes from auth context.
  const resolvedFactoryId = paramFactoryId ?? activeFactoryId;
  const factory  = getFactoryById(resolvedFactoryId);
  const cfg      = factory.workerGuidelineConfig;
  const profile  = factory.workerProfile;
  const activeTopics = useMemo(() => getActiveTopics(factory), [factory.id]);
  const show = (n: number) => activeTopics.has(n);
  const printRef = useRef<HTMLDivElement>(null);

  // App view: 'guide' = normal guideline | 'calculator' | 'formula'
  const [appView, setAppView] = useState<'guide' | 'calculator' | 'formula'>('guide');

  // null = card grid view  |  number = section detail view
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const allocatedSections = SECTIONS.filter(s => show(s.id));

  const handleCardClick = (id: number) => {
    if (id === 33) { setAppView('calculator'); return; }
    if (id === 34) { setAppView('formula');    return; }
    setActiveSection(prev => prev === id ? null : id);
    // Scroll to top of content area smoothly
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleBack = () => {
    setActiveSection(null);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handlePrint = () => window.print();

  const handlePDF = async () => {
    try {
      const { default: jsPDF }      = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      if (!printRef.current) return;
      const canvas  = await html2canvas(printRef.current, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW    = pdf.internal.pageSize.getWidth();
      const pdfH    = (canvas.height * pdfW) / canvas.width;
      let pos = 0;
      const pageH = pdf.internal.pageSize.getHeight();
      while (pos < pdfH) {
        pdf.addImage(imgData, 'JPEG', 0, -pos, pdfW, pdfH);
        pos += pageH;
        if (pos < pdfH) pdf.addPage();
      }
      pdf.save(`worker-guideline-${factory.id}.pdf`);
    } catch {
      alert('PDF export failed. Please use Print instead.');
    }
  };

  const activeSectionDef = activeSection ? SECTIONS.find(s => s.id === activeSection) : null;

  // ── Special full-screen app views ────────────────────────────────────────
  if (appView === 'calculator') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setAppView('guide')}
          style={{
            position: 'fixed', top: '12px', left: '12px', zIndex: 1000,
            background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '10px',
            padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Noto Sans Bengali', sans-serif",
          }}
          aria-label="গাইডে ফিরুন"
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
            background: '#059669', color: '#fff', border: 'none', borderRadius: '10px',
            padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Noto Sans Bengali', sans-serif",
          }}
          aria-label="গাইডে ফিরুন"
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

        .wg-topbar {
          position: sticky; top: 0; z-index: 100;
          background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
          padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .wg-topbar-title { color: #93c5fd; font-size: 13px; font-weight: 600; }
        .wg-topbar-actions { display: flex; gap: 8px; }
        .wg-action-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 6px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .wg-action-btn--print { background: rgba(255,255,255,0.15); color: #fff; }
        .wg-action-btn--print:hover { background: rgba(255,255,255,0.25); }
        .wg-action-btn--pdf { background: #dc2626; color: #fff; }
        .wg-action-btn--pdf:hover { background: #b91c1c; }

        /* Factory header */
        .wg-header {
          background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
          padding: 20px 16px 28px; color: #fff; text-align: center;
        }
        .wg-header-logo {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px; font-size: 28px;
        }
        .wg-header-name    { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
        .wg-header-name-bn { font-size: 14px; color: #93c5fd; margin-bottom: 6px; }
        .wg-header-address { font-size: 12px; color: rgba(255,255,255,0.7); }
        .wg-header-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15); border-radius: 20px;
          padding: 5px 14px; font-size: 11px; color: #bfdbfe; margin-top: 10px;
        }

        /* Card grid panel */
        .wg-card-panel {
          background: #fff; margin: -14px 12px 14px;
          border-radius: 12px; padding: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .wg-card-panel-title {
          font-size: 11px; font-weight: 700; color: #64748b;
          margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .wg-card-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 400px) {
          .wg-card-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* Section detail panel */
        .wg-detail-panel {
          background: #fff; margin: -14px 12px 14px;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .wg-detail-header {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px; cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
        }
        .wg-detail-back {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #64748b; font-size: 12px; font-weight: 600;
          padding: 0; font-family: inherit; flex-shrink: 0;
        }
        .wg-detail-back:hover { color: #1e40af; }
        .wg-detail-title {
          font-size: 14px; font-weight: 700; color: #0f172a; flex: 1;
        }
        .wg-detail-body { padding: 16px; }

        /* Footer */
        .wg-footer {
          background: #0f172a; color: #94a3b8;
          padding: 20px 16px; text-align: center;
          font-size: 12px; margin-top: 20px;
        }
        .wg-hotline-chip {
          display: flex; align-items: center; gap: 8px;
          background: #1e293b; border-radius: 8px;
          padding: 8px 16px; color: #fff; text-decoration: none;
          margin-bottom: 8px;
        }
        .wg-hotline-num { font-size: 16px; font-weight: 700; color: #60a5fa; }

        \${BASE_PRINT_CSS}
        \${PAGE_A4_PORTRAIT}
        @media print {
          .wg-action-btn, .wg-topbar, .wg-detail-back { display: none !important; }
          .wg-viewer { padding: 0; max-width: 100%; }
          .wg-section-wrapper { break-inside:avoid !important; page-break-inside:avoid !important; }
          .wg-header { background: none !important; color: #000 !important; }
          p, li { orphans:3; widows:3; }
        }      `}</style>

      {/* Top action bar */}
      <div className="wg-topbar">
        <div className="wg-topbar-title">🏭 {factory.nameBn} — কর্মচারী নির্দেশিকা</div>
        <div className="wg-topbar-actions">
          <AppButton variant="print" onClick={handlePrint}><FaPrint aria-hidden="true" /> Print</AppButton>
          <AppButton variant="pdf" onClick={handlePDF}><FaFilePdf aria-hidden="true" /> PDF</AppButton>
        </div>
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

        {/* ── Mini card TOC or section detail ── */}
        {expandAll ? (

          /* ── Expand-all view: all allocated sections in scroll ── */
          <div className="wg-expand-all">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 16px', borderBottom:'1px solid #e2e8f0', background:'#f8fafc' }}>
              <span style={{ fontSize:'13px', fontWeight:600, color:'#1e293b' }}>
                সব বিষয় ({activeTopics.size}টি)
              </span>
              <button
                onClick={() => setExpandAll(false)}
                style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                  padding:'3px 10px', fontSize:'11px', color:'#64748b', cursor:'pointer', fontFamily:'inherit' }}
              >
                ✕ ফিরে যান
              </button>
            </div>
            <div style={{ padding:'12px 8px' }}>
              {allocatedSections.map(sec => (
                <div key={sec.id} className="wg-section-wrapper" style={{ marginBottom:'12px',
                  border:'1px solid #f1f5f9', borderRadius:'8px', overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px',
                    padding:'8px 12px', background: sec.color + '10',
                    borderBottom:'1px solid ' + sec.color + '20' }}>
                    <span style={{ color: sec.color, fontSize:'14px' }}>{sec.icon}</span>
                    <span style={{ fontSize:'12px', fontWeight:700, color:'#1e293b' }}>
                      {sec.id}। {sec.titleBn}
                    </span>
                  </div>
                  <div className="wg-detail-body" style={{ padding:'8px 12px' }}>
                    <SectionContent id={sec.id} cfg={cfg} factory={factory} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : activeSection === null ? (

          /* Card grid — allocated topics only */
          <div className="wg-card-panel">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <div className="wg-card-panel-title" style={{ marginBottom:0 }}>
                বিষয়সূচি — Training Topics
                <span style={{ marginLeft:'6px', color:'#94a3b8', fontWeight:400 }}>
                  ({activeTopics.size}টি)
                </span>
              </div>
              <button
                onClick={() => setExpandAll(true)}
                style={{
                  background:'#eff6ff', border:'1px solid #bfdbfe',
                  color:'#1d4ed8', borderRadius:'6px', padding:'3px 10px',
                  fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                  whiteSpace:'nowrap', flexShrink:0,
                }}
              >
                ⊞ সব বিষয়
              </button>
            </div>
            <div className="wg-card-grid">
              {allocatedSections.map(sec => (
                <MiniCard
                  key={sec.id}
                  section={sec}
                  active={false}
                  onClick={() => handleCardClick(sec.id)}
                />
              ))}
            </div>
          </div>

        ) : (

          /* Section detail — only the selected section */
          <div className="wg-detail-panel">
            {/* Header with back button and section title */}
            <div className="wg-detail-header" style={{ background: activeSectionDef?.color + '12' }}>
              <button className="wg-detail-back" onClick={handleBack}>
                <FaChevronLeft size={10} /> সব বিষয়
              </button>
              <div style={{ width: 1, height: 18, background: '#e2e8f0', flexShrink: 0 }} />
              <div style={{ fontSize: '16px', color: activeSectionDef?.color, flexShrink: 0 }}>
                {activeSectionDef?.icon}
              </div>
              <div className="wg-detail-title">
                {activeSectionDef?.id}। {activeSectionDef?.titleBn}
              </div>
              <button
                onClick={handleBack}
                style={{ background:'none', border:'none', cursor:'pointer',
                  color:'#94a3b8', display:'flex', alignItems:'center', flexShrink:0 }}
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Navigation arrows — moves through allocated topics only */}
            {(() => {
              const navList = allocatedSections;
              const idx     = navList.findIndex(s => s.id === activeSection);
              const hasPrev = idx > 0;
              const hasNext = idx < navList.length - 1;
              const btnStyle = (enabled: boolean) => ({
                background:'none', border:'1px solid #e2e8f0', borderRadius:'6px',
                padding:'4px 10px', fontSize:'11px', fontFamily:'inherit',
                cursor: enabled ? 'pointer' : 'not-allowed',
                color: enabled ? '#475569' : '#cbd5e1',
              });
              return (
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 16px',
                  borderBottom:'1px solid #f1f5f9', background:'#f8fafc' }}>
                  <button
                    onClick={() => hasPrev && setActiveSection(navList[idx - 1].id)}
                    disabled={!hasPrev}
                    style={btnStyle(hasPrev)}
                  >
                    ← আগের বিষয়
                  </button>
                  <span style={{ fontSize:'11px', color:'#94a3b8', alignSelf:'center' }}>
                    {idx + 1} / {navList.length}
                  </span>
                  <button
                    onClick={() => hasNext && setActiveSection(navList[idx + 1].id)}
                    disabled={!hasNext}
                    style={btnStyle(hasNext)}
                  >
                    পরের বিষয় →
                  </button>
                </div>
              );
            })()}

            {/* Section content */}
            <div className="wg-detail-body">
              <SectionContent id={activeSection} cfg={cfg} factory={factory} />
            </div>

            {/* Bottom: return to grid */}
            <div style={{ padding:'12px 16px', borderTop:'1px solid #f1f5f9', textAlign:'center' }}>
              <button onClick={handleBack} style={{
                background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:'8px',
                padding:'8px 20px', fontSize:'12px', fontWeight:600, color:'#475569',
                cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:'6px',
              }}>
                <FaChevronLeft size={10} /> সকল বিষয় দেখুন
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="wg-footer">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color:'#e2e8f0', fontWeight:700, fontSize:'14px', marginBottom:'4px' }}>ওয়েলফেয়ার অফিসার</div>
            {profile.welfareOfficers.map((w, i) => (
              <div key={i} style={{ color:'#cbd5e1', fontSize:'13px' }}>{w.name} — {w.designation}</div>
            ))}
            <div style={{ color:'#e2e8f0', fontWeight:700, fontSize:'14px', margin:'10px 0 4px' }}>হট লাইন নম্বর</div>
            {profile.hotlines.map((h: HotLine, i: number) => (
              <a key={i} href={`tel:${h.number}`} className="wg-hotline-chip" style={{ display:'inline-flex', margin:'0 auto 8px', maxWidth:'240px' }}>
                <FaPhone style={{ color:'#60a5fa' }} />
                <div>
                  <div style={{ fontSize:'11px', color:'#94a3b8' }}>{h.label}</div>
                  <div className="wg-hotline-num">{h.number}</div>
                </div>
              </a>
            ))}
          </div>
          <div>
            <strong style={{ color:'#e2e8f0' }}>{factory.nameBn}</strong><br />
            {factory.addressBn}
          </div>
          <div style={{ marginTop:'8px', fontSize:'11px' }}>মোহাম্মাদী গ্রুপ — কর্মচারী নির্দেশিকা | শ্রমিক সহায়িকা</div>
        </div>

      </div>
    </>
  );
}