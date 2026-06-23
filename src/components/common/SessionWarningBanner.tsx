// ─────────────────────────────────────────────────────────────────────────────
// SessionWarningBanner
// src/components/common/SessionWarningBanner.tsx
//
// Shown automatically when the user's session has < 5 minutes remaining.
// Displays a countdown in minutes and offers two actions:
//   • Renew Session — resets loginTime, giving a fresh full session
//   • Logout Now   — immediate logout
//
// Mount this once inside RewardApp (inside the authenticated shell).
// It renders nothing when the session is not expiring.
// ─────────────────────────────────────────────────────────────────────────────

import { useAuth } from '../../context/AuthContext';

export default function SessionWarningBanner() {
  const { sessionExpiring, sessionMinsLeft, renewSession, logout } = useAuth();

  if (!sessionExpiring) return null;

  const mins = sessionMinsLeft ?? 0;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        zIndex:         99999,
        background:     'linear-gradient(90deg, #7c2d12, #9a3412)',
        color:          '#fff',
        padding:        '10px 20px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexWrap:       'wrap',
        gap:            10,
        fontFamily:     "'Noto Sans Bengali', Arial, sans-serif",
        fontSize:       13,
        boxShadow:      '0 4px 20px rgba(0,0,0,0.3)',
        borderBottom:   '2px solid #fbbf24',
        animation:      'slideDown .3s ease',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media print { .session-warn-banner { display: none !important; } }
      `}</style>

      <div
        className="session-warn-banner"
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span>
          {mins <= 1
            ? 'আপনার সেশন এক মিনিটেরও কম সময়ে শেষ হবে — এখনই সংরক্ষণ করুন!'
            : `আপনার সেশন ${mins} মিনিটে শেষ হবে — অসংরক্ষিত কাজ হারিয়ে যাবে।`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={renewSession}
          style={{
            background:   '#fbbf24',
            color:        '#7c2d12',
            border:       'none',
            borderRadius: 7,
            padding:      '6px 14px',
            fontSize:     12,
            fontWeight:   700,
            cursor:       'pointer',
            fontFamily:   'inherit',
            display:      'flex',
            alignItems:   'center',
            gap:          5,
          }}
        >
          ↺ সেশন নবায়ন করুন
        </button>

        <button
          onClick={logout}
          style={{
            background:   'rgba(255,255,255,.15)',
            color:        '#fff',
            border:       '1px solid rgba(255,255,255,.35)',
            borderRadius: 7,
            padding:      '6px 14px',
            fontSize:     12,
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          এখনই লগআউট
        </button>
      </div>
    </div>
  );
}
