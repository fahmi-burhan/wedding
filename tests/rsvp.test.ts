/**
 * tests/rsvp.test.ts — uji API publik: validasi, anti-spam, tenggat, kuota, idempotensi, dinding ucapan,
 * dan ketahanan data setelah server "restart".
 * Jalankan: npm test
 * Memanggil: tests/helpers.ts, supertest, node:test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { makeApp, rsvpBody, BEFORE_DEADLINE } from './helpers.ts';

test('RSVP valid tersimpan (201) dan sesi tercatat', async () => {
  const { app, db, clock } = makeApp();
  const res = await request(app).post('/api/rsvp').send(rsvpBody(clock.now));
  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'created');
  assert.deepEqual(res.body.rsvp.sessions, ['akad', 'walimah']);
  assert.equal(db.prepare('SELECT COUNT(*) FROM rsvp_sessions').pluck().get(), 2);
});

test('validasi server: nama kosong, status salah, sesi kosong, pax tidak konsisten ditolak', async () => {
  const cases = [
    { name: '   ' },
    { name: '<<<>>>' },
    { attendance: 'mungkin' },
    { sessions: [] },
    { sessions: ['resepsi-palsu'] },
    { attendance: 'tidak', pax: 2, sessions: [] },
    { pax: 0 },
    { pax: 1.5 },
    { submissionId: 'bukan-uuid' },
  ];
  for (const over of cases) {
    // Aplikasi baru per kasus: kiriman tidak valid juga dihitung rate limit (8 per 10 menit).
    const { app, clock } = makeApp();
    const res = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, over));
    assert.equal(res.status, 400, `harus ditolak: ${JSON.stringify(over)}`);
    assert.equal(res.body.ok, false);
    assert.equal(typeof res.body.error, 'string');
  }
});

test('nama berisi skrip dibersihkan sebelum disimpan', async () => {
  const { app, clock } = makeApp();
  const res = await request(app)
    .post('/api/rsvp')
    .send(rsvpBody(clock.now, { name: '<script>alert(1)</script>Ani', message: '<img src=x onerror=alert(1)>' }));
  assert.equal(res.status, 201);
  assert.ok(!res.body.rsvp.name.includes('<'));
  // Ucapan disimpan apa adanya (tanpa karakter kontrol) — keamanan dijamin escaping Vue saat render.
  const wall = await request(app).get('/api/wishes');
  assert.equal(wall.body.items[0].message, '<img src=x onerror=alert(1)>');
  assert.equal(wall.headers['content-type'].includes('application/json'), true);
});

test('honeypot terisi → ditolak & tercatat di spam_log', async () => {
  const { app, db, clock } = makeApp();
  const res = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { website: 'http://spam.example' }));
  assert.equal(res.status, 400);
  assert.equal(db.prepare('SELECT COUNT(*) FROM rsvps').pluck().get(), 0);
  assert.equal(db.prepare("SELECT reason FROM spam_log").pluck().get(), 'honeypot');
});

test('kiriman terlalu cepat (< 3 dtk sejak form tampil) ditolak', async () => {
  const { app, db, clock } = makeApp();
  const res = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { elapsedMs: 500 }));
  assert.equal(res.status, 400);
  assert.equal(db.prepare('SELECT COUNT(*) FROM rsvps').pluck().get(), 0);
});

test('tenggat: sebelum boleh, sesudah 20 Des 2026 23.59 WIB ditolak di server (403)', async () => {
  const { app, clock } = makeApp(Date.parse('2026-12-20T23:59:00+07:00'));
  assert.equal((await request(app).post('/api/rsvp').send(rsvpBody(clock.now))).status, 201);
  clock.now = Date.parse('2026-12-21T00:00:01+07:00');
  const late = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: 'Telat' }));
  assert.equal(late.status, 403);
  assert.equal(late.body.closed, true);
  const status = await request(app).get('/api/rsvp/status');
  assert.equal(status.body.open, false);
});

test('kuota umum: lebih dari 2 orang ditolak dengan pesan sopan', async () => {
  const { app, clock } = makeApp();
  const res = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { pax: 3 }));
  assert.equal(res.status, 400);
  assert.match(res.body.error, /maksimal 2 orang/);
});

test('tamu berkode: kuota dari daftar tamu, kirim ulang memperbarui (bukan menambah)', async () => {
  const { app, db, clock } = makeApp();
  db.prepare("INSERT INTO guests (code, name, max_pax) VALUES ('KELUARGA1', 'Keluarga Pak Ahmad', 5)").run();
  const guest = await request(app).get('/api/guest/keluarga1');
  assert.equal(guest.status, 200);
  assert.equal(guest.body.guest.maxPax, 5);

  const first = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { guestCode: 'KELUARGA1', pax: 5 }));
  assert.equal(first.status, 201);
  // Perangkat lain (submissionId lain), tamu yang sama → tetap update baris yang sama.
  const second = await request(app)
    .post('/api/rsvp')
    .send(rsvpBody(clock.now, { guestCode: 'KELUARGA1', attendance: 'tidak', pax: 0, sessions: [] }));
  assert.equal(second.status, 200);
  assert.equal(second.body.status, 'updated');
  assert.equal(db.prepare('SELECT COUNT(*) FROM rsvps').pluck().get(), 1);
  assert.equal(db.prepare('SELECT COUNT(*) FROM rsvp_sessions').pluck().get(), 0);

  const over = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { guestCode: 'KELUARGA1', pax: 6 }));
  assert.equal(over.status, 400);
});

test('kode tamu tidak dikenal → 404 di /api/guest, RSVP tetap bisa dengan kuota umum', async () => {
  const { app, clock } = makeApp();
  assert.equal((await request(app).get('/api/guest/ZZZZZZ')).status, 404);
  assert.equal((await request(app).get('/api/guest/../../etc')).status, 404);
  const res = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { guestCode: 'ZZZZZZ' }));
  assert.equal(res.status, 201);
});

test('idempoten: submissionId sama (klik ganda) → satu baris, kiriman kedua = update', async () => {
  const { app, db, clock } = makeApp();
  const body = rsvpBody(clock.now);
  const [a, b] = await Promise.all([request(app).post('/api/rsvp').send(body), request(app).post('/api/rsvp').send(body)]);
  assert.deepEqual([a.status, b.status].sort(), [200, 201]);
  assert.equal(db.prepare('SELECT COUNT(*) FROM rsvps').pluck().get(), 1);
});

test('duplikat persis dari perangkat berbeda dalam 10 menit tidak membuat baris baru', async () => {
  const { app, db, clock } = makeApp();
  await request(app).post('/api/rsvp').send(rsvpBody(clock.now));
  const dup = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: 'budi santoso' }));
  assert.equal(dup.body.status, 'duplicate');
  assert.equal(db.prepare('SELECT COUNT(*) FROM rsvps').pluck().get(), 1);
});

test('rate limit: kiriman ke-9 dalam 10 menit dari IP yang sama → 429', async () => {
  const { app, clock } = makeApp();
  for (let i = 0; i < 8; i++) {
    const r = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: `Tamu ${i}` }));
    assert.notEqual(r.status, 429);
  }
  const blocked = await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: 'Tamu 9' }));
  assert.equal(blocked.status, 429);
});

test('dinding ucapan: tanpa status/jumlah, hormati showMessage & hidden, berhalaman 10', async () => {
  const { app, db, clock } = makeApp();
  for (let i = 0; i < 12; i++) {
    db.prepare(
      `INSERT INTO rsvps (submission_id, name, attendance, pax, message, show_message, ip_hash, created_at, updated_at)
       VALUES (?, ?, 'hadir', 1, ?, ?, 'x', ?, ?)`,
    ).run(`id-${i}`, `Tamu ${i}`, `Doa ${i}`, i === 0 ? 0 : 1, `2026-12-01T00:00:${String(i).padStart(2, '0')}Z`, '2026-12-01T00:00:00Z');
  }
  db.prepare("UPDATE rsvps SET hidden = 1 WHERE name = 'Tamu 1'").run();
  const p1 = await request(app).get('/api/wishes?page=1');
  assert.equal(p1.body.total, 10); // 12 - 1 (tidak dipublikasikan) - 1 (disembunyikan)
  assert.equal(p1.body.items.length, 10);
  assert.deepEqual(Object.keys(p1.body.items[0]).sort(), ['createdAt', 'id', 'message', 'name']);
  const bad = await request(app).get('/api/wishes?page=-5');
  assert.equal(bad.body.page, 1);
  void clock;
});

test('data tetap ada setelah server "restart" (berkas SQLite permanen)', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'undangan-'));
  const file = join(dir, 'uji.db');
  try {
    const first = makeApp(BEFORE_DEADLINE, file);
    await request(first.app).post('/api/rsvp').send(rsvpBody(first.clock.now, { name: 'Tetap Ada' }));
    first.db.close();
    const second = makeApp(BEFORE_DEADLINE, file);
    assert.equal(second.db.prepare("SELECT name FROM rsvps").pluck().get(), 'Tetap Ada');
    second.db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('JSON rusak / body raksasa → 400 tanpa detail internal', async () => {
  const { app } = makeApp();
  const broken = await request(app).post('/api/rsvp').set('Content-Type', 'application/json').send('{"name":');
  assert.equal(broken.status, 400);
  const huge = await request(app).post('/api/rsvp').send({ name: 'x'.repeat(20_000) });
  assert.equal(huge.status, 400);
});
