/**
 * server/lib/security.ts — utilitas keamanan kecil: hash IP, parsing cookie, header keamanan, cek Origin.
 *
 * Dipanggil oleh: server/app.ts, server/lib/rateLimit.ts, server/routes/*.ts.
 * Memanggil: node:crypto.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// Garam untuk hash IP. Bila tidak diset di .env, dibuat acak per proses (hash berubah setelah restart).
const IP_SALT = process.env.IP_SALT || randomBytes(16).toString('hex');

/**
 * Kita tidak menyimpan IP tamu mentah (data pribadi). Cukup hash bergaram:
 * masih bisa dipakai untuk rate limit & penguncian, tapi tidak bisa dibalik menjadi IP.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(IP_SALT + ip).digest('hex').slice(0, 32);
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Parser cookie minimal (kita hanya butuh satu cookie admin, tidak perlu dependensi tambahan). */
export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Header keamanan dasar untuk semua respons. */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  // Undangan bersifat pribadi: minta mesin pencari tidak mengindeks.
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // data: diperlukan karena Vite menyisipkan subset font yang sangat kecil (< 4 KB) langsung ke CSS.
      "font-src 'self' data:",
      "media-src 'self'",
      "connect-src 'self'",
      // Peta Google hanya dimuat bila event.venue.embedUrl diisi.
      'frame-src https://www.google.com',
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );
  next();
}

/**
 * Tolak request yang mengubah data (POST/PATCH/DELETE) bila header Origin berasal dari situs lain.
 * Bersama cookie SameSite=Strict, ini menutup celah CSRF pada panel admin.
 */
export function sameOriginOnly(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const origin = req.headers.origin;
  if (origin) {
    let originHost = '';
    try {
      originHost = new URL(origin).host;
    } catch {
      /* origin rusak → dianggap beda situs */
    }
    if (originHost !== req.headers.host) {
      res.status(403).json({ ok: false, error: 'Permintaan ditolak.' });
      return;
    }
  }
  next();
}
