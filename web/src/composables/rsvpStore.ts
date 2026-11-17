/**
 * web/src/composables/rsvpStore.ts — status kecil yang dibagi antara form RSVP dan dinding ucapan,
 * plus identitas perangkat untuk idempotensi.
 *
 * Dipanggil oleh: RsvpSection.vue (menaikkan wishesVersion setelah kirim), WishesSection.vue (memuat ulang).
 * Memanggil: localStorage (dibungkus try/catch — bisa diblokir di mode privat/in-app browser).
 *
 * submissionId: UUID acak per perangkat. Server memakainya agar klik ganda / kirim ulang dari
 * perangkat yang sama MEMPERBARUI data, bukan membuat entri baru. Ini hanya kunci, bukan penyimpanan
 * RSVP — data RSVP tetap tersimpan di server.
 */
import { ref } from 'vue';
import type { RsvpSummary } from './useGuest.ts';

export const wishesVersion = ref(0);

const ID_KEY = 'undangan.submissionId';
const LAST_KEY = 'undangan.lastRsvp';

function uuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Cadangan untuk WebView lama (randomUUID belum ada): UUID v4 dari getRandomValues.
  const b: Uint8Array = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

let memoryId: string | null = null;
export function submissionId(): string {
  try {
    const saved = localStorage.getItem(ID_KEY);
    if (saved) return saved;
    const id = uuid();
    localStorage.setItem(ID_KEY, id);
    return id;
  } catch {
    memoryId ??= uuid(); // localStorage diblokir → tetap konsisten selama halaman terbuka
    return memoryId;
  }
}

/** Ringkasan jawaban terakhir dari perangkat ini (hanya untuk ditampilkan, sumber kebenaran tetap server). */
export function readLastRsvp(): RsvpSummary | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return raw ? (JSON.parse(raw) as RsvpSummary) : null;
  } catch {
    return null;
  }
}
export function writeLastRsvp(s: RsvpSummary): void {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(s));
  } catch {
    /* abaikan: hanya kenyamanan */
  }
}
