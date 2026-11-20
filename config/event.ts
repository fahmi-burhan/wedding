/**
 * config/event.ts — SATU-SATUNYA sumber data acara.
 *
 * Dipanggil oleh: server (tenggat & batas RSVP, daftar sesi), web (semua section undangan),
 *                 web/vite.config.ts (meta Open Graph), scripts/og-image.ts.
 * Memanggil: tidak ada (berkas data murni).
 *
 * Aturan:
 * - Teks pribadi/sakral di bawah ini berasal dari video undangan resmi pasangan, dari catatan revisi klien
 *   (referensi/REFERENSI.md), atau dari gambar referensi klien. Yang bertanda "PERLU DIPERIKSA" harus
 *   dibaca ulang oleh orang yang paham sebelum undangan disebar.
 * - Revisi data dilakukan DI SINI saja — komponen tidak perlu disentuh.
 * - Waktu ditulis ISO 8601 lengkap dengan offset +07:00 (WIB) agar hitung mundur, tenggat, dan kalender
 *   tidak bergeser walau tamu berada di zona waktu lain.
 * - Nilai `null` berarti fitur dinonaktifkan (bukan diisi data contoh).
 */

export type SessionKey = 'akad' | 'walimah';

export interface EventSession {
  key: SessionKey;
  label: string;
  /** Waktu mulai (ISO + offset WIB). */
  start: string;
  /** Waktu selesai (ISO + offset WIB). Tampil di halaman dan dipakai untuk kalender. */
  end: string;
}

export interface EtiquetteItem {
  /** Nama ikon yang dipetakan di web/src/sections/NoticeSection.vue */
  icon: 'utensils' | 'clock' | 'hand-heart' | 'shirt' | 'camera-off';
  text: string;
  /** true = larangan, diberi penekanan visual (garis tegas). */
  emphasis?: boolean;
}

export interface BankAccount {
  bank: string;
  /** Path logo bank (mis. '/img/bank-jago.png'). Kosong = tampil teks nama bank saja. */
  image: string;
  accountNumber: string;
  accountName: string;
}

