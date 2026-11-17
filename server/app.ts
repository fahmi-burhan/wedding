/**
 * server/app.ts — merakit aplikasi Express (middleware, API, berkas statis hasil build).
 *
 * Dipanggil oleh: server/index.ts (produksi/dev), tests/*.test.ts (dengan database & jam palsu).
 * Memanggil: server/routes/public.ts, server/routes/admin.ts, server/lib/security.ts.
 *
 * Kenapa dipisah dari index.ts? Supaya test bisa membuat aplikasi dengan database :memory:
 * dan jam yang bisa diatur (untuk menguji tenggat) tanpa benar-benar membuka port.
 */
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { DB } from './db.ts';
import { publicRouter } from './routes/public.ts';
import { adminRouter } from './routes/admin.ts';
import { securityHeaders } from './lib/security.ts';

export interface AppOptions {
  db: DB;
  /** Sumber waktu; test menggantinya untuk mensimulasikan tenggat lewat. */
  now?: () => number;
  adminPasswordHash?: string;
  publicBaseUrl?: string;
  secureCookie?: boolean;
  /** Nilai Express 'trust proxy' (mis. 'loopback' bila di belakang Nginx di server yang sama). */
  trustProxy?: string | boolean;
  /** Folder hasil `npm run build`. Bila tidak ada, hanya API yang aktif (mode dev). */
  distDir?: string;
}

export function createApp(opts: AppOptions) {
  const now = opts.now ?? Date.now;
  const app = express();

  app.disable('x-powered-by');
  // Di belakang Nginx, IP asli tamu ada di header X-Forwarded-For. Tanpa pengaturan ini,
  // semua tamu terlihat ber-IP 127.0.0.1 dan rate limit akan memblokir semua orang sekaligus.
  if (opts.trustProxy) app.set('trust proxy', opts.trustProxy);

  app.use(securityHeaders);
  // Batasi ukuran body: RSVP terbesar < 2 KB. Body raksasa = serangan.
  app.use('/api', express.json({ limit: '10kb' }));
  // Respons API jangan di-cache browser/proxy (data selalu terbaru).
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use('/api/admin', adminRouter(opts.db, now, {
    passwordHash: opts.adminPasswordHash,
    publicBaseUrl: opts.publicBaseUrl ?? '',
    secureCookie: opts.secureCookie ?? false,
  }));
  app.use('/api', publicRouter(opts.db, now));
  app.use('/api', (_req, res) => {
    res.status(404).json({ ok: false, error: 'Alamat API tidak ditemukan.' });
  });

  const dist = opts.distDir ? resolve(opts.distDir) : '';
  if (dist && existsSync(join(dist, 'index.html'))) {
    // Aset ber-hash (assets/*) aman di-cache lama; HTML selalu dicek ulang agar revisi langsung terlihat.
    app.use(
      express.static(dist, {
        index: 'index.html',
        setHeaders(res, filePath) {
          if (filePath.startsWith(join(dist, 'assets'))) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
    // Tautan pendek tamu: /u/KODE → halaman undangan yang sama; browser membaca KODE dari alamat,
    // lalu meminta nama & kuota ke /api/guest/KODE. Kode salah tetap menampilkan undangan (sapaan umum).
    app.get('/u/:code', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(join(dist, 'index.html'));
    });
    app.get(['/admin', '/admin/'], (_req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      res.sendFile(join(dist, 'admin.html'));
    });
  }

  app.use((_req, res) => {
    res.status(404).type('text/plain').send('Halaman tidak ditemukan.');
  });

  // Penangan error terakhir: JSON rusak → 400; selain itu 500 tanpa membocorkan detail ke tamu.
  app.use((err: Error & { type?: string; status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
      res.status(400).json({ ok: false, error: 'Data tidak valid.' });
      return;
    }
    console.error('[server] error:', err);
    res.status(500).json({ ok: false, error: 'Terjadi kesalahan di server. Silakan coba lagi.' });
  });

  return app;
}
