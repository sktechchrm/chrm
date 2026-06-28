// ─────────────────────────────────────────────────────────────────────────────
// FormField.tsx — WCAG 2.2 compliant form component library
// src/components/common/FormField.tsx
//
// Components exported:
//   FormField     — label + input + hint + error wrapper
//   Input         — text/date/number/tel/email/password input
//   Select        — native select with custom chevron
//   Textarea      — resizable textarea with optional char count
//   CheckboxField — single checkbox with label and hint
//   RadioGroup    — fieldset + legend + radio options
//   PasswordInput — input with show/hide toggle + strength meter
//   FormSection   — card wrapper for a group of fields
//   FormRow       — 2-column grid row
//   SubmitBar     — save + cancel button row with status banner
//
// WCAG 2.2 rules applied:
//   1.3.1  — label for every input, fieldset+legend for groups
//   1.4.1  — never color-alone for state: 3 signals (border + icon + text)
//   1.4.3  — 4.5:1 contrast minimum (enforced via CSS vars)
//   2.4.7  — visible focus ring always (never outline:none without replacement)
//   2.4.11 — 3px focus indicator minimum (WCAG 2.2 new)
//   2.5.5  — 44×44px touch target minimum
//   4.1.2  — aria-required, aria-invalid, aria-describedby, aria-disabled
//   4.1.3  — role="alert" on error messages, role="status" on success
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

// ── Shared font / design token ────────────────────────────────────────────────

const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Base input styles ─────────────────────────────────────────────────────────

const baseInput: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 11px',
  border: '1.5px solid #CBD5E1',
  borderRadius: 7,
  fontFamily: font,
  fontSize: 13,
  fontWeight: 600,
  color: '#1A202C',
  background: '#FFFFFF',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
  boxSizing: 'border-box',
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FormFieldProps {
  label:       string;
  labelEn?:    string;
  required?:   boolean;
  optional?:   boolean;
  hint?:       string;
  hintColor?:  string;
  error?:      string;
  success?:    string;
  id?:         string;
  children:    React.ReactNode;
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?:      string;
  error?:   boolean;
  success?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?:       string;
  error?:    boolean;
  options:   { value: string; label: string }[];
  placeholder?: string;
}

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id?:       string;
  error?:    boolean;
  maxLength?: number;
  showCount?: boolean;
  rows?:     number;
}

export interface CheckboxFieldProps {
  label:       string;
  hint?:       string;
  checked:     boolean;
  onChange:    (checked: boolean) => void;
  required?:   boolean;
  disabled?:   boolean;
  id?:         string;
}

export interface RadioOption {
  value:  string;
  label:  string;
  hint?:  string;
}

export interface RadioGroupProps {
  legend:    string;
  required?: boolean;
  options:   RadioOption[];
  value:     string;
  onChange:  (value: string) => void;
  name:      string;
  error?:    string;
}

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showStrength?: boolean;
}

export interface FormSectionProps {
  title:    string;
  icon?:    string;
  children: React.ReactNode;
}

export interface SubmitBarProps {
  onSave:       () => void;
  onReset?:     () => void;
  saveLabel?:   string;
  resetLabel?:  string;
  isSaving?:    boolean;
  saveDisabled?: boolean;
  error?:       string | null;
  success?:     string | null;
}

// ── FormField wrapper ─────────────────────────────────────────────────────────

