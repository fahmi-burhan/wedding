/**
 * web/src/composables/calendar.ts — tautan "Tambah ke Google Calendar" dan berkas .ics (iPhone/Outlook).
 *
 * Dipanggil oleh: EventsSection.vue (per sesi), CountdownSection.vue (.ics semua sesi).
 * Memanggil: config/event.ts.
 *
 * Waktu dikirim dalam UTC (akhiran Z) agar aplikasi kalender tamu mengonversinya sendiri
 * ke zona waktu tamu — tidak ada salah jam untuk tamu di luar WIB.
 */
import { event } from '../../../config/event.ts';
import type { EventSession } from '../../../config/event.ts';

/** 2026-12-27T00:00:00.000Z → 20261227T000000Z */
const toUtcStamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function range(s: EventSession) {
  const start = Date.parse(s.start);
  return { start, end: start + s.calendarDurationMinutes * 60_000 };
}

const title = (s: EventSession) => `${s.label} ${event.couple.short}`;
const location = () => `${event.venue.name}, ${event.venue.addressLines.join(', ')}`;
const details = () => `Lokasi: ${event.venue.mapsUrl}`;

export function googleCalendarUrl(s: EventSession): string {
  const { start, end } = range(s);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: title(s),
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: details(),
    location: location(),
    ctz: event.timezone,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Escape teks sesuai aturan iCalendar (RFC 5545). */
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

export function downloadIcs(): void {
  const now = toUtcStamp(Date.now());
  const events = event.sessions.map((s) => {
    const { start, end } = range(s);
    return [
      'BEGIN:VEVENT',
      `UID:${s.key}-${start}@undangan`,
      `DTSTAMP:${now}`,
      `DTSTART:${toUtcStamp(start)}`,
      `DTEND:${toUtcStamp(end)}`,
      `SUMMARY:${icsText(title(s))}`,
      `LOCATION:${icsText(location())}`,
      `DESCRIPTION:${icsText(details())}`,
      'END:VEVENT',
    ].join('\r\n');
  });
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan Digital//ID', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR', ''].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'undangan-walimah.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
