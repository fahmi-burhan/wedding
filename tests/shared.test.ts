/**
 * tests/shared.test.ts — uji fungsi bersama: pembersih nama dari URL & format tanggal Indonesia (zona WIB).
 * Jalankan: npm test
 * Memanggil: shared/sanitize.ts, shared/date.ts, config/event.ts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanMessage, cleanName, NAME_MAX } from '../shared/sanitize.ts';
import { formatDateTime, formatLongDate, formatTime } from '../shared/date.ts';
import { event } from '../config/event.ts';

test('cleanName: skrip, simbol, kontrol, bidi, panjang berlebih', () => {
  assert.equal(cleanName('<script>alert(1)</script>'), 'scriptalert(1)/script');
  assert.equal(cleanName('  Bapak   Ahmad\n\tS.Pd.  '), 'Bapak Ahmad S.Pd.');
  assert.equal(cleanName('Ali‮nimda'), 'Alinimda');
  assert.equal(cleanName('<<<>>>'), '');
  assert.equal(cleanName('x'.repeat(500)).length, NAME_MAX);
  assert.equal(cleanName(undefined), '');
  assert.equal(cleanName("Nur'aini & Keluarga"), "Nur'aini & Keluarga");
  assert.equal(cleanName('محمد'), 'محمد');
});

test('cleanMessage: rapikan baris kosong & batasi 500 karakter', () => {
  assert.equal(cleanMessage('a\r\n\r\n\r\n\r\nb'), 'a\n\nb');
  assert.equal(cleanMessage('x'.repeat(900)).length, 500);
});

test('format tanggal memakai zona acara & nama hari "Ahad"', () => {
  const [akad, walimah] = event.sessions;
  assert.equal(formatLongDate(akad.start, event.timezone), 'Ahad, 27 Desember 2026');
  assert.equal(formatTime(akad.start, event.timezone, 'WIB'), '07.00 WIB');
  assert.equal(formatTime(walimah.start, event.timezone, 'WIB'), '10.00 WIB');
  assert.equal(formatDateTime(event.rsvp.deadline, event.timezone, 'WIB'), 'Ahad, 20 Desember 2026 · 23.59 WIB');
  // Instan yang sama ditulis dalam UTC tetap tampil sebagai jam WIB.
  assert.equal(formatTime('2026-12-27T00:00:00Z', event.timezone, 'WIB'), '07.00 WIB');
});

test('data acara: sesi berurutan, tenggat sebelum acara', () => {
  const starts = event.sessions.map((s) => Date.parse(s.start));
  assert.ok(starts.every((t) => !Number.isNaN(t)));
  assert.ok(starts[0] < starts[1]);
  assert.ok(Date.parse(event.rsvp.deadline) < starts[0]);
});
