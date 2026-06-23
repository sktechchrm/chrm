// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE SHEETS SERVICE
// Thin API layer between the RMS frontend and the Apps Script Web App.
//
// All calls go through the single Apps Script URL.
// POST → save / delete operations
// GET  → load / stats operations
// ─────────────────────────────────────────────────────────────────────────────

import { SHEETS_CONFIG, isSheetsConfigured } from '../config/sheets';
import { getFactorySpreadsheetId } from '../config/factory';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SheetModule =
  | 'settlements'
  | 'maternity'
  | 'leftnotice'
  | 'employees'
  | 'requisitions'
  | 'increments'
  | 'meetings';

export interface SheetRecord {
  id:        string;
  savedAt:   string;
  savedBy:   string;
  factoryId: string;
  [key: string]: string | number | boolean;
}

export interface SaveResult {
  ok:      boolean;
  id?:     string;
  savedAt?: string;
  error?:  string;
}

export interface LoadResult {
  ok:       boolean;
  records:  SheetRecord[];
  count?:   number;
  error?:   string;
}

export interface StatsResult {
  ok:    boolean;
  stats: Record<SheetModule, number>;
  error?: string;
}

// ── Core fetch helpers ────────────────────────────────────────────────────────

async function sheetsPost(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!isSheetsConfigured()) {
    throw new Error('Google Sheets is not configured. Open src/config/sheets.ts and add your Web App URL and key.');
  }

  const response = await fetch(SHEETS_CONFIG.url, {
    method:   'POST',
    redirect: 'follow',
    // No Content-Type header — avoids CORS preflight with Apps Script
    body: JSON.stringify({ ...body, key: SHEETS_CONFIG.key }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function sheetsGet(params: Record<string, string>): Promise<Record<string, unknown>> {
  if (!isSheetsConfigured()) {
    throw new Error('Google Sheets is not configured. Open src/config/sheets.ts and add your Web App URL and key.');
  }

  const qs = new URLSearchParams({ ...params, key: SHEETS_CONFIG.key }).toString();
  const response = await fetch(`${SHEETS_CONFIG.url}?${qs}`, {
    method:   'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Save a record to the specified module's sheet.
 *
 * @param module   The sheet module name (e.g. 'settlements')
 * @param record   The data object to save (column names must match SHEET_COLUMNS in Code.gs)
 * @param factoryId The factory this record belongs to
 * @param savedBy  The username of the person saving
 */
export async function saveRecord(
  module:    SheetModule,
  record:    Record<string, unknown>,
  factoryId: string,
  savedBy:   string,
): Promise<SaveResult> {
  try {
    const spreadsheetId = getFactorySpreadsheetId(factoryId);
    const result = await sheetsPost({ action: 'save', module, record, factoryId, spreadsheetId, savedBy });
    return result as unknown as SaveResult;
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Load records from the specified module's sheet.
 *
 * @param module    The sheet module name
 * @param factoryId Filter by factory (pass 'all' to skip filtering)
 * @param limit     Maximum number of records to return (default 50)
 */
export async function loadRecords(
  module:    SheetModule,
  factoryId: string,
  limit      = 50,
): Promise<LoadResult> {
  try {
    const spreadsheetId = getFactorySpreadsheetId(factoryId);
    const result = await sheetsGet({
      action:    'load',
      module,
      factoryId,
      spreadsheetId,
      limit:     String(limit),
    });
    return result as unknown as LoadResult;
  } catch (err) {
    return { ok: false, records: [], error: (err as Error).message };
  }
}

/**
 * Delete a record by ID from the specified module's sheet.
 *
 * @param module    The sheet module name
 * @param id        The record ID to delete
 * @param factoryId The factory this record belongs to (required to target the correct spreadsheet)
 */
export async function deleteRecord(
  module:    SheetModule,
  id:        string,
  factoryId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const spreadsheetId = getFactorySpreadsheetId(factoryId);
    const result = await sheetsPost({ action: 'delete', module, id, factoryId, spreadsheetId });
    return result as unknown as { ok: boolean; error?: string };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Get record counts per module for the given factory.
 * Used by the Dashboard stats panel.
 */
export async function loadStats(factoryId: string): Promise<StatsResult> {
  try {
    const spreadsheetId = getFactorySpreadsheetId(factoryId);
    const result = await sheetsGet({ action: 'stats', factoryId, spreadsheetId });
    return result as unknown as StatsResult;
  } catch (err) {
    return {
      ok: false,
      stats: {} as Record<SheetModule, number>,
      error: (err as Error).message,
    };
  }
}

// ── Date formatting helpers ───────────────────────────────────────────────────

/** Format an ISO date string for display in the history panel */
// Re-exported from utils/dateUtils for backward compatibility
export { formatSavedAt } from '../utils/dateUtils';