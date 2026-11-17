/**
 * scripts/guests-import.ts — memasukkan daftar tamu dari data/guests.csv ke database.
 * Jalankan: npm run guests:import            (berkas default data/guests.csv)
 *           npm run guests:import -- lain.csv (berkas lain)
 *
 * Dipanggil oleh: pengguna (terminal).
 * Memanggil: server/db.ts, server/lib/csv.ts (parseCsv), shared/sanitize.ts, config/event.ts.
 *
 * Format CSV (baris pertama = judul kolom):
 *   nama,maks_orang
 *   Bapak Ahmad Sutisna sekeluarga,4
 *   Ustadz Fulan,2
 * - maks_orang boleh kosong → memakai event.rsvp.defaultMaxPax.
 * - Nama harus unik. Bila ada dua tamu bernama sama, bedakan: "Ahmad (Kantor)" dan "Ahmad (Kampung)".
 * - Aman dijalankan berulang: tamu yang sudah ada hanya diperbarui kuotanya, KODE-nya tetap
 *   (jadi tautan yang sudah dikirim tidak rusak).
 */
import { readFileSync, existsSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import { resolve } from 'node:path';
import { openDb } from '../server/db.ts';
import { parseCsv } from '../server/lib/csv.ts';
import { cleanName } from '../shared/sanitize.ts';
import { event } from '../config/event.ts';

// Tanpa huruf/angka yang mirip (0/O, 1/I/L) agar kode mudah dibaca bila perlu diketik.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode(): string {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

const file = resolve(process.argv[2] ?? resolve(import.meta.dirname, '..', 'data', 'guests.csv'));
if (!existsSync(file)) {
  console.error(`Berkas tidak ditemukan: ${file}`);
  console.error('Buat berkas CSV dengan kolom: nama,maks_orang (lihat guests.example.csv di root proyek).');
  process.exit(1);
}

const rows = parseCsv(readFileSync(file, 'utf8'));
const [header, ...body] = rows;
const nameIdx = header.findIndex((h) => h.trim().toLowerCase() === 'nama');
const paxIdx = header.findIndex((h) => h.trim().toLowerCase() === 'maks_orang');
if (nameIdx === -1) {
  console.error('Kolom "nama" tidak ditemukan di baris pertama CSV.');
  process.exit(1);
}

const db = openDb();
const findByName = db.prepare('SELECT id FROM guests WHERE name = ?');
const codeExists = db.prepare('SELECT 1 FROM guests WHERE code = ?').pluck();
const insert = db.prepare('INSERT INTO guests (code, name, max_pax) VALUES (?, ?, ?)');
const update = db.prepare('UPDATE guests SET max_pax = ? WHERE id = ?');

let added = 0;
let updated = 0;
const skipped: string[] = [];

db.transaction(() => {
  body.forEach((cols, i) => {
    const line = i + 2;
    const name = cleanName(cols[nameIdx]);
    if (!name) {
      skipped.push(`baris ${line}: nama kosong/tidak valid`);
      return;
    }
    const rawPax = paxIdx >= 0 ? (cols[paxIdx] ?? '').trim() : '';
    const maxPax = rawPax === '' ? event.rsvp.defaultMaxPax : Number(rawPax);
    if (!Number.isInteger(maxPax) || maxPax < 1 || maxPax > 20) {
      skipped.push(`baris ${line} (${name}): maks_orang harus angka 1–20`);
      return;
    }
    const existing = findByName.get(name) as { id: number } | undefined;
    if (existing) {
      update.run(maxPax, existing.id);
      updated++;
    } else {
      let code = newCode();
      while (codeExists.get(code)) code = newCode();
      insert.run(code, name, maxPax);
      added++;
    }
  });
})();

db.close();
console.log(`Selesai: ${added} tamu baru, ${updated} diperbarui.`);
if (skipped.length) {
  console.log(`Dilewati (${skipped.length}):`);
  for (const s of skipped) console.log(`  - ${s}`);
}
console.log('Langkah berikut: npm run guests:links  → membuat data/guest-links.csv');
