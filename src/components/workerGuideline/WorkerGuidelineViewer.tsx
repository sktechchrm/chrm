// ─────────────────────────────────────────────────────────────────────────────
// WORKER GUIDELINE VIEWER — UI Polished Edition
// Same text content, dramatically improved visual presentation
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { getGuidelineConfig, getActiveTopics } from './workerGuidelineData';
import { getFactoryById } from '../../factories/FactoryRegistry';
import CalculatorHub from './CalculatorHub';
import FormulaReference from './FormulaReference';
import EmployeeGrievancePortal from '../grievance/employee/employeeGrievancePortal';
import {
  FaBuilding, FaPhone, FaUser, FaMoneyBillWave, FaClock,
  FaShieldAlt, FaHandshake, FaLeaf, FaBan, FaTrophy,
  FaExclamationTriangle, FaHeartbeat, FaGavel, FaBaby,
  FaPrint, FaFilePdf, FaIndustry, FaFileSignature,
  FaTools, FaUserShield, FaBalanceScale, FaRecycle,
  FaChevronLeft, FaTimes, FaUserTie,
} from 'react-icons/fa';

// ── Design Tokens ─────────────────────────────────────────────────────────────

const T = {
  radius: { sm: '6px', md: '10px', lg: '14px', xl: '18px', full: '999px' },
  // Mobile-safe sizes: nothing below 12px — sub-12px Bengali serif = blur on Android
  font: { xs: '12px', sm: '13px', base: '14px', md: '15px', lg: '16px', xl: '18px', '2xl': '22px' },
  weight: { normal: 400, medium: 500, semi: 600, bold: 700, black: 800 },
  gap: { xs: '4px', sm: '6px', md: '10px', lg: '14px', xl: '20px' },
  pad: { xs: '6px 10px', sm: '8px 12px', md: '12px 16px', lg: '16px 20px', xl: '20px 24px' },
  // Font families — applied inline to elements needing explicit override
  fontBn: "'Noto Serif Bengali', serif" as const,
  fontLatin: "'Inter', -apple-system, sans-serif" as const,
};

// ── Reusable sub-components ───────────────────────────────────────────────────

const Divider = () => (
  <div style={{ height: '1px', background: '#f0f4f8', margin: '2px 0' }} />
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '9px 0', gap: '12px',
    }}>
      <span style={{
        color: '#7a8899', fontSize: T.font.base,
        fontFamily: T.fontBn,
        flexShrink: 0, maxWidth: '55%', lineHeight: 1.55,
      }}>{label}</span>
      <span style={{
        color: '#1a2332', fontSize: T.font.base,
        fontFamily: T.fontBn,
        fontWeight: T.weight.semi, textAlign: 'right', lineHeight: 1.55,
      }}>{value}</span>
    </div>
    <Divider />
  </>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
    {items.map((item, i) => (
      <li key={i} style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid #f0f4f8' : 'none',
        fontSize: T.font.base,
        fontFamily: T.fontBn,
        color: '#3d4f63', lineHeight: 1.7,
      }}>
        <span style={{
          width: '5px', height: '5px', borderRadius: '50%', background: '#b0bcc8',
          flexShrink: 0, marginTop: '8px',
        }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const InfoBox: React.FC<{ color: string; title: string; items: string[] }> = ({ color, title, items }) => (
  <div style={{
    border: `1px solid ${color}22`,
    borderLeft: `3px solid ${color}`,
    borderRadius: T.radius.lg,
    padding: T.pad.md,
    marginBottom: '10px',
    background: `${color}08`,
  }}>
    <div style={{
      fontWeight: T.weight.bold, color, fontSize: T.font.xs,
      fontFamily: T.fontBn,
      marginBottom: '10px',
    }}>{title}</div>
    <BulletList items={items} />
  </div>
);

const TagWrap: React.FC<{ items: string[]; style?: React.CSSProperties }> = ({ items, style }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
    {items.map((t, i) => (
      <span key={i} style={{
        display: 'inline-block', padding: '4px 11px',
        background: '#eef3ff', color: '#3a5fc8', borderRadius: T.radius.full,
        fontSize: '12px', fontWeight: T.weight.semi,
        fontFamily: T.fontBn,
        border: '1px solid #c7d7f9', ...style,
      }}>{t}</span>
    ))}
  </div>
);

const SectionCard: React.FC<{ title: string; accent?: string; children: React.ReactNode }> = ({
  title, accent = '#334155', children
}) => (
  <div style={{
    background: '#fff', border: '1px solid #e8edf3',
    borderLeft: `3px solid ${accent}`, borderRadius: T.radius.lg,
    padding: T.pad.md, marginBottom: '10px',
  }}>
    {title && (
      <div style={{
        fontWeight: T.weight.bold, color: accent, fontSize: T.font.xs,
        fontFamily: T.fontBn,
        marginBottom: '12px',
      }}>{title}</div>
    )}
    {children}
  </div>
);

const AlertBox: React.FC<{ color: string; icon: string; title: string; children: React.ReactNode }> = ({
  color, icon, title, children
}) => (
  <div style={{
    background: `${color}0c`, border: `1px solid ${color}28`,
    borderLeft: `3px solid ${color}`, borderRadius: T.radius.lg,
    padding: T.pad.md, marginTop: '10px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ fontWeight: T.weight.bold, color, fontSize: '12px', fontFamily: T.fontBn }}>{title}</span>
    </div>
    <div style={{ fontSize: T.font.base, fontFamily: T.fontBn, color: '#3d4f63', lineHeight: 1.7 }}>{children}</div>
  </div>
);

const Badge: React.FC<{ color: string; bg: string; border: string; children: React.ReactNode }> = ({
  color, bg, border, children
}) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 9px', borderRadius: T.radius.full,
    fontSize: '12px', fontWeight: T.weight.bold,
    fontFamily: T.fontBn,
    color, background: bg, border: `1px solid ${border}`,
  }}>{children}</span>
);

const GridCards: React.FC<{ items: Array<{ t: string; d: string }>; accent?: string }> = ({ items, accent = '#1e40af' }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
    {items.map((item, idx) => (
      <div key={idx} style={{
        background: '#f8fafc', border: '1px solid #eaeff5',
        borderRadius: T.radius.md, padding: '10px 12px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: T.weight.bold, color: accent, fontFamily: T.fontBn, marginBottom: '3px' }}>{item.t}</div>
        <div style={{ fontSize: '12px', color: '#5a6b7e', lineHeight: 1.5, fontFamily: T.fontBn }}>{item.d}</div>
      </div>
    ))}
  </div>
);

// ── Section definition list ────────────────────────────────────────────────────

interface SectionDef {
  id: number;
  titleBn: string;
  color: string;
  icon: React.ReactNode;
  subtitle?: string;   // featured-card tagline (Bengali)
  featured?: boolean;  // renders as full-width banner instead of grid cell
}

const SECTIONS: SectionDef[] = [
  { id: 1,  titleBn: 'কারখানা পরিচিতি',              color: '#1e40af', icon: <FaBuilding /> },
  { id: 2,  titleBn: 'কোম্পানির লক্ষ্য',              color: '#0891b2', icon: <FaTrophy /> },
  { id: 3,  titleBn: 'উৎপাদন প্রক্রিয়া',              color: '#059669', icon: <FaIndustry /> },
  { id: 4,  titleBn: 'নিয়োগ পত্র',                   color: '#7c3aed', icon: <FaGavel /> },
  { id: 5,  titleBn: 'হ্যান্ড বুক',                   color: '#0891b2', icon: <FaUser /> },
  { id: 6,  titleBn: 'আর্থিক সুবিধা',                 color: '#16a34a', icon: <FaMoneyBillWave /> },
  { id: 7,  titleBn: 'দক্ষতা বৃদ্ধি',                 color: '#d97706', icon: <FaTrophy /> },
  { id: 8,  titleBn: 'কর্মক্ষেত্রে ঝুঁকি',            color: '#dc2626', icon: <FaExclamationTriangle /> },
  { id: 9,  titleBn: 'স্বাস্থ্য ও নিরাপত্তা',          color: '#0891b2', icon: <FaShieldAlt /> },
  { id: 10, titleBn: 'ক্ষতিপূরণ নীতি',               color: '#7c3aed', icon: <FaBalanceScale /> },
  { id: 11, titleBn: 'ঘুষ ও দুর্নীতি',               color: '#dc2626', icon: <FaBan /> },
  { id: 12, titleBn: 'সংরক্ষিত এলাকা',               color: '#ea580c', icon: <FaBan /> },
  { id: 13, titleBn: 'পুরস্কার',                      color: '#ca8a04', icon: <FaTrophy /> },
  { id: 14, titleBn: 'দুর্যোগ মোকাবেলা',              color: '#dc2626', icon: <FaExclamationTriangle /> },
  { id: 15, titleBn: 'হয়রানি/যৌন নির্যাতন',          color: '#9333ea', icon: <FaUserShield /> },
  { id: 16, titleBn: 'বৈষম্য ও জবরদস্তি',            color: '#0f766e', icon: <FaBalanceScale /> },
  { id: 17, titleBn: 'অভিযোগ পদ্ধতি',                color: '#1e40af', icon: <FaPhone /> },
  { id: 18, titleBn: 'HR বিজনেস প্রিন্সিপাল',        color: '#475569', icon: <FaUser /> },
  { id: 19, titleBn: 'শিশু ও কিশোর শ্রমিক',         color: '#0891b2', icon: <FaBaby /> },
  { id: 20, titleBn: 'শৃঙ্খলা',                      color: '#1e40af', icon: <FaGavel /> },
  { id: 21, titleBn: 'অসদাচরণ ও শাস্তিমূলক ব্যবস্থা', color: '#dc2626', icon: <FaBan /> },
  { id: 22, titleBn: 'দেশি ও বিদেশি শ্রমিক',        color: '#0f766e', icon: <FaUser /> },
  { id: 23, titleBn: 'সাব-কন্ট্রাক্ট',               color: '#475569', icon: <FaHandshake /> },
  { id: 24, titleBn: 'সংগঠনের স্বাধীনতা',            color: '#1e40af', icon: <FaHandshake /> },
  { id: 25, titleBn: 'লিঙ্গ সমতা',                  color: '#7c3aed', icon: <FaBalanceScale /> },
  { id: 26, titleBn: 'মেটাল কন্ট্রোল',               color: '#64748b', icon: <FaTools /> },
  { id: 27, titleBn: 'এইচআইভি/এইডস (HIV/AIDS)',      color: '#be185d', icon: <FaHeartbeat /> },
  { id: 28, titleBn: 'ইর্গনোমিক্স (Ergonomics)',       color: '#0891b2', icon: <FaShieldAlt /> },
  { id: 29, titleBn: 'মেশিন সেফটি',                  color: '#b45309', icon: <FaTools /> },
  { id: 30, titleBn: 'মতামত/পরামর্শ (Feedback System)', color: '#16a34a', icon: <FaHandshake /> },
  { id: 31, titleBn: 'কারখানা পরিদর্শন (Factory Tour)', color: '#1e40af', icon: <FaBuilding /> },
  { id: 32, titleBn: 'এনভায়রনমেন্ট',                color: '#15803d', icon: <FaLeaf /> },
  { id: 33, titleBn: 'শ্রমিক ক্যালকুলেটর',        color: '#0891b2', icon: <FaBalanceScale />, featured: true,
    subtitle: 'বেতন, ওভারটাইম ও সুবিধা হিসাব করুন এক জায়গায়' },
  // { id: 34, titleBn: 'হিসাবের সূত্রসমূহ',               color: '#7c3aed', icon: <FaGavel /> },
  { id: 35, titleBn: 'কর্মী অভিযোগ ব্যবস্থাপনা',   color: '#dc2626', icon: <FaFileSignature />, featured: true,
    subtitle: 'গোপনে অভিযোগ জানান — দ্রুত ব্যবস্থা নেওয়া হবে' },
  // { id: 36, titleBn: 'তথ্য শীঘ্রই আসছে...', color: '#94a3b8', icon: <FaTimes /> },
];

// ── Mini card component ───────────────────────────────────────────────────────

const MiniCard: React.FC<{
  section: SectionDef;
  active: boolean;
  onClick: () => void;
}> = ({ section, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: active ? section.color : '#fff',
      border: `1.5px solid ${active ? section.color : '#e8edf3'}`,
      borderRadius: T.radius.lg,
      padding: '10px 6px 10px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.15s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
      boxShadow: active ? `0 2px 8px ${section.color}30` : '0 1px 2px rgba(0,0,0,0.04)',
      transform: 'none',  /* no scale — sub-pixel transforms blur on Android */
      minWidth: 0,
    }}
  >
    {/* Number badge — Latin numerals, Inter */}
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%',
      background: active ? 'rgba(255,255,255,0.22)' : section.color + '15',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '8px', fontWeight: T.weight.black,
      fontFamily: T.fontLatin,
      color: active ? '#fff' : section.color,
      flexShrink: 0,
    }}>
      {/* {section.id} */}
    </div>
    {/* Icon */}
    <div style={{ fontSize: '16px', color: active ? '#fff' : section.color, lineHeight: 1 }}>
      {section.icon}
    </div>
    {/* Bengali title — Noto Serif Bengali, minimum 12px for Android clarity */}
    <div style={{
      fontSize: '12px', fontWeight: T.weight.semi, lineHeight: 1.4,
      fontFamily: T.fontBn,
      color: active ? 'rgba(255,255,255,0.95)' : '#3d4f63',
      wordBreak: 'keep-all',
    }}>
      {section.titleBn}
    </div>
  </button>
);

