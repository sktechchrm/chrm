// ─────────────────────────────────────────────────────────────────────────────
// DatabaseAdmin — Central Database Control Panel
//
// Accessible only to superadmin/admin users via the Navigation "Settings" menu.
// Shows:
//   • Active adapter (which database is in use)
//   • Connection health (live ping)
//   • All available adapters & their config status
//   • Per-factory, per-module CRUD stats
//   • How to switch databases (env var guide)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { db, getAllAdapters, getDbForFactory } from '../../database/DatabaseFactory';
import type { ConnectionStatus, StatsResult }  from '../../database/DatabaseFactory';
import { useAuth }                             from '../../context/AuthContext';
import { useSecurity }                         from '../../security';
import { FACTORY_REGISTRY }                    from '../../config/factory';

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusDot({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} />;
  return (
    <span style={{
      width: 10, height: 10, borderRadius: '50%',
      background: ok ? '#22c55e' : '#ef4444',
      display: 'inline-block',
      boxShadow: ok ? '0 0 6px #22c55e88' : '0 0 6px #ef444488',
    }} />
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: color + '22', color, border: `1px solid ${color}44`,
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      {label}
    </span>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b',
      borderRadius: 14, padding: 24, ...style,
    }}>
      {children}
    </div>
  );
}

const MODULE_LABELS: Record<string, string> = {
  settlements:  'Final Settlement',
  maternity:    'Maternity Benefit',
  leftnotice:   'Left Notice',
  employees:    'Employee Files',
  requisitions: 'Requisitions',
  increments:   'Increments',
  meetings:     'Meeting Minutes',
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function DatabaseAdmin() {
  const { user, activeFactoryId } = useAuth();
  const security = useSecurity();
  const [connStatus,  setConnStatus]  = useState<ConnectionStatus | null>(null);
  const [pinging,     setPinging]     = useState(false);
  const [stats,       setStats]       = useState<StatsResult | null>(null);
  const [statsLoading,setStatsLoading]= useState(false);
  const [selectedFac, setSelectedFac] = useState(activeFactoryId || '');

  // ── Ping ──────────────────────────────────────────────────────────────────
  const pingNow = useCallback(async () => {
    setPinging(true);
    const facAdapter = selectedFac ? getDbForFactory(selectedFac) : db;
    const status = await facAdapter.ping();
    setConnStatus(status);
    setPinging(false);
  }, [selectedFac]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const loadStats = useCallback(async (factoryId: string) => {
    if (!factoryId) return;
    setStatsLoading(true);
    const facAdapter = getDbForFactory(factoryId);
    const result = await facAdapter.stats(factoryId);
    setStats(result);
    setStatsLoading(false);
  }, []);

  useEffect(() => { pingNow(); }, [pingNow]);
  useEffect(() => { if (selectedFac) loadStats(selectedFac); }, [selectedFac, loadStats]);

  if (!security.canViewDatabaseAdmin) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontFamily: 'monospace' }}>
        🔒 Access restricted to administrators.
      </div>
    );
  }

  const allAdapters = getAllAdapters();
  const activeKey   = db.key;

  return (
    <div style={{
      fontFamily: "'DM Mono', 'Fira Mono', 'Courier New', monospace",
      background: '#020817', minHeight: '100vh',
      color: '#e2e8f0', padding: '32px 24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        .db-admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .db-admin-table th { background: #0f172a; color: #64748b; padding: 10px 14px;
          text-align: left; font-weight: 500; border-bottom: 1px solid #1e293b; letter-spacing: 0.05em; font-size: 11px; text-transform: uppercase; }
        .db-admin-table td { padding: 10px 14px; border-bottom: 1px solid #0f172a; color: #cbd5e1; }
        .db-admin-table tr:hover td { background: #0f172a88; }
        .db-pill-btn { cursor: pointer; border: 1px solid #334155; background: #0f172a;
          color: #94a3b8; padding: 6px 16px; border-radius: 8px; font-size: 12px;
          font-family: inherit; transition: all 0.15s; }
        .db-pill-btn:hover { border-color: #3b82f6; color: #3b82f6; }
        .db-pill-btn.active { border-color: #3b82f6; background: #1e3a5f; color: #60a5fa; }
        .stat-bar { height: 6px; background: #1e293b; border-radius: 3px; margin-top: 6px; overflow: hidden; }
        .stat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        .env-box { background: #020817; border: 1px solid #1e293b; border-radius: 8px;
          padding: 14px 18px; font-size: 12px; color: #67e8f9; margin-top: 8px; line-height: 1.8; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>⚙️</span>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Database Control Center
          </h1>
          <Badge label={selectedFac ? getDbForFactory(selectedFac).name : db.name} color="#3b82f6" />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          Central database management — switch adapters, monitor connections, inspect CRUD health.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Active Connection */}
        <Card>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Active Connection
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <StatusDot ok={connStatus ? connStatus.connected : null} />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
              {selectedFac ? getDbForFactory(selectedFac).name : db.name}
            </span>
            {connStatus?.latencyMs !== undefined && (
              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
                {connStatus.latencyMs}ms
              </span>
            )}
          </div>
          {connStatus?.error && (
            <div style={{ fontSize: 12, color: '#f87171', background: '#7f1d1d22', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
              ⚠ {connStatus.error}
            </div>
          )}
          {connStatus?.connected && (
            <div style={{ fontSize: 12, color: '#4ade80', background: '#14532d22', border: '1px solid #14532d', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
              ✓ Connection healthy
            </div>
          )}
          <button className="db-pill-btn" onClick={pingNow} disabled={pinging} style={{ marginTop: 4 }}>
            {pinging ? '⟳ Pinging…' : '↺ Test Connection'}
          </button>
        </Card>

        {/* How to Switch */}
        <Card>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Switch Database (Zero Code Changes)
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 10px' }}>
            Edit one line in your <code style={{ color: '#67e8f9' }}>.env</code> file and rebuild:
          </p>
          <div className="env-box">
            <div># Current (.env)</div>
            <div>VITE_DB_ADAPTER=<span style={{ color: '#a78bfa' }}>{activeKey}</span></div>
            <br />
            <div style={{ color: '#64748b' }}># To switch to MySQL:</div>
            <div>VITE_DB_ADAPTER=<span style={{ color: '#f59e0b' }}>mysql</span></div>
            <div>VITE_MYSQL_API_URL=<span style={{ color: '#94a3b8' }}>https://api.yourserver.com</span></div>
            <div>VITE_MYSQL_API_KEY=<span style={{ color: '#94a3b8' }}>your-api-key</span></div>
          </div>
        </Card>
      </div>

      {/* Per-Factory Adapter Matrix */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Per-Factory Database Assignment
        </div>
        <table className="db-admin-table">
          <thead>
            <tr>
              <th>Factory</th>
              <th>Adapter</th>
              <th>Config File</th>
              <th>Status</th>
              <th>How to Change</th>
            </tr>
          </thead>
          <tbody>
            {FACTORY_REGISTRY.map(fac => {
              const facAdapter   = getDbForFactory(fac.id);
              const isConfigured = facAdapter.isConfigured();
              const dbCfg        = fac.db;
              const adapterKey   = dbCfg?.adapter ?? 'auto';
              return (
                <tr key={fac.id}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                    {fac.nameEn}
                    {!fac.active && <span style={{ color: '#475569', fontWeight: 400, marginLeft: 6 }}>(inactive)</span>}
                  </td>
                  <td>
                    <span style={{ color: adapterKey === 'sheets' ? '#34d399' : adapterKey === 'mysql' ? '#f59e0b' : '#94a3b8', fontWeight: 600 }}>
                      {facAdapter.name}
                    </span>
                  </td>
                  <td>
                    <code style={{ color: '#67e8f9', fontSize: 11 }}>
                      src/factories/{fac.id.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}.ts
                    </code>
                  </td>
                  <td>
                    {isConfigured
                      ? <Badge label="Ready ✓" color="#22c55e" />
                      : <Badge label="Not Configured" color="#f87171" />}
                  </td>
                  <td style={{ fontSize: 11, color: '#64748b' }}>
                    Set <code style={{ color: '#a78bfa' }}>db.adapter</code> in factory file
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: 16, padding: '12px 16px', background: '#0a0f1e', borderRadius: 8, border: '1px solid #1e293b', fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
          <strong style={{ color: '#94a3b8' }}>To change a factory's database:</strong> open its file in{' '}
          <code style={{ color: '#67e8f9' }}>src/factories/</code> and update the{' '}
          <code style={{ color: '#a78bfa' }}>db</code> field. Example:
          <div className="env-box" style={{ marginTop: 8 }}>
            <div style={{ color: '#64748b' }}>// src/factories/Mohammadi.ts</div>
            <div>db: {'{'}</div>
            <div>&nbsp;&nbsp;adapter:     <span style={{ color: '#f59e0b' }}>'mysql'</span>,</div>
            <div>&nbsp;&nbsp;mysqlApiUrl: <span style={{ color: '#94a3b8' }}>'https://api.mohammadi.com'</span>,</div>
            <div>&nbsp;&nbsp;mysqlApiKey: <span style={{ color: '#94a3b8' }}>'sk_...'</span>,</div>
            <div>{'}'}</div>
          </div>
        </div>
      </Card>

      {/* All adapter types */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Available Adapter Types
        </div>
        <table className="db-admin-table">
          <thead>
            <tr>
              <th>Adapter</th>
              <th>Key</th>
              <th>Global Env Config</th>
              <th>Global Status</th>
            </tr>
          </thead>
          <tbody>
            {allAdapters.map(adapter => (
              <tr key={adapter.key}>
                <td style={{ fontWeight: 600, color: adapter.key === activeKey ? '#60a5fa' : '#e2e8f0' }}>
                  {adapter.key === activeKey && <span style={{ color: '#22c55e', marginRight: 6 }}>▶</span>}
                  {adapter.name}
                </td>
                <td><code style={{ color: '#67e8f9', fontSize: 12 }}>{adapter.key}</code></td>
                <td><code style={{ color: '#94a3b8', fontSize: 11 }}>VITE_DB_ADAPTER={adapter.key}</code></td>
                <td>
                  {adapter.isConfigured()
                    ? <Badge label="Configured ✓" color="#22c55e" />
                    : <Badge label="Not Configured" color="#f87171" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* CRUD Stats per Module */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            CRUD Health — Record Counts per Module
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FACTORY_REGISTRY.filter(f => f.active).map(fac => (
              <button
                key={fac.id}
                className={`db-pill-btn${selectedFac === fac.id ? ' active' : ''}`}
                onClick={() => setSelectedFac(fac.id)}
              >
                {fac.nameEn}
              </button>
            ))}
          </div>
        </div>

        {statsLoading && (
          <div style={{ textAlign: 'center', padding: 32, color: '#64748b', fontSize: 13 }}>
            ⟳ Loading stats…
          </div>
        )}

        {!statsLoading && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {Object.entries(MODULE_LABELS).map(([mod, label]) => {
              const count   = (stats.stats as Record<string, number>)?.[mod] ?? 0;
              const maxCount = Math.max(...Object.values(stats.stats as Record<string, number> || {}), 1);
              const pct     = Math.round((count / maxCount) * 100);
              return (
                <div key={mod} style={{ background: '#0a0f1e', borderRadius: 10, padding: '14px 16px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: count > 0 ? '#60a5fa' : '#334155' }}>
                    {count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569' }}>records</div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{
                      width: `${pct}%`,
                      background: count > 0 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : '#334155',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!statsLoading && !stats && selectedFac && (
          <div style={{ textAlign: 'center', padding: 32, color: '#64748b', fontSize: 13 }}>
            No stats available. Check connection status above.
          </div>
        )}

        {!selectedFac && (
          <div style={{ textAlign: 'center', padding: 32, color: '#64748b', fontSize: 13 }}>
            Select a factory above to view module stats.
          </div>
        )}
      </Card>

      {/* Architecture note */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
        <strong style={{ color: '#94a3b8' }}>Architecture:</strong>{' '}
        All modules use <code style={{ color: '#67e8f9' }}>useDatabase(module, factoryId, user)</code> → calls <code style={{ color: '#67e8f9' }}>DatabaseFactory.db</code> → routes to active adapter.
        Zero component changes required when switching backends.
        To add a new database: implement <code style={{ color: '#a78bfa' }}>IDatabaseAdapter</code> in <code style={{ color: '#a78bfa' }}>src/database/adapters/</code> and register it in <code style={{ color: '#a78bfa' }}>DatabaseFactory.ts</code>.
      </div>
    </div>
  );
}
