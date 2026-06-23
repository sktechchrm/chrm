// ─────────────────────────────────────────────────────────────────────────────
// src/utils/dateUtils.ts
// Date and time formatting helpers — database-agnostic, usable everywhere.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format an ISO timestamp for display in the Bangladesh locale.
 * e.g. "2024-12-01T09:30:00.000Z" → "01 Dec 2024, 03:30 PM"
 */
export function formatSavedAt(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-BD', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/**
 * Format a date as DD/MM/YYYY for use in forms and documents.
 */
export function formatDate(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(date);
  }
}

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Normalises any date value coming from a DB record into the "yyyy-MM-dd"
 * format required by <input type="date">.
 *
 * Handles:
 *  - Already-correct strings:  "2026-05-21"          → "2026-05-21"
 *  - Full ISO timestamps:       "2026-05-21T18:00:00.000Z" → "2026-05-21"
 *  - Partial ISO junk:          "31T18:00:00.000Z"    → ""
 *  - DD/MM/YYYY:                "21/05/2026"          → "2026-05-21"
 *  - Empty / null / undefined:  any falsy value       → ""
 */
export function toDateInput(value: unknown): string {
  if (!value) return '';
  const s = String(value).trim();
  if (!s) return '';

  // Already yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // ISO timestamp — take the date part only
  if (s.includes('T')) {
    const part = s.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
    return ''; // e.g. "31T18:00:00.000Z" — day-only prefix, not a real date
  }

  // DD/MM/YYYY
  const dmyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }

  // Fallback — let Date parse it and re-format if valid
  try {
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      const y  = parsed.getFullYear();
      const m  = String(parsed.getMonth() + 1).padStart(2, '0');
      const d  = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch { /* fall through */ }

  return '';
}
