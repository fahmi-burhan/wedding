/**
 * web/src/composables/useGuest.ts — identitas tamu dari tautan (?to=Nama&g=KODE).
 *
 * Dipanggil oleh: App.vue (memuat sekali), CoverSection.vue (sapaan), RsvpSection.vue (isi otomatis & kuota).
 * Memanggil: shared/sanitize.ts (cleanName), api.ts (GET /api/guest/:code), config/event.ts.
 *
 * Keamanan: nama dari URL bisa berisi apa saja (mis. "<script>"). cleanName() membuang simbol
 * berbahaya & memotong panjang, dan Vue meng-escape semua teks {{ }} — jadi tidak bisa menyuntik HTML.
 * Bila nama tidak valid, sapaan jatuh ke "Bapak/Ibu/Saudara/i".
 */
import { reactive } from 'vue';
import { cleanName } from '../../../shared/sanitize.ts';
import { event } from '../../../config/event.ts';
import { api } from './api.ts';

export interface RsvpSummary {
  name: string;
  attendance: 'hadir' | 'tidak' | 'ragu';
  pax: number;
  sessions: string[];
  message: string;
  showMessage: boolean;
}

export const GENERIC_GREETING = 'Bapak/Ibu/Saudara/i';

export const guest = reactive({
  /** Nama untuk sapaan & isi otomatis form; '' = tamu umum. */
  name: '',
  /** Kode tamu yang sudah diverifikasi server; null = tamu umum. */
  code: null as string | null,
  maxPax: event.rsvp.defaultMaxPax,
  /** RSVP yang pernah dikirim tamu berkode ini (untuk "ubah jawaban"). */
  existing: null as RsvpSummary | null,
});

let loaded = false;

export async function loadGuest(): Promise<void> {
  if (loaded) return;
  loaded = true;
  const params = new URLSearchParams(window.location.search);
  guest.name = cleanName(params.get('to') ?? '');

  // Kode tamu bisa dari tautan pendek /u/KODE atau dari tautan lama ?g=KODE.
  const fromPath = window.location.pathname.match(/^\/u\/([A-Za-z0-9]{6,12})\/?$/)?.[1];
  const raw = (fromPath ?? params.get('g') ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6,12}$/.test(raw)) return;
  try {
    const data = await api<{ guest: { name: string; maxPax: number }; rsvp: RsvpSummary | null }>(
      `/api/guest/${encodeURIComponent(raw)}`,
    );
    // Nama dari daftar tamu (server) lebih dipercaya daripada nama di URL yang bisa diubah siapa saja.
    guest.name = cleanName(data.guest.name) || guest.name;
    guest.code = raw;
    guest.maxPax = data.guest.maxPax;
    guest.existing = data.rsvp;
  } catch {
    // Kode tidak dikenal / jaringan gagal → tetap jalan sebagai tamu umum.
  }
}
