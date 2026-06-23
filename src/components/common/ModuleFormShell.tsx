// ─────────────────────────────────────────────────────────────────────────────
// ModuleFormShell — Standard A|B|C|D tab-based form wrapper
//
// Renders:
//   • Tab bar (step indicators with completion status)
//   • Form content area (children)
//   • Step navigation: Prev | Next | Submit
//   • Edit mode banner when editing an existing record
//   • Validation error summary
//
// Usage:
//   <ModuleFormShell form={form} onSubmit={handleSubmit} submitLabel="সংরক্ষণ করুন">
//     {form.step === 'personal' && <PersonalSection form={form} />}
//   </ModuleFormShell>
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaCheck, FaExclamationCircle, FaEdit, FaTimes, FaArrowLeft, FaArrowRight, FaSave } from 'react-icons/fa';
import type { UseModuleFormReturn } from '../../hooks/useModuleForm';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModuleFormShellProps<T extends Record<string, unknown>> {
  form:          UseModuleFormReturn<T>;
  /** Called when user clicks Submit on the last step */
  onSubmit:      () => Promise<boolean>;
  /** Label for the submit button (default: 'সংরক্ষণ করুন') */
  submitLabel?:  string;
  /** Label shown when in edit/update mode (default: 'আপডেট করুন') */
  updateLabel?:  string;
  /** Called when user cancels edit mode */
  onCancelEdit?: () => void;
  children:      React.ReactNode;
  /** Extra content below the tab bar (e.g. EmployeeSearchBar) */
  headerContent?: React.ReactNode;
}

// ── Step Tab ──────────────────────────────────────────────────────────────────

interface StepTabProps {
  index:    number;
  id:       string;
  label:    string;
  isActive: boolean;
  isDone:   boolean;
  hasError: boolean;
  onClick:  () => void;
}

