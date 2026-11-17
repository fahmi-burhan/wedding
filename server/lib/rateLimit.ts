/**
 * server/lib/rateLimit.ts — pembatas laju sederhana (fixed window) di memori.
 *
 * Dipanggil oleh: server/app.ts (dipasang di route RSVP, ucapan, dan login).
 * Memanggil: server/lib/security.ts (hash IP).
 *
 * Kenapa di memori? Server undangan hanya satu proses di satu VPS. Bila server restart penghitung
 * kosong lagi — tidak masalah, tujuannya menahan bot iseng, bukan audit.
 * Keterbatasan: bila nanti dijalankan multi-proses (cluster), tiap proses punya hitungan sendiri.
 */
import type { NextFunction, Request, Response } from 'express';
import { hashIp } from './security.ts';

export interface RateLimitOptions {
  /** Panjang jendela waktu (ms). */
  windowMs: number;
  /** Maksimum request per IP per jendela. */
  max: number;
  /** Pesan untuk tamu (jangan teknis). */
  message: string;
  now?: () => number;
}

export function rateLimit(opts: RateLimitOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const now = opts.now ?? Date.now;

  // Bersihkan entri kedaluwarsa berkala agar Map tidak tumbuh tanpa batas.
  const sweeper = setInterval(() => {
    const t = now();
    for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
  }, Math.max(opts.windowMs, 60_000));
  sweeper.unref(); // jangan menahan proses tetap hidup (penting untuk test).

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = hashIp(req.ip ?? 'unknown');
    const t = now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      entry = { count: 0, resetAt: t + opts.windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > opts.max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - t) / 1000));
      res.status(429).json({ ok: false, error: opts.message });
      return;
    }
    next();
  };
}
