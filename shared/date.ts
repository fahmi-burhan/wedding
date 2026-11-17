/**
 * shared/date.ts — format tanggal & jam gaya Indonesia di zona waktu ACARA (bukan zona waktu tamu).
 *
 * Dipanggil oleh: section undangan (Hero, Acara, Countdown), server (pesan tenggat), scripts/og-image.ts.
 * Memanggil: Intl.DateTimeFormat bawaan JavaScript.
 *
 * Kenapa tidak memakai nama hari dari Intl langsung? Intl 'id-ID' menghasilkan "Minggu",
 * sedangkan undangan memakai "Ahad". Jadi kita ambil angka hari/tanggal dari Intl (agar zona waktu benar)
 * lalu memetakan namanya sendiri.
 */

const DAY_NAMES = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export interface DateParts {
  dayName: string;
  day: number;
  monthName: string;
  year: number;
  hour: string;
  minute: string;
}

/** Pecah sebuah waktu menjadi bagian-bagian di zona waktu tertentu. */
export function partsInZone(iso: string | Date, timeZone: string): DateParts {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  const weekdayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(map.weekday);
  return {
    dayName: DAY_NAMES[weekdayIndex],
    day: Number(map.day),
    monthName: MONTH_NAMES[Number(map.month) - 1],
    year: Number(map.year),
    hour: map.hour,
    minute: map.minute,
  };
}

/** "Ahad, 27 Desember 2026" */
export function formatLongDate(iso: string | Date, timeZone: string): string {
  const p = partsInZone(iso, timeZone);
  return `${p.dayName}, ${p.day} ${p.monthName} ${p.year}`;
}

/** "07.00 WIB" — titik sebagai pemisah jam sesuai kebiasaan penulisan Indonesia. */
export function formatTime(iso: string | Date, timeZone: string, tzLabel: string): string {
  const p = partsInZone(iso, timeZone);
  return `${p.hour}.${p.minute} ${tzLabel}`;
}

/** "Ahad, 20 Desember 2026 · 23.59 WIB" */
export function formatDateTime(iso: string | Date, timeZone: string, tzLabel: string): string {
  return `${formatLongDate(iso, timeZone)} · ${formatTime(iso, timeZone, tzLabel)}`;
}
