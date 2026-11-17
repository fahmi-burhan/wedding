/**
 * shared/sanitize.ts — membersihkan teks dari tamu (nama di URL, nama & ucapan di form RSVP).
 *
 * Dipanggil oleh: web/src/composables/useGuest.ts (nama dari ?to=), server/lib/schemas.ts (validasi RSVP),
 *                 scripts/guests-import.ts.
 * Memanggil: tidak ada.
 *
 * Catatan keamanan: fungsi ini BUKAN pengganti escaping HTML. Vue sudah meng-escape semua teks
 * yang dirender lewat {{ }}. Tujuan di sini adalah menolak/membuang karakter aneh agar data rapi,
 * tidak bisa dipakai menipu tampilan (karakter kontrol, arah teks terbalik), dan panjangnya terbatas.
 */

export const NAME_MAX = 60;
export const MESSAGE_MAX = 500;

// Karakter kontrol (kecuali \n \t) + karakter pengubah arah teks (bidi) yang bisa menyamarkan isi.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‎‏‪-‮⁦-⁩]/g;
// Karakter yang tidak wajar di nama orang dan sering dipakai untuk injeksi.
const NAME_FORBIDDEN = /[<>{}[\]\\`|^$=;]/g;

/**
 * Bersihkan nama: buang karakter kontrol & simbol berbahaya, rapikan spasi, potong panjang.
 * Mengembalikan string kosong bila tidak ada huruf/angka yang tersisa.
 */
export function cleanName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const cleaned = raw
    .normalize('NFC')
    .replace(CONTROL_CHARS, '')
    .replace(NAME_FORBIDDEN, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX)
    .trim();
  // Harus ada minimal satu huruf/angka (Unicode), supaya "...." atau "&&&" tidak dianggap nama.
  return /[\p{L}\p{N}]/u.test(cleaned) ? cleaned : '';
}

/** Bersihkan ucapan: izinkan baris baru (maks 2 berturut-turut), buang kontrol, potong panjang. */
export function cleanMessage(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARS, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MESSAGE_MAX)
    .trim();
}
