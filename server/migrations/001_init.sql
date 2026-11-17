-- server/migrations/001_init.sql — skema awal database RSVP.
-- Dipanggil oleh: server/migrate.ts (dijalankan otomatis saat server start & saat test).
-- Aturan: JANGAN mengubah berkas migration yang sudah dijalankan di server produksi.
--         Perubahan skema berikutnya dibuat sebagai berkas baru: 002_xxx.sql, dst.

-- Daftar tamu (opsional). Diisi lewat `npm run guests:import` dari data/guests.csv.
-- `code` dipakai di tautan personal (?g=KODE) agar RSVP tamu tsb bisa diperbarui & dibatasi kuotanya.
CREATE TABLE guests (
  id          INTEGER PRIMARY KEY,
  code        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL UNIQUE,
  max_pax     INTEGER NOT NULL CHECK (max_pax BETWEEN 1 AND 20),
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Satu baris = satu konfirmasi kehadiran.
-- guest_id UNIQUE  : tamu dari daftar hanya punya satu RSVP (kiriman ulang = update).
-- submission_id UNIQUE : kunci idempotensi untuk tamu tanpa daftar (UUID dari browser tamu).
CREATE TABLE rsvps (
  id            INTEGER PRIMARY KEY,
  guest_id      INTEGER UNIQUE REFERENCES guests(id) ON DELETE SET NULL,
  submission_id TEXT    NOT NULL UNIQUE,
  name          TEXT    NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
  attendance    TEXT    NOT NULL CHECK (attendance IN ('hadir', 'tidak', 'ragu')),
  pax           INTEGER NOT NULL CHECK (pax BETWEEN 0 AND 20),
  message       TEXT    NOT NULL DEFAULT '' CHECK (length(message) <= 500),
  show_message  INTEGER NOT NULL DEFAULT 1 CHECK (show_message IN (0, 1)),
  hidden        INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  ip_hash       TEXT    NOT NULL,
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL,
  -- Konsistensi: tidak hadir = 0 orang; hadir/ragu = minimal 1 orang.
  CHECK ((attendance = 'tidak' AND pax = 0) OR (attendance <> 'tidak' AND pax >= 1))
);

CREATE INDEX idx_rsvps_wall ON rsvps (show_message, hidden, created_at);

-- Sesi yang (akan) dihadiri. Tabel terpisah agar rekap per sesi cukup dengan GROUP BY.
CREATE TABLE rsvp_sessions (
  rsvp_id     INTEGER NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  session_key TEXT    NOT NULL,
  PRIMARY KEY (rsvp_id, session_key)
);

-- Sesi login admin. Yang disimpan hanya HASH token, sehingga bocornya database
-- tidak langsung memberi akses admin.
CREATE TABLE admin_sessions (
  token_hash  TEXT PRIMARY KEY,
  expires_at  INTEGER NOT NULL
);

-- Penghitung gagal login per IP (di-hash) untuk penguncian sementara.
CREATE TABLE login_attempts (
  ip_hash      TEXT PRIMARY KEY,
  fails        INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0
);

-- Catatan kiriman yang ditolak sebagai spam (untuk dilihat admin).
CREATE TABLE spam_log (
  id          INTEGER PRIMARY KEY,
  ip_hash     TEXT NOT NULL,
  reason      TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