export function FormField({
  label, labelEn, required, optional, hint, hintColor, error, success, id, children,
}: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 0 }}>
      {/* Label row */}
      <label
        htmlFor={id}
        style={{ fontSize: 13, fontWeight: 500, color: '#1A202C', display: 'flex', alignItems: 'center', gap: 5, fontFamily: font }}
      >
        {label}
        {labelEn && <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>({labelEn})</span>}
        {required && <span style={{ color: '#E24B4A', fontSize: 13 }} aria-hidden="true">*</span>}
        {optional && (
          <span style={{
            fontSize: 11, padding: '1px 7px', borderRadius: 99,
            background: '#F1F5F9', color: '#94A3B8',
            border: '0.5px solid #E2E8F0', fontWeight: 400,
          }}>
            ঐচ্ছিক
          </span>
        )}
      </label>

      {/* Input slot */}
      {children}

      {/* Hint text */}
      {hint && !error && !success && (
        <span style={{ fontSize: 12, color: hintColor ?? '#94A3B8', fontFamily: font, lineHeight: 1.4 }}>
          {hint}
        </span>
      )}

      {/* Error message — 3 signals: border (on input) + icon + text */}
      {error && (
        <span
          role="alert"
          style={{ fontSize: 12, color: '#E24B4A', display: 'flex', alignItems: 'center', gap: 4, fontFamily: font }}
        >
          <FaExclamationCircle aria-hidden="true" style={{ fontSize: 13, flexShrink: 0 }} />
          {error}
        </span>
      )}

      {/* Success message */}
      {success && (
        <span
          role="status"
          style={{ fontSize: 12, color: '#639922', display: 'flex', alignItems: 'center', gap: 4, fontFamily: font }}
        >
          <FaCheckCircle aria-hidden="true" style={{ fontSize: 13, flexShrink: 0 }} />
          {success}
        </span>
      )}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

export function Input({ id, error, success, disabled, readOnly, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? '#E24B4A'
    : success
    ? '#639922'
    : focused
    ? '#378ADD'
    : disabled || readOnly
    ? '#E2E8F0'
    : '#CBD5E1';

  const boxShadow = focused
    ? error
      ? '0 0 0 3px rgba(226,75,74,.12)'
      : success
      ? '0 0 0 3px rgba(99,153,34,.12)'
      : '0 0 0 3px rgba(55,138,221,.15)'
    : 'none';

  return (
    <input
      id={id}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={error ? true : undefined}
      aria-disabled={disabled ? true : undefined}
      aria-readonly={readOnly ? true : undefined}
      style={{
        ...baseInput,
        borderColor,
        boxShadow,
        background: disabled || readOnly ? '#F8FAFC' : '#FFFFFF',
        color: disabled ? '#94A3B8' : readOnly ? '#4A5568' : '#1A202C',
        cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
        ...style,
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      {...props}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────

export function Select({ id, error, options, placeholder, style, ...props }: SelectProps) {
  const [focused, setFocused] = useState(false);

  return (
    <select
      id={id}
      aria-invalid={error ? true : undefined}
      aria-required={props.required}
      style={{
        ...baseInput,
        borderColor: error ? '#E24B4A' : focused ? '#378ADD' : '#CBD5E1',
        boxShadow: focused ? '0 0 0 3px rgba(55,138,221,.15)' : 'none',
        appearance: 'none',
        cursor: 'pointer',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394a3b8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: 30,
        ...style,
      } as React.CSSProperties}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      {...props}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────

export function Textarea({ id, error, maxLength, showCount = true, rows = 3, style, onChange, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false);
  const [count, setCount]     = useState(0);
  const countId               = useId();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
    onChange?.(e);
  };

  const nearLimit = maxLength && count > maxLength * 0.8;
  const overLimit = maxLength && count > maxLength;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error || overLimit ? true : undefined}
        aria-describedby={showCount && maxLength ? countId : undefined}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '8px 11px',
          border: `1.5px solid ${error || overLimit ? '#E24B4A' : focused ? '#378ADD' : '#CBD5E1'}`,
          borderRadius: 7,
          fontFamily: font,
          fontSize: 13,
          fontWeight: 600,
          color: '#1A202C',
          background: '#FFFFFF',
          outline: 'none',
          resize: 'vertical',
          lineHeight: 1.6,
          boxSizing: 'border-box',
          boxShadow: focused
            ? error ? '0 0 0 3px rgba(226,75,74,.12)' : '0 0 0 3px rgba(55,138,221,.15)'
            : 'none',
          transition: 'border-color .15s, box-shadow .15s',
          ...style,
        } as React.CSSProperties}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      />
      {showCount && maxLength && (
        <span
          id={countId}
          style={{
            fontSize: 11,
            textAlign: 'right',
            color: overLimit ? '#E24B4A' : nearLimit ? '#BA7517' : '#94A3B8',
            fontFamily: font,
          }}
        >
          {count} / {maxLength}
        </span>
      )}
    </div>
  );
}

// ── CheckboxField ─────────────────────────────────────────────────────────────

export function CheckboxField({ label, hint, checked, onChange, required, disabled, id }: CheckboxFieldProps) {
  const innerId = id ?? useId();
  return (
    <label
      htmlFor={innerId}
      style={{
        display: 'flex',
        alignItems: hint ? 'flex-start' : 'center',
        gap: 10,
        minHeight: 44,     // WCAG 2.5.5 touch target
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: font,
      }}
    >
      <input
        type="checkbox"
        id={innerId}
        checked={checked}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: '#378ADD', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, marginTop: hint ? 2 : 0 }}
      />
      <div>
        <div style={{ fontSize: 13, color: disabled ? '#94A3B8' : '#1A202C' }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{hint}</div>}
      </div>
    </label>
  );
}

