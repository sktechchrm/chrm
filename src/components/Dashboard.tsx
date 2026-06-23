import { FaBaby, FaFileAlt, FaGofore, FaUser, FaClipboardList, FaFileInvoiceDollar, FaBriefcase, FaBuilding, FaGavel, FaBookOpen, FaChartBar, FaUserShield, FaHeadset } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ROLE_META } from "../auth/users";
import { useSecurity } from "../security";
import WorkerGuidelinePopup from "./workerGuideline/WorkerGuidelinePopup";

interface Props { setCurrentPage: (page: string) => void; }

const ALL_CARDS = [
  { id:"maternity",    title:"Maternity Benefit",   titleBn:"মাতৃত্বকালীন সুবিধা",       icon:FaBaby,             color:"#0ea5e9", bg:"#e0f2fe" },
  { id:"settlement",   title:"Final Settlement",    titleBn:"চূড়ান্ত নিষ্পত্তি",           icon:FaFileAlt,          color:"#f59e0b", bg:"#fef3c7" },
  { id:"leftnotice",   title:"Left Worker Notice",  titleBn:"অনুমতি ছাড়া কাজ ছেড়ে যাওয়া", icon:FaGofore,           color:"#ef4444", bg:"#fee2e2" },
  { id:"personalfile", title:"Personal File",       titleBn:"ব্যক্তিগত ফাইল",              icon:FaUser,             color:"#8b5cf6", bg:"#ede9fe" },
  { id:"requisition",  title:"Requisition",         titleBn:"রিকুইজিশন ফর্ম",              icon:FaClipboardList,    color:"#10b981", bg:"#d1fae5" },
  { id:"increment",    title:"Salary Increment",    titleBn:"বেতন বৃদ্ধির প্রস্তাব",        icon:FaFileInvoiceDollar,color:"#f97316", bg:"#ffedd5" },
  { id:"meeting",      title:"Meeting Minutes",     titleBn:"সভা কার্যবিবরণী",             icon:FaBriefcase,        color:"#3b82f6", bg:"#dbeafe" },
  { id:"workerrights",    title:"Worker Rights",      titleBn:"কর্মচারীর অধিকার",              icon:FaGavel,            color:"#64748b", bg:"#f8fafc" },
  { id:"workerguideline", title:"Worker Guideline",  titleBn:"শ্রমিক নির্দেশিকা",              icon:FaBookOpen,         color:"#0f766e", bg:"#f0fdf4" },
  { id:"grievance",       title:"Grievance",         titleBn:"কর্মী অভিযোগ",                   icon:FaHeadset,          color:"#dc2626", bg:"#fee2e2" },
];

