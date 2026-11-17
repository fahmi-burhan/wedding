/**
 * server/lib/csv.ts — membuat teks CSV yang aman dibuka di Excel / Google Sheets.
 *
 * Dipanggil oleh: server/routes/admin.ts (ekspor RSVP), scripts/guest-links.ts.
 * Memanggil: tidak ada.
 *
 * Dua jebakan yang ditangani:
 * 1. Koma, kutip, baris baru di dalam nilai → nilai dibungkus kutip ganda, kutip digandakan.
 * 2. "CSV injection": nilai yang diawali = + - @ bisa dijalankan Excel sebagai rumus.
 *    Nilai seperti itu diberi awalan petik tunggal (') agar dibaca sebagai teks.
 */

export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\r\n;]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Gabungkan header + baris menjadi CSV.
 * Diawali BOM UTF-8 agar Excel di Windows membaca huruf non-ASCII (mis. nama berharakat) dengan benar.
 */
export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(','));
  return '﻿' + lines.join('\r\n') + '\r\n';
}

/** Pembaca CSV sederhana (mendukung kutip ganda & koma di dalam kutip) untuk data/guests.csv. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',' || ch === ';') {
      // Excel berbahasa Indonesia sering menyimpan CSV dengan pemisah titik koma.
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}
