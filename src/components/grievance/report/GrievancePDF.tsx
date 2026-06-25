// GrievancePDF v7 — PieChart via Circle strokeDasharray, safe() via T wrapper
import React from 'react';
import {
  Document, Page, View, Text, StyleSheet, Font, Svg, Circle,
} from '@react-pdf/renderer';
import type { AuthorizationState } from '../../common/AuthorizationBlock';
import type { Grievance } from '../shared/types';
import { FLOW_STEPS, STATUS_COLORS, URGENCY_COLORS } from '../shared/constants';

// ── Register Noto Sans Bengali ────────────────────────────────────────────────
// ── Font assets imported via Vite ?url — resolves to absolute URL at build time
// This is required because @react-pdf/renderer fetches fonts in a Web Worker
// where relative paths like '/fonts/...' do not resolve correctly.
import NotoRegularUrl from '../../../assets/fonts/NotoSansBengali-Regular.ttf?url';
import NotoBoldUrl    from '../../../assets/fonts/NotoSansBengali-Bold.ttf?url';

// ── Register Noto Sans Bengali ────────────────────────────────────────────────
Font.register({
  family: 'RMS-Bengali',
  fonts: [
    { src: NotoRegularUrl, fontWeight: 400 },
    { src: NotoBoldUrl,    fontWeight: 700 },
  ],
});
// Disable hyphenation — reduces complex shaping that can trigger fontkit bugs
Font.registerHyphenationCallback(word => [word]);

// ── Constants ────────────────────────────────────────────────────────────────
const MONTHS_BN = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const URGENCY_KEYS = ['জরুরি','বেশি','মাঝারি','কম'] as const;

const URG_COLOR: Record<string,string> = { 'জরুরি':'#A32D2D','বেশি':'#993C1D','মাঝারি':'#854F0B','কম':'#3B6D11' };
const URG_BG:    Record<string,string> = { 'জরুরি':'#FCEBEB','বেশি':'#FAECE7','মাঝারি':'#FAEEDA','কম':'#EAF3DE' };

// ── Safe text: replace Bengali conjuncts that crash fontkit's anchor lookup ──
// Only পর্যালোচনাধীন (র্য) is known to crash — replace with safe alternative
const SAFE: Record<string,string> = {
  'পর্যালোচনাধীন': 'পর্যালোচনা চলছে',  // avoid র্য — use র্য-free phrase? no, still র্য
};
// Actual fix: replace the র্য sequence with ZWNJ to prevent ligature shaping
function safe(text: string): string {
  if (!text) return text;
  // র্X conjuncts ALL crash fontkit (র্ব, র্য, র্ট, র্ম, etc.)
  // Insert ZWNJ (U+200C) to break every র্ ligature without visible change
  return String(text).replace(/র্/g, 'র‌্');
}

// ── SafeText: auto-applies safe() to ALL text — no need to wrap individually ──
// This is the only reliable way to ensure every Bengali string is processed
function T({ children, style }: { children?: React.ReactNode; style?: object }) {
  const text = children == null ? '' :
    typeof children === 'string' || typeof children === 'number'
      ? safe(String(children))
      : children;
  return <Text style={style as any}>{text}</Text>;
}

// ── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:       { fontFamily:'RMS-Bengali', fontSize:9, padding:'12mm 14mm', color:'#1e293b', backgroundColor:'#fff' },
  coverBand:  { backgroundColor:'#0f2442', padding:14, borderRadius:6, marginBottom:10 },
  coverRow:   { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  kpiGrid:    { flexDirection:'row', borderRadius:4, overflow:'hidden', marginTop:8 },
  kpiCell:    { flex:1, backgroundColor:'rgba(255,255,255,0.10)', padding:8, alignItems:'center', marginRight:1 },
  row2:       { flexDirection:'row', gap:10, marginBottom:12 },
  col:        { flex:1 },
  secLbl:     { fontSize:7, fontWeight:700, color:'#0f2442', borderBottom:'1.5px solid #0f2442', paddingBottom:3, marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 },
  tblHdr:     { flexDirection:'row', backgroundColor:'#1e3a5f', padding:'4px 5px', borderTopLeftRadius:2, borderTopRightRadius:2 },
  tblRow:     { flexDirection:'row', padding:'4px 5px', borderBottom:'1px solid #f1f5f9' },
  tblRowAlt:  { flexDirection:'row', padding:'4px 5px', borderBottom:'1px solid #f1f5f9', backgroundColor:'#f8fafc' },
  tblFoot:    { flexDirection:'row', padding:'4px 5px', backgroundColor:'#f8fafc', borderTop:'1.5px solid #e2e8f0' },
  badge:      { borderRadius:6, paddingHorizontal:4, paddingVertical:1 },
  barWrap:    { flexDirection:'row', alignItems:'flex-end', gap:3, height:65 },
  barCol:     { flex:1, alignItems:'center', gap:1 },
  authRow:    { flexDirection:'row', gap:10, marginTop:8 },
  authBlock:  { flex:1, borderTop:'1px solid #94a3b8', paddingTop:5 },
  footer:     { borderTop:'1px solid #000', paddingTop:5, marginTop:10, flexDirection:'row', justifyContent:'space-between' },
  // Status/urgency badges — must be in StyleSheet, NOT inline
  // (borderRadius + paddingHorizontal/paddingVertical inline = react-pdf crash)
  badgeStatus:  { borderRadius:6, paddingHorizontal:4, paddingVertical:2 },
  badgeUrgency: { borderRadius:6, paddingHorizontal:4, paddingVertical:2 },
});

// ── PieChart using SVG Circle + strokeDasharray (no Path arcs — avoids fontkit crash)
function PieChart({ items, size=100 }: { items:{label:string;count:number;color:string}[]; size?:number }) {
  const total = items.filter(i=>i.count>0).reduce((a,i)=>a+i.count,0);
  const cx=size/2, cy=size/2, r=size/2-10;
  const circ = 2*Math.PI*r;
  if (total===0) return (
    <View style={{ width:size, height:size, borderRadius:size/2, backgroundColor:'#f1f5f9', alignItems:'center', justifyContent:'center' }}>
      <T style={{ fontSize:7, color:'#94a3b8' }}>—</T>
    </View>
  );
  // Build slices with cumulative offset
  let cumPct=0;
  const slices = items.filter(i=>i.count>0).map(i=>{
    const pct=(i.count/total)*100;
    const slice={ pct, color:i.color, offset:cumPct };
    cumPct+=pct;
    return slice;
  });
  return (
    <View>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={r*0.55}/>
        {/* Slices — stacked circles with strokeDasharray */}
        {slices.map((s,i)=>(
          <Circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth={r*0.55}
            {...{
              strokeDasharray: `${((s.pct/100)*circ).toFixed(2)} ${circ.toFixed(2)}`,
              strokeDashoffset: (-((s.offset/100)*circ)+circ/4).toFixed(2),
            } as object}
          />
        ))}
        {/* White donut hole */}
        <Circle cx={cx} cy={cy} r={r*0.4} fill="#fff"/>
      </Svg>
      {/* Legend */}
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4, marginTop:4 }}>
        {items.filter(i=>i.count>0).map((it,i)=>(
          <View key={i} style={{ flexDirection:'row', alignItems:'center', gap:3 }}>
            <View style={{ width:7, height:7, borderRadius:1, backgroundColor:it.color }}/>
            <T style={{ fontSize:6, color:'#374151' }}>{it.label} ({it.count})</T>
          </View>
        ))}
      </View>
    </View>
  );
}


function BarChart({ data, total }: { data:{label:string;count:number}[]; total:number }) {
  const max  = Math.max(...data.map(d=>d.count), 1);
  const MAXH = 52;
  return (
    <View style={S.barWrap}>
      {data.map((d,i)=>{
        const h   = Math.max(Math.round((d.count/max)*MAXH), d.count>0?3:0);
        const pct = total>0?Math.round((d.count/total)*100):0;
        return (
          <View key={i} style={S.barCol}>
            <T style={{ fontSize:6, fontWeight:700, color:'#374151' }}>{d.count}</T>
            <View style={{ width:'100%', height:MAXH, justifyContent:'flex-end' }}>
              <View style={{ height:h, backgroundColor:'#1e3a5f', borderTopLeftRadius:2, borderTopRightRadius:2, width:'100%' }}/>
            </View>
            <T style={{ fontSize:5, textAlign:'center' as const, color:'#374151', lineHeight:1 }}>{safe(d.label)}</T>
            <T style={{ fontSize:5, color:'#64748b' }}>{pct}%</T>
          </View>
        );
      })}
    </View>
  );
}

