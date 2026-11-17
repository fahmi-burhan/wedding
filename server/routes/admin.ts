/**
 * server/routes/admin.ts — API panel admin (semua kecuali login wajib sesi valid).
 *
 *   POST  /api/admin/login         → masuk (kata sandi), dapat cookie sesi 8 jam
 *   POST  /api/admin/logout        → keluar
 *   GET   /api/admin/me            → cek apakah sesi masih berlaku
 *   GET   /api/admin/summary       → rekap hadir/tidak/ragu & total orang per sesi
 *   GET   /api/admin/rsvps         → semua RSVP
 *   PATCH /api/admin/rsvps/:id     → sembunyikan/tampilkan ucapan di dinding
 *   GET   /api/admin/guests        → daftar tamu + tautan personal + pesan WhatsApp
 *   GET   /api/admin/export.csv    → unduh rekap RSVP (CSV)
 *
 * Dipanggil oleh: server/app.ts (dipasang di /api/admin).
 * Memanggil: server/lib/auth.ts, server/lib/csv.ts, server/lib/links.ts, server/lib/schemas.ts.
 */
import { Router } from 'express';
import type { Response } from 'express';
import type { DB } from '../db.ts';
import { event } from '../../config/event.ts';
import { formatDateTime } from '../../shared/date.ts';
import {
  clearFailures,
  createSession,
  destroySession,
  lockRemaining,
  recordFailure,
  requireAdmin,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  verifyPassword,
} from '../lib/auth.ts';
import { toCsv } from '../lib/csv.ts';
import { guestLink, whatsappMessage } from '../lib/links.ts';
import { hideBodySchema, loginBodySchema } from '../lib/schemas.ts';
import { hashIp, readCookie, sameOriginOnly } from '../lib/security.ts';
import { rateLimit } from '../lib/rateLimit.ts';

export interface AdminOptions {
  passwordHash: string | undefined;
  publicBaseUrl: string;
  secureCookie: boolean;
}

