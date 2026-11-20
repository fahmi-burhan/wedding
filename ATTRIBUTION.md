# Atribusi & Lisensi Aset

Semua aset pihak ketiga yang dipakai undangan ini, beserta sumber dan lisensinya. Versi dicek dari `node_modules/*/package.json`.

## Font (di-host sendiri lewat paket @fontsource)
| Font | Dipakai untuk | Sumber | Lisensi |
|---|---|---|---|
| Playfair Display 700 & 400 italic | Judul, nama | @fontsource/playfair-display 5.3.0 (Claus Eggers Sørensen) | SIL OFL 1.1 |
| Lato 400 & 700 | Teks isi | @fontsource/lato 5.3.0 (Łukasz Dziedzic) | SIL OFL 1.1 |
| Great Vibes 400 | Judul script, nama panggilan, monogram | @fontsource/great-vibes 5.3.0 (Robert Leuschke / TypeSETit) | SIL OFL 1.1 |
| Aref Ruqaa 700 | Salam berbahasa Arab, label sesi | @fontsource/aref-ruqaa 5.3.0 (The Aref Ruqaa Project Authors) | SIL OFL 1.1 |
| Amiri 400 | Doa berharakat | @fontsource/amiri 5.3.0 (Khaled Hosny) | SIL OFL 1.1 |

## Ikon
| Aset | Sumber | Lisensi |
|---|---|---|
| Ikon garis (sendok-garpu, jam, tangan, baju, kamera, peta, kalender, dll.) | lucide-vue-next 1.0.0 | ISC |

## Ornamen & gambar
| Aset | Sumber | Lisensi |
|---|---|---|
| `web/src/assets/ornaments/*.svg` (buket hydrangea & mawar, pita bunga atas, untaian sisi, latar cat air, sulur, ranting, bayangan daun, kelopak) dan `web/public/favicon.svg` | Digambar prosedural oleh `scripts/generate-ornaments.ts` khusus untuk proyek ini | Milik proyek |
| Kupu-kupu (`web/src/components/Butterfly.vue`) | Digambar langsung sebagai SVG untuk proyek ini | Milik proyek |
| `web/src/assets/scenes/*.svg` (siluet pria bertarbusy & muslimah, cincin + bunga, masjid, lampion, bulan sabit, bintang, mushaf, burung, hamparan bunga, ubin pita motif) | Digambar prosedural oleh `scripts/generate-scenes.ts` khusus untuk proyek ini | Milik proyek |
| `web/public/og-image.jpg` | Dibuat oleh `scripts/og-image.ts` dari ornamen di atas + teks dari `config/event.ts` | Milik proyek |
| Tekstur kertas | Noise SVG `feTurbulence` di `web/src/styles/main.css` | Milik proyek |

## Gambar dari klien
| Aset | Sumber | Lisensi |
|---|---|---|
| `web/src/assets/brand/logo.png` (logo cover) | Dari `referensi/4.jpeg`, kiriman klien; latar dibuang dan diwarnai hitam oleh `scripts/process-assets.ts` | Milik klien (dibuat/dipilih klien) |
| `web/src/assets/brand/daawa-zifaf.svg` (kaligrafi "دعوة زفاف") | **Buatan sendiri**: huruf Arab diubah menjadi kurva vektor dari font Aref Ruqaa Bold (SIL OFL) oleh `scripts/generate-calligraphy.ts`, ditambah hiasan hati, goresan, dan titik yang digambar dengan kode. Tidak memakai gambar referensi | Milik proyek (huruf: SIL OFL) |

Kaligrafi tidak diambil dari gambar referensi klien (no. 7); gambar itu hanya dilihat sebagai gambaran gaya.

Nama Arab di sampul ("حسين" dan "الزهرة") adalah teks biasa dengan font Aref Ruqaa Bold (SIL OFL), bukan gambar.

## Musik
| Berkas | Sumber | Lisensi |
|---|---|---|
| `web/public/music/musik.m4a` | Dikirim klien (`referensi/musik.m4a`; versi `.weba` tidak dipakai) | **PERLU CEK LISENSI**: judul, pencipta, dan izin penggunaannya belum diketahui. Pastikan klien berhak memakainya di undangan publik |

Musik berulang (loop) dan mulai hanya setelah tamu menekan "Buka Undangan"; tombol jeda selalu terlihat.

## Referensi (tidak disalin)
- Video undangan Instagram milik pasangan (`referensi/undangan-husein-zahroh.mp4`): dipakai sebagai sumber data acara dan acuan ritme gerak. Tidak ada frame, ilustrasi, atau audio yang disalin.
- Foto palet, mockup, dan stationery di `referensi/`: dipakai sebagai acuan warna dan suasana.
- ourinvidigi.com/nisa-fairuz (referensi website terbaru dari klien, menggantikan yang lama): dipakai hanya sebagai acuan struktur dan gaya (sampul berjendela lengkung, perubahan warna latar yang tegas dengan pita motif, halaman panjang berlatar diam, bagian rekening yang bisa dibuka). Tidak ada kode, CSS, aset, ilustrasi, atau teks yang disalin, dan nama/merek vendor tidak dipakai.

## Pustaka perangkat lunak utama
Vue 3.5 (MIT), Express 5.3 (MIT), better-sqlite3 13.2 (MIT), Zod 4.6 (MIT), Tailwind CSS 4.3 (MIT), Vite 8.3 (MIT), sharp 0.35 (Apache-2.0; hanya dipakai saat membuat OG image).
