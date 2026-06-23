// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD SECURITY UTILITY
//
// Uses the browser's native Web Crypto API (SHA-256) to hash passwords
// so that plaintext credentials are never stored in the source bundle.
//
// HOW TO GENERATE A HASH for a new password:
//   Open browser console and run:
//     const SALT = 'rms_sk_tech_2025';
//     const data = new TextEncoder().encode(SALT + 'YourPlainPassword');
//     const buf  = await crypto.subtle.digest('SHA-256', data);
//     console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''));
//
// IMPORTANT: The SALT here MUST match the SALT used when the hashes in
// users.ts were generated. Never change the SALT without re-generating
// all stored hashes.
//
// PRODUCTION NOTE:
//   This is a client-side SHA-256 hash with a fixed salt.
//   It prevents plaintext passwords in the bundle, but true production
//   security requires a backend API with bcrypt/Argon2 + JWT tokens.
// ─────────────────────────────────────────────────────────────────────────────

const SALT = 'rms_sk_tech_2025';

/**
 * Returns a hex SHA-256 hash of (SALT + password).
 * Async — uses SubtleCrypto available in all modern browsers.
 */
export async function hashPassword(password: string): Promise<string> {
  const data   = new TextEncoder().encode(SALT + password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compares a plain-text password against a stored SHA-256(SALT+password) hash.
 * Returns true only if they match.
 */
export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  const computed = await hashPassword(plain);
  return computed === storedHash;
}

/**
 * One-time utility — call in the browser console to generate hashes
 * for a batch of new passwords:
 *
 *   import { batchHashPasswords } from '../utils/passwordUtils';
 *   batchHashPasswords(['Saiful@1985', 'mg@admin2025']).then(console.table);
 */
export async function batchHashPasswords(passwords: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const pw of passwords) {
    result[pw] = await hashPassword(pw);
  }
  return result;
}