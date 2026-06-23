// ─────────────────────────────────────────────────────────────────────────────
// useModuleForm — Centralized form state + step navigation + validation
//
// Provides a single hook that any tabbed module form uses:
//   • Multi-step (A|B|C|D) navigation with validation gate per step
//   • Dirty tracking (warn before reset/leave)
//   • Error map per field
//   • Integration with useSheetsSync (save / update)
//
// Usage:
//   const form = useModuleForm({
//     steps: [
//       { id: 'personal', label: 'ব্যক্তিগত তথ্য', validate: (data) => ({ name: !data.name ? 'Required' : '' }) },
//       { id: 'salary',   label: 'বেতন',             validate: () => ({}) },
//     ],
//     initialData: INITIAL_STATE,
//   });
//
//   <ModuleFormShell form={form}>
//     {form.step === 'personal' && <PersonalSection form={form} />}
//     {form.step === 'salary'   && <SalarySection   form={form} />}
//   </ModuleFormShell>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FormStep {
  id:         string;
  label:      string;
  labelEn?:   string;
  /** Return a map of fieldName → errorMessage. Empty string = valid. */
  validate?:  (data: Record<string, unknown>) => Record<string, string>;
  /** If true, user can jump to this step directly even if previous is invalid */
  optional?:  boolean;
}

export interface UseModuleFormOptions<T extends Record<string, unknown>> {
  steps:       FormStep[];
  initialData: T;
  /** Called when form is submitted (all steps valid) */
  onSubmit?:   (data: T) => Promise<boolean>;
}

export interface UseModuleFormReturn<T extends Record<string, unknown>> {
  // Data
  data:        T;
  setData:     (next: Partial<T>) => void;
  setField:    (key: keyof T, value: unknown) => void;
  resetData:   () => void;
  isDirty:     boolean;

  // Steps
  steps:       FormStep[];
  stepIndex:   number;
  step:        string;           // current step id
  isFirst:     boolean;
  isLast:      boolean;
  goTo:        (stepId: string) => void;
  next:        () => boolean;    // returns false if validation fails
  prev:        () => void;

  // Validation
  errors:      Record<string, string>;
  touched:     Record<string, boolean>;
  touchField:  (key: string) => void;
  touchAll:    () => void;
  isStepValid: (stepId?: string) => boolean;
  isAllValid:  boolean;

  // Edit mode (from Google Sheets)
  editingId:   string | null;
  setEditingId:(id: string | null) => void;
  loadRecord:  (record: Record<string, unknown>) => void;

  // Submit
  isSubmitting: boolean;
  submit:       () => Promise<boolean>;

  // Helpers
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useModuleForm<T extends Record<string, unknown>>({
  steps,
  initialData,
  onSubmit,
}: UseModuleFormOptions<T>): UseModuleFormReturn<T> {

  const [data,        setDataState]   = useState<T>({ ...initialData });
  const [stepIndex,   setStepIndex]   = useState(0);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [isSubmitting,setIsSubmitting]= useState(false);

  // Dirty tracking
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  // ── Data setters ───────────────────────────────────────────────────────────
  const setData = useCallback((next: Partial<T>) => {
    setDataState(prev => ({ ...prev, ...next }));
  }, []);

  const setField = useCallback((key: keyof T, value: unknown) => {
    setDataState(prev => ({ ...prev, [key]: value }));
    setTouched(prev => ({ ...prev, [key as string]: true }));
  }, []);

  const resetData = useCallback(() => {
    setDataState({ ...initialData });
    setStepIndex(0);
    setTouched({});
    setEditingId(null);
  }, [initialData]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setDataState(prev => ({ ...prev, [name]: finalValue }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const errors = useMemo<Record<string, string>>(() => {
    const allErrors: Record<string, string> = {};
    steps.forEach(step => {
      if (step.validate) {
        const stepErrors = step.validate(data as Record<string, unknown>);
        Object.entries(stepErrors).forEach(([k, v]) => {
          if (v) allErrors[k] = v;
        });
      }
    });
    return allErrors;
  }, [data, steps]);

  const isStepValid = useCallback((stepId?: string) => {
    const targetId = stepId ?? steps[stepIndex]?.id;
    const step = steps.find(s => s.id === targetId);
    if (!step?.validate) return true;
    const errs = step.validate(data as Record<string, unknown>);
    return !Object.values(errs).some(Boolean);
  }, [data, steps, stepIndex]);

  const isAllValid = useMemo(() =>
    steps.every(s => {
      if (!s.validate || s.optional) return true;
      const errs = s.validate(data as Record<string, unknown>);
      return !Object.values(errs).some(Boolean);
    }),
  [data, steps]);

  const touchField = useCallback((key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }));
  }, []);

  const touchAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    Object.keys(data).forEach(k => { all[k] = true; });
    setTouched(all);
  }, [data]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const step = steps[stepIndex]?.id ?? '';

  const goTo = useCallback((stepId: string) => {
    const idx = steps.findIndex(s => s.id === stepId);
    if (idx >= 0) setStepIndex(idx);
  }, [steps]);

  const next = useCallback((): boolean => {
    // Touch all fields on current step to trigger validation display
    const currentStep = steps[stepIndex];
    if (currentStep?.validate) {
      const errs = currentStep.validate(data as Record<string, unknown>);
      const newTouched: Record<string, boolean> = {};
      Object.keys(errs).forEach(k => { newTouched[k] = true; });
      setTouched(prev => ({ ...prev, ...newTouched }));
      if (Object.values(errs).some(Boolean)) return false;
    }
    if (stepIndex < steps.length - 1) {
      setStepIndex(i => i + 1);
    }
    return true;
  }, [steps, stepIndex, data]);

  const prev = useCallback(() => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  }, [stepIndex]);

  // ── Load record for editing ────────────────────────────────────────────────
  const loadRecord = useCallback((record: Record<string, unknown>) => {
    const merged: Record<string, unknown> = { ...initialData };
    Object.keys(initialData).forEach(k => {
      if (record[k] !== undefined && record[k] !== null && record[k] !== '') {
        merged[k] = record[k];
      }
    });
    setDataState(merged as T);
    setStepIndex(0);
    setTouched({});
  }, [initialData]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = useCallback(async (): Promise<boolean> => {
    touchAll();
    if (!isAllValid || !onSubmit) return false;
    setIsSubmitting(true);
    const ok = await onSubmit(data);
    setIsSubmitting(false);
    if (ok) {
      setEditingId(null);
    }
    return ok;
  }, [data, isAllValid, onSubmit, touchAll]);

  return {
    data, setData, setField, resetData, isDirty,
    steps, stepIndex, step,
    isFirst: stepIndex === 0,
    isLast:  stepIndex === steps.length - 1,
    goTo, next, prev,
    errors, touched, touchField, touchAll,
    isStepValid, isAllValid,
    editingId, setEditingId, loadRecord,
    isSubmitting, submit,
    handleChange,
  };
}
