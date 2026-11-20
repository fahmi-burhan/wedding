# Tutorial Penggunaan & Deploy

Panduan langkah demi langkah (Windows + VPS). Ringkasan proyek ada di [README.md](README.md).

---

## 1. Menjalankan di Windows (lokal)

Butuh **Node.js 24** atau lebih baru. Cek versinya dengan `node -v`. Semua perintah di bawah dijalankan di **PowerShell**, dari folder proyek.

1. Pasang dependensi:
   ```powershell
   npm install
   ```
2. Buat berkas pengaturan:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Buat kata sandi admin. Script ini mengisi `ADMIN_PASSWORD_HASH` dan `IP_SALT` di `.env`:
   ```powershell
   npm run admin:password
   ```
4. Jalankan mode pengembangan (API di port 3000, tampilan di port 5173, reload otomatis):
   ```powershell
   npm run dev
   ```
5. Buka `http://localhost:5173/?to=Nama%20Tamu`. Panel admin ada di `http://localhost:5173/admin.html`.

Di mode dev, Vite meneruskan `/api` ke port yang tertulis di `PORT` pada `.env`. Bila Anda mengganti `PORT`, hentikan `npm run dev` (Ctrl+C) lalu jalankan lagi.

**Uji dari ponsel di Wi-Fi yang sama:**
1. Lihat IP komputer dengan `ipconfig` (baris "IPv4 Address").
2. Di ponsel, buka `http://IP-KOMPUTER:5173`.
3. Bila tidak bisa dibuka, izinkan Node.js di Windows Firewall.

**Mode produksi lokal** (sama seperti di VPS):
```powershell
npm run build
npm start
```
Lalu buka `http://localhost:3000` dan `http://localhost:3000/admin`.

**Test otomatis** (29 skenario: validasi, spam, tenggat, kuota, idempotensi, admin, CSV):
```powershell
npm test
```

---

## 2. Mengubah data acara

**Semua** teks dan data acara ada di satu berkas, [config/event.ts](config/event.ts). Komponen tidak perlu disentuh.

| Yang diubah | Field |
|---|---|
| Nama, orang tua | `couple` |
| Tanggal & jam sesi | `sessions[].start` (format `2026-12-27T07:00:00+07:00`) |
| Lokasi & tautan peta | `venue` (`embedUrl` diisi bila ingin peta tersemat) |
| Ayat, salam & kalimat undangan, adab | `verse`, `opening`, `etiquette` |
| Tenggat RSVP & batas orang | `rsvp.deadline`, `rsvp.defaultMaxPax`, `rsvp.contact` |
| Mode dinding ucapan | `wishes.mode` (`'langsung'` atau `'moderasi'`) |
| Teks pratinjau WhatsApp | `og` |
| Rekening wedding gift | `gift.bankAccounts` (isi `gift: null` untuk menyembunyikan bagiannya) |
| Pengisi tausiyah (nama kedua masih "Fulan") | `speakers.names` |
| Teks Infishal Tamm | `notice` |

Setelah mengubah nama, tanggal, atau lokasi, buat ulang gambar pratinjau lalu build:
```powershell
npm run og:image
npm run build
```

### Musik latar
Musik sudah aktif: berkas `web/public/music/musik.m4a` (dari klien), mulai otomatis saat tamu menekan "Buka Undangan", berulang, dengan tombol jeda/putar di pojok kiri bawah.
Untuk mengganti lagu, timpa berkas itu (format `.m4a`/`.mp3`, usahakan di bawah 4 MB) atau ubah `music.src` di `config/event.ts`. Untuk mematikan musik, ubah `music` menjadi `null`. Catat sumber dan lisensinya di [ATTRIBUTION.md](ATTRIBUTION.md).

