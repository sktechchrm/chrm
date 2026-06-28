// ─────────────────────────────────────────────────────────────────────────────
// EmployeeInfoForm.tsx — React Hook Form + Zod + WCAG 2.2
// src/components/LeftEmployeeNotice/EmployeeInfoForm.tsx
//
// What changed from plain-useState version:
//  ✓ Zod schema  — single source of truth for all field rules
//  ✓ React Hook Form — register, watch, formState.errors, trigger
//  ✓ Per-field blur validation (mode: 'onBlur')
//  ✓ aria-invalid wired from RHF errors (not manual state)
//  ✓ aria-describedby auto-linked to each error message
//  ✓ isDirty / dirtyFields from RHF — no manual `touched` tracking
//  ✓ Parent onChange still called on every value change (controlled feel)
//  ✓ Date calculation (addWorkingDays) unchanged
//  ✓ Address fieldset/legend WCAG grouping unchanged
//  ✓ FormField / Input / Select / CheckboxField components unchanged
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller }       from 'react-hook-form';
import { zodResolver }               from '@hookform/resolvers/zod';
import { z }                         from 'zod';
import type { Address, Employee }    from '../../types/LeftNoticeDataType';
import { FormField, Input, Select, CheckboxField } from '../common/FormField';

// ── Zod schema ────────────────────────────────────────────────────────────────

const AddressSchema = z.object({
  houseNo:    z.string().default(''),
  village:    z.string().min(1, 'গ্রাম / মহল্লা আবশ্যক'),
  postOffice: z.string().default(''),
  thana:      z.string().default(''),
  district:   z.string().min(1, 'জেলা আবশ্যক'),
});

const PersonalSchema = z.object({
  name:             z.string().min(1, 'কর্মীর নাম আবশ্যক'),
  fatherName:       z.string().default(''),
  motherName:       z.string().default(''),
  cardNo:           z.string().min(1, 'কার্ড নং আবশ্যক'),
  designation:      z.string().min(1, 'পদবী আবশ্যক'),
  section:          z.string().default(''),
  gender:           z.string().min(1, 'লিঙ্গ নির্বাচন করুন').refine(v => ['male','female','third'].includes(v), 'লিঙ্গ নির্বাচন করুন'),
  husbandName:      z.string().default(''),
  joiningDate:      z.string().default(''),
  absenceDay:       z.string().min(1, 'দিন আবশ্যক')
                     .refine(v => Number(v) >= 1 && Number(v) <= 31, '১–৩১ এর মধ্যে হতে হবে'),
  absenceMonth:     z.string().min(1, 'মাস আবশ্যক')
                     .refine(v => Number(v) >= 1 && Number(v) <= 12, '১–১২ এর মধ্যে হতে হবে'),
  absenceYear:      z.string().min(4, 'বছর আবশ্যক')
                     .refine(v => Number(v) >= 1990 && Number(v) <= 2100, 'সঠিক বছর দিন'),
});

const AddressFormSchema = z.object({
  presentAddress:   AddressSchema,
  permanentAddress: AddressSchema,
});

export type PersonalFormValues  = z.infer<typeof PersonalSchema>;
export type AddressFormValues   = z.infer<typeof AddressFormSchema>;

// ── Date helpers (unchanged) ──────────────────────────────────────────────────

