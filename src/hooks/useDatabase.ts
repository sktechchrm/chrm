// ─────────────────────────────────────────────────────────────────────────────
// useDatabase — Universal database hook
//
// Automatically uses the correct database for the active factory:
//   - MG Shirtex (mg_shirtex)  → Google Sheets
//   - Mohammadi (mohammadi)     → MySQL REST API
//   - Any future factory        → whatever db: { adapter } is set in its file
//
// Components never import adapters directly. This hook is the only interface.
//
// Usage (identical to old useSheetsSync):
//   const { save, update, remove, records, isLoading, isSaving, error } =
//     useDatabase('settlements', factoryId, userName);
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getDbForFactory }                           from '../database/DatabaseFactory';
import type { DbModule, DbRecord }                   from '../database/DatabaseFactory';

export interface UseDatabase {
  save:         (record: Record<string, unknown>) => Promise<string | null>;
  update:       (id: string, record: Record<string, unknown>) => Promise<boolean>;
  remove:       (id: string) => Promise<boolean>;
  reload:       () => void;
  records:      DbRecord[];
  isLoading:    boolean;
  isSaving:     boolean;
  lastSavedId:  string | null;
  editingId:    string | null;
  setEditingId: (id: string | null) => void;
  error:        string | null;
  configured:   boolean;
  adapterName:  string;
}

export function useDatabase(
  module:    DbModule,
  factoryId: string,
  savedBy:   string,
): UseDatabase {
  const [records,     setRecords]     = useState<DbRecord[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [reloadFlag,  setReloadFlag]  = useState(0);
  const [editingId,   setEditingId]   = useState<string | null>(null);

  // Resolve the correct adapter for THIS factory — memoised by factoryId
  const adapter = useMemo(() => getDbForFactory(factoryId), [factoryId]);

  const configured  = adapter.isConfigured();
  const adapterName = adapter.name;

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!configured) return;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    adapter.load(module, factoryId)
      .then(result => {
        if (cancelled) return;
        if (result.ok) setRecords(result.records);
        else           setError(result.error || 'Failed to load records');
      })
      .catch(err => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [module, factoryId, configured, reloadFlag, adapter]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = useCallback(async (record: Record<string, unknown>): Promise<string | null> => {
    if (!configured) { setError(`${adapterName} is not configured.`); return null; }
    setIsSaving(true);
    setError(null);
    const result = await adapter.save(module, record, factoryId, savedBy);
    setIsSaving(false);
    if (result.ok && result.id) {
      setLastSavedId(result.id);
      setRecords(prev => [{
        id: result.id!, savedAt: result.savedAt || new Date().toISOString(),
        savedBy, factoryId, ...record,
      } as DbRecord, ...prev]);
      return result.id;
    }
    setError(result.error || 'Failed to save record');
    return null;
  }, [module, factoryId, savedBy, configured, adapterName, adapter]);

  // ── Update ────────────────────────────────────────────────────────────────
  const update = useCallback(async (id: string, record: Record<string, unknown>): Promise<boolean> => {
    if (!configured) { setError(`${adapterName} is not configured.`); return false; }
    setIsSaving(true);
    setError(null);
    const result = await adapter.update(module, id, record, factoryId, savedBy);
    setIsSaving(false);
    if (result.ok) {
      setLastSavedId(result.id || id);
      setEditingId(null);
      setRecords(prev => [
        { id: result.id || id, savedAt: result.savedAt || new Date().toISOString(),
          savedBy, factoryId, ...record } as DbRecord,
        ...prev.filter(r => r.id !== id),
      ]);
      return true;
    }
    setError(result.error || 'Failed to update record');
    return false;
  }, [module, factoryId, savedBy, configured, adapterName, adapter]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const remove = useCallback(async (id: string): Promise<boolean> => {
    if (!configured) return false;
    const result = await adapter.delete(module, id, factoryId);
    if (result.ok) { setRecords(prev => prev.filter(r => r.id !== id)); return true; }
    setError(result.error || 'Failed to delete record');
    return false;
  }, [module, factoryId, configured, adapter]);

  // ── Reload ────────────────────────────────────────────────────────────────
  const reload = useCallback(() => setReloadFlag(f => f + 1), []);

  return {
    save, update, remove, reload,
    records, isLoading, isSaving, lastSavedId,
    editingId, setEditingId,
    error, configured, adapterName,
  };
}