export default function Dashboard({ setCurrentPage }: Props) {
  const { user, activeFactoryId } = useAuth();
  const security = useSecurity();
  const roleMeta = user ? ROLE_META[user.role] : null;
  const cards    = ALL_CARDS.filter(c => security.module(c.id).allowed);
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-GB", {hour:"2-digit",minute:"2-digit"});
  const dateStr = now.toLocaleDateString("en-GB", {weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const [showGuidelinePopup, setShowGuidelinePopup] = useState(false);

  const handleCardClick = (id: string) => {
    if (id === "workerguideline") {
      setShowGuidelinePopup(true);
    } else {
      setCurrentPage(id);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .db-wrap { font-family:'DM Sans',sans-serif; padding:28px 20px 24px; max-width:1100px; margin:0 auto; }
        /* Welcome banner */
        .db-banner {
          background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 50%,#1d4ed8 100%);
          border-radius:16px;
          padding:24px 28px;
          margin-bottom:28px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
          position:relative;
          overflow:hidden;
        }
        .db-banner::before {
          content:'';
          position:absolute;
          top:-40%;right:-5%;
          width:280px;height:280px;
          background:rgba(255,255,255,0.04);
          border-radius:50%;
        }
        .db-banner-left { position:relative; z-index:1; }
        .db-banner-greeting { font-size:13px; color:rgba(255,255,255,0.65); margin-bottom:4px; }
        .db-banner-name { font-size:22px; font-weight:700; color:#fff; margin-bottom:6px; }
        .db-banner-factory { display:flex; align-items:center; gap:6px; font-size:12.5px; color:#93c5fd; }
        .db-banner-right { text-align:right; position:relative; z-index:1; flex-shrink:0; }
        .db-banner-time { font-size:24px; font-weight:700; color:#fff; font-variant-numeric:tabular-nums; }
        .db-banner-date { font-size:11.5px; color:rgba(255,255,255,0.55); margin-top:2px; }
        .db-role-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; margin-top:8px; }

        /* Section heading */
        .db-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .db-heading-title { font-size:15px; font-weight:700; color:#1e293b; }
        .db-heading-sub { font-size:12px; color:#94a3b8; }
        .db-heading-line { flex:1; height:1px; background:#e2e8f0; margin-left:12px; }

        /* Grid */
        .db-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        @media(max-width:900px){ .db-grid{ grid-template-columns:repeat(3,1fr); } }
        @media(max-width:640px){ .db-grid{ grid-template-columns:repeat(2,1fr); gap:10px; } }
        @media(max-width:380px){ .db-grid{ grid-template-columns:1fr; } }

        /* Card */
        .db-card {
          background:#fff;
          border:1.5px solid #e2e8f0;
          border-radius:12px;
          padding:20px 14px 16px;
          cursor:pointer;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:10px;
          transition:transform 0.18s cubic-bezier(.22,.68,0,1.2), box-shadow 0.18s ease, border-color 0.18s ease;
          user-select:none;
          position:relative;
          overflow:hidden;
          animation:db-fadeUp 0.32s ease both;
        }
        .db-card::before {
          content:'';
          position:absolute;
          top:0;left:0;right:0;
          height:3px;
          background:var(--db-card-color, #3b82f6);
          border-radius:0;
        }
        .db-card:hover {
          transform:translateY(-4px);
          box-shadow:0 8px 24px rgba(0,0,0,0.1);
          border-color:var(--db-card-color, #3b82f6);
        }
        .db-card:active { transform:translateY(-1px); }
        .db-icon-wrap {
          width:52px;height:52px;
          border-radius:12px;
          background:var(--db-card-bg, #dbeafe);
          display:flex;align-items:center;justify-content:center;
          font-size:22px;
          color:var(--db-card-color, #3b82f6);
          transition:transform 0.2s ease;
        }
        .db-card:hover .db-icon-wrap { transform:scale(1.08); }
        .db-label { text-align:center; }
        .db-title { font-size:13px; font-weight:700; color:#1e293b; line-height:1.3; }
        .db-title-bn { font-size:10.5px; color:#64748b; margin-top:3px; line-height:1.4; }

        @keyframes db-fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .db-card:nth-child(1){animation-delay:0ms;} .db-card:nth-child(2){animation-delay:40ms;}
        .db-card:nth-child(3){animation-delay:80ms;} .db-card:nth-child(4){animation-delay:120ms;}
        .db-card:nth-child(5){animation-delay:160ms;} .db-card:nth-child(6){animation-delay:200ms;}
        .db-card:nth-child(7){animation-delay:240ms;}

        /* Access denied card */
        .db-card--locked { opacity:0.45; cursor:not-allowed; }
        .db-card--locked:hover { transform:none; box-shadow:none; }
      `}</style>

      <div className="db-wrap">
        {/* Welcome Banner */}
        <div className="db-banner">
          <div className="db-banner-left">
            <div className="db-banner-greeting">Welcome back,</div>
            <div className="db-banner-name">{user?.name ?? "User"}</div>
            <div className="db-banner-factory">
              <FaBuilding style={{fontSize:"11px"}}/>
              {user?.factoryName ?? "SK-TECH"}
            </div>
            {roleMeta && (
              <div className="db-role-badge" style={{background:roleMeta.bg,color:roleMeta.color}}>
                <FaGavel style={{fontSize:"10px",marginRight:4}}/>
                {roleMeta.label}
              </div>
            )}
          </div>
          <div className="db-banner-right">
            <div className="db-banner-time">{timeStr}</div>
            <div className="db-banner-date">{dateStr}</div>
          </div>
        </div>

        {/* Module cards */}
        <div className="db-heading">
          <div>
            <div className="db-heading-title">HR Modules</div>
            <div className="db-heading-sub">মানব সম্পদ মডিউলসমূহ — একটি মডিউল নির্বাচন করুন</div>
          </div>
          <div className="db-heading-line"/>
        </div>

        <div className="db-grid">
          {cards.map(({id,title,titleBn,icon:Icon,color,bg})=>(
            <div
              key={id}
              className="db-card"
              style={{"--db-card-color":color,"--db-card-bg":bg} as React.CSSProperties}
              onClick={()=>handleCardClick(id)}
              role="button"
              tabIndex={0}
              onKeyDown={e=>e.key==="Enter"&&handleCardClick(id)}
            >
              <div className="db-icon-wrap"><Icon/></div>
              <div className="db-label">
                <div className="db-title">{title}</div>
                <div className="db-title-bn">{titleBn}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Worker Guideline Popup */}
        {showGuidelinePopup && (
          <WorkerGuidelinePopup
            factoryId={activeFactoryId}
            onClose={() => setShowGuidelinePopup(false)}
            onOpen={() => { setShowGuidelinePopup(false); setCurrentPage("workerguideline"); }}
          />
        )}
      </div>
    </>
  );
}