### Mengubah warna/bentuk ilustrasi
Ornamen bunga dan sulur digambar oleh [scripts/generate-ornaments.ts](scripts/generate-ornaments.ts), sedangkan siluet, masjid, lampion, cincin, dan pita motif oleh [scripts/generate-scenes.ts](scripts/generate-scenes.ts). Palet ada di [scripts/lib/art.ts](scripts/lib/art.ts) dan token di [web/src/styles/main.css](web/src/styles/main.css). Setelah mengubah:
```powershell
npm run ornaments
npm run scenes
```
Logo dan kaligrafi dibuat dari gambar di folder `referensi/` (`4.jpeg` dan `7.jpeg`). Bila gambarnya diganti, jalankan `npm run assets`.

---

## 3. Daftar tamu & tautan personal

Tautan personal (`?to=Nama&g=KODE`) melakukan tiga hal:
- `to` menampilkan nama tamu di sampul;
- `g` adalah **kode tamu** unik: server memakainya untuk membatasi jumlah orang sesuai kuota tamu itu, dan agar RSVP ulang memperbarui jawaban lama, bukan menambah baris baru.

1. Isi `data\guests.csv` di Excel (templat sudah ada, hanya berisi judul kolom `nama,maks_orang`). Nama harus unik; bila ada dua nama sama, bedakan, misalnya "Ahmad (Kantor)".
2. Masukkan ke database. Perintah ini aman diulang: tamu lama hanya diperbarui kuotanya dan kodenya tetap.
   ```powershell
   npm run guests:import
   ```
3. Pastikan `PUBLIC_BASE_URL` di `.env` sudah berisi domain asli, lalu buat berkas tautan:
   ```powershell
   npm run guests:links
   ```
4. Buka `data\guest-links.csv`. Isinya tautan dan pesan WhatsApp siap tempel untuk setiap tamu.

Tautan tamu juga tersedia di panel admin, tab **Daftar Tamu**, lengkap dengan tombol salin dan "Buka di WhatsApp".

**Di VPS:** data tamu ada di database server, jadi impor dijalankan di sana:
```powershell
scp data\guests.csv advan@sahoor.cloud:/home/advan/apps/wedding/data/
ssh advan@sahoor.cloud "cd ~/apps/wedding && npm run guests:import && npm run guests:links"
```
Lalu salin tautannya dari panel admin (`/admin`, tab Daftar Tamu) atau unduh `data/guest-links.csv`.

Tamu tanpa tautan personal tetap bisa RSVP dengan batas `rsvp.defaultMaxPax` (saat ini 2 orang). Untuk sapaan saja tanpa kuota, tautannya cukup `https://domain/?to=Nama%20Tamu`.

---

## 4. Panel admin & ekspor CSV

- **Alamat:** `https://domain-anda/admin`
- **Tab Rekap:** jumlah Hadir, Belum pasti, dan Tidak hadir, perkiraan orang per sesi (pasti dan belum pasti), tamu berkode yang sudah menjawab, dan jumlah spam yang ditolak.
- **Tab RSVP:** semua jawaban beserta pencarian. Tombol **Sembunyikan** menurunkan ucapan dari dinding publik.
- **Unduh CSV:** berkas UTF-8 yang langsung terbaca rapi di Excel.
- **Keamanan:**
  - Kata sandi disimpan sebagai hash scrypt.
  - Sesi berlaku 8 jam, dengan cookie HttpOnly dan SameSite=Strict.
  - Setelah 5 kali salah, login dikunci 1, 2, 4 … menit (maksimal 60).
- **Ganti kata sandi:** jalankan `npm run admin:password`, lalu restart server.

---

## 5. Deploy ke VPS (dari GitHub)

### 5A. VPS sahoor.cloud (aaPanel + pm2) — cara yang dipakai saat ini

- **Lokasi aplikasi:** `/home/advan/apps/wedding`. Sengaja di luar `/www/wwwroot`, supaya Nginx tidak mungkin menyajikan `.env` atau database.
- **Proses:** pm2 dengan nama `wedding`, dikonfigurasi di [deploy/ecosystem.config.cjs](deploy/ecosystem.config.cjs). Aplikasi mendengarkan di `127.0.0.1:4234`.
- **Panel:** aaPanel → situs `wedding.sahoor.cloud` → Reverse proxy ke `http://127.0.0.1:4234`, SSL Let's Encrypt, Force HTTPS.

