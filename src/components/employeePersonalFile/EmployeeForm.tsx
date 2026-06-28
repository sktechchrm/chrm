// ─────────────────────────────────────────────────────────────────────────────
// EmployeeForm.tsx — React Hook Form + Zod + FormField (LWN style)
// src/components/employeePersonalFile/EmployeeForm.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useMemo } from 'react';
import { useForm }           from 'react-hook-form';
import { zodResolver }       from '@hookform/resolvers/zod';
import { z }                 from 'zod';
import type { ChangeEvent }  from 'react';
import { FormField, Input, Select, Textarea } from '../common/FormField';
import {
  EmployeeFormData, EducationEntry, PreviousJobEntry, generateEntryId,
} from './employee.types';

// ── Zod schemas ───────────────────────────────────────────────────────────────

const IdentitySchema = z.object({
  fullName:            z.string().min(1, 'পূর্ণ নাম আবশ্যক'),
  fullNameBengali:     z.string().default(''),
  fatherName:          z.string().default(''),
  motherName:          z.string().default(''),
  dateOfBirth:         z.string().min(1, 'জন্ম তারিখ আবশ্যক'),
  gender:              z.string().min(1, 'লিঙ্গ নির্বাচন করুন'),
  bloodGroup:          z.string().default(''),
  maritalStatus:       z.string().default(''),
  nationality:         z.string().default(''),
  religion:            z.string().default(''),
  nid:                 z.string().default(''),
  birthRegistrationNo: z.string().default(''),
  passportNumber:      z.string().default(''),
  drivingLicense:      z.string().default(''),
  height:              z.string().default(''),
  weight:              z.string().default(''),
  identificationMark:  z.string().default(''),
  spouseName:          z.string().default(''),
  spouseDob:           z.string().default(''),
  spouseBloodGroup:    z.string().default(''),
  spouseProfession:    z.string().default(''),
  spousePhone:         z.string().default(''),
  spouseEducation:     z.string().default(''),
  numberOfSons:        z.string().default(''),
  numberOfDaughters:   z.string().default(''),
});

const ContactSchema = z.object({
  mobile:              z.string().default(''),
  email:               z.string().default(''),
  onnano:              z.string().default(''),
  // Present
  presentHouseNo:      z.string().default(''),
  presentUnion:        z.string().default(''),
  presentVillage:      z.string().default(''),
  presentPostOffice:   z.string().default(''),
  presentThana:        z.string().default(''),
  presentDistrict:     z.string().default(''),
  presentDivision:     z.string().default(''),
  // Permanent
  permanentHouseNo:    z.string().default(''),
  permanentUnion:      z.string().default(''),
  permanentVillage:    z.string().min(1, 'গ্রাম আবশ্যক'),
  permanentPostOffice: z.string().min(1, 'ডাকঘর আবশ্যক'),
  permanentThana:      z.string().min(1, 'থানা আবশ্যক'),
  permanentDistrict:   z.string().min(1, 'জেলা আবশ্যক'),
  permanentDivision:   z.string().default(''),
  emergencyName:       z.string().default(''),
  emergencyRelation:   z.string().default(''),
  emergencyMobile:     z.string().default(''),
  emergencyProfession: z.string().default(''),
});

const EmploymentSchema = z.object({
  idNo:                 z.string().min(1, 'আইডি নং আবশ্যক'),
  cardNo:               z.string().min(1, 'কার্ড নং আবশ্যক'),
  proximityNumber:      z.string().min(1, 'প্রক্সিমিটি নম্বর আবশ্যক'),
  grade:                z.string().min(1, 'গ্রেড আবশ্যক'),
  sectionLine:          z.string().min(1, 'সেকশন/লাইন আবশ্যক'),
  designation:          z.string().min(1, 'পদবি আবশ্যক'),
  department:           z.string().min(1, 'বিভাগ আবশ্যক'),
  joiningDate:          z.string().min(1, 'যোগদানের তারিখ আবশ্যক'),
  probationEndDate:     z.string().default(''),
  salary:               z.string().min(1, 'হাজিরা বোনাস আবশ্যক'),
  jobSource:            z.string().default(''),
  medicalAllowance:     z.string().default(''),
  transportAllowance:   z.string().default(''),
  foodAllowance:        z.string().default(''),
  tinNumber:            z.string().default(''),
  bankName:             z.string().default(''),
  bankAccountNo:        z.string().default(''),
  bankBranch:           z.string().default(''),
});

const NomineeSchema = z.object({
  nomineeName:         z.string().default(''),
  nomineeRelation:     z.string().default(''),
  nomineeNid:          z.string().default(''),
  nomineeDob:          z.string().default(''),
  nomineePercentage:   z.string().default(''),
  nomineeEducation:    z.string().default(''),
  nomineeProfession:   z.string().default(''),
  nomineeBloodGroup:   z.string().default(''),
  nomineePhone:        z.string().default(''),
  nomineeAddress:      z.string().default(''),
});

const SupervisorSchema = z.object({
  supervisorName:        z.string().default(''),
  supervisorOrg:         z.string().default(''),
  supervisorDesignation: z.string().default(''),
  supervisorProfession:  z.string().default(''),
  supervisorPhone:       z.string().default(''),
  supervisorRelation:    z.string().default(''),
  supervisorAddress:     z.string().default(''),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type FormStepId =
  | 'identity' | 'contact' | 'employment' | 'education'
  | 'previous' | 'nominee' | 'supervisor';

interface EmployeeFormProps {
  formData:          EmployeeFormData;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData:       (updater: (prev: EmployeeFormData) => EmployeeFormData) => void;
  activeStep:        FormStepId;
  onDirtyChange?:    (dirty: boolean) => void;
}

// ── Shared style tokens (same as LWN) ─────────────────────────────────────────

const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #E2E8F0',
  borderRadius: 12, padding: '16px 18px', marginBottom: 14,
};
const cardHead: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: '#0F2442', fontFamily: font,
  marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
};
const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const g3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 };
const g4: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 };

// ── useStepForm helper ────────────────────────────────────────────────────────