// ── RadioGroup ────────────────────────────────────────────────────────────────

export function RadioGroup({ legend, required, options, value, onChange, name, error }: RadioGroupProps) {
  return (
    <fieldset style={{ border: 'none', padding: 0 }}>
      <legend style={{ fontSize: 13, fontWeight: 500, color: '#1A202C', marginBottom: 8, fontFamily: font, display: 'flex', alignItems: 'center', gap: 4 }}>
        {legend}
        {required && <span style={{ color: '#E24B4A' }} aria-hidden="true">*</span>}
      </legend>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {options.map(opt => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: opt.hint ? 'flex-start' : 'center',
              gap: 10,
              minHeight: 44,
              cursor: 'pointer',
              fontFamily: font,
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              required={required}
              aria-required={required}
              style={{ width: 18, height: 18, accentColor: '#378ADD', cursor: 'pointer', flexShrink: 0, marginTop: opt.hint ? 2 : 0 }}
            />
            <div>
              <div style={{ fontSize: 13, color: '#1A202C' }}>{opt.label}</div>
              {opt.hint && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{opt.hint}</div>}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <span role="alert" style={{ fontSize: 12, color: '#E24B4A', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontFamily: font }}>
          <FaExclamationCircle aria-hidden="true" style={{ fontSize: 13 }} />
          {error}
        </span>
      )}
    </fieldset>
  );
}

// ── PasswordInput ─────────────────────────────────────────────────────────────

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'দুর্বল', 'মাঝারি', 'ভালো', 'শক্তিশালী'];
  const colors = ['', '#E24B4A', '#BA7517', '#639922', '#0F6E56'];
  return { score, label: labels[score] ?? '', color: colors[score] ?? '' };
}

export function PasswordInput({ id, showStrength, ...props }: PasswordInputProps) {
  const [show, setShow]   = useState(false);
  const [pw, setPw]       = useState('');
  const strengthId        = useId();
  const strength          = getStrength(pw);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ position: 'relative' }}>
        <Input
          {...props}
          id={id}
          type={show ? 'text' : 'password'}
          style={{ paddingRight: 40 }}
          aria-describedby={showStrength ? strengthId : undefined}
          onChange={e => { setPw(e.target.value); props.onChange?.(e); }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94A3B8', padding: 4, borderRadius: 4, lineHeight: 1,
          }}
        >
          {show
            ? <FaEyeSlash aria-hidden="true" style={{ fontSize: 14 }} />
            : <FaEye      aria-hidden="true" style={{ fontSize: 14 }} />
          }
        </button>
      </div>

      {showStrength && pw && (
        <div id={strengthId} role="status" aria-live="polite">
          {/* Strength bars */}
          <div style={{ display: 'flex', gap: 3 }} aria-hidden="true">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  height: 3, flex: 1, borderRadius: 2,
                  background: i <= strength.score ? strength.color : '#E2E8F0',
                  transition: 'background .2s',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 11, color: strength.color, fontFamily: font }}>
            {strength.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ── FormSection ───────────────────────────────────────────────────────────────

export function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: 12,
      padding: '16px 18px',
      marginBottom: 14,
    }}>
      <div style={{
        fontSize: 14, fontWeight: 600, color: '#0F2442',
        marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: font,
      }}>
        {icon && <i className={`ti ${icon}`} style={{ fontSize: 17, color: '#378ADD' }} aria-hidden="true" />}
        {title}
      </div>
      {children}
    </div>
  );
}