Masuk ke server dari PowerShell:
```powershell
ssh advan@sahoor.cloud
```

Perintah berikut dijalankan di VPS.

**Memperbarui setelah ada commit baru:**
```bash
cd ~/apps/wedding && git pull && npm ci && npm run build && pm2 restart wedding
```

**Melihat log dan status:**
```bash
pm2 logs wedding
pm2 ls
```

**Mengganti kata sandi admin:**
```bash
cd ~/apps/wedding && npm run admin:password && pm2 restart wedding
```

### 5B. VPS lain tanpa panel (systemd + Nginx)

Panduan ini untuk VPS Ubuntu/Debian. Perintah di VPS dijalankan lewat SSH (bash). Sambungkan dari Windows dengan:
```powershell
ssh user@ip-vps
```

### Pertama kali
1. Pasang Node.js 24, git, Nginx, dan certbot. Lihat panduan resmi di nodejs.org untuk Node.js. Contoh di Ubuntu:
   ```bash
   sudo apt update && sudo apt install -y git nginx certbot python3-certbot-nginx
   ```
2. Buat user khusus aplikasi lalu masuk sebagai user itu:
   ```bash
   sudo adduser --disabled-password undangan && sudo -iu undangan
   ```
3. Ambil kode:
   ```bash
   git clone https://github.com/fahmi-burhan/wedding.git app && cd app
   ```
4. Pasang dependensi. Termasuk devDependencies, karena Vite dibutuhkan untuk build.
   ```bash
   npm ci
   ```
5. Buat `.env`:
   ```bash
   cp .env.example .env && nano .env
   ```
   Isi nilai berikut:
   ```
   HOST=127.0.0.1
   PUBLIC_BASE_URL=https://undangan.domainanda.id
   TRUST_PROXY=loopback
   NODE_ENV=production
   ```
6. Buat kata sandi admin:
   ```bash
   npm run admin:password
   ```
7. Build tampilan. `PUBLIC_BASE_URL` dibaca saat build untuk meta pratinjau WhatsApp.
   ```bash
   npm run build
   ```
8. Kembali ke user sudo (`exit`), lalu pasang service. Sesuaikan path bila perlu.
   ```bash
   sudo cp /home/undangan/app/deploy/undangan.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now undangan
   ```
9. Pasang Nginx. Ganti domain di berkasnya terlebih dahulu.
   ```bash
   sudo cp /home/undangan/app/deploy/nginx-undangan.conf /etc/nginx/sites-available/undangan && sudo ln -s /etc/nginx/sites-available/undangan /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx
   ```
10. Aktifkan HTTPS:
    ```bash
    sudo certbot --nginx -d undangan.domainanda.id
    ```
11. Jadwalkan backup database harian jam 03.00:
    ```bash
    sudo -iu undangan crontab -e
    ```
    Lalu tambahkan baris:
    ```
    0 3 * * * cd /home/undangan/app && /usr/bin/node --env-file=.env scripts/db-backup.ts
    ```
12. Daftar tamu: unggah `data/guests.csv` dari Windows (berkas ini tidak ikut git karena berisi data pribadi):
    ```powershell
    scp data\guests.csv user@ip-vps:/home/undangan/app/data/
    ```
    Lalu jalankan `npm run guests:import` di VPS.

### Memperbarui (setelah ada commit baru)
```bash
sudo -iu undangan bash -c "cd app && git pull && npm ci && npm run build" && sudo systemctl restart undangan
```
Database (`data/wedding.db`) tidak tersentuh oleh `git pull`.

### Catatan
- Folder `data/` (database, daftar tamu, backup) dan `.env` tidak pernah masuk git.
- better-sqlite3 13 sudah membawa binary siap pakai untuk linux-x64 dan arm64, jadi tidak perlu kompilasi di VPS.
- **Mengunduh backup ke Windows:**
  ```powershell
  scp -r user@ip-vps:/home/undangan/app/data/backups .\backup-vps
  ```
- Status server: `sudo systemctl status undangan`. Log: `sudo journalctl -u undangan -f`.

---

## 6. Checklist sebelum undangan disebar

