/**
 * config/event.ts — SATU-SATUNYA sumber data acara.
 *
 * Dipanggil oleh: server (tenggat & batas RSVP, daftar sesi), web (semua section undangan),
 *                 web/vite.config.ts (meta Open Graph), scripts/og-image.ts.
 * Memanggil: tidak ada (berkas data murni).
 *
 * Aturan:
 * - Semua teks pribadi/sakral di bawah ini diambil dari video undangan resmi pasangan
 *   (referensi/undangan-husein-zahroh.mp4) dan sudah dikonfirmasi pemilik acara.
 *   Bila ada revisi, ubah DI SINI saja — komponen tidak perlu disentuh.
 * - Waktu ditulis ISO 8601 lengkap dengan offset +07:00 (WIB) agar hitung mundur,
 *   tenggat, dan kalender tidak bergeser walau tamu berada di zona waktu lain.
 * - Nilai `null` berarti fitur dinonaktifkan (bukan diisi data contoh).
 */

export type SessionKey = 'akad' | 'walimah';

export interface EventSession {
  key: SessionKey;
  label: string;
  labelArabic: string;
  /** Waktu mulai (ISO + offset WIB). */
  start: string;
  /** Keterangan setelah jam, persis seperti di video. null = tidak ada. */
  endNote: string | null;
  /**
   * ASUMSI: durasi hanya untuk tombol "Tambah ke Kalender" (kalender wajib punya jam selesai).
   * Tidak ditampilkan di halaman.
   */
  calendarDurationMinutes: number;
}

export interface EtiquetteItem {
  /** Nama ikon yang dipetakan di web/src/sections/EtiquetteSection.vue */
  icon: 'utensils' | 'clock' | 'hand-heart' | 'shirt' | 'camera-off';
  text: string;
  /** true = larangan, diberi penekanan visual (garis tegas). */
  emphasis?: boolean;
}

