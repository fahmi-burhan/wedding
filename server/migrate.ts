/**
 * server/migrate.ts — menjalankan berkas SQL di server/migrations/ secara berurutan, masing-masing sekali.
 *
 * Dipanggil oleh: server/db.ts (setiap kali database dibuka).
 * Memanggil: better-sqlite3, node:fs.
 *
 * Cara kerja: nama berkas yang sudah dijalankan dicatat di tabel schema_migrations.
 * Setiap berkas dijalankan di dalam transaksi: bila gagal di tengah, tidak ada perubahan setengah jadi.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DB } from './db.ts';

const MIGRATIONS_DIR = join(import.meta.dirname, 'migrations');

export function migrate(db: DB): string[] {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version    TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`);

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').pluck().all() as string[],
  );
  // Urut berdasarkan nama: 001_, 002_, ... → urutan eksekusi pasti.
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
  const ran: string[] = [];

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(file);
    })();
    ran.push(file);
  }
  return ran;
}