const ATTENDANCE_LABEL: Record<string, string> = { hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Belum pasti' };

interface AdminRsvpRow {
  id: number;
  name: string;
  attendance: string;
  pax: number;
  message: string;
  show_message: number;
  hidden: number;
  created_at: string;
  updated_at: string;
  guest_code: string | null;
  sessions: string | null;
}

export function adminRouter(db: DB, now: () => number, opts: AdminOptions): Router {
  const router = Router();
  router.use(sameOriginOnly);

  const setSessionCookie = (res: Response, token: string, maxAge: number) =>
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true, // tidak bisa dibaca JavaScript (aman dari XSS mencuri sesi)
      sameSite: 'strict', // tidak ikut terkirim dari situs lain (CSRF)
      secure: opts.secureCookie, // hanya lewat HTTPS di produksi
      path: '/api/admin',
      maxAge,
    });

  // Lapisan kedua di atas penguncian per-IP: maksimal 20 percobaan login per 15 menit per IP.
  const loginLimit = rateLimit({ windowMs: 15 * 60_000, max: 20, now, message: 'Terlalu banyak percobaan. Coba lagi nanti.' });

  router.post('/login', loginLimit, (req, res) => {
    if (!opts.passwordHash) {
      res.status(503).json({ ok: false, error: 'Admin belum disiapkan. Jalankan: npm run admin:password' });
      return;
    }
    const ipHash = hashIp(req.ip ?? 'unknown');
    const t = now();
    const wait = lockRemaining(db, ipHash, t);
    if (wait > 0) {
      res.status(429).json({ ok: false, error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(wait / 60_000)} menit.` });
      return;
    }
    const body = loginBodySchema.safeParse(req.body);
    if (!body.success || !verifyPassword(body.data.password, opts.passwordHash)) {
      recordFailure(db, ipHash, t);
      // Pesan sama untuk semua kegagalan: tidak membocorkan apa pun.
      res.status(401).json({ ok: false, error: 'Kata sandi salah.' });
      return;
    }
    clearFailures(db, ipHash);
    setSessionCookie(res, createSession(db, t), SESSION_TTL_MS);
    res.json({ ok: true });
  });

  router.post('/logout', (req, res) => {
    destroySession(db, readCookie(req, SESSION_COOKIE));
    setSessionCookie(res, '', 0);
    res.json({ ok: true });
  });

  // ───── Semua route di bawah ini wajib login ─────
  router.use(requireAdmin(db, now));

  router.get('/me', (_req, res) => {
    res.json({ ok: true });
  });

  router.get('/summary', (_req, res) => {
    const byAttendance = db
      .prepare('SELECT attendance, COUNT(*) AS responses, COALESCE(SUM(pax), 0) AS people FROM rsvps GROUP BY attendance')
      .all() as { attendance: string; responses: number; people: number }[];
    const bySession = db
      .prepare(
        `SELECT s.session_key AS session, r.attendance, COUNT(*) AS responses, COALESCE(SUM(r.pax), 0) AS people
         FROM rsvp_sessions s JOIN rsvps r ON r.id = s.rsvp_id GROUP BY s.session_key, r.attendance`,
      )
      .all() as { session: string; attendance: string; responses: number; people: number }[];
    const guests = db
      .prepare(
        `SELECT COUNT(*) AS invited, COUNT(r.id) AS responded
         FROM guests g LEFT JOIN rsvps r ON r.guest_id = g.id`,
      )
      .get() as { invited: number; responded: number };
    const spam = db.prepare('SELECT COUNT(*) FROM spam_log').pluck().get() as number;

    const attendance = Object.fromEntries(
      ['hadir', 'tidak', 'ragu'].map((a) => {
        const row = byAttendance.find((r) => r.attendance === a);
        return [a, { responses: row?.responses ?? 0, people: row?.people ?? 0 }];
      }),
    );
    // Per sesi: orang yang PASTI hadir dan yang masih "belum pasti" dipisah agar perkiraan konsumsi jelas.
    const sessions = event.sessions.map((s) => {
      const pick = (a: string) => bySession.find((r) => r.session === s.key && r.attendance === a);
      return {
        key: s.key,
        label: s.label,
        confirmedPeople: pick('hadir')?.people ?? 0,
        confirmedResponses: pick('hadir')?.responses ?? 0,
        tentativePeople: pick('ragu')?.people ?? 0,
        tentativeResponses: pick('ragu')?.responses ?? 0,
      };
    });
    res.json({ ok: true, attendance, sessions, guests, spam, deadline: event.rsvp.deadline });
  });

  const listRsvps = () =>
    db
      .prepare(
        `SELECT r.id, r.name, r.attendance, r.pax, r.message, r.show_message, r.hidden, r.created_at, r.updated_at,
                g.code AS guest_code,
                (SELECT group_concat(session_key, ',') FROM rsvp_sessions s WHERE s.rsvp_id = r.id) AS sessions
         FROM rsvps r LEFT JOIN guests g ON g.id = r.guest_id
         ORDER BY r.updated_at DESC, r.id DESC`,
      )
      .all() as AdminRsvpRow[];

  router.get('/rsvps', (_req, res) => {
    res.json({
      ok: true,
      items: listRsvps().map((r) => ({
        id: r.id,
        name: r.name,
        attendance: r.attendance,
        pax: r.pax,
        sessions: r.sessions ? r.sessions.split(',') : [],
        message: r.message,
        showMessage: r.show_message === 1,
        hidden: r.hidden === 1,
        guestCode: r.guest_code,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  });

  router.patch('/rsvps/:id', (req, res) => {
    const id = Number(req.params.id);
    const body = hideBodySchema.safeParse(req.body);
    if (!Number.isInteger(id) || id < 1 || !body.success) {
      res.status(400).json({ ok: false, error: 'Data tidak valid.' });
      return;
    }
    const info = db.prepare('UPDATE rsvps SET hidden = ? WHERE id = ?').run(body.data.hidden ? 1 : 0, id);
    if (info.changes === 0) {
      res.status(404).json({ ok: false, error: 'RSVP tidak ditemukan.' });
      return;
    }
    res.json({ ok: true });
  });

  router.get('/guests', (_req, res) => {
    const rows = db
      .prepare(
        `SELECT g.id, g.code, g.name, g.max_pax, r.attendance, r.pax
         FROM guests g LEFT JOIN rsvps r ON r.guest_id = g.id ORDER BY g.name COLLATE NOCASE`,
      )
      .all() as { id: number; code: string; name: string; max_pax: number; attendance: string | null; pax: number | null }[];
    res.json({
      ok: true,
      items: rows.map((g) => {
        const link = guestLink(opts.publicBaseUrl, g);
        return {
          id: g.id,
          code: g.code,
          name: g.name,
          maxPax: g.max_pax,
          attendance: g.attendance,
          pax: g.pax,
          link,
          whatsappText: whatsappMessage(link, g.name),
        };
      }),
    });
  });

  router.get('/export.csv', (_req, res) => {
    const tz = event.timezone;
    const tzl = event.timezoneLabel;
    const header = [
      'No', 'Nama', 'Status', 'Jumlah Orang',
      ...event.sessions.map((s) => s.label),
      'Ucapan', 'Ucapan Tampil Publik', 'Disembunyikan Admin', 'Kode Tamu', 'Dikirim', 'Terakhir Diubah',
    ];
    const rows = listRsvps().map((r, i) => {
      const sessions = r.sessions ? r.sessions.split(',') : [];
      return [
        i + 1,
        r.name,
        ATTENDANCE_LABEL[r.attendance] ?? r.attendance,
        r.pax,
        ...event.sessions.map((s) => (sessions.includes(s.key) ? 'Ya' : '-')),
        r.message,
        r.show_message ? 'Ya' : 'Tidak',
        r.hidden ? 'Ya' : 'Tidak',
        r.guest_code ?? '',
        formatDateTime(r.created_at, tz, tzl),
        formatDateTime(r.updated_at, tz, tzl),
      ];
    });
    const stamp = new Date(now()).toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="rsvp-${stamp}.csv"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send(toCsv(header, rows));
  });

  return router;
}