export const event = {
  /** Label kecil di cover. */
  title: 'Undangan Walimah',

  couple: {
    /** Nama panggilan yang tampil di cover & penutup (sesuai video). */
    short: 'Husein & Zahroh',
    groom: {
      shortName: 'Husein',
      fullName: 'Achmad Hosein Suwandi',
      parents: 'Putra dari Bapak Buradin\ndan Ibu Sitti Komariyah',
    },
    bride: {
      shortName: 'Zahroh',
      fullName: 'Nushoibah AzZahroh',
      parents: 'Putri dari Bapak Abdul Fanani\ndan Ibu Wahyuningsih (Almh)',
    },
  },

  /** Zona waktu acara (IANA). Semua tampilan jam memakai zona ini. */
  timezone: 'Asia/Jakarta',
  timezoneLabel: 'WIB',

  sessions: [
    {
      key: 'akad',
      label: 'Akad Nikah',
      labelArabic: 'عقد الزواج',
      start: '2026-12-27T07:00:00+07:00',
      endNote: 's/d selesai',
      calendarDurationMinutes: 120,
    },
    {
      key: 'walimah',
      label: 'Walimah',
      labelArabic: 'وليمة العرس',
      start: '2026-12-27T10:00:00+07:00',
      endNote: null,
      calendarDurationMinutes: 180,
    },
  ] satisfies EventSession[] as EventSession[],

  speaker: {
    label: 'Pengisi Tausiyah',
    name: 'Dr. Ir. Rahmat Kurnia, M.Si.',
  } as { label: string; name: string } | null,

  venue: {
    name: 'Masjid Raya Al-Muttaqin',
    addressLines: [
      'Jl. Achmad Adnawijaya No. 112',
      'Tegal Gundil, Bogor Utara',
      'Kota Bogor, Jawa Barat',
    ],
    mapsUrl: 'https://maps.app.goo.gl/zwFe2rVj2Xvb732G7',
    /** URL embed Google Maps (Bagikan → Sematkan peta). null = peta tidak disematkan. */
    embedUrl: null as string | null,
  },

  opening: {
    salamArabic: 'السلام عليكم ورحمة الله وبركاته',
    lines: [
      'Dengan memohon rahmat dan ridha Allah,',
      'kami mengundang Bapak/Ibu/Saudara/i',
      'dalam walimah pernikahan kami:',
    ],
  },

  /** Teks sakral — hanya dari pemilik acara (video). */
  verse: {
    label: 'Firman Allah',
    lines: [
      'Dan di antara tanda-tanda (kebesaran)-Nya',
      'ialah Dia menciptakan pasangan-pasangan',
      'untukmu dari jenismu sendiri, agar kamu',
      'cenderung dan merasa tenteram kepadanya,',
      'dan Dia menjadikan di antaramu',
      'rasa kasih dan sayang.',
      'Sungguh, pada yang demikian itu',
      'benar-benar terdapat tanda-tanda',
      '(kebesaran Allah) bagi kaum yang berpikir.',
    ],
    source: 'QS. Ar-Rum: 21',
  },

  etiquette: {
    title: 'Adab Menghadiri Walimah',
    items: [
      { icon: 'utensils', text: 'Memperhatikan adab makan & minum' },
      { icon: 'clock', text: 'Memperhatikan waktu sholat' },
      { icon: 'hand-heart', text: 'Mendoakan kedua mempelai' },
      { icon: 'shirt', text: 'Berpakaian sopan & menutup aurat' },
      { icon: 'camera-off', text: 'Dilarang mengambil gambar tanpa izin', emphasis: true },
    ] satisfies EtiquetteItem[] as EtiquetteItem[],
  },

  /** Teks sakral — hanya dari pemilik acara (video). */
  prayer: {
    label: 'Doa untuk Pengantin',
    arabic: 'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
    lines: [
      'Semoga Allah memberkahimu',
      'di waktu bahagia dan memberkahimu',
      'di waktu susah, serta semoga Allah',
      'mempersatukan kalian berdua',
      'dalam kebaikan.',
    ],
    source: 'HR. Abu Dawud no. 2130',
  },

  closing: {
    lines: [
      'Merupakan suatu kehormatan',
      'dan kebahagiaan bagi kami',
      'apabila Bapak/Ibu/Saudara/i',
      'berkenan hadir dan memberikan',
      'doa restu kepada kedua mempelai.',
    ],
    salamArabic: 'والسلام عليكم ورحمة الله وبركاته',
  },

  rsvp: {
    /** Tenggat RSVP: H-7 (disetujui pemilik acara). Server menolak kiriman setelah waktu ini. */
    deadline: '2026-12-20T23:59:59+07:00',
    /** Batas orang per RSVP untuk tamu tanpa tautan khusus (?g=). */
    defaultMaxPax: 2,
    /** Kontak penyelenggara yang tampil saat form ditutup. null = tidak ditampilkan. */
    contact: null as { label: string; whatsapp: string } | null,
  },

  wishes: {
    /** 'langsung' = ucapan tampil seketika (admin bisa menyembunyikan). */
    mode: 'langsung' as 'langsung' | 'moderasi',
    pageSize: 10,
  },

  /**
   * Musik latar. null = fitur nonaktif.
   * Untuk mengaktifkan: taruh berkas milik/berlisensi di web/public/music/ lalu isi, contoh:
   * { src: '/music/nama-berkas.mp3', title: 'Judul', credit: 'Pemilik / lisensi' }
   */
  music: null as { src: string; title: string; credit: string } | null,

  /** Pratinjau tautan (WhatsApp, Telegram, dll). Gambar dibuat oleh `npm run og:image`. */
  og: {
    title: 'Undangan Walimah · Husein & Zahroh',
    description: 'Ahad, 27 Desember 2026 · Masjid Raya Al-Muttaqin, Kota Bogor',
    image: '/og-image.jpg',
  },
};

export type EventConfig = typeof event;
export const sessionKeys = event.sessions.map((s) => s.key);
