// ─────────────────────────────────────────────────────────────────────────────
// EmployeeSearchBar
//
// Placed at the top of every module's create/edit form.
// User types a Card No → fetches from the `employees` Google Sheet →
// returns an EmployeePersonalData object → module form auto-fills.
//
// Works even when Sheets is not configured (shows a disabled state with tooltip).
//
// Usage:
//   <EmployeeSearchBar onFound={data => {
//     setFormData(prev => ({
//       ...prev,
//       employeeName: data.fullName,
//       cardNo:       data.cardNo,
//       designation:  data.designation,
//       ...
//     }));
//   }} />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { FaSearch, FaSpinner, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { DataUseCases } from '../../business/DataUseCases';
import { toPersonalData, type EmployeePersonalData } from '../../types/EmployeePersonalData';

interface Props {
  /** Called when an employee is found — fill your form with this data */
  onFound:   (data: EmployeePersonalData) => void;
  /** Called when the search is cleared */
  onCleared?: () => void;
  factoryId: string;
  /** Optional: pre-fill the search box (e.g. when editing a record) */
  initialCardNo?: string;
  /** Optional: hide the "🔍 কর্মীর তথ্য স্বয়ংক্রিয়ভাবে লোড করুন" label above the
   *  search box — useful in contexts (like the Personal File module itself,
   *  which IS the source of this data) where the label doesn't make sense. */
  hideLabel?: boolean;
}

type SearchState = 'idle' | 'searching' | 'found' | 'notfound' | 'error';

export default function EmployeeSearchBar({ onFound, onCleared, factoryId, initialCardNo = '', hideLabel = false }: Props) {
  const [query,  setQuery]  = useState(initialCardNo);
  const [state,  setState]  = useState<SearchState>('idle');
  const [found,  setFound]  = useState<EmployeePersonalData | null>(null);
  const [errMsg, setErrMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const configured = DataUseCases.isConfigured(factoryId);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    if (!configured) {
      setErrMsg('Google Sheets কনফিগার নেই। src/config/sheets.ts দেখুন।');
      setState('error');
      return;
    }

    setState('searching');
    setErrMsg('');

    const result = await DataUseCases.load('employees', factoryId, 200);

    if (!result.ok) {
      setState('error');
      setErrMsg(result.error || 'লোড ব্যর্থ হয়েছে');
      return;
    }

    // Search by cardNo (primary) or fullName (secondary)
    const match = result.records.find(r =>
      String(r.cardNo).toLowerCase()  === q.toLowerCase() ||
      String(r.fullName).toLowerCase().includes(q.toLowerCase())
    );

    if (!match) {
      setState('notfound');
      return;
    }

    // Convert the sheet record to EmployeePersonalData
    const personal = toPersonalData(match as unknown as Record<string, string>);
    setFound(personal);
    setState('found');
    onFound(personal);
  };

  const handleClear = () => {
    setQuery('');
    setFound(null);
    setState('idle');
    setErrMsg('');
    onCleared?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') handleClear();
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const borderColor =
    state === 'found'    ? '#16a34a' :
    state === 'notfound' ? '#f59e0b' :
    state === 'error'    ? '#dc2626' : '#3b82f6';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
      border: `2px solid ${borderColor}`,
      borderRadius: '14px',
      padding: '14px 16px',
      marginBottom: '20px',
      fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
      transition: 'border-color 0.2s',
    }}>
      {/* Label */}
      {!hideLabel && (
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🔍 কর্মীর তথ্য স্বয়ংক্রিয়ভাবে লোড করুন
        </div>
      )}

      {/* Search input row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); if (state !== 'idle') setState('idle'); }}
            onKeyDown={handleKeyDown}
            placeholder="কার্ড নম্বর বা নাম লিখুন — Enter চাপুন"
            aria-label="কর্মীর কার্ড নম্বর বা নাম দিয়ে খুঁজুন"
            disabled={!configured}
            style={{
              width: '100%',
              padding: '9px 36px 9px 12px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '9px',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: configured ? '#fff' : '#f8fafc',
              color: '#1e293b',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {query && (
            <button
              onClick={handleClear}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
              aria-label="খালি করুন"
            >
              <FaTimes aria-hidden="true" style={{ fontSize: '11px' }} />
            </button>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={!configured || !query.trim() || state === 'searching'}
          aria-label="কর্মী খুঁজুন"
          style={{
            padding: '9px 16px',
            background: configured ? '#1e40af' : '#94a3b8',
            color: '#fff',
            border: 'none',
            borderRadius: '9px',
            cursor: configured && query.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          {state === 'searching'
            ? <FaSpinner aria-hidden="true" style={{ animation: 'spin 0.8s linear infinite' }} />
            : <FaSearch aria-hidden="true" />
          }
          খুঁজুন
        </button>
      </div>

      {/* Status messages */}
      {state === 'found' && found && (
        <div style={{ marginTop: '10px', background: '#f0fdf4', borderRadius: '8px', padding: '10px 12px', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <FaCheckCircle aria-hidden="true" style={{ color: '#16a34a', fontSize: '13px' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>কর্মী পাওয়া গেছে — ফর্মে স্বয়ংক্রিয়ভাবে পূরণ হয়েছে</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 16px' }}>
            {[
              { l: 'নাম',        v: found.fullName },
              { l: 'কার্ড নং',   v: found.cardNo },
              { l: 'পদবী',       v: found.designation },
              { l: 'বিভাগ',      v: found.department },
              { l: 'যোগদান',     v: found.joiningDate },
              { l: 'মোট বেতন',   v: found.grossSalary ? `৳${found.grossSalary}` : '' },
            ].map(item => item.v ? (
              <div key={item.l} style={{ fontSize: '11.5px', color: '#374151' }}>
                <span style={{ color: '#6b7280' }}>{item.l}: </span>
                <strong>{item.v}</strong>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {state === 'notfound' && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#b45309' }}>
          <FaExclamationCircle aria-hidden="true" />
          <span>কোনো কর্মী পাওয়া যায়নি। ফর্মে ম্যানুয়ালি পূরণ করুন অথবা আগে কর্মীর ফাইল সংরক্ষণ করুন।</span>
        </div>
      )}

      {state === 'error' && (
        <div role="alert" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#dc2626' }}>
          <FaExclamationCircle aria-hidden="true" />
          <span>{errMsg}</span>
        </div>
      )}

      {!configured && (
        <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#94a3b8' }}>
          ⓘ Google Sheets কনফিগার করলে এই সার্চ কাজ করবে।
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}