// ── Signatory type (resolved from factory authorities by caller) ───────────────
export interface Signatory {
  label: string;
  name:  string;
  desig: string;
  show:  boolean;
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface GrievancePDFProps {
  grievances:  Grievance[];
  month:       number;
  year:        number;
  lang:        'bn' | 'en';
  auth:        AuthorizationState;
  signatories: Signatory[];   // resolved by caller using useFactory()
  factoryName: string;
  factoryAddr: string;
}

// ── Document ─────────────────────────────────────────────────────────────────
export function GrievancePDFDocument({
  grievances, month, year, lang, signatories, factoryName, factoryAddr,
}: GrievancePDFProps) {
  const t_month = lang==='bn' ? MONTHS_BN[month] : MONTHS_EN[month];
  const today   = new Date().toLocaleDateString('en-GB');
  const lastDay = new Date(year, month+1, 0).getDate();
  const today_ts = Date.now();

  const filtered = grievances.filter(g => {
    if (!g.SubmittedAt) return false;
    const d = new Date(g.SubmittedAt);
    return d.getMonth()===month && d.getFullYear()===year;
  });

  const total = filtered.length;

  const statusRows = FLOW_STEPS.map(s=>({
    label:s.status, color:STATUS_COLORS[s.status]||'#888',
    count:filtered.filter(g=>g.Status===s.status).length,
  }));
  const resolved = filtered.filter(g=>g.Status==='সমাধান হয়েছে'||g.Status==='বন্ধ').length;
  const pending  = total-resolved;

  const urgencyRows = URGENCY_KEYS.map(u=>({
    label:u, color:URG_COLOR[u]||'#888',
    count:filtered.filter(g=>g.Urgency===u).length,
  }));

  const catMap:Record<string,number>={};
  filtered.forEach(g=>{ catMap[g.Category]=(catMap[g.Category]||0)+1; });
  const catRows = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([label,count])=>({label,count}));

