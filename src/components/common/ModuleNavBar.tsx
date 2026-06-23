// ModuleNavBar — matches the attached image exactly
// Layout: [tabs][view tabs][|][Save][Update]      [Auth 🔏][|][Print][Export▼]

import { useState, useRef, useEffect } from 'react';
import { FaSave, FaSearch, FaTimes, FaPrint, FaDownload, FaFilePdf, FaFileExcel, FaFileWord, FaChevronDown, FaEdit } from 'react-icons/fa';
import AuthorityIconButton from './AuthorityIconButton';
import type { AuthorizationState } from './AuthorizationBlock';
import { DataUseCases } from '../../business/DataUseCases';
import type { DbModule } from '../../business/DataUseCases';

export interface NavTab { id: string; label: string; disabled?: boolean; }
export interface ViewItem { label: string; onClick: () => void; }
export type UpdateSearchResult = Record<string, string | number | boolean | undefined | null>;

interface Props {
  tabs:           NavTab[];
  activeTab:      string;
  onTabChange:    (id: string) => void;
  viewItems?:     ViewItem[];
  activeViewItem?:string;
  onSave?:        () => Promise<boolean>;
  isSaving?:      boolean;
  saveDisabled?:  boolean;
  /** Pass sheets.configured from useDatabase — controls whether save button is enabled */
  configured?:    boolean;
  /** Pass sheets.adapterName from useDatabase — shown in tooltips */
  adapterName?:   string;
  onReset?: () => void; 
  onUpdate?:      (record: UpdateSearchResult) => void;
  updateModule?:  DbModule;
  updateLabel?:   string;
  factoryId?:     string;
  onPrint?:       () => void;
  onPDF?:         () => void;
  onExcel?:       () => void;
  onWord?:        () => void;
  auth?:          AuthorizationState;
  onAuthChange?:  (next: AuthorizationState) => void;
  lang?:          'en' | 'bn';
  editingId?:     string | null;
  onCancelEdit?:  () => void;
  extraButtons?:  React.ReactNode | null;
}

const B: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '5px 12px', borderRadius: '7px', border: 'none',
  cursor: 'pointer', fontSize: '12.5px', fontWeight: 600,
  fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
  whiteSpace: 'nowrap', lineHeight: 1.3, transition: 'all 0.13s',
};

