// ─────────────────────────────────────────────────────────────────────────────
// RouteGuard — enforces module-level access at the routing layer
// src/security/RouteGuard.tsx
//
// Wraps every module render in RewardApp.tsx.
// If the user lacks permission, shows AccessDenied — never the module.
//
// USAGE (in RewardApp.tsx):
//   <RouteGuard moduleId="settlement">
//     <FinalSettlement />
//   </RouteGuard>
//
// This replaces the scattered:
//   if (!user || !canAccess(user, currentPage)) return <AccessDenied />;
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaLock } from 'react-icons/fa';
import { useSecurity } from './useSecurity';
import type { ModuleId } from './SecurityPolicy';

// ── Module display names ──────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  maternity:        'Maternity Benefit',
  settlement:       'Final Settlement',
  leftnotice:       'Left Worker Notice',
  personalfile:     'Personal File',
  requisition:      'Requisition',
  increment:        'Salary Increment',
  meeting:          'Meeting Minutes',
  reports:          'Report Module',
  authority:        'Authority Control',
  database:         'Database Admin',
  grievance:        'কর্মী অভিযোগ ব্যবস্থাপনা',
  workerguideline:  'Worker Guideline',
  workerrights:     'Worker Rights',
};

// ── AccessDenied screen ───────────────────────────────────────────────────────

function AccessDenied({ moduleName, reason }: { moduleName: string; reason?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '50vh', gap: '16px',
      fontFamily: 'var(--font-sans, sans-serif)',
    }}>
      <FaLock style={{ fontSize: '48px', color: 'var(--color-border-secondary)' }} />
      <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        Access restricted
      </div>
      <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        You don't have permission to access <strong>{moduleName}</strong>.
      </div>
      {reason && (
        <div style={{
          fontSize: '12px', color: 'var(--color-text-tertiary)',
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-tertiary)',
          borderRadius: '8px', padding: '8px 16px', maxWidth: 360, textAlign: 'center',
        }}>
          {reason}
        </div>
      )}
      <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
        Contact your administrator if you need access.
      </div>
    </div>
  );
}

// ── RouteGuard ────────────────────────────────────────────────────────────────

interface RouteGuardProps {
  moduleId:  ModuleId | string;
  children:  React.ReactNode;
}

export default function RouteGuard({ moduleId, children }: RouteGuardProps) {
  const security = useSecurity();
  const result   = security.module(moduleId);

  if (!result.allowed) {
    return (
      <AccessDenied
        moduleName={MODULE_LABELS[moduleId] ?? moduleId}
        reason={result.reason}
      />
    );
  }

  return <>{children}</>;
}
