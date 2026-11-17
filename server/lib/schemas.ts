/**
 * server/lib/schemas.ts — aturan validasi (Zod) untuk semua input dari luar.
 *
 * Dipanggil oleh: server/routes/public.ts, server/routes/admin.ts.
 * Memanggil: zod, shared/sanitize.ts, config/event.ts.
 *
 * Prinsip: validasi di SERVER adalah satu-satunya yang dipercaya. Validasi di browser hanya
 * untuk kenyamanan tamu; bot bisa mengirim apa pun langsung ke API.
 */
import { z } from 'zod';
import { cleanMessage, cleanName, MESSAGE_MAX } from '../../shared/sanitize.ts';
import { sessionKeys } from '../../config/event.ts';

/** Kode tamu: 6–12 huruf besar/angka (format dibuat oleh scripts/guests-import.ts). */
export const guestCodeSchema = z.string().regex(/^[A-Z0-9]{6,12}$/);

export const rsvpBodySchema = z
  .object({
    // UUID dibuat browser tamu sekali per perangkat → kunci idempotensi (klik ganda / kirim ulang).
    submissionId: z.uuid(),
    // Kode tamu yang salah format diabaikan (jadi null) — tamu tetap bisa RSVP dengan kuota umum.
    guestCode: z
      .string()
      .max(20)
      .optional()
      .nullable()
      .transform((v) => {
        const up = typeof v === 'string' ? v.trim().toUpperCase() : '';
        return guestCodeSchema.safeParse(up).success ? up : null;
      }),
    // transform dulu (bersihkan), baru cek tidak kosong.
    name: z.string().max(200).transform(cleanName).pipe(z.string().min(1, 'Nama wajib diisi.')),
    attendance: z.enum(['hadir', 'tidak', 'ragu']),
    pax: z.number().int().min(0).max(20),
    sessions: z.array(z.enum(sessionKeys as [string, ...string[]])).max(sessionKeys.length),
    message: z
      .string()
      .max(MESSAGE_MAX * 2)
      .optional()
      .default('')
      .transform(cleanMessage),
    showMessage: z.boolean().optional().default(true),
    // Honeypot: input tersembunyi yang hanya diisi bot. Divalidasi terpisah di route.
    website: z.string().max(200).optional().default(''),
    // Lama (ms) form terbuka sebelum dikirim, diukur di browser tamu. Sengaja berupa SELISIH,
    // bukan jam: jam ponsel tamu bisa berbeda beberapa detik/menit dari jam server.
    elapsedMs: z.number().int().min(0).max(30 * 24 * 60 * 60 * 1000),
  })
  .superRefine((v, ctx) => {
    if (v.attendance === 'tidak') {
      if (v.pax !== 0) ctx.addIssue({ code: 'custom', path: ['pax'], message: 'Jumlah orang harus 0 bila tidak hadir.' });
      if (v.sessions.length) ctx.addIssue({ code: 'custom', path: ['sessions'], message: 'Sesi tidak diisi bila tidak hadir.' });
    } else {
      if (v.pax < 1) ctx.addIssue({ code: 'custom', path: ['pax'], message: 'Jumlah orang minimal 1.' });
      if (!v.sessions.length) ctx.addIssue({ code: 'custom', path: ['sessions'], message: 'Pilih minimal satu sesi.' });
    }
  });

export type RsvpBody = z.infer<typeof rsvpBodySchema>;

export const loginBodySchema = z.object({
  password: z.string().min(1).max(200),
});

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});

export const hideBodySchema = z.object({
  hidden: z.boolean(),
});

const FIELD_LABELS: Record<string, string> = {
  name: 'Nama',
  attendance: 'Status kehadiran',
  pax: 'Jumlah orang',
  sessions: 'Pilihan sesi',
  message: 'Ucapan',
};
// Pesan yang kita tulis sendiri (bahasa Indonesia) boleh diteruskan ke tamu apa adanya.
const OWN_MESSAGES = new Set(['Nama wajib diisi.']);

/** Ubah error Zod menjadi satu pesan ramah. Pesan bawaan Zod (bahasa Inggris, teknis) tidak diteruskan. */
export function firstMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Data tidak valid.';
  if (issue.code === 'custom' || OWN_MESSAGES.has(issue.message)) return issue.message;
  const label = FIELD_LABELS[String(issue.path[0])];
  return label ? `${label} tidak valid.` : 'Data tidak valid. Muat ulang halaman lalu coba lagi.';
}
