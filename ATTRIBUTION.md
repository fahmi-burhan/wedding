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
| `web/src/assets/ornaments/*.svg` (buket hydrangea & mawar, pita bunga atas, untaian sisi, latar cat air, sulur, ranting, bayangan daun, kelopak) dan `web/public/favicon.svg` |
| Kupu-kupu & monogram (`web/src/components/Butterfly.vue`, `Monogram.vue`) | Digambar langsung sebagai SVG/teks untuk proyek ini | Milik proyek | Digambar secara prosedural oleh `scripts/generate-ornaments.ts` khusus untuk proyek ini | Milik proyek |
| `web/public/og-image.jpg` | Dibuat oleh `scripts/og-image.ts` dari ornamen di atas + teks dari `config/event.ts` | Milik proyek |
| Tekstur kertas | Noise SVG `feTurbulence` di `web/src/styles/main.css` | Milik proyek |

## Musik
Belum ada. Musik latar dinonaktifkan (`event.music = null`). Saat menambahkannya, isi baris ini dengan judul, pemilik, dan bukti lisensinya.
**Audio dari video referensi TIDAK dipakai** karena lisensinya tidak jelas.

## Referensi (tidak disalin)
- Video undangan Instagram milik pasangan (`referensi/undangan-husein-zahroh.mp4`): dipakai sebagai sumber data acara dan acuan ritme gerak. Tidak ada frame, ilustrasi, atau audio yang disalin.
- Foto palet, mockup, dan stationery di `referensi/`: dipakai sebagai acuan warna dan suasana.
- hi.punakawandigital.id: dipakai hanya sebagai acuan urutan section. Tidak ada kode, CSS, aset, atau teks yang disalin, dan nama/merek vendor tidak dipakai.

## Pustaka perangkat lunak utama
Vue 3.5 (MIT), Express 5.3 (MIT), better-sqlite3 13.2 (MIT), Zod 4.6 (MIT), Tailwind CSS 4.3 (MIT), Vite 8.3 (MIT), sharp 0.35 (Apache-2.0; hanya dipakai saat membuat OG image).
