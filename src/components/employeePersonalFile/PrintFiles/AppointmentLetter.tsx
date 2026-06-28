// ─────────────────────────────────────────────────────────────────────────────
// AppointmentLetter.tsx — Fully dynamic with formData
// All fields pull from EmployeeFormData — no hardcoded values
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  EmployeeFormData,
  getAppointmentConditions,
  AppointmentCondition,
} from '../../../types/employee.types';

interface Props { formData: EmployeeFormData; }

// ── Utilities ─────────────────────────────────────────────────────────────────

const fmtDate = (s?: string) => {
  if (!s) return '---';
  return new Date(s).toLocaleDateString('bn-BD', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const val = (v?: string | null, fallback = '---') =>
  v && v.trim() ? v.trim() : fallback;

// ── Styles (inline, print-safe) ───────────────────────────────────────────────

const page: React.CSSProperties = {
  background: '#fff',
  padding: '32px 40px',
  maxWidth: 794,
  margin: '0 auto',
  fontFamily: "'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', serif",
  fontSize: 13,
  color: '#1a1a1a',
  lineHeight: 1.8,
};

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '2px solid #1a1a1a',
  margin: '8px 0',
};

const thinDivider: React.CSSProperties = {
  ...divider,
  borderTopWidth: 1,
};

const center: React.CSSProperties = { textAlign: 'center' };

const bold: React.CSSProperties = { fontWeight: 700 };

const label: React.CSSProperties = {
  display: 'inline-block',
  minWidth: 130,
  fontWeight: 700,
};

// ── Main Component ────────────────────────────────────────────────────────────

const AppointmentLetter: React.FC<Props> = ({ formData }) => {
  const conditions = getAppointmentConditions(formData);

  // Build address strings
  const presentAddr = [
    (formData as any).presentHouseNo,
    formData.presentVillage,
    formData.presentPostOffice && `ডাকঘর: ${formData.presentPostOffice}`,
    formData.presentThana && `থানা: ${formData.presentThana}`,
    formData.presentDistrict && `জেলা: ${formData.presentDistrict}`,
  ].filter(Boolean).join(', ') || '---';

  const permanentAddr = [
    (formData as any).permanentHouseNo,
    formData.permanentVillage,
    formData.permanentPostOffice && `ডাকঘর: ${formData.permanentPostOffice}`,
    formData.permanentThana && `থানা: ${formData.permanentThana}`,
    formData.permanentDistrict && `জেলা: ${formData.permanentDistrict}`,
  ].filter(Boolean).join(', ') || '---';

  const idDisplay = val(formData.idNo) !== '---'
    ? formData.idNo
    : val(formData.cardNo);

  return (
    <div style={page}>
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .al-table td { padding: 3px 6px; vertical-align: top; }
        .al-cond-table td { padding: 2px 4px; vertical-align: top; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ ...center, marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>
          {val(formData.companyName, 'Company Name')}
        </div>
        <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>
          {val(formData.companyAddress)}
        </div>
        <hr style={{ ...divider, marginTop: 10 }} />
        <hr style={{ ...thinDivider, marginTop: 3 }} />
        <div style={{ fontSize: 18, fontWeight: 900, marginTop: 8 }}>
          নিয়োগ পত্র
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>(Appointment Letter)</div>
      </div>

      {/* ── Ref & Date ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
        <div>
          <span style={bold}>সূত্র নং: </span>
          {val(formData.companyName, 'কোং')}/{val(idDisplay)}/{fmtDate(formData.joiningDate)}
        </div>
        <div>
          <span style={bold}>তারিখ: </span>
          {fmtDate(formData.joiningDate)} ইং
        </div>
      </div>

      {/* ── প্রতি ── */}
      <div style={{ marginBottom: 4 }}>
        <div style={bold}>প্রতি,</div>
      </div>

      {/* ── Address Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, border: '1.5px solid #1a1a1a' }} className="al-table">
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ ...bold, padding: '5px 8px', border: '1px solid #1a1a1a', textAlign: 'center', width: '50%' }}>
              বর্তমান ঠিকানা
            </th>
            <th style={{ ...bold, padding: '5px 8px', border: '1px solid #1a1a1a', textAlign: 'center', width: '50%' }}>
              স্থায়ী ঠিকানা
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ verticalAlign: 'top' }}>
            <td style={{ border: '1px solid #1a1a1a', padding: '6px 10px' }}>
              <div><span style={label}>নাম</span>: {val(formData.fullName)}</div>
              <div><span style={label}>বাড়ি/রাস্তা</span>: {val((formData as any).presentHouseNo)}</div>
              <div><span style={label}>গ্রাম</span>: {val(formData.presentVillage)}</div>
              <div><span style={label}>ডাকঘর</span>: {val(formData.presentPostOffice)}</div>
              <div><span style={label}>থানা</span>: {val(formData.presentThana)}</div>
              <div><span style={label}>জেলা</span>: {val(formData.presentDistrict)}</div>
            </td>
            <td style={{ border: '1px solid #1a1a1a', padding: '6px 10px' }}>
              <div><span style={label}>নাম</span>: {val(formData.fullName)}</div>
              <div><span style={label}>পিতার নাম</span>: {val(formData.fatherName)}</div>
              <div><span style={label}>বাড়ি/রাস্তা</span>: {val((formData as any).permanentHouseNo)}</div>
              <div><span style={label}>গ্রাম</span>: {val(formData.permanentVillage)}</div>
              <div><span style={label}>ডাকঘর</span>: {val(formData.permanentPostOffice)}</div>
              <div><span style={label}>থানা</span>: {val(formData.permanentThana)}</div>
              <div><span style={label}>জেলা</span>: {val(formData.permanentDistrict)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── নিয়োগ বিবরণ ── */}
      <div style={{ border: '1.5px solid #1a1a1a', padding: '8px 12px', marginBottom: 14, background: '#fafafa' }}>
        <div style={{ ...bold, marginBottom: 6, fontSize: 14 }}>নিয়োগ বিবরণ:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }} className="al-table">
          <tbody>
            <tr>
              <td style={{ width: '50%' }}>
                <span style={label}>নাম</span>: {val(formData.fullName)}
              </td>
              <td>
                <span style={label}>আইডি নং</span>: {val(idDisplay)}
              </td>
            </tr>
            <tr>
              <td>
                <span style={label}>পদবী</span>: {val(formData.designation)}
              </td>
              <td>
                <span style={label}>বিভাগ</span>: {val(formData.department || formData.sectionLine)}
              </td>
            </tr>
            <tr>
              <td>
                <span style={label}>কার্ড নং</span>: {val(formData.cardNo)}
              </td>
              <td>
                <span style={label}>গ্রেড</span>: {val(formData.grade)}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <span style={label}>যোগদানের তারিখ</span>: {fmtDate(formData.joiningDate)} ইং
              </td>
            </tr>
            {formData.nid && (
              <tr>
                <td>
                  <span style={label}>জাতীয় পরিচয়পত্র</span>: {formData.nid}
                </td>
                <td>
                  <span style={label}>মোবাইল</span>: {val(formData.mobile)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Conditions ── */}
      <div style={{ marginBottom: 16 }}>
        {conditions.map((cond: AppointmentCondition) => (
          <ConditionBlock key={String(cond.id)} cond={cond} />
        ))}
      </div>

      {/* ── Signature ── */}
      <hr style={{ ...divider, marginTop: 24 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1.5px solid #1a1a1a', width: 180, marginBottom: 4 }} />
          <div style={bold}>স্বাক্ষর : শ্রমিক</div>
          <div style={{ fontSize: 11, color: '#555' }}>(Employee Signature)</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{val(formData.fullName)}</div>
          <div style={{ fontSize: 12 }}>{fmtDate(formData.joiningDate)} ইং</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1.5px solid #1a1a1a', width: 180, marginBottom: 4 }} />
          <div style={bold}>স্বাক্ষর : কর্তৃপক্ষ</div>
          <div style={{ fontSize: 11, color: '#555' }}>(Authority Signature)</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{val(formData.companyName)}</div>
        </div>
      </div>
    </div>
  );
};

// ── Condition Block ───────────────────────────────────────────────────────────

const ConditionBlock: React.FC<{ cond: AppointmentCondition }> = ({ cond }) => {
  // Salary breakdown table
  if (cond.subConditions && String(cond.id) === '2') {
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontWeight: 700 }}>{cond.title}:</div>
        <table style={{ marginLeft: 24, marginTop: 4, borderCollapse: 'collapse' }} className="al-cond-table">
          <tbody>
            {cond.subConditions.map((sub, i) => (
              <tr key={i} style={{
                borderTop: sub.key === 'মোট' ? '1.5px solid #1a1a1a' : 'none',
                fontWeight: sub.key === 'মোট' ? 700 : 400,
              }}>
                <td style={{ paddingRight: 12 }}>{sub.key}</td>
                <td>: {sub.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Sub-condition list
  if (cond.subConditions) {
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontWeight: 700 }}>
          {cond.title}{cond.content ? `: ${cond.content}` : ''}
        </div>
        <div style={{ marginLeft: 24 }}>
          {cond.subConditions.map((sub, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <span style={{ minWidth: 26, fontWeight: 700 }}>{sub.key}</span>
              <span>{sub.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Plain text condition
  return (
    <div style={{ marginBottom: 6 }}>
      {cond.title && (
        <span style={{ fontWeight: 700 }}>{cond.title}{cond.content ? ' ' : ''}</span>
      )}
      {cond.content}
    </div>
  );
};

export default AppointmentLetter;