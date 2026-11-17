/**
 * tests/admin.test.ts — uji panel admin: proteksi, login, penguncian, rekap, sembunyikan ucapan, CSV.
 * Jalankan: npm test
 * Memanggil: tests/helpers.ts, server/lib/csv.ts, supertest, node:test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { makeApp, rsvpBody, ADMIN_PASSWORD } from './helpers.ts';
import { csvCell, parseCsv } from '../server/lib/csv.ts';

async function login(app: Parameters<typeof request>[0]) {
  const agent = request.agent(app);
  const res = await agent.post('/api/admin/login').send({ password: ADMIN_PASSWORD });
  assert.equal(res.status, 200);
  return agent;
}

test('endpoint admin tanpa sesi → 401', async () => {
  const { app } = makeApp();
  for (const path of ['/api/admin/me', '/api/admin/summary', '/api/admin/rsvps', '/api/admin/guests', '/api/admin/export.csv']) {
    assert.equal((await request(app).get(path)).status, 401, path);
  }
  assert.equal((await request(app).patch('/api/admin/rsvps/1').send({ hidden: true })).status, 401);
});

test('cookie sesi: HttpOnly + SameSite=Strict, hanya untuk /api/admin', async () => {
  const { app } = makeApp();
  const res = await request(app).post('/api/admin/login').send({ password: ADMIN_PASSWORD });
  const cookie = String(res.headers['set-cookie']);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\/api\/admin/);
});

test('salah kata sandi berulang → dikunci sementara (429), lalu terbuka lagi setelah jeda', async () => {
  const { app, clock } = makeApp();
  for (let i = 0; i < 6; i++) {
    assert.equal((await request(app).post('/api/admin/login').send({ password: `salah-${i}` })).status, 401);
  }
  const locked = await request(app).post('/api/admin/login').send({ password: ADMIN_PASSWORD });
  assert.equal(locked.status, 429);
  clock.now += 61_000; // kunci pertama 1 menit
  assert.equal((await request(app).post('/api/admin/login').send({ password: ADMIN_PASSWORD })).status, 200);
});

test('permintaan dari situs lain (Origin berbeda) ditolak', async () => {
  const { app } = makeApp();
  const res = await request(app).post('/api/admin/login').set('Origin', 'https://jahat.example').send({ password: ADMIN_PASSWORD });
  assert.equal(res.status, 403);
});

test('sesi kedaluwarsa setelah 8 jam', async () => {
  const { app, clock } = makeApp();
  const agent = await login(app);
  assert.equal((await agent.get('/api/admin/me')).status, 200);
  clock.now += 8 * 60 * 60 * 1000 + 1;
  assert.equal((await agent.get('/api/admin/me')).status, 401);
});

test('rekap: hadir/tidak/ragu & total orang per sesi', async () => {
  const { app, clock } = makeApp();
  await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: 'A', pax: 2, sessions: ['akad', 'walimah'] }));
  await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: 'B', pax: 1, sessions: ['walimah'] }));
  await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: 'C', attendance: 'ragu', pax: 2, sessions: ['walimah'] }));
  await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: 'D', attendance: 'tidak', pax: 0, sessions: [] }));
  const agent = await login(app);
  const s = (await agent.get('/api/admin/summary')).body;
  assert.deepEqual(s.attendance.hadir, { responses: 2, people: 3 });
  assert.deepEqual(s.attendance.ragu, { responses: 1, people: 2 });
  assert.deepEqual(s.attendance.tidak, { responses: 1, people: 0 });
  const akad = s.sessions.find((x: { key: string }) => x.key === 'akad');
  const walimah = s.sessions.find((x: { key: string }) => x.key === 'walimah');
  assert.equal(akad.confirmedPeople, 2);
  assert.equal(walimah.confirmedPeople, 3);
  assert.equal(walimah.tentativePeople, 2);
});

test('admin menyembunyikan ucapan → hilang dari dinding publik', async () => {
  const { app, clock } = makeApp();
  await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { message: 'Ucapan iseng' }));
  const agent = await login(app);
  const [r] = (await agent.get('/api/admin/rsvps')).body.items;
  assert.equal((await agent.patch(`/api/admin/rsvps/${r.id}`).send({ hidden: true })).status, 200);
  assert.equal((await request(app).get('/api/wishes')).body.total, 0);
  assert.equal((await agent.patch('/api/admin/rsvps/9999').send({ hidden: true })).status, 404);
});

test('daftar tamu menyertakan tautan personal berbasis PUBLIC_BASE_URL', async () => {
  const { app, db } = makeApp();
  db.prepare("INSERT INTO guests (code, name, max_pax) VALUES ('ABCDEF23', 'Ustadz Fulan', 2)").run();
  const agent = await login(app);
  const [g] = (await agent.get('/api/admin/guests')).body.items;
  assert.equal(g.link, 'https://undangan.contoh.test/?to=Ustadz%20Fulan&g=ABCDEF23');
  assert.match(g.whatsappText, /Kepada Yth\. Ustadz Fulan/);
});

test('ekspor CSV: BOM UTF-8, kolom per sesi, aman dari formula injection', async () => {
  const { app, clock } = makeApp();
  await request(app).post('/api/rsvp').send(rsvpBody(clock.now, { name: 'Siti', message: '=HYPERLINK("http://x")' }));
  const agent = await login(app);
  const res = await agent.get('/api/admin/export.csv').buffer(true).parse((r, cb) => {
    let data = '';
    r.setEncoding('utf8');
    r.on('data', (c: string) => (data += c));
    r.on('end', () => cb(null, data));
  });
  assert.equal(res.status, 200);
  assert.match(String(res.headers['content-type']), /text\/csv/);
  const text = res.body as string;
  assert.equal(text.charCodeAt(0), 0xfeff);
  const rows = parseCsv(text);
  assert.deepEqual(rows[0].slice(0, 6), ['No', 'Nama', 'Status', 'Jumlah Orang', 'Akad Nikah', 'Walimah']);
  assert.equal(rows[1][1], 'Siti');
  assert.equal(rows[1][6].startsWith("'="), true);
});

test('csvCell: kutip, koma, baris baru, awalan rumus', () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('kata "kutip"'), '"kata ""kutip"""');
  assert.equal(csvCell('+62812'), "'+62812");
  assert.equal(csvCell(null), '');
});