function ExportDropdown({ onPDF, onExcel, onWord }: { onPDF?:()=>void; onExcel?:()=>void; onWord?:()=>void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const items = [
    onPDF   && { icon:<FaFilePdf   aria-hidden="true"/>, label:'PDF',   sub:'Portable Document',   color:'#dc2626', fn:onPDF   },
    onExcel && { icon:<FaFileExcel aria-hidden="true"/>, label:'Excel', sub:'Spreadsheet (.xlsx)', color:'#16a34a', fn:onExcel },
    onWord  && { icon:<FaFileWord  aria-hidden="true"/>, label:'Word',  sub:'Document (.doc)',     color:'#1d4ed8', fn:onWord  },
  ].filter(Boolean) as { icon:React.ReactNode; label:string; sub:string; color:string; fn:()=>void }[];
  if (items.length === 0) return null;
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      <button onClick={() => setOpen(v=>!v)} aria-haspopup="true" aria-expanded={open} aria-label="Export"
        style={{ ...B, border:`1.5px solid #1e40af`, background: open?'#1e40af':'#fff', color: open?'#fff':'#1e40af' }}>
        <FaDownload aria-hidden="true" style={{ fontSize:'11px' }} />
        Export
        <FaChevronDown aria-hidden="true" style={{ fontSize:'9px', transform:open?'rotate(180deg)':'none', transition:'transform 0.15s' }} />
      </button>
      {open && (
        <div role="menu" style={{ position:'absolute', top:'calc(100% + 4px)', right:0, zIndex:900, background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', minWidth:'188px', overflow:'hidden', animation:'navDrop 0.13s ease' }}>
          <div style={{ padding:'5px' }}>
            {items.map((item,i) => (
              <button key={i} role="menuitem" onClick={() => { item.fn(); setOpen(false); }}
                style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'8px 10px', border:'none', borderRadius:'7px', background:'transparent', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f8fafc'}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='transparent'}>
                <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:item.color+'15', border:`1.5px solid ${item.color}30`, display:'flex', alignItems:'center', justifyContent:'center', color:item.color, fontSize:'13px', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#1e293b' }}>{item.label}</div>
                  <div style={{ fontSize:'10.5px', color:'#94a3b8' }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes navDrop{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function BillDropdown({ items, activeViewItem }: { items: ViewItem[]; activeViewItem?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const hasActive = items.some(i => i.label === activeViewItem);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Bill view options"
        style={{
          ...B,
          background: hasActive ? '#0369a1' : '#fff',
          color:      hasActive ? '#fff'    : '#0369a1',
          border:     `1.5px solid ${hasActive ? '#0369a1' : '#93c5fd'}`,
        }}
      >
        বিল
        <FaChevronDown
          aria-hidden="true"
          style={{
            fontSize: '9px',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 900,
            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '150px',
            overflow: 'hidden', animation: 'navDrop 0.13s ease',
          }}
        >
          <div style={{ padding: '5px' }}>
            {items.map((item, i) => {
              const isActive = item.label === activeViewItem;
              return (
                <button
                  key={i}
                  role="menuitem"
                  onClick={() => { item.onClick(); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '8px 12px',
                    border: 'none', borderRadius: '7px',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#0369a1' : '#1e293b',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '13px', fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = isActive ? '#eff6ff' : 'transparent';
                  }}
                >
                  {isActive && <span style={{ color: '#0369a1', fontSize: '10px' }}>●</span>}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function UpdateModal({ onSelect, onClose, module, factoryId, label }: { onSelect:(r:UpdateSearchResult)=>void; onClose:()=>void; module?:DbModule; factoryId?:string; label?:string }) {
  const [query,setQuery]=useState('');
  const [results,setResults]=useState<UpdateSearchResult[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const configured=!!(factoryId);// adapter-agnostic: any factoryId means we can search
  const search=async()=>{
    if(!module||!configured||!query.trim())return;
    setLoading(true);setError('');
    const res=await DataUseCases.load(module,factoryId??'all',100);
    setLoading(false);
    if(res.ok){
      const q=query.trim().toLowerCase();
      setResults(res.records.filter(r=>String(r.cardNo??'').toLowerCase().includes(q)||String(r.id??'').toLowerCase().includes(q)||String(r.employeeName??'').toLowerCase().includes(q)||String(r.fullName??'').toLowerCase().includes(q)||String(r.subject??'').toLowerCase().includes(q)).slice(0,20) as UpdateSearchResult[]);
    }else setError(res.error??'Load failed');
  };
  return (
    <div style={{ position:'fixed',inset:0,zIndex:9500,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}>
      <div aria-hidden="true" onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(3px)' }} />
      <div role="dialog" aria-modal="true" style={{ position:'relative',background:'#fff',borderRadius:'14px',width:'100%',maxWidth:'540px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',fontFamily:"'Noto Sans Bengali',Arial,sans-serif",overflow:'hidden' }}>
        <div style={{ background:'#1e3a5f',padding:'13px 18px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ color:'#fff',fontSize:'14px',fontWeight:700,display:'flex',alignItems:'center',gap:'8px' }}><FaSearch aria-hidden="true"/> রেকর্ড খুঁজুন — Update</div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)',border:'none',borderRadius:'7px',padding:'5px 9px',cursor:'pointer',color:'#fff' }} aria-label="Close"><FaTimes aria-hidden="true"/></button>
        </div>
        <div style={{ padding:'14px 18px',borderBottom:'1px solid #f1f5f9' }}>
          <div style={{ fontSize:'11.5px',color:'#64748b',marginBottom:'8px' }}>{label??'কার্ড নং, আইডি বা নাম দিয়ে খুঁজুন'}</div>
          <div style={{ display:'flex',gap:'8px' }}>
            <input autoFocus type="text" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="টাইপ করুন..." style={{ flex:1,padding:'8px 12px',border:'1.5px solid #e2e8f0',borderRadius:'8px',fontSize:'13.5px',fontFamily:'inherit',outline:'none' }} />
            <button onClick={search} disabled={loading||!configured} style={{ padding:'8px 16px',background:'#1e40af',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontFamily:'inherit',fontSize:'13px',fontWeight:600 }}>{loading?'...':'খুঁজুন'}</button>
          </div>
          {!configured&&<div style={{ fontSize:'11.5px',color:'#f59e0b',marginTop:'6px' }}>ⓘ Google Sheets কনফিগার নেই</div>}
          {error&&<div role="alert" style={{ fontSize:'12px',color:'#dc2626',marginTop:'6px' }}>⚠ {error}</div>}
        </div>
        <div style={{ maxHeight:'300px',overflowY:'auto' }}>
          {results.length===0&&query&&!loading&&<div style={{ padding:'24px',textAlign:'center',color:'#94a3b8',fontSize:'13px' }}>কোনো রেকর্ড পাওয়া যায়নি</div>}
          {results.map(rec=>{
            const name=String(rec.employeeName??rec.fullName??rec.subject??rec.meetingTitle??'—');
            const sub=rec.cardNo?`Card: ${rec.cardNo}`:rec.date?`Date: ${rec.date}`:String(rec.savedAt??'').slice(0,10);
            return(
              <button key={String(rec.id??Math.random())} onClick={()=>{onSelect(rec);onClose();}}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:'12px',padding:'10px 18px',border:'none',borderBottom:'1px solid #f8fafc',background:'transparent',cursor:'pointer',fontFamily:'inherit',textAlign:'left' }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f0f9ff'}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='transparent'}>
                <div style={{ width:'34px',height:'34px',borderRadius:'8px',background:'#eff6ff',border:'1.5px solid #bfdbfe',display:'flex',alignItems:'center',justifyContent:'center',color:'#1d4ed8',flexShrink:0 }}><FaEdit aria-hidden="true" style={{ fontSize:'12px' }}/></div>
                <div>
                  <div style={{ fontSize:'13.5px',fontWeight:600,color:'#1e293b' }}>{name}</div>
                  <div style={{ fontSize:'11px',color:'#6b7280',marginTop:'1px' }}>ID: {String(rec.id)} {sub&&`· ${sub}`}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ModuleNavBar({
  tabs, activeTab, onTabChange,
  viewItems, activeViewItem,
  onSave, isSaving, saveDisabled,
  configured = true, adapterName = 'Database',
  onUpdate, updateModule, updateLabel, factoryId,
  onPrint, onPDF, onExcel, onWord,
  auth, onAuthChange, lang='en',
  editingId, onCancelEdit, onReset, extraButtons,
}: Props) {
  const [saved,setSaved]=useState(false);
  const [showUpdate,setShowUpdate]=useState(false);
  const hasExport=!!(onPDF||onExcel||onWord);

  const handleSave=async()=>{
    if(!onSave)return;
    const ok=await onSave();
    if(ok){setSaved(true);setTimeout(()=>setSaved(false),2500);}
  };

  return (
    <>
      {/* {editingId&&(
        <div style={{ background:'#fffbeb',borderBottom:'1.5px solid #fde68a',padding:'6px 16px',display:'flex',alignItems:'center',gap:'8px',fontSize:'12.5px',color:'#92400e',fontFamily:"'Noto Sans Bengali',Arial,sans-serif" }}>
          <FaEdit aria-hidden="true"/>
          <span>সম্পাদনা মোড — <strong>{editingId}</strong></span>
          {onCancelEdit&&<button onClick={onCancelEdit} style={{ marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'#b45309',display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:600,fontFamily:'inherit' }}><FaTimes aria-hidden="true"/> বাতিল</button>}
        </div>
      )} */}

      <div className="no-print" role="toolbar" aria-label="Module navigation"
        style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'6px',padding:'7px 14px',background:'#f8fafc',borderBottom:'2px solid #e2e8f0',fontFamily:"'Noto Sans Bengali',Arial,sans-serif" }}>

        {/* LEFT: tabs + view tabs + | + Save + Update */}
        <div style={{ display:'flex',alignItems:'center',gap:'4px',flexWrap:'wrap' }}>

          {tabs.map(tab=>{
            const isActive=activeTab===tab.id;
            return(
              <button key={tab.id} role="tab" aria-selected={isActive} disabled={tab.disabled} onClick={()=>!tab.disabled&&onTabChange(tab.id)}
                style={{ ...B, background:isActive?'#1e3a5f':'#fff', color:isActive?'#fff':'#475569', border:`1.5px solid ${isActive?'#1e3a5f':'#cbd5e1'}`, opacity:tab.disabled?0.4:1, cursor:tab.disabled?'not-allowed':'pointer', boxShadow:isActive?'0 1px 4px rgba(30,58,95,0.25)':'none' }}>
                {tab.label}
              </button>
            );
          })}

          {viewItems&&viewItems.length>0&&(
            <BillDropdown items={viewItems} activeViewItem={activeViewItem} />
          )}

          {(onSave||onUpdate||onReset)&&<div style={{ width:'1px',height:'22px',background:'#e2e8f0',margin:'0 3px',flexShrink:0 }}/>}

          {onSave&&(
            <button onClick={handleSave} disabled={!!(isSaving||saveDisabled||!configured)} aria-label={saved?'Saved':editingId?'Update':'Save'}
              style={{ ...B, background:saved?'#16a34a':editingId?'#d97706':'#2563eb', color:'#fff', opacity:(isSaving||saveDisabled||!configured)?0.6:1, cursor:(isSaving||saveDisabled||!configured)?'not-allowed':'pointer' }}>
              {isSaving?<span style={{ animation:'spin 0.8s linear infinite',display:'inline-block' }}>⟳</span>:<FaSave aria-hidden="true" style={{ fontSize:'11px' }}/>}
              {saved?(lang==='bn'?'✓ সংরক্ষিত':'✓ Saved'):isSaving?'...':(editingId?(lang==='bn'?'আপডেট':'Update'):(lang==='bn'?'সংরক্ষণ':'Save'))}
            </button>
          )}

          {onReset && (
            <button 
              onClick={() => {
                const msg = lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure you want to reset?';
                if (window.confirm(msg)) onReset();
              }}
              style={{ ...B, background: '#fff', color: '#ef4444', border: '1.5px solid #fecaca' }}
            >
              <FaTimes aria-hidden="true" style={{ fontSize: '11px' }} />
              {lang === 'bn' ? 'রিসেট' : 'Reset'}
            </button>
          )}

          {onUpdate&&(
            <button onClick={()=>setShowUpdate(true)} aria-label={lang==='bn'?'রেকর্ড আপডেট':'Update record'}
              style={{ ...B, background:'#fff', color:'#d97706', border:'1.5px solid #f59e0b' }}>
              <FaSearch aria-hidden="true" style={{ fontSize:'11px' }}/>
              {lang==='bn'?'আপডেট':'Update'}
            </button>
          )}
          {extraButtons}
        </div>

        {/* RIGHT: Auth | Print | Export */}
        <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
          {auth&&onAuthChange&&<AuthorityIconButton value={auth} onChange={onAuthChange} lang={lang}/>}
          {(onPrint||hasExport)&&<div style={{ width:'1px',height:'22px',background:'#e2e8f0',margin:'0 1px',flexShrink:0 }}/>}
          {onPrint&&(
            <button onClick={onPrint} aria-label={lang==='bn'?'প্রিন্ট':'Print'}
              style={{ ...B, background:'#fff', color:'#374151', border:'1.5px solid #d1d5db' }}>
              <FaPrint aria-hidden="true" style={{ fontSize:'11px' }}/>
              {lang==='bn'?'প্রিন্ট':'Print'}
            </button>
          )}
          {hasExport&&<ExportDropdown onPDF={onPDF} onExcel={onExcel} onWord={onWord}/>}
        </div>
      </div>

      {showUpdate&&onUpdate&&(
        <UpdateModal onSelect={onUpdate} onClose={()=>setShowUpdate(false)} module={updateModule} factoryId={factoryId} label={updateLabel}/>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