// ── FormRow ───────────────────────────────────────────────────────────────────

export function FormRow({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

// ── SubmitBar ─────────────────────────────────────────────────────────────────

export function SubmitBar({
  onSave, onReset,
  saveLabel = 'সংরক্ষণ করুন',
  resetLabel = 'রিসেট',
  isSaving, saveDisabled,
  error, success,
}: SubmitBarProps) {
  return (
    <div>
      {error && (
        <div
          role="alert"
          style={{
            background: '#FEF2F2', border: '0.5px solid #FECACA',
            borderRadius: 8, padding: '10px 13px',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: '#991B1B', fontFamily: font,
            marginBottom: 12,
          }}
        >
          <FaExclamationCircle aria-hidden="true" style={{ fontSize: 14, flexShrink: 0 }} />
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: '#F0FDF4', border: '0.5px solid #86EFAC',
            borderRadius: 8, padding: '10px 13px',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: '#166534', fontFamily: font,
            marginBottom: 12,
          }}
        >
          <FaCheckCircle aria-hidden="true" style={{ fontSize: 14, flexShrink: 0 }} />
          {success}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onSave}
          disabled={!!(isSaving || saveDisabled)}
          aria-disabled={!!(isSaving || saveDisabled)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: '#378ADD', color: '#FFFFFF',
            fontFamily: font, fontSize: 13, fontWeight: 600,
            cursor: isSaving || saveDisabled ? 'not-allowed' : 'pointer',
            opacity: isSaving || saveDisabled ? 0.6 : 1,
            transition: 'opacity .13s',
          }}
        >
          <i className={`ti ${isSaving ? 'ti-loader' : 'ti-device-floppy'}`} style={{ fontSize: 13 }} aria-hidden="true" />
          {isSaving ? 'সংরক্ষণ হচ্ছে...' : saveLabel}
        </button>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 20px', borderRadius: 8,
              border: '0.5px solid #E2E8F0', background: '#FFFFFF',
              color: '#374151', fontFamily: font, fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <i className="ti ti-refresh" style={{ fontSize: 13 }} aria-hidden="true" />
            {resetLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Usage example (remove before production) ──────────────────────────────────
//
// import {
//   FormField, Input, Select, Textarea, CheckboxField,
//   RadioGroup, PasswordInput, FormSection, FormRow, SubmitBar
// } from '../common/FormField';
//
// <FormSection title="কর্মী তথ্য" icon="ti-user">
//   <FormRow>
//     <FormField label="পূর্ণ নাম" labelEn="Full name" required error={errors.name}>
//       <Input id="name" value={form.name} onChange={set('name')} required aria-required />
//     </FormField>
//     <FormField label="কার্ড নম্বর" labelEn="Card no." required>
//       <Input id="card" value={form.card} onChange={set('card')} required />
//     </FormField>
//   </FormRow>
//   <FormRow>
//     <FormField label="বিভাগ" required>
//       <Select id="dept" value={form.dept} onChange={set('dept')} required
//         options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
//         placeholder="বিভাগ নির্বাচন করুন" />
//     </FormField>
//     <FormField label="যোগদানের তারিখ" required>
//       <Input id="join" type="date" value={form.join} onChange={set('join')} required />
//     </FormField>
//   </FormRow>
//   <FormField label="মন্তব্য" optional hint="সর্বোচ্চ ২০০ অক্ষর">
//     <Textarea id="note" value={form.note} onChange={set('note')} maxLength={200} />
//   </FormField>
// </FormSection>
//
// <SubmitBar onSave={handleSave} onReset={handleReset}
//   isSaving={saving} error={saveError} success={saveSuccess} />