function StepTab({ index, label, isActive, isDone, hasError, onClick }: StepTabProps) {
  const bg = isActive ? '#1e3a5f'
           : isDone   ? '#16a34a'
           : hasError ? '#fef2f2'
           : '#f8fafc';
  const color = isActive ? '#ffffff'
              : isDone   ? '#ffffff'
              : hasError ? '#dc2626'
              : '#64748b';
  const borderColor = isActive ? '#1e3a5f'
                    : isDone   ? '#16a34a'
                    : hasError ? '#fca5a5'
                    : '#e2e8f0';

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '8px',
        padding:       '8px 16px',
        border:        `1.5px solid ${borderColor}`,
        borderRadius:  '10px',
        cursor:        'pointer',
        fontFamily:    "'Noto Sans Bengali', Arial, sans-serif",
        fontSize:      '13px',
        fontWeight:    600,
        background:    bg,
        color,
        transition:    'all 0.15s',
        whiteSpace:    'nowrap' as const,
        boxShadow:     isActive ? '0 2px 8px rgba(30,58,95,0.25)' : 'none',
      }}
    >
      {/* Step indicator circle */}
      <div style={{
        width:        '22px',
        height:       '22px',
        borderRadius: '50%',
        background:   isActive ? 'rgba(255,255,255,0.2)'
                    : isDone   ? 'rgba(255,255,255,0.25)'
                    : '#e2e8f0',
        display:      'flex',
        alignItems:   'center',
        justifyContent:'center',
        fontSize:     '11px',
        fontWeight:   700,
        color:        isActive || isDone ? '#fff' : '#64748b',
        flexShrink:   0,
      }}>
        {isDone && !isActive ? (
          <FaCheck aria-hidden="true" style={{ fontSize: '9px' }} />
        ) : hasError ? (
          <FaExclamationCircle aria-hidden="true" style={{ fontSize: '10px', color: '#dc2626' }} />
        ) : (
          String.fromCharCode(64 + index) // A, B, C, D...
        )}
      </div>
      {label}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ModuleFormShell<T extends Record<string, unknown>>({
  form,
  onSubmit,
  submitLabel  = 'সংরক্ষণ করুন',
  updateLabel  = 'আপডেট করুন',
  onCancelEdit,
  children,
  headerContent,
}: ModuleFormShellProps<T>) {

  const { steps, stepIndex, step, goTo, next, prev, isFirst, isLast,
          errors, touched, isStepValid, editingId, isSubmitting, isDirty } = form;

  // Only show touched errors
  const visibleErrors = Object.entries(errors).filter(([k]) => touched[k]);

  // Which steps have errors
  const stepsWithErrors = steps.map(s => {
    if (!s.validate) return false;
    const errs = s.validate(form.data as Record<string, unknown>);
    // only show error on a step if user has touched a field in it
    return Object.entries(errs).some(([k, v]) => v && touched[k]);
  });

  const handleNext = () => {
    const ok = next();
    if (!ok) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    form.touchAll();
    if (!form.isAllValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    await onSubmit();
  };

  const S = {
    container: {
      fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
    } as React.CSSProperties,
    tabBar: {
      padding:        '12px 16px',
      background:     '#f8fafc',
      borderBottom:   '2px solid #e2e8f0',
      display:        'flex',
      gap:            '8px',
      flexWrap:       'wrap' as const,
      alignItems:     'center',
    } as React.CSSProperties,
    editBanner: {
      background:  '#fffbeb',
      border:      '1.5px solid #fde68a',
      borderRadius:'0',
      padding:     '8px 16px',
      display:     'flex',
      alignItems:  'center',
      gap:         '10px',
      fontSize:    '13px',
      color:       '#92400e',
    } as React.CSSProperties,
    errorBanner: {
      background:  '#fef2f2',
      border:      'none',
      borderBottom:'1.5px solid #fecaca',
      padding:     '10px 16px',
      fontSize:    '12.5px',
      color:       '#dc2626',
    } as React.CSSProperties,
    content: {
      padding: '20px 16px',
    } as React.CSSProperties,
    navBar: {
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '12px 16px',
      background:     '#f8fafc',
      borderTop:      '2px solid #e2e8f0',
    } as React.CSSProperties,
    btn: (color: string, bg: string, disabled?: boolean) => ({
      display:     'inline-flex',
      alignItems:  'center',
      gap:         '6px',
      padding:     '9px 18px',
      border:      'none',
      borderRadius:'10px',
      cursor:      disabled ? 'not-allowed' : 'pointer',
      fontSize:    '13px',
      fontWeight:  600,
      fontFamily:  'inherit',
      color,
      background:  bg,
      opacity:     disabled ? 0.5 : 1,
      transition:  'all 0.15s',
    } as React.CSSProperties),
  };

  return (
    <div style={S.container}>
      {/* ── Edit mode banner ─────────────────────────────────────────────── */}
      {editingId && (
        <div style={S.editBanner}>
          <FaEdit aria-hidden="true" />
          <span>
            সম্পাদনা মোড — রেকর্ড <strong>{editingId}</strong> সম্পাদনা করছেন।
            পরিবর্তন করে "{updateLabel}" ক্লিক করুন।
          </span>
          <button
            onClick={() => { form.resetData(); onCancelEdit?.(); }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600 }}
            aria-label="Cancel edit"
          >
            <FaTimes aria-hidden="true" /> বাতিল
          </button>
        </div>
      )}

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div style={S.tabBar} role="tablist" aria-label="Form steps">
        {steps.map((s, i) => (
          <StepTab
            key={s.id}
            index={i + 1}
            id={s.id}
            label={s.label}
            isActive={step === s.id}
            isDone={i < stepIndex && isStepValid(s.id)}
            hasError={stepsWithErrors[i] ?? false}
            onClick={() => goTo(s.id)}
          />
        ))}

        {/* Dirty indicator */}
        {isDirty && (
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#d97706', fontWeight: 600 }}>
            ● পরিবর্তন সংরক্ষিত হয়নি
          </span>
        )}
      </div>

      {/* ── Extra header content (e.g. search bar) ───────────────────────── */}
      {headerContent && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          {headerContent}
        </div>
      )}

      {/* ── Validation error summary ──────────────────────────────────────── */}
      {visibleErrors.length > 0 && (
        <div style={S.errorBanner} role="alert">
          <FaExclamationCircle aria-hidden="true" style={{ marginRight: '6px' }} />
          <strong>ত্রুটি:</strong>{' '}
          {visibleErrors.slice(0, 3).map(([, v]) => v).join(' • ')}
          {visibleErrors.length > 3 && ` এবং আরও ${visibleErrors.length - 3}টি ত্রুটি`}
        </div>
      )}

      {/* ── Form content area ─────────────────────────────────────────────── */}
      <div style={S.content} role="tabpanel" aria-label={`Step: ${steps[stepIndex]?.label}`}>
        {children}
      </div>

      {/* ── Step navigation bar ───────────────────────────────────────────── */}
      <div style={S.navBar}>
        {/* Left: Prev */}
        <button
          onClick={prev}
          disabled={isFirst}
          style={S.btn('#374151', '#f1f5f9', isFirst)}
          aria-label="Previous step"
        >
          <FaArrowLeft aria-hidden="true" style={{ fontSize: '11px' }} />
          পূর্ববর্তী
        </button>

        {/* Centre: step info */}
        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' as const }}>
          ধাপ {stepIndex + 1} / {steps.length}
          {steps[stepIndex]?.labelEn && (
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{steps[stepIndex].labelEn}</div>
          )}
        </div>

        {/* Right: Next or Submit */}
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={S.btn('#fff', editingId ? '#d97706' : '#1e40af', isSubmitting)}
            aria-label={editingId ? updateLabel : submitLabel}
          >
            {isSubmitting ? (
              <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span>
            ) : (
              <FaSave aria-hidden="true" style={{ fontSize: '12px' }} />
            )}
            {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : (editingId ? updateLabel : submitLabel)}
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={S.btn('#fff', '#1e40af')}
            aria-label="Next step"
          >
            পরবর্তী
            <FaArrowRight aria-hidden="true" style={{ fontSize: '11px' }} />
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
