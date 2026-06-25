// src/components/common/ProfilePanel.tsx
import { useState, useCallback } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import AppButton from './AppButton';
import { exportToPDF } from '../../utils/pdfExport';
import { exportToExcel } from '../../utils/excelExport';
import { useAuth } from '../../context/AuthContext';
import { useAccessibleFactories, useFactory } from '../../hooks/useFactory';
import { ROLE_META } from '../../auth/users';
import { useSecurity } from '../../security';
import type { Committee } from '../../factories/FactoryTypes';
import {
  FaTimes, FaIdBadge, FaBuilding, FaUsers, FaBriefcase,
  FaExchangeAlt, FaCheckCircle, FaChevronRight, FaCalendarAlt,
  FaVenusMars, FaSignOutAlt, FaFilePdf, FaFileExcel, FaPrint,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ALL_HR_MODULES = [
  { id: 'maternity',    label: 'Maternity Benefit'  },
  { id: 'settlement',   label: 'Final Settlement'   },
  { id: 'leftnotice',   label: 'Left Worker Notice' },
  { id: 'personalfile', label: 'Personal File'      },
  { id: 'requisition',  label: 'Requisition'        },
  { id: 'increment',    label: 'Salary Increment'   },
  { id: 'meeting',      label: 'Meeting Minutes'    },
  { id: 'workerrights',    label: 'Worker Rights'      },
  { id: 'workerguideline', label: 'Worker Guideline'   },
  { id: 'grievance',       label: 'Grievance'          },
];

type ProfileTab = 'profile' | 'factory' | 'committees';
interface ProfilePanelProps { onClose: () => void; }

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
  const navigate = useNavigate();
  const { user, logout, activeFactoryId } = useAuth();
  const security            = useSecurity();
  const accessibleFactories = useAccessibleFactories();
  const activeFactory       = useFactory();

  const [activeTab,         setActiveTab]         = useState<ProfileTab>('profile');
  const [expandedCommittee, setExpandedCommittee] = useState<string | null>(null);
  const [pdfLoading,        setPdfLoading]        = useState(false);
  const [pdfProgress,       setPdfProgress]       = useState(0);

  const roleMeta = user ? ROLE_META[user.role] : null;
  const userName  = user?.name ?? (user?.email?.split('@')[0] ?? 'User');
  const initials  = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const visibleModules = ALL_HR_MODULES.filter(m => security.module(m.id).allowed);
  const accessStr = visibleModules.length === ALL_HR_MODULES.length
    ? 'All Modules'
    : visibleModules.map(m => m.label).join(', ');

  const { sessionMinsLeft, sessionExpiring, renewSession } = useAuth();

  const sessionLabel = (() => {
    if (sessionMinsLeft === null) return 'Never expires';
    if (sessionMinsLeft > 60) return `${Math.floor(sessionMinsLeft / 60)}h ${sessionMinsLeft % 60}m remaining`;
    return `${sessionMinsLeft} min remaining`;
  })();

  const handleSignOut = () => { logout(); navigate('/'); };

  // Focus trap — keeps keyboard focus inside the panel while open
  const trapRef = useFocusTrap(true);

  const buildPrintHTML = useCallback(() => {
    const af = activeFactory;
    const auth = af.authorities;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const authRows = [
      ['Factory Head',       auth.factoryHead],
      ['HR Manager',         auth.hrManager],
      ['HO HR & Compliance', auth.hoHrHead],
      ['Head of Operations', auth.headOfOperations],
    ] as [string, { nameEn: string; designationEn: string; name: string; designation: string }][];

    const committeesHtml = af.committees.map(com => `
      <div class="com-block">
        <div class="com-header"><span class="com-name">${com.name}</span>
          <span class="com-badge">${com.members?.length ?? 0} সদস্য · প্রতিষ্ঠা: ${com.establishDate}</span></div>
        <div class="persons-grid">
          <div class="person-card chair"><div class="person-role">সভাপতি</div>
            <div class="person-name">${com.chairperson}</div>
            <div class="person-meta">${com.chairpersonDesignation}</div>
            <div class="person-meta">${com.chairpersonDept}</div>
            <div class="person-meta">${com.chairpersonGender}</div></div>
          <div class="person-card sec"><div class="person-role">সম্পাদক</div>
            <div class="person-name">${com.secretary}</div>
            <div class="person-meta">${com.secretaryDesignation}</div>
            <div class="person-meta">${com.secretaryDept}</div>
            <div class="person-meta">${com.secretaryGender}</div></div>
        </div>
        ${(com.members?.length ?? 0) > 0 ? `<div class="tbl-wrap"><table>
          <thead><tr class="tbl-hdr"><th style="width:22pt">#</th><th>নাম</th><th style="width:48pt">লিঙ্গ</th><th>পদবী</th><th>বিভাগ</th></tr></thead>
          <tbody>${(com.members ?? []).map((m, i) => `<tr class="${i%2===0?'':'alt'}"><td class="num">${i+1}</td><td>${m.name}</td><td>${m.gender}</td><td>${m.designation}</td><td>${m.section}</td></tr>`).join('')}</tbody>
        </table></div>` : ''}
      </div>`).join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<title>Factory Profile — ${af.nameEn}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
  @page { size:A4 portrait; margin:18mm 14mm 16mm 14mm; }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;font-size:10.5pt;color:#0f172a;background:#fff;line-height:1.5;}
  /* thead trick — repeats header on every printed page in all browsers */
  .page-wrap{width:100%;border-collapse:collapse;}
  .page-wrap thead td{padding-bottom:6pt;}
  .ph-inner{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:6pt;border-bottom:1.5pt solid #1e3a5f;}
  .ph-name{font-size:10pt;font-weight:800;color:#1e3a5f;}
  .ph-addr{font-size:8pt;color:#64748b;margin-top:2pt;}
  .ph-right{text-align:right;font-size:8pt;color:#94a3b8;}
  .page-wrap tbody td{padding-top:14pt;vertical-align:top;}
  .page-wrap tfoot td{padding-top:5pt;border-top:1pt solid #e2e8f0;font-size:8pt;color:#94a3b8;text-align:right;}
  .cover{text-align:center;padding:18pt 0 20pt;border-bottom:2pt solid #1e3a5f;margin-bottom:20pt;}
  .cover-en{font-size:20pt;font-weight:800;color:#1e3a5f;letter-spacing:-0.5px;}
  .cover-bn{font-size:14pt;color:#3b82f6;margin-top:4pt;}
  .cover-addr{font-size:9pt;color:#64748b;margin-top:4pt;}
  .cover-date{font-size:9pt;color:#94a3b8;margin-top:3pt;}
  .cover-badge{display:inline-block;margin-top:9pt;padding:2pt 12pt;background:#dcfce7;color:#166534;border-radius:20pt;font-size:9pt;font-weight:700;}
  .section{margin-bottom:16pt;page-break-inside:avoid;}
  .sec-title{font-size:8.5pt;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;padding-bottom:5pt;margin-bottom:8pt;border-bottom:1.5pt solid #e2e8f0;display:flex;align-items:center;gap:5pt;}
  .sec-title::before{content:'';display:inline-block;width:3pt;height:10pt;background:#3b82f6;border-radius:2pt;flex-shrink:0;}
  .row{display:flex;gap:8pt;padding:5pt 0;border-bottom:0.5pt solid #f1f5f9;}
  .row:last-child{border-bottom:none;}
  .lbl{font-size:9pt;font-weight:700;color:#94a3b8;min-width:110pt;}
  .val{font-size:10.5pt;color:#1e293b;flex:1;}
  .auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:9pt;}
  .auth-card{border:1pt solid #e2e8f0;border-radius:5pt;padding:9pt;page-break-inside:avoid;}
  .auth-role{font-size:7.5pt;font-weight:800;color:#3b82f6;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:5pt;}
  .auth-name{font-size:11pt;font-weight:700;color:#1e293b;}
  .auth-desg{font-size:9pt;color:#64748b;margin-top:1pt;}
  .auth-hr{height:0.5pt;background:#f1f5f9;margin:5pt 0;}
  .auth-bn{font-size:11pt;font-weight:700;color:#3b82f6;}
  .auth-dbn{font-size:9pt;color:#94a3b8;margin-top:1pt;}
  .meet-row{display:flex;gap:8pt;align-items:flex-start;padding:5pt 8pt;border-bottom:0.5pt solid #f1f5f9;}
  .meet-row:last-child{border-bottom:none;}
  .meet-num{width:18pt;height:18pt;border-radius:4pt;background:#eff6ff;color:#3b82f6;font-size:9pt;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1pt;}
  .meet-name{font-size:10.5pt;font-weight:700;color:#1e293b;}
  .meet-desg{font-size:9pt;color:#64748b;margin-top:1pt;}
  .com-block{border:1pt solid #e2e8f0;border-radius:6pt;margin-bottom:10pt;overflow:hidden;page-break-inside:avoid;}
  .com-header{background:#f8fafc;padding:7pt 11pt;display:flex;justify-content:space-between;align-items:center;border-bottom:1pt solid #e2e8f0;}
  .com-name{font-size:11pt;font-weight:700;color:#1e3a5f;}
  .com-badge{font-size:8.5pt;color:#64748b;}
  .persons-grid{display:grid;grid-template-columns:1fr 1fr;gap:8pt;padding:9pt;}
  .person-card{border:1pt solid #e8f0fe;border-radius:4pt;padding:8pt;}
  .person-card.chair{border-color:#bfdbfe;background:#eff6ff;}
  .person-card.sec{border-color:#ddd6fe;background:#faf5ff;}
  .person-role{font-size:7.5pt;font-weight:800;text-transform:uppercase;color:#3b82f6;margin-bottom:4pt;letter-spacing:0.5px;}
  .person-card.sec .person-role{color:#7c3aed;}
  .person-name{font-size:11pt;font-weight:700;color:#1e293b;}
  .person-meta{font-size:8.5pt;color:#64748b;margin-top:1.5pt;}
  .tbl-wrap{margin:0 9pt 9pt;}
  table{width:100%;border-collapse:collapse;font-size:9pt;}
  thead tr.tbl-hdr th{background:#1e3a5f;color:#fff;font-weight:700;padding:5pt 7pt;text-align:left;}
  td{padding:4pt 7pt;border-bottom:0.5pt solid #f1f5f9;color:#1e293b;vertical-align:top;}
  tr.alt td{background:#f8fafc;}
  td.num{color:#94a3b8;font-size:8pt;width:20pt;}
  .pb{page-break-before:always;}
</style></head><body>
<table class="page-wrap">
  <thead><tr><td>
    <div class="ph-inner">
      <div><div class="ph-name">${af.nameEn}</div><div class="ph-addr">${af.addressEn} · ${af.addressBn}</div></div>
      <div class="ph-right">Factory Profile · ${date}</div>
    </div>
  </td></tr></thead>
  <tfoot><tr><td>${af.nameEn} · ${af.addressEn}</td></tr></tfoot>
  <tbody><tr><td>
    <div class="cover">
      <div class="cover-en">${af.nameEn}</div><div class="cover-bn">${af.nameBn}</div>
      <div class="cover-addr">${af.addressEn}</div><div class="cover-addr">${af.addressBn}</div>
      <div class="cover-date">Generated: ${date}</div><div><div class="cover-badge">Active Factory</div></div>
    </div>
    <div class="section"><div class="sec-title">User Information</div>
      ${[['Name',user?.name??''],['Email',user?.email??''],['Designation',user?.designation??''],['Role',roleMeta?.label??''],['Access',accessStr]].map(([l,v])=>`<div class="row"><span class="lbl">${l}</span><span class="val">${v}</span></div>`).join('')}
    </div>
    <div class="section"><div class="sec-title">Factory Identity</div>
      ${[['Name (EN)',af.nameEn],['নাম (BN)',af.nameBn],['Address',af.addressEn],['ঠিকানা',af.addressBn],['Factory ID',af.id],['Status','Active']].map(([l,v])=>`<div class="row"><span class="lbl">${l}</span><span class="val">${v}</span></div>`).join('')}
    </div>
    <div class="section"><div class="sec-title">Signing Authorities</div>
      <div class="auth-grid">
        ${authRows.map(([role,a])=>`<div class="auth-card"><div class="auth-role">${role}</div><div class="auth-name">${a.nameEn}</div><div class="auth-desg">${a.designationEn}</div><div class="auth-hr"></div><div class="auth-bn">${a.name}</div><div class="auth-dbn">${a.designation}</div></div>`).join('')}
      </div>
    </div>
    <div class="section"><div class="sec-title">Meeting Authorities</div>
      ${af.meetingAuthorities.map((a,i)=>`<div class="meet-row"><div class="meet-num">${i+1}</div><div><div class="meet-name">${a.name}</div><div class="meet-desg">${a.designation}</div></div></div>`).join('')}
    </div>
    <div class="pb"><div class="section"><div class="sec-title">Committees (${af.committees.length})</div>${committeesHtml}</div></div>
  </td></tr></tbody>
</table>
</body></html>`;
  }, [activeFactory, user, roleMeta, accessStr]);

  const handlePrint = useCallback(() => {
    const win = window.open('', '_blank', 'width=980,height=740');
    if (!win) return;
    win.document.write(buildPrintHTML());
    win.document.close();
    setTimeout(() => win.print(), 500);
  }, [buildPrintHTML]);

  const handlePDF = useCallback(async () => {
    setPdfLoading(true); setPdfProgress(0);
    try {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none;visibility:hidden;';
      document.body.appendChild(iframe);
      const iDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!iDoc) { document.body.removeChild(iframe); return; }
      iDoc.open(); iDoc.write(buildPrintHTML()); iDoc.close();
      await new Promise(r => setTimeout(r, 800));
      setPdfProgress(15);
      await exportToPDF({
        element: iDoc.body,
        filename: `FactoryProfile_${activeFactory.id}_${new Date().toISOString().slice(0,10)}`,
        orientation: 'portrait', scale: 2,
        onProgress: (p) => setPdfProgress(15 + Math.round(p * 0.85)),
      });
      document.body.removeChild(iframe);
    } finally { setPdfLoading(false); setPdfProgress(0); }
  }, [buildPrintHTML, activeFactory]);

  const handleExcel = useCallback(() => {
    const af = activeFactory;
    const auth = af.authorities;
    exportToExcel({
      filename: `FactoryProfile_${af.id}_${new Date().toISOString().slice(0,10)}`,
      title: `${af.nameEn} — Factory Profile`,
      sheetName: 'Factory Profile',
      headerInfo: [
        { label:'Factory (EN)', value:af.nameEn   },
        { label:'Factory (BN)', value:af.nameBn   },
        { label:'Address (EN)', value:af.addressEn },
        { label:'Address (BN)', value:af.addressBn },
        { label:'Generated',    value:new Date().toLocaleDateString('en-GB') },
      ],
      sections: [
        { title:'USER INFORMATION',
          columns:[{key:'field',header:'Field',width:20},{key:'value',header:'Value',width:52}],
          rows:[{field:'Name',value:user?.name??''},{field:'Email',value:user?.email??''},{field:'Designation',value:user?.designation??''},{field:'Role',value:roleMeta?.label??''},{field:'Access',value:accessStr}] },
        { title:'SIGNING AUTHORITIES',
          columns:[{key:'role',header:'Role',width:22},{key:'nameEn',header:'Name (EN)',width:22},{key:'desgEn',header:'Designation (EN)',width:36},{key:'nameBn',header:'Name (BN)',width:22},{key:'desgBn',header:'Designation (BN)',width:44}],
          rows:[
            {role:'Factory Head',      nameEn:auth.factoryHead.nameEn,      desgEn:auth.factoryHead.designationEn,      nameBn:auth.factoryHead.name,      desgBn:auth.factoryHead.designation},
            {role:'HR Manager',        nameEn:auth.hrManager.nameEn,        desgEn:auth.hrManager.designationEn,        nameBn:auth.hrManager.name,        desgBn:auth.hrManager.designation},
            {role:'HO HR & Compliance',nameEn:auth.hoHrHead.nameEn,         desgEn:auth.hoHrHead.designationEn,         nameBn:auth.hoHrHead.name,         desgBn:auth.hoHrHead.designation},
            {role:'Head of Operations',nameEn:auth.headOfOperations.nameEn, desgEn:auth.headOfOperations.designationEn, nameBn:auth.headOfOperations.name, desgBn:auth.headOfOperations.designation},
          ] },
        { title:'MEETING AUTHORITIES',
          columns:[{key:'num',header:'#',width:5},{key:'name',header:'Name (BN)',width:22},{key:'desg',header:'Designation',width:48}],
          rows:af.meetingAuthorities.map((a,i)=>({num:i+1,name:a.name,desg:a.designation})) },
        ...af.committees.map((com: Committee)=>({
          title:com.name,
          columns:[{key:'num',header:'#',width:4},{key:'name',header:'নাম',width:22},{key:'gend',header:'লিঙ্গ',width:8},{key:'desg',header:'পদবী',width:28},{key:'sect',header:'বিভাগ',width:30}],
          rows:(com.members??[]).map((m,i)=>({num:i+1,name:m.name,gend:m.gender,desg:m.designation,sect:m.section})),
        })),
      ],
    });
  }, [activeFactory, user, roleMeta, accessStr]);

  const renderCommittee = (com: Committee) => {
    const isOpen  = expandedCommittee === com.id;
    const members = com.members ?? [];
    return (
      <div key={com.id} className="pp-committee">
        <AppButton variant="icon" className="pp-committee-hdr !w-full !h-auto !rounded-none !px-4 !py-3 !justify-start" onClick={() => setExpandedCommittee(isOpen ? null : com.id)}>
          <div className="pp-committee-title-row">
            <span className="pp-committee-name">{com.name}</span>
            <span className="pp-committee-badge">{members.length} সদস্য</span>
          </div>
          <FaChevronRight className={`pp-chev ${isOpen ? 'open' : ''}`}/>
        </AppButton>
        {isOpen && (
          <div className="pp-committee-body">
            <div className="pp-com-meta"><FaCalendarAlt style={{fontSize:'10px',marginRight:4,opacity:0.6}}/>প্রতিষ্ঠা: {com.establishDate}</div>
            <div className="pp-com-persons">
              {[
                {type:'সভাপতি',cls:'chair',name:com.chairperson,desg:com.chairpersonDesignation,dept:com.chairpersonDept,gender:com.chairpersonGender},
                {type:'সম্পাদক',cls:'sec',name:com.secretary,desg:com.secretaryDesignation,dept:com.secretaryDept,gender:com.secretaryGender},
              ].map(p => (
                <div key={p.type} className={`pp-com-person ${p.cls}`}>
                  <div className="pp-com-role">{p.type}</div>
                  <div className="pp-com-name">{p.name}</div>
                  <div className="pp-com-desg">{p.desg}</div>
                  <div className="pp-com-dept">{p.dept}</div>
                  <div className="pp-com-gender"><FaVenusMars style={{fontSize:'9px',marginRight:3}}/>{p.gender}</div>
                </div>
              ))}
            </div>
            {members.length > 0 && (
              <div className="pp-tbl-wrap">
                <table className="pp-tbl">
                  <thead><tr><th>#</th><th>নাম</th><th>লিঙ্গ</th><th>পদবী</th><th>বিভাগ</th></tr></thead>
                  <tbody>
                    {members.map((m,i) => (
                      <tr key={i} className={i%2===0?'':'alt'}>
                        <td className="num">{i+1}</td><td>{m.name}</td><td>{m.gender}</td><td>{m.designation}</td><td>{m.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{PANEL_CSS}</style>
      <div className="pp-overlay" onClick={onClose} aria-hidden="true"/>
      <div
        className="pp-panel"
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="User profile panel"
      >

        {/* ── Top bar ── */}
        <div className="pp-topbar">
          <div className="pp-topbar-row1">
            <div className="pp-avatar">{initials}</div>
            <div className="pp-user-info">
              <div className="pp-user-name">{userName}</div>
              <div className="pp-user-email">{user?.email ?? ''}</div>
              <div className="pp-user-desg">{user?.designation ?? ''}</div>
            </div>
            <div className="pp-topbar-actions">
              <AppButton variant="print" onClick={handlePrint} className="!px-3 !py-1.5 !text-xs !shadow-sm" title="Print A4"><FaPrint aria-hidden="true" /><span>Print</span></AppButton>
              <AppButton variant="pdf" onClick={handlePDF} disabled={pdfLoading} className="!px-3 !py-1.5 !text-xs !shadow-sm" title="Export PDF">
                <FaFilePdf aria-hidden="true" /><span>{pdfLoading ? `${pdfProgress}%` : 'PDF'}</span>
              </AppButton>
              <AppButton variant="excel" onClick={handleExcel} className="!px-3 !py-1.5 !text-xs !shadow-sm" title="Export Excel"><FaFileExcel aria-hidden="true" /><span>Excel</span></AppButton>
              <AppButton variant="icon" onClick={onClose} title="Close (Esc)" aria-label="Close profile panel"><FaTimes aria-hidden="true"/></AppButton>
            </div>
          </div>
          <div className="pp-tabs">
            {([
              {key:'profile',    label:'My Profile'},
              {key:'factory',    label:'Factory'},
              {key:'committees', label:`Committees (${activeFactory.committees.length})`},
            ] as {key:ProfileTab;label:string}[]).map(t => (
              <AppButton key={t.key} variant="tab" active={activeTab===t.key} onClick={()=>setActiveTab(t.key)}>{t.label}</AppButton>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="pp-body">

          {/* TAB: My Profile */}
          {activeTab === 'profile' && (<>
            <div className="pp-card">
              <div className="pp-card-title"><FaIdBadge aria-hidden="true" /> User Information</div>
              {[{l:'Full Name',v:user?.name??''},{l:'Email',v:user?.email??''},{l:'Designation',v:user?.designation??''}].map(r=>(
                <div key={r.l} className="pp-row"><span className="pp-label">{r.l}</span><span className="pp-value">{r.v}</span></div>
              ))}
              <div className="pp-row"><span className="pp-label">Role</span><span className="pp-value">
                {roleMeta ? <span className="pp-badge" style={{background:roleMeta.bg,color:roleMeta.color}}>{roleMeta.label}</span> : '—'}
              </span></div>
              <div className="pp-row"><span className="pp-label">Factory</span><span className="pp-value" style={{fontWeight:700}}>{activeFactory.nameEn}</span></div>
            </div>

            {/* Session duration card */}
            <div className="pp-card" style={{ borderLeft: `3px solid ${sessionExpiring ? '#f59e0b' : '#22c55e'}` }}>
              <div className="pp-card-title">
                <span style={{ fontSize: 14 }}>{sessionExpiring ? '⚠️' : '🔒'}</span> Session Duration
              </div>
              <div className="pp-row">
                <span className="pp-label">Duration</span>
                <span className="pp-value">
                  {user?.sessionDuration === 0
                    ? 'Never expires'
                    : `${user?.sessionDuration} min (${Math.floor((user?.sessionDuration ?? 0) / 60)}h ${(user?.sessionDuration ?? 0) % 60}m)`}
                </span>
              </div>
              <div className="pp-row">
                <span className="pp-label">Remaining</span>
                <span className="pp-value" style={{ fontWeight: 700, color: sessionExpiring ? '#f59e0b' : '#22c55e' }}>
                  {sessionLabel}
                </span>
              </div>
              {sessionExpiring && (
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={renewSession}
                    style={{
                      background: '#f59e0b', color: '#fff', border: 'none',
                      borderRadius: 7, padding: '6px 14px', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer', width: '100%',
                    }}
                  >
                    ↺ সেশন নবায়ন করুন
                  </button>
                </div>
              )}
            </div>
            <div className="pp-card">
              <div className="pp-card-title"><FaCheckCircle style={{color:'#22c55e'}}/> Module Access</div>
              <div className="pp-row"><span className="pp-label">Modules</span><span className="pp-value">
                <div className="pp-pills">
                  {visibleModules.map(m=>(
                    <span key={m.id} className="pp-pill"><FaCheckCircle style={{fontSize:'9px',color:'#22c55e'}}/>{m.label}</span>
                  ))}
                </div>
              </span></div>
            </div>
            {accessibleFactories.length > 1 && (
              <div className="pp-card">
                <div className="pp-card-title"><FaExchangeAlt aria-hidden="true" /> Accessible Factories ({accessibleFactories.length})</div>
                {accessibleFactories.map(f=>(
                  <div key={f.id} className="pp-factory-row">
                    <div className={`pp-factory-dot ${f.id===activeFactoryId?'active':''}`}/>
                    <div style={{flex:1}}><div className="pp-factory-name">{f.nameEn}</div><div className="pp-factory-addr">{f.addressEn}</div></div>
                    {f.id===activeFactoryId && <span className="pp-factory-active">Active ✓</span>}
                  </div>
                ))}
              </div>
            )}
          </>)}

          {/* TAB: Factory */}
          {activeTab === 'factory' && (<>
            <div className="pp-card">
              <div className="pp-card-title"><FaBuilding aria-hidden="true" /> Factory Identity</div>
              {[
                {l:'Name (EN)',v:activeFactory.nameEn,  bold:true, bn:false},
                {l:'নাম (BN)', v:activeFactory.nameBn,  bold:false,bn:true },
                {l:'Address',  v:activeFactory.addressEn,bold:false,bn:false},
                {l:'ঠিকানা',  v:activeFactory.addressBn,bold:false,bn:true },
                {l:'Factory ID',v:activeFactory.id,     bold:false,bn:false},
              ].map(r=>(
                <div key={r.l} className="pp-row"><span className="pp-label">{r.l}</span>
                  <span className={`pp-value ${r.bn?'bn':''}`}
                    style={r.l==='Factory ID'?{fontFamily:'monospace',fontSize:'11px',color:'#64748b'}:r.bold?{fontWeight:700,fontSize:'13px'}:{}}>
                    {r.v}
                  </span>
                </div>
              ))}
              <div className="pp-row"><span className="pp-label">Status</span><span className="pp-value">
                <span className="pp-active-badge"><span className="pp-active-dot"/>Active</span>
              </span></div>
            </div>
            <div className="pp-card">
              <div className="pp-card-title"><FaUsers aria-hidden="true" /> Signing Authorities</div>
              <div className="pp-auth-grid">
                {[
                  {role:'Factory Head',      auth:activeFactory.authorities.factoryHead},
                  {role:'HR Manager',         auth:activeFactory.authorities.hrManager},
                  {role:'HO HR & Compliance', auth:activeFactory.authorities.hoHrHead},
                  {role:'Head of Operations', auth:activeFactory.authorities.headOfOperations},
                ].map(({role,auth})=>(
                  <div key={role} className="pp-auth-card">
                    <div className="pp-auth-role">{role}</div>
                    <div className="pp-auth-name-en">{auth.nameEn}</div>
                    <div className="pp-auth-desg-en">{auth.designationEn}</div>
                    <div className="pp-auth-hr"/>
                    <div className="pp-auth-name-bn">{auth.name}</div>
                    <div className="pp-auth-desg-bn">{auth.designation}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pp-card">
              <div className="pp-card-title"><FaBriefcase aria-hidden="true" /> Meeting Authorities</div>
              {activeFactory.meetingAuthorities.map((a,i)=>(
                <div key={i} className="pp-meeting-row">
                  <div className="pp-meeting-num">{i+1}</div>
                  <div><div className="pp-meeting-name">{a.name}</div><div className="pp-meeting-desg">{a.designation}</div></div>
                </div>
              ))}
            </div>
          </>)}

          {/* TAB: Committees */}
          {activeTab === 'committees' && (
            activeFactory.committees.length === 0
              ? <div className="pp-empty">No committees configured for this factory.</div>
              : activeFactory.committees.map(com => renderCommittee(com))
          )}

          <div style={{height:8}}/>
        </div>{/* end pp-body */}

        {/* ── Footer ── */}
        <div className="pp-footer">
          <span className="pp-footer-info">
            {activeFactory.nameEn} · {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
          </span>
          <div style={{display:'flex',gap:8}}>
            <AppButton variant="back" onClick={onClose}>Close</AppButton>
            <AppButton variant="back"
              style={{background:'#b91c1c',borderColor:'#b91c1c'} as React.CSSProperties}
              onClick={()=>{onClose();handleSignOut();}}>
              <FaSignOutAlt style={{marginRight:5,fontSize:'11px'}}/> Sign Out
            </AppButton>
          </div>
        </div>

      </div>
    </>
  );
}

const PANEL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  .pp-panel{
    --pp-bg:#0b1120;--pp-surface:#111827;--pp-border:rgba(255,255,255,0.08);
    --pp-border2:rgba(255,255,255,0.05);--pp-text:#f1f5f9;--pp-text2:#94a3b8;
    --pp-text3:#475569;--pp-accent:#3b82f6;--pp-accent2:#60a5fa;
    --pp-green:#22c55e;--pp-font:'DM Sans',sans-serif;--pp-r:12px;--pp-r-sm:8px;
  }
  .pp-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.62);backdrop-filter:blur(6px);animation:ppFade 0.2s ease;}
  @keyframes ppFade{from{opacity:0}to{opacity:1}}
  .pp-panel{
    position:fixed;top:0;right:0;bottom:0;width:100%;max-width:680px;
    background:var(--pp-bg);border-left:1px solid rgba(255,255,255,0.09);
    display:flex;flex-direction:column;
    box-shadow:-20px 0 70px rgba(0,0,0,0.7);
    animation:ppSlide 0.28s cubic-bezier(0.22,0.68,0,1.08);
    z-index:2001;font-family:var(--pp-font);overflow:hidden;
  }
  @keyframes ppSlide{from{transform:translateX(100%)}to{transform:translateX(0)}}
  .pp-topbar{background:linear-gradient(145deg,#0c1f3f 0%,#0f2d5a 40%,#1a3a6e 100%);border-bottom:1px solid rgba(255,255,255,0.1);padding:0 22px;flex-shrink:0;}
  .pp-topbar-row1{display:flex;align-items:center;gap:14px;padding:18px 0 14px;}
  .pp-avatar{width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#2563eb,#1e40af);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;flex-shrink:0;border:2px solid rgba(255,255,255,0.18);box-shadow:0 4px 16px rgba(37,99,235,0.35);}
  .pp-user-info{flex:1;min-width:0;}
  .pp-user-name{font-size:16px;font-weight:700;color:#f8fafc;line-height:1.25;}
  .pp-user-email{font-size:11.5px;color:#7ea8d8;margin-top:2px;word-break:break-all;}
  .pp-user-desg{font-size:11px;color:#5b85b8;margin-top:1px;}
  .pp-topbar-actions{display:flex;align-items:center;gap:5px;flex-shrink:0;}
  .pp-icon-btn{display:flex;align-items:center;gap:5px;padding:6px 11px;border-radius:var(--pp-r-sm);font-size:11.5px;font-weight:600;border:none;cursor:pointer;font-family:var(--pp-font);white-space:nowrap;transition:all 0.15s;}
  .pp-icon-btn svg{font-size:11px;}
  .pp-icon-btn:disabled{opacity:0.55;cursor:not-allowed;}
  .print-btn{background:rgba(255,255,255,0.10);color:#cbd5e1;border:1px solid rgba(255,255,255,0.12);}
  .print-btn:hover{background:rgba(255,255,255,0.18);color:#fff;}
  .pdf-btn{background:rgba(239,68,68,0.18);color:#fca5a5;border:1px solid rgba(239,68,68,0.25);}
  .pdf-btn:hover:not(:disabled){background:rgba(239,68,68,0.30);color:#fff;}
  .excel-btn{background:rgba(34,197,94,0.15);color:#86efac;border:1px solid rgba(34,197,94,0.22);}
  .excel-btn:hover{background:rgba(34,197,94,0.28);color:#fff;}
  .pp-close-btn{width:32px;height:32px;border-radius:var(--pp-r-sm);background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.10);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;transition:all 0.15s;margin-left:2px;}
  .pp-close-btn:hover{background:rgba(255,255,255,0.18);color:#fff;}
  .pp-tabs{display:flex;border-top:1px solid rgba(255,255,255,0.08);}
  .pp-tab{flex:1;padding:11px 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.42);background:transparent;border:none;cursor:pointer;position:relative;transition:color 0.15s;font-family:var(--pp-font);}
  .pp-tab:hover{color:rgba(255,255,255,0.75);}
  .pp-tab.active{color:#f1f5f9;}
  .pp-tab.active::after{content:'';position:absolute;bottom:0;left:10%;right:10%;height:2.5px;background:var(--pp-accent2);border-radius:2px 2px 0 0;}
  /* KEY scroll fix — flex:1 + min-height:0 + overflow-y:auto */
  .pp-body{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:18px 20px 0;display:flex;flex-direction:column;gap:12px;}
  .pp-body::-webkit-scrollbar{width:4px;}
  .pp-body::-webkit-scrollbar-track{background:transparent;}
  .pp-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px;}
  .pp-body::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.22);}
  .pp-card{background:var(--pp-surface);border:1px solid var(--pp-border);border-radius:var(--pp-r);overflow:hidden;flex-shrink:0;}
  .pp-card-title{padding:10px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid var(--pp-border2);font-size:10px;font-weight:700;color:var(--pp-text3);text-transform:uppercase;letter-spacing:1.1px;display:flex;align-items:center;gap:7px;}
  .pp-card-title svg{color:var(--pp-accent);font-size:11px;}
  .pp-row{display:flex;align-items:flex-start;gap:10px;padding:9px 16px;border-bottom:1px solid var(--pp-border2);}
  .pp-row:last-child{border-bottom:none;}
  .pp-label{font-size:10.5px;font-weight:600;color:var(--pp-text3);white-space:nowrap;min-width:105px;padding-top:1px;}
  .pp-value{font-size:12.5px;color:var(--pp-text);flex:1;line-height:1.5;word-break:break-word;}
  .pp-value.bn{font-size:13px;}
  .pp-badge{display:inline-flex;align-items:center;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;}
  .pp-active-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(34,197,94,0.12);color:#4ade80;}
  .pp-active-dot{width:6px;height:6px;border-radius:50%;background:var(--pp-green);animation:ppPulse 2s ease infinite;}
  @keyframes ppPulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .pp-pills{display:flex;flex-wrap:wrap;gap:5px;}
  .pp-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;background:rgba(37,99,235,0.12);border:1px solid rgba(59,130,246,0.20);border-radius:20px;font-size:10.5px;color:#93c5fd;font-weight:500;}
  .pp-auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 16px;}
  @media(max-width:520px){.pp-auth-grid{grid-template-columns:1fr;}}
  .pp-auth-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:9px;padding:12px;}
  .pp-auth-role{font-size:9px;font-weight:700;color:var(--pp-accent2);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;}
  .pp-auth-name-en{font-size:12.5px;font-weight:700;color:#f1f5f9;}
  .pp-auth-desg-en{font-size:10.5px;color:var(--pp-text2);margin-top:1px;}
  .pp-auth-hr{height:1px;background:rgba(255,255,255,0.07);margin:7px 0;}
  .pp-auth-name-bn{font-size:13px;color:#93c5fd;font-weight:600;}
  .pp-auth-desg-bn{font-size:10.5px;color:var(--pp-text3);margin-top:1px;}
  .pp-meeting-row{display:flex;align-items:flex-start;gap:10px;padding:9px 16px;border-bottom:1px solid var(--pp-border2);}
  .pp-meeting-row:last-child{border-bottom:none;}
  .pp-meeting-num{width:22px;height:22px;border-radius:6px;background:rgba(99,102,241,0.18);color:#a5b4fc;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
  .pp-meeting-name{font-size:12.5px;font-weight:600;color:var(--pp-text);}
  .pp-meeting-desg{font-size:10.5px;color:var(--pp-text3);margin-top:1px;}
  .pp-factory-row{display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid var(--pp-border2);}
  .pp-factory-row:last-child{border-bottom:none;}
  .pp-factory-dot{width:8px;height:8px;border-radius:50%;background:#3b82f6;flex-shrink:0;}
  .pp-factory-dot.active{background:var(--pp-green);animation:ppPulse 2s ease infinite;}
  .pp-factory-name{font-size:12.5px;font-weight:600;color:var(--pp-text);}
  .pp-factory-addr{font-size:10.5px;color:var(--pp-text3);margin-top:1px;}
  .pp-factory-active{margin-left:auto;font-size:10px;color:#4ade80;font-weight:700;white-space:nowrap;}
  .pp-committee{background:var(--pp-surface);border:1px solid var(--pp-border);border-radius:10px;overflow:hidden;flex-shrink:0;}
  .pp-committee-hdr{width:100%;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:transparent;border:none;cursor:pointer;font-family:var(--pp-font);transition:background 0.12s;}
  .pp-committee-hdr:hover{background:rgba(255,255,255,0.04);}
  .pp-committee-title-row{display:flex;align-items:center;gap:8px;}
  .pp-committee-name{font-size:13px;font-weight:600;color:var(--pp-text);}
  .pp-committee-badge{font-size:10px;font-weight:600;color:var(--pp-accent2);background:rgba(59,130,246,0.12);border-radius:20px;padding:2px 8px;}
  .pp-chev{font-size:11px;color:var(--pp-text3);transition:transform 0.2s ease;flex-shrink:0;}
  .pp-chev.open{transform:rotate(90deg);}
  .pp-committee-body{border-top:1px solid var(--pp-border2);padding:12px 16px;display:flex;flex-direction:column;gap:10px;}
  .pp-com-meta{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--pp-text3);}
  .pp-com-persons{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
  @media(max-width:480px){.pp-com-persons{grid-template-columns:1fr;}}
  .pp-com-person{border-radius:8px;padding:10px;border:1px solid rgba(255,255,255,0.07);}
  .pp-com-person.chair{background:rgba(37,99,235,0.08);border-color:rgba(59,130,246,0.20);}
  .pp-com-person.sec{background:rgba(99,102,241,0.08);border-color:rgba(139,92,246,0.20);}
  .pp-com-role{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:5px;color:var(--pp-accent2);}
  .pp-com-person.sec .pp-com-role{color:#a5b4fc;}
  .pp-com-name{font-size:12.5px;font-weight:700;color:var(--pp-text);}
  .pp-com-desg{font-size:10.5px;color:var(--pp-text2);margin-top:1px;}
  .pp-com-dept{font-size:10px;color:var(--pp-text3);margin-top:1px;}
  .pp-com-gender{font-size:10px;color:var(--pp-text3);margin-top:4px;display:flex;align-items:center;}
  .pp-tbl-wrap{overflow-x:auto;border-radius:8px;border:1px solid var(--pp-border);}
  .pp-tbl{width:100%;border-collapse:collapse;font-size:11px;}
  .pp-tbl th{background:rgba(15,32,64,0.9);color:#93c5fd;font-weight:700;padding:7px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);white-space:nowrap;}
  .pp-tbl td{padding:6px 10px;color:#cbd5e1;border-bottom:1px solid var(--pp-border2);}
  .pp-tbl tr:last-child td{border-bottom:none;}
  .pp-tbl tr:hover td{background:rgba(255,255,255,0.03);}
  .pp-tbl tr.alt td{background:rgba(255,255,255,0.02);}
  .pp-tbl td.num{color:var(--pp-text3);font-size:10px;width:28px;}
  .pp-empty{text-align:center;color:var(--pp-text3);padding:40px 0;font-size:13px;}
  .pp-footer{padding:12px 20px;border-top:1px solid var(--pp-border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:rgba(0,0,0,0.30);}
  .pp-footer-info{font-size:11px;color:var(--pp-text3);}
  @media print{.pp-overlay,.pp-panel{display:none !important;}}
`;