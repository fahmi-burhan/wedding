# Undangan Walimah · Husein & Zahroh

Website undangan digital mobile-first dengan RSVP yang tersimpan permanen di server, dinding ucapan, panel admin (rekap + ekspor CSV), dan tautan personal per tamu.

## Isi undangan

Cover dengan nama tamu → salam → ayat → mempelai → hitung mundur → Akad Nikah & Walimah → tausiyah → lokasi → adab → RSVP → dinding ucapan → doa → penutup. Semua data acara ada di satu berkas: [config/event.ts](config/event.ts).

## Fitur

- **RSVP:** hadir / tidak / belum pasti, jumlah orang, pilihan sesi, ucapan. Divalidasi di server, idempoten, dengan batas kiriman, tenggat, dan kuota per tamu.
- **Tautan personal:** `https://domain/u/KODE` menampilkan nama tamu dan membatasi kuota orangnya.
- **Panel admin** (`/admin`): rekap per sesi, daftar RSVP, sembunyikan ucapan, daftar tamu + tautan, unduh CSV.
- **Pratinjau WhatsApp** (Open Graph), kalender (Google Calendar & .ics), musik latar opsional.
- **Ramah ponsel:** diuji di layar 360 px, menghormati pengaturan "kurangi gerakan".
- **Privasi:** status kehadiran tamu tidak pernah tampil di halaman publik.

## Teknologi

Node.js 24 (TypeScript langsung), Express 5, SQLite (better-sqlite3), Zod, Vue 3, Vite 8, Tailwind CSS 4.

## Mulai cepat (Windows, PowerShell)

```powershell
npm install
Copy-Item .env.example .env
npm run admin:password
npm run dev
```

Buka `http://localhost:5173`. Test: `npm test`.

## Dokumentasi

- **[TUTORIAL.md](TUTORIAL.md):** menjalankan lokal, mengubah data acara, daftar tamu & tautan, panel admin, deploy ke VPS, checklist sebelum disebar, pemecahan masalah.
- **[ATTRIBUTION.md](ATTRIBUTION.md):** sumber dan lisensi semua font, ikon, dan ornamen.

## Struktur

```
config/event.ts   data acara (satu-satunya sumber)
server/           Express + SQLite
web/              Vue (undangan & admin)
scripts/          admin-password, guests-import, guest-links, db-backup, ornamen, og-image
tests/            node:test + supertest
deploy/           pm2, systemd, Nginx
```