  const deptMap:Record<string,number>={};
  filtered.forEach(g=>{ if(g.Department) deptMap[g.Department]=(deptMap[g.Department]||0)+1; });
  const deptRows = Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).map(([label,count])=>({label,count}));

  const avgDays = total>0
    ? (filtered.reduce((a,g)=>{
        const s=g.SubmittedAt?new Date(g.SubmittedAt).getTime():today_ts;
        return a+Math.round((today_ts-s)/86400000);
      },0)/total).toFixed(1)
    : '—';

  const titleText    = lang==='bn'?safe('কর্মী অভিযোগ মাসিক প্রতিবেদন'):'Monthly Employee Grievance Report';
  const confidential = lang==='bn'?'গোপনীয় — শুধুমাত্র অভ্যন্তরীণ ব্যবহার':'Confidential — internal use only';
  const authNote     = lang==='bn'
    ? `এই প্রতিবেদন এইচআর ও কমপ্লায়েন্স বিভাগ কর্তৃক প্রস্তুত। প্রতিবেদনের সময়কাল: ${t_month} 1–${lastDay}, ${year}.`
    : `This report has been prepared by the HR & Compliance Division. Reporting period: ${t_month} 1-${lastDay}, ${year}.`;

  const visibleSigs = signatories.filter(s=>s.show);

  return (
    <Document title={titleText} author={factoryName} creator="RMS V16">
      <Page size="A4" style={S.page} wrap>

        {/* Cover */}
        <View style={S.coverBand}>
          <View style={S.coverRow}>
            <View style={{ flex:1 }}>
              <T style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:2 }}>{safe(factoryName)}</T>
              <T style={{ fontSize:7,  color:'rgba(255,255,255,0.55)' }}>{safe(factoryAddr)}</T>
              <T style={{ fontSize:13, fontWeight:700, color:'#fff', marginTop:8 }}>{titleText}</T>
              <T style={{ fontSize:7,  color:'rgba(255,255,255,0.5)', marginTop:2 }}>{t_month} 1–{lastDay}, {year}</T>
            </View>
            <View style={{ alignItems:'flex-end' }}>
              <T style={{ fontSize:6, color:'rgba(255,255,255,0.5)', marginBottom:2 }}>{lang==='bn'?'মুদ্রণের তারিখ':'Print date'}</T>
              <T style={{ fontSize:9, fontWeight:700, color:'#fff' }}>{today}</T>
            </View>
          </View>
          <View style={S.kpiGrid}>
            {[
              { v:String(total),    l:lang==='bn'?'মোট দাখিল':'Total filed' },
              { v:String(resolved), l:lang==='bn'?'সমাধান':'Resolved'       },
              { v:String(pending),  l:lang==='bn'?'অমীমাংসিত':'Pending'     },
              { v:String(avgDays),  l:lang==='bn'?'গড় দিন':'Avg. days'      },
            ].map(({v,l},i)=>(
              <View key={i} style={S.kpiCell}>
                <T style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{v}</T>
                <T style={{ fontSize:6,  color:'rgba(255,255,255,0.5)', marginTop:2 }}>{l}</T>
              </View>
            ))}
          </View>
        </View>

        {/* S1 + S2 */}
        <View style={S.row2}>
          <View style={S.col}>
            <T style={S.secLbl}>{lang==='bn'?'০১  স্ট্যাটাস বিশ্লেষণ':'01  Status breakdown'}</T>
            <PieChart items={statusRows.map(r=>({label:r.label,count:r.count,color:r.color}))} size={100}/>
          </View>
          <View style={S.col}>
            <T style={S.secLbl}>{lang==='bn'?'০২  জরুরিত্ব বিশ্লেষণ':'02  Urgency breakdown'}</T>
            <PieChart items={urgencyRows.map(r=>({label:r.label,count:r.count,color:r.color}))} size={100}/>
          </View>
        </View>

        {/* S3 + S4 */}
        {(catRows.length>0||deptRows.length>0) && (
          <View style={S.row2}>
            {catRows.length>0&&(
              <View style={S.col}>
                <T style={S.secLbl}>{lang==='bn'?'০৩  বিভাগভিত্তিক বিশ্লেষণ':'03  Category breakdown'}</T>
                <BarChart data={catRows} total={total}/>
              </View>
            )}
            {deptRows.length>0&&(
              <View style={S.col}>
                <T style={S.secLbl}>{lang==='bn'?'০৪  বিভাগ/সেকশনভিত্তিক সারাংশ':'04  Department summary'}</T>
                <BarChart data={deptRows} total={total}/>
              </View>
            )}
          </View>
        )}

        {/* S5 Case register */}
        <T style={[S.secLbl,{marginBottom:6}]}>{lang==='bn'?'০৫  মামলা রেজিস্টার':'05  Case register'}</T>
        {total===0 ? (
          <T style={{ fontSize:8, color:'#94a3b8', marginBottom:12 }}>{lang==='bn'?'এই মাসে কোনো অভিযোগ নেই।':'No grievances filed this month.'}</T>
        ) : (
          <View style={{ marginBottom:12, border:'1px solid #e2e8f0', borderRadius:4, overflow:'hidden' }}>
            {/* Header */}
            <View style={S.tblHdr}>
              {[
                {w:'10%',l:lang==='bn'?'তারিখ':'Date'},
                {w:'17%',l:lang==='bn'?'কেস আইডি':'Case ID'},
                {w:'12%',l:lang==='bn'?'কর্মী':'Worker'},
                {w:'18%',l:lang==='bn'?'বিভাগ/সেকশন':'Dept'},
                {w:'16%',l:lang==='bn'?'ধরন':'Category'},
                {w:'14%',l:lang==='bn'?'স্ট্যাটাস':'Status'},
                {w:'9%', l:lang==='bn'?'জরুরিত্ব':'Urgency'},
                {w:'4%', l:lang==='bn'?'দিন':'Days'},
              ].map(({w,l},i)=>(
                <View key={i} style={{ width:w }}>
                  <T style={{ fontSize:7, fontWeight:700, color:'#fff' }}>{l}</T>
                </View>
              ))}
            </View>
            {/* Rows */}
            {filtered.map((g,idx)=>{
              const daysOpen = g.SubmittedAt
                ? Math.round((today_ts-new Date(g.SubmittedAt).getTime())/86400000) : 0;
              const isDone    = g.Status==='সমাধান হয়েছে'||g.Status==='বন্ধ';
              const isOverdue = !isDone && daysOpen>5;
              const sClr = STATUS_COLORS[g.Status]||'#888';
              const uBg  = URG_BG[g.Urgency]   ||'#f8fafc';
              const uClr = URG_COLOR[g.Urgency] ||'#374151';
              const uBdr = URGENCY_COLORS[g.Urgency]?.border||'#e2e8f0';
              return (
                <View key={g.ID} style={idx%2===0?S.tblRow:S.tblRowAlt} wrap={false}>
                  <View style={{ width:'10%' }}>
                    <T style={{ fontSize:6, color:'#64748b' }}>{g.SubmittedAt?new Date(g.SubmittedAt).toLocaleDateString('en-GB'):'—'}</T>
                  </View>
                  <View style={{ width:'17%' }}>
                    <T style={{ fontSize:6, color:'#0f2442', fontWeight:700 }}>{safe(g.ID)}</T>
                  </View>
                  <View style={{ width:'12%' }}>
                    <T style={{ fontSize:6, color:'#374151' }}>{g.EmployeeID==='ANON'?(lang==='bn'?'বেনামী':'Anon'):safe(g.Name||'—')}</T>
                  </View>
                  <View style={{ width:'18%' }}>
                    <T style={{ fontSize:6, color:'#475569' }}>{g.Department||'—'}</T>
                  </View>
                  <View style={{ width:'16%' }}>
                    <T style={{ fontSize:6, color:'#475569' }}>{g.Category||'—'}</T>
                  </View>
                  <View style={{ width:'14%' }}>
                    <View style={[S.badgeStatus, { backgroundColor:sClr+'20' }]}>
                      <T style={{ fontSize:6, color:sClr, fontWeight:700 }}>{safe(g.Status)}</T>
                    </View>
                  </View>
                  <View style={{ width:'9%' }}>
                    <View style={[S.badgeUrgency, { backgroundColor:uBg }]}>
                      <T style={{ fontSize:6, color:uClr, fontWeight:700 }}>{safe(g.Urgency)}</T>
                    </View>
                  </View>
                  <View style={{ width:'4%' }}>
                    <T style={{ fontSize:6, color:isOverdue?'#A32D2D':'#374151', fontWeight:isOverdue?700:400 }}>
                      {daysOpen}{isOverdue?' ⚠':''}
                    </T>
                  </View>
                </View>
              );
            })}
            {/* Footer */}
            <View style={S.tblFoot}>
              <View style={{ flex:1 }}><T style={{ fontSize:7, fontWeight:700 }}>{lang==='bn'?'সর্বমোট':'Total'}</T></View>
              <View style={{ width:'4%' }}><T style={{ fontSize:7, fontWeight:700 }}>{total}</T></View>
            </View>
          </View>
        )}

        {/* S6 Authorisation */}
        <T style={S.secLbl}>{lang==='bn'?'০৬  অনুমোদন':'06  Authorisation'}</T>
        <T style={{ fontSize:7, color:'#64748b', marginBottom:8, lineHeight:1.5 }}>{authNote}</T>
        {visibleSigs.length>0&&(
          <View style={S.authRow}>
            {visibleSigs.map((s,i)=>(
              <View key={i} style={S.authBlock}>
                <T style={{ fontSize:7, fontWeight:700, color:'#0f2442' }}>{safe(s.name)||'_______________'}</T>
                <T style={{ fontSize:6, color:'#64748b', marginTop:1 }}>{s.label}</T>
                <T style={{ fontSize:6, color:'#94a3b8', marginTop:1 }}>{s.desig}</T>
                <T style={{ fontSize:5, color:'#94a3b8', marginTop:4 }}>{lang==='bn'?'স্বাক্ষর ও তারিখ':'Signature & date'}</T>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={S.footer} fixed>
          <T style={{ fontSize:6, color:'#374151' }}>{safe(factoryName)} · {confidential}</T>
          <T style={{ fontSize:6, color:'#374151' }}>RMS V16 · {t_month} {year}</T>
        </View>

      </Page>
    </Document>
  );
}