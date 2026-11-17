/**
 * server/lib/links.ts — membuat tautan undangan personal & teks pesan WhatsApp untuk tiap tamu.
 *
 * Dipanggil oleh: server/routes/admin.ts (daftar tamu di panel), scripts/guest-links.ts (berkas CSV).
 * Memanggil: config/event.ts.
 *
 * Bentuk tautan: https://domain/u/KODE
 * KODE → server mencari nama & kuota tamu, dan membuat RSVP ulang memperbarui data lama.
 * Tautan lama bentuk ?to=Nama&g=KODE tetap berfungsi.
 */
import { event } from '../../config/event.ts';

export function guestLink(baseUrl: string, guest: { name: string; code: string }): string {
  const base = (baseUrl || 'http://localhost:3000').replace(/\/+$/, '');
  return `${base}/u/${guest.code}`;
}

/** Teks siap tempel ke WhatsApp. Hanya teks UI umum + data dari config (tidak mengarang kalimat sakral). */
export function whatsappMessage(link: string, guestName: string): string {
  return [
    `Kepada Yth. ${guestName}`,
    '',
    `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i ke ${event.title.toLowerCase()} ${event.couple.short}.`,
    '',
    'Detail acara & konfirmasi kehadiran:',
    link,
    '',
    'Terima kasih.',
  ].join('\n');
}
