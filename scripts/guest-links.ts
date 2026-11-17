/**
 * scripts/guest-links.ts — membuat data/guest-links.csv berisi tautan personal & pesan WhatsApp tiap tamu.
 * Jalankan: npm run guests:links
 *
 * Dipanggil oleh: pengguna (terminal), setelah npm run guests:import.
 * Memanggil: server/db.ts, server/lib/links.ts, server/lib/csv.ts.
 *
 * Penting: isi PUBLIC_BASE_URL di .env dengan domain asli (mis. https://undangan.contoh.id)
 * SEBELUM membuat tautan yang akan disebar.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openDb } from '../server/db.ts';
import { guestLink, whatsappMessage } from '../server/lib/links.ts';
import { toCsv } from '../server/lib/csv.ts';

const base = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
if (/localhost|127\.0\.0\.1/.test(base)) {
  console.warn(`PERINGATAN: PUBLIC_BASE_URL = ${base}. Tautan ini hanya untuk uji lokal, jangan disebar.`);
}

const db = openDb();
const guests = db.prepare('SELECT code, name, max_pax FROM guests ORDER BY name COLLATE NOCASE').all() as {
  code: string;
  name: string;
  max_pax: number;
}[];
db.close();

const rows = guests.map((g) => {
  const link = guestLink(base, g);
  return [g.name, g.code, g.max_pax, link, whatsappMessage(link, g.name)];
});
const out = resolve(import.meta.dirname, '..', 'data', 'guest-links.csv');
writeFileSync(out, toCsv(['Nama', 'Kode', 'Maks Orang', 'Tautan', 'Pesan WhatsApp'], rows), 'utf8');
console.log(`${guests.length} tautan ditulis ke ${out}`);