// ── Featured card component (IDs 33 & 35) ────────────────────────────────────

const FeaturedCard: React.FC<{
  section: SectionDef;
  onClick: () => void;
}> = ({ section, onClick }) => {
  // Each featured section gets a unique gradient pair derived from its color
  const gradients: Record<number, [string, string]> = {
    33: ['#0369a1', '#0891b2'],  // blue — calculator
    35: ['#991b1b', '#dc2626'],  // red — grievance
  };
  const [from, to] = gradients[section.id] ?? [section.color, section.color];

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        width: '100%',
        background: `linear-gradient(115deg, ${from} 0%, ${to} 100%)`,
        border: 'none',
        borderRadius: T.radius.lg,
        padding: '16px 18px',
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 3px 10px ${section.color}50`,
      }}
    >
      {/* Decorative ring — top-right */}
      <div style={{
        position: 'absolute', top: -18, right: -18,
        width: 80, height: 80, borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.15)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: -32, right: -32,
        width: 110, height: 110, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.08)',
        pointerEvents: 'none',
      }} />

      {/* Icon circle */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(255,255,255,0.18)',
        border: '1.5px solid rgba(255,255,255,0.30)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', color: '#fff',
      }}>
        {section.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Live pulse dot + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 0 0 0 rgba(255,255,255,0.6)',
            animation: 'featuredPulse 1.8s ease-out infinite',
            flexShrink: 0,
            display: 'inline-block',
          }} />
          <span style={{
            fontSize: '11px', fontWeight: T.weight.bold,
            fontFamily: T.fontLatin,
            color: 'rgba(255,255,255,0.70)',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
          }}>
            {section.id === 33 ? 'TOOL' : 'PORTAL'}
          </span>
        </div>

        <div style={{
          fontSize: '16px', fontWeight: T.weight.bold,
          fontFamily: T.fontBn,
          color: '#fff',
          lineHeight: 1.35,
          marginBottom: '3px',
        }}>
          {section.titleBn}
        </div>

        {section.subtitle && (
          <div style={{
            fontSize: '12px', fontWeight: T.weight.normal,
            fontFamily: T.fontBn,
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.5,
          }}>
            {section.subtitle}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', color: '#fff',
      }}>
        ›
      </div>
    </button>
  );
};



function SectionContent({ id, cfg, factory }: {
  id: number;
  cfg: ReturnType<typeof getGuidelineConfig>;
  factory: ReturnType<typeof getFactoryById>;
}) {
  const profile = factory.workerProfile;
  const c = cfg;
  const authority = factory.authorities;

  const prose = (text: string) => (
    <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.75, margin: 0, textAlign: 'justify' }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );

  switch (id) {
    case 1: return (
      <>
        <div style={{ marginBottom: '16px' }}>
          {[
            ['কারখানার নাম', factory.nameBn],
            ['ঠিকানা', factory.addressBn],
            ['প্রতিষ্ঠাকাল', `${profile.establishedYear} সাল`],
            ['ভবনের মোট তলা', `${profile.totalFloors} তলা`],
            ['মোট শ্রমিক/কর্মকর্তা/কর্মচারী', `${profile.totalWorkers.toLocaleString()} জন`],
            ['মোট শিফট', `${profile.totalShifts} টি`],
            ['সেলাই লাইন', `${profile.totalSewingLines} টি`],
            ['বাথরুম', `${profile.totalBathrooms} টি`],
            ['মাসিক উৎপাদন', `${profile.monthlyProduction.toLocaleString()} পিছ`],
          ].map(([label, val]) => <Row key={String(label)} label={String(label)} value={val} />)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: T.font.sm, color: '#7a8899', marginBottom: '8px', fontWeight: T.weight.semi, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              বায়ার সমূহ
            </div>
            <TagWrap items={profile.buyers} />
          </div>
          <div>
            <div style={{ fontSize: T.font.sm, color: '#7a8899', marginBottom: '8px', fontWeight: T.weight.semi, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              সেকশন সমূহ
            </div>
            <TagWrap items={profile.sections} style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }} />
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: T.radius.lg, border: '1px solid #e8edf3', borderLeft: '3px solid #1e293b' }}>
          <div style={{ fontWeight: T.weight.bold, color: '#1e293b', fontSize: T.font.md, marginBottom: '14px' }}>
            ব্যবস্থাপনা কর্তৃপক্ষের পরিচিতি (Management Authority)
          </div>
          <div style={{ borderRadius: T.radius.md, overflow: 'hidden', border: '1px solid #e8edf3' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: T.font.base }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ width: '38%', padding: '10px 12px', textAlign: 'left', color: '#5a6b7e', fontWeight: T.weight.semi, fontSize: T.font.sm }}>নাম</th>
                  <th style={{ width: '42%', padding: '10px 12px', textAlign: 'left', color: '#5a6b7e', fontWeight: T.weight.semi, fontSize: T.font.sm }}>পদবী</th>
                  <th style={{ width: '20%', padding: '10px 12px', textAlign: 'center', color: '#5a6b7e', fontWeight: T.weight.semi, fontSize: T.font.sm }}>অবস্থান</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: authority.honorableChairman?.name ?? '', d: authority.honorableChairman?.designation ?? '', p: 'HO' },
                  { n: authority.honorableMD?.name ?? '', d: authority.honorableMD?.designation ?? '', p: 'HO' },
                  { n: authority.headOfOperations.name, d: authority.headOfOperations.designation, p: 'HO' },
                  { n: authority.hoHrHead.name, d: authority.hoHrHead.designation, p: 'HO' },
                  { n: authority.factoryHead.name, d: authority.factoryHead.designation, p: 'Factory' },
                  { n: authority.hrManager.name, d: authority.hrManager.designation, p: 'Factory' },
                ].map((item, i, arr) => (
                  <tr key={i} style={{ borderTop: '1px solid #f0f4f8', background: i % 2 === 1 ? '#fafbfc' : '#fff' }}>
                    <td style={{ padding: '9px 12px', color: '#1a2332', fontWeight: T.weight.semi }}>{item.n}</td>
                    <td style={{ padding: '9px 12px', color: '#5a6b7e', fontSize: T.font.sm }}>{item.d}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <Badge
                        color={item.p === 'HO' ? '#1e40af' : '#15803d'}
                        bg={item.p === 'HO' ? '#eff6ff' : '#f0fdf4'}
                        border={item.p === 'HO' ? '#bfdbfe' : '#bbf7d0'}
                      >
                        {item.p === 'HO' ? 'প্রধান কার্যালয়' : 'কারখানা'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );

    case 2: return (
      <>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.8, marginBottom: '16px', textAlign: 'justify' }}>
          আমাদের লক্ষ্য হলো উদ্ভাবনী প্রযুক্তি এবং দক্ষ জনশক্তির সমন্বয়ে আন্তর্জাতিক মানের পোশাক উৎপাদন নিশ্চিত করা।
          আগামী পাঁচ বছরের মধ্যে আমরা গুণগত মান এবং টেকসই উৎপাদন ব্যবস্থার মাধ্যমে বৈশ্বিক শিল্পে স্বীকৃতি অর্জনে প্রতিজ্ঞাবদ্ধ।
        </p>

        <SectionCard title="গুণগতমান নীতি (Quality Policy)" accent="#1e293b">
          <p style={{ fontSize: T.font.md, color: '#1e293b', fontStyle: 'italic', fontWeight: T.weight.medium, lineHeight: 1.7, margin: 0 }}>
            "উক্ত প্রতিষ্ঠান ও তার কর্মচারীবৃন্দ বায়ারের নিকট অঙ্গীকারবদ্ধ যে বায়ারের চাহিদা মোতাবেক অধিক গুণগত মান সম্পন্ন পোশাক তৈরী করবে এবং যথাসময় রপ্তানি করবে।"
          </p>
        </SectionCard>

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1e293b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '3px', height: '16px', background: '#1e293b', borderRadius: '2px', display: 'inline-block' }} />
            কৌশলগত মূলস্তম্ভ
          </div>
          <BulletList items={[
            'আন্তর্জাতিক মানদণ্ড ও কমপ্লায়েন্স বজায় রেখে শ্রেষ্ঠত্বের নিশ্চয়তা প্রদান।',
            'কর্মীবাহিনীর মধ্যে প্রতিষ্ঠানের প্রতি দায়িত্বশীলতা ও মালিকানা অনুভূতি জাগ্রত করা।',
            'নারীর ক্ষমতায়ন নিশ্চিতকরণ এবং নেতৃত্বের পর্যায়ে নারীদের অংশগ্রহণ বৃদ্ধি করা।',
            'একটি নিরাপদ, আধুনিক এবং বৈষম্যহীন কর্মপরিবেশ নিশ্চিত করা।',
            'উৎপাদনশীলতা বৃদ্ধি এবং অপচয় রোধে আধুনিক প্রযুক্তির সর্বোচ্চ ব্যবহার।',
            'শ্রমিক ও কর্মচারীদের জন্য ন্যায্য মজুরি এবং সামাজিক সুরক্ষা নিশ্চিত করা।',
            'পরিবেশবান্ধব উৎপাদন পদ্ধতি অনুসরণ করে টেকসই উন্নয়ন নিশ্চিত করা।',
            'সততা ও স্বচ্ছতার মাধ্যমে বিশ্বব্যাপী বায়ারদের সাথে দীর্ঘমেয়াদী আস্থা গড়ে তোলা।',
          ]} />
        </div>
      </>
    );

    case 3: return (
      <>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.75, marginBottom: '12px' }}>
          এটি একটি ওভেন কারখানা। এখানে সকল প্রকার ওভেন টপস (শার্ট) তৈরি করা হয়।
        </p>
        <TagWrap items={profile.productTypes} style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }} />
        <div style={{ marginTop: '14px' }}>
          <BulletList items={[
            'উৎপাদন প্রক্রিয়ায় জড়িত সকলের সাথে ধারাবাহিকতা রক্ষা করতে হবে',
            'পোশাকের মান নিশ্চিত করতে হবে',
            'উৎপাদন বাড়াতে হবে এবং নির্দেশনা মেনে কাজ করতে হবে',
            'অভিজ্ঞতার বৃদ্ধির সাথে সাথে দক্ষতা বাড়াতে হবে',
            'ওয়েস্টেজ, অলটার, রিজেক্ট মালের সংখ্যা কমাতে হবে',
          ]} />
        </div>
      </>
    );

    case 4: return (
      <>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.75, marginBottom: '14px' }}>
          নিয়োগ পত্রে কর্মে যোগদানের তারিখ, নাম, পিতা/স্বামীর নাম, পদবী, গ্রেড, কার্ড নং এবং কোন বিভাগ/সেকশনে যোগদান করেছেন তা উল্লেখ আছে।
        </p>

        <div style={{ fontWeight: T.weight.bold, fontSize: T.font.sm, color: '#4c1d95', marginBottom: '8px', textTransform: 'uppercase' }}>শিক্ষানবিসকাল</div>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', marginBottom: '8px', lineHeight: 1.7 }}>
          <strong>দক্ষ শ্রমিকের ক্ষেত্রে:</strong> নিয়োগের তারিখ হইতে <strong>{c.probationMonthsSkill} মাস</strong>। তবে শর্ত থাকে যে, একজন শ্রমিকের ক্ষেত্রে শিক্ষানবিশকাল আরও <strong>{c.probationMonthsSkill} মাস</strong> বৃদ্ধি করা যাইবে যদি কোনো কারণে প্রথম <strong>{c.probationMonthsSkill} মাস</strong> শিক্ষানবিশকালে তাহার কাজের মান নির্ণয় করা সম্ভব না হয়।
        </p>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', marginBottom: '8px', lineHeight: 1.7 }}>
          <strong>অদক্ষ শ্রমিকের ক্ষেত্রে:</strong> নিয়োগের তারিখ হইতে <strong>{c.probationMonthsUnSkill} মাস</strong>।
        </p>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', marginBottom: '16px', lineHeight: 1.7, fontWeight: T.weight.semi, fontStyle: 'italic', textDecoration: 'underline' }}>
          শিক্ষানবিশকাল সন্তোষজনকভাবে সমাপ্ত হইবার পর শিক্ষানবিশ শ্রমিক বা কর্মচারী সংশ্লিষ্ট গ্রেডের স্থায়ী হিসাবে নিযুক্ত হইবেন।
        </p>

        <div style={{ fontWeight: T.weight.bold, fontSize: T.font.sm, color: '#4c1d95', marginBottom: '10px', textTransform: 'uppercase' }}>বেতন ও মজুরির বিন্যাস</div>
        <div style={{ border: '1px solid #e8edf3', borderRadius: T.radius.md, overflow: 'hidden', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['ক) মূল বেতন', c.salary.basicSalary],
                ['খ) বাড়ি ভাড়া (মূল মজুরির ৫০%)', c.salary.houseRent],
                ['গ) চিকিৎসা ভাতা', c.salary.medicalAllowance],
                ['ঘ) যাতায়াত', c.salary.transport],
                ['ঙ) খাদ্য ভাতা', c.salary.foodAllowance],
              ].map(([label, val], i) => (
                <tr key={String(label)} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ padding: '9px 14px', fontSize: T.font.base, color: '#3d4f63', borderBottom: '1px solid #f0f4f8' }}>{label}</td>
                  <td style={{ padding: '9px 14px', fontSize: T.font.base, textAlign: 'right', fontWeight: T.weight.semi, color: '#1a2332', borderBottom: '1px solid #f0f4f8' }}>৳ {Number(val).toLocaleString()}/–</td>
                </tr>
              ))}
              <tr style={{ background: '#f1f5f9' }}>
                <td style={{ padding: '11px 14px', fontSize: T.font.md, fontWeight: T.weight.bold, color: '#1a2332' }}>চ) সর্বমোট</td>
                <td style={{ padding: '11px 14px', fontSize: T.font.md, fontWeight: T.weight.bold, textAlign: 'right', color: '#1e40af' }}>৳ {c.salary.total.toLocaleString()}/–</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ fontWeight: T.weight.bold, fontSize: T.font.sm, color: '#4c1d95', marginBottom: '10px', textTransform: 'uppercase' }}>কার্য ঘণ্টা ও ওভারটাইম</div>
        <div style={{ marginBottom: '16px' }}>
          {[
            ['সাধারণ কার্য সময়', `দৈনিক ${c.workingHoursPerDay} ঘণ্টা`],
            ['সর্বোচ্চ ওভারটাইম', `${c.maxOvertimeHours} ঘণ্টা`],
            ['ওভারটাইম হিসাব', c.overtimeFormula],
            ['দুপুরে খাবার বিরতি (প্রথম শিফট)', `${c.lunchScheduleOne} (১ ঘণ্টা)`],
            ['দুপুরে খাবার বিরতি (দ্বিতীয় শিফট)', `${c.lunchScheduleTwo} (১ ঘণ্টা)`],
            ['বেতন পরিশোধ', `মাস শেষ হওয়ার পরবর্তী ${c.salaryPaymentDays} কার্যদিবসের মধ্যে`],
          ].map(([label, val]) => <Row key={String(label)} label={String(label)} value={val} />)}
        </div>

        <div style={{ fontWeight: T.weight.bold, fontSize: T.font.sm, color: '#4c1d95', marginBottom: '10px', textTransform: 'uppercase' }}>মালিক কর্তৃক চাকুরির অবসান</div>
        <div style={{ marginBottom: '16px' }}>
          <Row label="নোটিশ পিরিয়ড (স্থায়ী শ্রমিক)" value={`${c.noticePeriodDaysOwner.permanent} দিন`} />
          <Row label="নোটিশ পিরিয়ড (অস্থায়ী শ্রমিক)" value={`${c.noticePeriodDaysOwner.temporary} দিন`} />
        </div>

        <div style={{ fontWeight: T.weight.bold, fontSize: T.font.sm, color: '#4c1d95', marginBottom: '10px', textTransform: 'uppercase' }}>শ্রমিক কর্তৃক চাকুরির অবসান</div>
        <Row label="নোটিশ পিরিয়ড (স্থায়ী শ্রমিক)" value={`${c.noticePeriodDaysWorker.permanent} দিন`} />
        <Row label="নোটিশ পিরিয়ড (অস্থায়ী শ্রমিক)" value={`${c.noticePeriodDaysWorker.temporary} দিন`} />
      </>
    );

    case 5: return (
      <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.8 }}>
        কারখানায় নিয়োগ পত্র পাওয়ার সাথে একটি করে শ্রমিক সহায়িকা বই দেওয়া হয়। শ্রমিক সহায়িকা বইয়ে উল্লেখ থাকে আইনের সারাংশ, বাংলাদেশ গেজেটে উল্লেখকৃত বিভিন্ন গ্রেড, কারখানায় সমস্ত নিয়মকানুন, সুযোগ সুবিধা ইত্যাদি।
      </p>
    );

    case 6: return (
      <>
        <InfoBox color="#16a34a" title="আর্থিক সুবিধা সমূহ" items={['দুইটি ঈদ বোনাস', 'হাজিরা বোনাস', 'বার্ষিক ছুটির টাকা প্রদান', 'সার্ভিস বেনিফিট/ক্ষতিপূরণ', 'মাতৃত্বকালীন সুবিধা']} />
        <InfoBox color="#0891b2" title="অনার্থিক সুবিধা সমূহ" items={['মেডিকেল সুবিধা', 'ফ্রি শিক্ষা ব্যবস্থা', 'ফ্রি প্রশিক্ষণ ব্যবস্থা', 'ডে-কেয়ার সুবিধা', 'বাৎসরিক অ্যাওয়ার্ড প্রদান', 'বাৎসরিক অনুষ্ঠান']} />
      </>
    );

    case 7: return (
      <>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.75, marginBottom: '14px' }}>
          প্রত্যেকটি শ্রমিকের কাজ শেখার সুযোগ দেওয়া হয় এবং কাজের জটিলতা ও গভিরতা বৃদ্ধির সাথে সাথে তাদের পদোন্নতি ও বেতন বৃদ্ধি করা হয়।
        </p>
        <div style={{ fontWeight: T.weight.semi, fontSize: T.font.sm, color: '#78350f', marginBottom: '8px' }}>পদোন্নতির ক্ষেত্রে ৭টি বিষয় বিবেচনা করা হয়:</div>
        <TagWrap items={['দক্ষতা', 'বিভিন্ন প্রসেস', 'কাজের কোয়ালিটি', 'শিক্ষাগত যোগ্যতা', 'অভিজ্ঞতা', 'উপস্থিতি', 'শৃঙ্খলা']}
          style={{ background: '#fffbeb', color: '#78350f', borderColor: '#fde68a' }} />
      </>
    );

    case 8: return <BulletList items={[
      'কর্মক্ষেত্রে সম্ভাব্য সকল ঝুঁকি (Risks) হ্রাসে এবং ব্যক্তিগত নিরাপত্তা নিশ্চিত করতে সংশ্লিষ্ট বিভাগের নির্ধারিত পিপিই (PPE) যেমন—মাস্ক, গ্লাভস, বা আঙ্গুল-গার্ড ব্যবহার করা বাধ্যতামূলক।',
      'অগ্নি ও বৈদ্যুতিক দুর্ঘটনা প্রতিরোধে কারখানার অভ্যন্তরে দাহ্য পদার্থ (বিড়ি, সিগারেট, দিয়াশলাই) বহন এবং নির্দিষ্ট রাসায়নিক কক্ষ ব্যতীত অন্য কোথাও কেমিক্যাল ব্যবহার সম্পূর্ণ নিষিদ্ধ।',
      'জরুরি নির্গমন পথ (Emergency Exit) বাধামুক্ত রাখতে অনুমোদিত টিফিন বক্স ও জুতার ব্যাগ ব্যতীত অন্য কোনো ব্যক্তিগত ব্যাগ বা অপ্রয়োজনীয় বস্তু নিয়ে প্রোডাকশন ফ্লোরে প্রবেশ করা যাবে না।',
      'মেশিন গার্ড ও নিরাপত্তা সেন্সর এর কোনো প্রকার পরিবর্তন বা অকেজো করা থেকে বিরত থাকতে হবে এবং যেকোনো যান্ত্রিক ঝুঁকির ক্ষেত্রে তাৎক্ষণিকভাবে মেকানিক বা সুপারভাইজারকে জানাতে হবে।',
      'ফ্যাক্টরির সম্পদ রক্ষা এবং পেশাগত স্বাস্থ্য ও নিরাপত্তা (OHS) নীতিমালা যথাযথভাবে পালন করা প্রতিটি শ্রমিকের আইনগত ও পেশাদার দায়িত্ব।',
    ]} />;

    case 9: return <BulletList items={[
      'শার্প টুলস পলিসি অনুযায়ী—সকল কাটার, সিজার ও ভোমর অবশ্যই রশি দিয়ে মেশিনের সাথে আবদ্ধ রাখতে হবে এবং ব্যবহারকারীর নাম ও কার্ড নম্বর স্পষ্টভাবে উল্লেখ থাকতে হবে।',
      'মেশিন সেফটি নিশ্চিত করতে নিডেল গার্ড (Needle Guard), আই গার্ড (Eye Guard) এবং পুলি কাভারের (Pulleys Cover) সঠিক অবস্থান ও কার্যকারিতা প্রতিদিন পরীক্ষা করা বাধ্যতামূলক।',
      'ঝুঁকিপূর্ণ কাজের ক্ষেত্রে বিশেষ সুরক্ষা: ব্যান্ড-নাইফ অপারেটরদের মেটাল গ্লোভস এবং স্পট-রিমুভিং কর্মীদের জন্য হ্যান্ড গ্লোভস, মাস্ক ও অ্যাপ্রন ব্যবহার নিশ্চিত করতে হবে।',
      'স্বাস্থ্য সুরক্ষা ও ঝুঁকি প্রতিরোধে থ্রেড সাকিং (Thread Sucking) অপারেটরদের ক্ষেত্রে মাস্ক এবং এয়ার-প্লাগ (Ear Plug) ব্যবহার বাধ্যতামূলক।',
      'পরিচ্ছন্ন ও স্বাস্থ্যকর কর্মপরিবেশ বজায় রাখতে হাউস-কিপিং (Housekeeping) এবং নিয়মিত বর্জ্য অপসারণ প্রক্রিয়া যথাযথভাবে অনুসরণ করতে হবে।',
      'যেকোনো জরুরি পরিস্থিতি মোকাবেলায় পর্যাপ্ত অগ্নিনির্বাপক সরঞ্জাম (Fire Extinguisher) সচল রাখা এবং প্রশিক্ষণপ্রাপ্ত ফায়ার-ফাইটার ও ফার্স্ট-এইডারদের উপস্থিতি নিশ্চিত করা হয়েছে।',
    ]} />;

    case 10: return <BulletList items={[
      'কর্মকালীন দুর্ঘটনায় আহত শ্রমিকের জরুরি ও প্রয়োজনীয় সকল চিকিৎসার ব্যয়ভার মালিক পক্ষ বহন করবে।',
      'দায়িত্ব পালনকালে দুর্ঘটনাজনিত মৃত্যু বা পেশাগত রোগে স্থায়ী অক্ষমতার ক্ষেত্রে আইনানুগ ক্ষতিপূরণ ও আর্থিক অনুদান নিশ্চিত করা হয়।',
      'চাকরিরত অবস্থায় কোনো শ্রমিকের মৃত্যু হলে তার মনোনীত ব্যক্তি বা উত্তরাধিকারীদের গ্রুপ বীমা ও কেন্দ্রীয় তহবিল হতে বিশেষ আর্থিক সুবিধা প্রদান করা হয়।',
      'শ্রমিক কল্যাণ তহবিলের আওতায় শ্রমিকদের মেধাবী সন্তানদের উচ্চশিক্ষার জন্য শিক্ষা-বৃত্তি এবং বিশেষ চিকিৎসা সহায়তা প্রদান করা হয়।',
      'সামাজিক নিরাপত্তা কর্মসূচির অংশ হিসেবে বিশেষায়িত হাসপাতালে চিকিৎসা এবং জরুরি পরিস্থিতিতে আর্থিক সুরক্ষা নিশ্চিত করা হয়েছে।',
      'শ্রম আইন ও বিধিমালা রেফারেন্স: বাংলাদেশ শ্রম আইন ২০০৬ এর ধারা ৮০, ৮১, ৮৯, ৯৯ এবং ১২৪ (ক) ও (খ) অনুযায়ী।',
    ]} />;

    case 11: return (
      <>
        <p style={{ fontSize: T.font.md, color: '#3d4f63', lineHeight: 1.8, marginBottom: '14px', textAlign: 'justify' }}>
          আমাদের প্রতিষ্ঠানে <strong>'জিরো টলারেন্স'</strong> নীতি অনুসরণ করে সকল প্রকার ঘুষ, দুর্নীতি ও অনৈতিক লেনদেন সম্পূর্ণ নিষিদ্ধ করা হয়েছে। আমরা একটি স্বচ্ছ ও জবাবদিহিমূলক কর্মসংস্কৃতি বজায় রাখতে প্রতিশ্রুতিবদ্ধ, যেখানে সততা এবং পেশাদার নৈতিকতাকে সর্বোচ্চ গুরুত্ব প্রদান করা হয়।
        </p>
        <AlertBox color="#e11d48" icon="⚠️" title="সতর্কীকরণ ও শাস্তিমূলক ব্যবস্থা:">
          যদি কোনো কর্মকর্তা বা কর্মচারীর বিরুদ্ধে ঘুষ বা দুর্নীতির প্রত্যক্ষ বা পরোক্ষ সম্পৃক্ততা প্রমাণিত হয়, তবে বাংলাদেশ শ্রম আইন ২০০৬ (সংশোধিত ২০২৫) এবং প্রতিষ্ঠানের শৃঙ্খলা বিধি অনুযায়ী তাকে তাৎক্ষণিক বরখাস্তসহ কঠোর আইনি পদক্ষেপ গ্রহণ করা হবে।
        </AlertBox>
      </>
    );

    case 12: return (
      <>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', marginBottom: '12px', lineHeight: 1.75 }}>
          নিম্নোক্ত সংরক্ষিত এলাকায় প্রবেশ নিষেধ। প্রবেশ করতে হলে কর্তৃপক্ষের আবেদনের সাপেক্ষে প্রবেশ করতে হবে।
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {['ওয়্যার হাউজ', 'ফিনিশড গোডাউন', 'বন্ডেড ওয়্যার হাউজ', 'ক্যামিক্যাল রুম', 'ব্যান্ড নাইফ রুম', 'ফায়ার পাম্প রুম', 'জেনারেটর রুম', 'বয়লার রুম'].map((a, i) => (
            <span key={i} style={{
              display: 'inline-block', padding: '4px 11px',
              borderRadius: T.radius.full, background: '#fef2f2',
              border: '1px solid #fca5a5', color: '#991b1b',
              fontSize: T.font.sm, fontWeight: T.weight.semi,
            }}>{a}</span>
          ))}
        </div>
      </>
    );

    case 13: return (
      <>
        <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.8, textAlign: 'justify', marginBottom: '14px' }}>
          কারখানার নিরাপত্তা ও সম্পদের সুরক্ষা নিশ্চিত করতে আমরা প্রতিশ্রুতিবদ্ধ। যদি কোনো সচেতন কর্মী কারখানার অভ্যন্তরে ধারালো সরঞ্জাম (ছুরি, সুঁচ ইত্যাদি), মাদকদ্রব্য, পান, বিস্ফোরক বা দাহ্য পদার্থের অনুপ্রবেশ কিংবা <strong>কারখানার মালামাল বা পণ্য চুরির (Theft of goods)</strong> মতো অনৈতিক কর্মকাণ্ড সম্পর্কে সঠিক তথ্য প্রদান করেন, তবে তাকে প্রতিষ্ঠানের পক্ষ থেকে বিশেষ <strong>'নিরাপত্তা পুরস্কার'</strong> প্রদান করা হবে।
        </p>
        <AlertBox color="#d97706" icon="🔒" title="তথ্যদাতার সুরক্ষা ও গোপনীয়তা:">
          তথ্যদাতার পরিচয় সম্পূর্ণ গোপন রাখা হবে এবং চুরি বা অনৈতিক কাজে সম্পৃক্তদের বিরুদ্ধে বাংলাদেশ শ্রম আইন ও দেশের প্রচলিত ফৌজদারি আইন অনুযায়ী কঠোর ব্যবস্থা গ্রহণ করা হবে।
        </AlertBox>
      </>
    );

    case 14: return (
      <>
        <BulletList items={[
          'অগ্নিকাণ্ড, ভূমিকম্প, বজ্রপাত বা যেকোনো প্রাকৃতিক ও মানবসৃষ্ট দুর্যোগের সময় আতঙ্কিত না হয়ে নিকটস্থ নিরাপদ জরুরি বহির্গমন পথ (Emergency Exit) ব্যবহার করুন।',
          'কারখানার ফ্লোর প্ল্যানে প্রদর্শিত বহির্গমন নকশা দেখে দ্রুততম সময়ে নিরাপদ সমাবেশ স্থানে (Assembly Point) পৌঁছানোর কৌশল রপ্ত করুন।',
        ]} />
        <AlertBox color="#0ea5e9" icon="⚠️" title="নিরাপত্তা মহড়া ও শৃঙ্খলা:">
          অগ্নি ও দুর্যোগকালীন ঝুঁকি হ্রাসে কারখানায় প্রতি মাসে <strong>নিরাপত্তা কমিটির সদস্যদের নেতৃত্বে</strong> নিয়মিত মহড়া (Mock Drill) আয়োজন করা হয়।
        </AlertBox>
        <div style={{ marginTop: '10px' }}>
          <BulletList items={[
            'দুর্যোগের সময় ফায়ার ফাইটিং, রেসকিউ এবং ফার্স্ট এইড টিমের সদস্যরা তাদের ওপর অর্পিত দায়িত্ব পালন করবেন।',
            'শ্রম আইন ও বিধিমালা অনুযায়ী আমরা আধুনিক অগ্নি নির্বাপক ব্যবস্থা এবং সার্বক্ষণিক প্রশিক্ষিত দল নিশ্চিত করেছি।',
          ]} />
        </div>
      </>
    );

    case 15: return (
      <>
        <InfoBox color="#dc2626" title="শারীরিক ও মানসিক হয়রানি নিষিদ্ধ (Zero Tolerance)" items={[
          'কর্মক্ষেত্রে কোনো শ্রমিককে শারীরিক আঘাত, অশালীন আচরণ বা মানসিকভাবে হেয় প্রতিপন্ন করা সম্পূর্ণ নিষিদ্ধ।',
          'ভয়ভীতি প্রদর্শন, গালিগালাজ বা ব্যক্তিগত মর্যাদাহানি ঘটে এমন যেকোনো মন্তব্য গুরুতর অসদাচরণ হিসেবে গণ্য হবে।',
          'টয়লেট ব্যবহার, বিশুদ্ধ পানি পান বা জরুরি প্রয়োজনে বিরতি গ্রহণে বাধা সৃষ্টি করা মানবাধিকার ও শ্রম আইনের লঙ্ঘন।',
        ]} />
        <InfoBox color="#7c3aed" title="যৌন হয়রানি ও সহিংসতা প্রতিরোধ (Gender-Based Violence)" items={[
          'হাইকোর্টের নির্দেশনা ও শ্রম বিধিমালা অনুযায়ী—শারীরিক স্পর্শ, যৌন ইঙ্গিতপূর্ণ ভাষা বা আচরণ এবং ব্ল্যাকমেইলিংয়ের বিরুদ্ধে কঠোর শাস্তিমূলক ব্যবস্থা নেওয়া হয়।',
          'চাকরির প্রলোভন দেখিয়ে বা পদোন্নতির ভয় দেখিয়ে কোনো প্রকার অনৈতিক সুবিধা দাবি করা আইনত দণ্ডনীয় অপরাধ।',
          'প্রতিটি অভিযোগ তদন্তে কারখানায় একটি শক্তিশালী "অভিযোগ কমিটি" (Grievance Committee) সার্বক্ষণিক কার্যকরী রয়েছে।',
        ]} />
        <AlertBox color="#dc2626" icon="⚖️" title="শাস্তিমূলক ব্যবস্থা:">
          যদি কোনো কর্মকর্তা বা শ্রমিকের বিরুদ্ধে হয়রানির সত্যতা প্রমাণিত হয়, তবে তার বিরুদ্ধে অপরাধের ধরণ অনুযায়ী তাৎক্ষণিক ব্যবস্থা গ্রহণ বা প্রচলিত ফৌজদারি আইনে সোপর্দ করা হবে।
        </AlertBox>
      </>
    );

    case 16: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="⚖️ বৈষম্যহীন কর্মপরিবেশ নীতিমালা:" accent="#64748b">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            নিয়োগ, বেতন, সুবিধাদি, পদোন্নতি, কাজের পরিবেশ রক্ষা, শৃঙ্খলা রক্ষা এবং চাকুরীর অবসান ইত্যাদি ক্ষেত্রে <strong>জাতীয়তা, সামাজিক ও রাজনৈতিক পরিচিতি, মাতৃত্বকালীন অবস্থা, প্রতিবন্ধকতা, জাতি, ধর্ম, বর্ণ, গোষ্ঠী, লিঙ্গ, বৈবাহিক অবস্থা, গায়ের রঙ, বয়স বা আত্মীয়তার</strong> ওপর নির্ভর করে কোনো বৈষম্য করা হয় না। এ লক্ষ্যে আমরা বিভিন্ন সচেতনতামূলক কার্যক্রম পরিচালনা করি।
          </p>
        </SectionCard>
        <SectionCard title="🛡️ জবরদস্তিমূলক শ্রম বিরোধী অবস্থান:" accent="#334155">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            আমরা জবরদস্তিমূলক শ্রম বিরোধী নীতিমালা বাস্তবায়নে বদ্ধপরিকর এবং আইন অনুযায়ী যথাযথ ব্যবস্থা গ্রহণ করি। <strong>বলপূর্বক শ্রম, রুদ্ধ শ্রম এবং চুক্তিবদ্ধ শ্রম</strong> কোনোভাবেই গ্রহণ অথবা সমর্থন করা হয় না। কর্তৃপক্ষ প্রতিটি ব্যক্তির স্বাধীনতায় কোনো রূপ হস্তক্ষেপ করে না।
          </p>
        </SectionCard>
      </div>
    );

    case 17: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <SectionCard title="অভিযোগ প্রতিকারের চেইন অফ কমান্ড:" accent="#64748b">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { level: 'ধাপ ১', role: 'লাইন সুপারভাইজার / ফ্লোর ম্যানেজার', desc: 'কাজের পরিবেশ বা উৎপাদন সংক্রান্ত যেকোনো তাৎক্ষণিক সমস্যার জন্য।' },
              { level: 'ধাপ ২', role: 'ওয়েলফেয়ার অফিসার / এইচআর অফিসার', desc: 'ব্যক্তিগত সমস্যা, ছুটি বা কোনো হয়রানির অভিযোগের জন্য।' },
              { level: 'ধাপ ৩', role: 'ফ্যাক্টরি হেড / এইচআর-কমপ্লায়েন্স ম্যানেজার', desc: 'গুরুতর অভিযোগ বা পূর্ববর্তী ধাপে সমাধান না পাওয়া সমস্যার জন্য।' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: T.font.xs, background: '#1e293b', color: '#fff',
                  padding: '2px 8px', borderRadius: T.radius.sm, fontWeight: T.weight.bold,
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>{item.level}</span>
                <div style={{ fontSize: T.font.sm, color: '#3d4f63', lineHeight: 1.5 }}>
                  <strong>{item.role}:</strong> {item.desc}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {profile.hotlines.filter((_, i) => [0, 1].includes(i)).map((h, i) => (
            <a key={i} href={`tel:${h.number}`} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderLeft: '3px solid #1d4ed8', borderRadius: T.radius.lg,
              padding: '13px 16px', textDecoration: 'none',
            }}>
              <div style={{ background: '#1d4ed8', color: '#fff', padding: '8px', borderRadius: '50%', display: 'flex', flexShrink: 0 }}>
                <FaPhone style={{ fontSize: '13px' }} />
              </div>
              <div>
                <div style={{ fontSize: T.font.xs, color: '#1d4ed8', fontWeight: T.weight.bold, textTransform: 'uppercase', marginBottom: '2px' }}>গোপন ও জরুরি হটলাইন | {h.label}</div>
                <div style={{ fontSize: '18px', fontWeight: T.weight.black, color: '#0f172a' }}>{h.number}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );

    case 18: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SectionCard title="" accent="#0f172a">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            আমাদের এইচআর বিজনেস প্রিন্সিপাল আন্তর্জাতিক শ্রম সংস্থা (ILO) এবং বৈশ্বিক কমপ্লায়েন্স মানদণ্ড অনুযায়ী পরিচালিত। আমরা <strong>মানবাধিকার রক্ষা, কর্মক্ষেত্রে বৈষম্য দূরীকরণ এবং নৈতিক ব্যবসায়িক আচরণ</strong> নিশ্চিত করতে অঙ্গীকারবদ্ধ।
          </p>
        </SectionCard>
        <GridCards items={[
          { t: 'কৌশলগত সমন্বয়', d: 'ব্যবসায়িক লক্ষ্য ও জনবল সমন্বয়' },
          { t: 'নৈতিক নেতৃত্ব', d: 'স্বচ্ছতা ও জবাবদিহিতা নিশ্চিতকরণ' },
          { t: 'প্রতিভার উৎকর্ষতা', d: 'দক্ষতা বৃদ্ধি ও ক্যারিয়ার প্ল্যানিং' },
          { t: 'কর্মীর কল্যাণ', d: 'নিরাপত্তা ও মানসিক স্বাস্থ্য সুরক্ষা' },
        ]} />
        <AlertBox color="#1d4ed8" icon="" title="অঙ্গীকার:">
          আমরা বিশ্বাস করি একজন দক্ষ এবং সন্তুষ্ট কর্মীই প্রতিষ্ঠানের সাফল্যের চাবিকাঠি। তাই আমরা <strong>"People First"</strong> নীতিতে বিশ্বাসী।
        </AlertBox>
      </div>
    );

    case 19: return <BulletList items={[
      'আইএলও কনভেনশন (C138 ও C182) এবং বাংলাদেশ শ্রম আইন ২০০৬ (সংশোধিত ২০২৫ অধ্যাদেশ) অনুযায়ী আমাদের প্রতিষ্ঠানে শিশু শ্রম সম্পূর্ণ নিষিদ্ধ।',
      'নিয়োগের ক্ষেত্রে জিরো-টলারেন্স নীতি অনুসরণপূর্বক ১৪ বছরের কম বয়সী কোনো শিশুকে নিয়োগ প্রদান করা হয় না।',
      'ভুলক্রমে, ১৮ বছরের কম বয়সী কিশোর শ্রমিক নিয়োগ হয়ে গেলে আইনের কঠোর বাধ্যবাধকতা মেনে কেবল ঝুঁকিমুক্ত কাজে নিয়োজিত করা এবং শিশুশ্রম প্রতিকার নীতি অনুসরণ করা হয়।',
    ]} />;

    case 20: return (
      <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.8, textAlign: 'justify' }}>
        বাংলাদেশ শ্রম আইন ২০০৬ (ধারা ২৩, ২৪ ও ২৫) এবং আন্তর্জাতিক কমপ্লায়েন্স স্ট্যান্ডার্ড অনুযায়ী কারখানার শৃঙ্খলা ও উৎপাদনশীলতা বজায় রাখতে আমরা একটি স্বচ্ছ ও ন্যায়নিষ্ঠ শাস্তিমূলক নীতিমালা অনুসরণ করি। আমাদের মূল লক্ষ্য হলো কর্মস্থলে অসদাচরণ রোধ এবং একটি ইতিবাচক ও নিরাপদ কাজের পরিবেশ নিশ্চিত করা। কোনো শ্রমিকের বিরুদ্ধে অভিযোগ উত্থাপিত হলে আমরা আত্মপক্ষ সমর্থনের পূর্ণ সুযোগ ও নিরপেক্ষ তদন্তের মাধ্যমে যথাযথ আইনি প্রক্রিয়া (Due Process) প্রতিপালন করি।
      </p>
    );

    case 21: return (
      <>
        <div style={{ fontWeight: T.weight.bold, fontSize: T.font.sm, color: '#991b1b', marginBottom: '8px', textTransform: 'uppercase' }}>অসদাচরণ সমূহ:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
          {[
            'আদেশ মানার ক্ষেত্রে এককভাবে বা অন্যের সঙ্গে সংঘবদ্ধ হইয়া ইচ্ছাকৃতভাবে অবাধ্যতা',
            '** চুরি, আত্মসাৎ, প্রতারণা বা অসাধুতা',
            'চাকুরির সংক্রান্ত ঘুষ গ্রহণ ও প্রদান',
            'বিনা ছুটিতে অভ্যাসগত অনুপস্থিতি অথবা ছুটি না নিয়া এক সঙ্গে দশ দিনের অধিক সময় অনুপস্থিতি',
            'অভ্যাসগত বিলম্বে অনুপস্থিতি',
            'প্রতিষ্ঠানে প্রযোজ্য কোন আইন, বিধি বা প্রবিধানের অভ্যাসগত লঙ্ঘন',
            '** প্রতিষ্ঠানে উচ্ছৃংখলতা, দাংগা-হাংগামা, অগ্নিসংযোগ বা ভাংচুর',
            'কাজে-কর্মে অভ্যাসগত গাফিলতি',
            'প্রধান পরিদর্শক কর্তৃক অনুমোদিত চাকুরী সংক্রান্ত, শৃঙ্খলা বা আচরণসহ, যে কোন বিধির অভ্যাসগত লঙ্ঘন',
            'মালিকের অফিসিয়াল রেকর্ডের রদবদল, জালকরণ, অন্যায় পরিবর্তন, উহার ক্ষতিকরণ বা উহা হারাইয়া ফেলা।',
          ].map((item, i) => (
            <div key={i} style={{
              background: '#fff7ed', border: '1px solid #fed7aa',
              borderRadius: T.radius.md, padding: '7px 10px',
              fontSize: T.font.sm, color: '#9a3412', lineHeight: 1.45,
            }}>{item}</div>
          ))}
        </div>
        <div style={{ fontWeight: T.weight.bold, fontSize: T.font.sm, color: '#991b1b', marginBottom: '8px', textTransform: 'uppercase' }}>শাস্তিমূলক ব্যবস্থা:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {[
            'চাকুরী থেকে অপসারণ',
            'নীচের পদে/গ্রেডে আনয়ন (১ বছর পর্যন্ত)',
            'পদোন্নতি বন্ধ (১ বছর পর্যন্ত)',
            'মজুরি বৃদ্ধি বন্ধ (১ বছর পর্যন্ত)',
            'জরিমানা',
            'বিনা মজুরীতে বা বিনা খোরাকীতে সাময়িক বরখাস্ত (৭ দিন পর্যন্ত)',
            'ভর্ৎসনা ও সতর্কীকরণ',
          ].map((item, i) => (
            <div key={i} style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: T.radius.md, padding: '7px 10px',
              fontSize: T.font.sm, color: '#991b1b', lineHeight: 1.45,
            }}>{item}</div>
          ))}
        </div>
      </>
    );

    case 22: return (
      <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.8, textAlign: 'justify' }}>
        "আন্তর্জাতিক শ্রম সংস্থার (ILO) ১৮৯ নং কনভেনশন অনুযায়ী, অভিবাসী গৃহকর্মী বলতে এমন ব্যক্তিকে বোঝায় যিনি নিজের ও পরিবারের অর্থনৈতিক সমৃদ্ধি এবং উজ্জ্বল ভবিষ্যতের প্রত্যাশায় এক অঞ্চল হতে অন্য অঞ্চলে স্থানান্তরিত হয়ে কর্মে নিয়োজিত হন। আমাদের প্রতিষ্ঠান সকল প্রচলিত আইন ও নীতিমালা কঠোরভাবে অনুসরণপূর্বক অভিবাসী স্বদেশী শ্রমিকদের নিয়োগ ও তাদের অধিকার সুরক্ষায় অঙ্গীকারবদ্ধ।"
      </p>
    );

    case 23: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="" accent="#b91c1c">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            গ্লোবাল কমপ্লায়েন্স মানদণ্ড অনুযায়ী, কর্তৃপক্ষের <strong>পূর্বানুমতি ব্যতিরেকে</strong> কোনো প্রকার সাব-কন্ট্রাক্ট প্রদান সম্পূর্ণ নিষিদ্ধ। আমরা আমাদের ক্রেতা এবং স্থানীয় আইনের প্রতি শ্রদ্ধাশীল থেকে শতভাগ স্বচ্ছতা বজায় রাখি।
          </p>
        </SectionCard>
        {[
          { title: 'আইনি অনুমোদন', desc: 'যেকোনো সাব-কন্ট্রাক্টের পূর্বে অবশ্যই বায়ার এবং যথাযথ কর্তৃপক্ষের লিখিত অনুমোদন থাকতে হবে।' },
          { title: 'কমপ্লায়েন্স অডিটিং', desc: 'অনুমোদিত সাব-কন্ট্রাক্টর ফ্যাক্টরিকেও মূল ফ্যাক্টরির মতো একই শ্রম আইন ও নিরাপত্তা মানদণ্ড মানতে হবে।' },
          { title: 'নিষিদ্ধ কার্যক্রম', desc: 'হোম-ওয়ার্কিং বা অনিবন্ধিত কোনো ইউনিটে উৎপাদন কাজ পরিচালনা করা কঠোরভাবে নিষিদ্ধ।' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '3px' }}>{item.title}</div>
            <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#991b1b', fontWeight: T.weight.bold }}>
            সতর্কতা: অননুমোদিত সাব-কন্ট্রাক্ট জিরো টলারেন্স নীতিমালার অন্তর্ভুক্ত।
          </div>
        </div>
      </div>
    );

    case 24: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="" accent="#047857">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            আইএলও কনভেনশন এবং বাংলাদেশ শ্রম আইন অনুযায়ী, আমরা কর্মীদের <strong>সংগঠনের স্বাধীনতা ও যৌথ দরকষাকষির</strong> অধিকারকে পূর্ণ সম্মান জানাই। কর্মীরা তাদের স্বার্থ রক্ষায় আইনানুগভাবে সংগঠন করার পূর্ণ অধিকার রাখেন।
          </p>
        </SectionCard>
        {[
          { title: 'সংগঠিত হওয়ার আইনি অধিকার', desc: 'শ্রমিকরা কোনো প্রকার পূর্বানুমতি ছাড়াই আইন অনুযায়ী ইউনিয়ন বা অংশগ্রহণকারী কমিটি গঠন ও তাতে যোগদানের অধিকার রাখেন।' },
          { title: 'বৈষম্যহীনতা', desc: 'ইউনিয়ন সংশ্লিষ্টতা বা সংগঠনের কার্যক্রমের কারণে কোনো কর্মীকে বরখাস্ত, বৈষম্য বা হয়রানি করা হয় না।' },
          { title: 'কার্যকর যোগাযোগ', desc: 'ম্যানেজমেন্টের সাথে সরাসরি আলোচনার জন্য একটি উন্মুক্ত এবং স্বচ্ছ পরিবেশ নিশ্চিত করা হয়।' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '3px' }}>{item.title}</div>
            <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
        <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#065f46', fontWeight: T.weight.bold }}>
            প্রতিজ্ঞা: আমরা একটি সুশৃঙ্খল শিল্প সম্পর্ক বজায় রাখতে বদ্ধপরিকর।
          </div>
        </div>
      </div>
    );

    case 25: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="লিঙ্গ সমতা ও অন্তর্ভুক্তিমূলক কর্মপরিবেশ" accent="#7c3aed">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            আমরা বিশ্বাস করি কর্মক্ষেত্রে সক্ষমতাই একজন কর্মীর প্রধান পরিচয়। লিঙ্গভেদে কোনো প্রকার বৈষম্য না করে <strong>নারী ও পুরুষ উভয়কে সমান সুযোগ, মর্যাদা এবং অধিকার</strong> প্রদান নিশ্চিত করা আমাদের মূল লক্ষ্য।
          </p>
        </SectionCard>
        <div>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase' }}>আমাদের প্রতিশ্রুতি ও পদক্ষেপসমূহ</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
            {[
              { t: 'সমান মজুরি', d: 'একই ধরনের কাজের জন্য নারী ও পুরুষ উভয়ের সমান বেতন ও সুবিধা নিশ্চিত করা।' },
              { t: 'নিয়োগে অগ্রাধিকার', d: 'যোগ্যতার ভিত্তিতে স্বচ্ছ নিয়োগ প্রক্রিয়া এবং জেন্ডার ভারসাম্য বজায় রাখা।' },
              { t: 'উচ্চতর পদে সুযোগ', d: 'সুপারভাইজার বা ম্যানেজারিয়াল পদে নারীদের অংশগ্রহণ উৎসাহিত করা।' },
              { t: 'মাতৃত্বকালীন সুবিধা', d: 'আইন অনুযায়ী মাতৃত্বকালীন ছুটি এবং কাজে ফেরার পর সুরক্ষা নিশ্চিত করা।' },
              { t: 'হয়রানি মুক্তি', d: 'যৌন হয়রানি ও লিঙ্গভিত্তিক সহিংসতার বিরুদ্ধে জিরো টলারেন্স নীতি।' },
              { t: 'সচেতনতা ও প্রশিক্ষণ', d: 'লিঙ্গ সংবেদনশীলতা বাড়াতে নিয়মিত প্রশিক্ষণ ও কর্মশালার আয়োজন।' },
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#f5f3ff', padding: '9px 11px', borderRadius: T.radius.md, border: '1px solid #ddd6fe' }}>
                <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#7c3aed', marginBottom: '2px' }}>{item.t}</div>
                <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
        {[
          { title: 'অভিযোগ ও প্রতিকার', desc: 'লিঙ্গ বৈষম্য সংক্রান্ত কোনো অভিযোগ দ্রুত ও নিরপেক্ষভাবে সমাধানের জন্য কার্যকর কমিটি (যেমন: এন্টি-হ্যারাসমেন্ট কমিটি) সক্রিয় রাখা।' },
          { title: 'পেশাগত মর্যাদা', desc: 'কর্মক্ষেত্রে ভাষা ব্যবহার থেকে শুরু করে আচরণে নারী-পুরুষের পারস্পরিক সম্মান নিশ্চিত করা।' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '3px' }}>{item.title}</div>
            <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#7c3aed', fontWeight: T.weight.black }}>
            "যেখানে সমতা আছে, সেখানেই টেকসই সমৃদ্ধি নিশ্চিত হয়।"
          </div>
        </div>
      </div>
    );

    case 26: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="" accent="#0f172a">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            ক্রেতার নিরাপত্তা নিশ্চিত করতে এবং পণ্যের গুণগত মান বজায় রাখতে আমরা কঠোর <strong>মেটাল কন্ট্রোল পলিসি</strong> অনুসরণ করি। কারখানার ভেতরে প্রতিটি শার্প মেটাল (সুই, কাঁচি, ব্লেড) এবং ধাতব ট্রিমসের সঠিক হিসাব রাখা আমাদের অগ্রাধিকার।
          </p>
        </SectionCard>
        <div>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase' }}>গার্মেন্টস ম্যানুফ্যাকচারিং প্রোটোকল</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
            {[
              { t: 'সুই কন্ট্রোল (Needle)', d: 'সুই ভাঙলে অবশ্যই তার সকল অংশ (Full Parts) খুঁজে বের করে লগে এন্ট্রি করতে হবে।' },
              { t: 'মেটাল ডিটেকশন', d: 'প্যাকিংয়ের আগে প্রতিটি পণ্য ৯-পয়েন্ট ক্যালিব্রেশন সম্পন্ন মেটাল ডিটেক্টর মেশিনে পাস করা।' },
              { t: 'কাঁচি ও ব্লেড সেফটি', d: 'প্রতিটি কাঁচি এবং ক্লিপার চেইন বা কর্ডের মাধ্যমে টেবিলের সাথে আবদ্ধ রাখা বাধ্যতামূলক।' },
              { t: 'টুল কিট বক্স', d: 'মেকানিকদের প্রতিটি টুলস নির্দিষ্ট কিট বক্সের ভেতরে নাম্বারিং করে রাখতে হবে।' },
              { t: 'ধাতব ট্রিমস পরীক্ষা', d: 'বাটন, জিপার বা রিভেট ব্যবহারের আগে নিকেল-ফ্রি এবং নন-ফেরাস কিনা তা নিশ্চিত করা।' },
              { t: 'ডিটেক্টর ক্রমাঙ্কন', d: 'প্রতি ১-৩ ঘণ্টা অন্তর ডিটেক্টর মেশিনের সংবেদনশীলতা (Sensitivity) চেক করা।' },
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#f1f5f9', padding: '9px 11px', borderRadius: T.radius.md, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#0f172a', marginBottom: '2px' }}>{item.t}</div>
                <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
        {[
          { title: 'ব্রোকেন নিডেল রেকর্ড', desc: 'ভাঙা সুইয়ের রেকর্ড বুক এবং সংগৃহীত ভাঙা অংশগুলো যথাযথভাবে সংরক্ষণ করা (Audit Requirement)।' },
          { title: 'অনিষিদ্ধ ধাতব বর্জন', desc: 'প্রডাকশন ফ্লোরে স্ট্যাপলার পিন, সেফটি পিন বা আলপিন ব্যবহার কঠোরভাবে নিষিদ্ধ।' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '3px' }}>{item.title}</div>
            <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#0f172a', fontWeight: T.weight.black }}>
            "আপনার ছোট একটি অবহেলা (যেমন: একটি পিন) বায়ারের বড় ক্ল্যাম বা পণ্য বাতিলের কারণ হতে পারে।"
          </div>
        </div>
      </div>
    );

    case 27: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="এইচআইভি এবং এইডস: মূল পার্থক্য" accent="#e11d48">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.65, margin: 0 }}>
              <strong>১. এইচআইভি (HIV):</strong> এটি একটি ভাইরাস (Human Immunodeficiency Virus)। এটি শরীরে প্রবেশ করে রোগ প্রতিরোধ ক্ষমতা বা টি-সেল (T-cells) ধ্বংস করতে থাকে। এইচআইভি পজিটিভ হওয়া মানেই এইডস নয়।
            </p>
            <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.65, margin: 0 }}>
              <strong>২. এইডস (AIDS):</strong> এটি এইচআইভি সংক্রমণের চূড়ান্ত ও গুরুতর পর্যায় (Acquired Immunodeficiency Syndrome)। যখন প্রতিরোধ ক্ষমতা একদম ভেঙে পড়ে, তখন শরীর আর কোনো রোগ মোকাবিলা করতে পারে না, তাকে এইডস বলা হয়।
            </p>
          </div>
        </SectionCard>

        <div>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', textAlign: 'center' }}>প্রকৃত তথ্য: যা থেকে সংক্রমণের ভয় নেই</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {[
              { t: 'সামাজিক মেলামেশা', d: 'স্পর্শ, হ্যান্ডশেক বা কোলাকুলিতে ছড়ায় না' },
              { t: 'খাবার ও পানি', d: 'একই থালা-বাসন বা গ্লাসে ছড়ায় না' },
              { t: 'ব্যবহার্য সামগ্রী', d: 'আক্রান্তের ফোন বা কাপড় ব্যবহারে নিরাপদ' },
              { t: 'টয়লেট সুবিধা', d: 'একই টয়লেট বা শাওয়ার ব্যবহারে ঝুঁকি নেই' },
              { t: 'মশা বা পতঙ্গ', d: 'মশা বা রক্তচোষা পতঙ্গের মাধ্যমে ছড়ায় না' },
              { t: 'বাতাস বা লালা', d: 'হাঁচি, কাশি বা চোখের জলে এটি ছড়ায় না' },
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#fff1f2', padding: '7px 8px', borderRadius: T.radius.md, border: '1px solid #ffe4e6', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: T.weight.bold, color: '#e11d48', marginBottom: '2px' }}>{item.t}</div>
                <div style={{ fontSize: '12px', color: '#5a6b7e', lineHeight: 1.3 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1e293b', marginBottom: '8px' }}>কর্মক্ষেত্রে অধিকার ও সুরক্ষা নীতিমালা</div>
          {[
            { title: 'চাকরির স্থায়িত্ব ও নিয়োগ', desc: 'শারীরিক সক্ষমতা থাকলে কাউকে এইডস-এর কারণে ছাঁটাই করা যাবে না এবং নিয়োগের শর্ত হিসেবে এইচআইভি পরীক্ষা নিষিদ্ধ।' },
            { title: 'তথ্য গোপনীয়তা (Privacy)', desc: 'আক্রান্ত কর্মীর পরিচয় ও স্বাস্থ্যের তথ্য সম্পূর্ণ গোপন রাখা প্রতিষ্ঠানের আইনি বাধ্যবাধকতা।' },
            { title: 'বৈষম্যহীন আচরণ (Equality)', desc: 'পদোন্নতি, প্রশিক্ষণ বা বাৎসরিক সুবিধায় আক্রান্ত কর্মীর সাথে বৈষম্য করা জিরো-টলারেন্স অপরাধ।' },
          ].map((item, idx) => (
            <div key={idx} style={{ padding: '9px 12px', background: '#f8fafc', borderRadius: T.radius.md, borderLeft: `3px solid #e11d48`, marginBottom: '6px' }}>
              <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '2px' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: '#5a6b7e', lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#b91c1c', fontWeight: T.weight.black }}>
            "আপনার সচেতনতা ও মানবিক ব্যবহার একজন আক্রান্ত সহকর্মীকে সুস্থ ও আত্মবিশ্বাসী জীবন দিতে পারে।"
          </div>
        </div>
      </div>
    );

    case 28: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="ইর্গনোমিক্স (Ergonomics): সংজ্ঞা ও তাৎপর্য" accent="#0369a1">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            ইর্গনোমিক্স হলো একটি বৈজ্ঞানিক পদ্ধতি যা কর্মপরিবেশ, যন্ত্রপাতি এবং কাজের ধরণকে একজন কর্মীর শারীরিক ও মানসিক সক্ষমতা অনুযায়ী সাজানো নিশ্চিত করে। সহজ কথায়, এটি <strong>"কাজের সাথে কর্মীর শারীরিক সামঞ্জস্যবিধান"</strong> যাতে দীর্ঘমেয়াদী শারীরিক ক্ষতি রোধ করা যায় এবং কাজের উৎপাদনশীলতা বৃদ্ধি পায়।
          </p>
        </SectionCard>
        <div style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '6px' }}>আইনি ও আন্তর্জাতিক মানদণ্ড</div>
          <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.6 }}>
            • <strong>বাংলাদেশ শ্রম বিধিমালা ২০১৫:</strong> বিধি অনুযায়ী কর্মক্ষেত্রে পর্যাপ্ত আলো, বাতাস এবং কর্মীদের বসার জন্য আরামদায়ক ও পিঠের সাপোর্টযুক্ত আসন নিশ্চিত করা বাধ্যতামূলক।<br />
            • <strong>ILO ও ISO মানদণ্ড:</strong> আন্তর্জাতিক শ্রম সংস্থা (ILO) এবং ISO 6385 অনুযায়ী পেশাগত স্বাস্থ্য ও নিরাপত্তা (OHS) নিশ্চিত করতে ইর্গনোমিক ডিজাইন অনুসরণ করা অপরিহার্য।
          </div>
        </div>
        {[
          { title: 'সঠিক অঙ্গভঙ্গি ও আসন ব্যবস্থা', desc: 'দীর্ঘক্ষণ বসে কাজ করার ক্ষেত্রে উচ্চতা সামঞ্জস্যপূর্ণ চেয়ার এবং মাউস/কীবোর্ড সঠিক উচ্চতায় রাখা।' },
          { title: 'ম্যানুয়াল হ্যান্ডলিং ও নিরাপত্তা', desc: 'শ্রম আইন অনুযায়ী ভারী মালামাল বহনের সঠিক পদ্ধতি অনুসরণ এবং শারীরিক চাপ কমাতে যান্ত্রিক সহায়তা নেওয়া।' },
          { title: 'পেশী শিথিলকরণ ও বিরতি', desc: 'একই কাজ বারবার করার ফলে সৃষ্ট ক্লান্তি (Repetitive Strain) দূর করতে নির্দিষ্ট সময় পর পর পেশী শিথিলকরণ ব্যায়াম নিশ্চিত করা।' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '3px' }}>{item.title}</div>
            <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
        <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#0369a1', fontWeight: T.weight.bold }}>
            লক্ষ্য: স্বাস্থ্যসম্মত কর্মপরিবেশের মাধ্যমে পেশী ও কঙ্কালতন্ত্রের রোগ (MSD) মুক্ত একটি নিরাপদ কর্মস্থল গড়ে তোলা।
          </div>
        </div>
      </div>
    );

    case 29: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="" accent="#b91c1c">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            বাংলাদেশ শ্রম আইন ২০০৬-এর <strong>ধারা ৬৩</strong> অনুযায়ী, কারখানায় ব্যবহৃত প্রতিটি মেশিনের বিপজ্জনক অংশ অবশ্যই যথাযথ <strong>সেফটি গার্ড</strong> দ্বারা আবৃত থাকতে হবে। যান্ত্রিক দুর্ঘটনা প্রতিরোধে আমরা শতভাগ <strong>নিরাপদ কর্মপরিবেশ</strong> নিশ্চিত করতে অঙ্গীকারবদ্ধ।
          </p>
        </SectionCard>
        <div style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '6px' }}>আইনি এবং অডিট রেফারেন্স</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: T.font.sm, color: '#475569', lineHeight: 1.4 }}>• <strong>শ্রম আইন ২০০৬:</strong> চলন্ত মেশিনে সেফটি গার্ড ছাড়া কাজ করা বা মেরামত করা আইনত দণ্ডনীয়।</div>
            <div style={{ fontSize: T.font.sm, color: '#475569', lineHeight: 1.4 }}>• <strong>LOTO সিস্টেম:</strong> রক্ষণাবেক্ষণের সময় পাওয়ার সুইচ লক (Lock) এবং ট্যাগ (Tag) লাগানো বাধ্যতামূলক।</div>
          </div>
        </div>
        {[
          { title: 'প্রতিরক্ষামূলক গার্ড নিশ্চিতকরণ', desc: 'মেশিনে নিডেল গার্ড, আই গার্ড এবং বেল্ট গার্ড সঠিকভাবে সংযুক্ত আছে কিনা তা যাচাই করা।' },
          { title: 'জরুরি সুইচ বা ইমার্জেন্সি স্টপ', desc: 'বিপদকালীন সময়ে মেশিন দ্রুত বন্ধ করার জন্য ইমার্জেন্সি বাটন সবসময় কার্যকর রাখা।' },
          { title: 'প্রশিক্ষিত অপারেটর', desc: 'শুধুমাত্র দক্ষ এবং নির্দিষ্ট মেশিনে প্রশিক্ষণপ্রাপ্ত ব্যক্তিই মেশিন পরিচালনা করবেন।' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '3px' }}>{item.title}</div>
            <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
        <div style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#b91c1c', fontWeight: T.weight.black }}>
            সতর্কতা: সেফটি গার্ড খোলা অবস্থায় মেশিন চালানো "জিরো টলারেন্স" নীতিমালার লঙ্ঘন।
          </div>
        </div>
      </div>
    );

    case 30: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="" accent="#0891b2">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            আমরা বিশ্বাস করি প্রতিটি কর্মীর মতামত অত্যন্ত মূল্যবান। প্রতিষ্ঠানের উন্নতি এবং একটি সুন্দর কর্মপরিবেশ নিশ্চিত করতে আমরা একটি স্বচ্ছ এবং <strong>কার্যকর ফিডব্যাক ব্যবস্থা</strong> অনুসরণ করি, যেখানে ভয়হীনভাবে গঠনমূলক মতামত প্রদানের সুযোগ রয়েছে।
          </p>
        </SectionCard>
        <div>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase' }}>কিভাবে আপনার মতামত জানাবেন?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
            {[
              { t: 'যেকোনো সভা বা মিটিং', d: 'ফ্লোর মিটিং, ছোট দলগত আলোচনা বা মাসিক সাধারণ সভায় সরাসরি।' },
              { t: 'প্রশিক্ষণ সেশন', d: 'ট্রেনিং চলাকালীন ফিডব্যাক ফর্ম বা সরাসরি আলোচনার মাধ্যমে।' },
              { t: 'পরামর্শ বক্স', d: 'কারখানার নির্দিষ্ট স্থানে রাখা ড্রপ বক্সে নাম প্রকাশ না করে।' },
              { t: 'সরাসরি আলোচনা', d: 'আপনার সুপারভাইজার বা এইচআর কর্মকর্তার সাথে সরাসরি কথা বলে।' },
              { t: 'ডিজিটাল পোর্টাল', d: 'প্রতিষ্ঠানের অ্যাপ বা নির্ধারিত সফটওয়্যারের মাধ্যমে ফিডব্যাক প্রদান।' },
              { t: 'ওপেন ডোর পলিসি', d: 'ম্যানেজমেন্টের সাথে যেকোনো জরুরি প্রয়োজনে সরাসরি যোগাযোগ।' },
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '9px 11px', borderRadius: T.radius.md, border: '1px solid #e8edf3' }}>
                <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#0891b2', marginBottom: '2px' }}>{item.t}</div>
                <div style={{ fontSize: '12px', color: '#5a6b7e', lineHeight: 1.4 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
        {[
          { title: 'গোপনীয়তা ও সুরক্ষা', desc: 'মতামত প্রদানকারীর পরিচয় সম্পূর্ণ গোপন রাখা হয় এবং এর ফলে কর্মীর ওপর কোনো নেতিবাচক প্রভাব পড়ে না।' },
          { title: 'মূল্যায়ন ও সমাধান', desc: 'প্রতিটি গঠনমূলক ফিডব্যাক গুরুত্বের সাথে বিশ্লেষণ করা হয় এবং যৌক্তিক পরিবর্তনের চেষ্টা করা হয়।' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '3px' }}>{item.title}</div>
            <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
        <div style={{ background: '#ecfeff', border: '1px solid #cffafe', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#0891b2', fontWeight: T.weight.black }}>
            "আপনার প্রতিটি গঠনমূলক পরামর্শ আমাদের প্রতিষ্ঠানের সাফল্যের মূল চাবিকাঠি।"
          </div>
        </div>
      </div>
    );

    case 31: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SectionCard title="" accent="#16a34a">
          <p style={{ fontSize: T.font.base, color: '#3d4f63', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>
            জরুরি নিরাপত্তা প্রশিক্ষণের অংশ হিসেবে এই ট্যুরটি অত্যন্ত গুরুত্বপূর্ণ। একজন প্রশিক্ষণার্থী হিসেবে আপনি কারখানার <strong>নিরাপদ পথ, জরুরি বহির্গমন এবং অগ্নি নির্বাপক ব্যবস্থার</strong> সরাসরি অবস্থান সম্পর্কে বাস্তব জ্ঞান অর্জন করবেন।
          </p>
        </SectionCard>
        <div>
          <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase' }}>পরিদর্শনের সময় যা অবশ্যই লক্ষ্য করবেন</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
            {[
              { t: 'জরুরি নির্গমন পথ', d: 'ফ্লোরে থাকা এক্সিট (Exit) সাইন এবং সবুজ বাতি লক্ষ্য করা।' },
              { t: 'অ্যাসেম্বলি পয়েন্ট', d: 'বিপদকালীন সময়ে জমায়েত হওয়ার নির্দিষ্ট স্থানটি চিনে রাখা।' },
              { t: 'অগ্নি নির্বাপক যন্ত্র', d: 'ফায়ার এক্সটিংগুইসার এবং হোস পাইপ এর অবস্থান ও ব্যবহার দেখা।' },
              { t: 'প্রাথমিক চিকিৎসা', d: 'ফ্লোরে থাকা ফার্স্ট এইড বক্স এবং ওয়েলফেয়ার অফিসারের অবস্থান জানা।' },
              { t: 'হলুদ নিরাপত্তা লাইন', d: 'চলাচলের সময় সবসময় হলুদ লাইনের ভেতর দিয়ে হাঁটার নিয়ম মানা।' },
              { t: 'জরুরি সংকেত (Alarm)', d: 'ফায়ার অ্যালার্মের শব্দ এবং এটি বাজার পর করণীয় সম্পর্কে নিশ্চিত হওয়া।' },
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#f0fdf4', padding: '9px 11px', borderRadius: T.radius.md, border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#16a34a', marginBottom: '2px' }}>{item.t}</div>
                <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
        {[
          { title: 'সতর্ক পর্যবেক্ষণ', desc: 'মেশিন বা বৈদ্যুতিক প্যানেল থেকে নিরাপদ দূরত্ব বজায় রেখে পর্যবেক্ষণ করা।' },
          { title: 'প্রশ্ন ও পরিষ্কার ধারণা', desc: 'নিরাপত্তা বিষয়ক কোনো সন্দেহ থাকলে তাৎক্ষণিকভাবে প্রশিক্ষক বা সুপারভাইজারকে জিজ্ঞাসা করা।' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: T.radius.md, padding: '11px 14px' }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: '#1a2332', marginBottom: '3px' }}>{item.title}</div>
            <div style={{ fontSize: T.font.sm, color: '#5a6b7e', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
        <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: T.radius.md, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: T.font.sm, color: '#16a34a', fontWeight: T.weight.black }}>
            "আপনার সচেতনতাই আপনার এবং কারখানার প্রধান নিরাপত্তা।"
          </div>
        </div>
      </div>
    );

    case 32: return (
      <>
        <InfoBox color="#16a34a" title={`এনার্জি ও GHG লক্ষ্যমাত্রা (${c.environmentTargets.targetYear} সালের মধ্যে)`} items={[
          `শক্তি ব্যবহার ${c.environmentTargets.ghgReductionPct}% হ্রাস করা`,
          `GHG গ্যাস নিঃসরণ ${c.environmentTargets.ghgReductionPct}% হ্রাস করা`,
          'গ্যাস ও ডিজেল জেনারেটর এবং আর ই বি থেকে বিদ্যুৎ পাই',
        ]} />
        <InfoBox color="#0891b2" title={`পানি লক্ষ্যমাত্রা (${c.environmentTargets.targetYear} সালের মধ্যে)`} items={[
          `পানির ব্যবহার ${c.environmentTargets.waterReductionPct}% হ্রাস করা`,
          'পানি একটি স্বচ্ছ, স্বাদহীন, গন্ধহীন তরল পদার্থ',
        ]} />
        <InfoBox color="#7c3aed" title={`বর্জ্য ব্যবস্থাপনা লক্ষ্যমাত্রা (${c.environmentTargets.targetYear} সালের মধ্যে)`} items={[
          `বিপজ্জনক ও অ-বিপজ্জনক বর্জ্য ${c.environmentTargets.wasteReductionPct}% হ্রাস করা`,
          'বিপজ্জনক বর্জ্য: ইলেকট্রিক বর্জ্য, প্রিন্টার কার্টিজ এবং খালি কেমিক্যাল ড্রাম',
          'অ-বিপজ্জনক বর্জ্য: টেক্সটাইল বর্জ্য, কার্টুন, পলি ব্যাগ, কাগজ',
        ]} />
      </>
    );

    case 33: return <CalculatorHub />;
    case 34: return <FormulaReference />;
    case 35: return <EmployeeGrievancePortal />;

    default: return (
      <p style={{ color: '#94a3b8', fontSize: T.font.base, textAlign: 'center', padding: '24px 0' }}>
        তথ্য শীঘ্রই আসছে...
      </p>
    );
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WorkerGuidelineViewer() {
  const { activeFactoryId } = useAuth();
  const { factoryId: paramFactoryId } = useParams<{ factoryId: string }>();
  const resolvedFactoryId = paramFactoryId ?? activeFactoryId;
  const cfg = getGuidelineConfig(resolvedFactoryId);
  const factory = getFactoryById(resolvedFactoryId);
  const profile = factory.workerProfile;
  const activeTopics = getActiveTopics(factory);
  const show = (n: number) => activeTopics.has(n);
  const printRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const allocatedSections = SECTIONS.filter(s => show(s.id));

  const handleCardClick = (id: number) => {
    setActiveSection(prev => prev === id ? null : id);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleBack = () => {
    setActiveSection(null);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handlePrint = () => window.print();

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
      pdf.save(`worker-guideline-${cfg.factoryId}.pdf`);
    } catch {
      alert('PDF export failed. Please use Print instead.');
    }
  };

  const activeSectionDef = activeSection ? SECTIONS.find(s => s.id === activeSection) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;500;600;700;800&family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        /* ── Viewport — CRITICAL for Android sharpness ── */
        /* Injected via <meta> tag in index.html ideally, but also declared here */
        @viewport { width: device-width; zoom: 1.0; }

        /* ── Font Variables ── */
        :root {
          --font-latin: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          --font-bn: 'Noto Serif Bengali', serif;
          --font-mixed: 'Inter', 'Noto Serif Bengali', serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: var(--font-mixed);
          font-size: 15px;          /* base up from 14px — sharper on Android */
          line-height: 1.65;
          background: #eef2f7;
          color: #1a2332;
          /* Android: 'auto' gives sharper strokes than 'antialiased' */
          -webkit-font-smoothing: auto;
          -moz-osx-font-smoothing: auto;
          /* optimizeLegibility causes blur on complex Bengali glyphs — removed */
          text-rendering: optimizeSpeed;
          /* Prevent text size inflation on orientation change */
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }

        /* Bengali text gets Noto Serif Bengali */
        :lang(bn), [lang="bn"] { font-family: var(--font-bn); }

        /* Utility: force Latin numerals/labels sharp */
        .latin { font-family: var(--font-latin); }

        strong { font-weight: 700; color: inherit; }
        p { margin: 0; }
        button { font-family: var(--font-mixed); }

        .wg-root { max-width: 680px; margin: 0 auto; padding-bottom: 60px; }

        /* ── Top bar ── */
        .wg-topbar {
          position: sticky; top: 0; z-index: 100;
          background: #0f1e35;
          padding: 10px 16px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .wg-topbar-label {
          font-family: var(--font-latin);
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.025em;
        }
        .wg-topbar-actions { display: flex; gap: 6px; }
        .wg-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 6px; border: none;
          font-size: 11px; font-weight: 600; letter-spacing: 0.01em;
          cursor: pointer; transition: all 0.15s;
          font-family: var(--font-latin);
        }
        .wg-btn--ghost { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); }
        .wg-btn--ghost:hover { background: rgba(255,255,255,0.18); }
        .wg-btn--danger { background: #c0392b; color: #fff; }
        .wg-btn--danger:hover { background: #a93226; }

        /* ── Header ── */
        .wg-header {
          background: #0f1e35;
          padding: 22px 20px 36px;
          color: #fff; text-align: center;
        }
        .wg-logo {
          width: 60px; height: 60px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px; font-size: 26px; color: rgba(255,255,255,0.8);
        }
        /* Bengali factory name — Noto Serif Bengali */
        .wg-name {
          font-family: var(--font-bn);
          font-size: 22px;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 5px;
        }
        .wg-address {
          font-family: var(--font-bn);
          font-size: 14px;
          font-weight: 400;
          color: rgba(255,255,255,0.45);
          margin-bottom: 12px;
          line-height: 1.6;
        }
        .wg-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 999px; padding: 5px 15px;
          font-family: var(--font-bn);
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.65);
        }

        /* ── Panel shell ── */
        .wg-panel {
          background: #fff;
          margin: -16px 12px 14px;
          border-radius: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        /* ── Card grid ── */
        .wg-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px 10px;
          border-bottom: 1px solid #f0f4f8;
        }
        .wg-panel-title {
          font-family: var(--font-latin);
          font-size: 11px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .wg-see-all {
          background: #eff6ff; border: 1px solid #bfdbfe;
          color: #1d4ed8; border-radius: 6px; padding: 5px 13px;
          font-family: var(--font-bn);
          font-size: 13px; font-weight: 600; cursor: pointer;
          white-space: nowrap; flex-shrink: 0;
        }
        .wg-card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);  /* 3 cols default — wider cards, more room for labels */
          gap: 8px;
          padding: 12px;
        }
        @media (min-width: 480px) {
          .wg-card-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* ── Detail view ── */
        .wg-detail-topbar {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-bottom: 1px solid #f0f4f8;
        }
        .wg-back-btn {
          display: flex; align-items: center; gap: 5px;
          background: none; border: none; cursor: pointer;
          color: #94a3b8;
          font-family: var(--font-bn);
          font-size: 13px; font-weight: 500;
          padding: 0; flex-shrink: 0; transition: color 0.15s;
        }
        .wg-back-btn:hover { color: #1e40af; }
        .wg-sep { width: 1px; height: 18px; background: #e8edf3; flex-shrink: 0; }
        .wg-detail-icon { font-size: 17px; flex-shrink: 0; }
        .wg-detail-title {
          font-family: var(--font-bn);
          font-size: 15px; font-weight: 700; color: #1a2332;
          flex: 1; line-height: 1.4;
        }
        .wg-close-btn {
          background: none; border: none; cursor: pointer;
          color: #b0bcc8; display: flex; align-items: center; flex-shrink: 0; padding: 6px; transition: color 0.15s;
        }
        .wg-close-btn:hover { color: #5a6b7e; }

        .wg-nav-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 14px; border-bottom: 1px solid #f0f4f8;
          background: #fafbfc;
        }
        .wg-nav-btn {
          background: none; border: 1px solid #e8edf3; border-radius: 6px;
          padding: 6px 14px;
          font-family: var(--font-bn);
          font-size: 13px; font-weight: 500;
          transition: all 0.13s; cursor: pointer;
        }
        .wg-nav-btn:not(:disabled) { color: #3d4f63; }
        .wg-nav-btn:not(:disabled):hover { background: #f0f4f8; border-color: #c8d4e0; }
        .wg-nav-btn:disabled { color: #c8d4e0; cursor: not-allowed; }
        .wg-nav-count {
          font-family: var(--font-latin);
          font-size: 12px; font-weight: 500; color: #94a3b8;
        }

        .wg-detail-body { padding: 16px 16px 20px; }

        .wg-back-footer {
          padding: 12px 16px; border-top: 1px solid #f0f4f8;
          text-align: center; background: #fafbfc;
        }
        .wg-back-footer-btn {
          background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 9px 22px;
          font-family: var(--font-bn);
          font-size: 13px; font-weight: 600; color: #5a6b7e;
          cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; transition: all 0.13s;
        }
        .wg-back-footer-btn:hover { background: #e8edf3; }

        /* ── Expand all ── */
        .wg-expand-panel { background: #fff; border-radius: 16px; margin: -16px 12px 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.10); overflow: hidden; }
        .wg-expand-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid #f0f4f8; background: #fafbfc;
        }
        .wg-expand-title {
          font-family: var(--font-bn);
          font-size: 14px; font-weight: 700; color: #1a2332;
        }
        .wg-expand-close {
          background: none; border: 1px solid #e8edf3; border-radius: 6px;
          padding: 5px 12px;
          font-family: var(--font-bn);
          font-size: 13px; font-weight: 500; color: #7a8899; cursor: pointer;
        }
        .wg-section-block { border-bottom: 1px solid #f0f4f8; }
        .wg-section-block-head {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; background: #f8fafc;
          border-bottom: 1px solid #f0f4f8;
        }
        .wg-section-block-icon { font-size: 16px; flex-shrink: 0; }
        .wg-section-block-title {
          font-family: var(--font-bn);
          font-size: 14px; font-weight: 700; color: #1a2332;
        }
        .wg-section-block-body { padding: 14px 16px; }

        /* ── Footer ── */
        .wg-footer {
          background: #0f1e35; color: rgba(255,255,255,0.5);
          padding: 24px 20px; text-align: center;
          border-radius: 0 0 4px 4px;
          margin-top: 20px;
        }
        .wg-footer-heading {
          font-family: var(--font-bn);
          color: rgba(255,255,255,0.85);
          font-weight: 700; font-size: 14px;
          margin-bottom: 4px;
        }
        .wg-welfare-row {
          font-family: var(--font-bn);
          font-size: 13px; font-weight: 400;
          color: rgba(255,255,255,0.4); margin-bottom: 14px;
          line-height: 1.65;
        }
        .wg-hotline-chip {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px; padding: 10px 16px; color: #fff;
          text-decoration: none; margin: 0 auto 8px; max-width: 240px;
          transition: background 0.15s;
        }
        .wg-hotline-chip:hover { background: rgba(255,255,255,0.12); }
        .wg-hotline-label {
          font-family: var(--font-bn);
          font-size: 12px; font-weight: 400;
          color: rgba(255,255,255,0.4); margin-bottom: 2px;
        }
        .wg-hotline-num {
          font-family: var(--font-latin);
          font-size: 20px; font-weight: 800;
          color: #60a5fa; letter-spacing: -0.02em;
        }
        .wg-factory-info {
          font-family: var(--font-bn);
          color: rgba(255,255,255,0.5); margin-top: 16px;
          font-size: 13px; line-height: 1.7;
        }
        .wg-factory-name {
          font-family: var(--font-bn);
          color: rgba(255,255,255,0.8); font-weight: 700; font-size: 14px;
          margin-bottom: 2px;
        }
        .wg-dev-badge {
          display: flex; align-items: center; justify-content: center;
          margin-top: 16px; gap: 10px;
        }
        .wg-dev-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .wg-dev-text {
          font-family: var(--font-latin);
          font-size: 10px; font-style: italic; font-weight: 600;
          color: rgba(255,255,255,0.2); white-space: nowrap; letter-spacing: 0.05em;
        }

        /* ── Featured card pulse animation ── */
        @keyframes featuredPulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.55); }
          60%  { box-shadow: 0 0 0 6px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }

        @media print {
          .wg-topbar { display: none !important; }
          .wg-root { max-width: 100%; padding: 0 !important; }
          .wg-panel { display: none !important; }
          .wg-expand-panel { display: none !important; }
          body { background: #fff !important; }
          .wg-header { background: none !important; color: #000 !important; border: 2px solid #000; padding: 12px !important; }
          .wg-name { color: #000 !important; }
          .wg-address { color: #333 !important; }
          .wg-footer { background: none !important; color: #000 !important; border-top: 2px solid #000; }
          * { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Top bar */}
      <div className="wg-topbar">
        <div className="wg-topbar-label">🏭 {factory.nameEn} — Employee Guidelines</div>
        <div className="wg-topbar-actions">
          <button className="wg-btn wg-btn--ghost" onClick={handlePrint}>
            <FaPrint /> Print
          </button>
          <button className="wg-btn wg-btn--danger" onClick={handlePDF}>
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      <div className="wg-root" ref={printRef}>

        {/* Header */}
        <div className="wg-header">
          <div className="wg-logo"><FaIndustry /></div>
          <div className="wg-name">{factory.nameBn}</div>
          <div className="wg-address">{factory.addressBn}</div>
          <div className="wg-pill">
            <FaUserTie style={{ fontSize: '13px' }} /> শ্রমিক সহায়িকা
          </div>
        </div>

        {/* Content area */}
        {expandAll ? (

          <div className="wg-expand-panel">
            <div className="wg-expand-topbar">
              <span className="wg-expand-title">সব বিষয় ({activeTopics.size}টি)</span>
              <button className="wg-expand-close" onClick={() => setExpandAll(false)}>✕ ফিরে যান</button>
            </div>
            <div>
              {allocatedSections.map(sec => (
                <div key={sec.id} className="wg-section-block">
                  <div className="wg-section-block-head" style={{ borderLeft: `3px solid ${sec.color}` }}>
                    <span className="wg-section-block-icon" style={{ color: sec.color }}>{sec.icon}</span>
                    <span className="wg-section-block-title">{sec.id}। {sec.titleBn}</span>
                  </div>
                  <div className="wg-section-block-body">
                    <SectionContent id={sec.id} cfg={cfg} factory={factory} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : activeSection === null ? (

          <div className="wg-panel">
            <div className="wg-panel-header">
              <div>
                <span className="wg-panel-title">বিষয়সূচি — Topics</span>
              </div>
              <button className="wg-see-all" onClick={() => setExpandAll(true)}>⊞ সব বিষয়</button>
            </div>

            {/* Regular sections — 3/4-col grid */}
            <div className="wg-card-grid">
              {allocatedSections
                .filter(sec => !sec.featured)
                .map(sec => (
                  <MiniCard key={sec.id} section={sec} active={false} onClick={() => handleCardClick(sec.id)} />
                ))}
            </div>

            {/* Featured sections — full-width banners */}
            {allocatedSections.filter(sec => sec.featured).length > 0 && (
              <div style={{ padding: '0 12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 0 8px',
                }}>
                  <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }} />
                  <span style={{
                    fontSize: '10px', fontWeight: T.weight.bold,
                    fontFamily: T.fontLatin,
                    color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}>Featured</span>
                  <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }} />
                </div>
                {allocatedSections
                  .filter(sec => sec.featured)
                  .map(sec => (
                    <FeaturedCard key={sec.id} section={sec} onClick={() => handleCardClick(sec.id)} />
                  ))}
              </div>
            )}
          </div>

        ) : (

          <div className="wg-panel">
            {/* Detail header */}
            <div className="wg-detail-topbar" style={{ borderLeft: `3px solid ${activeSectionDef?.color}` }}>
              <button className="wg-back-btn" onClick={handleBack}>
                <FaChevronLeft size={9} /> সব বিষয়
              </button>
              <div className="wg-sep" />
              <span className="wg-detail-icon" style={{ color: activeSectionDef?.color }}>{activeSectionDef?.icon}</span>
              <span className="wg-detail-title">{activeSectionDef?.id}। {activeSectionDef?.titleBn}</span>
              <button className="wg-close-btn" onClick={handleBack}>
                <FaTimes size={13} />
              </button>
            </div>

            {/* Navigation bar */}
            {(() => {
              const navList = allocatedSections;
              const idx = navList.findIndex(s => s.id === activeSection);
              const hasPrev = idx > 0;
              const hasNext = idx < navList.length - 1;
              return (
                <div className="wg-nav-bar">
                  <button className="wg-nav-btn" onClick={() => hasPrev && setActiveSection(navList[idx - 1].id)} disabled={!hasPrev}>
                    ← আগের
                  </button>
                  <span className="wg-nav-count">{idx + 1} / {navList.length}</span>
                  <button className="wg-nav-btn" onClick={() => hasNext && setActiveSection(navList[idx + 1].id)} disabled={!hasNext}>
                    পরের →
                  </button>
                </div>
              );
            })()}

            {/* Content */}
            <div className="wg-detail-body">
              <SectionContent id={activeSection} cfg={cfg} factory={factory} />
            </div>

            {/* Footer nav */}
            <div className="wg-back-footer">
              <button className="wg-back-footer-btn" onClick={handleBack}>
                <FaChevronLeft size={9} /> সকল বিষয় দেখুন
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="wg-footer">
          <div className="wg-footer-heading">জরুরী প্রয়োজনে যোগাযোগ করুন</div>
          <div className="wg-welfare-row">
            {profile.welfareOfficers.map((w, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ margin: '0 6px', opacity: 0.3 }}>·</span>}
                {w.name} — {w.designation}
              </React.Fragment>
            ))}
          </div>

          <div className="wg-footer-heading" style={{ marginBottom: '12px' }}>হট লাইন নম্বর</div>
          {profile.hotlines.filter((_, i) => [1, 2, 3].includes(i)).map((h, i) => (
              <React.Fragment key={i}>
                <a href={`tel:${h.number}`} className="wg-hotline-chip" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FaPhone style={{ color: '#60a5fa', fontSize: '14px', flexShrink: 0, marginRight: '6px' }} />
                  <div>
                    <div className="wg-hotline-label">{h.label}</div>
                    <div className="wg-hotline-num">{h.number}</div>
                  </div>
                </a>
              </React.Fragment>
          ))}

          <div className="wg-factory-info">
            <div className="wg-factory-name">{factory.nameBn}</div>
            {factory.addressBn}
          </div>

          <div className="wg-dev-badge">
            <div className="wg-dev-line" />
            <span className="wg-dev-text">DEVELOPED BY: SK-TECH</span>
            <div className="wg-dev-line" />
          </div>
        </div>
      </div>
    </>
  );
}