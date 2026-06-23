// src/auth/login.tsx — Secure login with email + password only (no factory selection)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from './users';
import { useAuth } from '../context/AuthContext';
const skTechLogo = '/rms/logo.png';
import { SUPPORT } from '../config/support';

const MAX_ATTEMPTS    = 3;
const LOCKOUT_MINUTES = 5;
const LOCKOUT_MS      = LOCKOUT_MINUTES * 60 * 1000;

// ── Login logic ──────────────────────────────────────────────────────────────
// No factory dropdown. The user's factory is determined by their credentials.
// Parent users automatically gain access to all sub-factories after login
// and can switch between them in the navigation bar.

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [showPassword,   setShowPassword]   = useState(false);
  const [error,          setError]          = useState('');
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [attempts,       setAttempts]       = useState(0);
  const [lockedUntil,    setLockedUntil]    = useState<number | null>(null);
  const [countdown,      setCountdown]      = useState(0);

  // Lockout countdown
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null); setAttempts(0); setError(''); setCountdown(0);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError('');
    setIsSubmitting(true);
    try {
      const user = await authenticateUser(email, password);
      if (user) {
        login(user);
        navigate('/dashboard');
      } else {
        const na = attempts + 1;
        setAttempts(na);
        if (na >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS);
          setError(`Too many failed attempts. Locked for ${LOCKOUT_MINUTES} minutes.`);
        } else {
          setError(`Invalid email or password. ${MAX_ATTEMPTS - na} attempt(s) remaining.`);
        }
        setIsSubmitting(false);
      }
    } catch {
      setError('Authentication error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:#0a0f1e;}
        .lp-root{min-height:100vh;display:flex;background:#0a0f1e;position:relative;overflow:hidden;}
        .lp-blob{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;}
        .lp-blob-1{width:600px;height:600px;background:radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%);top:-15%;right:-10%;animation:blobFloat 22s ease-in-out infinite;}
        .lp-blob-2{width:500px;height:500px;background:radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%);bottom:-15%;left:-10%;animation:blobFloat 28s ease-in-out infinite reverse;}
        @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-25px,25px) scale(1.04);}}
        .lp-left{flex:1;display:flex;flex-direction:column;justify-content:center;padding:4rem 5rem;position:relative;z-index:1;animation:fadeInLeft 0.8s ease both;}
        @keyframes fadeInLeft{from{opacity:0;transform:translateX(-28px);}to{opacity:1;transform:translateX(0);}}
        @media(max-width:900px){.lp-left{display:none;}}
        .lp-logo-row{display:flex;align-items:center;gap:12px;margin-bottom:3.5rem;}
        .lp-logo-row img{height:44px;width:auto;object-fit:contain;}
        .lp-logo-text-name{font-size:1.3rem;font-weight:700;color:#fff;}
        .lp-logo-text-sub{font-size:10.5px;color:#64748b;letter-spacing:0.5px;margin-top:2px;}
        .lp-hero-title{font-family:'Playfair Display',serif;font-size:2.7rem;font-weight:700;color:#f8fafc;line-height:1.2;letter-spacing:-0.5px;margin-bottom:1rem;}
        .lp-hero-title span{background:linear-gradient(135deg,#3b82f6,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .lp-hero-bar{width:48px;height:3px;background:linear-gradient(90deg,#3b82f6,#10b981);border-radius:2px;margin-bottom:1.25rem;}
        .lp-hero-sub{font-size:14.5px;color:#64748b;line-height:1.75;max-width:380px;}
        .lp-feature-list{margin-top:2.5rem;display:flex;flex-direction:column;gap:12px;}
        .lp-feature-item{display:flex;align-items:center;gap:10px;font-size:13px;color:#94a3b8;}
        .lp-feature-dot{width:6px;height:6px;border-radius:50%;background:#3b82f6;flex-shrink:0;}
        .lp-right{flex:1;display:flex;align-items:center;justify-content:center;padding:2rem;position:relative;z-index:1;}
        .lp-card{background:rgba(15,23,42,0.88);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:2.5rem 2.25rem;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(0,0,0,0.55);animation:fadeInUp 0.7s ease 0.15s both;}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
        .lp-card-title{font-size:1.65rem;font-weight:700;color:#f1f5f9;letter-spacing:-0.3px;margin-bottom:4px;}
        .lp-card-sub{font-size:13px;color:#64748b;margin-bottom:1.75rem;}
        .lp-field{margin-bottom:1.1rem;}
        .lp-label{display:block;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.9px;margin-bottom:7px;}
        .lp-input{width:100%;padding:0.8rem 1rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#f1f5f9;font-family:'DM Sans',sans-serif;font-size:14px;transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;outline:none;}
        .lp-input::placeholder{color:#475569;}
        .lp-input:focus{border-color:#3b82f6;background:rgba(59,130,246,0.06);box-shadow:0 0 0 3px rgba(59,130,246,0.12);}
        .lp-input-wrap{position:relative;}
        .lp-pw-toggle{position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#64748b;cursor:pointer;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;padding:4px 6px;transition:color 0.2s;}
        .lp-pw-toggle:hover{color:#3b82f6;}
        .lp-error{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.28);border-radius:10px;padding:0.75rem 1rem;margin-bottom:1rem;font-size:13px;color:#fca5a5;animation:shakeX 0.45s ease;}
        @keyframes shakeX{0%,100%{transform:translateX(0);}25%{transform:translateX(-8px);}75%{transform:translateX(8px);}}
        .lp-lockout{background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.28);border-radius:10px;padding:0.75rem 1rem;margin-bottom:1rem;font-size:13px;color:#fcd34d;text-align:center;}
        .lp-divider-label{display:flex;align-items:center;gap:8px;margin:1.25rem 0;color:#334155;font-size:11px;letter-spacing:0.5px;}
        .lp-divider-label::before,.lp-divider-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.06);}
        .lp-btn{width:100%;padding:0.9rem;background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);border:none;border-radius:10px;color:#fff;font-family:'DM Sans',sans-serif;font-size:14.5px;font-weight:600;cursor:pointer;transition:all 0.2s ease;position:relative;overflow:hidden;margin-top:0.25rem;}
        .lp-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent);transform:translateX(-100%);transition:transform 0.5s ease;}
        .lp-btn:hover:not(:disabled)::after{transform:translateX(100%);}
        .lp-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(59,130,246,0.38);}
        .lp-btn:active:not(:disabled){transform:translateY(0);}
        .lp-btn:disabled{opacity:0.55;cursor:not-allowed;}
        .lp-spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.75s linear infinite;margin-right:7px;vertical-align:middle;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .lp-footer{text-align:center;margin-top:1.5rem;font-size:12px;color:#475569;}
        .lp-footer a{color:#3b82f6;text-decoration:none;font-weight:500;transition:color 0.2s;}
        .lp-footer a:hover{color:#60a5fa;}
      `}</style>

      <div className="lp-blob lp-blob-1"/>
      <div className="lp-blob lp-blob-2"/>

      {/* Left hero panel */}
      <div className="lp-left">
        <div className="lp-logo-row">
          <img src={skTechLogo} alt="SK-TECH"/>
          <div>
            <div className="lp-logo-text-name">SK-TECH RMS</div>
            <div className="lp-logo-text-sub">HR MANAGEMENT SYSTEM</div>
          </div>
        </div>
        <h1 className="lp-hero-title">Smart HR <span>Management</span><br/>System</h1>
        <div className="lp-hero-bar"/>
        <p className="lp-hero-sub">
          A centralized platform for managing all HR operations — maternity benefits,
          final settlements, salary increments, meeting minutes, and more.
        </p>
        <div className="lp-feature-list">
          {[
            'Factory-wise secure login & role control',
            'Parent factory access to all sub-factories',
            'Bangla & English bilingual support',
            'Real-time calculations & smart forms',
          ].map(f => (
            <div key={f} className="lp-feature-item">
              <div className="lp-feature-dot"/>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right login card */}
      <div className="lp-right">
        <div className="lp-card">
          <div className="lp-card-title">Sign In</div>
          <div className="lp-card-sub">Enter your credentials to continue</div>

          {isLocked && (
            <div className="lp-lockout">
              🔒 Locked — try again in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </div>
          )}
          {error && !isLocked && <div className="lp-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="lp-field">
              <label className="lp-label" htmlFor="email">Email / User ID</label>
              <input
                id="email" type="email" className="lp-input"
                placeholder="Enter your email"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="username" required disabled={isLocked}
              />
            </div>

            <div className="lp-field">
              <label className="lp-label" htmlFor="password">Password</label>
              <div className="lp-input-wrap">
                <input
                  id="password" type={showPassword ? 'text' : 'password'} className="lp-input"
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" style={{ paddingRight: '3.5rem' }}
                  required disabled={isLocked}
                />
                <button
                  type="button" className="lp-pw-toggle"
                  onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-btn" disabled={isSubmitting || isLocked}>
              {isSubmitting && <span className="lp-spinner"/>}
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="lp-footer">
            Need help?&nbsp;
            <a href={SUPPORT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              Contact Support · {SUPPORT.whatsappDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