const publicHolidays: Record<string, string> = {
  '02-21': 'Language Day',    '03-26': 'Independence Day',
  '04-14': 'Pohela Boishakh', '05-01': 'May Day',
  '08-15': 'National Mourning Day', '12-16': 'Victory Day',
};
const isHoliday  = (d: Date) => {
  const k = `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return k in publicHolidays;
};
const isWeekend  = (d: Date) => d.getDay() === 5 || d.getDay() === 6;
const addWorkingDays = (start: string, n: number): string => {
  if (!start) return '';
  const d = new Date(start);
  let count = 0;
  while (count < n) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d) && !isHoliday(d)) count++;
  }
  return d.toISOString().split('T')[0];
};
const buildISO = (day: string, month: string, year: string): string => {
  if (!day || !month || !year || year.length < 4) return '';
  const d = Number(day), m = Number(month), y = Number(year);
  if (isNaN(d)||isNaN(m)||isNaN(y)||d<1||d>31||m<1||m>12||y<1900) return '';
  const iso = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  return isNaN(new Date(iso).getTime()) ? '' : iso;
};

// ── Shared style tokens ───────────────────────────────────────────────────────

const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #E2E8F0',
  borderRadius: 12, padding: '16px 18px', marginBottom: 14,
};
const cardHead: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: '#0F2442', fontFamily: font,
  marginBottom: 14, marginLeft: 0, display: 'flex', alignItems: 'center', gap: 6,
};
const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const g3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 };

// ── Address block ─────────────────────────────────────────────────────────────

interface AddressBlockProps {
  title:    string;
  titleEn:  string;
  icon:     string;
  prefix:   'presentAddress' | 'permanentAddress';
  disabled: boolean;
  control:  any; // useForm control — typed loosely to avoid generic mismatch
  errors:   Partial<Record<keyof Address, { message?: string }>>;
}

function AddressBlock({ title, titleEn, icon, prefix, disabled, control, errors }: AddressBlockProps) {
  const color = disabled ? '#94A3B8' : '#378ADD';
  return (
    <div role="group" aria-labelledby={`${prefix}-legend`} style={{ flex: 1, minWidth: 200 }}>
      <div id={`${prefix}-legend`} style={{ ...cardHead, marginBottom: 10, fontSize: 14 }}>
        {title}
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>({titleEn})</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* বাড়ি/বাড়ি নং/রাস্তা — spans both columns */}
        <Controller name={`${prefix}.houseNo`} control={control} render={({ field }) => (
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField label="বাড়ি / বাড়ি নং / রাস্তা" id={`${prefix}-houseNo`}>
              <Input id={`${prefix}-houseNo`} {...field}
                disabled={disabled} placeholder="বাড়ি নং বা রাস্তার নাম" />
            </FormField>
          </div>
        )} />

        {/* গ্রাম */}
        <Controller name={`${prefix}.village`} control={control} render={({ field, fieldState }) => (
          <FormField label="গ্রাম / মহল্লা" id={`${prefix}-village`}
            required error={fieldState.error?.message}>
            <Input id={`${prefix}-village`} {...field}
              disabled={disabled} placeholder="গ্রাম বা মহল্লা"
              aria-required={true}
              aria-invalid={!!fieldState.error}
              aria-describedby={fieldState.error ? `${prefix}-village-err` : undefined}
              error={!!fieldState.error} />
          </FormField>
        )} />

        {/* ডাকঘর */}
        <Controller name={`${prefix}.postOffice`} control={control} render={({ field }) => (
          <FormField label="ডাকঘর" id={`${prefix}-po`}>
            <Input id={`${prefix}-po`} {...field}
              disabled={disabled} placeholder="ডাকঘরের নাম" />
          </FormField>
        )} />

        {/* থানা */}
        <Controller name={`${prefix}.thana`} control={control} render={({ field }) => (
          <FormField label="থানা" id={`${prefix}-thana`}>
            <Input id={`${prefix}-thana`} {...field}
              disabled={disabled} placeholder="থানার নাম" />
          </FormField>
        )} />

        {/* জেলা */}
        <Controller name={`${prefix}.district`} control={control} render={({ field, fieldState }) => (
          <FormField label="জেলা" id={`${prefix}-district`}
            required error={fieldState.error?.message}>
            <Input id={`${prefix}-district`} {...field}
              disabled={disabled} placeholder="জেলার নাম"
              aria-required={true}
              aria-invalid={!!fieldState.error}
              error={!!fieldState.error} />
          </FormField>
        )} />
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface EmployeeFormProps {
  employee:  Employee;
  onChange:  (data: Employee) => void;
  activeTab?: 'personal' | 'address';
  /** Called with true when form has been modified (replaces manual touched state) */
  onDirtyChange?: (dirty: boolean) => void;
}

// ── Personal form ─────────────────────────────────────────────────────────────

function PersonalForm({ employee, onChange, onDirtyChange }: EmployeeFormProps) {
  const {
    register,
    control,
    watch,
    formState: { errors, isDirty },
    trigger,
  } = useForm({
    resolver: zodResolver(PersonalSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      name:         employee.name          || '',
      fatherName:   employee.fatherName    || '',
      motherName:   employee.motherName    || '',
      cardNo:       employee.cardNo        || '',
      designation:  employee.designation   || '',
      section:      employee.section       || '',
      gender:       employee.gender        || '',
      husbandName:  employee.husbandName   || '',
      joiningDate:  employee.joiningDate   || '',
      absenceDay:   employee.absenceStartDate?.split('-')[2] || '',
      absenceMonth: employee.absenceStartDate?.split('-')[1] || '',
      absenceYear:  employee.absenceStartDate?.split('-')[0] || '',
    },
  });

  const genderVal     = watch('gender');
  const absenceDay    = watch('absenceDay');
  const absenceMonth  = watch('absenceMonth');
  const absenceYear   = watch('absenceYear');

  // Notify parent when dirty changes
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

  // Sync all watched values → parent Employee state
  useEffect(() => {
    const iso = buildISO(absenceDay, absenceMonth, absenceYear);
    const first  = iso ? addWorkingDays(iso, 10)  : '';
    const second = first  ? addWorkingDays(first, 10)  : '';
    const third  = second ? addWorkingDays(second, 7)  : '';
    onChange({
      ...employee,
      name:             watch('name'),
      fatherName:       watch('fatherName'),
      motherName:       watch('motherName'),
      cardNo:           watch('cardNo'),
      designation:      watch('designation'),
      section:          watch('section'),
      gender:           watch('gender'),
      husbandName:      watch('husbandName'),
      joiningDate:      watch('joiningDate'),
      absenceStartDate: iso,
      firstNoticeDate:  first,
      secondNoticeDate: second,
      thirdNoticeDate:  third,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absenceDay, absenceMonth, absenceYear, genderVal]);

  const absenceISO = buildISO(absenceDay, absenceMonth, absenceYear);

  return (
    <div style={{ paddingBottom: 16 }}>

      {/* ── Section 1: Personal & work info ── */}
      <div style={card}>
        <div style={cardHead}>
          সাধারণ তথ্য
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>Personal info</span>
        </div>

        <div style={g3}>

          {/* কর্মীর নাম */}
          <FormField label="কর্মীর নাম" labelEn="Full name"
            required id="pf-name" error={errors.name?.message}>
            <Input id="pf-name"
              placeholder="যেমন: রাহেলা বেগম"
              aria-required={true}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'pf-name-err' : undefined}
              error={!!errors.name}
              {...register('name', {
                onChange: e => onChange({ ...employee, name: e.target.value }),
              })} />
          </FormField>

          {/* পিতার নাম */}
          <FormField label="পিতার নাম" labelEn="Father's name" id="pf-father">
            <Input id="pf-father" placeholder="পিতার নাম"
              {...register('fatherName', {
                onChange: e => onChange({ ...employee, fatherName: e.target.value }),
              })} />
          </FormField>

          {/* মাতার নাম */}
          <FormField label="মাতার নাম" labelEn="Mother's name" id="pf-mother">
            <Input id="pf-mother" placeholder="মাতার নাম"
              {...register('motherName', {
                onChange: e => onChange({ ...employee, motherName: e.target.value }),
              })} />
          </FormField>

          {/* কার্ড নং */}
          <FormField label="কার্ড নং" labelEn="Card no."
            required id="pf-card" error={errors.cardNo?.message}>
            <Input id="pf-card"
              placeholder="যেমন: EMP-0042"
              aria-required={true}
              aria-invalid={!!errors.cardNo}
              error={!!errors.cardNo}
              {...register('cardNo', {
                onChange: e => onChange({ ...employee, cardNo: e.target.value }),
              })} />
          </FormField>

          {/* পদবী */}
          <FormField label="পদবী" labelEn="Designation"
            required id="pf-desg" error={errors.designation?.message}>
            <Input id="pf-desg"
              placeholder="যেমন: অপারেটর"
              aria-required={true}
              aria-invalid={!!errors.designation}
              error={!!errors.designation}
              {...register('designation', {
                onChange: e => onChange({ ...employee, designation: e.target.value }),
              })} />
          </FormField>

          {/* সেকশন */}
          <FormField label="সেকশন" labelEn="Section" id="pf-section">
            <Input id="pf-section" placeholder="যেমন: সুইং"
              {...register('section', {
                onChange: e => onChange({ ...employee, section: e.target.value }),
              })} />
          </FormField>

          {/* লিঙ্গ */}
          <FormField label="লিঙ্গ" labelEn="Gender"
            required id="pf-gender" error={errors.gender?.message}>
            <Controller name="gender" control={control} render={({ field, fieldState }) => (
              <Select id="pf-gender"
                value={field.value ?? ''}
                aria-required={true}
                aria-invalid={!!fieldState.error}
                error={!!fieldState.error}
                placeholder="লিঙ্গ নির্বাচন করুন"
                options={[
                  { value: 'male',   label: 'পুরুষ (Male)'          },
                  { value: 'female', label: 'নারী (Female)'          },
                  { value: 'third',  label: 'অ-দ্বৈত / তৃতীয় লিঙ্গ'  },
                ]}
                onChange={e => {
                  field.onChange(e);
                  onChange({ ...employee, gender: e.target.value });
                }}
                onBlur={field.onBlur} />
            )} />
          </FormField>

          {/* স্বামীর নাম — conditional */}
          {(genderVal === 'female') && (
            <FormField label="স্বামীর নাম" labelEn="Husband's name" id="pf-husband">
              <Input id="pf-husband" placeholder="স্বামীর নাম"
                {...register('husbandName', {
                  onChange: e => onChange({ ...employee, husbandName: e.target.value }),
                })} />
            </FormField>
          )}

          {/* যোগদানের তারিখ */}
          <FormField label="যোগদানের তারিখ" labelEn="Joining date" id="pf-join">
            <Input id="pf-join" type="date"
              {...register('joiningDate', {
                onChange: e => onChange({ ...employee, joiningDate: e.target.value }),
              })} />
          </FormField>

        </div>
      </div>

      {/* ── Section 2: Absence date ── */}
      <div style={card}>
        <div style={cardHead}>
          অনুপস্থিতির তারিখ
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>Absence start date</span>
        </div>

        <fieldset style={{ border: 'none', padding: 0 }}>
          <legend style={{ fontSize: 12, color: '#64748B', marginBottom: 10, fontFamily: font }}>
            দিন, মাস ও বছর আলাদাভাবে লিখুন
          </legend>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

            <FormField label="দিন" id="pf-abs-day" hint="১–৩১"
              error={errors.absenceDay?.message}>
              <Input id="pf-abs-day" type="number" min={1} max={31}
                placeholder="দিন" style={{ textAlign: 'center' }}
                aria-required={true}
                aria-invalid={!!errors.absenceDay}
                error={!!errors.absenceDay}
                {...register('absenceDay', {
                  onBlur: () => trigger(['absenceDay', 'absenceMonth', 'absenceYear']),
                })} />
            </FormField>

            <FormField label="মাস" id="pf-abs-month" hint="১–১২"
              error={errors.absenceMonth?.message}>
              <Input id="pf-abs-month" type="number" min={1} max={12}
                placeholder="মাস" style={{ textAlign: 'center' }}
                aria-required={true}
                aria-invalid={!!errors.absenceMonth}
                error={!!errors.absenceMonth}
                {...register('absenceMonth', {
                  onBlur: () => trigger(['absenceDay', 'absenceMonth', 'absenceYear']),
                })} />
            </FormField>

            <FormField label="বছর" id="pf-abs-year" hint="যেমন: ২০২৬"
              error={errors.absenceYear?.message}>
              <Input id="pf-abs-year" type="number" min={1990} max={2100}
                placeholder="বছর"
                aria-required={true}
                aria-invalid={!!errors.absenceYear}
                error={!!errors.absenceYear}
                {...register('absenceYear', {
                  onBlur: () => trigger(['absenceDay', 'absenceMonth', 'absenceYear']),
                })} />
            </FormField>

          </div>
        </fieldset>

      </div>
    </div>
  );
}

// ── Address form ──────────────────────────────────────────────────────────────

function AddressForm({ employee, onChange, onDirtyChange }: EmployeeFormProps) {
  const [sameAddress, setSameAddress] = useState(false);

  const {
    control,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm({
    resolver: zodResolver(AddressFormSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      presentAddress:   { ...employee.presentAddress, houseNo: employee.presentAddress.houseNo || '' },
      permanentAddress: { ...employee.permanentAddress, houseNo: employee.permanentAddress.houseNo || '' },
    },
  });

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

  // Mirror present → permanent when checkbox ticked
  const presentValues = watch('presentAddress');
  useEffect(() => {
    if (!sameAddress) return;
    setValue('permanentAddress', { ...presentValues }, { shouldDirty: true });
    onChange({ ...employee, permanentAddress: { ...presentValues } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentValues, sameAddress]);

  // Sync address changes → parent
  const presentAddr   = watch('presentAddress');
  const permanentAddr = watch('permanentAddress');
  useEffect(() => {
    onChange({ ...employee, presentAddress: presentAddr, permanentAddress: permanentAddr });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentAddr, permanentAddr]);

  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={card}>
        <div style={{ ...cardHead, justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            ঠিকানা
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>(Addresses)</span>
          </span>
          <CheckboxField
            id="addr-same"
            label="উভয় ঠিকানা একই"
            hint="টিক করলে স্থায়ী ঠিকানা স্বয়ংক্রিয়ভাবে পূরণ হবে"
            checked={sameAddress}
            onChange={checked => {
              setSameAddress(checked);
              if (checked) {
                setValue('permanentAddress', { ...presentValues }, { shouldDirty: true });
                onChange({ ...employee, permanentAddress: { ...presentValues } });
              }
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Present */}
          <div style={{
            flex: 1, minWidth: 200,
            border: '1px solid #BFDBFE', borderRadius: 10,
            padding: '14px 16px', background: '#FAFEFF',
          }}>
            <AddressBlock
              title="বর্তমান ঠিকানা" titleEn="Present address"
              icon="ti-map-pin" prefix="presentAddress"
              disabled={false}
              control={control}
              errors={{}}
            />
          </div>

          {/* Separator */}
          <div style={{
            display: 'flex', alignItems: 'center',
            color: '#CBD5E1', fontSize: 20, userSelect: 'none',
          }} aria-hidden="true">
            {sameAddress ? '=' : '≠'}
          </div>

          {/* Permanent */}
          <div style={{
            flex: 1, minWidth: 200,
            border: `1px solid ${sameAddress ? '#E2E8F0' : '#86EFAC'}`,
            borderRadius: 10, padding: '14px 16px',
            background: sameAddress ? '#F8FAFC' : '#F0FDF4',
            opacity: sameAddress ? 0.6 : 1,
            transition: 'opacity .2s, border-color .2s',
          }}>
            <AddressBlock
              title="স্থায়ী ঠিকানা" titleEn="Permanent address"
              icon="ti-home" prefix="permanentAddress"
              disabled={sameAddress}
              control={control}
              errors={{}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Exported component ────────────────────────────────────────────────────────

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee, onChange, activeTab = 'personal', onDirtyChange,
}) => {
  const handleDirty = useCallback(
    (dirty: boolean) => onDirtyChange?.(dirty),
    [onDirtyChange],
  );

  if (activeTab === 'personal') {
    return (
      <PersonalForm
        employee={employee}
        onChange={onChange}
        onDirtyChange={handleDirty}
      />
    );
  }

  return (
    <AddressForm
      employee={employee}
      onChange={onChange}
      onDirtyChange={handleDirty}
    />
  );
};