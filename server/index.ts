/**
 * server/index.ts — titik masuk server. Dijalankan oleh `npm run dev:api` dan `npm start`.
 *
 * Dipanggil oleh: Node.js (node server/index.ts — TypeScript dijalankan langsung lewat type stripping).
 * Memanggil: server/db.ts (buka database + migration), server/app.ts (rakit Express).
 *
 * Variabel lingkungan (.env) — lihat .env.example:
 *   PORT, HOST, DB_PATH, ADMIN_PASSWORD_HASH, PUBLIC_BASE_URL, IP_SALT, TRUST_PROXY, NODE_ENV
 */
import { resolve } from 'node:path';
import { openDb } from './db.ts';
import { createApp } from './app.ts';

const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);
// Default 0.0.0.0 agar bisa dites dari ponsel di Wi-Fi yang sama. Di VPS (di belakang Nginx) pakai 127.0.0.1.
const host = process.env.HOST || '0.0.0.0';

const db = openDb();
const app = createApp({
  db,
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${port}`,
  secureCookie: isProd,
  trustProxy: process.env.TRUST_PROXY || false,
  distDir: resolve(import.meta.dirname, '..', 'dist'),
});

if (!process.env.ADMIN_PASSWORD_HASH) {
  console.warn('[server] ADMIN_PASSWORD_HASH belum diisi → panel admin terkunci. Jalankan: npm run admin:password');
}
if (!process.env.IP_SALT) {
  console.warn('[server] IP_SALT belum diisi → dibuat acak sementara (penguncian login hilang setelah restart).');
}

const server = app.listen(port, host, () => {
  console.log(`[server] berjalan di http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
});

// Tutup database dengan rapi saat proses dihentikan (Ctrl+C, systemd stop) agar berkas WAL tersatukan.
function shutdown(signal: string) {
  console.log(`[server] ${signal} diterima, menutup...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