- [ ] **Data acara:** setiap baris `config/event.ts` cocok dengan video undangan resmi (nama, orang tua, tanggal, jam, lokasi, pengisi tausiyah).
- [ ] **Ejaan nama:** "Husein" (panggilan) vs "Achmad Hosein Suwandi" (nama lengkap) sudah dikonfirmasi benar. Gelar dan "(Almh)" tepat.
- [ ] **Teks sakral:** ayat QS. Ar-Rum: 21 dan doa HR. Abu Dawud no. 2130, termasuk teks Arab berharakat, sudah diperiksa ulang oleh orang yang paham.
- [ ] **Peta:** tombol "Buka Google Maps" membuka Masjid Raya Al-Muttaqin yang benar.
- [ ] **Tenggat:** `rsvp.deadline` = Ahad, 20 Desember 2026 · 23.59 WIB. Batas orang per tamu sesuai.
- [ ] **Uji RSVP dari ponsel:** kirim satu RSVP lewat tautan WhatsApp sungguhan (Android dan iPhone), cek muncul di admin, ubah jawaban, lalu hapus/sembunyikan data uji.
- [ ] **Pratinjau WhatsApp:** kirim tautan ke diri sendiri. Judul, deskripsi, dan gambar harus muncul. Bila gambar tidak tampil, cek `https://domain/og-image.jpg` bisa dibuka dan `PUBLIC_BASE_URL` benar saat `npm run build`.
- [ ] **Panel admin:** bisa login di `/admin`, rekap benar, CSV terbuka rapi di Excel. Kata sandi kuat dan hanya diketahui penyelenggara.
- [ ] **HTTPS aktif** (gembok di browser) dan `NODE_ENV=production` di `.env`.
- [ ] **Cadangan data:** cron backup berjalan (cek isi `data/backups/` keesokan harinya).
- [ ] **Data uji dibersihkan:** hapus RSVP uji sebelum disebar. Cara paling sederhana sebelum tamu mulai mengisi:
  ```bash
  sudo systemctl stop undangan && rm data/wedding.db* && sudo systemctl start undangan
  ```
  Lalu jalankan `npm run guests:import` lagi.

---

## 7. Jika ada masalah

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| RSVP gagal / "Server sedang bermasalah", ucapan tidak muncul, admin tidak bisa login (mode dev) | Server API belum jalan, atau `PORT` di `.env` diubah saat `npm run dev` masih berjalan | Hentikan lalu jalankan ulang `npm run dev`. Pastikan terminal menampilkan `[server] berjalan di ...` |
| "Mohon tunggu beberapa detik" saat kirim RSVP | Form dikirim < 3 detik setelah tampil (aturan anti-bot) | Tunggu sebentar lalu tekan Kirim lagi |
| Pratinjau WhatsApp tanpa gambar | `PUBLIC_BASE_URL` kosong/salah saat `npm run build`, atau masih `http://` | Isi dengan `https://domain-anda`, build ulang, restart |
| Cookie admin tidak tersimpan di VPS | `NODE_ENV=production` tetapi situs belum HTTPS | Aktifkan HTTPS (certbot) terlebih dahulu |

Cek isi database dengan cepat (PowerShell, di folder proyek):
```powershell
node -e "const D=require('better-sqlite3');const d=new D('data/wedding.db',{readonly:true});console.log(d.prepare('select name,attendance,pax from rsvps').all())"
```

---

## 8. Struktur folder

```
config/event.ts        satu-satunya sumber data acara
shared/                fungsi dipakai server & browser (pembersih nama, format tanggal WIB)
server/                Express: app.ts, routes/ (public, admin), lib/ (validasi, auth, csv, rate limit), migrations/
web/                   Vue: index.html (undangan), admin.html (panel), src/sections/, src/components/, src/admin/
scripts/               admin-password, guests-import, guest-links, db-backup, generate-ornaments, generate-scenes, process-assets, og-image
tests/                 node:test + supertest
deploy/                contoh systemd & Nginx
data/                  (tidak di git) wedding.db, guests.csv, guest-links.csv, backups/
```
