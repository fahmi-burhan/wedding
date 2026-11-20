/**
 * server/lib/links.ts — membuat tautan undangan personal & teks pesan WhatsApp untuk tiap tamu.
 *
 * Dipanggil oleh: server/routes/admin.ts (daftar tamu di panel), scripts/guest-links.ts (berkas CSV).
 * Memanggil: config/event.ts.
 *
 * Bentuk tautan: https://domain/?to=Nama%20Tamu&g=KODE
 * - `to`  → nama langsung tampil di sampul (tanpa menunggu server).
 * - `g`   → kode tamu: server memakai ini untuk kuota orang & agar RSVP ulang memperbarui data lama.
 */
import { event } from '../../config/event.ts';

export function guestLink(baseUrl: string, guest: { name: string; code: string }): string {
  const url = new URL(baseUrl || 'http://localhost:3000');
  url.pathname = '/';
  url.search = '';
  url.searchParams.set('to', guest.name);
  url.searchParams.set('g', guest.code);
  // URLSearchParams memakai '+' untuk spasi; '%20' lebih aman di semua aplikasi chat.
  return url.toString().replace(/\+/g, '%20');
}

/** Teks siap tempel ke WhatsApp. Hanya teks UI umum + data dari config (tidak mengarang kalimat sakral). */
export function whatsappMessage(link: string, guestName: string): string {
  return [
    `Kepada Yth. ${guestName}`,
    '',
    `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i ke ${event.titleId.toLowerCase()} ${event.couple.short}.`,
    '',
    'Detail acara & konfirmasi kehadiran:',
    link,
    '',
    'Terima kasih.',
  ].join('\n');
}
