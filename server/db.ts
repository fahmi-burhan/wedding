/**
 * server/db.ts — membuka koneksi SQLite (better-sqlite3) dengan pengaturan yang aman.
 *
 * Dipanggil oleh: server/index.ts, scripts/*.ts, tests/*.test.ts.
 * Memanggil: better-sqlite3, server/migrate.ts.
 *
 * Kenapa SQLite? Undangan punya ratusan—bukan jutaan—RSVP. SQLite menyimpan semuanya di satu berkas
 * (data/wedding.db) yang permanen di VPS, mudah di-backup (salin satu berkas), tanpa server database terpisah.
 */
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { migrate } from './migrate.ts';

export type DB = Database.Database;

export const DEFAULT_DB_PATH = resolve(import.meta.dirname, '..', 'data', 'wedding.db');

/** Buka database (buat folder bila belum ada) lalu jalankan migration yang belum diterapkan. */
export function openDb(path: string = process.env.DB_PATH || DEFAULT_DB_PATH): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  // WAL: pembaca (halaman ucapan) tidak menunggu penulis (RSVP baru) → lebih lancar saat ramai.
  db.pragma('journal_mode = WAL');
  // Tunggu hingga 5 dtk bila database sedang dikunci, daripada langsung gagal.
  db.pragma('busy_timeout = 5000');
  // SQLite tidak menegakkan foreign key kecuali diminta.
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}
