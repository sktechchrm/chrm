// ─────────────────────────────────────────────────────────────────────────────
// SaveButton — universal database save button
// Works with any adapter: Google Sheets, MySQL, or future backends.
// Shows: idle → saving spinner → success tick → error message
//
// Legacy name "SheetsSaveButton" kept so all existing imports still work.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { FaDatabase, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

interface Props {
  onClick:       () => Promise<boolean>;
  isSaving:      boolean;
  lastSavedId:   string | null;
  label?:        string;
  disabled?:     boolean;
  editingId?:    string | null;
  onCancelEdit?: () => void;
  /** Passed from useDatabase — true when the adapter is fully configured */
  configured?:   boolean;
  /** Adapter name shown in tooltip e.g. "Google Sheets", "MySQL REST API" */
  adapterName?:  string;
}

type BtnState = 'idle' | 'saving' | 'success' | 'error';

export default function SheetsSaveButton({
  onClick, isSaving, lastSavedId,
  label = 'সংরক্ষণ করুন',
  disabled    = false,
  editingId   = null,
  onCancelEdit,
  configured  = true,
  adapterName = 'Database',
}: Props) {
  const [state,   setState]   = useState<BtnState>('idle');
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (isSaving) setState('saving');
  }, [isSaving]);

  useEffect(() => {
    if (lastSavedId && lastSavedId !== savedId) {
      setSavedId(lastSavedId);
      setState('success');
      const t = setTimeout(() => setState('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [lastSavedId, savedId]);

  const handleClick = async () => {
    if (state === 'saving' || disabled || !configured) return;
    setState('saving');
    const ok = await onClick();
    if (!ok) {
      setState('error');
      setTimeout(() => setState('idle'), 4000);
    }
  };

  const base: React.CSSProperties = {
    display:    'inline-flex',
    alignItems: 'center',
    gap:        '8px',
    padding:    '9px 18px',
    borderRadius: '10px',
    border:     'none',
    cursor:     configured && !disabled && state !== 'saving' ? 'pointer' : 'not-allowed',
    fontSize:   '13.5px',
    fontWeight: 600,
    fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
    opacity:    (!configured || disabled) ? 0.55 : 1,
  };

  const styles: Record<BtnState, React.CSSProperties> = {
    idle:    { ...base, background: editingId ? '#d97706' : '#1e40af', color: '#fff',
               boxShadow: editingId ? '0 2px 8px rgba(217,119,6,0.3)' : '0 2px 8px rgba(30,64,175,0.3)' },
    saving:  { ...base, background: '#3b82f6', color: '#fff' },
    success: { ...base, background: '#16a34a', color: '#fff', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' },
    error:   { ...base, background: '#dc2626', color: '#fff' },
  };

  const icons: Record<BtnState, React.ReactNode> = {
    idle:    <FaDatabase aria-hidden="true" />,
    saving:  <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span>,
    success: <FaCheck aria-hidden="true" />,
    error:   <FaExclamationTriangle aria-hidden="true" />,
  };

  const labels: Record<BtnState, string> = {
    idle:    !configured
               ? `${adapterName} সংযুক্ত নেই`
               : editingId
                 ? `আপডেট করুন (${editingId})`
                 : label,
    saving:  'সংরক্ষণ হচ্ছে...',
    success: 'সংরক্ষিত হয়েছে ✓',
    error:   'সংরক্ষণ ব্যর্থ — আবার চেষ্টা করুন',
  };

  const titleText = !configured
    ? `${adapterName} কনফিগার করা নেই।`
    : labels[state];

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {editingId && onCancelEdit && (
        <button
          onClick={onCancelEdit}
          style={{ ...base, background: '#f1f5f9', color: '#374151', boxShadow: 'none', marginRight: '4px' }}
          aria-label="সম্পাদনা বাতিল করুন"
          title="নতুন ফর্মে ফিরে যান"
        >
          ✕ বাতিল
        </button>
      )}
      <button
        style={styles[state]}
        onClick={handleClick}
        disabled={!configured || disabled || state === 'saving'}
        aria-label={labels[state]}
        title={titleText}
      >
        {icons[state]}
        {labels[state]}
      </button>
    </>
  );
}