export const event = {
  /** Label di sampul (huruf kapital semua). */
  title: 'Wedding Invitation',
  /** Label kecil yang dipakai di pratinjau tautan & panel admin. */
  titleId: 'Undangan Walimah',

  couple: {
    /** Nama panggilan yang tampil di hero & footer. */
    short: 'Husein & Zahroh',
    groom: {
      shortName: 'Husein',
      /** Nama di sampul, gaya kaligrafi (font mengikuti referensi foto no. 6). PERLU DIPERIKSA. */
      arabicName: 'حسين',
      fullName: 'Achmad Hosein Suwandi',
      parents: 'Putra dari Bapak Buradin\ndan Ibu Sitti Komariyah',
    },
    bride: {
      shortName: 'Zahroh',
      /** PERLU DIPERIKSA: gambar referensi no. 6 menulis "الزهرة" (ejaan akhir ـة/ـه bisa berbeda). */
      arabicName: 'الزهرة',
      fullName: 'Nushoibah AzZahroh',
      parents: 'Putri dari Bapak Abdul Fanani\ndan Ibu Wahyuningsih (Almh)',
    },
  },

  cover: {
    /** Permintaan maaf di bawah nama tamu (kalimat buatan, bukan dari video). */
    apology: 'Mohon maaf apabila terdapat kekeliruan dalam penulisan nama dan gelar.',
  },

  /** Zona waktu acara (IANA). Semua tampilan jam memakai zona ini. */
  timezone: 'Asia/Jakarta',
  timezoneLabel: 'WIB',

  sessions: [
    {
      key: 'akad',
      label: 'Akad Nikah',
      start: '2026-12-27T07:00:00+07:00',
      end: '2026-12-27T09:30:00+07:00',
    },
    {
      key: 'walimah',
      label: 'Walimah',
      start: '2026-12-27T10:00:00+07:00',
      end: '2026-12-27T13:30:00+07:00',
    },
  ] satisfies EventSession[] as EventSession[],

  /** Pengisi tausiyah. Nama kedua masih "Fulan" sampai klien memastikan. */
  speakers: {
    label: 'Pengisi Tausiyah',
    names: ['Dr. Ir. Rahmat Kurnia, M.Si.', 'Fulan'],
  } as { label: string; names: string[] } | null,

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

  /** Salam pembuka + kalimat undangan (dari video). */
  opening: {
    salamArabic: 'السلام عليكم ورحمة الله وبركاته',
    lines: [
      'Dengan memohon rahmat dan ridha Allah,',
      'kami mengundang Bapak/Ibu/Saudara/i',
      'dalam walimah pernikahan kami:',
    ],
  },

  /**
   * Ayat Ar-Rum: 21. Teks Arab dibaca dari gambar referensi klien no. 7 (tepi kiri-kanan baris dipisah
   * sesuai tampilan di undangan), terjemahan dari video. PERLU DIPERIKSA ULANG (harakat & tanda waqaf).
   */
  verse: {
    label: 'Firman Allah',
    arabicLines: [
      'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا',
      'وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِقَوْمٍ يَتَفَكَّرُونَ',
    ],
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

  /**
   * Pemberitahuan penting: konsep Infishal Tamm. Teks penjelasan ditulis ulang oleh pengembang
   * (bukan salinan dari website referensi) — PERLU DIPERIKSA oleh klien/ustadz sebelum disebar.
   */
  notice: {
    title: 'Pemberitahuan Penting',
    concept: 'Konsep Walimah Infishal Tamm',
    arabic: 'الانفصال التام',
    transliteration: 'Al-Infishal at-Tamm',
    paragraph:
      'Infishal tamm berarti pemisahan penuh antara tamu laki-laki dan perempuan selama acara, ' +
      'mulai dari jalur masuk, tempat duduk, hingga hidangan, agar walimah berlangsung dengan adab dan ' +
      'terjaga dari hal-hal yang tidak diinginkan. Mohon Bapak/Ibu berkenan mengikuti arahan panitia ' +
      'yang akan mengantar ke area yang sesuai.',
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

  /** Wedding gift. Data rekening diberikan langsung oleh klien (REFERENSI.md, Revisi Client 1). */
  gift: {
    title: 'Wedding Gift',
    lines: [
      'Doa restu Bapak/Ibu/Saudara/i sudah merupakan karunia yang sangat berarti bagi kami.',
      'Bila berkenan memberikan tanda kasih, dapat disalurkan melalui rekening berikut.',
    ],
    bankAccounts: [
      {
        bank: 'Bank JAGO Syariah',
        image: '',
        accountNumber: '509438120136',
        accountName: 'Ach Hosein Suwandi',
      },
      {
        bank: 'Bank Syariah Indonesia',
        image: '',
        accountNumber: '3421261390',
        accountName: 'Nushoibah Azzahroh',
      },
    ] as BankAccount[],
  } as { title: string; lines: string[]; bankAccounts: BankAccount[] } | null,

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
   * Musik latar (berkas dari klien). Mulai otomatis saat tamu menekan "Buka Undangan";
   * tombol jeda selalu terlihat di pojok layar. null = fitur nonaktif.
   * Lisensi lagu belum diketahui → PERLU CEK LISENSI (lihat ATTRIBUTION.md).
   */
  music: { src: '/music/musik.m4a', title: 'Musik latar', credit: 'Disediakan klien' } as
    | { src: string; title: string; credit: string }
    | null,

  /** Pratinjau tautan (WhatsApp, Telegram, dll). Gambar dibuat oleh `npm run og:image`. */
  og: {
    title: 'Undangan Walimah · Husein & Zahroh',
    description: 'Ahad, 27 Desember 2026 · Masjid Raya Al-Muttaqin, Kota Bogor',
    image: '/og-image.jpg',
  },
};

export type EventConfig = typeof event;
export const sessionKeys = event.sessions.map((s) => s.key);
