// ─────────────────────────────────────────────────────────────────────────────
// AppButton — Central button component for the entire application.
//
// ALL button styling lives here. To change size, color, or design of any
// button type across the whole app, edit ONLY this file.
//
// Usage:
//   <AppButton variant="reset"   onClick={handleReset}>Reset</AppButton>
//   <AppButton variant="pdf"     onClick={handlePDF}>PDF</AppButton>
//   <AppButton variant="print"   onClick={handlePrint}>Print</AppButton>
//   <AppButton variant="primary" onClick={handleSave}>Save</AppButton>
//   <AppButton variant="back"    onClick={() => setPage('dashboard')}>Back</AppButton>
//   <AppButton variant="add"     onClick={addRow}>+ Add Employee</AppButton>
//   <AppButton variant="remove"  onClick={() => removeRow(i)}>Remove</AppButton>
//
// Tabs (form/view switcher):
//   <AppButton variant="tab" active={tab==='form'} onClick={() => setTab('form')}>Form</AppButton>
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

// ── Variant definitions — edit here to change the whole app ──────────────────

type Variant =
  | 'pdf'       // Export PDF  — red
  | 'print'     // Print       — green
  | 'reset'     // Reset       — orange/amber
  | 'back'      // Back/nav    — slate/gray
  | 'primary'   // Main action — blue
  | 'success'   // Confirm OK  — green
  | 'add'       // Add row     — teal outline
  | 'remove'    // Remove row  — red outline/small
  | 'tab'       // Form/View tab switcher
  | 'check'    // Confirm/bill check — blue-green
  | 'excel'    // Export Excel — emerald
  | 'icon';    // Compact icon-only action (panel close, toggle, accordion)

const STYLES: Record<Variant, string> = {
  pdf:     'flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all shadow-md font-semibold text-sm',
  print:   'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all shadow-md font-semibold text-sm',
  reset:   'flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-all shadow-md font-semibold text-sm',
  back:    'flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 active:bg-slate-800 transition-all shadow-md font-semibold text-sm',
  primary: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md font-semibold text-sm',
  success: 'flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm',
  add:     'px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold text-sm',
  remove:  'px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium',
  check:   'px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition text-sm',
  excel: 'flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md font-semibold text-sm',
  icon:  'inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-sm',
  // Tab variant — appearance controlled by `active` prop
  tab: '', // handled separately below
};

const TAB_ACTIVE   = 'flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm transition-all bg-blue-600 text-white shadow-md';
const TAB_INACTIVE = 'flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm transition-all text-gray-600 hover:text-gray-800 hover:bg-white';

// ── Component ─────────────────────────────────────────────────────────────────

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant;
  active?: boolean;  // only for variant="tab"
  children: React.ReactNode;
}

export default function AppButton({
  variant,
  active = false,
  children,
  className = '',
  disabled,
  ...rest
}: AppButtonProps) {
  let base: string;

  if (variant === 'tab') {
    base = active ? TAB_ACTIVE : TAB_INACTIVE;
  } else {
    base = STYLES[variant];
  }

  const disabledStyle = disabled ? ' opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${base}${disabledStyle} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