function useStepForm(
  schema: any,
  defaultValues: Record<string, any>,
  onDirtyChange?: (dirty: boolean) => void,
) {
  const form = useForm({
    resolver: zodResolver(schema) as any,
    mode: 'onBlur',
    defaultValues: defaultValues as any,
  });
  const { formState: { isDirty } } = form;
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);
  return form;
}

// ── ArrayTableForm ────────────────────────────────────────────────────────────

function ArrayTableForm<T extends { id: string }>({
  entries, fields, blankEntry, onChange, addLabel,
}: {
  entries:    T[];
  fields:     { key: keyof T; label: string; placeholder: string; type?: string; width?: string }[];
  blankEntry: () => T;
  onChange:   (entries: T[]) => void;
  addLabel:   string;
}) {
  React.useEffect(() => {
    if (entries.length === 0) onChange([blankEntry()]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const updateCell = (rowId: string, key: keyof T, value: string) => {
    const updated = entries.map(row => {
      if (row.id !== rowId) return row;
      const next = { ...row, [key]: value };
      // Auto-calculate শুরুর তারিখ = শেষ তারিখ − চাকরির বছর
      if ((key === 'prevEndDate' || key === 'prevServiceYears') && 'prevEndDate' in next && 'prevServiceYears' in next) {
        const endDate = (next as any).prevEndDate as string;
        const years   = parseFloat((next as any).prevServiceYears as string);
        if (endDate && !isNaN(years) && years > 0) {
          const end = new Date(endDate);
          end.setFullYear(end.getFullYear() - Math.floor(years));
          end.setMonth(end.getMonth() - Math.round((years % 1) * 12));
          (next as any).prevStartDate = end.toISOString().split('T')[0];
        }
      }
      return next;
    });
    onChange(updated);
  };
  const addRow    = () => onChange([blankEntry(), ...entries]);
  const removeRow = (rowId: string) => {
    const next = entries.filter(r => r.id !== rowId);
    onChange(next.length > 0 ? next : [blankEntry()]);
  };

  if (entries.length === 0) return null;

  return (
    <div>
      {/* Add button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button type="button" onClick={addRow} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px',
          borderRadius: 7, border: '1.5px solid #BFDBFE', background: '#EFF6FF',
          color: '#1D4ED8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font,
        }}>+ {addLabel}</button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E2E8F0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={thS}>#</th>
              {fields.map(f => (
                <th key={String(f.key)} style={{ ...thS, textAlign: 'left', width: f.width }}>
                  {f.label}
                </th>
              ))}
              <th style={{ ...thS, width: 44 }}>—</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((row, i) => (
              <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={tdC}>{i + 1}</td>
                {fields.map(f => (
                  <td key={String(f.key)} style={tdS}>
                    <input
                      type={f.type ?? 'text'}
                      value={(row[f.key] as string) ?? ''}
                      onChange={e => updateCell(row.id, f.key, e.target.value)}
                      placeholder={String(f.key) === 'prevStartDate' ? 'স্বয়ংক্রিয়' : f.placeholder}
                      readOnly={String(f.key) === 'prevStartDate'}
                      aria-label={`${f.label} — সারি ${i + 1}`}
                      style={{
                        width: '100%', padding: '7px 10px', border: 'none',
                        outline: 'none',
                        background: String(f.key) === 'prevStartDate' ? '#F8FAFC' : 'transparent',
                        fontSize: 13, fontWeight: 400, fontFamily: font,
                        color: String(f.key) === 'prevStartDate' ? '#64748B' : '#1A202C',
                        cursor: String(f.key) === 'prevStartDate' ? 'default' : 'text',
                      }}
                    />
                  </td>
                ))}
                <td style={tdC}>
                  <button type="button" onClick={() => removeRow(row.id)}
                    aria-label={`${i + 1} নং সারি মুছুন`}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#DC2626', fontSize: 14, fontWeight: 700, padding: '4px 8px',
                    }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thS: React.CSSProperties = {
  padding: '8px 10px', border: 'none',
  borderBottom: '1.5px solid #E2E8F0',
  fontSize: 11, fontWeight: 700, color: '#64748B',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  whiteSpace: 'nowrap', background: '#F8FAFC',
};
const tdS: React.CSSProperties = {
  padding: 0, borderBottom: '1px solid #F1F5F9',
  borderRight: '1px solid #F1F5F9',
};
const tdC: React.CSSProperties = {
  padding: '4px 8px', borderBottom: '1px solid #F1F5F9',
  textAlign: 'center', fontSize: 12, color: '#94A3B8',
};

// ── Address block (2-col, with houseNo, same checkbox) ────────────────────────

interface AddrField {
  id:        string;
  label:     string;
  required?: boolean;
  type?:     string;
  span?:     boolean; // full width
  value:     string;
  onChange:  (e: ChangeEvent<HTMLInputElement>) => void;
}

function AddressBlock({ title, fields, disabled, accent }: {
  title:    string;
  fields:   AddrField[];
  disabled: boolean;
  accent:   { border: string; bg: string };
}) {
  return (
    <div style={{
      flex: 1, minWidth: 220,
      border: `1px solid ${accent.border}`,
      borderRadius: 10, padding: '14px 16px',
      background: accent.bg,
      opacity: disabled ? 0.55 : 1,
      transition: 'opacity .2s',
    }}>
      <div style={{ ...cardHead, fontSize: 13, marginBottom: 12 }}>{title}</div>
      <div style={g2}>
        {fields.map(f => (
          <div key={f.id} style={f.span ? { gridColumn: '1/-1' } : {}}>
            <FormField label={f.label} id={f.id} required={f.required}>
              <Input
                id={f.id} name={f.id} type={f.type ?? 'text'}
                value={f.value} onChange={f.onChange}
                disabled={disabled}
                placeholder={f.label}
                aria-required={f.required ? true : undefined}
              />
            </FormField>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LawRef — reusable i-ball popup (Law Reference style) ────────────────────
// Used for: field hints, legal references, converters, auto-calc notes

interface LawRefProps {
  title:    string;           // popup heading
  children: React.ReactNode;  // popup body
  align?:   'left' | 'right'; // popup alignment (default right)
}

function LawRef({ title, children, align = 'right' }: LawRefProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* i ball */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={title}
        aria-expanded={open}
        style={{
          width: 20, height: 20, borderRadius: '50%',
          background: open ? '#1E40AF' : '#1D4ED8',
          color: '#fff', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none', flexShrink: 0,
          boxShadow: open ? '0 0 0 3px rgba(29,78,216,.2)' : 'none',
          transition: 'all .13s',
        }}>
        i
      </button>

      {/* Popup panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 98 }}
          />
          <div style={{
            position: 'absolute',
            top: 26,
            [align]: 0,
            zIndex: 99,
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '13px 15px',
            width: 220,
            boxShadow: '0 4px 24px rgba(0,0,0,.12)',
            fontFamily: font,
          }}>
            {/* Arrow */}
            <div style={{
              position: 'absolute', top: -6,
              [align === 'right' ? 'right' : 'left']: 7,
              width: 12, height: 12,
              background: '#fff', border: '1px solid #E2E8F0',
              borderRight: 'none', borderBottom: 'none',
              transform: 'rotate(45deg)',
            }} />
            {/* Header */}
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#1D4ED8',
              textTransform: 'uppercase', letterSpacing: '.04em',
              marginBottom: 8, display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{title}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94A3B8', fontSize: 14, lineHeight: 1, padding: 0,
                }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── InchToCmBall — uses LawRef panel ─────────────────────────────────────────

function InchToCmBall({ onConvert }: { onConvert: (cm: string) => void }) {
  const [inch, setInch] = useState('');
  const cm = inch ? (parseFloat(inch) * 2.54).toFixed(1) : '';

  return (
    <LawRef title="Inch → সেমি রূপান্তর">
      <input
        type="number"
        value={inch}
        onChange={e => setInch(e.target.value)}
        placeholder="Inch দিন (যেমন: 5.4)"
        style={{
          width: '100%', padding: '6px 10px',
          border: '1.5px solid #CBD5E1', borderRadius: 7,
          fontSize: 13, fontWeight: 600, outline: 'none',
          fontFamily: font, marginBottom: 6, boxSizing: 'border-box',
        }}
      />
      {cm && (
        <div style={{
          fontSize: 13, color: '#0F2442', fontWeight: 600,
          marginBottom: 8,
          background: '#EFF6FF', borderRadius: 6, padding: '4px 8px',
        }}>
          = {cm} সেমি
        </div>
      )}
      <button
        type="button"
        disabled={!cm}
        onClick={() => { if (cm) { onConvert(cm); setInch(''); } }}
        style={{
          width: '100%', padding: '6px 0', borderRadius: 7,
          border: 'none',
          background: cm ? '#1D4ED8' : '#E2E8F0',
          color: cm ? '#fff' : '#94A3B8',
          fontSize: 12, fontWeight: 600,
          cursor: cm ? 'pointer' : 'not-allowed',
        }}>
        উচ্চতায় ব্যবহার করুন
      </button>
    </LawRef>
  );
}

// ── Identity Step ─────────────────────────────────────────────────────────────

function IdentityStep({ formData, handleInputChange, onDirtyChange }: EmployeeFormProps) {
  useStepForm(IdentitySchema, {
    fullName: formData.fullName, fullNameBengali: formData.fullNameBengali,
    fatherName: formData.fatherName, motherName: formData.motherName,
    dateOfBirth: formData.dateOfBirth, gender: formData.gender,
    bloodGroup: formData.bloodGroup, maritalStatus: formData.maritalStatus,
    nationality: formData.nationality, religion: formData.religion,
    nid: formData.nid, birthRegistrationNo: formData.birthRegistrationNo,
    passportNumber: formData.passportNumber, drivingLicense: (formData as any).drivingLicense ?? '', height: formData.height,
    weight: formData.weight, identificationMark: formData.identificationMark,
    spouseName: formData.spouseName, spouseDob: formData.spouseDob,
    spouseBloodGroup: formData.spouseBloodGroup, spouseProfession: formData.spouseProfession,
    spousePhone: formData.spousePhone, spouseEducation: formData.spouseEducation,
    numberOfSons: formData.numberOfSons, numberOfDaughters: formData.numberOfDaughters,
  }, onDirtyChange);

  const inp = (name: string, type = 'text', ph = '') => ({
    id: `ef-${name}`, name, type,
    value: (formData as any)[name] ?? '',
    onChange: handleInputChange, placeholder: ph,
  });

  return (
    <div>
      {/* A. ব্যক্তিগত তথ্য */}
      <div style={card}>
        <div style={cardHead}>A. ব্যক্তিগত তথ্য</div>
        <div style={g4}>
          <FormField label="পূর্ণ নাম (ইংরেজি)" id="ef-fullName" required>
            <Input {...inp('fullName','text','Full Name')} aria-required={true} />
          </FormField>
          <FormField label="পূর্ণ নাম (বাংলা)" id="ef-fullNameBengali">
            <Input {...inp('fullNameBengali','text','বাংলা নাম')} />
          </FormField>
          <FormField label="পিতার নাম" id="ef-fatherName">
            <Input {...inp('fatherName','text','পিতার নাম')} />
          </FormField>
          <FormField label="মাতার নাম" id="ef-motherName">
            <Input {...inp('motherName','text','মাতার নাম')} />
          </FormField>
          <FormField label="জন্ম তারিখ" id="ef-dateOfBirth" required>
            <Input {...inp('dateOfBirth','date')} aria-required={true} />
          </FormField>
          <FormField label="লিঙ্গ" id="ef-gender" required>
            <Select id="ef-gender" name="gender"
              value={formData.gender} onChange={handleInputChange}
              aria-required={true} placeholder="নির্বাচন করুন"
              options={[
                { value: 'Male',   label: 'পুরুষ (Male)'          },
                { value: 'Female', label: 'নারী (Female)'          },
                { value: 'Other',  label: 'অ-দ্বৈত / তৃতীয় লিঙ্গ' },
              ]} />
          </FormField>
          <FormField label="রক্তের গ্রুপ" id="ef-bloodGroup">
            <Select id="ef-bloodGroup" name="bloodGroup"
              value={formData.bloodGroup} onChange={handleInputChange}
              placeholder="নির্বাচন করুন"
              options={['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g=>({value:g,label:g}))} />
          </FormField>
          <FormField label="বৈবাহিক অবস্থা" id="ef-maritalStatus">
            <Select id="ef-maritalStatus" name="maritalStatus"
              value={formData.maritalStatus} onChange={handleInputChange}
              placeholder="নির্বাচন করুন"
              options={[
                { value: 'Single',   label: 'অবিবাহিত'   },
                { value: 'Married',  label: 'বিবাহিত'     },
                { value: 'Divorced', label: 'তালাকপ্রাপ্ত' },
              ]} />
          </FormField>
          <FormField label="জাতীয়তা" id="ef-nationality">
            <Input {...inp('nationality','text','যেমন: বাংলাদেশি')} />
          </FormField>
          <FormField label="ধর্ম" id="ef-religion">
            <Input {...inp('religion','text','যেমন: ইসলাম')} />
          </FormField>
          <FormField label="উচ্চতা (সেমি)" id="ef-height">
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Input {...inp('height','text','যেমন: 165')} style={{ flex: 1 }} />
              {/* inch → cm converter i-ball */}
              <InchToCmBall onConvert={(cm: string) =>
                handleInputChange({ target: { name: 'height', value: cm } } as any)
              } />
            </div>
          </FormField>
          <FormField label="ওজন (কেজি)" id="ef-weight">
            <Input {...inp('weight','text','যেমন: 60')} />
          </FormField>
          <FormField label="জাতীয় পরিচয়পত্র নং" id="ef-nid">
            <Input {...inp('nid','text','NID নম্বর')} />
          </FormField>
          <FormField label="জন্ম নিবন্ধন নং" id="ef-birthRegistrationNo">
            <Input {...inp('birthRegistrationNo','text','জন্ম নিবন্ধন নং')} />
          </FormField>
          <FormField label="পাসপোর্ট নং" id="ef-passportNumber">
            <Input {...inp('passportNumber','text','পাসপোর্ট নং')} />
          </FormField>
          <FormField label="ড্রাইভিং লাইসেন্স" id="ef-drivingLicense">
            <Input id="ef-drivingLicense" name="drivingLicense" type="text"
              value={(formData as any).drivingLicense ?? ''}
              onChange={handleInputChange}
              placeholder="ড্রাইভিং লাইসেন্স নং" />
          </FormField>
          <div style={{ gridColumn: '1/-1' }}>
            <FormField label="সনাক্তকরণ চিহ্ন" id="ef-identificationMark">
              <Input {...inp('identificationMark','text','সনাক্তকরণ চিহ্ন')} />
            </FormField>
          </div>
        </div>
      </div>

      {/* B. পরিবার */}
      <div style={card}>
        <div style={cardHead}>B. পরিবার</div>
        <div style={g4}>
          <FormField label="স্বামী/স্ত্রীর নাম" id="ef-spouseName">
            <Input {...inp('spouseName','text','স্বামী/স্ত্রীর নাম')} />
          </FormField>
          <FormField label="স্বামী/স্ত্রীর জন্ম তারিখ" id="ef-spouseDob">
            <Input {...inp('spouseDob','date')} />
          </FormField>
          <FormField label="স্বামী/স্ত্রীর রক্তের গ্রুপ" id="ef-spouseBloodGroup">
            <Input {...inp('spouseBloodGroup','text','রক্তের গ্রুপ')} />
          </FormField>
          <FormField label="স্বামী/স্ত্রীর পেশা" id="ef-spouseProfession">
            <Input {...inp('spouseProfession','text','পেশা')} />
          </FormField>
          <FormField label="স্বামী/স্ত্রীর মোবাইল" id="ef-spousePhone">
            <Input {...inp('spousePhone','tel','মোবাইল নম্বর')} />
          </FormField>
          <FormField label="স্বামী/স্ত্রীর শিক্ষা" id="ef-spouseEducation">
            <Input {...inp('spouseEducation','text','শিক্ষাগত যোগ্যতা')} />
          </FormField>
          <FormField label="পুত্র সন্তান" id="ef-numberOfSons">
            <Input {...inp('numberOfSons','number','সংখ্যা')} />
          </FormField>
          <FormField label="কন্যা সন্তান" id="ef-numberOfDaughters">
            <Input {...inp('numberOfDaughters','number','সংখ্যা')} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// ── Contact Step ──────────────────────────────────────────────────────────────

function ContactStep({ formData, handleInputChange, setFormData, onDirtyChange }: EmployeeFormProps) {
  const [sameAddr, setSameAddr] = useState(false);

  useStepForm(ContactSchema, {
    mobile: formData.mobile, email: formData.email,
    onnano: (formData as any).onnano ?? '',
    presentHouseNo: (formData as any).presentHouseNo ?? '',
    presentUnion: formData.presentUnion, presentVillage: formData.presentVillage,
    presentPostOffice: formData.presentPostOffice, presentThana: formData.presentThana,
    presentDistrict: formData.presentDistrict, presentDivision: formData.presentDivision,
    permanentHouseNo: (formData as any).permanentHouseNo ?? '',
    permanentUnion: formData.permanentUnion, permanentVillage: formData.permanentVillage,
    permanentPostOffice: formData.permanentPostOffice, permanentThana: formData.permanentThana,
    permanentDistrict: formData.permanentDistrict, permanentDivision: formData.permanentDivision,
    emergencyName: formData.emergencyName, emergencyRelation: formData.emergencyRelation,
    emergencyMobile: formData.emergencyMobile, emergencyProfession: formData.emergencyProfession,
  }, onDirtyChange);

  const inp = (name: string, type = 'text', ph = '') => ({
    id: `ef-${name}`, name, type,
    value: (formData as any)[name] ?? '',
    onChange: handleInputChange, placeholder: ph,
  } as React.InputHTMLAttributes<HTMLInputElement> & { id: string });

  const handleSameAddr = (checked: boolean) => {
    setSameAddr(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permanentHouseNo:    (prev as any).presentHouseNo    ?? '',
        permanentUnion:      prev.presentUnion,
        permanentVillage:    prev.presentVillage,
        permanentPostOffice: prev.presentPostOffice,
        permanentThana:      prev.presentThana,
        permanentDistrict:   prev.presentDistrict,
        permanentDivision:   prev.presentDivision,
      } as any));
    }
  };

  const presFields: AddrField[] = [
    { id: 'presentHouseNo',    label: 'বাড়ি / বাড়ি নং / রাস্তা', span: true,  value: (formData as any).presentHouseNo ?? '',    onChange: handleInputChange as any },
    { id: 'presentUnion',      label: 'ইউনিয়ন / পৌরসভা',                       value: formData.presentUnion,      onChange: handleInputChange as any },
    { id: 'presentVillage',    label: 'গ্রাম',                                  value: formData.presentVillage,    onChange: handleInputChange as any },
    { id: 'presentPostOffice', label: 'ডাকঘর',                                  value: formData.presentPostOffice, onChange: handleInputChange as any },
    { id: 'presentThana',      label: 'থানা',                                   value: formData.presentThana,      onChange: handleInputChange as any },
    { id: 'presentDistrict',   label: 'জেলা',                                   value: formData.presentDistrict,   onChange: handleInputChange as any },
    { id: 'presentDivision',   label: 'বিভাগ',                                  value: formData.presentDivision,   onChange: handleInputChange as any },
  ];

  const permFields: AddrField[] = [
    { id: 'permanentHouseNo',    label: 'বাড়ি / বাড়ি নং / রাস্তা', span: true,  value: (formData as any).permanentHouseNo ?? '',    onChange: handleInputChange as any },
    { id: 'permanentUnion',      label: 'ইউনিয়ন / পৌরসভা',                       value: formData.permanentUnion,      onChange: handleInputChange as any },
    { id: 'permanentVillage',    label: 'গ্রাম',            required: true,      value: formData.permanentVillage,    onChange: handleInputChange as any },
    { id: 'permanentPostOffice', label: 'ডাকঘর',            required: true,      value: formData.permanentPostOffice, onChange: handleInputChange as any },
    { id: 'permanentThana',      label: 'থানা',             required: true,      value: formData.permanentThana,      onChange: handleInputChange as any },
    { id: 'permanentDistrict',   label: 'জেলা',             required: true,      value: formData.permanentDistrict,   onChange: handleInputChange as any },
    { id: 'permanentDivision',   label: 'বিভাগ',                                  value: formData.permanentDivision,   onChange: handleInputChange as any },
  ];

  return (
    <div>
      {/* A. যোগাযোগের তথ্য */}
      <div style={card}>
        <div style={cardHead}>A. যোগাযোগের তথ্য</div>
        <div style={g3}>
          <FormField label="মোবাইল নম্বর" id="ef-mobile">
            <Input {...inp('mobile','tel','01700000000')} />
          </FormField>
          <FormField label="ইমেইল ঠিকানা" id="ef-email">
            <Input {...inp('email','email','email@example.com')} />
          </FormField>
          <FormField label="অন্যান্য" id="ef-onnano">
            <Input {...inp('onnano','text','অন্যান্য যোগাযোগ')} />
          </FormField>
        </div>
      </div>

      {/* B. ঠিকানা */}
      <div style={card}>
        <div style={{ ...cardHead, justifyContent: 'space-between' }}>
          <span>B. ঠিকানা</span>
          {/* উভয় ঠিকানা একই checkbox */}
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: '#374151', fontFamily: font,
          }}>
            <input
              type="checkbox"
              checked={sameAddr}
              onChange={e => handleSameAddr(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#1D4ED8', cursor: 'pointer' }}
            />
            উভয় ঠিকানা একই
          </label>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <AddressBlock
            title="বর্তমান ঠিকানা"
            fields={presFields}
            disabled={false}
            accent={{ border: '#BFDBFE', bg: '#FAFEFF' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', color: '#CBD5E1', fontSize: 20 }} aria-hidden="true">
            {sameAddr ? '=' : '≠'}
          </div>
          <AddressBlock
            title="স্থায়ী ঠিকানা"
            fields={permFields}
            disabled={sameAddr}
            accent={{ border: sameAddr ? '#E2E8F0' : '#86EFAC', bg: sameAddr ? '#F8FAFC' : '#F0FDF4' }}
          />
        </div>
      </div>

      {/* C. জরুরি যোগাযোগ */}
      <div style={card}>
        <div style={cardHead}>C. জরুরি যোগাযোগ</div>
        <div style={g4}>
          <FormField label="নাম" id="ef-emergencyName">
            <Input {...inp('emergencyName','text','জরুরি যোগাযোগের নাম')} />
          </FormField>
          <FormField label="সম্পর্ক" id="ef-emergencyRelation">
            <Input {...inp('emergencyRelation','text','সম্পর্ক')} />
          </FormField>
          <FormField label="মোবাইল নম্বর" id="ef-emergencyMobile">
            <Input {...inp('emergencyMobile','tel','মোবাইল')} />
          </FormField>
          <FormField label="পেশা" id="ef-emergencyProfession">
            <Input {...inp('emergencyProfession','text','পেশা')} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// ── Employment Step ───────────────────────────────────────────────────────────

function EmploymentStep({ formData, handleInputChange, setFormData, onDirtyChange }: EmployeeFormProps) {
  useStepForm(EmploymentSchema, {
    idNo: formData.idNo, cardNo: formData.cardNo,
    proximityNumber: formData.proximityNumber, grade: formData.grade,
    sectionLine: formData.sectionLine, designation: formData.designation,
    department: formData.department,
    joiningDate: formData.joiningDate, probationEndDate: formData.probationEndDate,
    salary: formData.salary, jobSource: formData.jobSource,
    medicalAllowance: formData.medicalAllowance,
    transportAllowance: formData.transportAllowance, foodAllowance: formData.foodAllowance,
    tinNumber: formData.tinNumber, bankName: formData.bankName,
    bankAccountNo: formData.bankAccountNo, bankBranch: formData.bankBranch,
  }, onDirtyChange);

  const inp = (name: string, type = 'text', ph = '') => ({
    id: `ef-${name}`, name, type,
    value: (formData as any)[name] ?? '',
    onChange: handleInputChange, placeholder: ph,
  } as React.InputHTMLAttributes<HTMLInputElement> & { id: string });

  // ── Auto-calculate probationEndDate from joiningDate ──────────────────────
  const calcProbation = (joiningDate: string, extraMonths = 0) => {
    if (!joiningDate) return '';
    const d = new Date(joiningDate);
    d.setMonth(d.getMonth() + 3 + extraMonths);
    return d.toISOString().split('T')[0];
  };

  const handleJoiningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    const probation = calcProbation(e.target.value);
    setFormData(prev => ({ ...prev, probationEndDate: probation }));
  };

  // ── Auto-calculated salary breakdown ──────────────────────────────────────
  const grossVal  = parseFloat((formData as any).grossSalary || '0') || 0;
  const gross     = grossVal;
  const medical   = parseFloat(formData.medicalAllowance || '0') || 0;
  const transport = parseFloat(formData.transportAllowance || '0') || 0;
  const food      = parseFloat(formData.foodAllowance || '0') || 0;
  const basicSalary = useMemo(() =>
    gross > 0 ? ((gross - medical - transport - food) / 1.5).toFixed(2) : '',
    [gross, medical, transport, food]
  );
  const houseRent = useMemo(() =>
    basicSalary ? (parseFloat(basicSalary) / 2).toFixed(2) : '',
    [basicSalary]
  );

  return (
    <div>
      {/* A. অফিস পরিচয় */}
      <div style={card}>
        <div style={cardHead}>A. অফিস পরিচয়</div>
        <div style={g4}>
          <FormField label="আইডি নং" id="ef-idNo" required>
            <Input {...inp('idNo','text','আইডি নং')} aria-required={true} />
          </FormField>
          <FormField label="কার্ড নং" id="ef-cardNo" required>
            <Input {...inp('cardNo','text','যেমন: EMP-0042')} aria-required={true} />
          </FormField>
          <FormField label="প্রক্সিমিটি নম্বর" id="ef-proximityNumber" required>
            <Input {...inp('proximityNumber','text','প্রক্সিমিটি নম্বর')} aria-required={true} />
          </FormField>
          <FormField label="গ্রেড" id="ef-grade" required>
            <Input {...inp('grade','text','গ্রেড')} aria-required={true} />
          </FormField>
          <FormField label="সেকশন/লাইন" id="ef-sectionLine" required>
            <Input {...inp('sectionLine','text','সেকশন বা লাইন')} aria-required={true} />
          </FormField>
          <FormField label="পদবি" id="ef-designation" required>
            <Input {...inp('designation','text','পদবি')} aria-required={true} />
          </FormField>
          <FormField label="বিভাগ" id="ef-department" required>
            <Input {...inp('department','text','বিভাগ')} aria-required={true} />
          </FormField>
          <FormField label="যোগদানের তারিখ" id="ef-joiningDate" required>
            <Input
              id="ef-joiningDate" name="joiningDate" type="date"
              value={formData.joiningDate ?? ''}
              onChange={handleJoiningChange}
              aria-required={true} />
          </FormField>
          <FormField label="প্রবেশনকাল শেষ" id="ef-probationEndDate">
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Input {...inp('probationEndDate','date')}
                style={{ flex: 1 }} />
              {/* +৩ মাস button — max 6 months from joiningDate */}
              <button
                type="button"
                onClick={() => {
                  if (!formData.probationEndDate || !formData.joiningDate) return;
                  const join  = new Date(formData.joiningDate);
                  const cur   = new Date(formData.probationEndDate);
                  const maxD  = new Date(join);
                  maxD.setMonth(maxD.getMonth() + 6);
                  if (cur >= maxD) return; // already at 6 months — no increase
                  const next  = new Date(formData.probationEndDate);
                  next.setMonth(next.getMonth() + 3);
                  // cap at 6 months
                  const capped = next > maxD ? maxD : next;
                  setFormData(prev => ({ ...prev, probationEndDate: capped.toISOString().split('T')[0] }));
                }}
                title="অসন্তোষজনক হলে +৩ মাস (সর্বোচ্চ ৬ মাস)"
                style={{
                  padding: '0 10px', height: 34, borderRadius: 7, flexShrink: 0,
                  border: '1.5px solid #CBD5E1', background: '#F8FAFC',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  color: '#374151', whiteSpace: 'nowrap',
                }}>
                +৩ মাস
              </button>
              <LawRef title="প্রবেশনকাল নিয়ম">
                <div>✦ যোগদানের তারিখ থেকে <strong>স্বয়ংক্রিয়ভাবে ৩ মাস</strong> যোগ হয়।</div>
                <div style={{ marginTop: 4 }}>✦ অসন্তোষজনক হলে <strong>+৩ মাস বাটন</strong> চাপুন।</div>
                <div style={{ marginTop: 4 }}>✦ সর্বোচ্চ <strong>৬ মাস</strong> — এর বেশি বাড়ানো যাবে না।</div>
              </LawRef>
            </div>
          </FormField>
          <FormField label="হাজিরা বোনাস" id="ef-salary" required>
            <Input {...inp('salary','number','হাজিরা বোনাস')} aria-required={true} />
          </FormField>
          <FormField label="নিয়োগ সূত্র" id="ef-jobSource">
            <Input {...inp('jobSource','text','নিয়োগ সূত্র')} />
          </FormField>

        </div>

        {/* বেতন বিভাজন */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 14, marginTop: 14 }}>
          <div style={{ ...cardHead, fontSize: 13, marginBottom: 12 }}>B. বেতন বিভাজন</div>
          <div style={g3}>
            <FormField label="মাসিক বেতন (মোট) (৳)" id="ef-grossSalary">
              <Input
                id="ef-grossSalary" name="grossSalary" type="number"
                value={(formData as any).grossSalary ?? ''}
                onChange={handleInputChange}
                placeholder="মোট মাসিক বেতন" />
            </FormField>
            <FormField label="চিকিৎসা ভাতা (৳)" id="ef-medicalAllowance">
              <Input {...inp('medicalAllowance','number','চিকিৎসা ভাতা')} />
            </FormField>
            <FormField label="যাতায়াত ভাতা (৳)" id="ef-transportAllowance">
              <Input {...inp('transportAllowance','number','যাতায়াত ভাতা')} />
            </FormField>
            <FormField label="খাদ্য ভাতা (৳)" id="ef-foodAllowance">
              <Input {...inp('foodAllowance','number','খাদ্য ভাতা')} />
            </FormField>
            <FormField label="মূল বেতন (৳)" id="ef-basicSalary-calc">
              <Input id="ef-basicSalary-calc" value={basicSalary}
                readOnly aria-readonly={true}
                placeholder="মোট বেতন ও ভাতা দিলে হিসাব হবে"
                style={{ background: '#F8FAFC', color: '#475569' }} />
            </FormField>
            <FormField label="বাড়ি ভাড়া (৳)" id="ef-houseRent-calc">
              <Input id="ef-houseRent-calc" value={houseRent}
                readOnly aria-readonly={true}
                placeholder="মূল বেতন থেকে হিসাব হবে"
                style={{ background: '#F8FAFC', color: '#475569' }} />
            </FormField>
          </div>
        </div>
      </div>

      {/* B. ব্যাংক তথ্য */}
      <div style={card}>
        <div style={cardHead}>C. ব্যাংক তথ্য</div>
        <div style={g4}>
          <FormField label="টিন নম্বর" id="ef-tinNumber">
            <Input {...inp('tinNumber','text','টিন নম্বর')} />
          </FormField>
          <FormField label="ব্যাংকের নাম" id="ef-bankName">
            <Input {...inp('bankName','text','ব্যাংকের নাম')} />
          </FormField>
          <FormField label="হিসাব নম্বর" id="ef-bankAccountNo">
            <Input {...inp('bankAccountNo','text','হিসাব নম্বর')} />
          </FormField>
          <FormField label="শাখার নাম" id="ef-bankBranch">
            <Input {...inp('bankBranch','text','শাখার নাম')} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// ── Nominee Step ──────────────────────────────────────────────────────────────

function NomineeStep({ formData, handleInputChange, onDirtyChange }: EmployeeFormProps) {
  useStepForm(NomineeSchema, {
    nomineeName: formData.nomineeName, nomineeRelation: formData.nomineeRelation,
    nomineeNid: formData.nomineeNid, nomineeDob: formData.nomineeDob,
    nomineePercentage: formData.nomineePercentage, nomineeEducation: formData.nomineeEducation,
    nomineeProfession: formData.nomineeProfession, nomineeBloodGroup: formData.nomineeBloodGroup,
    nomineePhone: formData.nomineePhone, nomineeAddress: formData.nomineeAddress,
  }, onDirtyChange);

  const inp = (name: string, type = 'text', ph = '') => ({
    id: `ef-${name}`, name, type,
    value: (formData as any)[name] ?? '',
    onChange: handleInputChange, placeholder: ph,
  } as React.InputHTMLAttributes<HTMLInputElement> & { id: string });

  return (
    <div style={card}>
      <div style={cardHead}>নমিনি তথ্য</div>
      <div style={g3}>
        <FormField label="নমিনির নাম"            id="ef-nomineeName">       <Input {...inp('nomineeName','text','নমিনির নাম')} /></FormField>
        <FormField label="কর্মীর সাথে সম্পর্ক"   id="ef-nomineeRelation">   <Input {...inp('nomineeRelation','text','সম্পর্ক')} /></FormField>
        <FormField label="নমিনির এনআইডি"         id="ef-nomineeNid">        <Input {...inp('nomineeNid','text','এনআইডি নম্বর')} /></FormField>
        <FormField label="নমিনির জন্ম তারিখ"     id="ef-nomineeDob">        <Input {...inp('nomineeDob','date')} /></FormField>
        <FormField label="অংশের শতাংশ"          id="ef-nomineePercentage"> <Input {...inp('nomineePercentage','number','%')} /></FormField>
        <FormField label="নমিনির শিক্ষা"         id="ef-nomineeEducation">  <Input {...inp('nomineeEducation','text','শিক্ষাগত যোগ্যতা')} /></FormField>
        <FormField label="নমিনির পেশা"           id="ef-nomineeProfession"> <Input {...inp('nomineeProfession','text','পেশা')} /></FormField>
        <FormField label="নমিনির রক্তের গ্রুপ"   id="ef-nomineeBloodGroup"> <Input {...inp('nomineeBloodGroup','text','রক্তের গ্রুপ')} /></FormField>
        <FormField label="নমিনির মোবাইল"         id="ef-nomineePhone">      <Input {...inp('nomineePhone','tel','মোবাইল নম্বর')} /></FormField>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="নমিনির সম্পূর্ণ ঠিকানা" id="ef-nomineeAddress">
            <Textarea id="ef-nomineeAddress" name="nomineeAddress"
              value={formData.nomineeAddress} onChange={handleInputChange}
              placeholder="সম্পূর্ণ ঠিকানা লিখুন" rows={3} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// ── Supervisor Step ───────────────────────────────────────────────────────────

function SupervisorStep({ formData, handleInputChange, onDirtyChange }: EmployeeFormProps) {
  useStepForm(SupervisorSchema, {
    supervisorName: formData.supervisorName, supervisorOrg: formData.supervisorOrg,
    supervisorDesignation: formData.supervisorDesignation,
    supervisorProfession: formData.supervisorProfession,
    supervisorPhone: formData.supervisorPhone, supervisorRelation: formData.supervisorRelation,
    supervisorAddress: formData.supervisorAddress,
  }, onDirtyChange);

  const inp = (name: string, type = 'text', ph = '') => ({
    id: `ef-${name}`, name, type,
    value: (formData as any)[name] ?? '',
    onChange: handleInputChange, placeholder: ph,
  } as React.InputHTMLAttributes<HTMLInputElement> & { id: string });

  return (
    <div style={card}>
      <div style={cardHead}>সুপারিশকারী / রেফারেন্স</div>
      <div style={g3}>
        <FormField label="সুপারিশকারীর নাম" id="ef-supervisorName">
          <Input {...inp('supervisorName','text','নাম')} />
        </FormField>
        <FormField label="প্রতিষ্ঠানের নাম" id="ef-supervisorOrg">
          <Input {...inp('supervisorOrg','text','প্রতিষ্ঠানের নাম')} />
        </FormField>
        <FormField label="পদবি" id="ef-supervisorDesignation">
          <Input {...inp('supervisorDesignation','text','পদবি')} />
        </FormField>
        <FormField label="পেশা" id="ef-supervisorProfession">
          <Input {...inp('supervisorProfession','text','পেশা')} />
        </FormField>
        <FormField label="মোবাইল নম্বর" id="ef-supervisorPhone">
          <Input {...inp('supervisorPhone','tel','মোবাইল')} />
        </FormField>
        <FormField label="সম্পর্ক" id="ef-supervisorRelation">
          <Input {...inp('supervisorRelation','text','সম্পর্ক')} />
        </FormField>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="ঠিকানা" id="ef-supervisorAddress">
            <Textarea id="ef-supervisorAddress" name="supervisorAddress"
              value={formData.supervisorAddress} onChange={handleInputChange}
              placeholder="সম্পূর্ণ ঠিকানা লিখুন" rows={3} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  formData, handleInputChange, setFormData, activeStep, onDirtyChange,
}) => {
  const shared = { formData, handleInputChange, setFormData, activeStep, onDirtyChange };

  return (
    <div>
      {activeStep === 'identity'   && <IdentityStep    {...shared} />}
      {activeStep === 'contact'    && <ContactStep     {...shared} />}
      {activeStep === 'employment' && <EmploymentStep  {...shared} />}

      {activeStep === 'education' && (
        <div style={card}>
          <div style={cardHead}>শিক্ষাগত যোগ্যতা</div>
          <ArrayTableForm<EducationEntry>
            entries={formData.educationHistory}
            onChange={list => setFormData(prev => ({ ...prev, educationHistory: list }))}
            addLabel="নতুন যোগ্যতা যোগ করুন"
            blankEntry={() => ({
              id: generateEntryId(), education: '', institution: '',
              educationGroup: '', educationResult: '', educationBoard: '', passingYear: '',
            })}
            fields={[
              { key: 'education',       label: 'শিক্ষাগত যোগ্যতা',       placeholder: 'যেমন: এইচএসসি'       },
              { key: 'institution',     label: 'প্রতিষ্ঠানের নাম',         placeholder: 'কলেজ/বিশ্ববিদ্যালয়'  },
              { key: 'educationGroup',  label: 'গ্রুপ / বিষয়',            placeholder: 'যেমন: বিজ্ঞান'        },
              { key: 'educationResult', label: 'ফলাফল / জিপিএ',           placeholder: 'যেমন: GPA 4.50'       },
              { key: 'educationBoard',  label: 'বোর্ড / বিশ্ববিদ্যালয়',   placeholder: 'যেমন: ঢাকা বোর্ড'    },
              { key: 'passingYear',     label: 'পাসের সন',                placeholder: 'যেমন: ২০১৮', width: '90px' },
            ]}
          />
        </div>
      )}

      {activeStep === 'previous' && (
        <div style={card}>
          <div style={cardHead}>পূর্ববর্তী অভিজ্ঞতা</div>
          <ArrayTableForm<PreviousJobEntry>
            entries={formData.previousJobs}
            onChange={list => setFormData(prev => ({ ...prev, previousJobs: list }))}
            addLabel="নতুন অভিজ্ঞতা যোগ করুন"
            blankEntry={() => ({
              id: generateEntryId(), prevCompanyName: '',
              prevDesignation: '', prevSection: '', prevCompanyPhone: '',
              prevServiceYears: '', prevStartDate: '', prevEndDate: '',
              prevLeaveReason: '', prevRefDetails: '',
            })}
            fields={[
              { key: 'prevCompanyName',  label: 'প্রতিষ্ঠানের নাম',   placeholder: 'কোম্পানির নাম'   },
              { key: 'prevDesignation',  label: 'পদবি',                placeholder: 'যেমন: অপারেটর'  },
              { key: 'prevSection',      label: 'সেকশন / বিভাগ',      placeholder: 'যেমন: সুইং'      },
              { key: 'prevServiceYears', label: 'চাকরির বছর',          placeholder: 'যেমন: ২', width: '80px' },
              { key: 'prevEndDate',      label: 'শেষ তারিখ',           placeholder: 'তারিখ', type: 'date', width: '130px' },
              { key: 'prevStartDate',    label: 'শুরুর তারিখ',         placeholder: 'auto', width: '130px' },
              { key: 'prevCompanyPhone', label: 'প্রতিষ্ঠানের ফোন',    placeholder: 'ফোন নম্বর'      },
              { key: 'prevLeaveReason',  label: 'ছাড়ার কারণ',         placeholder: 'কারণ লিখুন'     },
              { key: 'prevRefDetails',   label: 'রেফারেন্স বিস্তারিত', placeholder: 'নাম, পদবি, ফোন' },
            ]}
          />
        </div>
      )}

      {activeStep === 'nominee'    && <NomineeStep    {...shared} />}
      {activeStep === 'supervisor' && <SupervisorStep {...shared} />}
    </div>
  );
};

export default EmployeeForm;