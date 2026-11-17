/**
 * scripts/db-backup.ts — membuat salinan cadangan database RSVP yang konsisten.
 * Jalankan: npm run db:backup   (di VPS bisa dijadwalkan harian lewat cron, lihat README)
 *
 * Dipanggil oleh: pengguna / cron.
 * Memanggil: server/db.ts, better-sqlite3 backup API.
 *
 * Kenapa tidak cukup menyalin berkas wedding.db? Saat server berjalan, sebagian data masih di berkas
 * -wal. API backup SQLite menyalin snapshot utuh yang aman walau server sedang menerima RSVP.
 * Hanya 30 cadangan terbaru yang disimpan.
 */
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openDb } from '../server/db.ts';

const KEEP = 30;
const dir = resolve(import.meta.dirname, '..', 'data', 'backups');
mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const target = join(dir, `wedding-${stamp}.db`);

const db = openDb();
await db.backup(target);
db.close();
console.log(`Cadangan dibuat: ${target}`);

const old = readdirSync(dir).filter((f) => /^wedding-.*\.db$/.test(f)).sort().reverse().slice(KEEP);
for (const f of old) rmSync(join(dir, f));
if (old.length) console.log(`${old.length} cadangan lama dihapus (menyimpan ${KEEP} terbaru).`);
