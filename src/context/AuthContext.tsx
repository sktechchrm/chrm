// ─────────────────────────────────────────────────────────────────────────────
// AUTH CONTEXT — secure session management with configurable per-user expiry
//
// Session duration is set per-user in src/auth/users.ts → sessionDuration (minutes)
//   0   = never expires (superadmin only)
//   480 = 8 hours (admin)
//   240 = 4 hours (manager)
//    60 = 1 hour  (viewer)
//
// On login: loginTime is written to sessionStorage alongside the user object.
// A 60-second interval checks remaining time.
// 5 minutes before expiry: a warning banner appears with a "Renew" button.
// On expiry: auto-logout + redirect to /login.
//
// Security model:
//  • Password is NEVER stored in sessionStorage
//  • Closing the browser always ends the session (sessionStorage, not localStorage)
//  • Page refresh within the same tab keeps the session alive
//  • Factory switching is validated against accessibleFactoryIds
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useRef,
} from 'react';
import type { AppUser } from '../auth/users';
import { SecurityGuard } from '../security/SecurityGuard';

const SESSION_KEY = 'rms_session_v4'; // bump version to invalidate old sessions

// ── Warn 5 minutes before expiry ─────────────────────────────────────────────
const WARN_BEFORE_MS = 5 * 60 * 1000;

// ── Types ─────────────────────────────────────────────────────────────────────
type SafeUser = Omit<AppUser, 'password'>;

interface StoredSession {
  user:            SafeUser;
  activeFactoryId: string;
  loginTime:       number;   // epoch ms — used to calculate expiry
}

interface AuthContextValue {
  user:             SafeUser | null;
  activeFactoryId:  string;
  login:            (user: AppUser) => void;
  logout:           () => void;
  renewSession:     () => void;
  isAuthenticated:  boolean;
  setActiveFactory: (factoryId: string) => void;
  canAccess:        (moduleId: string) => boolean;
  /** Minutes remaining in session. null = never expires. */
  sessionMinsLeft:  number | null;
  /** True when < WARN_BEFORE_MS remaining — show the warning banner */
  sessionExpiring:  boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, activeFactoryId: '', isAuthenticated: false,
  sessionMinsLeft: null, sessionExpiring: false,
  login: () => {}, logout: () => {}, renewSession: () => {},
  setActiveFactory: () => {}, canAccess: () => false,
});

// ── Session helpers ───────────────────────────────────────────────────────────

function saveSession(user: SafeUser, activeFactoryId: string, loginTime: number): void {
  try {
    const session: StoredSession = { user, activeFactoryId, loginTime };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch { /* quota or private-mode */ }
}

function loadSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StoredSession;
    if (!session.user?.factoryId || !session.user?.email || !session.loginTime) return null;
    const validId = session.user.accessibleFactoryIds?.includes(session.activeFactoryId)
      ? session.activeFactoryId
      : session.user.factoryId;
    return { ...session, activeFactoryId: validId };
  } catch { return null; }
}

function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  // Clear legacy session keys
  ['rms_session_v3','rms_session_v2','rms_session'].forEach(k => {
    sessionStorage.removeItem(k);
    localStorage.removeItem(k);
  });
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userId');
}

/** Returns remaining ms, or Infinity if session never expires (duration === 0) */
function remainingMs(loginTime: number, durationMinutes: number): number {
  if (durationMinutes === 0) return Infinity;
  return loginTime + durationMinutes * 60 * 1000 - Date.now();
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = loadSession();

  const [user,            setUser]            = useState<SafeUser | null>(stored?.user ?? null);
  const [activeFactoryId, setActiveFactoryId] = useState<string>(stored?.activeFactoryId ?? '');
  const [loginTime,       setLoginTime]       = useState<number>(stored?.loginTime ?? 0);
  const [sessionMinsLeft, setSessionMinsLeft] = useState<number | null>(null);
  const [sessionExpiring, setSessionExpiring] = useState(false);

  const logoutRef = useRef<() => void>(() => {});

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setActiveFactoryId('');
    setLoginTime(0);
    setSessionMinsLeft(null);
    setSessionExpiring(false);
  }, []);

  logoutRef.current = logout;

  const login = useCallback((incoming: AppUser) => {
    const { password: _pw, ...safe } = incoming;
    const initialFactory = safe.factoryId;
    const now = Date.now();
    saveSession(safe, initialFactory, now);
    setUser(safe);
    setActiveFactoryId(initialFactory);
    setLoginTime(now);
    setSessionExpiring(false);
  }, []);

  const renewSession = useCallback(() => {
    if (!user) return;
    const now = Date.now();
    setLoginTime(now);
    setSessionExpiring(false);
    saveSession(user, activeFactoryId, now);
  }, [user, activeFactoryId]);

  const setActiveFactory = useCallback((factoryId: string) => {
    if (!user) return;
    if (!user.accessibleFactoryIds.includes(factoryId)) return;
    setActiveFactoryId(factoryId);
    saveSession(user, factoryId, loginTime);
  }, [user, loginTime]);

  const canAccess = useCallback((moduleId: string): boolean =>
    SecurityGuard.from(user).canAccessModule(moduleId).allowed,
  [user]);

  // ── Session expiry timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !loginTime) return;
    const duration = user.sessionDuration ?? 480;

    // Never expires
    if (duration === 0) {
      setSessionMinsLeft(null);
      setSessionExpiring(false);
      return;
    }

    const tick = () => {
      const remaining = remainingMs(loginTime, duration);
      if (remaining <= 0) {
        logoutRef.current();
        return;
      }
      const minsLeft = Math.ceil(remaining / 60000);
      setSessionMinsLeft(minsLeft);
      setSessionExpiring(remaining <= WARN_BEFORE_MS);
    };

    tick(); // immediate check on mount / login
    const id = setInterval(tick, 60_000); // check every minute
    return () => clearInterval(id);
  }, [user, loginTime]);

  return (
    <AuthContext.Provider value={{
      user, activeFactoryId, login, logout, renewSession,
      isAuthenticated: !!user,
      setActiveFactory, canAccess,
      sessionMinsLeft, sessionExpiring,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
