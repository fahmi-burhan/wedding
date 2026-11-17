/**
 * server/lib/auth.ts — hash kata sandi admin, sesi login, dan penguncian setelah gagal berulang.
 *
 * Dipanggil oleh: server/routes/admin.ts, scripts/admin-password.ts, tests.
 * Memanggil: node:crypto (scrypt — tanpa dependensi native tambahan), server/lib/security.ts.
 *
 * Format hash yang disimpan di .env (ADMIN_PASSWORD_HASH):
 *   scrypt$<N>$<saltHex>$<hashHex>
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { DB } from '../db.ts';
import { readCookie, sha256 } from './security.ts';

const SCRYPT_N = 16384;
const KEY_LEN = 64;

export const SESSION_COOKIE = 'admin_sid';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam
const FREE_ATTEMPTS = 5; // gagal ke-6 dan seterusnya mulai dikunci
const MAX_LOCK_MS = 60 * 60 * 1000; // kunci paling lama 1 jam

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LEN, { N: SCRYPT_N });
  return `scrypt$${SCRYPT_N}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [algo, n, saltHex, hashHex] = stored.split('$');
  if (algo !== 'scrypt' || !n || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, { N: Number(n) });
  // timingSafeEqual: waktu pembandingan sama walau salah di karakter mana pun (cegah timing attack).
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Sisa waktu kunci (ms) untuk IP ini; 0 bila boleh mencoba. */
export function lockRemaining(db: DB, ipHash: string, now: number): number {
  const row = db.prepare('SELECT locked_until FROM login_attempts WHERE ip_hash = ?').get(ipHash) as
    | { locked_until: number }
    | undefined;
  return row && row.locked_until > now ? row.locked_until - now : 0;
}

/** Catat gagal login; jeda kunci membesar 1, 2, 4, 8 ... menit (maks 60). */
export function recordFailure(db: DB, ipHash: string, now: number): void {
  db.prepare(
    `INSERT INTO login_attempts (ip_hash, fails) VALUES (?, 1)
     ON CONFLICT(ip_hash) DO UPDATE SET fails = fails + 1`,
  ).run(ipHash);
  const { fails } = db.prepare('SELECT fails FROM login_attempts WHERE ip_hash = ?').get(ipHash) as { fails: number };
  if (fails > FREE_ATTEMPTS) {
    const lockMs = Math.min(60_000 * 2 ** (fails - FREE_ATTEMPTS - 1), MAX_LOCK_MS);
    db.prepare('UPDATE login_attempts SET locked_until = ? WHERE ip_hash = ?').run(now + lockMs, ipHash);
  }
}

export function clearFailures(db: DB, ipHash: string): void {
  db.prepare('DELETE FROM login_attempts WHERE ip_hash = ?').run(ipHash);
}

/** Buat sesi baru; kembalikan token mentah (hanya dikirim ke browser lewat cookie). */
export function createSession(db: DB, now: number): string {
  const token = randomBytes(32).toString('base64url');
  db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(now); // bersih-bersih sesi lama
  db.prepare('INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)').run(sha256(token), now + SESSION_TTL_MS);
  return token;
}

export function destroySession(db: DB, token: string | null): void {
  if (token) db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(sha256(token));
}

/** Middleware: lanjut hanya bila cookie sesi valid & belum kedaluwarsa. */
export function requireAdmin(db: DB, now: () => number) {
  return function requireAdminMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = readCookie(req, SESSION_COOKIE);
    const row = token
      ? (db.prepare('SELECT expires_at FROM admin_sessions WHERE token_hash = ?').get(sha256(token)) as
          | { expires_at: number }
          | undefined)
      : undefined;
    if (!row || row.expires_at <= now()) {
      res.status(401).json({ ok: false, error: 'Sesi berakhir. Silakan masuk lagi.' });
      return;
    }
    next();
  };
}
