/**
 * server/routes/public.ts — API yang dipakai halaman undangan (tanpa login).
 *
 *   GET  /api/rsvp/status   → apakah form RSVP masih dibuka (menurut jam SERVER)
 *   GET  /api/guest/:code   → nama, kuota, dan RSVP lama milik tamu berkode
 *   POST /api/rsvp          → simpan/perbarui RSVP
 *   GET  /api/wishes?page=  → dinding ucapan (hanya nama + ucapan + waktu)
 *
 * Dipanggil oleh: server/app.ts (dipasang di /api).
 * Memanggil: server/lib/schemas.ts, server/lib/security.ts, server/lib/rateLimit.ts, config/event.ts.
 */
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { DB } from '../db.ts';
import { event } from '../../config/event.ts';
import { formatDateTime } from '../../shared/date.ts';
import { firstMessage, guestCodeSchema, pageQuerySchema, rsvpBodySchema } from '../lib/schemas.ts';
import { hashIp } from '../lib/security.ts';
import { rateLimit } from '../lib/rateLimit.ts';

/** Kiriman yang datang < 3 dtk setelah form tampil hampir pasti bot (manusia butuh waktu membaca). */
export const MIN_FILL_MS = 3000;
/** Kiriman identik (nama + status + jumlah + ucapan) dalam rentang ini dianggap duplikat. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const GENERIC_REJECT = 'Kiriman tidak dapat diproses. Muat ulang halaman lalu coba lagi.';

interface RsvpRow {
  id: number;
  guest_id: number | null;
  name: string;
  attendance: 'hadir' | 'tidak' | 'ragu';
  pax: number;
  message: string;
  show_message: number;
}

interface GuestRow {
  id: number;
  code: string;
  name: string;
  max_pax: number;
}

export function publicRouter(db: DB, now: () => number): Router {
  const router = Router();
  const deadlineMs = Date.parse(event.rsvp.deadline);
  const deadlineLabel = formatDateTime(event.rsvp.deadline, event.timezone, event.timezoneLabel);

  // Batas laju: RSVP 8× per 10 menit per IP (cukup untuk mengubah jawaban beberapa kali,
  // termasuk satu keluarga yang memakai Wi-Fi yang sama), baca data 120× per menit.
  const rsvpLimit = rateLimit({ windowMs: 10 * 60_000, max: 8, now, message: 'Terlalu banyak kiriman. Silakan coba lagi beberapa menit lagi.' });
  const readLimit = rateLimit({ windowMs: 60_000, max: 120, now, message: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' });

  const sessionsOf = db.prepare('SELECT session_key FROM rsvp_sessions WHERE rsvp_id = ? ORDER BY session_key').pluck();
  const summary = (row: RsvpRow) => ({
    name: row.name,
    attendance: row.attendance,
    pax: row.pax,
    sessions: sessionsOf.all(row.id) as string[],
    message: row.message,
    showMessage: row.show_message === 1,
  });

  router.get('/rsvp/status', readLimit, (_req, res) => {
    res.json({ ok: true, open: now() <= deadlineMs, deadline: event.rsvp.deadline, deadlineLabel });
  });

  router.get('/guest/:code', readLimit, (req, res) => {
    const code = guestCodeSchema.safeParse(String(req.params.code).toUpperCase());
    const guest = code.success
      ? (db.prepare('SELECT id, code, name, max_pax FROM guests WHERE code = ?').get(code.data) as GuestRow | undefined)
      : undefined;
    if (!guest) {
      res.status(404).json({ ok: false, error: 'Kode undangan tidak ditemukan.' });
      return;
    }
    const rsvp = db.prepare('SELECT * FROM rsvps WHERE guest_id = ?').get(guest.id) as RsvpRow | undefined;
    res.json({ ok: true, guest: { name: guest.name, maxPax: guest.max_pax }, rsvp: rsvp ? summary(rsvp) : null });
  });

  router.post('/rsvp', rsvpLimit, (req, res) => {
    const ipHash = hashIp(req.ip ?? 'unknown');
    const logSpam = db.prepare('INSERT INTO spam_log (ip_hash, reason) VALUES (?, ?)');

    // 1) Honeypot: dicek sebelum validasi lain agar bot tidak mendapat petunjuk apa pun.
    if (typeof req.body?.website === 'string' && req.body.website.trim() !== '') {
      logSpam.run(ipHash, 'honeypot');
      res.status(400).json({ ok: false, error: GENERIC_REJECT });
      return;
    }

    // 2) Validasi skema.
    const parsed = rsvpBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: firstMessage(parsed.error) });
      return;
    }
    const body = parsed.data;
    const t = now();

    // 3) Terlalu cepat sejak form tampil.
    if (body.elapsedMs < MIN_FILL_MS) {
      logSpam.run(ipHash, 'terlalu-cepat');
      res.status(400).json({ ok: false, error: 'Mohon tunggu beberapa detik, lalu tekan Kirim lagi.' });
      return;
    }

    // 4) Tenggat — selalu dicek di server, tidak cukup hanya menyembunyikan tombol di browser.
    if (t > deadlineMs) {
      res.status(403).json({ ok: false, closed: true, error: `Mohon maaf, konfirmasi kehadiran telah ditutup sejak ${deadlineLabel}.` });
      return;
    }

    // 5) Tamu berkode → kuota dari daftar tamu. Kode tak dikenal diabaikan (pakai kuota umum).
    const guest = body.guestCode
      ? (db.prepare('SELECT id, code, name, max_pax FROM guests WHERE code = ?').get(body.guestCode) as GuestRow | undefined)
      : undefined;
    const maxPax = guest?.max_pax ?? event.rsvp.defaultMaxPax;
    if (body.pax > maxPax) {
      res.status(400).json({ ok: false, error: `Mohon maaf, undangan ini berlaku untuk maksimal ${maxPax} orang.` });
      return;
    }

    // 6) Simpan dalam satu transaksi (sesi ikut tersimpan atau tidak sama sekali).
    const nowIso = new Date(t).toISOString();
    const hiddenDefault = event.wishes.mode === 'moderasi' ? 1 : 0;
    const save = db.transaction((): { status: 'created' | 'updated' | 'duplicate'; row: RsvpRow } => {
      let existing: RsvpRow | undefined;
      let submissionId = body.submissionId;
      const bySubmission = db.prepare('SELECT * FROM rsvps WHERE submission_id = ?').get(submissionId) as RsvpRow | undefined;

      if (guest) {
        existing = db.prepare('SELECT * FROM rsvps WHERE guest_id = ?').get(guest.id) as RsvpRow | undefined;
        if (!existing && bySubmission) {
          if (bySubmission.guest_id === null) existing = bySubmission; // RSVP lama dari perangkat ini → tautkan ke tamu
          else submissionId = randomUUID(); // perangkat sama dipakai tamu berkode lain (mis. satu keluarga)
        }
      } else if (bySubmission) {
        if (bySubmission.guest_id === null) existing = bySubmission;
        else submissionId = randomUUID(); // jangan menimpa RSVP milik tamu berkode dari tautan umum
      } else {
        // Tanpa identitas: tolak duplikat persis (mis. tamu membuka dua tab lalu kirim dua kali).
        const dup = db
          .prepare(
            `SELECT * FROM rsvps WHERE guest_id IS NULL AND name = ? COLLATE NOCASE AND attendance = ?
             AND pax = ? AND message = ? AND created_at >= ? ORDER BY id DESC LIMIT 1`,
          )
          .get(body.name, body.attendance, body.pax, body.message, new Date(t - DUPLICATE_WINDOW_MS).toISOString()) as
          | RsvpRow
          | undefined;
        if (dup) return { status: 'duplicate', row: dup };
      }

      let id: number;
      if (existing) {
        id = existing.id;
        db.prepare(
          `UPDATE rsvps SET guest_id = COALESCE(guest_id, ?), name = ?, attendance = ?, pax = ?, message = ?,
             show_message = ?, ip_hash = ?, updated_at = ? WHERE id = ?`,
        ).run(guest?.id ?? null, body.name, body.attendance, body.pax, body.message, body.showMessage ? 1 : 0, ipHash, nowIso, id);
        db.prepare('DELETE FROM rsvp_sessions WHERE rsvp_id = ?').run(id);
      } else {
        id = Number(
          db
            .prepare(
              `INSERT INTO rsvps (guest_id, submission_id, name, attendance, pax, message, show_message, hidden, ip_hash, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .run(guest?.id ?? null, submissionId, body.name, body.attendance, body.pax, body.message, body.showMessage ? 1 : 0, hiddenDefault, ipHash, nowIso, nowIso)
            .lastInsertRowid,
        );
      }
      const addSession = db.prepare('INSERT INTO rsvp_sessions (rsvp_id, session_key) VALUES (?, ?)');
      for (const key of new Set(body.sessions)) addSession.run(id, key);
      return { status: existing ? 'updated' : 'created', row: db.prepare('SELECT * FROM rsvps WHERE id = ?').get(id) as RsvpRow };
    });

    const result = save();
    res.status(result.status === 'created' ? 201 : 200).json({ ok: true, status: result.status, rsvp: summary(result.row) });
  });

  router.get('/wishes', readLimit, (req, res) => {
    const q = pageQuerySchema.safeParse(req.query);
    const page = q.success ? q.data.page : 1;
    const size = event.wishes.pageSize;
    const where = "show_message = 1 AND hidden = 0 AND message <> ''";
    const total = db.prepare(`SELECT COUNT(*) FROM rsvps WHERE ${where}`).pluck().get() as number;
    // Sengaja TIDAK mengirim status kehadiran / jumlah orang: data itu hanya untuk penyelenggara.
    const items = db
      .prepare(`SELECT id, name, message, created_at AS createdAt FROM rsvps WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
      .all(size, (page - 1) * size);
    res.json({ ok: true, page, totalPages: Math.max(1, Math.ceil(total / size)), total, items });
  });

  return router;
}
